import { Header } from "@/components/Header";
import { TeamSection } from "@/components/TeamSection";
import { Footer } from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl lg:text-5xl font-display font-bold mb-6">
                About Our Mission
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Meet the team behind this biodiversity research initiative and learn 
                about our commitment to advancing environmental DNA analysis.
              </p>
            </div>
            <TeamSection />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;