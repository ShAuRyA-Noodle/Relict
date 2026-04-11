import { Card } from "@/components/ui/card";

const partners = [
  {
    name: "SILVA 138.1",
    description: "Curated 16S / 18S rRNA reference",
    logo: "🧬"
  },
  {
    name: "MIDORI2 / MitoFish",
    description: "COI & 12S reference databases",
    logo: "🐟"
  },
  {
    name: "GBIF",
    description: "Global Biodiversity Information Facility",
    logo: "🌍"
  },
  {
    name: "IUCN Red List",
    description: "Conservation status of species",
    logo: "🛡️"
  }
];

const capabilities = [
  {
    value: "fastp",
    label: "Quality Control",
    description: "Real adapter trimming and quality filtering — not skipped."
  },
  {
    value: "DADA2 / vsearch",
    label: "ASV Inference",
    description: "Exact amplicon sequence variants, not legacy 97% OTUs."
  },
  {
    value: "SILVA / MIDORI2",
    label: "Version-Pinned DBs",
    description: "Taxonomy assignments are traceable to an exact DB release."
  },
  {
    value: "Signed manifest",
    label: "Provenance",
    description: "Every result ships with hashes, tool versions, and parameters."
  }
];

export const CredibilitySection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Reference databases */}
        <div className="text-center mb-16">
          <p className="text-sm text-muted-foreground mb-8 uppercase tracking-wider">
            Built on version-pinned public reference databases
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {partners.map((partner) => (
              <Card key={partner.name} className="p-6 hover-lift text-center">
                <div className="text-3xl mb-3">{partner.logo}</div>
                <div className="font-display font-semibold text-sm mb-1">
                  {partner.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {partner.description}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Real capabilities */}
        <div className="mb-16">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-center mb-4">
            What's Actually Under the Hood
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            No fabricated accuracy numbers. The pipeline is real, open, and auditable — these are the tools it actually runs.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {capabilities.map((cap) => (
              <Card key={cap.label} className="p-6 text-center glass hover-lift">
                <div className="text-xl lg:text-2xl font-display font-bold text-emerald mb-2">
                  {cap.value}
                </div>
                <div className="font-semibold mb-2">{cap.label}</div>
                <div className="text-sm text-muted-foreground">
                  {cap.description}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <Card className="p-6 glass text-center bg-muted/30">
          <p className="text-sm text-muted-foreground">
            <strong>Research tool.</strong> This platform is an independent open-source project
            intended for research, education, and biodiversity monitoring. Results must not
            be used for clinical, regulatory, or forensic decision-making without independent
            validation. Reference database versions and pipeline parameters are recorded in
            every analysis manifest so you can reproduce and scrutinize any result.
          </p>
        </Card>
      </div>
    </section>
  );
};