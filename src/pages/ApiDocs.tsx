import { Header } from "@/components/Header";
import { ApiDocumentation } from "@/components/ApiDocumentation";
import { Footer } from "@/components/Footer";

const ApiDocs = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32 pb-24">
        <div className="container-page max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="font-display text-display-lg mb-4 text-balance">API documentation</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Integrate eDNA analysis into your applications with the Relict REST API.
            </p>
          </div>
          <ApiDocumentation />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ApiDocs;
