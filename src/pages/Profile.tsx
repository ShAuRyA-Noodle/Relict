import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";
import { listJobs, type JobPublic } from "@/lib/api";
import {
  User, FileText, CheckCircle, XCircle, Loader2, LogOut, ChevronRight, Plus,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Profile() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate("/demo");
  }, [loading, isAuthenticated, navigate]);

  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ["jobs-list"],
    queryFn: () => listJobs(50, 0),
    enabled: isAuthenticated,
    refetchInterval: 10000,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) return null;

  const jobs = jobsData?.items || [];
  const total = jobsData?.total || 0;
  const succeeded = jobs.filter((j) => j.status === "succeeded").length;
  const failed = jobs.filter((j) => j.status === "failed").length;
  const running = jobs.filter((j) => j.status === "running" || j.status === "queued").length;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32 pb-24">
        <div className="container-page max-w-5xl">
          {/* Profile header */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="surface-card p-7 md:p-8 mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-xl truncate">{user.email}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">
                    {user.id.slice(0, 8)}… · {user.role} · joined {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { logout(); navigate("/"); }}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </motion.div>

          {/* Stat row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Stat label="Total" value={total} icon={<FileText className="w-4 h-4 text-muted-foreground" />} />
            <Stat label="Completed" value={succeeded} icon={<CheckCircle className="w-4 h-4 text-success" />} />
            <Stat label="Failed" value={failed} icon={<XCircle className="w-4 h-4 text-destructive" />} />
            <Stat label="In progress" value={running} icon={<Loader2 className="w-4 h-4 text-amber-500" />} />
          </div>

          {/* Job list */}
          <div className="surface-card overflow-hidden">
            <div className="p-5 md:p-6 border-b border-border flex items-center justify-between">
              <h2 className="font-display text-lg">Analysis history</h2>
              <Link
                to="/demo"
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-border text-sm hover:bg-muted transition-colors"
              >
                <Plus className="w-4 h-4" />
                New
              </Link>
            </div>

            {jobsLoading ? (
              <div className="p-12 text-center text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-3" />
                Loading…
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-10 h-10 mx-auto text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground mb-4">No analyses yet.</p>
                <Link to="/demo" className="text-primary hover:underline text-sm">
                  Upload your first FASTQ →
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {jobs.map((j) => (
                  <JobRow key={j.id} job={j} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

const Stat = ({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) => (
  <div className="surface-card p-5">
    <div className="flex items-center justify-between mb-3">
      {icon}
      <span className="font-display text-2xl tabular-nums">{value}</span>
    </div>
    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
  </div>
);

const STATUS = {
  succeeded: { label: "Done",     cls: "bg-success/10 text-success border-success/20" },
  failed:    { label: "Failed",   cls: "bg-destructive/10 text-destructive border-destructive/20" },
  running:   { label: "Running",  cls: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  queued:    { label: "Queued",   cls: "bg-muted text-muted-foreground border-border" },
  cancelled: { label: "Cancelled", cls: "bg-muted text-muted-foreground border-border" },
} as const;

function JobRow({ job }: { job: JobPublic }) {
  const s = STATUS[job.status as keyof typeof STATUS] || STATUS.queued;
  const created = new Date(job.created_at);
  const runtime = job.started_at && job.finished_at
    ? ((new Date(job.finished_at).getTime() - new Date(job.started_at).getTime()) / 1000).toFixed(1) + "s"
    : "—";

  return (
    <li>
      <Link
        to={job.status === "succeeded" ? `/jobs/${job.id}` : "#"}
        className={`flex items-center justify-between gap-4 p-4 md:p-5 transition-colors group ${
          job.status === "succeeded" ? "hover:bg-muted" : "cursor-default"
        }`}
      >
        <div className="flex items-center gap-4 min-w-0">
          <span className={`shrink-0 inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-[var(--radius-xs)] border ${s.cls}`}>
            {s.label}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-mono truncate">{job.id.slice(0, 12)}…</p>
            <p className="text-xs text-muted-foreground">
              {created.toLocaleDateString()} · {created.toLocaleTimeString()} · {job.amplicon} · {runtime}
              {job.pipeline_version && ` · v${job.pipeline_version}`}
            </p>
          </div>
        </div>
        {job.status === "succeeded" && (
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
        )}
      </Link>
    </li>
  );
}
