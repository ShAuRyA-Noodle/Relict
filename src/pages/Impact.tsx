import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Target, Shield, FileCheck2, Users, Leaf } from "lucide-react";
import { motion } from "framer-motion";

const pillars = [
  {
    icon: Target,
    title: "Non-invasive sampling",
    body: "DNA traces are isolated from water, soil, and sediment — no organism capture or disruption required. Surfaces rare, cryptic, and nocturnal taxa traditional surveys miss.",
  },
  {
    icon: Shield,
    title: "Conservation cross-referencing",
    body: "Every detected taxon is cross-referenced against GBIF and the IUCN Red List, so users see conservation status alongside detections — not after the fact.",
  },
  {
    icon: FileCheck2,
    title: "Signed provenance",
    body: "Inputs, tool versions, database versions, parameters, and outputs are bound into a signed JSON manifest. Any result can be independently re-verified.",
  },
];

const sdg = [
  { n: 14, t: "Life below water",   d: "Marine resource tracking and ocean-health baselines." },
  { n: 15, t: "Life on land",       d: "Terrestrial ecosystem monitoring and preservation." },
  { n: 13, t: "Climate action",     d: "Baseline biodiversity shifts as climate signal." },
];

const Impact = () => {
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
              Why this matters
            </p>
            <h1 className="h-display text-display-lg mb-5 text-balance">
              Precision biodiversity monitoring, in service of the planet.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Relict was built so that researchers, conservation teams, and citizen
              scientists could move from a water sample to a verifiable ecological
              insight — without proprietary tooling, hidden parameters, or unprovenanced
              numbers.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
            {pillars.map((p, i) => (
              <motion.article
                key={p.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="surface-card p-6 md:p-7"
              >
                <p.icon className="w-5 h-5 text-primary mb-4" />
                <h3 className="h-display text-lg mb-2.5">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
              </motion.article>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-5">
            <div className="surface-card p-7 md:p-9">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <Users className="w-4 h-4" />
                Built for two audiences
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="h-display text-base mb-3">Research labs</h4>
                  <ul className="space-y-2.5 text-sm text-muted-foreground leading-relaxed">
                    <li>One-command reproducible pipelines</li>
                    <li>Signed provenance for supplementary materials</li>
                    <li>BIOM / QIIME 2 / phyloseq exports</li>
                    <li>Benchmark reports against published studies</li>
                  </ul>
                </div>
                <div>
                  <h4 className="h-display text-base mb-3">Field & citizen scientists</h4>
                  <ul className="space-y-2.5 text-sm text-muted-foreground leading-relaxed">
                    <li>Plain-language conservation reports</li>
                    <li>IUCN status on every detected taxon</li>
                    <li>One-click GBIF DNA-derived occurrence submission</li>
                    <li>No bioinformatics CLI required</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="surface-card p-7 md:p-9 flex flex-col">
              <div className="text-sm text-muted-foreground mb-6">UN Sustainable Development</div>
              <ul className="space-y-5">
                {sdg.map((g) => (
                  <li key={g.n} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex items-center justify-center w-9 h-9 rounded-md bg-primary/10 text-primary font-mono text-sm font-medium">
                      {g.n}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{g.t}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{g.d}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-6 mt-8 border-t border-border flex items-center gap-2 text-xs text-success">
                <Leaf className="w-4 h-4" />
                Open-source, MIT-licensed
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Impact;
