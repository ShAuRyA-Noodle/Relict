import { Header } from "@/components/Header";
import { DemoUpload } from "@/components/DemoUpload";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";

const Demo = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32 pb-24">
        <div className="container-page max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mb-10"
          >
            <p className="eyebrow mb-5">
              <span className="eyebrow-dot" />
              Sequence ingestion
            </p>
            <h1 className="h-display text-display-lg mb-5 text-balance">
              Run the pipeline.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Upload a FASTA or FASTQ sample (up to 500 MiB). Reads are
              quality-controlled, denoised into ASVs, taxonomically assigned, and
              cross-referenced against GBIF and the IUCN Red List — with a signed
              provenance manifest you can verify yourself.
            </p>
          </motion.div>

          <DemoUpload />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Demo;
