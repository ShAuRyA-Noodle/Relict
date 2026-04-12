import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Linkedin, Mail, ExternalLink } from "lucide-react";

const architect = {
  name: "Shaurya Punj",
  role: "Project Architect • Full-Stack Engineer • AI/ML Researcher",
  expertise: [
    "Full-Stack Engineering",
    "Backend & Distributed Systems",
    "AI / ML Pipelines",
    "Environmental DNA Analysis",
    "Bioinformatics Workflows",
    "Database & Data Pipelines",
    "System Architecture",
    "Research Engineering",
    "Deployment & DevOps",
    "Product & Technical Leadership"
  ],
  bio: `
  Relict is a fully independent, end-to-end research platform designed,
  engineered, and deployed by a single developer.

  Shaurya architected the complete system - from frontend experience and backend
  services to AI/ML pipelines, data engineering, and bioinformatics workflows.
  The platform integrates environmental genomics with modern machine learning to
  deliver scalable, production-ready biodiversity insights.

  Every layer of the system - research design, technical architecture, model
  integration, database engineering, visualization, and deployment - has been
  independently built, validated, and optimized to meet real-world scientific
  and conservation needs.
  `,
};

const acknowledgments = [
  {
    organization: "NCBI Sequence Read Archive (SRA)",
    type: "Public Data Archive",
    description: "Open archive of raw sequencing reads used for demo datasets and benchmarking."
  },
  {
    organization: "SILVA rRNA Database Project",
    type: "Reference Taxonomy",
    description: "Curated small-subunit rRNA reference sequences (v138.1) used for taxonomic assignment."
  },
  {
    organization: "MGnify (EMBL-EBI)",
    type: "Scientific Infrastructure",
    description: "Environmental metagenomics studies and standardized analysis outputs."
  },
  {
    organization: "GBIF & IUCN Red List",
    type: "Biodiversity Knowledge Layer",
    description: "Species occurrences and conservation-status data cross-referenced on every result."
  },
  {
    organization: "QIIME 2 / DADA2 / vsearch Communities",
    type: "Open Scientific Tooling",
    description: "The upstream tools this platform integrates and is benchmarked against."
  }
];

const references = [
  {
    title: "VSEARCH: a versatile open source tool for metagenomics",
    authors: "Rognes T. et al.",
    journal: "PeerJ",
    year: "2016",
    doi: "https://doi.org/10.7717/peerj.2584"
  },
  {
    title: "DADA2: High-resolution sample inference from Illumina amplicon data",
    authors: "Callahan B. J. et al.",
    journal: "Nature Methods",
    year: "2016",
    doi: "https://doi.org/10.1038/nmeth.3869"
  },
  {
    title: "The SILVA ribosomal RNA gene database project",
    authors: "Quast C. et al.",
    journal: "Nucleic Acids Research",
    year: "2013",
    doi: "https://doi.org/10.1093/nar/gks1219"
  }
];

export const TeamSection = () => {
  return (
    <div className="space-y-16">

      {/* Architect Section */}
      <section>
        <h2 className="text-3xl font-display font-bold mb-8 text-center">
          Project Architect
        </h2>

        <Card className="p-8 glass hover-lift max-w-4xl mx-auto">
          <div className="flex items-start space-x-6">
            <div className="w-20 h-20 bg-gradient-hero rounded-full flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-2xl font-display font-semibold mb-1">
                {architect.name}
              </h3>
              <p className="text-emerald font-medium mb-4">
                {architect.role}
              </p>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6 whitespace-pre-line">
                {architect.bio}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {architect.expertise.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>

              <div className="flex space-x-4">
                <a href="https://github.com/ShAuRyA-Noodle" target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                </a>
                <a href="https://www.linkedin.com/in/shaurya-punj-2287513b3/" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                </a>
                <a href="mailto:workwithshaurya10@gmail.com">
                  <Mail className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                </a>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Mission */}
      <section>
        <Card className="p-10 glass text-center">
          <h2 className="text-3xl font-display font-bold mb-6">
            Mission & Vision
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            This project exists to push environmental DNA research beyond
            traditional tooling by combining modern AI, scalable software
            engineering, and rigorous scientific workflows.

            The mission is to make biodiversity monitoring faster, more accurate,
            and operationally practical - enabling researchers, policymakers,
            and conservation teams to move from raw genomic data to actionable
            ecological insight with confidence.
          </p>
        </Card>
      </section>

      {/* Acknowledgments */}
      <section>
        <h2 className="text-3xl font-display font-bold mb-8 text-center">
          Scientific Acknowledgments
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {acknowledgments.map((ack) => (
            <Card key={ack.organization} className="p-6 hover-lift">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display font-semibold text-lg">
                  {ack.organization}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {ack.type}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {ack.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* References */}
      <section>
        <h2 className="text-3xl font-display font-bold mb-8 text-center">
          Research Foundations
        </h2>

        <Card className="p-8 glass">
          <div className="space-y-6">
            {references.map((ref, index) => (
              <div key={index} className="border-l-4 border-emerald/20 pl-6">
                <h4 className="font-semibold mb-2">
                  {ref.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {ref.authors} ({ref.year})
                </p>
                <p className="text-sm text-muted-foreground italic mb-2">
                  {ref.journal}
                </p>
                <div className="flex items-center space-x-2">
                  <a href={ref.doi} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground flex items-center space-x-1">
                    <span>DOI</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Contact */}
      <section>
        <Card className="p-10 bg-gradient-hero text-white text-center">
          <h2 className="text-3xl font-display font-bold mb-4">
            Research Collaboration & Inquiry
          </h2>
          <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
            Open to academic collaboration, applied research, and real-world
            biodiversity monitoring deployments.
          </p>

          <div className="flex justify-center items-center space-x-2 text-sm opacity-90">
            <Mail className="w-4 h-4" />
            <span>workwithshaurya10@gmail.com</span>
          </div>

          <div className="mt-4 text-sm opacity-75">
            Independent open-source project • MIT License
          </div>
        </Card>
      </section>

    </div>
  );
};
