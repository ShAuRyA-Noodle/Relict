"""Integration fixtures — real Postgres + Redis + MinIO via testcontainers.

These fixtures are expensive; only tests marked ``integration`` use
them. Run with::

    make test-integration

The containers are started once per test module (``scope="module"``)
so a full test module shares the same DB, which is wiped between
tests with a TRUNCATE … CASCADE.
"""
from __future__ import annotations

import os
from typing import TYPE_CHECKING

import pytest
import pytest_asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from testcontainers.minio import MinioContainer
from testcontainers.postgres import PostgresContainer
from testcontainers.redis import RedisContainer

if TYPE_CHECKING:
    from collections.abc import AsyncIterator, Iterator


@pytest.fixture(scope="module")
def postgres_container() -> Iterator[PostgresContainer]:
    with PostgresContainer("postgres:16.6-bookworm", username="relict", password="relict", dbname="relict_test") as pg:
        os.environ["POSTGRES_HOST"] = pg.get_container_host_ip()
        os.environ["POSTGRES_PORT"] = str(pg.get_exposed_port(5432))
        os.environ["POSTGRES_USER"] = "relict"
        os.environ["POSTGRES_PASSWORD"] = "relict"
        os.environ["POSTGRES_DB"] = "relict_test"
        yield pg


@pytest.fixture(scope="module")
def redis_container() -> Iterator[RedisContainer]:
    with RedisContainer("redis:7.4.1-bookworm") as redis_c:
        os.environ["REDIS_HOST"] = redis_c.get_container_host_ip()
        os.environ["REDIS_PORT"] = str(redis_c.get_exposed_port(6379))
        yield redis_c


@pytest.fixture(scope="module")
def minio_container() -> Iterator[MinioContainer]:
    with MinioContainer() as minio_c:
        host = minio_c.get_container_host_ip()
        port = minio_c.get_exposed_port(9000)
        os.environ["MINIO_ENDPOINT"] = f"{host}:{port}"
        os.environ["MINIO_ACCESS_KEY"] = minio_c.access_key
        os.environ["MINIO_SECRET_KEY"] = minio_c.secret_key
        os.environ["MINIO_SECURE"] = "false"
        os.environ["MINIO_BUCKET"] = "relict-test"
        yield minio_c


@pytest_asyncio.fixture(scope="module")
async def _engine(postgres_container, redis_container, minio_container):  # type: ignore[no-untyped-def]
    """Run the Alembic migration against the test Postgres and yield an engine."""
    from app.core.config import get_settings
    from app.db import models  # noqa: F401 — register tables
    from app.db.base import Base

    get_settings.cache_clear()
    settings = get_settings()

    engine = create_async_engine(settings.database_url_async, future=True)

    # Create the schema directly from metadata (skips Alembic in tests
    # so we don't depend on Alembic CLI being present). The real
    # production path is `alembic upgrade head`.
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(_engine) -> AsyncIterator[AsyncSession]:  # type: ignore[no-untyped-def]
    """Per-test transactional session. Rolls back at the end."""
    factory = async_sessionmaker(bind=_engine, expire_on_commit=False)
    async with factory() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def truncate_all(_engine) -> AsyncIterator[None]:  # type: ignore[no-untyped-def]
    """Wipe every table between tests in a module."""
    yield
    async with _engine.begin() as conn:
        await conn.execute(
            text(
                "TRUNCATE users, refresh_sessions, jobs, samples, asvs, taxa, "
                "diversity_metrics, conservation_cache, provenance "
                "RESTART IDENTITY CASCADE"
            )
        )
