"""Liveness and readiness status without external containers."""
from __future__ import annotations

from types import SimpleNamespace

import pytest
from app.api.v1 import health as health_module
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


def test_ready_returns_503_when_dependencies_are_unavailable(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def unavailable() -> None:
        raise OSError("service unavailable")

    monkeypatch.setattr(health_module, "engine", SimpleNamespace(connect=unavailable))
    monkeypatch.setattr(health_module, "get_redis", unavailable)
    monkeypatch.setattr(health_module, "get_storage", unavailable)

    app = create_app()
    with TestClient(app) as client:
        response = client.get("/ready")

    assert response.status_code == 503
    body = response.json()
    assert body["status"] == "degraded"
    assert set(body["checks"]) == {"postgres", "redis", "minio"}
    assert all(check["status"] == "fail" for check in body["checks"].values())


def test_ready_returns_200_when_dependencies_are_available(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    class Connection:
        async def execute(self, _query: object) -> None:
            pass

    class Connect:
        async def __aenter__(self) -> Connection:
            return Connection()

        async def __aexit__(self, _exc_type: object, _exc: object, _tb: object) -> None:
            pass

    class Redis:
        async def ping(self) -> bool:
            return True

    class Storage:
        bucket = "relict"

        def ensure_bucket(self) -> None:
            pass

    monkeypatch.setattr(health_module, "engine", SimpleNamespace(connect=Connect))
    monkeypatch.setattr(health_module, "get_redis", Redis)
    monkeypatch.setattr(health_module, "get_storage", Storage)

    app = create_app()
    with TestClient(app) as client:
        response = client.get("/ready")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert all(check["status"] == "ok" for check in body["checks"].values())
