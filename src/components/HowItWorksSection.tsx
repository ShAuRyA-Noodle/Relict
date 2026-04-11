import { Card } from "@/components/ui/card";
import { Upload, Brain, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    number: "01",
    title: "Upload eDNA Sample",
    description: "Submit your environmental DNA data in FASTA or CSV format. Our system validates and preprocesses the genetic sequences for analysis.",
    icon: Upload,
    color: "emerald"
  },
  {
    number: "02", 
    title: "AI Processing & Classification",
    description: "Advanced machine learning models analyze DNA sequences, compare against reference databases, and identify species with confidence scores.",
    icon: Brain,
    color: "accent"
  },
  {
    number: "03",
    title: "Biodiversity Dashboard", 
    description: "View comprehensive results including species taxonomy, abundance data, biodiversity indices, and downloadable reports.",
    icon: BarChart3,
    color: "muted"
  }
];

export const HowItWorksSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="how-it-works" className="py-20 bg-muted/20 relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 iso-grid opacity-10" />
      
      <div className="container mx-auto px-4 relative">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl lg:text-5xl font-display font-bold mb-6 gradient-text">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our AI-powered pipeline transforms environmental DNA samples into 
            actionable biodiversity insights in three simple steps.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <motion.div 
              key={step.number} 
              className="relative"
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Card className="p-8 glass-strong hover-lift hover-glow h-full group">
                <div className="text-center space-y-6">
                  {/* Step number with enhanced styling */}
                  <motion.div 
                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-hero rounded-full text-white font-display font-bold text-xl relative"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {step.number}
                    <div className="absolute inset-0 rounded-full bg-gradient-hero opacity-0 group-hover:opacity-20 blur-lg transition-opacity" />
                  </motion.div>

                  {/* Icon with hover animation */}
                  <motion.div 
                    className={`inline-flex items-center justify-center w-12 h-12 bg-${step.color}/10 rounded-lg relative`}
                    whileHover={{ scale: 1.15 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <step.icon className={`w-6 h-6 text-${step.color} data-point-glow`} />
                  </motion.div>

                  {/* Content */}
                  <div>
                    <h3 className="text-xl font-display font-semibold mb-4 group-hover:text-emerald transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Enhanced connection line */}
              {index < steps.length - 1 && (
                <motion.div 
                  className="hidden md:block absolute top-16 -right-4 w-8 h-0.5 bg-gradient-to-r from-emerald/50 to-transparent z-10"
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.8, delay: 0.5 + index * 0.2 }}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Enhanced technical details */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card className="p-8 glass-strong max-w-4xl mx-auto hover-glow">
            <motion.h3 
              className="text-2xl font-display font-semibold mb-6 gradient-text"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Powered by Advanced AI
            </motion.h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              {[
                {
                  title: "DNA-BERT Models",
                  description: "Transformer architecture trained on genomic sequences for accurate species classification"
                },
                {
                  title: "Reference Databases", 
                  description: "Integration with NCBI, MGnify, and curated taxonomic databases for comprehensive coverage"
                },
                {
                  title: "Quality Metrics",
                  description: "Confidence scores, abundance estimates, and biodiversity indices with statistical validation"
                }
              ].map((item, index) => (
                <motion.div 
                  key={item.title}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="font-semibold mb-2 text-emerald">{item.title}</div>
                  <div className="text-muted-foreground">
                    {item.description}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};