import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, AlertCircle, LogIn, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  uploadSample,
  getJob,
  createJobWebSocket,
  type JobPublic,
} from "@/lib/api";

export const DemoUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string>("");
  const [stageMessage, setStageMessage] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated, login, signup: signupFn, logout } = useAuth();

  const handleAuth = async () => {
    if (!email || !password) return;
    setAuthLoading(true);
    try {
      if (authMode === "signup") {
        await signupFn(email, password);
      } else {
        await login(email, password);
      }
      toast({ title: authMode === "signup" ? "Account created" : "Logged in" });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Auth failed";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    if (!jobId) return;
    const ws = createJobWebSocket(jobId);
    if (!ws) return;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.progress !== undefined) {
          setUploadProgress(Math.round(data.progress * 100));
        }
        if (data.message) {
          setStageMessage(data.message);
        }
        if (data.kind === "job.succeeded") {
          setJobStatus("succeeded");
          setIsProcessing(false);
          toast({ title: "Analysis complete", description: "View your results" });
        }
        if (data.kind === "job.failed") {
          setJobStatus("failed");
          setIsProcessing(false);
          setError(data.message || "Pipeline failed");
        }
      } catch {}
    };

    ws.onerror = () => {
      const pollInterval = setInterval(async () => {
        try {
          const job = await getJob(jobId);
          if (job.status === "succeeded" || job.status === "failed") {
            setJobStatus(job.status);
            setIsProcessing(false);
            if (job.status === "succeeded") {
              toast({ title: "Analysis complete" });
            } else {
              setError(job.error_message || "Pipeline failed");
            }
            clearInterval(pollInterval);
          }
        } catch {}
      }, 3000);
      return () => clearInterval(pollInterval);
    };

    return () => { ws.close(); };
  }, [jobId, toast]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setUploadedFile(file);
      setIsProcessing(true);
      setUploadProgress(5);
      setError(null);
      setJobId(null);
      setJobStatus("");
      setStageMessage("Uploading...");

      try {
        const result = await uploadSample(file);
        const jid = result.sample.job_id;
        setJobId(jid);
        setUploadProgress(10);
        setStageMessage("Upload complete — pipeline starting...");

        toast({
          title: "Upload successful",
          description: `${file.name} (${(file.size / 1024).toFixed(1)} KB) — processing started`,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        setError(msg);
        setIsProcessing(false);
        toast({ title: "Upload failed", description: msg, variant: "destructive" });
      }
    },
    [toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/octet-stream": [".fastq", ".fq", ".fasta", ".fa", ".fna", ".fastq.gz", ".fq.gz"],
    },
    maxFiles: 1,
    disabled: isProcessing || !isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <Card className="p-8 glass max-w-lg mx-auto">
        <h2 className="text-2xl font-display font-bold mb-4 text-center">
          {authMode === "signup" ? "Create an account" : "Sign in"} to analyze
        </h2>
        <p className="text-muted-foreground text-center mb-6">
          Real eDNA analysis requires an account so your results are saved and private.
        </p>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border bg-background"
          />
          <input
            type="password"
            placeholder="Password (12+ characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border bg-background"
          />
          <Button onClick={handleAuth} disabled={authLoading} className="w-full" size="lg">
            {authLoading ? "..." : authMode === "signup" ? (
              <><UserPlus className="w-4 h-4 mr-2" /> Create Account</>
            ) : (
              <><LogIn className="w-4 h-4 mr-2" /> Sign In</>
            )}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            {authMode === "signup" ? "Already have an account?" : "Need an account?"}{" "}
            <button
              onClick={() => setAuthMode(authMode === "signup" ? "login" : "signup")}
              className="text-emerald underline"
            >
              {authMode === "signup" ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Signed in as <strong>{user?.email}</strong>
        </p>
        <Button variant="ghost" size="sm" onClick={logout}>Sign out</Button>
      </div>

      <Card
        {...getRootProps()}
        className={cn(
          "p-12 border-2 border-dashed cursor-pointer transition-all duration-300 text-center",
          isDragActive ? "border-emerald bg-emerald/5" : "border-muted hover:border-emerald/50",
          isProcessing && "pointer-events-none opacity-60"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        {isDragActive ? (
          <p className="text-lg font-medium text-emerald">Drop your FASTQ file here</p>
        ) : (
          <>
            <p className="text-lg font-medium mb-2">
              Drag & drop a FASTQ / FASTA file, or click to browse
            </p>
            <p className="text-sm text-muted-foreground">
              Supported: .fastq, .fq, .fasta, .fa, .fastq.gz
            </p>
          </>
        )}
      </Card>

      {(isProcessing || jobStatus) && (
        <Card className="p-6 space-y-4">
          {uploadedFile && (
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-emerald" />
              <span className="font-medium">{uploadedFile.name}</span>
              <Badge variant="secondary">{(uploadedFile.size / 1024).toFixed(1)} KB</Badge>
              {jobStatus === "succeeded" && <Badge className="bg-emerald text-white">Complete</Badge>}
              {jobStatus === "failed" && <Badge variant="destructive">Failed</Badge>}
              {isProcessing && <Badge variant="outline">Processing...</Badge>}
            </div>
          )}

          <Progress value={uploadProgress} className="h-2" />

          {stageMessage && (
            <p className="text-sm text-muted-foreground">{stageMessage}</p>
          )}

          {error && (
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {jobStatus === "succeeded" && jobId && (
            <Button onClick={() => navigate(`/jobs/${jobId}`)} className="w-full" size="lg">
              View Results
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};
