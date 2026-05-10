import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Github, Linkedin, Mail, ExternalLink, Database, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

const dependencies = [
  { name: "NCBI Sequence Read Archive", role: "Public sequencing data" },
  { name: "SILVA 138.1",                role: "rRNA reference taxonomy" },
  { name: "MIDORI2",                    role: "COI / 12S references" },
  { name: "GBIF",                       role: "Occurrence records" },
  { name: "IUCN Red List",              role: "Conservation assessments" },
  { name: "MGnify (EMBL-EBI)",          role: "Metagenomic studies" },
];

const refs = [
  { title: "DNABERT-S: pioneering species differentiation", venue: "arXiv (2024)" },
  { title: "AI-assisted eDNA for marine monitoring",        venue: "MDPI (2024)" },
  { title: "VSEARCH: a versatile open-source tool for metagenomics", venue: "PeerJ (2016)" },
  { title: "DADA2: high-resolution sample inference",       venue: "Nature Methods (2016)" },
  { title: "The SILVA ribosomal RNA gene database project", venue: "NAR (2013)" },
];

const About = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32 pb-24">
        <div className="container-page max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mb-14 max-w-3xl"
          >
            <p className="eyebrow mb-5">
              <span className="eyebrow-dot" />
              About
            </p>
            <h1 className="h-display text-display-lg mb-5 text-balance">
              An independent, end-to-end environmental DNA platform.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Relict is designed, engineered, and deployed by a single developer — from
              research design and pipeline architecture to data engineering, frontend,
              and deployment. Built to meet real-world scientific needs, not benchmarks
              for their own sake.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-5 mb-12">
            {/* Author panel */}
            <div className="surface-card p-7 md:p-8">
              <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground mb-4">
                Author
              </div>
              <h2 className="h-display text-2xl mb-1">Shaurya Punj</h2>
              <p className="text-sm text-primary mb-5">Architect · Full-stack engineer · ML researcher</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Built every layer of Relict — research design, ML integration,
                bioinformatics pipelines, database engineering, visualization, and
                deployment — to meet real scientific needs.
              </p>
              <div className="mt-6 flex items-center gap-1.5">
                <SocialIcon href="https://github.com/ShAuRyA-Noodle"  Icon={Github}   label="GitHub" />
                <SocialIcon href="https://www.linkedin.com/in/shaurya-punj-2287513b3/" Icon={Linkedin} label="LinkedIn" />
                <SocialIcon href="https://www.shauryapunj.com/contact" Icon={Mail}    label="Contact" />
              </div>
            </div>

            {/* Dependencies + theory */}
            <div className="space-y-5">
              <div className="surface-card p-7">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground mb-4">
                  <Database className="w-3.5 h-3.5" />
                  Upstream dependencies
                </div>
                <ul className="divide-y divide-border">
                  {dependencies.map((d) => (
                    <li key={d.name} className="flex items-center justify-between py-2.5">
                      <span className="text-sm">{d.name}</span>
                      <span className="text-xs text-muted-foreground">{d.role}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="surface-card p-7">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground mb-4">
                  <BookOpen className="w-3.5 h-3.5" />
                  Theoretical foundations
                </div>
                <ul className="space-y-3">
                  {refs.map((r) => (
                    <li key={r.title} className="flex items-baseline gap-3">
                      <span className="w-1 h-1 rounded-full bg-foreground/40 translate-y-[6px]" />
                      <div className="min-w-0">
                        <p className="text-sm leading-snug">{r.title}</p>
                        <p className="text-xs text-muted-foreground">{r.venue}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Collaboration CTA */}
          <div className="surface-elevated bg-gradient-hero p-10 md:p-14 text-center">
            <h3 className="h-display text-2xl md:text-3xl mb-3 text-balance">
              Open to academic collaboration.
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
              Relict is MIT-licensed. External researchers seeking pipeline access,
              applied benchmarking protocols, or co-deployment can reach out directly.
            </p>
            <a
              href="https://www.shauryapunj.com/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-11 px-5 rounded-md bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors duration-fast"
            >
              Get in touch
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const SocialIcon = ({ href, Icon, label }: { href: string; Icon: typeof Github; label: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="inline-flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
  >
    <Icon className="w-4 h-4" />
  </a>
);

export default About;
