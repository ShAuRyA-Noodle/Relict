import { Header } from "@/components/Header";
import { ApiDocumentation } from "@/components/ApiDocumentation";
import { Footer } from "@/components/Footer";

const ApiDocs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl lg:text-5xl font-display font-bold mb-6">
                API Documentation
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Integrate eDNA analysis capabilities into your applications 
                with our RESTful API endpoints.
              </p>
            </div>
            <ApiDocumentation />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ApiDocs;