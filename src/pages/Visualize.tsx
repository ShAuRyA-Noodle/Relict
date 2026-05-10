import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowUpRight, BarChart3, Activity } from "lucide-react";
import { motion } from "framer-motion";

const Visualize = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32 pb-24">
        <div className="container-page max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mb-12"
          >
            <p className="eyebrow mb-5">
              <span className="eyebrow-dot" />
              Visualization
            </p>
            <h1 className="h-display text-display-lg mb-5 text-balance">
              Topology, diversity, and conservation — at a glance.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Interactive ordinations and per-sample diversity metrics live alongside
              the ASV table and IUCN status — all driven by the same provenance-bound
              outputs your pipeline produced.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card
              icon={<BarChart3 className="w-5 h-5 text-primary" />}
              title="Diversity & ordination"
              body="Shannon, Simpson, Chao1, and Faith's PD; UMAP / PCoA ordinations on demand."
            />
            <Card
              icon={<Activity className="w-5 h-5 text-primary" />}
              title="Conservation status"
              body="Per-taxon GBIF occurrence counts and IUCN Red List categories surfaced inline."
            />
          </div>

          <div className="mt-12 surface-elevated bg-gradient-hero p-10 md:p-14 text-center">
            <h2 className="h-display text-2xl md:text-3xl mb-4 text-balance">
              Charts come alive once you have a job.
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
              Visualize is wired to a real pipeline result. Run a demo sample to see
              every metric, table, and ordination populate from your data.
            </p>
            <Link
              to="/demo"
              className="inline-flex items-center gap-1.5 h-11 px-5 rounded-md bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors duration-fast"
            >
              Upload a sample
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const Card = ({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) => (
  <div className="surface-card p-6 md:p-7">
    <div className="mb-4">{icon}</div>
    <h3 className="h-display text-lg mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
  </div>
);

export default Visualize;
