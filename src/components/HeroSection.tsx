import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, FileText } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

export const HeroSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-[88vh] flex items-center pt-32 pb-24 overflow-hidden"
    >
      {/* Soft hero gradient backdrop, very subtle */}
      <div className="absolute inset-0 bg-gradient-hero pointer-events-none" aria-hidden />

      <motion.div
        style={{ y: titleY, opacity: titleOpacity }}
        className="container-page relative z-10"
      >
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="eyebrow mb-8"
        >
          <span className="eyebrow-dot" />
          Environmental DNA · Open source · v0.1
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="h-display max-w-5xl text-display-2xl text-balance"
        >
          Read the <em className="italic font-light text-primary">biosphere&apos;s</em> faintest
          signals. Reproducibly.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-7 max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty"
        >
          Relict turns raw FASTQ from water, soil, and sediment into ASV inferences,
          conservation cross-references, and signed provenance manifests — using real,
          version-pinned bioinformatics tools, not black-box models.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-wrap items-center gap-3"
        >
          <Link
            to="/demo"
            className="inline-flex items-center gap-1.5 h-11 px-5 rounded-md bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors duration-fast"
          >
            Run the pipeline
            <ArrowUpRight className="w-4 h-4" />
          </Link>
          <a
            href="/relict_paper.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 h-11 px-5 rounded-md border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors duration-fast"
          >
            <FileText className="w-4 h-4" />
            Read the paper
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-muted-foreground"
        >
          <Stat label="Pipeline" value="fastp · vsearch · scikit-bio" />
          <span className="hidden sm:inline-block w-px h-4 bg-border" />
          <Stat label="Reference" value="SILVA 138.1 · MIDORI2" />
          <span className="hidden sm:inline-block w-px h-4 bg-border" />
          <Stat label="License" value="MIT" />
        </motion.div>
      </motion.div>
    </section>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <span className="inline-flex items-baseline gap-2">
    <span className="uppercase tracking-[0.16em] text-[10px]">{label}</span>
    <span className="font-mono text-[11px] text-foreground/80">{value}</span>
  </span>
);
