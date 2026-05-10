import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { CredibilitySection } from "@/components/CredibilitySection";
import { UseCasesSection } from "@/components/UseCasesSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <CredibilitySection />
        <UseCasesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
