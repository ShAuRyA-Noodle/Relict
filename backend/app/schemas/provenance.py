"""Pydantic models for /jobs/{id}/provenance endpoint."""
from __future__ import annotations

import uuid  # noqa: TC003
from datetime import datetime  # noqa: TC003
from typing import Any

from pydantic import BaseModel, ConfigDict


class ProvenancePublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    job_id: uuid.UUID
    schema_version: str
    manifest: dict[str, Any]
    manifest_sha256: str
    signature: str
    signed_at: datetime
    created_at: datetime
