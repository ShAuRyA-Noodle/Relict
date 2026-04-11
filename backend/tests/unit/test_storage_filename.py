"""Unit test for the S3 filename sanitiser — runs without a real MinIO."""
from __future__ import annotations

from app.services.storage import _sanitize_filename


def test_simple_name_passes_through() -> None:
    assert _sanitize_filename("sample_R1.fastq.gz") == "sample_R1.fastq.gz"


def test_strips_dangerous_characters() -> None:
    assert _sanitize_filename("../etc/passwd") == "___etc_passwd"


def test_replaces_spaces_and_unicode() -> None:
    assert _sanitize_filename("my file (1).fq") == "my_file__1_.fq"
    assert _sanitize_filename("río.fastq") == "r_o.fastq"


def test_strips_leading_dots() -> None:
    assert _sanitize_filename("...hidden.fastq") == "hidden.fastq"


def test_empty_input_returns_unnamed() -> None:
    assert _sanitize_filename("") == "unnamed"
    assert _sanitize_filename("...") == "unnamed"
