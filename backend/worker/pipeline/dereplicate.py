"""Stage 2: Full-length dereplication via vsearch.

Takes the QC-passed FASTQ and collapses identical sequences, recording
the abundance of each unique sequence in the FASTA header. This is
the standard pre-step before ASV inference.

Outputs:
  workspace/derep/unique.fasta  — unique sequences, headers contain ;size=N
"""
from __future__ import annotations

import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from worker import TOOL_VERSIONS
from worker.pipeline import StageError, StageResult, StageTimer, ensure_stage_dir


@dataclass
class DerepParams:
    """Parameters for the dereplication stage."""

    min_unique_size: int = 2       # discard singletons (size < 2)
    threads: int = 2


def run(
    workspace: Path,
    input_fastq: Path,
    params: DerepParams | None = None,
    logger: Any = None,
) -> StageResult:
    """Dereplicate ``input_fastq`` using vsearch --fastx_uniques."""
    if params is None:
        params = DerepParams()

    stage_dir = ensure_stage_dir(workspace, "derep")
    unique_fasta = stage_dir / "unique.fasta"

    cmd = [
        "vsearch",
        "--fastx_uniques", str(input_fastq),
        "--fastaout", str(unique_fasta),   # --fastx_uniques uses --fastaout, not --output
        "--sizeout",                       # append ;size=N to headers
        "--minuniquesize", str(params.min_unique_size),
        "--threads", str(params.threads),
        "--fasta_width", "0",              # no line wrapping in output FASTA
    ]

    if logger:
        logger.info("derep.started", cmd=" ".join(cmd))

    with StageTimer() as timer:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=False,
        )

    if result.returncode != 0:
        raise StageError(
            "derep",
            f"vsearch --fastx_uniques exited with code {result.returncode}",
            stderr=result.stderr[-2000:],
        )

    if not unique_fasta.exists() or unique_fasta.stat().st_size == 0:
        raise StageError(
            "derep",
            "Dereplication produced no output — all sequences may have been singletons",
            stderr=result.stderr[-2000:],
        )

    n_unique = _count_fasta_seqs(unique_fasta)
    if logger:
        logger.info("derep.completed", unique_sequences=n_unique, runtime=round(timer.elapsed, 2))

    return StageResult(
        stage_name="derep",
        tool="vsearch",
        tool_version=TOOL_VERSIONS["vsearch"],
        runtime_seconds=timer.elapsed,
        input_files=[str(input_fastq)],
        output_files=[str(unique_fasta)],
        metrics={"unique_sequences": n_unique},
    )


def _count_fasta_seqs(path: Path) -> int:
    """Count the number of sequences in a FASTA file."""
    count = 0
    with open(path) as f:
        for line in f:
            if line.startswith(">"):
                count += 1
    return count
