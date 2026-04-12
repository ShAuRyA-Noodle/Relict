import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play, Microscope } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

// IMPORTANT: make sure the filename matches exactly in src/assets/
import heroImage from "@/assets/hero-dna-visualization.jpg";

export const HeroSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background layers */}
      <motion.div
        className="absolute inset-0 particle-field"
        style={{ y, opacity }}
      />
      <div className="absolute inset-0 dna-helix opacity-5" />
      <div className="absolute inset-0 iso-grid opacity-20" />

      {/* Main content */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Text */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Project badge */}
            <motion.div
              className="flex items-center space-x-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Badge variant="secondary" className="px-3 py-1 glass hover-glow">
                <Microscope className="w-4 h-4 mr-2" />
                Open-source • Reproducible eDNA Analysis
              </Badge>
            </motion.div>

            {/* Headline + subcopy */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <h1 className="text-5xl lg:text-7xl font-display font-bold leading-tight">
                AI biodiversity insights from{" "}
                <span className="gradient-text">environmental DNA</span>
              </h1>
              <motion.p
                className="text-xl lg:text-2xl text-muted-foreground max-w-2xl leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                Upload a sample. Get species identification, confidence metrics,
                and biodiversity indices in seconds with our advanced AI
                pipeline.
              </motion.p>
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Button asChild size="lg" className="text-lg px-8 py-4 hover-lift hover-glow">
                <Link to="/demo">
                  Try the Demo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-lg px-8 py-4 glass hover-glow"
              >
                <Link to="#how-it-works">
                  <Play className="mr-2 w-5 h-5" />
                  How it works
                </Link>
              </Button>
            </motion.div>

            {/* Disclaimer */}
            <motion.div
              className="text-sm text-muted-foreground glass p-4 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.4 }}
            >
              <strong>Research demonstration.</strong> For scientific research
              purposes only. Not for clinical or production use without
              validation.
            </motion.div>
          </motion.div>

          {/* Right column - Hero visual */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          >
            <motion.div
              className="relative z-10 bg-card text-card-foreground rounded-2xl p-8 shadow-md hover-lift"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={heroImage}
                alt="Environmental DNA visualization showing biodiversity analysis through AI"
                className="w-full h-auto rounded-xl shadow-elegant"
                loading="eager"
              />
              {/* Overlay */}
              <motion.div
                className="absolute bottom-6 left-6 right-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                <div className="rounded-lg p-4 bg-card text-card-foreground shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Sample Analysis</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-emerald rounded-full animate-pulse" />
                      <div
                        className="w-2 h-2 bg-emerald/60 rounded-full animate-pulse"
                        style={{ animationDelay: "0.5s" }}
                      />
                      <div
                        className="w-2 h-2 bg-emerald/30 rounded-full animate-pulse"
                        style={{ animationDelay: "1s" }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Upload a sample to see real results — no mock data.
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Badge removed — no fake scores */}

            {/* Decorations */}
            <motion.div
              className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-hero rounded-full opacity-20 blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute -bottom-4 -left-4 w-32 h-32 bg-emerald/20 rounded-full opacity-30 blur-2xl"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.4, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
