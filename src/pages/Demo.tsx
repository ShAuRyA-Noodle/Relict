import { Header } from "@/components/Header";
import { DemoUpload } from "@/components/DemoUpload";
import { Footer } from "@/components/Footer";

const Demo = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl lg:text-5xl font-display font-bold mb-6">
                eDNA Analysis Demo
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Upload your environmental DNA sample and get AI-powered species identification 
                and biodiversity insights in seconds.
              </p>
            </div>
            <DemoUpload />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Demo;