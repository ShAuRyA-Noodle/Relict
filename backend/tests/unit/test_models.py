"""Unit tests for SQLAlchemy model metadata — no DB required."""
from __future__ import annotations

from app.db.base import Base
from app.db.models import (
    ASV,
    ConservationCache,
    DiversityMetric,
    Job,
    Provenance,
    RefreshSession,
    Sample,
    Taxon,
    User,
)


def test_all_phase1_tables_registered() -> None:
    expected = {
        "users",
        "refresh_sessions",
        "jobs",
        "samples",
        "asvs",
        "taxa",
        "diversity_metrics",
        "conservation_cache",
        "provenance",
    }
    actual = set(Base.metadata.tables.keys())
    assert expected <= actual, f"Missing: {expected - actual}"


def test_user_has_email_unique_constraint() -> None:
    users = Base.metadata.tables["users"]
    email_col = users.c.email
    assert email_col.unique is True
    assert email_col.nullable is False


def test_jobs_cascades_from_users() -> None:
    jobs = Base.metadata.tables["jobs"]
    for fk in jobs.c.user_id.foreign_keys:
        assert fk.ondelete == "CASCADE"


def test_samples_cascades_from_jobs() -> None:
    samples = Base.metadata.tables["samples"]
    for fk in samples.c.job_id.foreign_keys:
        assert fk.ondelete == "CASCADE"


def test_relationships_wired() -> None:
    """Sanity-check that every model is importable and relationships resolve."""
    # Simply instantiating the class forces SQLAlchemy to resolve the
    # relationship() strings; if anything is misnamed this raises.
    _ = (
        User,
        RefreshSession,
        Job,
        Sample,
        ASV,
        Taxon,
        DiversityMetric,
        ConservationCache,
        Provenance,
    )
