import { Link } from "react-router-dom";
import { Waves, Trees, Droplets, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const cases = [
  {
    title: "Marine pelagic",
    icon: Waves,
    body: "Track ocean health indicators and elusive chondrichthyan populations from dispersed genetic markers in 1–10 L water grabs.",
    facts: ["Depth ranges to 500 m", "Salinity-tolerant primers"],
  },
  {
    title: "Terrestrial lentic",
    icon: Trees,
    body: "Reconstruct mammalian presence matrices from waterholes, sampling shed cells from dermal layers, urine, and saliva.",
    facts: ["Riparian-zone surveys", "Multi-day persistence"],
  },
  {
    title: "Lotic systems",
    icon: Droplets,
    body: "Longitudinal watershed biodiversity tracking; reconstruct upstream macroinvertebrate and teleost communities from filtrate.",
    facts: ["Flow-corrected sampling", "Turbidity-aware QC"],
  },
];

export const UseCasesSection = () => {
  return (
    <section className="relative py-24 md:py-32 border-t border-border">
      <div className="container-page">
        <div className="max-w-3xl mb-16 md:mb-20">
          <p className="eyebrow mb-5">
            <span className="eyebrow-dot" />
            Field deployments
          </p>
          <h2 className="h-display text-display-lg text-balance">
            One pipeline, three biomes. Same provenance guarantees.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {cases.map((c, i) => (
            <motion.article
              key={c.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="surface-card p-6 md:p-7 flex flex-col gap-5 min-h-[280px]"
            >
              <c.icon className="w-5 h-5 text-primary" />
              <h3 className="h-display text-xl">{c.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">{c.body}</p>
              <ul className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                {c.facts.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-foreground/40" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 md:mt-24 surface-elevated bg-gradient-hero p-10 md:p-14 text-center"
        >
          <p className="eyebrow mb-5 justify-center">
            <span className="eyebrow-dot" />
            Try it now
          </p>
          <h3 className="h-display text-display-lg max-w-2xl mx-auto text-balance mb-5">
            Upload a sample. Get an annotated, signed analysis in minutes.
          </h3>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
            FASTQ or FASTA, up to 500 MiB. Free, MIT-licensed. No vendor lock-in on outputs.
          </p>
          <Link
            to="/demo"
            className="inline-flex items-center gap-1.5 h-11 px-5 rounded-md bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors duration-fast"
          >
            Run the demo
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
