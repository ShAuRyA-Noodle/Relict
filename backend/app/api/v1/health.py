"""Health and readiness probes.

``/health``
    Liveness — returns 200 as long as the Python process is alive.
    Cheap, no external dependencies. Kubernetes / Docker Compose use
    this to decide whether to kill and restart the container.

``/ready``
    Readiness — verifies Postgres, Redis, and MinIO are reachable.
    Returns 200 only when all components are available; otherwise 503.
"""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Response, status
from pydantic import BaseModel
from sqlalchemy import text

from app.core.config import get_settings
from app.db.session import engine
from app.services.queue import get_redis
from app.services.storage import get_storage

router = APIRouter(tags=["health"])


class HealthResponse(BaseModel):
    status: str
    version: str
    environment: str


class ReadinessResponse(BaseModel):
    status: str
    checks: dict[str, dict[str, Any]]


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Liveness probe",
)
async def health() -> HealthResponse:
    """Liveness probe — 200 iff the process is alive."""
    from app import __version__

    settings = get_settings()
    return HealthResponse(
        status="ok",
        version=__version__,
        environment=settings.ENVIRONMENT,
    )


@router.get(
    "/ready",
    response_model=ReadinessResponse,
    status_code=status.HTTP_200_OK,
    summary="Readiness probe",
)
async def ready(response: Response) -> ReadinessResponse:
    """Readiness probe — verifies Postgres, Redis, and MinIO.

    Returns HTTP 503 when any required service is unavailable, so a load
    balancer cannot mark an incomplete deployment ready for traffic.
    """
    checks: dict[str, dict[str, Any]] = {}

    # Postgres
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        checks["postgres"] = {"status": "ok"}
    except Exception as exc:  # noqa: BLE001 — all errors map to a degraded check
        checks["postgres"] = {"status": "fail", "error": str(exc)}

    # Redis
    try:
        redis_client = get_redis()
        pong = await redis_client.ping()
        checks["redis"] = {"status": "ok" if pong else "fail"}
    except Exception as exc:  # noqa: BLE001
        checks["redis"] = {"status": "fail", "error": str(exc)}

    # MinIO
    try:
        storage = get_storage()
        storage.ensure_bucket()
        checks["minio"] = {"status": "ok", "bucket": storage.bucket}
    except Exception as exc:  # noqa: BLE001
        checks["minio"] = {"status": "fail", "error": str(exc)}

    overall = "ok" if all(c["status"] == "ok" for c in checks.values()) else "degraded"
    if overall != "ok":
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return ReadinessResponse(status=overall, checks=checks)
