import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, ArrowUpRight } from "lucide-react";

export const BiodiversityCharts = () => {
  return (
    <Card className="p-8 md:p-10 text-center space-y-5">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto">
        <BarChart3 className="w-5 h-5" />
      </div>
      <h2 className="font-display text-2xl">Real-time visualizations</h2>
      <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
        Upload a FASTQ on the demo page to see real taxonomy charts, diversity metrics,
        conservation status, and ordination plots — all computed from your actual data
        by fastp, vsearch, scikit-bio, GBIF, and the IUCN Red List.
      </p>
      <Button asChild>
        <Link to="/demo">
          Upload a sample <ArrowUpRight className="w-4 h-4 ml-1.5" />
        </Link>
      </Button>
    </Card>
  );
};
