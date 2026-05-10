import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Target, Shield, Globe, Users, TrendingUp } from "lucide-react";

const sdgGoals = [
  { number: 14, title: "Life below water", description: "Conserve and sustainably use oceans, seas, and marine resources.", icon: Globe },
  { number: 15, title: "Life on land",     description: "Protect, restore, and promote sustainable use of terrestrial ecosystems.", icon: Leaf },
  { number: 13, title: "Climate action",   description: "Take urgent action to combat climate change and its impacts.", icon: Shield },
];

const impactAreas = [
  {
    title: "Biodiversity monitoring",
    description: "Non-invasive species detection from water, soil, or sediment — no organism capture required. Surfaces rare, cryptic, and nocturnal taxa traditional surveys miss.",
    icon: Target,
    metric: "Non-invasive sampling",
  },
  {
    title: "Conservation cross-referencing",
    description: "Every detected taxon is automatically cross-referenced against GBIF and the IUCN Red List, so users see conservation status alongside detections.",
    icon: Shield,
    metric: "GBIF + IUCN integrated",
  },
  {
    title: "Reproducible research",
    description: "Every analysis produces a signed provenance manifest — input hashes, tool versions, database versions, parameters, output hashes — independently re-verifiable.",
    icon: TrendingUp,
    metric: "Signed provenance",
  },
];

const ethicsPoints = [
  "Non-invasive sampling reduces ecological disturbance",
  "Open data sharing accelerates conservation research",
  "Democratized access to biodiversity monitoring tools",
  "Collaborative international research frameworks",
  "Ethical AI development with transparent methodologies",
];

export const ImpactSection = () => {
  return (
    <div className="space-y-16">
      <section>
        <h2 className="font-display text-3xl mb-8 text-center">Environmental impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {impactAreas.map((a) => (
            <Card key={a.title} className="p-6 md:p-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-md bg-primary/10">
                  <a.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-lg">{a.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{a.description}</p>
              <Badge variant="secondary" className="text-xs">{a.metric}</Badge>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-3xl mb-8 text-center">Sustainable Development Goals</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {sdgGoals.map((g) => (
            <Card key={g.number} className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-md bg-primary/10 flex items-center justify-center shrink-0 font-display font-semibold text-primary">
                  {g.number}
                </div>
                <div>
                  <h3 className="font-display text-base mb-1.5">{g.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{g.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <Card className="p-8 md:p-10">
          <div className="text-center mb-8">
            <Users className="w-8 h-8 mx-auto text-primary mb-3" />
            <h2 className="font-display text-3xl">Who this is for</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h3 className="font-display text-lg mb-4">Researchers & labs</h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground leading-relaxed">
                <li>One-command reproducible pipelines</li>
                <li>Signed provenance for supplementary materials</li>
                <li>BIOM / QIIME 2 / phyloseq exports</li>
                <li>Benchmark reports against published studies</li>
              </ul>
            </div>
            <div>
              <h3 className="font-display text-lg mb-4">Conservationists & citizen scientists</h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground leading-relaxed">
                <li>Plain-language conservation reports</li>
                <li>IUCN Red List status on every detected taxon</li>
                <li>One-click GBIF DNA-derived occurrence submission</li>
                <li>No bioinformatics expertise required</li>
              </ul>
            </div>
          </div>
        </Card>
      </section>

      <section>
        <Card className="p-8 md:p-10 bg-gradient-glass">
          <h2 className="font-display text-3xl mb-6 text-center">Ethical considerations</h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-base text-muted-foreground mb-6 text-center leading-relaxed">
              A commitment to responsible research and ethical AI development.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ethicsPoints.map((p, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span className="text-sm">{p}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section className="text-center">
        <Card className="p-8 md:p-12 bg-gradient-hero">
          <h2 className="font-display text-3xl mb-4 text-balance">
            Open-source. Reproducible. Built for the real world.
          </h2>
          <p className="text-base text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed">
            No mock data. Every pipeline stage is real. Every reference database is
            version-pinned. Every result ships with a provenance manifest you can verify.
          </p>
          <p className="text-sm text-muted-foreground">MIT-licensed · Contributions welcome</p>
        </Card>
      </section>
    </div>
  );
};
