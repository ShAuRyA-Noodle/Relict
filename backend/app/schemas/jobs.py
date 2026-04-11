"""Pydantic models for /jobs endpoints."""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class JobPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    status: str
    amplicon: str
    parameter_hash: str | None
    pipeline_version: str | None
    queued_at: datetime | None
    started_at: datetime | None
    finished_at: datetime | None
    error_message: str | None
    created_at: datetime
    updated_at: datetime


class JobListResponse(BaseModel):
    items: list[JobPublic]
    total: int
    limit: int
    offset: int


class JobEnqueueResponse(BaseModel):
    job: JobPublic
    rq_job_id: str


class JobEvent(BaseModel):
    """A single event streamed over the WebSocket progress channel."""

    event_id: str
    ts: datetime
    job_id: uuid.UUID
    kind: str          # e.g. "stage.started", "stage.completed", "job.succeeded"
    stage: str | None = None
    message: str | None = None
    progress: float | None = None
