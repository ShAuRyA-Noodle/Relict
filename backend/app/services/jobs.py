"""Job service — enqueue, fetch, cancel."""
from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import select

from app.core.logging import get_logger
from app.db.models import Job, JobStatus, User
from app.services.queue import get_rq_queue

if TYPE_CHECKING:
    import uuid

    from sqlalchemy.ext.asyncio import AsyncSession

log = get_logger(__name__)

# RQ imports the function by full dotted path from the worker image.
# Keep this string stable — changing it requires a coordinated deploy.
WORKER_ENTRYPOINT = "worker.pipeline.run_job.run_job"


class JobError(Exception):
    pass


class JobNotFound(JobError):
    pass


async def enqueue_job(session: AsyncSession, *, job: Job) -> str:
    """Push ``job`` onto the RQ queue and remember the RQ job id."""
    queue = get_rq_queue()
    rq_job = queue.enqueue(
        WORKER_ENTRYPOINT,
        kwargs={"job_id": str(job.id)},
        job_timeout="2h",        # upper bound for full QC -> taxonomy -> diversity run
        result_ttl=86_400,       # keep results for 1 day
        failure_ttl=604_800,     # keep failures for 7 days
        retry=None,
    )
    job.rq_job_id = rq_job.id
    await session.flush()
    log.info("job.enqueued", job_id=str(job.id), rq_job_id=rq_job.id)
    return str(rq_job.id)


async def get_job_for_user(
    session: AsyncSession, *, job_id: uuid.UUID, user: User
) -> Job | None:
    job = await session.get(Job, job_id)
    if job is None or job.user_id != user.id:
        return None
    return job


async def list_jobs_for_user(
    session: AsyncSession,
    *,
    user: User,
    limit: int = 50,
    offset: int = 0,
) -> list[Job]:
    stmt = (
        select(Job)
        .where(Job.user_id == user.id)
        .order_by(Job.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    result = await session.scalars(stmt)
    return list(result)


async def cancel_job(session: AsyncSession, *, job: Job) -> None:
    """Cancel a queued job. Running jobs currently complete — preemption
    lands in Phase 2 when pipeline stages are real and interruptible.
    """
    if job.status not in (JobStatus.QUEUED, JobStatus.RUNNING):
        return
    job.status = JobStatus.CANCELLED
    if job.rq_job_id:
        try:
            from rq.job import Job as RQJob

            from app.services.queue import get_sync_redis

            rq_job = RQJob.fetch(job.rq_job_id, connection=get_sync_redis())
            rq_job.cancel()
        except Exception as exc:  # noqa: BLE001 — best-effort cancellation
            log.warning(
                "job.rq_cancel_failed",
                job_id=str(job.id),
                rq_job_id=job.rq_job_id,
                error=str(exc),
            )
    await session.flush()
