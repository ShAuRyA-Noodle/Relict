"""Phase 1 no-op pipeline.

This module is the RQ target (``worker.pipeline.run_job``). It exists
so the full request lifecycle — upload → enqueue → worker execution →
DB update → WebSocket event → client-visible terminal state — can be
exercised end-to-end *before* any real bioinformatics lands.

**Rules for this file** (binding on Phase 2+ successors):
    * Never fabricate biological results.
    * Never catch exceptions silently.
    * Every status transition is persisted and emitted to pub/sub.
    * Idempotent: re-running the same job must be safe.
"""
from __future__ import annotations

import time
import uuid
from datetime import UTC, datetime

from app.core.config import get_settings
from app.core.logging import configure_logging, get_logger
from app.db.models import Job, JobStatus
from app.services.queue import publish_job_event_sync
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

log = get_logger("worker.pipeline")


def _sync_engine():
    """RQ workers are synchronous — use a plain sync engine."""
    settings = get_settings()
    return create_engine(
        settings.database_url_sync,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
        future=True,
    )


def run_job(job_id: str) -> dict[str, str]:
    """RQ entrypoint. ``job_id`` is a string because RQ serializes kwargs.

    Returns a small dict so RQ's result_ttl captures something useful.
    """
    configure_logging(get_settings().LOG_LEVEL)
    log.info("pipeline.run_job.started", job_id=job_id)

    uid = uuid.UUID(job_id)
    engine = _sync_engine()

    with Session(engine, expire_on_commit=False) as session:
        job = session.get(Job, uid)
        if job is None:
            log.error("pipeline.run_job.missing_job", job_id=job_id)
            return {"status": "missing", "job_id": job_id}

        # ─── Transition to running ─────────────────────────────────────
        job.status = JobStatus.RUNNING
        job.started_at = datetime.now(tz=UTC)
        job.pipeline_version = "phase1-stub-0.1.0"
        session.commit()

        publish_job_event_sync(
            uid,
            {
                "kind": "job.started",
                "stage": "bootstrap",
                "message": "Phase 1 no-op pipeline started",
                "progress": 0.0,
            },
        )

        # ─── Simulated stages (just to exercise events + timing) ──────
        # Each "stage" is a named no-op. In Phase 2 these become real
        # function calls into qc.py, dereplicate.py, taxonomy.py, etc.
        stages = [
            ("ingest", "Sample located"),
            ("hash-verify", "SHA256 already computed at upload"),
            ("stub", "Phase 1 stub — real pipeline lands in Phase 2"),
        ]
        for index, (stage, message) in enumerate(stages, start=1):
            publish_job_event_sync(
                uid,
                {
                    "kind": "stage.started",
                    "stage": stage,
                    "message": message,
                    "progress": round(index / (len(stages) + 1), 2),
                },
            )
            time.sleep(0.25)
            publish_job_event_sync(
                uid,
                {
                    "kind": "stage.completed",
                    "stage": stage,
                    "message": f"{stage} done",
                    "progress": round((index + 0.5) / (len(stages) + 1), 2),
                },
            )

        # ─── Transition to succeeded ───────────────────────────────────
        job.status = JobStatus.SUCCEEDED
        job.finished_at = datetime.now(tz=UTC)
        session.commit()

        publish_job_event_sync(
            uid,
            {
                "kind": "job.succeeded",
                "message": "Phase 1 stub pipeline complete",
                "progress": 1.0,
            },
        )

    log.info("pipeline.run_job.finished", job_id=job_id, status="succeeded")
    return {"status": "succeeded", "job_id": job_id}
