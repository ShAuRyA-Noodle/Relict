// src/components/BiodiversityMetrics.tsx
import { Card } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  color?: string;
}

const MetricCard = ({ title, value, description, color = "emerald" }: MetricCardProps) => {
  return (
    <Card className="p-6 glass hover-lift text-center">
      <div className={`text-3xl font-bold text-${color} mb-2`}>{value}</div>
      <h4 className="text-lg font-display font-semibold">{title}</h4>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </Card>
  );
};

export const BiodiversityMetrics = () => {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-display font-bold text-center">Biodiversity Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Richness"
          value={12}
          description="Unique clusters detected (excl. noise)"
          color="emerald"
        />
        <MetricCard
          title="Shannon Index"
          value={2.45}
          description="Diversity score combining abundance + evenness"
          color="accent"
        />
        <MetricCard
          title="Evenness"
          value={0.83}
          description="Distribution balance across detected clusters"
          color="yellow-500"
        />
      </div>
    </div>
  );
};
