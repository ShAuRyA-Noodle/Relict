"""Unit test for the S3 filename sanitiser — runs without a real MinIO."""
from __future__ import annotations

import pytest

from app.services.samples import UnsafeSampleFilename, _check_filename
from app.services.storage import _sanitize_filename


def test_simple_name_passes_through() -> None:
    assert _sanitize_filename("sample_R1.fastq.gz") == "sample_R1.fastq.gz"


def test_strips_dangerous_characters() -> None:
    # "../etc/passwd" -> ".._etc_passwd" after char replacement ->
    # "_etc_passwd" after the leading-dot strip.
    assert _sanitize_filename("../etc/passwd") == "_etc_passwd"
    # Path traversal via backslashes is also neutralised.
    assert _sanitize_filename("..\\windows\\system32") == "_windows_system32"


def test_replaces_spaces_and_unicode() -> None:
    assert _sanitize_filename("my file (1).fq") == "my_file__1_.fq"
    assert _sanitize_filename("río.fastq") == "r_o.fastq"


def test_strips_leading_dots() -> None:
    assert _sanitize_filename("...hidden.fastq") == "hidden.fastq"


def test_empty_input_returns_unnamed() -> None:
    assert _sanitize_filename("") == "unnamed"
    assert _sanitize_filename("...") == "unnamed"


@pytest.mark.parametrize(
    "filename",
    [
        "../../etc/passwd.fastq",
        "/abs/path.fastq",
        "..\\windows\\x.fastq",
        "sub/dir.fq",
        "evil..fastq",
        ".hidden.fastq",
        "null\x00.fastq",
    ],
)
def test_check_filename_rejects_path_traversal(filename: str) -> None:
    # The traversal guard runs before any settings lookup, so it raises
    # without a configured environment.
    with pytest.raises(UnsafeSampleFilename):
        _check_filename(filename)
