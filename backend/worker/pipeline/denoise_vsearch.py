"""Stage 3: ASV inference via vsearch --cluster_unoise (UNOISE3 algorithm).

Takes dereplicated sequences (with ;size=N abundance in headers) and
infers Amplicon Sequence Variants — biologically real sequences cleaned
of PCR and sequencing errors.

UNOISE3 (Edgar 2016) is the standard denoising algorithm used by
vsearch. It requires sequences sorted by decreasing abundance and
size-annotated headers, which the dereplication stage provides.

Outputs:
  workspace/denoise/asvs.fasta   — denoised ASV centroids
  workspace/denoise/asv_table.tsv — tab-separated ASV abundance table
"""
from __future__ import annotations

import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from worker import TOOL_VERSIONS
from worker.pipeline import StageError, StageResult, StageTimer, ensure_stage_dir


@dataclass
class DenoiseParams:
    """Parameters for the UNOISE3 denoising stage."""

    min_size: int = 2              # minimum abundance to keep
    unoise_alpha: float = 2.0      # UNOISE3 alpha parameter
    threads: int = 2


def run(
    workspace: Path,
    input_fasta: Path,
    params: DenoiseParams | None = None,
    logger: Any = None,
) -> StageResult:
    """Run vsearch --cluster_unoise on the dereplicated FASTA."""
    if params is None:
        params = DenoiseParams()

    stage_dir = ensure_stage_dir(workspace, "denoise")
    asvs_fasta = stage_dir / "asvs.fasta"

    # Step 1: sort by size (vsearch requires this for UNOISE3)
    sorted_fasta = stage_dir / "sorted.fasta"
    sort_cmd = [
        "vsearch",
        "--sortbysize", str(input_fasta),
        "--output", str(sorted_fasta),
        "--minsize", str(params.min_size),
        "--fasta_width", "0",
    ]

    if logger:
        logger.info("denoise.sorting", cmd=" ".join(sort_cmd))

    sort_result = subprocess.run(sort_cmd, capture_output=True, text=True, check=False)
    if sort_result.returncode != 0:
        raise StageError(
            "denoise",
            f"vsearch --sortbysize failed (code {sort_result.returncode})",
            stderr=sort_result.stderr[-2000:],
        )

    # Step 2: UNOISE3 denoising
    denoise_cmd = [
        "vsearch",
        "--cluster_unoise", str(sorted_fasta),
        "--centroids", str(asvs_fasta),
        "--sizein",
        "--sizeout",
        "--unoise_alpha", str(params.unoise_alpha),
        "--threads", str(params.threads),
        "--fasta_width", "0",
    ]

    if logger:
        logger.info("denoise.started", cmd=" ".join(denoise_cmd))

    with StageTimer() as timer:
        result = subprocess.run(denoise_cmd, capture_output=True, text=True, check=False)

    if result.returncode != 0:
        raise StageError(
            "denoise",
            f"vsearch --cluster_unoise failed (code {result.returncode})",
            stderr=result.stderr[-2000:],
        )

    if not asvs_fasta.exists() or asvs_fasta.stat().st_size == 0:
        raise StageError(
            "denoise",
            "UNOISE3 produced no ASVs — input may have been too noisy or too small",
        )

    n_asvs = _count_fasta_seqs(asvs_fasta)
    abundances = _extract_abundances(asvs_fasta)
    total_reads_assigned = sum(abundances.values())

    if logger:
        logger.info(
            "denoise.completed",
            n_asvs=n_asvs,
            total_reads_assigned=total_reads_assigned,
            runtime=round(timer.elapsed, 2),
        )

    return StageResult(
        stage_name="denoise",
        tool="vsearch",
        tool_version=TOOL_VERSIONS["vsearch"],
        runtime_seconds=timer.elapsed,
        input_files=[str(input_fasta)],
        output_files=[str(asvs_fasta)],
        metrics={
            "n_asvs": n_asvs,
            "total_reads_assigned": total_reads_assigned,
        },
    )


def _count_fasta_seqs(path: Path) -> int:
    count = 0
    with open(path) as f:
        for line in f:
            if line.startswith(">"):
                count += 1
    return count


def _extract_abundances(fasta: Path) -> dict[str, int]:
    """Parse ;size=N from FASTA headers. Returns {seq_id: abundance}."""
    abundances: dict[str, int] = {}
    with open(fasta) as f:
        for line in f:
            if line.startswith(">"):
                header = line[1:].strip()
                seq_id = header.split(";")[0]
                size = 1
                for part in header.split(";"):
                    if part.startswith("size="):
                        size = int(part.split("=")[1])
                abundances[seq_id] = size
    return abundances
