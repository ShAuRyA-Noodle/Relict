import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

export const BiodiversityMetrics = () => {
  return (
    <Card className="p-6 text-center space-y-3">
      <p className="text-muted-foreground">Diversity metrics are computed per-job from real data.</p>
      <Button asChild variant="outline" size="sm">
        <Link to="/demo">
          Run an analysis <ArrowUpRight className="w-4 h-4 ml-1" />
        </Link>
      </Button>
    </Card>
  );
};
