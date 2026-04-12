import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getJobSummary,
  getJobASVs,
  getJobConservation,
  getJobProvenance,
  downloadExport,
  getDwcaUrl,
  getCsvUrl,
  getBiomUrl,
  getJob,
  type ASVWithTaxon,
  type ConservationSummary,
  type ProvenanceManifest,
  type JobResultsSummary,
} from "@/lib/api";
import { Download, Shield, Dna, BarChart3, FileCheck, ArrowLeft } from "lucide-react";

const IUCN_COLORS: Record<string, string> = {
  EX: "bg-black text-white",
  EW: "bg-purple-900 text-white",
  CR: "bg-red-600 text-white",
  EN: "bg-orange-500 text-white",
  VU: "bg-yellow-500 text-black",
  NT: "bg-lime-400 text-black",
  LC: "bg-green-500 text-white",
  DD: "bg-gray-400 text-black",
  NE: "bg-gray-200 text-black",
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
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Link to="/demo" className="inline-flex items-center text-sm text-muted-foreground mb-6 hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to upload
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Analysis Results</h1>
            <p className="text-muted-foreground mt-1">Job {jobId?.slice(0, 8)}...</p>
          </div>
          {job && (
            <Badge className={job.status === "succeeded" ? "bg-emerald text-white" : "bg-yellow-500"}>
              {job.status} {job.pipeline_version ? `(v${job.pipeline_version})` : ""}
            </Badge>
          )}
        </div>

        {job?.status !== "succeeded" && (
          <Card className="p-8 text-center">
            <p className="text-lg">Job status: <strong>{job?.status || "loading..."}</strong></p>
            {job?.error_message && <p className="text-destructive mt-2">{job.error_message}</p>}
          </Card>
        )}

        {job?.status === "succeeded" && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview"><BarChart3 className="w-4 h-4 mr-1" /> Overview</TabsTrigger>
              <TabsTrigger value="asvs"><Dna className="w-4 h-4 mr-1" /> ASVs</TabsTrigger>
              <TabsTrigger value="conservation"><Shield className="w-4 h-4 mr-1" /> Conservation</TabsTrigger>
              <TabsTrigger value="provenance"><FileCheck className="w-4 h-4 mr-1" /> Provenance</TabsTrigger>
              <TabsTrigger value="export"><Download className="w-4 h-4 mr-1" /> Export</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <OverviewTab summary={summary} />
            </TabsContent>
            <TabsContent value="asvs">
              <ASVsTab asvs={asvs} />
            </TabsContent>
            <TabsContent value="conservation">
              <ConservationTab data={conservation} />
            </TabsContent>
            <TabsContent value="provenance">
              <ProvenanceTab data={provenance} />
            </TabsContent>
            <TabsContent value="export">
              <ExportTab jobId={jobId} />
            </TabsContent>
          </Tabs>
        )}
      </main>
      <Footer />
    </div>
  );
}

function OverviewTab({ summary }: { summary?: JobResultsSummary }) {
  if (!summary) return <p className="text-muted-foreground">Loading...</p>;
  const d = summary.diversity;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard label="ASVs Detected" value={summary.n_asvs} />
      <MetricCard label="Taxa Assigned" value={`${summary.n_assigned} / ${summary.n_asvs}`} />
      <MetricCard label="Shannon Index" value={d?.shannon?.toFixed(4) ?? "—"} />
      <MetricCard label="Simpson Index" value={d?.simpson?.toFixed(4) ?? "—"} />
      <MetricCard label="Species Richness" value={d?.richness ?? "—"} />
      <MetricCard label="Chao1 Estimate" value={d?.chao1?.toFixed(2) ?? "—"} />
      <MetricCard label="Evenness" value={d?.evenness?.toFixed(4) ?? "—"} />
      <MetricCard label="Pipeline" value={summary.pipeline_version ?? "—"} />
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-display font-bold mt-1">{value}</p>
    </Card>
  );
}

function ASVsTab({ asvs }: { asvs?: ASVWithTaxon[] }) {
  if (!asvs) return <p className="text-muted-foreground">Loading...</p>;
  return (
    <Card className="p-6 overflow-x-auto">
      <h3 className="text-lg font-semibold mb-4">{asvs.length} Amplicon Sequence Variants</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2 pr-4">#</th>
            <th className="py-2 pr-4">Abundance</th>
            <th className="py-2 pr-4">Length</th>
            <th className="py-2 pr-4">Taxonomy</th>
            <th className="py-2 pr-4">Confidence</th>
            <th className="py-2">Sequence (first 40bp)</th>
          </tr>
        </thead>
        <tbody>
          {asvs.map((asv, i) => {
            const t = asv.taxon;
            const lineage = t
              ? [t.kingdom, t.phylum, t.tax_class, t.tax_order, t.family, t.genus, t.species]
                  .filter(Boolean)
                  .join(" > ")
              : "Unassigned";
            return (
              <tr key={asv.id} className="border-b hover:bg-muted/30">
                <td className="py-2 pr-4 text-muted-foreground">{i + 1}</td>
                <td className="py-2 pr-4 font-mono">{asv.abundance}</td>
                <td className="py-2 pr-4">{asv.length} bp</td>
                <td className="py-2 pr-4 max-w-xs truncate" title={lineage}>{lineage}</td>
                <td className="py-2 pr-4">{t?.confidence ? `${(t.confidence * 100).toFixed(1)}%` : "—"}</td>
                <td className="py-2 font-mono text-xs text-muted-foreground">{asv.sequence.slice(0, 40)}...</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

function ConservationTab({ data }: { data?: ConservationSummary }) {
  if (!data) return <p className="text-muted-foreground">Loading...</p>;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Species Queried" value={data.species_queried} />
        <MetricCard label="In GBIF" value={data.species_with_gbif} />
        <MetricCard label="IUCN Assessed" value={data.species_with_iucn} />
        <MetricCard label="Threatened" value={data.threatened_count} />
      </div>
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Per-Species Conservation Status</h3>
        <div className="space-y-3">
          {data.records.map((r) => {
            const iucn = r.iucn_category || "NE";
            const colorClass = IUCN_COLORS[iucn] || IUCN_COLORS.NE;
            const flags = r.legal_flags || {};
            return (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">{r.species}</p>
                  <p className="text-sm text-muted-foreground">
                    GBIF: {r.gbif_occurrence_count?.toLocaleString() ?? "?"} occurrences
                    {flags.iucn_population_trend && ` | Trend: ${flags.iucn_population_trend}`}
                  </p>
                </div>
                <Badge className={colorClass}>{iucn}</Badge>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function ProvenanceTab({ data }: { data?: ProvenanceManifest }) {
  if (!data) return <p className="text-muted-foreground">Loading...</p>;
  const m = data.manifest as Record<string, unknown>;
  const pipeline = m.pipeline as Record<string, unknown> | undefined;
  const tools = (pipeline?.tool_versions || {}) as Record<string, string>;
  const stages = (m.stages || []) as Array<Record<string, unknown>>;
  const inputs = (m.inputs || []) as Array<Record<string, unknown>>;

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Reproducibility Manifest</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Manifest SHA256</p>
            <p className="font-mono break-all">{data.manifest_sha256}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Signature</p>
            <p className="font-mono break-all">{data.signature}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Pipeline</p>
            <p>{String(pipeline?.name || "Relict")} v{String(pipeline?.version || "?")}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Signed at</p>
            <p>{new Date(data.signed_at).toLocaleString()}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">Tool Versions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          {Object.entries(tools).map(([tool, ver]) => (
            <div key={tool} className="p-2 rounded bg-muted/30">
              <span className="font-medium">{tool}</span>
              <span className="text-muted-foreground ml-2">{ver}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">Pipeline Stages ({stages.length})</h3>
        <div className="space-y-2 text-sm">
          {stages.map((s, i) => (
            <div key={i} className="flex items-center justify-between p-2 border-b">
              <div>
                <span className="font-medium">{String(s.stage)}</span>
                <span className="text-muted-foreground ml-2">({String(s.tool)} v{String(s.tool_version)})</span>
              </div>
              <span className="text-muted-foreground">{Number(s.runtime_seconds).toFixed(2)}s</span>
            </div>
          ))}
        </div>
      </Card>

      {inputs.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3">Input Files</h3>
          {inputs.map((inp, i) => (
            <div key={i} className="text-sm">
              <p><strong>{String(inp.filename)}</strong></p>
              <p className="text-muted-foreground font-mono">SHA256: {String(inp.sha256)}</p>
              <p className="text-muted-foreground">{Number(inp.size_bytes).toLocaleString()} bytes</p>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function ExportTab({ jobId }: { jobId: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-6 text-center space-y-3">
        <Download className="w-8 h-8 mx-auto text-emerald" />
        <h3 className="font-semibold">Darwin Core Archive</h3>
        <p className="text-sm text-muted-foreground">GBIF-compatible ZIP for data submission</p>
        <Button onClick={() => downloadExport(getDwcaUrl(jobId), `relict_dwca_${jobId}.zip`)} className="w-full">
          Download DwC-A
        </Button>
      </Card>
      <Card className="p-6 text-center space-y-3">
        <Download className="w-8 h-8 mx-auto text-accent" />
        <h3 className="font-semibold">CSV Table</h3>
        <p className="text-sm text-muted-foreground">ASVs + taxonomy in spreadsheet format</p>
        <Button variant="outline" onClick={() => downloadExport(getCsvUrl(jobId), `relict_asvs_${jobId}.csv`)} className="w-full">
          Download CSV
        </Button>
      </Card>
      <Card className="p-6 text-center space-y-3">
        <Download className="w-8 h-8 mx-auto text-muted-foreground" />
        <h3 className="font-semibold">BIOM Format</h3>
        <p className="text-sm text-muted-foreground">For QIIME2 and phyloseq import</p>
        <Button variant="outline" onClick={() => downloadExport(getBiomUrl(jobId), `relict_biom_${jobId}.json`)} className="w-full">
          Download BIOM
        </Button>
      </Card>
    </div>
  );
}
