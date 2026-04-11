# DATASETS — Reference databases and demo data

> Everything in this document is real, public, and downloadable today. The
> platform **never ships with synthetic or fabricated biological data**.
> All reference databases and demo datasets come from established
> peer-reviewed sources and will be fetched by version-pinned scripts.
>
> **Shaurya:** you do not need to manually download anything from this file.
> When we get to Phase 2, `make download-dbs` and `make download-demo` will
> do it. This document exists so that every URL is auditable and recorded
> for the research paper's Data Availability section.

---

## Legend

- **License note** is a short human summary — always check the upstream
  license before redistributing. This platform downloads on demand and
  does **not** re-host reference databases.
- **SHA256** columns are left as `(filled in by downloader on first fetch)`
  because upstream releases update their files; the downloader script
  verifies against a pinned checksum it writes on first download, and
  future runs compare against that.

---

## 1. Reference databases

### 1.1 SILVA 138.1 SSU Ref NR99 (16S / 18S)

Curated small-subunit (16S / 18S) rRNA reference. The default for bacterial,
archaeal, and eukaryotic 18S taxonomy assignment.

| Field | Value |
|---|---|
| **Version** | 138.1 (released 2020-08, still the current stable release as of 2026) |
| **Homepage** | https://www.arb-silva.de/ |
| **Download page** | https://www.arb-silva.de/download/archive/ |
| **Direct FASTA (nr99)** | https://data.arb-silva.de/release_138_1/Exports/SILVA_138.1_SSURef_NR99_tax_silva.fasta.gz |
| **Taxonomy** | https://data.arb-silva.de/release_138_1/Exports/taxonomy/tax_slv_ssu_138.1.txt.gz |
| **Size (compressed)** | ~1.5 GB |
| **Size (decompressed)** | ~5.5 GB |
| **License note** | SILVA is free for **academic and non-commercial** use. Commercial users must contact Ribocon GmbH. See https://www.arb-silva.de/silva-license-information/ |
| **Citation** | Quast C. et al. (2013). *The SILVA ribosomal RNA gene database project: improved data processing and web-based tools.* Nucleic Acids Res. 41(D1): D590–D596. |

**QIIME2 pre-formatted alternative** (smaller and ready to use with QIIME2
classifiers — good for benchmarking):

- https://data.qiime2.org/2024.10/common/silva-138-99-seqs.qza
- https://data.qiime2.org/2024.10/common/silva-138-99-tax.qza

---

### 1.2 MIDORI2 (COI for eukaryotes / invertebrates)

Quality-controlled, preformatted mitochondrial reference database for
metabarcoding of eukaryotes, updated quarterly.

| Field | Value |
|---|---|
| **Version** | GenBank 263 (or latest — `download_references.sh` will pin whichever release is current at first run) |
| **Homepage** | https://www.reference-midori.info/ |
| **Download page** | https://www.reference-midori.info/download.php |
| **Example direct (GB263 COI unique, RAW)** | https://reference-midori.info/download/Databases/GenBank263/RAW/uniq/MIDORI2_UNIQ_NUC_GB263_CO1_RAW.fasta.gz |
| **Size (compressed)** | ~500 MB – 1.5 GB depending on filter level |
| **License note** | CC-BY 4.0 — free to use with citation. |
| **Citation** | Leray M., Knowlton N., Machida R. J. (2022). *MIDORI2: A collection of quality-controlled, preformatted, and regularly updated reference databases for taxonomic assignment of eukaryotic mitochondrial sequences.* Environmental DNA 4(4): 894–907. |

**Note:** MIDORI2 provides files for several mitochondrial markers
(CO1, CO2, CO3, Cytb, 12S, 16S, ND1–ND6, ATP6, ATP8). `download_references.sh`
will fetch CO1 and 12S by default; others are opt-in via a flag.

---

### 1.3 MitoFish (12S — fish-specific)

Specialized fish mitochondrial reference database, essential for MiFish 12S
eDNA studies of vertebrate aquatic biodiversity.

| Field | Value |
|---|---|
| **Homepage** | https://mitofish.aori.u-tokyo.ac.jp/ |
| **Download page** | https://mitofish.aori.u-tokyo.ac.jp/download/ |
| **Direct (complete + partial mitogenomes zip)** | https://mitofish.aori.u-tokyo.ac.jp/files/complete_partial_mitogenomes.zip |
| **Size** | ~50–150 MB |
| **License note** | Free for academic use; see the site's terms. |
| **Citation** | Iwasaki W. et al. (2013). *MitoFish and MitoAnnotator: a mitochondrial genome database of fish with an accurate and automatic annotation pipeline.* Molecular Biology and Evolution 30(11): 2531–2540. |

---

### 1.4 UNITE (ITS — fungi)

Reference database for internal transcribed spacer (ITS) based fungal
identification — included for optional fungal eDNA workflows.

| Field | Value |
|---|---|
| **Homepage** | https://unite.ut.ee/ |
| **Download page** | https://unite.ut.ee/repository.php |
| **License note** | CC-BY-SA 4.0. |
| **Citation** | Nilsson R. H. et al. (2019). *The UNITE database for molecular identification of fungi: handling dark taxa and parallel taxonomic classifications.* Nucleic Acids Research 47(D1): D259–D264. |

---

### 1.5 Global Invasive Species Database (curated subset)

For the "invasive species flag" in conservation reports. A small, curated
JSON list sourced from GISD, kept under version control (it's legal
classification data, not biological data).

| Field | Value |
|---|---|
| **Source** | http://www.iucngisd.org/gisd/ |
| **Format** | `backend/data/references/invasive_species.json` — committed to the repo |
| **Update policy** | Refreshed manually before each tagged release; update process documented in `docs/INVASIVE_LIST_UPDATE.md` (to be written in Phase 3) |
| **License note** | GISD data is free for non-commercial use with attribution; we only cache species names and their invasiveness flags, not the full GISD records. |

---

## 2. Real public demo datasets

At least five real, citable demo datasets will be fetched by
`backend/scripts/download_demo_datasets.sh`. Every dataset has a published
paper, an SRA/ENA accession, and a known expected output used in the
integration tests.

### 2.1 MiFish 12S fish eDNA — Hudson River (Stoeckle et al. 2017)

| Field | Value |
|---|---|
| **BioProject** | PRJNA390695 |
| **Paper** | Stoeckle M. Y., Soboleva L., Charlop-Powers Z. (2017). *Aquatic environmental DNA detects seasonal fish abundance and habitat preference in an urban estuary.* PLoS ONE 12(4): e0175186. |
| **Paper link** | https://doi.org/10.1371/journal.pone.0175186 |
| **SRA portal** | https://www.ncbi.nlm.nih.gov/bioproject/PRJNA390695 |
| **Marker** | 12S MiFish |
| **Why it's useful** | Real water samples with a published species list — perfect for benchmarking fish eDNA workflows. |

### 2.2 COI invertebrate metabarcoding — Leray et al. 2013

| Field | Value |
|---|---|
| **Paper** | Leray M. et al. (2013). *A new versatile primer set targeting a short fragment of the mitochondrial COI region for metabarcoding metazoan diversity: application for characterizing coral reef fish gut contents.* Frontiers in Zoology 10: 34. |
| **Paper link** | https://doi.org/10.1186/1742-9994-10-34 |
| **Marker** | COI (Leray primers) |
| **Why it's useful** | Foundational COI primer design; several downstream studies re-use these reads and have published ASV tables we can compare against. |

### 2.3 16S V4 microbial eDNA — Earth Microbiome Project

| Field | Value |
|---|---|
| **Consortium** | Earth Microbiome Project (https://earthmicrobiome.org/) |
| **Paper** | Thompson L. R. et al. (2017). *A communal catalogue reveals Earth's multiscale microbial diversity.* Nature 551: 457–463. |
| **Paper link** | https://doi.org/10.1038/nature24621 |
| **Data portal** | https://earthmicrobiome.org/data-and-code/ |
| **Marker** | 16S rRNA V4 |
| **Why it's useful** | The canonical reference dataset for microbial metabarcoding; QIIME2's own tutorials use subsets. |

### 2.4 eDNA marine fish biodiversity — Miya et al. 2015 MiFish paper

| Field | Value |
|---|---|
| **Paper** | Miya M. et al. (2015). *MiFish, a set of universal PCR primers for metabarcoding environmental DNA from fishes: detection of more than 230 subtropical marine species.* Royal Society Open Science 2(7): 150088. |
| **Paper link** | https://doi.org/10.1098/rsos.150088 |
| **Why it's useful** | The foundational MiFish paper — essential citation, test dataset for the 12S MiFish preset. |

### 2.5 Freshwater eDNA biodiversity — any ENA study with MGnify analysis

MGnify publishes already-analyzed environmental metagenomic studies. We will
pick one study with a published 18S or 16S eDNA analysis and use it as a
"compare against MGnify's own output" benchmark.

| Field | Value |
|---|---|
| **Portal** | https://www.ebi.ac.uk/metagenomics/ |
| **Selection criteria** | Public 16S or 18S amplicon study with < 100 samples and a published QIIME2 or DADA2 output we can diff against |
| **Why it's useful** | Having MGnify's own output as ground truth gives us a direct, rigorous benchmark — if we disagree with MGnify by more than tolerance, one of us has a bug. |

A specific MGnify study will be pinned in `backend/scripts/download_demo_datasets.sh`
once Phase 2 starts.

---

## 3. Tools (not data, but also version-pinned here)

These are the binaries the worker container installs. Every version is
pinned in `backend/Dockerfile.worker`.

| Tool | Pinned version | Purpose | Homepage |
|---|---|---|---|
| fastp | 0.24.0 | QC + trimming | https://github.com/OpenGene/fastp |
| vsearch | 2.28.1 | Dereplication, ASV inference, alignment | https://github.com/torognes/vsearch |
| cutadapt | 4.9 | Optional primer trimming | https://cutadapt.readthedocs.io/ |
| DADA2 (R) | 1.30.0 | Accuracy-path ASV inference | https://benjjneb.github.io/dada2/ |
| BioPython | 1.84 | FASTA/FASTQ IO in Python | https://biopython.org/ |
| scikit-bio | 0.6.0 | Alpha/beta diversity metrics | https://scikit.bio/ |
| umap-learn | 0.5.6 | Ordination | https://umap-learn.readthedocs.io/ |
| hdbscan | 0.8.40 | Density-based clustering | https://hdbscan.readthedocs.io/ |
| biom-format | 2.1.16 | BIOM export | http://biom-format.org/ |
| QIIME 2 | 2024.10 (CLI only, for export + benchmark) | QIIME2 artifact export + benchmarking | https://qiime2.org/ |

---

## 4. Disk budget summary

| Item | Approx disk usage |
|---|---|
| SILVA 138.1 SSU NR99 | ~5.5 GB (decompressed FASTA + vsearch UDB) |
| MIDORI2 CO1 + 12S | ~2.0 GB |
| MitoFish | ~150 MB |
| UNITE (optional, fungal) | ~500 MB |
| Demo datasets (5 studies) | ~5 GB |
| Cached GBIF/IUCN responses | < 100 MB |
| Docker images (api + worker) | ~3 GB |
| Postgres + Redis + MinIO volumes | ~2 GB (grows with jobs) |
| **Total recommended free** | **~18–20 GB** |

---

## 5. What you (Shaurya) should do before Phase 2

Nothing. All downloads are automated — you just need to make sure ~20 GB
free disk and a working internet connection are available when you run
`make download-dbs`. The script will verify SHA256 of everything on first
download, pin the checksum, and re-verify on subsequent runs.

The only items you need to obtain manually are the API keys in
[`API_KEYS.md`](./API_KEYS.md) — and most of those are optional for Phase 2
(they become mandatory for Phase 3).
