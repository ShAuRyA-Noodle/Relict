import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ShieldAlert, CheckCircle2, Loader2 } from "lucide-react";

const dbs = [
  { name: "SILVA 138.1",   role: "16S / 18S rRNA",       status: "online", latency: 12 },
  { name: "MIDORI2",       role: "COI / 12S",            status: "online", latency: 24 },
  { name: "GBIF",          role: "Occurrence records",    status: "online", latency: 45 },
  { name: "IUCN Red List", role: "Conservation status",   status: "online", latency: 18 },
  { name: "NCBI GenBank",  role: "Sequence archive",      status: "syncing", latency: 112 },
] as const;

const Counter = ({ from, to, decimals = 0, suffix = "" }: { from: number; to: number; decimals?: number; suffix?: string }) => {
  const [v, setV] = useState(from);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1600;
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      setV(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, from, to]);

  return (
    <span ref={ref}>
      {v.toFixed(decimals)}{suffix}
    </span>
  );
};

export const CredibilitySection = () => {
  return (
    <section className="relative py-24 md:py-32 border-t border-border">
      <div className="container-page">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-16">
          {/* Left: stats */}
          <div>
            <p className="eyebrow mb-5">
              <span className="eyebrow-dot" />
              Reference layer
            </p>
            <h2 className="h-display text-display-lg text-balance mb-6">
              Built on version-pinned, public reference databases.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-10 max-w-xl">
              Every alignment is bound to a database version and tool build that ships in
              the provenance manifest. No silent migrations. No hidden fine-tunes.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px overflow-hidden rounded-[var(--radius)] border border-border bg-border">
              <Stat label="Reference sequences" value={<><Counter from={0} to={2.4} decimals={1} /><span className="text-muted-foreground ml-1">M</span></>} />
              <Stat label="Pinned DB versions" value={<><Counter from={0} to={5} /></>} />
              <Stat label="Hash-verified outputs" value={<><Counter from={0} to={100} suffix="%" /></>} />
            </div>
          </div>

          {/* Right: database table */}
          <div className="surface-card p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm font-medium">Reference databases</p>
              <span className="font-mono text-[11px] text-muted-foreground">live status</span>
            </div>

            <ul className="divide-y divide-border">
              {dbs.map((db, i) => (
                <motion.li
                  key={db.name}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center justify-between py-3.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {db.status === "online" ? (
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                    ) : (
                      <Loader2 className="w-4 h-4 text-muted-foreground animate-spin shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{db.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{db.role}</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {db.latency}ms
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        {/* Scope notice */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 surface-card p-6 md:p-7 flex flex-col md:flex-row md:items-center gap-4 md:gap-6"
        >
          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">Research scope only</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Outputs are intended for environmental studies, baseline monitoring, and
              bioinformatics research. Not clinically, legally, or forensically certified.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Stat = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="bg-card p-6">
    <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-2">{label}</p>
    <p className="font-display text-3xl tracking-tight tabular-nums">{value}</p>
  </div>
);
