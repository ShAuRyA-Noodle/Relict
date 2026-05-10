import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  getJobSummary,
  getJobASVs,
  getJobConservation,
  getJobProvenance,
  downloadExport,
  getDwcaUrl,
  getCsvUrl,
  getBiomUrl,
  getReportUrl,
  getJob,
  type ASVWithTaxon,
  type ConservationSummary,
  type ProvenanceManifest,
  type JobResultsSummary,
} from "@/lib/api";
import { Download, Shield, Dna, BarChart3, FileCheck, ArrowLeft } from "lucide-react";

const IUCN_CLASS: Record<string, string> = {
  EX: "status-ex",
  EW: "status-ex",
  CR: "status-cr",
  EN: "status-en",
  VU: "status-vu",
  NT: "status-nt",
  LC: "status-lc",
  DD: "status-dd",
  NE: "status-dd",
};

export default function JobResults() {
  const { jobId } = useParams<{ jobId: string }>();

  const { data: job } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => getJob(jobId!),
    enabled: !!jobId,
  });

  const { data: summary } = useQuery({
    queryKey: ["job-summary", jobId],
    queryFn: () => getJobSummary(jobId!),
    enabled: !!jobId && job?.status === "succeeded",
  });

  const { data: asvs } = useQuery({
    queryKey: ["job-asvs", jobId],
    queryFn: () => getJobASVs(jobId!),
    enabled: !!jobId && job?.status === "succeeded",
  });

  const { data: conservation } = useQuery({
    queryKey: ["job-conservation", jobId],
    queryFn: () => getJobConservation(jobId!),
    enabled: !!jobId && job?.status === "succeeded",
  });

  const { data: provenance } = useQuery({
    queryKey: ["job-provenance", jobId],
    queryFn: () => getJobProvenance(jobId!),
    enabled: !!jobId && job?.status === "succeeded",
  });

  if (!jobId) return <p>No job ID</p>;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32 pb-24">
        <div className="container-page max-w-6xl">
          <Link to="/demo" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to upload
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
          >
            <div>
              <p className="eyebrow mb-3">
                <span className="eyebrow-dot" />
                Analysis
              </p>
              <h1 className="h-display text-display-lg">Job results</h1>
              <p className="text-sm text-muted-foreground mt-2 font-mono">{jobId.slice(0, 12)}…</p>
            </div>
            {job && (
              <Badge
                className={
                  job.status === "succeeded"
                    ? "bg-success/15 text-success border-success/20"
                    : job.status === "failed"
                    ? "bg-destructive/15 text-destructive border-destructive/20"
                    : "bg-amber-500/15 text-amber-500 border-amber-500/20"
                }
              >
                {job.status}{job.pipeline_version ? ` · v${job.pipeline_version}` : ""}
              </Badge>
            )}
          </motion.div>

          {job?.status !== "succeeded" && (
            <Card className="p-8 text-center">
              <p className="text-base">
                Status: <span className="font-medium">{job?.status || "loading…"}</span>
              </p>
              {job?.error_message && <p className="text-destructive mt-2 text-sm">{job.error_message}</p>}
            </Card>
          )}

          {job?.status === "succeeded" && (
            <Tabs defaultValue="overview" className="space-y-8">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview"><BarChart3 className="w-4 h-4 mr-1.5" /> Overview</TabsTrigger>
                <TabsTrigger value="asvs"><Dna className="w-4 h-4 mr-1.5" /> ASVs</TabsTrigger>
                <TabsTrigger value="conservation"><Shield className="w-4 h-4 mr-1.5" /> Conservation</TabsTrigger>
                <TabsTrigger value="provenance"><FileCheck className="w-4 h-4 mr-1.5" /> Provenance</TabsTrigger>
                <TabsTrigger value="export"><Download className="w-4 h-4 mr-1.5" /> Export</TabsTrigger>
              </TabsList>

              <TabsContent value="overview"><OverviewTab summary={summary} /></TabsContent>
              <TabsContent value="asvs"><ASVsTab asvs={asvs} /></TabsContent>
              <TabsContent value="conservation"><ConservationTab data={conservation} /></TabsContent>
              <TabsContent value="provenance"><ProvenanceTab data={provenance} /></TabsContent>
              <TabsContent value="export"><ExportTab jobId={jobId} /></TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function OverviewTab({ summary }: { summary?: JobResultsSummary }) {
  if (!summary) return <p className="text-muted-foreground">Loading…</p>;
  const d = summary.diversity;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Metric label="ASVs detected"     value={summary.n_asvs} />
      <Metric label="Taxa assigned"     value={`${summary.n_assigned} / ${summary.n_asvs}`} />
      <Metric label="Shannon index"     value={d?.shannon?.toFixed(4) ?? "—"} />
      <Metric label="Simpson index"     value={d?.simpson?.toFixed(4) ?? "—"} />
      <Metric label="Species richness"  value={d?.richness ?? "—"} />
      <Metric label="Chao1 estimate"    value={d?.chao1?.toFixed(2) ?? "—"} />
      <Metric label="Evenness"          value={d?.evenness?.toFixed(4) ?? "—"} />
      <Metric label="Pipeline"          value={summary.pipeline_version ?? "—"} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Card className="p-5">
      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="font-display text-2xl mt-2 tabular-nums">{value}</p>
    </Card>
  );
}

function ASVsTab({ asvs }: { asvs?: ASVWithTaxon[] }) {
  if (!asvs) return <p className="text-muted-foreground">Loading…</p>;
  const taxonomyStageRan = asvs.some(
    (a) => a.taxon && (a.taxon.genus || a.taxon.species || a.taxon.family || a.taxon.phylum || a.taxon.kingdom)
  );
  return (
    <Card className="p-6 md:p-8">
      <h3 className="font-display text-lg mb-5">{asvs.length} amplicon sequence variants</h3>
      <div className="space-y-3">
        {asvs.map((asv, i) => {
          const t = asv.taxon;
          const hasTaxonomy = Boolean(t && (t.genus || t.species || t.family || t.phylum || t.kingdom));
          const conf = t?.confidence ? `${(t.confidence * 100).toFixed(1)}%` : null;
          const displayName = hasTaxonomy
            ? `${t?.genus || ""} ${t?.species || ""}`.trim() || t?.family || t?.phylum || "Unclassified"
            : "Unclassified";
          return (
            <div key={asv.id} className="rounded-[var(--radius)] border border-border p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs text-muted-foreground font-mono w-7 shrink-0">#{i + 1}</span>
                  <span className={`font-medium truncate ${hasTaxonomy ? "" : "italic text-muted-foreground"}`}>
                    {displayName}
                  </span>
                  {conf ? (
                    <span className="text-xs px-2 py-0.5 rounded-[var(--radius-xs)] border border-border text-muted-foreground">
                      {conf} identity
                    </span>
                  ) : taxonomyStageRan ? (
                    <span className="text-xs px-2 py-0.5 rounded-[var(--radius-xs)] border border-border text-muted-foreground/70">
                      no match ≥ 80% identity
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-[var(--radius-xs)] border border-amber-500/30 text-amber-500">
                      taxonomy skipped — reference DB missing
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground tabular-nums">
                  <span>{asv.abundance} reads</span>
                  <span>{asv.length} bp</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mb-1">
                {[t?.kingdom, t?.phylum, t?.tax_class, t?.tax_order, t?.family, t?.genus].filter(Boolean).join(" › ")}
              </div>
              <div className="font-mono text-[11px] text-muted-foreground/60 break-all">
                {asv.sequence.slice(0, 60)}…
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function ConservationTab({ data }: { data?: ConservationSummary }) {
  if (!data) return <p className="text-muted-foreground">Loading…</p>;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Metric label="Species queried"  value={data.species_queried} />
        <Metric label="In GBIF"          value={data.species_with_gbif} />
        <Metric label="IUCN assessed"    value={data.species_with_iucn} />
        <Metric label="Threatened"       value={data.threatened_count} />
      </div>
      <Card className="p-6 md:p-8">
        <h3 className="font-display text-lg mb-5">Per-species conservation status</h3>
        <ul className="divide-y divide-border">
          {data.records.map((r) => {
            const iucn = r.iucn_category || "NE";
            const cls = IUCN_CLASS[iucn] || IUCN_CLASS.NE;
            const flags = r.legal_flags || {};
            return (
              <li key={r.id} className="flex items-center justify-between py-3 gap-4">
                <div className="min-w-0">
                  <p className="font-medium truncate">{r.species}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    GBIF: {r.gbif_occurrence_count?.toLocaleString() ?? "?"} occurrences
                    {flags.iucn_population_trend && ` · trend: ${flags.iucn_population_trend}`}
                  </p>
                </div>
                <Badge className={`${cls} border-transparent`}>{iucn}</Badge>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}

function ProvenanceTab({ data }: { data?: ProvenanceManifest }) {
  if (!data) return <p className="text-muted-foreground">Loading…</p>;
  const m = data.manifest as Record<string, unknown>;
  const pipeline = m.pipeline as Record<string, unknown> | undefined;
  const tools = (pipeline?.tool_versions || {}) as Record<string, string>;
  const stages = (m.stages || []) as Array<Record<string, unknown>>;
  const inputs = (m.inputs || []) as Array<Record<string, unknown>>;

  return (
    <div className="space-y-4">
      <Card className="p-6 md:p-8">
        <h3 className="font-display text-lg mb-5">Reproducibility manifest</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
          <Field label="Manifest SHA-256" mono value={data.manifest_sha256} />
          <Field label="Signature" mono value={data.signature} />
          <Field label="Pipeline" value={`${String(pipeline?.name || "Relict")} v${String(pipeline?.version || "?")}`} />
          <Field label="Signed at" value={new Date(data.signed_at).toLocaleString()} />
        </div>
      </Card>

      <Card className="p-6 md:p-8">
        <h3 className="font-display text-lg mb-4">Tool versions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(tools).map(([tool, ver]) => (
            <div key={tool} className="flex items-baseline gap-2 px-3 py-2 rounded-[var(--radius-sm)] bg-muted text-sm">
              <span className="font-medium">{tool}</span>
              <span className="text-muted-foreground font-mono text-xs">{ver}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 md:p-8">
        <h3 className="font-display text-lg mb-4">Pipeline stages ({stages.length})</h3>
        <ul className="divide-y divide-border">
          {stages.map((s, i) => (
            <li key={i} className="flex items-center justify-between py-2.5 text-sm">
              <div>
                <span className="font-medium">{String(s.stage)}</span>
                <span className="text-muted-foreground ml-2 text-xs">
                  {String(s.tool)} v{String(s.tool_version)}
                </span>
              </div>
              <span className="text-muted-foreground tabular-nums text-xs">
                {Number(s.runtime_seconds).toFixed(2)}s
              </span>
            </li>
          ))}
        </ul>
      </Card>

      {inputs.length > 0 && (
        <Card className="p-6 md:p-8">
          <h3 className="font-display text-lg mb-4">Input files</h3>
          <ul className="space-y-3">
            {inputs.map((inp, i) => (
              <li key={i} className="text-sm">
                <p className="font-medium">{String(inp.filename)}</p>
                <p className="text-muted-foreground font-mono text-xs break-all">
                  SHA-256: {String(inp.sha256)}
                </p>
                <p className="text-muted-foreground text-xs">{Number(inp.size_bytes).toLocaleString()} bytes</p>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

const Field = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
  <div>
    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground mb-1">{label}</p>
    <p className={mono ? "font-mono text-xs break-all" : "text-sm"}>{value}</p>
  </div>
);

function ExportTab({ jobId }: { jobId: string }) {
  return (
    <div className="space-y-5">
      <Card className="p-6 md:p-8 border-primary/30">
        <div className="flex items-start gap-4 mb-5">
          <div className="p-3 rounded-[var(--radius)] bg-primary/10">
            <FileCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-lg mb-1">Full analysis report</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Complete HTML report: diversity metrics, ASV table, taxonomy, conservation
              status (IUCN / GBIF), and full provenance manifest. Opens in any browser.
            </p>
          </div>
        </div>
        <Button onClick={() => downloadExport(getReportUrl(jobId), `relict_report_${jobId}.html`)} className="w-full" size="lg">
          <Download className="w-4 h-4 mr-2" /> Download full report (HTML)
        </Button>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ExportCard
          title="Darwin Core Archive"
          desc="GBIF-compatible ZIP (occurrence.txt, dna-derived-data.txt, eml.xml). Submit directly to GBIF IPT."
          onClick={() => downloadExport(getDwcaUrl(jobId), `relict_dwca_${jobId}.zip`)}
          label="Download DwC-A"
        />
        <ExportCard
          title="CSV table"
          desc="Flat spreadsheet with ASVs, abundances, 7-rank taxonomy, identity scores, and reference DB."
          onClick={() => downloadExport(getCsvUrl(jobId), `relict_asvs_${jobId}.csv`)}
          label="Download CSV"
        />
        <ExportCard
          title="BIOM 2.1.0"
          desc="Standard format for QIIME 2 import and phyloseq analysis in R. Includes taxonomy metadata."
          onClick={() => downloadExport(getBiomUrl(jobId), `relict_biom_${jobId}.json`)}
          label="Download BIOM"
        />
      </div>
    </div>
  );
}

const ExportCard = ({ title, desc, onClick, label }: { title: string; desc: string; onClick: () => void; label: string }) => (
  <Card className="p-6 flex flex-col gap-4">
    <Download className="w-5 h-5 text-primary" />
    <div>
      <h3 className="font-display text-base mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
    <Button variant="outline" onClick={onClick} className="mt-auto">
      {label}
    </Button>
  </Card>
);
