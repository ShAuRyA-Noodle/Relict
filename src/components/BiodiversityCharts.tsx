import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, ArrowRight } from "lucide-react";

export const BiodiversityCharts = () => {
  return (
    <Card className="p-8 text-center space-y-4">
      <BarChart3 className="w-12 h-12 mx-auto text-emerald" />
      <h2 className="text-2xl font-display font-bold">Real-Time Visualizations</h2>
      <p className="text-muted-foreground max-w-lg mx-auto">
        Upload a FASTQ file on the Demo page to see real taxonomy charts,
        diversity metrics, conservation status, and ordination plots —
        all computed from your actual data by real bioinformatics tools.
      </p>
      <p className="text-sm text-muted-foreground">
        No mock data. No placeholder charts. Every number comes from fastp,
        vsearch, scikit-bio, GBIF, and the IUCN Red List.
      </p>
      <Button asChild>
        <Link to="/demo">
          Upload a Sample <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </Button>
    </Card>
  );
};
