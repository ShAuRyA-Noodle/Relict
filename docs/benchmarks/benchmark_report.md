# Relict Benchmark Report

Generated: 2026-04-12 12:34 UTC

**Overall: 10/10 checks passed** (ALL GREEN)

## 16S_V4_Known_Composition [PASS]

**Description:** 100 reads from 5 known bacterial species (E. coli, B. subtilis, S. aureus, P. aeruginosa, L. rhamnosus) — real GenBank V4 amplicon sequences with equal abundance (20 reads each).
**Dataset:** `test_16s_v4.fastq`
**Result:** 10/10 checks passed

| # | Check | Expected | Actual | Status |
|---|---|---|---|---|
| 1 | Number of ASVs | 5 | 5 | PASS |
| 2 | Taxonomy assignment rate | 100% (5/5) | 5/5 | PASS |
| 3 | Known genera detected | >= 3 of {'Escherichia-Shigella', 'Enterococcus', 'Bacillus', 'Pseudomonas'} | 4: {'Escherichia-Shigella', 'Enterococcus', 'Bacillus', 'Pseudomonas'} | PASS |
| 4 | Shannon diversity index | 1.609438 (ln(5) for 5 equal-abundance taxa) | 1.609438 | PASS |
| 5 | Pielou's evenness | 1.0 (perfectly even abundance) | 1.000000 | PASS |
| 6 | Species richness | 5 | 5 | PASS |
| 7 | Simpson diversity index | 0.8 (1 - 1/5 for 5 equal-abundance taxa) | 0.800000 | PASS |
| 8 | Chao1 estimated richness | 5.0 (no singletons = observed richness) | 5.0000 | PASS |
| 9 | Species resolved in GBIF | >= 3 of 5 | 5/5 | PASS |
| 10 | Provenance manifest generated | 64-char SHA256 hash | 3b54c4292093399a... | PASS |

**Notes:**
- Number of ASVs: 5 unique species should produce exactly 5 ASVs
