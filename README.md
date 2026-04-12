# Relict

*/ˈrelɪkt/ — a trace of something no longer present.*

> **Reproducible environmental DNA analysis with conservation-status cross-referencing and signed provenance — open source, no mock data, no fabricated metrics.**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Benchmark: 10/10](https://img.shields.io/badge/Benchmark-10%2F10%20Pass-brightgreen)](./docs/benchmarks/)

---

## What This Is

**Relict** is an open-source, full-stack platform that takes raw environmental DNA (eDNA) sequencing reads and produces:

- **Real ASVs** — amplicon sequence variants inferred by fastp + vsearch UNOISE3
- **Real taxonomy** — assigned against SILVA 138.1 (436K sequences) and MIDORI2 GenBank 269 (1.8M sequences)
- **Real conservation status** — every detected species cross-referenced against GBIF (occurrence data) and the IUCN Red List (EN/VU/CR/LC categories)
- **Real diversity metrics** — Shannon, Simpson, Chao1, richness, evenness computed by scikit-bio
- **Signed provenance manifests** — input hashes, tool versions, DB versions, output hashes, SHA256 signature
- **GBIF-ready exports** — Darwin Core Archive, CSV, BIOM 2.1.0 format

Six amplicon markers supported: 16S V4, 12S MiFish, COI Leray, 18S V9, rbcL, ITS2.

**No mock data. No fabricated numbers. Every result is computed from real input by real, published, open-source bioinformatics tools.**

---

## Quick Start

### Prerequisites
- Docker Desktop (Engine ≥ 24, Compose ≥ 2.20)
- Node.js ≥ 18
- ~20 GB free disk space

### 1. Clone and set up
```bash
git clone https://github.com/ShAuRyA-Noodle/Bad-Omens.git
cd Bad-Omens
npm install
```

### 2. Configure the backend
```bash
cd backend
cp .env.example .env
# Edit .env — fill in POSTGRES_PASSWORD, MINIO_SECRET_KEY, JWT_SECRET
```

### 3. Download reference databases
```bash
python scripts/download_references.py
```
This fetches SILVA 138.1 (~660 MB) and verifies SHA256. MIDORI2 COI + 12S can be downloaded separately.

### 4. Start everything
```bash
# Backend (6 containers: API + worker + Postgres + Redis + MinIO + Adminer)
docker compose up --build -d
docker compose exec api alembic upgrade head

# Frontend
cd .. && npm run dev
```

### 5. Open
- **Frontend:** http://localhost:8080
- **API docs:** http://localhost:8000/docs
- **DB admin:** http://localhost:8081

---

## The Pipeline

```
FASTQ upload
   │
   ▼
[1] QC & trimming        — fastp 0.24.0
   │
   ▼
[2] Dereplication         — vsearch 2.28.1
   │
   ▼
[3] ASV inference         — vsearch UNOISE3
   │
   ▼
[4] Taxonomy assignment   — vsearch vs SILVA 138.1 / MIDORI2 GB269
   │
   ▼
[5] Conservation          — GBIF Species API + IUCN Red List (via GBIF)
   │
   ▼
[6] Diversity metrics     — scikit-bio (Shannon, Simpson, Chao1, evenness)
   │
   ▼
[7] Ordination            — UMAP + HDBSCAN
   │
   ▼
[8] Provenance manifest   — SHA256 signature, all tool versions recorded
   │
   ▼
Interactive dashboard + DwC-A / CSV / BIOM exports
```

---

## Benchmarks

### Synthetic (5 known species, equal abundance)
| Check | Expected | Actual | Status |
|---|---|---|---|
| ASV count | 5 | 5 | ✅ |
| Shannon | ln(5) = 1.6094 | 1.6094 | ✅ |
| Simpson | 0.8 | 0.8 | ✅ |
| Evenness | 1.0 | 1.0 | ✅ |
| GBIF resolution | ≥3/5 | 5/5 | ✅ |
| **Total** | | | **10/10** |

### Real SRA dataset (ERR2283086, 45K Illumina reads)
| Metric | Value |
|---|---|
| ASVs detected | 51 |
| Taxonomy assigned | 100% |
| Pipeline runtime | 3.6 minutes |
| Phyla detected | 3 |

Full reports: [`docs/benchmarks/`](./docs/benchmarks/)

---

## Tech Stack

**Frontend:** React 18.3, TypeScript 5.8, Vite 5.4, Tailwind CSS, shadcn/ui, React Query, Three.js

**Backend:** Python 3.11, FastAPI, SQLAlchemy 2.0 (async), PostgreSQL 16, Redis 7, MinIO, RQ

**Bioinformatics:** fastp 0.24.0, vsearch 2.28.1, scikit-bio 0.6.2, umap-learn 0.5.7, hdbscan 0.8.40, BioPython 1.84

**Reference DBs:** SILVA 138.1 SSU NR99 (436K seqs), MIDORI2 GenBank 269 COI (1.8M seqs), MIDORI2 12S (194K seqs)

---

## Project Structure

```
Bad-Omens/
├── src/                    # React frontend
│   ├── components/         # UI components (all wired to real API)
│   ├── pages/              # Routes: Index, Demo, JobResults, Profile, etc.
│   ├── hooks/              # useAuth, custom hooks
│   └── lib/                # api.ts (typed API client), utils
├── backend/                # FastAPI + worker
│   ├── app/                # API server (routes, schemas, services, models)
│   ├── worker/             # RQ worker + pipeline stages
│   │   └── pipeline/       # qc, dereplicate, denoise, taxonomy, conservation,
│   │                       # diversity, ordination, provenance
│   ├── scripts/            # download_references.py, benchmark.py
│   ├── data/               # Reference DBs + demo datasets (gitignored)
│   ├── tests/              # Unit + integration tests
│   ├── docker-compose.yml
│   └── Dockerfile*
├── docs/
│   ├── paper/              # LaTeX research paper (MEE format)
│   ├── benchmarks/         # Benchmark reports
│   ├── MASTER_PLAN.md
│   ├── ARCHITECTURE.md
│   └── DATASETS.md
└── CITATION.cff
```

---

## Research Paper

A complete research paper targeting **Methods in Ecology and Evolution** (APPLICATION track) is available at [`docs/paper/relict_paper.tex`](./docs/paper/relict_paper.tex).

---

## Citation

```bibtex
@software{punj2026relict,
  author  = {Punj, Shaurya},
  title   = {Relict: A Reproducible Environmental DNA Analysis Platform},
  year    = {2026},
  url     = {https://github.com/ShAuRyA-Noodle/Bad-Omens},
  license = {MIT}
}
```

---

## Author

**Shaurya Punj** — [ORCID: 0009-0000-7351-0237](https://orcid.org/0009-0000-7351-0237)

Independent open-source project. MIT license.
