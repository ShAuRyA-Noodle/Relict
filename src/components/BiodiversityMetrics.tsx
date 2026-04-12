import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const BiodiversityMetrics = () => {
  return (
    <Card className="p-6 text-center">
      <p className="text-muted-foreground mb-3">
        Diversity metrics are computed per-job from real data.
      </p>
      <Button asChild variant="outline" size="sm">
        <Link to="/demo">
          Run an analysis to see metrics <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </Button>
    </Card>
  );
};
