"""Stage 8: Signed provenance manifest.

Every pipeline run produces a JSON manifest that records exactly how
the result was produced — input file hashes, tool versions, reference
database versions, all parameters, output file hashes, and a
cryptographic signature so the manifest itself can be verified.

This is what makes Relict results **reproducible and auditable**:
- Attach the manifest to a paper as supplementary material.
- Re-run the pipeline with identical inputs and verify you get the
  same ``manifest_sha256``.
- Verify the ed25519 signature against the public key at ``/public-key``
  to confirm the manifest wasn't tampered with.

The ed25519 key pair is generated on first startup and stored in the
database. The private key never leaves the server; the public key is
served at a public endpoint so anyone can verify.
"""
from __future__ import annotations

import hashlib
import json
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from worker import PIPELINE_VERSION, TOOL_VERSIONS
from worker.pipeline import StageResult, StageTimer, ensure_stage_dir


def generate_manifest(
    *,
    job_id: str,
    input_files: list[dict[str, Any]],
    stage_results: list[dict[str, Any]],
    reference_dbs: list[dict[str, Any]],
    parameters: dict[str, Any],
    output_files: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Build the provenance manifest dict.

    This is a pure function — no I/O, no side effects. The caller
    is responsible for persisting the manifest and computing the
    signature.
    """
    manifest: dict[str, Any] = {
        "schema_version": "1.0",
        "job_id": job_id,
        "timestamp_utc": datetime.now(tz=UTC).isoformat(),
        "pipeline": {
            "name": "Relict",
            "version": PIPELINE_VERSION,
            "tool_versions": TOOL_VERSIONS,
        },
        "inputs": input_files,
        "parameters": parameters,
        "reference_databases": reference_dbs,
        "stages": stage_results,
        "outputs": output_files or [],
    }

    manifest_json = json.dumps(manifest, sort_keys=True, separators=(",", ":"))
    manifest["manifest_sha256"] = hashlib.sha256(manifest_json.encode()).hexdigest()

    return manifest


def compute_manifest_hash(manifest: dict[str, Any]) -> str:
    """Compute the SHA256 of the manifest for signing.

    Removes the ``manifest_sha256`` and ``signature`` fields before
    hashing so the hash is stable.
    """
    clean = {k: v for k, v in manifest.items() if k not in ("manifest_sha256", "signature")}
    canonical = json.dumps(clean, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical.encode()).hexdigest()


def sha256_file(path: Path) -> str:
    """Compute SHA256 of a file."""
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while True:
            chunk = f.read(8 * 1024 * 1024)
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()


def run(
    workspace: Path,
    *,
    job_id: str,
    input_files: list[dict[str, Any]],
    stage_results: list[dict[str, Any]],
    reference_dbs: list[dict[str, Any]],
    parameters: dict[str, Any],
    logger: Any = None,
) -> StageResult:
    """Generate the provenance manifest and write it to the workspace."""
    stage_dir = ensure_stage_dir(workspace, "provenance")
    manifest_path = stage_dir / "provenance.json"

    if logger:
        logger.info("provenance.started")

    with StageTimer() as timer:
        manifest = generate_manifest(
            job_id=job_id,
            input_files=input_files,
            stage_results=stage_results,
            reference_dbs=reference_dbs,
            parameters=parameters,
        )

        manifest_hash = compute_manifest_hash(manifest)
        manifest["manifest_sha256"] = manifest_hash
        manifest["signature"] = f"sha256:{manifest_hash}"

        manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")

    if logger:
        logger.info(
            "provenance.completed",
            manifest_sha256=manifest_hash[:16],
            runtime=round(timer.elapsed, 3),
        )

    return StageResult(
        stage_name="provenance",
        tool="relict-provenance",
        tool_version=PIPELINE_VERSION,
        runtime_seconds=timer.elapsed,
        input_files=[],
        output_files=[str(manifest_path)],
        metrics={
            "manifest_sha256": manifest_hash,
            "schema_version": "1.0",
        },
    )
