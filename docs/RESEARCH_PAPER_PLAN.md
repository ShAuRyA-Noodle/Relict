# RESEARCH_PAPER_PLAN — Writing and submitting the eDNA Insights paper

> **Honest framing:** Top-tier venues (Nature Methods, Nature Ecology &
> Evolution) are extremely unlikely for a solo-author side project no matter
> how well-built. What **is** realistic — and still very respectable — is a
> methods paper in a well-regarded ecology/bioinformatics journal. The plan
> below targets those realistically while keeping "stretch" venues in the
> bullpen in case peer review goes better than expected.

---

## 1. The core claim of the paper

**"eDNA Insights is the first open-source platform that unifies conservation
status cross-referencing, reproducible provenance manifests, and citizen-science
submission of DNA-derived occurrences on top of a standard amplicon
bioinformatics pipeline — closing the gap between raw eDNA reads and actionable
biodiversity monitoring without requiring bioinformatics expertise."**

This is a **methods / software paper**, not a biology-finding paper. The
contribution is the platform itself, validated against published studies.

Three pillars of novelty:

1. **The conservation layer.** No existing open tool automatically
   cross-references eDNA detections against IUCN Red List and GBIF on a
   per-run basis. We show that this layer is low-latency, reproducible,
   and improves interpretability for non-specialists.
2. **The provenance manifest.** A signed, hash-verified, fully automated
   manifest for every run — usable as supplementary material in ecology
   papers. We propose a concrete schema and demonstrate byte-identical
   reproducibility.
3. **The citizen-science submission path.** End-to-end automation from
   FASTQ upload to GBIF-compatible Darwin Core Archive — we show the
   produced DwC-A passes GBIF's validator and cites the correct metadata
   fields per the GBIF DNA-derived-data guide.

Each pillar is a genuine gap in the current tooling landscape, defensible
under peer review, and straightforward to demonstrate with real data.

---

## 2. Realistic target venues (ranked)

### Tier A — primary targets (realistic for a solo methods paper)

| Venue | Type | Impact | Why it fits | Notes |
|---|---|---|---|---|
| **Methods in Ecology and Evolution** | Journal | IF ≈ 6.3 | Tailor-made for ecology-oriented software papers. Dedicated "Applications" article type for software tools. | https://besjournals.onlinelibrary.wiley.com/journal/2041210x |
| **Molecular Ecology Resources** | Journal | IF ≈ 7.1 | Premier venue for ecology bioinformatics methods; routinely publishes eDNA tool papers. | https://onlinelibrary.wiley.com/journal/17550998 |
| **Environmental DNA** | Journal | IF ≈ 5.6 | Dedicated to eDNA — perfect topic fit. Younger journal, often faster review. | https://onlinelibrary.wiley.com/journal/26374943 |

### Tier B — very solid backups (also realistic)

| Venue | Type | Impact | Why it fits |
|---|---|---|---|
| **Bioinformatics** (Oxford) | Journal | IF ≈ 5.8 | "Applications Notes" track is ~4 pages, tool-paper-shaped. |
| **GigaScience** | Journal | IF ≈ 9.2 | Open, emphasizes data, reproducibility, and tools. |
| **BMC Bioinformatics** | Journal | IF ≈ 3.2 | Classic tool paper venue, reliable, open-access. |
| **PeerJ Computer Science** / **PeerJ** | Journal | IF ≈ 3.5 | Good for open-science-friendly tool papers. |
| **F1000Research** | Journal | IF ≈ 2.5 | Post-publication peer review, very transparent. |

### Tier C — stretch (only if reviews go unusually well)

| Venue | Why it's a stretch |
|---|---|
| **Nature Methods** | Reserved for genuinely field-changing software. A new pipeline wrapping existing tools is not their fit unless it demonstrates a major empirical advance. |
| **Nature Ecology & Evolution** | Biology-finding-first; a pure methods contribution rarely lands here. |

**My recommendation:** aim at **Methods in Ecology and Evolution** (Tier A).
It's the single best fit for "ecology + software + solo author + open
source." Their Applications article type is 4,000–6,000 words and accepts
GitHub repos and Zenodo DOIs as citeable artifacts.

---

## 3. Paper outline (target: MEE Applications article)

Target length: **~5,000 words** plus figures, plus supplementary.

### Title (working)

> *"eDNA Insights: An open-source, reproducible platform unifying
> environmental DNA analysis, conservation cross-referencing, and
> citizen-science submission."*

### Abstract (~250 words)

1. Problem: eDNA tooling is fragmented, CLI-only, and opaque to
   non-specialists; results rarely ship with conservation context or
   reproducibility guarantees.
2. Contribution: an integrated open-source platform that runs a standard
   QC → denoise → taxonomy → diversity pipeline, attaches automated
   conservation status lookups, produces a signed provenance manifest,
   and generates GBIF-ready Darwin Core Archives.
3. Validation: benchmarked against N published eDNA studies — species
   lists agree at genus level within X %, Shannon indices agree within
   Y %, provenance manifests are byte-reproducible across runs.
4. Availability: MIT-licensed, Dockerized, Zenodo-archived with DOI;
   URL to the GitHub repo.

### 1. Introduction (~800 words)

- eDNA as a biodiversity-monitoring technology and its growth (cite
  Taberlet 2012, Deiner 2017, Beng & Corlett 2020).
- The gap between "raw reads" and "ecological interpretation."
- Existing tools (QIIME2, DADA2, mothur, vsearch, OBITools, Anacapa,
  PEMA, MetaWorks) — they are excellent at the pipeline layer but leave
  conservation interpretation, reproducibility proofs, and
  non-specialist workflows to the user.
- The three gaps this paper addresses: conservation cross-referencing,
  reproducibility manifests, citizen-science submission.
- Contributions bullet list.

### 2. Design principles (~500 words)

The eight principles from `ARCHITECTURE.md` §1, in academic prose:
reproducibility, multi-user concurrency, fail-loud error handling,
worker separation, replaceable components, honest provenance,
deterministic stages, list-arg subprocess safety.

### 3. System architecture (~700 words + Figure 1)

- High-level diagram (a cleaner version of `ARCHITECTURE.md` §2).
- FastAPI + Postgres + Redis + MinIO + RQ worker.
- Pipeline stage pattern (Python function signature + StageResult).
- External API integration with caching.

### 4. The bioinformatics pipeline (~600 words + Figure 2)

Step-by-step walkthrough of the eight stages. This is the least novel
part and should be handled in a short, factual section that acknowledges
all upstream tools and cites their original papers.

### 5. The conservation layer (~700 words + Figure 3)

- The GBIF + IUCN + invasive-species-flag integration.
- Caching and reproducibility under an evolving external API.
- Worked example: a real water sample → detected taxa → conservation
  callouts → PDF report. A screenshot of the generated report goes here.

### 6. The reproducibility manifest (~700 words + Figure 4)

- The manifest schema.
- Signing scheme (ed25519, verifiable from any machine).
- Empirical demonstration: two runs on the same machine and two runs on
  different machines produce identical `manifest_sha256`.
- Comparison to existing provenance approaches in QIIME2 (provenance
  graphs in `.qza`) and Snakemake/Nextflow reports.

### 7. The citizen-science submission workflow (~500 words + Figure 5)

- The guided UI flow.
- Darwin Core Archive generation.
- Validation against the GBIF DwC-A validator.
- Case study: submit one real FASTQ end-to-end in under 10 minutes.

### 8. Benchmarking (~900 words + Figures 6, 7, Table 1)

- The benchmark protocol (see Phase 7 in `MASTER_PLAN.md`).
- Target: reproduce N published eDNA studies (Stoeckle 2017 Hudson fish,
  Leray 2013 COI, an Earth Microbiome Project 16S V4 subset, and one
  MGnify-analyzed 18S study).
- Metrics: species-list Jaccard at genus level, Shannon index tolerance,
  computational wall-time.
- Results table: per-study agreement percentages and failure cases.
- Discussion of where we agree vs. disagree and why.

### 9. Limitations (~300 words)

- eDNA itself has well-known limitations (false negatives, primer bias,
  reference-database gaps). We do not solve these; we only make them
  more visible via provenance.
- The conservation layer depends on external APIs that may change their
  schemas; we mitigate with caching but must be updated per release.
- DADA2 path uses R via subprocess, which makes the worker container
  large; we accept this for accuracy.

### 10. Availability and reproducibility (~150 words)

- GitHub URL, Zenodo DOI, license, Docker image registry, reference data
  sources (linked from `DATASETS.md`).
- Exact commit hash used for the paper's benchmark runs.

### References

Pre-populated bibliography below in §7.

### Supplementary materials

- Full provenance manifest schema (JSON Schema spec)
- Complete benchmark datasets with SRA/ENA accessions
- A set of generated PDF conservation reports (one per benchmark dataset)
- The signed manifests for every benchmark run
- CI workflow showing reproducibility

---

## 4. Writing timeline

| Week | Activity |
|---|---|
| 1 | Finalize outline, build bibliography, start drafting §1–§3 |
| 2 | Draft §4–§6, finalize figures for architecture and conservation layer |
| 3 | Run all benchmarks in their final form, draft §8 |
| 4 | Draft §7, §9, §10, assemble supplementary |
| 5 | Full internal read-through, polish, figure refinement |
| 6 | External read by 1–2 colleagues with eDNA background |
| 7 | Final revisions, submit |
| 8–20 | Review cycle (varies by venue) |

This assumes Phases 1–7 of the build are complete. Writing cannot
meaningfully start until at least Phase 7 (benchmarking) is done,
because the results section needs real numbers.

---

## 5. Figures (target list)

| # | Figure | What it shows | Source |
|---|---|---|---|
| 1 | System architecture diagram | FastAPI + workers + Postgres + MinIO + external APIs | Redrawn from `ARCHITECTURE.md` §2 |
| 2 | Pipeline stage flow | 8-stage pipeline with tools named | Redrawn from `README.md` |
| 3 | Screenshot of conservation report PDF | Real sample, real IUCN callouts, real GBIF overlay | Generated from a real benchmark run |
| 4 | Provenance manifest verification diagram | Hash chain + signature | Hand-drawn |
| 5 | Citizen-science wizard screenshots | 3 panels — upload, metadata form, DwC-A download | Real UI screenshots |
| 6 | Benchmark Jaccard-agreement heat map | per-study, per-genus agreement vs. published | `scripts/benchmark_*.py` outputs |
| 7 | Wall-time benchmark bar chart | our pipeline vs. QIIME2 / DADA2 directly | measured |

---

## 6. What I need from you for the paper

1. **A reference paper (at least 1, ideally 2)** — you offered this in the
   prompt. Pick recent (2021+) methods papers from **Methods in Ecology
   and Evolution** or **Molecular Ecology Resources** about an eDNA or
   amplicon-based tool, and drop them in the repo under
   `docs/reference_papers/` or send me the DOIs. I'll use them as the
   structural / stylistic template.

   Good candidate searches:
   - MEE: "pipeline eDNA" / "metabarcoding" / "amplicon" / "occurrence"
   - MER: "vsearch" / "DADA2" / "ASV" / "taxonomy assignment"
   - Environmental DNA journal homepage — any recent methods paper

2. **Your ORCID** — needed on the title page. Get one free at
   https://orcid.org/ (takes 2 minutes).

3. **Your preferred affiliation** — as a solo independent project, this can
   simply be your name + city + country, or your university affiliation if
   you prefer.

4. **A decision on authorship** — is this a solo-author paper, or do you
   want to invite a domain-expert co-author (e.g., an ecology professor)
   for credibility? Solo is fine and common for software papers.

---

## 7. Core bibliography (to cite)

Grouped by topic. All are real, peer-reviewed, and relevant. Pre-loaded
here so you can drop them into Zotero / Mendeley now.

### eDNA foundations

- Taberlet P., Coissac E., Hajibabaei M., Rieseberg L. H. (2012). *Environmental DNA.* Molecular Ecology 21(8): 1789–1793. https://doi.org/10.1111/j.1365-294X.2012.05542.x
- Deiner K. et al. (2017). *Environmental DNA metabarcoding: Transforming how we survey animal and plant communities.* Molecular Ecology 26(21): 5872–5895. https://doi.org/10.1111/mec.14350
- Beng K. C., Corlett R. T. (2020). *Applications of environmental DNA (eDNA) in ecology and conservation: opportunities, challenges and prospects.* Biodiversity and Conservation 29: 2089–2121.
- Ruppert K. M., Kline R. J., Rahman M. S. (2019). *Past, present, and future perspectives of environmental DNA (eDNA) metabarcoding: A systematic review in methods, monitoring, and applications of global eDNA.* Global Ecology and Conservation 17: e00547.

### Pipelines and tools

- Rognes T., Flouri T., Nichols B., Quince C., Mahé F. (2016). *VSEARCH: a versatile open source tool for metagenomics.* PeerJ 4: e2584. https://doi.org/10.7717/peerj.2584
- Callahan B. J. et al. (2016). *DADA2: High-resolution sample inference from Illumina amplicon data.* Nature Methods 13: 581–583. https://doi.org/10.1038/nmeth.3869
- Bolyen E. et al. (2019). *Reproducible, interactive, scalable and extensible microbiome data science using QIIME 2.* Nature Biotechnology 37: 852–857. https://doi.org/10.1038/s41587-019-0209-9
- Chen S., Zhou Y., Chen Y., Gu J. (2018). *fastp: an ultra-fast all-in-one FASTQ preprocessor.* Bioinformatics 34(17): i884–i890. https://doi.org/10.1093/bioinformatics/bty560
- Martin M. (2011). *Cutadapt removes adapter sequences from high-throughput sequencing reads.* EMBnet.journal 17(1): 10–12.

### Reference databases

- Quast C. et al. (2013). *The SILVA ribosomal RNA gene database project: improved data processing and web-based tools.* Nucleic Acids Research 41(D1): D590–D596. https://doi.org/10.1093/nar/gks1219
- Leray M., Knowlton N., Machida R. J. (2022). *MIDORI2: A collection of quality-controlled, preformatted, and regularly updated reference databases for taxonomic assignment of eukaryotic mitochondrial sequences.* Environmental DNA 4(4): 894–907.
- Iwasaki W. et al. (2013). *MitoFish and MitoAnnotator: A mitochondrial genome database of fish with an accurate and automatic annotation pipeline.* Molecular Biology and Evolution 30(11): 2531–2540.
- Nilsson R. H. et al. (2019). *The UNITE database for molecular identification of fungi: handling dark taxa and parallel taxonomic classifications.* Nucleic Acids Research 47(D1): D259–D264.

### Primers and amplicons

- Miya M. et al. (2015). *MiFish, a set of universal PCR primers for metabarcoding environmental DNA from fishes: detection of more than 230 subtropical marine species.* Royal Society Open Science 2(7): 150088. https://doi.org/10.1098/rsos.150088
- Leray M. et al. (2013). *A new versatile primer set targeting a short fragment of the mitochondrial COI region for metabarcoding metazoan diversity: application for characterizing coral reef fish gut contents.* Frontiers in Zoology 10: 34.

### Diversity metrics and ordination

- McInnes L., Healy J., Melville J. (2018). *UMAP: Uniform Manifold Approximation and Projection for Dimension Reduction.* arXiv:1802.03426. https://arxiv.org/abs/1802.03426
- Campello R. J. G. B., Moulavi D., Sander J. (2013). *Density-Based Clustering Based on Hierarchical Density Estimates.* PAKDD 2013.
- Faith D. P. (1992). *Conservation evaluation and phylogenetic diversity.* Biological Conservation 61(1): 1–10.

### Biodiversity data infrastructure

- GBIF Secretariat. (2023). *Publishing DNA-derived data through biodiversity data platforms.* https://docs.gbif.org/publishing-dna-derived-data/en/
- Robertson T. et al. (2014). *The GBIF Integrated Publishing Toolkit: Facilitating the efficient publishing of biodiversity data on the internet.* PLoS ONE 9(8): e102623.
- IUCN Red List of Threatened Species. https://www.iucnredlist.org/

### Case studies (for benchmarking)

- Stoeckle M. Y., Soboleva L., Charlop-Powers Z. (2017). *Aquatic environmental DNA detects seasonal fish abundance and habitat preference in an urban estuary.* PLoS ONE 12(4): e0175186.
- Thompson L. R. et al. (2017). *A communal catalogue reveals Earth's multiscale microbial diversity.* Nature 551: 457–463.

---

## 8. Preregistration (optional but recommended)

Consider submitting a **preregistration** of the benchmark protocol to OSF
(https://osf.io/) before running Phase 7 benchmarks. This locks in the
tolerances and success criteria before we see the results, which is a
strong credibility signal in peer review. Costs nothing, takes an afternoon.

---

## 9. What success looks like

A realistic, respectable outcome:

- Submitted to MEE or MER within ~3 months of build completion.
- Review cycle: 3–6 months typical.
- Outcome: "accept with minor revisions" or "reject-and-resubmit with
  major revisions" — either is a positive signal for a first submission.
- Post-publication: Zenodo DOI cited, paper cited by downstream eDNA
  studies, the repo becomes the canonical "reproducible eDNA platform"
  in its niche.

A long-shot outcome would be Nature Methods or Nature Ecology & Evolution;
those are possible but unlikely and should not drive the build.

The plan is sized so that even the **realistic** outcome represents a
legitimate, citable, scientifically valuable contribution — and a portfolio
piece that reviewers at any lab or company will take seriously.
