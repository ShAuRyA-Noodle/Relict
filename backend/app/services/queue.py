"""Redis connection + RQ queue + per-job pub/sub channel.

Two Redis clients are exposed:

* :func:`get_redis` — async ``redis.asyncio.Redis`` for FastAPI route
  handlers to publish events to the per-job channel and for /ready to
  ping Redis.

* :func:`get_sync_redis` — sync ``redis.Redis`` for RQ, which is still
  a synchronous library. The worker process runs its own loop; we
  never call this from inside a FastAPI request.
"""
from __future__ import annotations

import json
import uuid
from datetime import UTC, datetime
from typing import Any

import redis
import redis.asyncio as aioredis
from rq import Queue

from app.core.config import get_settings
from app.core.logging import get_logger

log = get_logger(__name__)

JOB_QUEUE_NAME = "relict_jobs"


# ─── Module-level singletons ───────────────────────────────────────────

_async_client: aioredis.Redis[bytes] | None = None
_sync_client: redis.Redis[bytes] | None = None
_rq_queue: Queue | None = None


def get_redis() -> aioredis.Redis[bytes]:
    """Async Redis client for API request handlers."""
    global _async_client
    if _async_client is None:
        settings = get_settings()
        _async_client = aioredis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            decode_responses=False,
            socket_connect_timeout=5,
            health_check_interval=30,
        )
    return _async_client


def get_sync_redis() -> redis.Redis[bytes]:
    """Sync Redis client for RQ. Not for use inside request handlers."""
    global _sync_client
    if _sync_client is None:
        settings = get_settings()
        _sync_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            decode_responses=False,
            socket_connect_timeout=5,
        )
    return _sync_client


def get_rq_queue() -> Queue:
    """Return a process-wide RQ ``Queue`` bound to ``relict_jobs``."""
    global _rq_queue
    if _rq_queue is None:
        _rq_queue = Queue(JOB_QUEUE_NAME, connection=get_sync_redis())
    return _rq_queue


async def close_redis() -> None:
    """Called from the FastAPI lifespan on shutdown."""
    global _async_client
    if _async_client is not None:
        await _async_client.close()
        _async_client = None


# ─── Per-job pub/sub ────────────────────────────────────────────────────


def channel_for_job(job_id: uuid.UUID) -> str:
    """Return the Redis pub/sub channel name for a job."""
    return f"job.{job_id}.events"


async def publish_job_event(job_id: uuid.UUID, event: dict[str, Any]) -> None:
    """Publish a progress event to a job's pub/sub channel.

    Adds ``event_id`` and ``ts`` fields automatically if missing.
    """
    enriched = {
        "event_id": uuid.uuid4().hex,
        "ts": datetime.now(tz=UTC).isoformat(),
        "job_id": str(job_id),
        **event,
    }
    payload = json.dumps(enriched, separators=(",", ":"))
    await get_redis().publish(channel_for_job(job_id), payload)


def publish_job_event_sync(job_id: uuid.UUID, event: dict[str, Any]) -> None:
    """Synchronous version called from the worker (no asyncio available)."""
    enriched = {
        "event_id": uuid.uuid4().hex,
        "ts": datetime.now(tz=UTC).isoformat(),
        "job_id": str(job_id),
        **event,
    }
    payload = json.dumps(enriched, separators=(",", ":"))
    get_sync_redis().publish(channel_for_job(job_id), payload)
