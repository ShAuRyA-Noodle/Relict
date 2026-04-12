"""Darwin Core Archive (DwC-A) generator for Relict.

Produces a ZIP file conforming to the GBIF "Publishing DNA-derived data"
guide (https://docs.gbif.org/publishing-dna-derived-data/en/).

The archive contains:
  meta.xml                — DwC-A descriptor (core + extensions)
  occurrence.txt          — one row per detected ASV (Darwin Core terms)
  dna-derived-data.txt    — eDNA-specific extension fields
  eml.xml                 — dataset-level metadata (EML standard)

This allows any eDNA researcher to submit their Relict results directly
to GBIF, OBIS, or any other DwC-A-compatible data portal.
"""
from __future__ import annotations

import csv
import io
import uuid
import zipfile
from datetime import UTC, datetime
from typing import Any


def generate_dwca(
    *,
    job_id: uuid.UUID,
    asvs: list[dict[str, Any]],
    sample_metadata: dict[str, Any],
    pipeline_version: str,
    parameter_hash: str | None = None,
) -> bytes:
    """Generate a Darwin Core Archive as an in-memory ZIP.

    Args:
        job_id: The Relict job UUID (used as dataset identifier).
        asvs: List of ASV dicts, each with keys: sequence, abundance,
              length, sequence_sha256, and optionally a nested ``taxon``
              dict with kingdom/phylum/class/order/family/genus/species.
        sample_metadata: Dict with Darwin Core sample fields (eventDate,
              decimalLatitude, decimalLongitude, habitat, etc.).
        pipeline_version: e.g. "0.2.0".
        parameter_hash: SHA256 of the pipeline config.

    Returns:
        Bytes of the ZIP file, ready to be streamed to the client.
    """
    buf = io.BytesIO()

    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("meta.xml", _generate_meta_xml())
        zf.writestr("occurrence.txt", _generate_occurrence_txt(asvs, sample_metadata))
        zf.writestr("dna-derived-data.txt", _generate_dna_derived_txt(asvs))
        zf.writestr("eml.xml", _generate_eml_xml(job_id, sample_metadata, pipeline_version))

    return buf.getvalue()


def _generate_meta_xml() -> str:
    """DwC-A descriptor — defines the core (Occurrence) and extension (DNA-derived)."""
    return """<?xml version="1.0" encoding="UTF-8"?>
<archive xmlns="http://rs.tdwg.org/dwc/text/"
         metadata="eml.xml">
  <core encoding="UTF-8" fieldsTerminatedBy="\\t"
        linesTerminatedBy="\\n" fieldsEnclosedBy=""
        ignoreHeaderLines="1"
        rowType="http://rs.tdwg.org/dwc/terms/Occurrence">
    <files><location>occurrence.txt</location></files>
    <id index="0"/>
    <field index="1" term="http://rs.tdwg.org/dwc/terms/occurrenceID"/>
    <field index="2" term="http://rs.tdwg.org/dwc/terms/basisOfRecord"/>
    <field index="3" term="http://rs.tdwg.org/dwc/terms/eventDate"/>
    <field index="4" term="http://rs.tdwg.org/dwc/terms/decimalLatitude"/>
    <field index="5" term="http://rs.tdwg.org/dwc/terms/decimalLongitude"/>
    <field index="6" term="http://rs.tdwg.org/dwc/terms/kingdom"/>
    <field index="7" term="http://rs.tdwg.org/dwc/terms/phylum"/>
    <field index="8" term="http://rs.tdwg.org/dwc/terms/class"/>
    <field index="9" term="http://rs.tdwg.org/dwc/terms/order"/>
    <field index="10" term="http://rs.tdwg.org/dwc/terms/family"/>
    <field index="11" term="http://rs.tdwg.org/dwc/terms/genus"/>
    <field index="12" term="http://rs.tdwg.org/dwc/terms/scientificName"/>
    <field index="13" term="http://rs.tdwg.org/dwc/terms/organismQuantity"/>
    <field index="14" term="http://rs.tdwg.org/dwc/terms/organismQuantityType"/>
    <field index="15" term="http://rs.tdwg.org/dwc/terms/samplingProtocol"/>
    <field index="16" term="http://rs.tdwg.org/dwc/terms/habitat"/>
    <field index="17" term="http://rs.tdwg.org/dwc/terms/recordedBy"/>
  </core>
  <extension encoding="UTF-8" fieldsTerminatedBy="\\t"
             linesTerminatedBy="\\n" fieldsEnclosedBy=""
             ignoreHeaderLines="1"
             rowType="http://rs.gbif.org/terms/1.0/DNADerivedData">
    <files><location>dna-derived-data.txt</location></files>
    <coreid index="0"/>
    <field index="1" term="http://rs.gbif.org/terms/1.0/DNA_sequence"/>
    <field index="2" term="http://rs.gbif.org/terms/1.0/sampleSizeValue"/>
    <field index="3" term="http://rs.gbif.org/terms/1.0/sampleSizeUnit"/>
    <field index="4" term="http://rs.gbif.org/terms/1.0/materialSampleID"/>
    <field index="5" term="http://rs.gbif.org/terms/1.0/pcr_primer_forward"/>
    <field index="6" term="http://rs.gbif.org/terms/1.0/pcr_primer_reverse"/>
    <field index="7" term="http://rs.gbif.org/terms/1.0/target_gene"/>
    <field index="8" term="http://rs.gbif.org/terms/1.0/otu_db"/>
    <field index="9" term="http://rs.gbif.org/terms/1.0/otu_seq_comp_appr"/>
  </extension>
</archive>
"""


def _generate_occurrence_txt(
    asvs: list[dict[str, Any]], metadata: dict[str, Any]
) -> str:
    """Generate the core occurrence file (one row per ASV detection)."""
    output = io.StringIO()
    writer = csv.writer(output, delimiter="\t", lineterminator="\n")

    writer.writerow([
        "id", "occurrenceID", "basisOfRecord", "eventDate",
        "decimalLatitude", "decimalLongitude",
        "kingdom", "phylum", "class", "order", "family", "genus",
        "scientificName", "organismQuantity", "organismQuantityType",
        "samplingProtocol", "habitat", "recordedBy",
    ])

    event_date = metadata.get("eventDate", "")
    lat = metadata.get("decimalLatitude", "")
    lon = metadata.get("decimalLongitude", "")
    protocol = metadata.get("samplingProtocol", "eDNA metabarcoding")
    habitat = metadata.get("habitat", "")
    recorded_by = metadata.get("recordedBy", "")

    for i, asv in enumerate(asvs):
        asv_id = asv.get("sequence_sha256", f"asv_{i}")[:16]
        occ_id = f"relict:{asv_id}"
        taxon = asv.get("taxon") or {}

        genus = taxon.get("genus", "")
        species = taxon.get("species", "")
        sci_name = f"{genus} {species}".strip() if genus else ""

        writer.writerow([
            i + 1,
            occ_id,
            "MaterialSample",
            event_date,
            lat,
            lon,
            taxon.get("kingdom", ""),
            taxon.get("phylum", ""),
            taxon.get("tax_class", ""),
            taxon.get("tax_order", ""),
            taxon.get("family", ""),
            genus,
            sci_name,
            asv.get("abundance", ""),
            "DNA sequence reads",
            protocol,
            habitat,
            recorded_by,
        ])

    return output.getvalue()


def _generate_dna_derived_txt(asvs: list[dict[str, Any]]) -> str:
    """Generate the DNA-derived data extension (sequence info per ASV)."""
    output = io.StringIO()
    writer = csv.writer(output, delimiter="\t", lineterminator="\n")

    writer.writerow([
        "id", "DNA_sequence", "sampleSizeValue", "sampleSizeUnit",
        "materialSampleID", "pcr_primer_forward", "pcr_primer_reverse",
        "target_gene", "otu_db", "otu_seq_comp_appr",
    ])

    total_reads = sum(a.get("abundance", 0) for a in asvs)

    for i, asv in enumerate(asvs):
        writer.writerow([
            i + 1,
            asv.get("sequence", ""),
            total_reads,
            "DNA sequence reads",
            asv.get("sequence_sha256", "")[:16],
            "",
            "",
            "",
            "",
            "ASV (UNOISE3 via vsearch)",
        ])

    return output.getvalue()


def _generate_eml_xml(
    job_id: uuid.UUID,
    metadata: dict[str, Any],
    pipeline_version: str,
) -> str:
    """Generate dataset-level EML metadata."""
    now = datetime.now(tz=UTC).strftime("%Y-%m-%d")
    title = metadata.get("title", f"eDNA survey — Relict job {job_id}")
    abstract = metadata.get(
        "abstract",
        "Environmental DNA (eDNA) metabarcoding survey processed by the "
        "Relict platform (https://github.com/ShAuRyA-Noodle/Bad-Omens). "
        "Amplicon sequence variants (ASVs) were inferred using vsearch "
        "UNOISE3 and assigned taxonomy against version-pinned reference "
        f"databases. Pipeline version: {pipeline_version}.",
    )

    return f"""<?xml version="1.0" encoding="UTF-8"?>
<eml:eml xmlns:eml="eml://ecoinformatics.org/eml-2.1.1"
         xmlns:dc="http://purl.org/dc/terms/"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="eml://ecoinformatics.org/eml-2.1.1
         http://rs.gbif.org/schema/eml-gbif-profile/1.1/eml.xsd"
         packageId="{job_id}" system="relict" scope="system">
  <dataset>
    <title>{title}</title>
    <creator>
      <organizationName>Relict eDNA Platform</organizationName>
    </creator>
    <metadataProvider>
      <organizationName>Relict eDNA Platform</organizationName>
    </metadataProvider>
    <pubDate>{now}</pubDate>
    <abstract><para>{abstract}</para></abstract>
    <intellectualRights>
      <para>Creative Commons Attribution 4.0 International (CC BY 4.0)</para>
    </intellectualRights>
    <methods>
      <methodStep>
        <description>
          <para>
            eDNA metabarcoding processed by Relict v{pipeline_version}.
            Pipeline: fastp QC, vsearch dereplication, vsearch UNOISE3
            ASV inference, vsearch taxonomy assignment against
            version-pinned reference databases, scikit-bio diversity
            metrics, UMAP+HDBSCAN ordination, GBIF+IUCN conservation
            cross-referencing.
          </para>
        </description>
      </methodStep>
    </methods>
  </dataset>
</eml:eml>
"""
