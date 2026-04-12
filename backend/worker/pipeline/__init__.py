"""Relict bioinformatics pipeline stages.

Every stage function has the signature:

    def run(workspace: Path, params: StageParams, logger: Logger) -> StageResult

- ``workspace`` is a per-job scratch directory under ``/workspaces/{job_id}/``.
  Each stage writes its outputs into ``workspace/<stage_name>/``.
- ``params`` holds tool-specific configuration (e.g., min_length for QC,
  identity threshold for taxonomy).
- ``logger`` is a structlog-bound logger with ``job_id`` already attached.
- ``StageResult`` captures the tool version, runtime, input/output paths,
  and any metrics the stage wants to surface.

Stage error handling:
    If a subprocess returns non-zero, the stage MUST raise ``StageError``
    with the stderr captured. The orchestrator marks the job ``failed``
    and surfaces the real error to the user. Stages NEVER swallow errors
    or return placeholder data.
"""
from __future__ import annotations

import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


@dataclass
class StageResult:
    """What every stage returns on success."""

    stage_name: str
    tool: str
    tool_version: str
    runtime_seconds: float
    input_files: list[str] = field(default_factory=list)
    output_files: list[str] = field(default_factory=list)
    metrics: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {
            "stage": self.stage_name,
            "tool": self.tool,
            "tool_version": self.tool_version,
            "runtime_seconds": round(self.runtime_seconds, 3),
            "input_files": self.input_files,
            "output_files": self.output_files,
            "metrics": self.metrics,
        }


class StageError(Exception):
    """Raised when a pipeline stage fails. Contains the real error."""

    def __init__(self, stage_name: str, message: str, stderr: str = "") -> None:
        self.stage_name = stage_name
        self.stderr = stderr
        full = f"[{stage_name}] {message}"
        if stderr:
            full += f"\nstderr: {stderr[-500:]}"
        super().__init__(full)


class StageTimer:
    """Context manager that measures wall-clock time for a stage."""

    def __init__(self) -> None:
        self.start: float = 0.0
        self.elapsed: float = 0.0

    def __enter__(self) -> StageTimer:
        self.start = time.perf_counter()
        return self

    def __exit__(self, *_: object) -> None:
        self.elapsed = time.perf_counter() - self.start


def ensure_stage_dir(workspace: Path, stage_name: str) -> Path:
    """Create and return ``workspace/<stage_name>/``.

    Every stage writes its outputs into its own subdirectory so files
    from different stages never collide.
    """
    d = workspace / stage_name
    d.mkdir(parents=True, exist_ok=True)
    return d


__all__ = [
    "StageError",
    "StageResult",
    "StageTimer",
    "ensure_stage_dir",
]
