import { useRef } from "react";
import { FileInput, Cpu, Database, FileCheck2 } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

const steps = [
  {
    n: "01",
    title: "Ingest & QC",
    icon: FileInput,
    body: "Raw FASTA/FASTQ uploads are validated, hashed (SHA-256), and quality-filtered with fastp. Adapters trimmed; Phred thresholds enforced.",
    out: "fastp · v0.24 — quality-controlled reads",
  },
  {
    n: "02",
    title: "ASV inference",
    icon: Cpu,
    body: "Reads are dereplicated and denoised into amplicon sequence variants with vsearch (UNOISE3). Per-job parameter hashes are recorded.",
    out: "vsearch · UNOISE3 — denoised ASV table",
  },
  {
    n: "03",
    title: "Taxonomy & cross-reference",
    icon: Database,
    body: "ASVs are aligned against version-pinned SILVA 138.1 / MIDORI2 references. Each taxon is then cross-referenced against GBIF and the IUCN Red List.",
    out: "SILVA · GBIF · IUCN — annotated taxonomy",
  },
  {
    n: "04",
    title: "Signed provenance",
    icon: FileCheck2,
    body: "Inputs, tool versions, database versions, parameters, and outputs are bound into a signed JSON manifest — independently re-verifiable.",
    out: "manifest.json — signed, hash-bound",
  },
];

export const HowItWorksSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.6", "end 0.4"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={containerRef} className="relative py-24 md:py-32 border-t border-border">
      <div className="container-page">
        <div className="max-w-3xl mb-16 md:mb-24">
          <p className="eyebrow mb-5">
            <span className="eyebrow-dot" />
            Pipeline
          </p>
          <h2 className="h-display text-display-lg text-balance">
            From raw reads to verifiable conservation context — in four traceable stages.
          </h2>
        </div>

        <div className="relative pl-8 md:pl-12">
          {/* Pipeline trace line */}
          <div
            className="absolute top-2 bottom-2 left-[11px] md:left-[15px] w-px bg-border"
            aria-hidden
          />
          <motion.div
            className="absolute top-2 left-[11px] md:left-[15px] w-px bg-foreground origin-top"
            style={{ scaleY: lineScale, height: "calc(100% - 1rem)" }}
            aria-hidden
          />

          <div className="space-y-16 md:space-y-24">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="relative grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-12"
              >
                {/* Node */}
                <div
                  className="absolute -left-8 md:-left-12 top-1.5 w-[22px] md:w-[30px] h-[22px] md:h-[30px] rounded-full bg-background border border-border flex items-center justify-center"
                  aria-hidden
                >
                  <span className="w-2 h-2 rounded-full bg-foreground" />
                </div>

                <div>
                  <p className="font-mono text-xs text-muted-foreground mb-2">Step {s.n}</p>
                  <h3 className="h-display text-2xl flex items-center gap-2.5">
                    <s.icon className="w-5 h-5 text-primary" />
                    {s.title}
                  </h3>
                </div>

                <div>
                  <p className="text-base text-foreground/80 leading-relaxed max-w-xl">
                    {s.body}
                  </p>
                  <p className="mt-4 inline-flex items-center text-xs font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded-[var(--radius-xs)] border border-border">
                    <span className="w-1.5 h-1.5 rounded-full bg-success mr-2" />
                    {s.out}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
