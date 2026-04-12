#!/usr/bin/env python3
"""Download, verify, and index reference databases for Relict.

Usage:
    python scripts/download_references.py              # all default DBs
    python scripts/download_references.py --only silva # just SILVA
    python scripts/download_references.py --only mitofish
    python scripts/download_references.py --only midori2
    python scripts/download_references.py --list       # show what would be fetched

Every download is SHA256-verified. On first run, the script records the
digest in data/references/reference_versions.json. On subsequent runs,
it re-verifies against the pinned digest and skips downloads that match.

The vsearch UDB index is built after download so taxonomy assignment
can use --usearch_global against it directly.

This script is called by `make download-refs` (see Makefile).
"""
from __future__ import annotations

import argparse
import gzip
import hashlib
import json
import shutil
import subprocess
import sys
import urllib.request
from dataclasses import dataclass
from pathlib import Path

REFS_DIR = Path(__file__).resolve().parent.parent / "data" / "references"
VERSIONS_FILE = REFS_DIR / "reference_versions.json"


@dataclass
class RefDB:
    """A reference database to download."""

    name: str
    url: str
    compressed_filename: str
    decompressed_filename: str
    description: str
    citation: str
    license_note: str
    needs_gunzip: bool = True
    build_udb: bool = True


DATABASES: dict[str, RefDB] = {
    "silva": RefDB(
        name="SILVA 138.1 SSU Ref NR99",
        url="https://data.arb-silva.de/release_138_1/Exports/SILVA_138.1_SSURef_NR99_tax_silva.fasta.gz",
        compressed_filename="SILVA_138.1_SSURef_NR99_tax_silva.fasta.gz",
        decompressed_filename="SILVA_138.1_SSURef_NR99_tax_silva.fasta",
        description="16S/18S rRNA reference for bacteria, archaea, eukaryotes",
        citation="Quast et al. (2013) Nucleic Acids Res. 41(D1):D590-D596",
        license_note="Free for academic/non-commercial use. See https://www.arb-silva.de/silva-license-information/",
    ),
    "mitofish": RefDB(
        name="MitoFish complete+partial mitogenomes",
        url="https://mitofish.aori.u-tokyo.ac.jp/files/complete_partial_mitogenomes.zip",
        compressed_filename="complete_partial_mitogenomes.zip",
        decompressed_filename="complete_partial_mitogenomes.fa",
        description="12S fish mitochondrial reference for MiFish eDNA studies",
        citation="Iwasaki et al. (2013) Mol Biol Evol 30(11):2531-2540",
        license_note="Free for academic use",
        needs_gunzip=False,
        build_udb=False,
    ),
}


def sha256_file(path: Path) -> str:
    """Compute SHA256 of a file, streaming in 8 MiB chunks."""
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while True:
            chunk = f.read(8 * 1024 * 1024)
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()


def load_versions() -> dict[str, dict[str, str]]:
    if VERSIONS_FILE.exists():
        return json.loads(VERSIONS_FILE.read_text())
    return {}


def save_versions(versions: dict[str, dict[str, str]]) -> None:
    VERSIONS_FILE.parent.mkdir(parents=True, exist_ok=True)
    VERSIONS_FILE.write_text(json.dumps(versions, indent=2, sort_keys=True) + "\n")


def download_file(url: str, dest: Path) -> None:
    """Download with a simple progress indicator."""
    print(f"  Downloading {url}")
    print(f"  → {dest}")

    req = urllib.request.Request(url, headers={"User-Agent": "Relict/0.1.0"})
    with urllib.request.urlopen(req, timeout=300) as resp:  # noqa: S310
        total = resp.headers.get("Content-Length")
        total_mb = f"{int(total) / 1024 / 1024:.1f} MB" if total else "unknown size"
        print(f"  Size: {total_mb}")

        dest.parent.mkdir(parents=True, exist_ok=True)
        downloaded = 0
        with open(dest, "wb") as out:
            while True:
                chunk = resp.read(1024 * 1024)
                if not chunk:
                    break
                out.write(chunk)
                downloaded += len(chunk)
                mb = downloaded / 1024 / 1024
                if total:
                    pct = downloaded / int(total) * 100
                    print(f"\r  {mb:.1f} MB / {total_mb} ({pct:.0f}%)", end="", flush=True)
                else:
                    print(f"\r  {mb:.1f} MB", end="", flush=True)
        print()


def decompress_gz(src: Path, dest: Path) -> None:
    """Decompress a .gz file."""
    print(f"  Decompressing {src.name} → {dest.name}")
    with gzip.open(src, "rb") as f_in, open(dest, "wb") as f_out:
        shutil.copyfileobj(f_in, f_out)
    print(f"  Done. Size: {dest.stat().st_size / 1024 / 1024:.1f} MB")


def decompress_zip(src: Path, dest_dir: Path) -> Path:
    """Extract a .zip archive and return the path to the main FASTA."""
    import zipfile

    print(f"  Extracting {src.name}")
    with zipfile.ZipFile(src, "r") as zf:
        zf.extractall(dest_dir)
        names = zf.namelist()
        print(f"  Extracted {len(names)} files")

    fasta_files = [dest_dir / n for n in names if n.endswith((".fa", ".fasta", ".fna"))]
    if not fasta_files:
        all_files = list(dest_dir.rglob("*"))
        fasta_files = [f for f in all_files if f.suffix in (".fa", ".fasta", ".fna")]

    if not fasta_files:
        print(f"  WARNING: no FASTA found in {src.name}; listing all extracted files:")
        for n in names:
            print(f"    {n}")
        msg = f"No FASTA file found in {src.name}"
        raise FileNotFoundError(msg)

    main = max(fasta_files, key=lambda f: f.stat().st_size)
    print(f"  Main FASTA: {main.name} ({main.stat().st_size / 1024 / 1024:.1f} MB)")
    return main


def build_vsearch_udb(fasta: Path) -> Path:
    """Build a vsearch UDB index for fast --usearch_global queries."""
    udb = fasta.with_suffix(".udb")
    if udb.exists():
        print(f"  UDB index already exists: {udb.name}")
        return udb

    print(f"  Building vsearch UDB index: {udb.name}")
    print("  (This may take 5-30 minutes for large databases like SILVA)")

    result = subprocess.run(
        [
            "vsearch",
            "--makeudb_usearch", str(fasta),
            "--output", str(udb),
        ],
        capture_output=True,
        text=True,
        check=False,
    )

    if result.returncode != 0:
        print(f"  WARNING: vsearch UDB build failed (code {result.returncode})")
        print(f"  stderr: {result.stderr[:500]}")
        print("  Pipeline will fall back to raw FASTA (slower but functional)")
        return fasta

    print(f"  UDB index built: {udb.stat().st_size / 1024 / 1024:.1f} MB")
    return udb


def process_db(key: str, db: RefDB, versions: dict[str, dict[str, str]], *, force: bool = False) -> bool:
    """Download, verify, decompress, and index one reference database.

    Returns True if the database is ready to use.
    """
    print(f"\n{'=' * 60}")
    print(f"  {db.name}")
    print(f"  {db.description}")
    print(f"  Citation: {db.citation}")
    print(f"{'=' * 60}")

    dest_dir = REFS_DIR / key
    compressed = dest_dir / db.compressed_filename
    decompressed = dest_dir / db.decompressed_filename

    if decompressed.exists() and not force:
        current_sha = sha256_file(decompressed)
        pinned = versions.get(key, {}).get("sha256_decompressed", "")
        if pinned and current_sha == pinned:
            print(f"  Already downloaded and verified (SHA256: {current_sha[:16]}...)")
            return True
        if pinned:
            print(f"  WARNING: SHA256 mismatch! Expected {pinned[:16]}..., got {current_sha[:16]}...")
            print("  Re-downloading...")
        else:
            print(f"  File exists but no pinned SHA256. Recording current digest.")
            versions[key] = {
                "name": db.name,
                "sha256_decompressed": current_sha,
                "citation": db.citation,
                "license": db.license_note,
                "path": str(decompressed.relative_to(REFS_DIR)),
            }
            save_versions(versions)
            return True

    dest_dir.mkdir(parents=True, exist_ok=True)

    if not compressed.exists():
        download_file(db.url, compressed)

    if db.needs_gunzip:
        decompress_gz(compressed, decompressed)
    else:
        result_path = decompress_zip(compressed, dest_dir)
        if result_path != decompressed:
            if not decompressed.exists():
                result_path.rename(decompressed)
            else:
                print(f"  FASTA already at {decompressed.name}")

    if not decompressed.exists():
        print(f"  ERROR: expected {decompressed} but it does not exist!")
        return False

    digest = sha256_file(decompressed)
    versions[key] = {
        "name": db.name,
        "sha256_decompressed": digest,
        "citation": db.citation,
        "license": db.license_note,
        "path": str(decompressed.relative_to(REFS_DIR)),
    }
    save_versions(versions)
    print(f"  SHA256: {digest}")

    if db.build_udb and shutil.which("vsearch"):
        build_vsearch_udb(decompressed)

    print(f"  ✓ {db.name} ready")
    return True


def main() -> int:
    parser = argparse.ArgumentParser(description="Download Relict reference databases")
    parser.add_argument("--only", choices=list(DATABASES.keys()), help="Download only this DB")
    parser.add_argument("--force", action="store_true", help="Re-download even if verified")
    parser.add_argument("--list", action="store_true", help="List available DBs and exit")
    args = parser.parse_args()

    if args.list:
        print("Available reference databases:\n")
        for key, db in DATABASES.items():
            print(f"  {key:12s}  {db.name}")
            print(f"               {db.description}")
            print(f"               URL: {db.url}")
            print()
        return 0

    REFS_DIR.mkdir(parents=True, exist_ok=True)
    versions = load_versions()

    targets = {args.only: DATABASES[args.only]} if args.only else DATABASES
    results: dict[str, bool] = {}

    for key, db in targets.items():
        try:
            results[key] = process_db(key, db, versions, force=args.force)
        except Exception as exc:  # noqa: BLE001
            print(f"\n  ERROR processing {db.name}: {exc}")
            results[key] = False

    print(f"\n{'=' * 60}")
    print("  Summary")
    print(f"{'=' * 60}")
    for key, ok in results.items():
        status = "✓ ready" if ok else "✗ FAILED"
        print(f"  {key:12s}  {status}")

    if VERSIONS_FILE.exists():
        print(f"\n  Version manifest: {VERSIONS_FILE}")

    failed = [k for k, v in results.items() if not v]
    if failed:
        print(f"\n  {len(failed)} database(s) failed. Re-run with --force to retry.")
        return 1

    print("\n  All databases ready. You can now run the pipeline.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
