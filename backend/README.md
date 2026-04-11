# backend/

Real FastAPI backend, bioinformatics worker, and pipeline modules for Relict.

**Status:** scaffold only. Code lands in Phase 1 of the rebuild — see [`../docs/MASTER_PLAN.md`](../docs/MASTER_PLAN.md).

## Layout

```
backend/
├── app/                    # FastAPI application
│   ├── api/                # HTTP routes (v1)
│   ├── core/               # Config, security, logging
│   ├── db/                 # SQLAlchemy models + Alembic migrations
│   ├── schemas/            # Pydantic v2 request/response models
│   └── services/           # Business logic (jobs, auth, provenance)
├── worker/                 # RQ worker process
│   └── pipeline/           # Bioinformatics pipeline stages
│       ├── qc.py                  # fastp wrapper
│       ├── denoise_vsearch.py     # vsearch ASV inference
│       ├── denoise_dada2.py       # DADA2 (R subprocess) ASV inference
│       ├── taxonomy.py            # vsearch global alignment vs reference DB
│       ├── diversity.py           # scikit-bio metrics
│       ├── ordination.py          # UMAP + HDBSCAN
│       ├── conservation.py        # GBIF + IUCN Red List cross-ref
│       └── provenance.py          # Signed manifest generation
├── tests/
│   ├── unit/               # Pure function tests
│   ├── integration/        # Real pipeline runs against small real datasets
│   └── fixtures/           # Real truncated FASTQ subsets for CI
├── data/
│   ├── references/         # Downloaded reference DBs (SILVA/MIDORI2/MitoFish) — gitignored
│   ├── demo/               # Real public demo datasets — gitignored, fetched by script
│   └── cache/              # API response cache (GBIF, IUCN) — gitignored
├── scripts/
│   ├── download_references.sh     # Version-pinned, SHA-verified DB downloads
│   ├── download_demo_datasets.sh  # Real public eDNA datasets from SRA/ENA
│   └── run_benchmark.py           # Reproduce published studies
├── pyproject.toml
├── Dockerfile              # API image
├── Dockerfile.worker       # Worker image with all bioinformatics tools
├── docker-compose.yml      # API + Postgres + Redis + MinIO + worker
└── .env.example
```

## Rules

1. **No mock data, ever.** If a tool or DB is missing, the code must raise
   a clear error — not return fabricated results.
2. **Version-pin everything.** Every reference DB, every tool, every parameter
   is recorded in the provenance manifest.
3. **Fail loudly.** Every subprocess call checks its return code and captures
   stderr into structured logs.
4. **No shell injection.** All subprocess calls use `shlex` / `list` args,
   never `shell=True`.
5. **Idempotent pipeline stages.** Each stage takes a workspace directory
   and produces deterministic outputs based on inputs + parameters.
