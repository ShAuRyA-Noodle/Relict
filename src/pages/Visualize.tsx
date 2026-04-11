import { Header } from "@/components/Header";
import { BiodiversityCharts } from "@/components/BiodiversityCharts";
import { Footer } from "@/components/Footer";
import { BiodiversityMetrics } from "@/components/BiodiversityMetrics";


const Visualize = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl lg:text-5xl font-display font-bold mb-6">
                Interactive Data Visualization
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Explore biodiversity patterns through interactive charts, taxonomy sunbursts,
                and regional heatmaps powered by environmental DNA data.
              </p>
            </div>
            <BiodiversityCharts />
            <div className="mt-16">
              <BiodiversityMetrics />
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Visualize;