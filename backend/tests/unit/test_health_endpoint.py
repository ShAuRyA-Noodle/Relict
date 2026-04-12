"""Smoke test for the /health liveness endpoint.

The /ready readiness endpoint touches Postgres, Redis, and MinIO, so
it's covered by integration tests that spin up real containers.
/health has no dependencies and is safe to hit against a plain app.
"""
from __future__ import annotations

from app.main import create_app
from fastapi.testclient import TestClient


def test_health_returns_ok() -> None:
    app = create_app()
    with TestClient(app) as client:
        response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["version"]
    assert body["environment"] == "test"


def test_health_request_id_header() -> None:
    app = create_app()
    with TestClient(app) as client:
        response = client.get("/health", headers={"X-Request-ID": "test-abc"})
    assert response.headers.get("X-Request-ID") == "test-abc"


def test_openapi_lists_auth_samples_jobs() -> None:
    app = create_app()
    with TestClient(app) as client:
        response = client.get("/api/v1/openapi.json")
    assert response.status_code == 200
    spec = response.json()
    paths = set(spec["paths"].keys())
    assert "/api/v1/auth/signup" in paths
    assert "/api/v1/auth/login" in paths
    assert "/api/v1/samples/upload" in paths
    assert "/api/v1/jobs" in paths
