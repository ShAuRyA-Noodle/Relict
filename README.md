# eDNA Insights

> **Reproducible environmental DNA analysis with conservation-status cross-referencing and signed provenance — open source, no mock data, no fabricated metrics.**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Status: Active Rebuild](https://img.shields.io/badge/Status-Active%20Rebuild-orange)](./docs/MASTER_PLAN.md)

---

## ⚠️ Status: Active Rebuild

This repository is being rebuilt from the ground up into a production-grade,
publication-ready eDNA analysis platform. The frontend shell is in place; the
backend bioinformatics pipeline is being fully reimplemented from scratch
against real reference databases and real public datasets.

For the full transformation plan, see [`docs/MASTER_PLAN.md`](./docs/MASTER_PLAN.md).

**What is real today:** the React/TypeScript frontend, the project structure,
and the complete set of planning documents in [`docs/`](./docs/).

**What is actively being rebuilt:** the bioinformatics pipeline, persistence
layer, job queue, conservation cross-referencing layer, and citizen-science
submission workflow.

**What will never be in this repo:** mock data, fabricated accuracy numbers,
fake species lists, synthetic benchmarks, or AI-generated "results" that were
not computed from real input.

---

## 🎯 What This Project Is

**eDNA Insights** is an open-source platform for turning raw environmental DNA
sequencing reads into scientifically auditable biodiversity insights. It
unifies three use cases that today require three separate stacks:

1. **🛡️ Conservation reporting** — Upload a water/soil/sediment sample, get a
   plain-language report that cross-references every detected taxon against
   [GBIF occurrences](https://www.gbif.org/) and the
   [IUCN Red List](https://www.iucnredlist.org/), with a clear
   "protected / threatened / invasive" call-out.

2. **🧑‍🌾 Citizen-science eDNA** — Lower the barrier for schools, NGOs, divers,
   and field teams to contribute eDNA observations. Pre-built pipelines for
   the common amplicons (12S MiFish for fish, COI for invertebrates, 16S/18S
   for microbial/eukaryotic communities, rbcL for plants). Optional one-click
   submission to [GBIF as a DNA-derived occurrence record](https://docs.gbif.org/publishing-dna-derived-data/en/).

3. **📜 Reproducible research notebooks** — Every analysis run produces a
   signed provenance manifest (input SHA256, tool versions, reference-DB
   version, parameters, output hashes, container digest) suitable as
   supplementary material in a peer-reviewed paper. Outputs are
   [BIOM](https://biom-format.org/)- and
   [QIIME2](https://qiime2.org/)-compatible.

---

## 🔬 Scientific Background

**Environmental DNA (eDNA)** is genetic material shed by organisms into their
environment — water, soil, air, sediment. Sequencing it lets researchers
detect species presence without capturing or even seeing the organisms.
eDNA is especially powerful for:

- Monitoring biodiversity at scale, continuously, non-invasively
- Detecting rare, cryptic, nocturnal, or elusive species
- Early detection of invasive species
- Tracking ecosystem responses to climate change and habitat change
- Assessing the health of aquatic, soil, and marine ecosystems

The challenge: raw eDNA reads are useless without a long, error-prone
bioinformatics pipeline. Existing tools (QIIME2, DADA2, vsearch, mothur,
OBITools) are powerful but fragmented, CLI-only, and opaque to non-specialists.
eDNA Insights integrates them into a single reproducible, auditable platform
with a usable interface and first-class conservation cross-referencing.

---

## 🧬 The Pipeline (target architecture)

```
FASTQ upload
   │
   ▼
[1] QC & trimming        — fastp
   │
   ▼
[2] Dereplicate / denoise — vsearch (fast path) or DADA2 (accuracy path)
   │
   ▼
[3] ASV table            — exact amplicon sequence variants
   │
   ▼
[4] Taxonomy assignment  — vsearch --usearch_global vs.
                            SILVA 138.1 (16S/18S)
                            MIDORI2     (COI)
                            MitoFish    (12S)
   │
   ▼
[5] Diversity metrics    — scikit-bio
                            Shannon, Simpson, Chao1, Faith's PD,
                            Bray-Curtis, UniFrac, rarefaction
   │
   ▼
[6] Ordination & clustering — UMAP + HDBSCAN on ASV abundance
   │
   ▼
[7] Conservation layer   — GBIF Species API
                            IUCN Red List API
                            Invasive Species Compendium flags
   │
   ▼
[8] Provenance manifest  — signed JSON: input hash, tool versions,
                            DB version, parameters, output hashes,
                            container digest, timestamp
   │
   ▼
Interactive dashboard + PDF/HTML report + BIOM/QIIME2 export
```

Every step is a real, published, open-source tool. Nothing above is mocked.
When a step is not yet wired, the backend fails loudly with a clear error —
it does not return fabricated numbers.

---

## 🛠️ Tech Stack

**Frontend**
- React 18.3, TypeScript 5.8, Vite 5.4
- Tailwind CSS 3.4, shadcn/ui, Radix primitives, Framer Motion
- Recharts (dashboards), Leaflet (maps), React Query, React Router

**Backend (being rebuilt)**
- Python 3.11+, FastAPI, Pydantic v2, Uvicorn
- PostgreSQL 16 (metadata, ASVs, taxa, provenance)
- Redis + RQ (job queue, progress streaming)
- MinIO / S3-compatible object storage (raw FASTQs + outputs)
- Docker Compose (single-command dev environment)

**Bioinformatics & ML**
- fastp, vsearch, DADA2 (R), BioPython
- scikit-bio (diversity metrics)
- umap-learn, hdbscan (ordination & clustering)
- cutadapt (optional primer trimming)

**Reference databases (version-pinned, auto-downloaded)**
- [SILVA 138.1 SSURef NR99](https://www.arb-silva.de/download/archive/) — 16S/18S
- [MIDORI2](https://www.reference-midori.info/) — COI
- [MitoFish](https://mitofish.aori.u-tokyo.ac.jp/) — 12S fish barcodes

---

## 📦 Installation

> The installation path below reflects the **target** architecture being built.
> During the active rebuild, expect some pieces to be absent from the
> `backend/` directory — follow [`docs/MASTER_PLAN.md`](./docs/MASTER_PLAN.md)
> for the live status of each phase.

### Prerequisites

- Node.js ≥ 18
- Python ≥ 3.11
- Docker & Docker Compose ≥ v2 (for backend + databases + queue)
- ~10 GB free disk for reference databases

### Frontend

```bash
npm install
npm run dev         # http://localhost:5173
```

### Backend (once Phase 1 lands)

```bash
cd backend
docker compose up --build
```

This brings up: FastAPI + Postgres + Redis + MinIO + an RQ worker container
with all the bioinformatics tools pre-installed.

### Reference databases

```bash
make download-dbs   # version-pinned downloads with SHA verification
```

See [`docs/DATASETS.md`](./docs/DATASETS.md) for working download URLs,
checksums, sizes, and license notes for every reference database and demo
dataset.

### API keys (optional but recommended)

See [`docs/API_KEYS.md`](./docs/API_KEYS.md) for the full list. Minimum
recommended: a free [IUCN Red List API](https://apiv3.iucnredlist.org/) token
and an [NCBI Entrez](https://www.ncbi.nlm.nih.gov/account/) API key.

---

## 📁 Project Structure

```
The-Chainsmokers/
├── src/                   # React + TypeScript frontend (real, working)
├── backend/               # FastAPI + worker + pipeline (being rebuilt)
├── docs/                  # Design & planning documents (real, canonical)
│   ├── MASTER_PLAN.md
│   ├── ARCHITECTURE.md
│   ├── DATASETS.md
│   ├── API_KEYS.md
│   └── RESEARCH_PAPER_PLAN.md
├── dump/                  # Trash from the old implementation (to be deleted)
├── public/
├── package.json
└── README.md
```

---

## 🗺️ Roadmap

See [`docs/MASTER_PLAN.md`](./docs/MASTER_PLAN.md) for the full, honest,
phase-by-phase plan. Short version:

- **Phase 0** — Repo cleanup, honest README, planning docs *(in progress)*
- **Phase 1** — Real backend: FastAPI + Postgres + Redis + MinIO + job queue
- **Phase 2** — Real bioinformatics pipeline (fastp → vsearch/DADA2 → SILVA/MIDORI2/MitoFish → scikit-bio)
- **Phase 3** — Conservation layer (GBIF + IUCN Red List + invasive flags)
- **Phase 4** — Frontend wired to real data, interactive maps, UMAP scatter, reports
- **Phase 5** — Citizen-science submission to GBIF, reproducibility manifests
- **Phase 6** — Benchmarking, validation, and the research paper

---

## 🧪 Reproducibility

Every analysis run produces a `provenance.json` with:

- SHA256 of every input file
- Exact versions of fastp, vsearch, DADA2, scikit-bio, umap-learn, hdbscan
- Exact version/commit of every reference database used
- All pipeline parameters as a single hash
- SHA256 of every output file
- Container digest (if run inside Docker)
- UTC timestamp and pipeline git commit

This manifest is the single source of truth for the run. It can be attached to
a paper as supplementary material and used to reproduce the exact result on
another machine.

---

## 📚 References & Further Reading

See [`docs/RESEARCH_PAPER_PLAN.md`](./docs/RESEARCH_PAPER_PLAN.md) for the
full bibliography the paper will cite. Core foundational works:

- Rognes et al. (2016). *VSEARCH: a versatile open source tool for metagenomics.* PeerJ 4:e2584.
- Callahan et al. (2016). *DADA2: High-resolution sample inference from Illumina amplicon data.* Nature Methods 13, 581–583.
- Quast et al. (2013). *The SILVA ribosomal RNA gene database project.* Nucleic Acids Res. 41(D1).
- Leray et al. (2022). *MIDORI2: A collection of quality-controlled, preformatted, and regularly updated reference databases for taxonomic assignment of eukaryotic mitochondrial sequences.* Environmental DNA 4(4).
- Miya et al. (2015). *MiFish, a set of universal PCR primers for metabarcoding environmental DNA from fishes.* Royal Society Open Science 2(7).
- McInnes et al. (2018). *UMAP: Uniform Manifold Approximation and Projection.* arXiv:1802.03426.
- Campello et al. (2013). *Density-based clustering based on hierarchical density estimates.* PAKDD.
- Taberlet et al. (2012). *Environmental DNA.* Molecular Ecology 21(8).

---

## 🤝 Contributing

This is a solo-maintained personal research project. Issues and pull requests
are welcome, especially around: additional reference databases, new amplicon
markers, validation against published studies, and documentation.

---

## 📄 License

MIT — see [`LICENSE`](./LICENSE).

Reference databases and upstream tools are each governed by their own
licenses; see [`docs/DATASETS.md`](./docs/DATASETS.md) for details.

---

## 👨‍💻 Author

**Shaurya Punj** — independent developer and researcher.
GitHub: [@ShAuRyA-Noodle](https://github.com/ShAuRyA-Noodle)

This is an independent open-source project — no institutional affiliation,
no external funding, no external mandate. Built because the current state of
eDNA tooling deserves better.
