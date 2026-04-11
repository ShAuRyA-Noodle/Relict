# MASTER PLAN — Relict Transformation

> **Goal:** transform this repository from a hackathon-era UI prototype with
> a stub backend into a production-grade, publication-ready, open-source
> environmental DNA analysis platform that unifies three real use cases —
> **conservation reporting, citizen-science eDNA submission, and
> reproducible research notebooks** — on a single reproducible pipeline.
>
> **Non-negotiable rule:** no mock data, no fabricated metrics, no synthetic
> "results" that were not computed from real input. Every stage is a real,
> published, open-source tool. If a dependency is missing, the code fails
> loudly — it never fills the gap with fake output.

This document is the single source of truth for the rebuild. Every file
created in this repository from Phase 0 onward must be traceable to a task
listed here.

---

## Table of contents

1. [The three angles (and why all three)](#the-three-angles-and-why-all-three)
2. [Guiding principles](#guiding-principles)
3. [Phase 0 — Cleanup & honesty](#phase-0--cleanup--honesty)
4. [Phase 1 — Production backend skeleton](#phase-1--production-backend-skeleton)
5. [Phase 2 — Real bioinformatics pipeline](#phase-2--real-bioinformatics-pipeline)
6. [Phase 3 — Conservation cross-reference layer (Angle #1)](#phase-3--conservation-cross-reference-layer-angle-1)
7. [Phase 4 — Citizen-science submission workflow (Angle #2)](#phase-4--citizen-science-submission-workflow-angle-2)
8. [Phase 5 — Reproducibility manifest & notebooks (Angle #3)](#phase-5--reproducibility-manifest--notebooks-angle-3)
9. [Phase 6 — Frontend wired to real data](#phase-6--frontend-wired-to-real-data)
10. [Phase 7 — Benchmarking & validation](#phase-7--benchmarking--validation)
11. [Phase 8 — Research paper](#phase-8--research-paper)
12. [What the user (Shaurya) must provide](#what-the-user-shaurya-must-provide)
13. [Definition of "done"](#definition-of-done)

---

## The three angles (and why all three)

The user asked for all three unique angles from the initial analysis to be
implemented. This is actually the right call: each angle targets a
different stakeholder, but they all rest on the **same core pipeline**. Doing
all three is additive work on the conservation/citizen-science/provenance
layers — not three separate codebases.

| Angle | Stakeholder | What they get | Underlying system |
|---|---|---|---|
| **#1 Conservation reporting** | Forest departments, NGOs, conservation biologists | Plain-language report that flags protected / threatened / invasive species in a sample, cross-referenced against GBIF + IUCN Red List | Core pipeline + `conservation.py` module + PDF/HTML report generator |
| **#2 Citizen-science eDNA** | Schools, divers, field volunteers, BioBlitz organizers | "Upload → results → publish to GBIF" in under 10 minutes, no bioinformatics skill required | Core pipeline + guided UI mode + GBIF DNA-derived occurrence publisher |
| **#3 Reproducible notebooks** | Academic researchers writing papers | Signed provenance manifest attached to every run, BIOM/QIIME2 exports, benchmarked against published studies | Core pipeline + `provenance.py` module + `scripts/run_benchmark.py` |

**All three reuse the same pipeline.** The work in each angle is in the
*layer on top* of the pipeline, not in the pipeline itself. This is why
doing all three is only ~30–40% more total work than doing one.

---

## The Hard Rule (non-negotiable collaboration protocol)

This rule is binding on every phase from Phase 1 onward. Violating it is a
bug in the process, not an acceptable shortcut.

### Before every phase starts

The assistant **must** publish a *Phase Prerequisites Checklist* covering:

1. **Tools & software** — every CLI binary, Docker image, Python/Node package
   that needs to be present on the user's machine, with version floors.
2. **API keys & secrets** — exactly which ones are needed for this specific
   phase, where to get them, and which env var each one goes into.
3. **Datasets & files** — any real public data that must be downloadable
   (size + URL + checksum approach).
4. **Decisions needed from the user** — naming, configuration, scope
   questions that would block progress if answered mid-phase.
5. **Disk / RAM / network budget** — realistic numbers, not hand-waving.
6. **What will not be done in this phase** — so expectations are clear.

The assistant does not start coding the phase until the user has seen this
checklist and confirmed readiness.

### After every phase ends

The assistant **must** publish a *Phase Completion Report* covering:

1. **What shipped** — every file created or materially changed, with links.
2. **What works end-to-end** — a short list of demoable flows.
3. **What does not yet work** — known gaps, deferred items, TODOs with
   justification.
4. **Tests status** — what is covered, what is not, what to run to verify.
5. **Deviations from the plan** — anything that differs from the
   pre-phase checklist and why.
6. **Security / provenance notes** — any new secrets, dependencies, or
   supply-chain surface.
7. **Phase exit criteria** from the plan, individually ticked off.
8. **Commit hashes** — exactly which commits land the phase so the user can
   `git checkout` any boundary.

### Guarantees this rule enforces

- The user is never ambushed mid-phase by "I needed X but you didn't give
  it to me." Blockers are raised before work starts.
- Nothing lands silently. Every phase is a contract with explicit entry
  and exit conditions.
- The research paper's "Methods" section can be reconstructed from the
  completion reports alone, because every deviation is logged.
- The repository is always in a known, named state at every phase
  boundary.

---

## Guiding principles

1. **No mock data, ever.** Not in tests, not in demos, not in the UI, not in
   the database seed. If a stage can't run because a DB is missing, the
   response contains an error, not a placeholder number.
2. **Version-pin everything.** Every tool (`fastp==0.24.0`), every reference
   DB (`SILVA_138.1_SSURef_NR99`), every Python package, every JS package.
   Versions go into the provenance manifest and the `Dockerfile`.
3. **Fail loudly.** `subprocess.run(..., check=True)` around every tool call.
   Capture `stderr` into the job's structured log. The UI surfaces the real
   error, not a fake "something went wrong."
4. **Deterministic inside, non-deterministic outside.** Pipeline stages must
   be deterministic (same input + same params ⇒ same output, bit-for-bit
   where possible). External APIs (GBIF, IUCN) are cached with TTLs so
   results are reproducible.
5. **Real datasets, real benchmarks.** Every test and every demo uses real
   public eDNA data from SRA / ENA / MGnify / the published literature — see
   [`DATASETS.md`](./DATASETS.md).
6. **Separation of concerns.** The FastAPI app holds HTTP state only. All
   bioinformatics work happens in the RQ worker. The two communicate via
   the database + object storage + a job status topic.
7. **No `shell=True`, ever.** All subprocess calls use list args. All user
   input is validated at the schema layer before touching a pipeline stage.
8. **Everything is in Git except data.** References, demo datasets, caches
   are `.gitignore`d and fetched by version-pinned scripts.

---

## Phase 0 — Cleanup & honesty

**Status: ✅ COMPLETED (this turn)**

Concrete deliverables:

- [x] Moved `ht.cpp`, `__*.txt` scaffolding artifacts, `_inventory*.txt`,
      `Flow1.png`, `Flow2.png`, and the entire old `server/` directory
      into `dump/` (for user to delete).
- [x] Stripped every `SIH25042` / `Ministry of Earth Sciences` /
      `Smart India Hackathon` reference from `index.html` and the six
      affected frontend components (`HeroSection`, `Footer`, `TeamSection`,
      `ImpactSection`, `CredibilitySection`, `ApiDocumentation`).
- [x] Deleted fabricated-number fake metrics from `CredibilitySection.tsx`
      (`99.2% accuracy`, `2.1s`, `50K+`, `28 species detected / 94% confidence`).
- [x] Deleted Lovable OpenGraph image references from `index.html`.
- [x] Rewrote `README.md` from scratch — honest status, real tech stack,
      real pipeline diagram, real references, links to all planning docs.
- [x] Scaffolded the `backend/` directory tree.
- [x] Wrote this plan and all sibling docs (`ARCHITECTURE.md`, `DATASETS.md`,
      `API_KEYS.md`, `RESEARCH_PAPER_PLAN.md`).
- [x] Added `CITATION.cff` and updated `package.json` metadata.

**Exit criteria met when:** no SIH string remains in any tracked source file,
no mock numbers remain on any page, `dump/` contains all legacy artifacts,
and all Phase 1+ work has a clear target location.

---

## Phase 1 — Production backend skeleton

**Goal:** a real FastAPI + Postgres + Redis + MinIO + worker stack that
stands up with `docker compose up` and supports multi-user, concurrent,
persisted jobs — with **zero bioinformatics yet**. Bioinformatics lands in
Phase 2 on top of this skeleton.

### 1.1 Deliverables

| Item | Location | What it does |
|---|---|---|
| `docker-compose.yml` | `backend/docker-compose.yml` | Brings up API, worker, Postgres 16, Redis 7, MinIO, Adminer |
| `Dockerfile` (API) | `backend/Dockerfile` | Python 3.11 slim, FastAPI, no bioinformatics tools |
| `Dockerfile.worker` | `backend/Dockerfile.worker` | Python 3.11 + fastp + vsearch + R + DADA2 + BioPython |
| `pyproject.toml` | `backend/pyproject.toml` | `uv`-managed dependencies, ruff + mypy + pytest configured |
| `.env.example` | `backend/.env.example` | All secrets + config, commented |
| FastAPI app factory | `backend/app/main.py` | `create_app()` pattern, CORS, lifespan, /health |
| Config | `backend/app/core/config.py` | Pydantic Settings loaded from env |
| Logging | `backend/app/core/logging.py` | structlog JSON logs |
| SQLAlchemy 2.0 setup | `backend/app/db/session.py` | Async session factory |
| Alembic | `backend/app/db/migrations/` | Migrations from day one |
| Models | `backend/app/db/models/` | `User`, `Job`, `Sample`, `ASV`, `Taxon`, `DiversityMetric`, `Provenance` |
| Pydantic schemas | `backend/app/schemas/` | Request/response DTOs, strict validation |
| Auth | `backend/app/services/auth.py` | JWT + refresh, argon2 password hashing |
| Object storage | `backend/app/services/storage.py` | S3-compatible client (MinIO in dev, any S3 in prod) |
| Job queue | `backend/app/services/jobs.py` | RQ enqueue, status polling, cancellation |
| Worker entrypoint | `backend/worker/main.py` | RQ worker that loads pipeline modules |
| API routes v1 | `backend/app/api/v1/` | `/auth`, `/jobs`, `/samples`, `/results`, `/taxa`, `/health` |
| WebSocket | `backend/app/api/v1/ws.py` | Per-job progress channel |
| Tests (unit) | `backend/tests/unit/` | Pure function + schema tests |
| Tests (integration) | `backend/tests/integration/` | Spin up test Postgres + Redis via testcontainers |

### 1.2 Database schema (v1)

```sql
-- users: real auth, no "demo mode" user
users(id, email, password_hash, created_at, role)

-- jobs: the unit of work
jobs(id, user_id, status, created_at, started_at, finished_at,
     error_message, parameter_hash, pipeline_version)
-- status ∈ {queued, running, succeeded, failed, cancelled}

-- samples: one per uploaded FASTQ (paired-end = 2 samples or 1 pair row)
samples(id, job_id, filename, s3_key, sha256, num_reads, read_length_mean,
        primer_set, amplicon, metadata_json)

-- asvs: one per unique amplicon sequence variant
asvs(id, job_id, sequence_sha256, sequence, length, abundance)

-- taxa: taxonomic assignment for an ASV
taxa(id, asv_id, kingdom, phylum, class, order, family, genus, species,
     confidence, reference_db, reference_db_version, reference_accession)

-- conservation: cached per-species conservation status
conservation(id, taxon_species, gbif_key, gbif_occurrence_count,
             iucn_category, iucn_assessment_year, is_invasive,
             legal_flags_json, fetched_at)

-- diversity_metrics: computed per sample
diversity_metrics(id, sample_id, richness, shannon, simpson, chao1,
                  faith_pd, evenness)

-- provenance: the signed manifest
provenance(id, job_id, manifest_json, manifest_sha256, signed_at)
```

### 1.3 Exit criteria

- [ ] `docker compose up --build` brings up all services; `/health` returns
      200 on `http://localhost:8000/health`.
- [ ] Alembic migrations create the schema on a fresh database.
- [ ] A user can sign up, log in, upload a dummy file (no pipeline yet),
      and receive a `job_id`; the job appears in the DB as `queued` and then
      transitions to `succeeded` via a no-op worker stub.
- [ ] `pytest` passes with ≥ 80 % coverage on `app/` (pipeline worker is
      empty at this stage so no target there yet).
- [ ] `ruff check` and `mypy --strict` pass.
- [ ] No `shell=True` anywhere in the codebase (enforced by ruff rule).

**Estimated work:** 4–6 days of focused solo work.

---

## Phase 2 — Real bioinformatics pipeline

**Goal:** wire up the actual bioinformatics stages, each as its own pipeline
module, each calling a real tool, each with real integration tests using real
truncated public FASTQ data.

### 2.1 Pipeline stages

Each stage is a Python module under `backend/worker/pipeline/` with the
signature:

```python
def run(workspace: Path, params: StageParams, logger: Logger) -> StageResult:
    """
    Deterministic, idempotent, pure-function-over-filesystem.
    Writes outputs into workspace/<stage_name>/.
    Raises StageError with full stderr on failure.
    Records tool version + invocation in the returned StageResult.
    """
```

| # | Stage | Tool | Input | Output |
|---|---|---|---|---|
| 1 | `qc.py` | fastp | Raw FASTQ | Trimmed FASTQ + JSON report |
| 2 | `dereplicate.py` | vsearch --derep_fulllength | Trimmed FASTQ | Unique sequences with counts |
| 3a | `denoise_vsearch.py` | vsearch --cluster_unoise | Unique sequences | ASV table |
| 3b | `denoise_dada2.py` | DADA2 via R subprocess | Trimmed FASTQ | ASV table |
| 4 | `taxonomy.py` | vsearch --usearch_global | ASV FASTA + reference DB | Per-ASV taxonomic assignment |
| 5 | `diversity.py` | scikit-bio | ASV table | Shannon, Simpson, Chao1, Faith's PD, richness, evenness |
| 6 | `ordination.py` | umap-learn + hdbscan | ASV abundance table | 2D UMAP coordinates + cluster labels |
| 7 | `conservation.py` | GBIF + IUCN Red List APIs | Species list | Per-species status record |
| 8 | `provenance.py` | in-house | All stage results | Signed JSON manifest |

### 2.2 Reference databases (version-pinned)

See [`DATASETS.md`](./DATASETS.md) for working download URLs, sizes, and
checksums. The downloader script is `backend/scripts/download_references.sh`;
it verifies SHA256 and writes a `reference_versions.json` into
`backend/data/references/`.

### 2.3 Integration tests with real data

Every stage has at least one integration test running against a real
truncated public FASTQ subset (≤ 5 MB, checked into `backend/tests/fixtures/`
or fetched on first CI run). Assertions are specific:

- QC stage: output FASTQ has strictly fewer reads than input, and fastp's
  JSON report records `filtering_result.passed_filter_reads > 0`.
- Dereplicate: output has strictly fewer sequences than input.
- Taxonomy: at least one ASV is assigned down to genus level against SILVA
  when given a known 16S V4 dataset from SRA.
- Diversity: Shannon index for a known toy dataset falls within the expected
  range documented in the test.

### 2.4 Exit criteria

- [ ] Every stage has a working `run()` that calls its real tool.
- [ ] End-to-end pipeline runs on at least one real public dataset in under
      10 minutes on a laptop.
- [ ] Integration tests green in CI.
- [ ] No stage ever returns a placeholder, default, or fake value on error.
- [ ] `provenance.json` contains every tool version, DB version, parameter,
      and output hash. It is byte-identical across two runs with identical
      inputs.

**Estimated work:** 5–7 days.

---

## Phase 3 — Conservation cross-reference layer (Angle #1)

**Goal:** for every detected species, attach a conservation status record.
Generate a plain-language PDF/HTML conservation report that a non-specialist
can read.

### 3.1 Deliverables

- `backend/worker/pipeline/conservation.py` — calls GBIF Species API,
  IUCN Red List API, and checks against a curated invasive-species list
  (kept as a versioned JSON in `backend/data/references/invasive_species.json`,
  sourced from the [Global Invasive Species Database](http://www.iucngisd.org/gisd/)).
- `backend/app/services/reports.py` — generates a report JSON combining
  all the above, plus a PDF rendered with [WeasyPrint](https://weasyprint.org/)
  from a Jinja2 template.
- `backend/app/api/v1/reports.py` — `GET /jobs/{id}/report` returns either
  the JSON or streams the PDF.
- Report template at `backend/app/templates/conservation_report.html` with
  sections: sample metadata, detected taxa table, protected species callout,
  invasive species callout, map, diversity metrics, provenance hash.

### 3.2 Conservation JSON schema

```json
{
  "species": "Tor putitora",
  "common_name": "Golden mahseer",
  "gbif": {
    "key": 2352748,
    "occurrence_count_global": 123,
    "occurrence_count_within_50km": 4
  },
  "iucn": {
    "category": "EN",
    "category_full": "Endangered",
    "assessment_year": 2018,
    "population_trend": "decreasing"
  },
  "invasive": false,
  "legal_flags": [],
  "report_callout": "🛡️ Protected (IUCN Endangered)"
}
```

### 3.3 Caching policy

External API calls are cached in a `conservation_cache` Postgres table keyed
by `(species, api_name)` with a TTL of 30 days. The provenance manifest
records the `fetched_at` timestamp of every record used so results remain
reproducible even if the external API changes.

### 3.4 Exit criteria

- [ ] For a real test dataset, the full report is generated end-to-end.
- [ ] Running the same job twice produces byte-identical reports (via cache).
- [ ] The PDF is human-readable, ≤ 5 pages, and contains no fabricated data.
- [ ] A conservation biologist who is not the author can read the PDF and
      immediately understand what's in the sample.

**Estimated work:** 3–4 days.

---

## Phase 4 — Citizen-science submission workflow (Angle #2)

**Goal:** let a non-specialist upload a sample, get a result, and publish
the result to GBIF as a DNA-derived occurrence record — all in under 10
minutes, all in a guided UI.

### 4.1 Deliverables

- `backend/app/services/gbif_publisher.py` — builds a Darwin Core Archive
  (DwC-A) from job results following the
  [GBIF "Publishing DNA-derived data" guide](https://docs.gbif.org/publishing-dna-derived-data/en/).
  Includes `occurrence.txt`, `dna-derived-data.txt`, `eml.xml` metadata.
- `backend/app/api/v1/publish.py` — `POST /jobs/{id}/publish` produces the
  DwC-A, zips it, and returns it for download (user manually uploads to
  their GBIF IPT or their organizational publishing account — we don't
  auto-post without explicit user action for data-quality reasons).
- A guided "Citizen Mode" in the frontend (Phase 6) that hides expert
  parameters and walks the user through: upload → sample metadata form →
  run → review → download DwC-A → instructions for GBIF submission.
- Preset amplicon configurations for common markers:
  - `12S_MiFish` — fish, universal primers (Miya et al. 2015)
  - `COI_Leray` — invertebrates (Leray et al. 2013)
  - `16S_V4` — bacteria (Earth Microbiome Project)
  - `18S_V9` — eukaryotes
  - `rbcL` — plants
  - `ITS2` — fungi & plants
  Each preset is a YAML file in `backend/data/references/amplicon_presets/`
  with primers, trimming parameters, recommended reference DB.

### 4.2 Sample metadata form

Required fields (mapped to Darwin Core terms):

- Event date (`eventDate`)
- Latitude / longitude with uncertainty (`decimalLatitude`, `decimalLongitude`, `coordinateUncertaintyInMeters`)
- Habitat type (`habitat`) — picklist: freshwater, marine, brackish, soil, sediment, air
- Sampling method (`samplingProtocol`) — free text
- Depth or elevation (`minimumDepthInMeters`, `minimumElevationInMeters`)
- Collector name (`recordedBy`)
- Institutional code (`institutionCode`) — optional

The frontend validates these before the job is submitted. Without valid
metadata, the citizen-science mode refuses to run.

### 4.3 Exit criteria

- [ ] A non-technical user can complete the full flow in under 10 minutes.
- [ ] The produced DwC-A validates against GBIF's DwC-A validator.
- [ ] A real test upload to a GBIF sandbox IPT successfully ingests the
      archive.
- [ ] Metadata validation rejects bad inputs with useful error messages.

**Estimated work:** 3–5 days.

---

## Phase 5 — Reproducibility manifest & notebooks (Angle #3)

**Goal:** every analysis ships with a signed manifest sufficient to
reproduce the exact result, plus BIOM/QIIME2 exports for downstream analysis
in Jupyter / phyloseq / R workflows.

### 5.1 The provenance manifest

`backend/worker/pipeline/provenance.py` produces a JSON like:

```json
{
  "schema_version": "1.0",
  "job_id": "b2c3…",
  "pipeline": {
    "git_commit": "a4f1…",
    "version": "0.1.0",
    "container_digest": "sha256:…"
  },
  "inputs": [
    {"filename": "sample_R1.fastq.gz", "sha256": "…", "bytes": 12345678}
  ],
  "parameters": {
    "qc": {"tool": "fastp", "version": "0.24.0", "args": {…}},
    "denoise": {"tool": "vsearch", "version": "2.28.1", "args": {…}},
    "taxonomy": {"tool": "vsearch", "version": "2.28.1",
                 "reference_db": "SILVA_138.1_SSURef_NR99",
                 "reference_sha256": "…"},
    "diversity": {"tool": "scikit-bio", "version": "0.6.0"},
    "ordination": {"tool": "umap-learn+hdbscan", "umap_version": "0.5.6",
                   "hdbscan_version": "0.8.40", "random_state": 42}
  },
  "outputs": [
    {"filename": "asv_table.tsv", "sha256": "…"},
    {"filename": "taxonomy.tsv", "sha256": "…"},
    {"filename": "diversity_metrics.json", "sha256": "…"}
  ],
  "external_api_calls": [
    {"api": "gbif.species", "cache_key": "Tor putitora", "fetched_at": "…", "response_sha256": "…"}
  ],
  "timestamp_utc": "2026-04-12T12:34:56Z",
  "manifest_sha256": "…",
  "signature": "ed25519:…"
}
```

The `signature` is computed with an ed25519 key generated at first startup
and stored in the database. The public key is served at `/public-key` so
anyone can verify the signature.

### 5.2 Exports

- **BIOM** (`biom-format`) — `asv_table.biom` with taxonomy and metadata.
- **QIIME2 artifacts** — `.qza` files with proper QIIME2 provenance
  stitched in.
- **phyloseq RDS** — optional, built on demand.
- **Jupyter notebook** — an executed `analysis.ipynb` checked into the job's
  output directory, generated with `papermill` from a template, using the
  job's real outputs.

### 5.3 Exit criteria

- [ ] Two runs with identical inputs produce identical `manifest_sha256`.
- [ ] Signature verification works from a separate machine.
- [ ] The generated Jupyter notebook runs top-to-bottom without errors.
- [ ] `qiime tools import` accepts the exported `.qza`.

**Estimated work:** 3–4 days.

---

## Phase 6 — Frontend wired to real data

**Goal:** remove every hardcoded mock array from the frontend and wire every
component to the real backend. Add the three "wow" visualizations: the
interactive map, the UMAP scatter, and the conservation report viewer.

### 6.1 Mock-data cleanup (non-negotiable)

Files to clean (grep for literals, replace with React Query hooks):

- `src/components/BiodiversityCharts.tsx` — currently 100 % hardcoded
- `src/components/BiodiversityMetrics.tsx` — currently hardcoded static values
- `src/components/DemoUpload.tsx` — currently the only real one; polish only

### 6.2 New / rebuilt components

| Component | What it does | Data source |
|---|---|---|
| `JobStatus.tsx` | Live job progress with per-stage breakdown | `/ws/jobs/{id}` |
| `ASVTable.tsx` | Paginated, filterable ASV table with taxonomy | `/jobs/{id}/asvs` |
| `TaxonomyTreemap.tsx` | Interactive phylum → species treemap | `/jobs/{id}/taxonomy` |
| `UmapScatter.tsx` | Real UMAP scatter, coloured by HDBSCAN cluster | `/jobs/{id}/ordination` |
| `SampleMap.tsx` | Leaflet map with sample point + GBIF historical overlay | `/jobs/{id}/sample` + GBIF |
| `ConservationPanel.tsx` | Per-species conservation card grid | `/jobs/{id}/conservation` |
| `ProvenancePanel.tsx` | Manifest viewer with SHA256 and signature verify button | `/jobs/{id}/provenance` |
| `ReportDownload.tsx` | PDF / BIOM / DwC-A / manifest download buttons | `/jobs/{id}/export/*` |
| `CitizenModeWizard.tsx` | The guided citizen-science upload flow | `/jobs`, `/samples` |

### 6.3 Routing & pages

- `/` — landing (already exists)
- `/demo` — expert mode upload (already exists, needs backend wire-up)
- `/citizen` — new citizen-mode wizard
- `/jobs/:id` — job detail / live progress
- `/jobs/:id/report` — conservation report view
- `/jobs/:id/provenance` — reproducibility manifest view
- `/visualize` — ⚠️ delete this mock-data-only page or redirect to `/jobs/:id`
- `/impact`, `/about`, `/api` — already exist, already cleaned in Phase 0

### 6.4 Exit criteria

- [ ] `grep -rn 'mock\|Mock\|hardcoded\|TODO.*backend' src/` returns zero hits.
- [ ] Every chart on every page renders from a real backend response.
- [ ] End-to-end test: upload a real FASTQ, see real ASVs, see real
      conservation callouts, download a real PDF, all from the browser.

**Estimated work:** 4–6 days.

---

## Phase 7 — Benchmarking & validation

**Goal:** prove that the platform produces scientifically correct results
by reproducing the findings of at least two published eDNA papers and
comparing against QIIME2 or DADA2's own canonical output.

### 7.1 Target reproduction studies

Pick real, peer-reviewed eDNA papers with open data. Candidates:

1. **A MiFish 12S fish eDNA study** with published ASV tables — reproduce
   the species list and Shannon index within tolerance.
2. **A 16S V4 microbial eDNA study** from the Earth Microbiome Project with
   published QIIME2 outputs — compare ASV-level agreement.
3. **A COI invertebrate metabarcoding study** with MIDORI2 taxonomy — verify
   genus-level assignment agreement.

Each benchmark is a `backend/scripts/benchmark_<paper_short_name>.py` that:

- Downloads the raw FASTQs from SRA/ENA via `sra-tools` or `curl` (SHA-verified).
- Runs the Relict pipeline with the same parameters as the paper.
- Compares outputs: ASV count, taxonomy agreement (Jaccard at genus), Shannon
  index (within configured tolerance).
- Writes a `benchmark_report.md` with pass/fail against tolerance.

### 7.2 Exit criteria

- [ ] All benchmarks green under pinned tolerances in CI.
- [ ] Benchmark reports live in `docs/benchmarks/` and are cited in the
      research paper.
- [ ] Any tolerance failure blocks the release of a new pipeline version.

**Estimated work:** 4–6 days (most of the time is in picking + cleaning
the target datasets).

---

## Phase 8 — Research paper

**Goal:** submit to a reputable journal/venue. See
[`RESEARCH_PAPER_PLAN.md`](./RESEARCH_PAPER_PLAN.md) for the full paper
plan, target venues, outline, and writing timeline.

Short version: primary target is **Methods in Ecology and Evolution** or
**Molecular Ecology Resources** (both high-impact, real, and realistic for
a solo-author methods paper). Backup targets: **Bioinformatics** (Oxford),
**GigaScience**, **PeerJ Computer Science**, **F1000Research**.

**Estimated work:** 3–6 weeks of writing + revision after Phase 7 lands.

---

## What the user (Shaurya) must provide

Things only you can get. I'll build everything else.

| # | Item | Where to get | Notes |
|---|---|---|---|
| 1 | **IUCN Red List API token** | https://apiv3.iucnredlist.org/api/v3/token | Free, takes 1–3 business days. **Mandatory for Angle #1.** |
| 2 | **NCBI Entrez API key** | https://www.ncbi.nlm.nih.gov/account/ → Settings → API Key Management | Free, instant. Increases rate limit from 3/s to 10/s. |
| 3 | **GBIF account + password** | https://www.gbif.org/user/profile | Free, instant. Needed for the Species API (optional but faster with auth) and for testing DwC-A submission. |
| 4 | **Disk budget confirmation** | your machine | Confirm ~15 GB free. Breakdown: SILVA 138.1 SSU NR99 ≈ 2.0 GB, MIDORI2 COI ≈ 1.5 GB, MitoFish 12S ≈ 50 MB, demo datasets ≈ 5 GB, Docker volumes ≈ 5 GB. |
| 5 | **Docker Desktop installed & running** | https://www.docker.com/products/docker-desktop/ | Required for the backend from Phase 1 onward. Confirm `docker compose version` ≥ 2.20. |
| 6 | **Python 3.11+ confirmed** | `python --version` | For local dev outside Docker. |
| 7 | **Choose a project name** | — | Current placeholder is "Relict". If you want a different name (e.g. "OpenEDNA", "Aequora", "BioFlux"), say so before Phase 1 so I rename consistently. |
| 8 | **Reference conference paper (optional)** | you already offered | Pick 1–2 recent eDNA methods papers from *Methods in Ecology and Evolution* or *Molecular Ecology Resources* that you want me to use as the style/structure template for your paper. |

See [`API_KEYS.md`](./API_KEYS.md) for detailed step-by-step instructions on
each API-key item.

---

## Definition of "done"

The project is **done** when all of the following are true simultaneously:

- [ ] `docker compose up` brings up the full stack on a fresh machine in
      under 5 minutes.
- [ ] A user can complete each of the three angles end-to-end from the UI:
  - Conservation report (upload → PDF with IUCN callouts)
  - Citizen-science submission (upload → DwC-A download validated by GBIF)
  - Reproducible notebook (upload → signed manifest + Jupyter + BIOM export)
- [ ] All Phase 7 benchmarks are green.
- [ ] The frontend contains zero hardcoded mock data (grep-verified in CI).
- [ ] The research paper is submitted to a target venue.
- [ ] The repository has a Zenodo DOI via a tagged GitHub release.
- [ ] README, all `docs/*.md`, `CITATION.cff`, and `LICENSE` are current.
- [ ] No `shell=True`, no `subprocess` without `check=True`, no `eval`, no
      unpinned dependencies, no hardcoded secrets — all enforced in CI.

---

## Total work estimate

| Phase | Effort |
|---|---|
| 0. Cleanup & honesty | **Done** |
| 1. Backend skeleton | 4–6 days |
| 2. Real bioinformatics | 5–7 days |
| 3. Conservation (Angle #1) | 3–4 days |
| 4. Citizen-science (Angle #2) | 3–5 days |
| 5. Reproducibility (Angle #3) | 3–4 days |
| 6. Frontend wire-up | 4–6 days |
| 7. Benchmarking | 4–6 days |
| 8. Research paper | 3–6 weeks |
| **Total build** | **~26–38 days of focused solo work** |
| **Total including paper** | **~2–3 months** |

This is tight but realistic for a single motivated builder. The only hard
blockers are waiting for the IUCN token (~3 business days) and the time to
actually run the benchmark datasets end-to-end.
