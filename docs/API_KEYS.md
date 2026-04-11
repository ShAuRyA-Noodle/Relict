# API_KEYS — What you need to obtain, and how

> This is the **only** file in the repository that requires manual action
> from you (Shaurya). Everything else in the rebuild — reference
> databases, demo datasets, Docker images, Python/Node packages — is
> fetched automatically.
>
> Fill in your keys in `backend/.env` (never commit this file). A template
> lives in `backend/.env.example`.

---

## TL;DR — minimum to run each phase

| Phase | Required keys | Optional keys |
|---|---|---|
| Phase 1 (backend skeleton) | *none* | *none* |
| Phase 2 (bioinformatics pipeline) | *none* | NCBI Entrez API key (rate-limit boost) |
| **Phase 3 (conservation layer)** | **IUCN Red List token**, GBIF account | NCBI Entrez API key |
| Phase 4 (citizen-science submission) | GBIF account | GBIF IPT credentials (if auto-publishing) |
| Phase 5 (reproducibility) | *none* | Zenodo sandbox token (for DOI testing) |
| Phase 6+ | same as above | — |

**Minimum to start:** nothing. You can build and test Phase 1 + Phase 2 with
zero external keys. You'll need the IUCN token for Phase 3 (~1–3 business
days to arrive), so **request it today** even though we won't use it for a
while.

---

## 1. IUCN Red List API (🚨 mandatory for Angle #1)

The IUCN Red List is the authoritative global conservation-status database.
We need a free token to fetch per-species conservation categories
(LC, NT, VU, EN, CR, EW, EX).

### How to get it

1. Go to https://apiv3.iucnredlist.org/api/v3/token
2. Fill in the form:
   - Name, email, organization
   - **Application name:** "Relict — open-source reproducible eDNA analysis platform"
   - **Intended use:** "Cross-referencing species detected in environmental DNA samples against their IUCN Red List conservation status, for biodiversity monitoring and conservation reporting. Open-source research tool."
3. Submit. You'll receive a token by email within **1–3 business days**
   (IUCN reviews manually).
4. Paste into `backend/.env` as:
   ```
   IUCN_REDLIST_TOKEN=<your token>
   ```

### Rate limit and terms

- Free for non-commercial use.
- Rate limit: no published hard cap, but the IUCN API is rate-sensitive —
  we will cache every response in Postgres with a 30-day TTL so we call
  the API at most once per species per month.
- Terms: https://www.iucnredlist.org/terms/terms-of-use

### What it unlocks

- Conservation status callouts in the PDF report (`ConservationPanel.tsx`)
- "Protected / Threatened / Critically Endangered" badges in the frontend
- Paper-quality conservation statistics tables
- The entire Angle #1 (conservation reporting) story

---

## 2. GBIF account (recommended for all phases)

GBIF (Global Biodiversity Information Facility) gives us:
- **Species API** — authoritative species-name resolution and GBIF taxon keys
- **Occurrence API** — historical occurrence records within a geographic radius
- **IPT (Integrated Publishing Toolkit)** — for Angle #2 (citizen-science
  submission of DNA-derived occurrence records)

### How to get it

1. Go to https://www.gbif.org/user/profile
2. Click "Register". Email + password only; no approval needed.
3. Confirm your email.
4. Paste credentials into `backend/.env` as:
   ```
   GBIF_USERNAME=<your username>
   GBIF_PASSWORD=<your password>
   GBIF_EMAIL=<your email>
   ```

### Rate limits and terms

- Species and Occurrence APIs are **free and unauthenticated** for reads —
  the account is only needed for write operations (dataset creation,
  IPT publishing) and for attribution in downloaded datasets.
- Rate limit: roughly 10 requests/second for anonymous reads. Cached.
- Terms: https://www.gbif.org/terms

### What it unlocks

- Historical species-occurrence overlay on the sample map
- Species name resolution (matches your detected species to the GBIF
  taxonomic backbone, which every ecology paper uses)
- The Angle #2 citizen-science GBIF submission workflow (Phase 4)

---

## 3. NCBI Entrez API key (optional but recommended)

NCBI provides the Entrez Programming Utilities (E-utilities) for querying
GenBank, PubMed, taxonomy, and the SRA. Useful for:
- Fetching additional reference sequences
- Resolving ambiguous taxonomy calls
- Downloading SRA datasets for benchmarking (Phase 7)

### How to get it

1. Sign in or create an account at https://www.ncbi.nlm.nih.gov/account/
2. Go to **Settings → API Key Management**
3. Click "Create an API Key". Instant, free.
4. Paste into `backend/.env` as:
   ```
   NCBI_API_KEY=<your key>
   NCBI_EMAIL=<your email>
   ```
   (NCBI requires an email for Entrez queries even without a key.)

### Rate limits and terms

- Without a key: 3 requests/second
- **With a key: 10 requests/second**
- Terms: https://www.ncbi.nlm.nih.gov/home/about/policies/

### What it unlocks

- Faster benchmark dataset downloads (Phase 7)
- Secondary taxonomy resolution paths
- No behavior change for a normal analysis run

---

## 4. Zenodo Sandbox token (optional — for Phase 5 DOI testing)

Zenodo gives us free DOIs for GitHub releases, which lets users cite a
specific version of the pipeline. The integration is automatic via
GitHub's Zenodo webhook for **real releases**. The **sandbox** token is
only needed if we want to test the integration without burning real DOIs.

### How to get it

1. Go to https://sandbox.zenodo.org/account/settings/applications/
2. Click "New token" → give it `deposit:write` scope.
3. Paste into `backend/.env` as:
   ```
   ZENODO_SANDBOX_TOKEN=<your token>
   ```

### What it unlocks

- Automated DOI testing in Phase 5
- Real DOIs are free and automatic once we tag `v0.1.0` in GitHub and
  connect the repo to Zenodo (no token required for the real flow)

---

## 5. Optional: OpenAI / Anthropic API key

**We do not use LLMs anywhere in the bioinformatics pipeline.** No AI
"enhancements," no LLM-generated species calls, no fake "AI confidence"
scores. The only conceivable use case is a future "explain this result in
plain English" feature for the citizen-science report, and that is
explicitly opt-in, clearly labeled, and never modifies the actual data.

If you later want to enable that feature, set:
```
ANTHROPIC_API_KEY=<optional>
```
Until then, leave it empty — the platform runs perfectly without it.

---

## 6. `.env` template

This template will also ship as `backend/.env.example` (committed,
no secrets) when Phase 1 starts. You copy it to `backend/.env` and fill in
the blanks.

```bash
# --- Core infrastructure ---
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=edna
POSTGRES_PASSWORD=change-me-in-local-dev
POSTGRES_DB=edna_insights

REDIS_HOST=redis
REDIS_PORT=6379

MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=change-me-in-local-dev
MINIO_BUCKET=relict
MINIO_SECURE=false

# --- Security ---
JWT_SECRET=generate-a-long-random-string
JWT_ALGORITHM=HS256
JWT_ACCESS_TTL_MINUTES=15
JWT_REFRESH_TTL_DAYS=14

# --- External APIs (fill these in) ---
IUCN_REDLIST_TOKEN=
GBIF_USERNAME=
GBIF_PASSWORD=
GBIF_EMAIL=
NCBI_API_KEY=
NCBI_EMAIL=

# --- Optional ---
ZENODO_SANDBOX_TOKEN=
ANTHROPIC_API_KEY=
```

---

## 7. Action items for you (right now)

So that nothing is blocked later, please start these in parallel:

1. **Today:** request the IUCN Red List token (takes 1–3 business days).
2. **Today:** register a GBIF account (takes 2 minutes).
3. **Today:** create an NCBI API key (takes 2 minutes).
4. **Before Phase 1:** install Docker Desktop and confirm
   `docker compose version` ≥ 2.20.
5. **Before Phase 1:** confirm ~20 GB free disk on your work drive.

Once the IUCN token arrives, put it in `backend/.env` (which will exist by
the end of Phase 1) and we're unblocked for Phase 3.
