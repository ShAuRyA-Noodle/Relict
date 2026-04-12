"""Unit tests for app.core.config.Settings."""
from __future__ import annotations

import os

import pytest
from app.core.config import Settings, get_settings
from pydantic import ValidationError


def test_settings_loads_from_environment() -> None:
    settings = get_settings()
    assert settings.PROJECT_NAME == "Relict"
    assert settings.ENVIRONMENT == "test"


def test_database_url_async_uses_asyncpg() -> None:
    url = get_settings().database_url_async
    assert url.startswith("postgresql+asyncpg://")


def test_database_url_sync_uses_psycopg() -> None:
    url = get_settings().database_url_sync
    assert url.startswith("postgresql+psycopg://")


def test_redis_url_shape() -> None:
    url = get_settings().redis_url
    assert url.startswith("redis://")
    assert url.endswith("/0")


def test_jwt_secret_too_short_rejected(monkeypatch: pytest.MonkeyPatch) -> None:
    get_settings.cache_clear()
    monkeypatch.setenv("JWT_SECRET", "short")
    with pytest.raises(ValidationError):
        Settings()  # type: ignore[call-arg]


def test_cors_origins_parses_comma_separated(monkeypatch: pytest.MonkeyPatch) -> None:
    get_settings.cache_clear()
    monkeypatch.setenv("CORS_ORIGINS", "http://a.local, http://b.local ,")
    settings = Settings()  # type: ignore[call-arg]
    assert settings.CORS_ORIGINS == ["http://a.local", "http://b.local"]
    # Reset for other tests.
    os.environ.pop("CORS_ORIGINS", None)
