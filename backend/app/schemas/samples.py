"""Pydantic models for /samples endpoints."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class SamplePublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    job_id: uuid.UUID
    filename: str
    sha256: str
    size_bytes: int
    content_type: str
    num_reads: int | None
    read_length_mean: float | None
    primer_set: str | None
    dwc_metadata: dict[str, Any] | None
    created_at: datetime


class SampleUploadResponse(BaseModel):
    """Returned by POST /samples/upload."""

    sample: SamplePublic
    download_url: str = Field(
        ...,
        description="Pre-signed URL valid for 15 minutes for the authenticated user to verify their upload.",
    )
