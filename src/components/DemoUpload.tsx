import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, AlertCircle, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ApiResult {
  n_reads: number;
  k: number;
  summary: {
    clusters: Record<string, number>;
    n_clusters_excl_noise: number;
    noise_reads: number;
    shannon_index?: number;
    n_reads: number;
  };
  embedding_preview: Array<{ x: number; y: number; label: number }>;
}

export const DemoUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setUploadedFile(file);
      setIsProcessing(true);
      setUploadProgress(30);
      setResult(null);

      try {
        const form = new FormData();
        form.append("file", file);
        form.append("k", "6");
        form.append("max_reads", "10000");
        form.append("min_len", "20");

        const res = await fetch("http://127.0.0.1:8000/analyze", {
          method: "POST",
          body: form,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: ApiResult = await res.json();
        if ((json as any).error) throw new Error((json as any).error);

        setResult(json);
        setUploadProgress(100);

        toast({
          title: "Analysis Complete",
          description: `Reads: ${json.summary.n_reads}, Clusters: ${json.summary.n_clusters_excl_noise}, Shannon: ${
            json.summary.shannon_index !== undefined
              ? Math.abs(json.summary.shannon_index).toFixed(2)
              : "—"
          }`,
        });
      } catch (error: any) {
        toast({
          title: "Analysis Failed",
          description:
            error?.message ??
            "Please try again with a valid eDNA sample file.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [toast]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: { "text/plain": [".fasta", ".fa", ".fastq", ".fq"] },
      maxSize: 20 * 1024 * 1024,
      multiple: false,
    });

  const downloadResults = (format: "json" | "csv") => {
    if (!result) return;

    let content = "";
    let filename = "";

    if (format === "json") {
      content = JSON.stringify(result, null, 2);
      filename = `edna_analysis_${Date.now()}.json`;
    } else {
      const csvRows = [
        "Cluster,Count",
        ...Object.entries(result.summary.clusters).map(
          ([label, count]) => `${label},${count}`
        ),
      ];
      content = csvRows.join("\n");
      filename = `edna_analysis_${Date.now()}.csv`;
    }

    const blob = new Blob([content], {
      type: format === "json" ? "application/json" : "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <Card className="p-8 glass">
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all hover-lift",
            isDragActive ? "border-emerald bg-emerald/5" : "border-border",
            isProcessing && "cursor-not-allowed opacity-50"
          )}
        >
          <input {...getInputProps()} disabled={isProcessing} />
          <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />

          <p className="text-lg font-medium mb-2">
            Drop your eDNA sample file here, or click to browse
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Supports FASTA/FASTQ files up to 20MB
          </p>
          <Button variant="outline" disabled={isProcessing}>
            <FileText className="w-4 h-4 mr-2" />
            Choose File
          </Button>
        </div>

        {fileRejections.length > 0 && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">File rejected</span>
            </div>
          </div>
        )}

        {uploadedFile && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{uploadedFile.name}</span>
              <span className="text-sm text-muted-foreground">
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
            {isProcessing && (
              <div>
                <Progress value={uploadProgress} className="mb-2" />
                <p className="text-sm text-muted-foreground">
                  Analyzing DNA sequences…
                </p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Results Section */}
      {result && (
        <Card className="p-8 glass">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-display font-bold">Analysis Results</h3>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadResults("json")}
              >
                <Download className="w-4 h-4 mr-2" /> JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadResults("csv")}
              >
                <Download className="w-4 h-4 mr-2" /> CSV
              </Button>
            </div>
          </div>

          <Tabs defaultValue="summary" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="clusters">Clusters</TabsTrigger>
              <TabsTrigger value="download">Export</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-6 bg-emerald/10 rounded-lg">
                  <div className="text-3xl font-bold text-emerald mb-2">
                    {result.summary.n_reads}
                  </div>
                  <div className="text-sm text-muted-foreground">Reads</div>
                </div>
                <div className="text-center p-6 bg-accent/10 rounded-lg">
                  <div className="text-3xl font-bold text-accent mb-2">
                    {result.summary.n_clusters_excl_noise}
                  </div>
                  <div className="text-sm text-muted-foreground">Clusters</div>
                </div>
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <div className="text-3xl font-bold mb-2">
                    {result.summary.shannon_index !== undefined
                      ? Math.abs(result.summary.shannon_index).toFixed(3)
                      : "—"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Shannon Index
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="clusters" className="space-y-4">
              <div className="space-y-2">
                {Object.entries(result.summary.clusters).map(
                  ([label, count]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                    >
                      <div className="font-medium">Cluster {label}</div>
                      <div className="font-medium">{count} reads</div>
                    </div>
                  )
                )}
              </div>
            </TabsContent>

            <TabsContent value="download" className="text-center">
              <p className="text-muted-foreground mb-4">
                Download your analysis results
              </p>
              <div className="flex justify-center space-x-4">
                <Button onClick={() => downloadResults("json")}>
                  Download JSON
                </Button>
                <Button variant="outline" onClick={() => downloadResults("csv")}>
                  Download CSV
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      )}

      <div className="text-center text-sm text-muted-foreground">
        <p>
          <strong>Research Demo Notice:</strong> This is a demonstration system.
          Not for clinical or production use.
        </p>
      </div>
    </div>
  );
};
