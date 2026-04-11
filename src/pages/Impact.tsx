import { Header } from "@/components/Header";
import { ImpactSection } from "@/components/ImpactSection";
import { Footer } from "@/components/Footer";

const Impact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl lg:text-5xl font-display font-bold mb-6">
                Environmental Impact
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Understanding how eDNA technology supports biodiversity conservation, 
                sustainable development goals, and evidence-based environmental policy.
              </p>
            </div>
            <ImpactSection />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Impact;