"""Job routes — list, fetch, cancel. Enqueueing happens via /samples/upload."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select

from app.api.deps import CurrentUser, SessionDep
from app.db.models import Job
from app.schemas.jobs import JobListResponse, JobPublic
from app.services import jobs as jobs_service

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get(
    "",
    response_model=JobListResponse,
    summary="List the caller's jobs",
)
async def list_jobs(
    user: CurrentUser,
    session: SessionDep,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> JobListResponse:
    items = await jobs_service.list_jobs_for_user(
        session, user=user, limit=limit, offset=offset
    )
    total = await session.scalar(
        select(func.count()).select_from(Job).where(Job.user_id == user.id)
    )
    return JobListResponse(
        items=[JobPublic.model_validate(j) for j in items],
        total=int(total or 0),
        limit=limit,
        offset=offset,
    )


@router.get(
    "/{job_id}",
    response_model=JobPublic,
    summary="Fetch a single job (must belong to caller)",
)
async def get_job(
    job_id: uuid.UUID,
    user: CurrentUser,
    session: SessionDep,
) -> JobPublic:
    job = await jobs_service.get_job_for_user(session, job_id=job_id, user=user)
    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )
    return JobPublic.model_validate(job)


@router.post(
    "/{job_id}/cancel",
    response_model=JobPublic,
    summary="Cancel a queued job",
)
async def cancel_job(
    job_id: uuid.UUID,
    user: CurrentUser,
    session: SessionDep,
) -> JobPublic:
    job = await jobs_service.get_job_for_user(session, job_id=job_id, user=user)
    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )
    await jobs_service.cancel_job(session, job=job)
    return JobPublic.model_validate(job)
