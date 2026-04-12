import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";
import { listJobs, type JobPublic } from "@/lib/api";
import {
  User, Clock, FileText, CheckCircle, XCircle,
  Loader2, LogOut, ChevronRight
} from "lucide-react";

export default function Profile() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/demo");
    }
  }, [loading, isAuthenticated, navigate]);

  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ["jobs-list"],
    queryFn: () => listJobs(50, 0),
    enabled: isAuthenticated,
    refetchInterval: 10000,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const jobs = jobsData?.items || [];
  const totalJobs = jobsData?.total || 0;
  const succeededJobs = jobs.filter(j => j.status === "succeeded").length;
  const failedJobs = jobs.filter(j => j.status === "failed").length;
  const runningJobs = jobs.filter(j => j.status === "running" || j.status === "queued").length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Profile header */}
        <div className="border border-white/10 bg-black/60 backdrop-blur-sm p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{user.email}</h1>
                <p className="text-sm text-gray-400 font-mono">
                  ID: {user.id.slice(0, 8)}... | Role: {user.role} | Joined: {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => { logout(); navigate("/"); }}
              className="text-xs text-red-500 hover:text-red-400 border border-red-500/30 px-4 py-2 hover:bg-red-500/10 transition-colors uppercase flex items-center"
            >
              <LogOut className="w-3 h-3 mr-2" /> Sign Out
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Analyses" value={totalJobs} icon={<FileText className="w-5 h-5" />} />
          <StatCard label="Completed" value={succeededJobs} icon={<CheckCircle className="w-5 h-5 text-green-500" />} />
          <StatCard label="Failed" value={failedJobs} icon={<XCircle className="w-5 h-5 text-red-500" />} />
          <StatCard label="In Progress" value={runningJobs} icon={<Loader2 className="w-5 h-5 text-yellow-500" />} />
        </div>

        {/* Job history */}
        <div className="border border-white/10 bg-black/60 backdrop-blur-sm">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white uppercase tracking-wide">Analysis History</h2>
            <Link to="/demo" className="text-xs text-primary hover:text-white border border-primary/30 px-3 py-1 hover:bg-primary/10 transition-colors uppercase">
              New Analysis
            </Link>
          </div>

          {jobsLoading ? (
            <div className="p-12 text-center text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Loading history...
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 mb-4">No analyses yet</p>
              <Link to="/demo" className="text-primary hover:underline text-sm">
                Upload your first FASTQ to get started
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {jobs.map((job) => (
                <JobRow key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="border border-white/10 bg-black/60 p-4">
      <div className="flex items-center justify-between mb-2">
        {icon}
        <span className="text-2xl font-bold text-white font-mono">{value}</span>
      </div>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
    </div>
  );
}

function JobRow({ job }: { job: JobPublic }) {
  const statusConfig: Record<string, { color: string; label: string }> = {
    succeeded: { color: "text-green-500 bg-green-500/10 border-green-500/30", label: "DONE" },
    failed: { color: "text-red-500 bg-red-500/10 border-red-500/30", label: "FAIL" },
    running: { color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30", label: "RUNNING" },
    queued: { color: "text-blue-500 bg-blue-500/10 border-blue-500/30", label: "QUEUED" },
    cancelled: { color: "text-gray-500 bg-gray-500/10 border-gray-500/30", label: "CANCELLED" },
  };

  const s = statusConfig[job.status] || statusConfig.queued;
  const created = new Date(job.created_at);
  const runtime = job.started_at && job.finished_at
    ? ((new Date(job.finished_at).getTime() - new Date(job.started_at).getTime()) / 1000).toFixed(1) + "s"
    : "—";

  return (
    <Link
      to={job.status === "succeeded" ? `/jobs/${job.id}` : "#"}
      className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
    >
      <div className="flex items-center space-x-4">
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${s.color}`}>
          {s.label}
        </span>
        <div>
          <p className="text-sm text-white font-mono">
            {job.id.slice(0, 12)}...
          </p>
          <p className="text-xs text-gray-500">
            {created.toLocaleDateString()} {created.toLocaleTimeString()} | {job.amplicon} | Runtime: {runtime}
            {job.pipeline_version && ` | v${job.pipeline_version}`}
          </p>
        </div>
      </div>
      {job.status === "succeeded" && (
        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-primary transition-colors" />
      )}
    </Link>
  );
}
