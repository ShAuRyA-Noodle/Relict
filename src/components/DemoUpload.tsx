import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, AlertCircle, LogIn, UserPlus, ArrowUpRight, CheckCircle2, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { uploadSample, getJob, createJobWebSocket } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      toast({ title: authMode === "signup" ? "Account created" : "Signed in" });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Auth failed";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setAuthLoading(false);
    }
  };

  // Real-time job status — preserved exactly
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
      } catch {
        /* malformed WS frame — ignore, server will resend on next tick */
      }
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
        } catch {
          /* transient poll failure — let next tick retry */
        }
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
      setStageMessage("Uploading sequence…");

      try {
        const result = await uploadSample(file);
        const jid = result.sample.job_id;
        setJobId(jid);
        setUploadProgress(10);
        setStageMessage("Upload complete. Initializing pipeline…");

        toast({
          title: "Upload received",
          description: `${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
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

  // ─── Unauthenticated: editorial sign-in card ──────────────────────────
  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="surface-card p-7 md:p-8 max-w-md"
      >
        <p className="eyebrow mb-5">
          <span className="eyebrow-dot" />
          {authMode === "signup" ? "Create account" : "Sign in"}
        </p>
        <h2 className="h-display text-xl mb-2">
          {authMode === "signup" ? "Get a workspace." : "Welcome back."}
        </h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {authMode === "signup"
            ? "Pipelines run under your account so you can revisit jobs, exports, and provenance manifests anytime."
            : "Pick up where you left off. Job history and exports are tied to your account."}
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
            <Input
              type="email"
              placeholder="you@lab.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={authMode === "signup" ? "new-password" : "current-password"}
              onKeyDown={(e) => e.key === "Enter" && handleAuth()}
            />
          </div>
          <Button
            onClick={handleAuth}
            disabled={authLoading || !email || !password}
            className="w-full mt-1"
            size="lg"
          >
            {authLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : authMode === "signup" ? (
              <><UserPlus className="w-4 h-4 mr-1.5" /> Create account</>
            ) : (
              <><LogIn className="w-4 h-4 mr-1.5" /> Sign in</>
            )}
          </Button>
        </div>

        <div className="mt-6 pt-5 border-t border-border text-center text-sm text-muted-foreground">
          {authMode === "signup" ? "Already have an account?" : "New here?"}{" "}
          <button
            onClick={() => setAuthMode(authMode === "signup" ? "login" : "signup")}
            className="text-foreground hover:underline underline-offset-4"
          >
            {authMode === "signup" ? "Sign in" : "Create one"}
          </button>
        </div>
      </motion.div>
    );
  }

  // ─── Authenticated: dropzone + progress ────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Connection bar */}
      <div className="surface-card flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="relative flex w-2 h-2 shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60 animate-ping" />
            <span className="relative inline-flex w-2 h-2 rounded-full bg-success" />
          </span>
          <p className="text-sm text-muted-foreground truncate">
            Signed in as <span className="text-foreground font-medium">{user?.email}</span>
          </p>
        </div>
        <button
          onClick={logout}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "relative rounded-[var(--radius-lg)] border-2 border-dashed bg-card",
          "p-12 sm:p-16 text-center cursor-pointer transition-colors duration-base ease-out",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-foreground/40 hover:bg-muted/40",
          isProcessing && "pointer-events-none opacity-60",
        )}
      >
        <input {...getInputProps()} />
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: isDragActive ? 1.06 : 1 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center mb-5 transition-colors",
              isDragActive ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70",
            )}
          >
            <Upload className="w-5 h-5" />
          </div>
          {isDragActive ? (
            <p className="font-display text-lg">Drop to upload</p>
          ) : (
            <>
              <p className="font-display text-lg mb-1.5">Drop a FASTQ or FASTA sample</p>
              <p className="text-sm text-muted-foreground">
                or click to browse · up to 500 MiB
              </p>
            </>
          )}
          <div className="mt-5 flex flex-wrap justify-center gap-1.5">
            {[".fastq", ".fq", ".fasta", ".fa", ".fna", ".gz"].map((x) => (
              <span key={x} className="mono-chip">{x}</span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Progress */}
      <AnimatePresence>
        {(isProcessing || jobStatus) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="surface-card p-6 space-y-5"
          >
            {uploadedFile && (
              <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-border">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-sm truncate">{uploadedFile.name}</span>
                <span className="mono-chip">{(uploadedFile.size / 1024).toFixed(1)} KB</span>
                <div className="ml-auto">
                  {jobStatus === "succeeded" && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-[var(--radius-xs)] bg-success/15 text-success border border-success/20">
                      <CheckCircle2 className="w-3 h-3" /> Complete
                    </span>
                  )}
                  {jobStatus === "failed" && (
                    <span className="text-xs px-2 py-0.5 rounded-[var(--radius-xs)] bg-destructive/15 text-destructive border border-destructive/20">
                      Failed
                    </span>
                  )}
                  {isProcessing && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-[var(--radius-xs)] bg-amber-500/15 text-amber-500 border border-amber-500/20">
                      <Loader2 className="w-3 h-3 animate-spin" /> Processing
                    </span>
                  )}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>{isProcessing ? "Pipeline" : "Status"}</span>
                <span className="tabular-nums font-medium text-foreground">{uploadProgress}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>

            {stageMessage && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="text-primary mr-1.5">›</span>
                {stageMessage}
              </p>
            )}

            {error && (
              <div className="flex items-start gap-3 p-3 rounded-[var(--radius-sm)] bg-destructive/10 border border-destructive/20">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-destructive mb-0.5">Pipeline error</p>
                  <p className="text-muted-foreground">{error}</p>
                </div>
              </div>
            )}

            {jobStatus === "succeeded" && jobId && (
              <Button onClick={() => navigate(`/jobs/${jobId}`)} className="w-full" size="lg">
                Open results <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
