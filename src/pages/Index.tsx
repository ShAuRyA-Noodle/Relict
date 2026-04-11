import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { CredibilitySection } from "@/components/CredibilitySection";
import { UseCasesSection } from "@/components/UseCasesSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  const ref = useRef(null);
  
  return (
    <motion.div 
      ref={ref}
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Header />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <CredibilitySection />
        <UseCasesSection />
      </main>
      <Footer />
    </motion.div>
  );
};

export default Index;