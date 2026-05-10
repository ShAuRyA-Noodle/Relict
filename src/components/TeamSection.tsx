import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Linkedin, Mail, ExternalLink } from "lucide-react";

const architect = {
  name: "Shaurya Punj",
  role: "Project Architect · Full-Stack Engineer · AI/ML Researcher",
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
  ],
  bio: `Relict is a fully independent, end-to-end research platform designed,
engineered, and deployed by a single developer.

Shaurya architected the complete system — frontend, backend, AI/ML pipelines,
data engineering, and bioinformatics workflows — integrating environmental
genomics with modern machine learning to deliver scalable, production-ready
biodiversity insights.`,
};

const acknowledgments = [
  { organization: "NCBI Sequence Read Archive (SRA)", type: "Public Data Archive",        description: "Open archive of raw sequencing reads used for demo datasets and benchmarking." },
  { organization: "SILVA rRNA Database Project",      type: "Reference Taxonomy",         description: "Curated small-subunit rRNA reference sequences (v138.1)." },
  { organization: "MGnify (EMBL-EBI)",                type: "Scientific Infrastructure",  description: "Environmental metagenomics studies and standardized analysis outputs." },
  { organization: "GBIF & IUCN Red List",             type: "Biodiversity Knowledge",     description: "Species occurrences and conservation-status data cross-referenced on every result." },
  { organization: "QIIME 2 / DADA2 / vsearch",        type: "Open Scientific Tooling",    description: "Upstream tools this platform integrates and is benchmarked against." },
];

const references = [
  { title: "VSEARCH: a versatile open-source tool for metagenomics", authors: "Rognes T. et al.",    journal: "PeerJ",                  year: "2016", doi: "https://doi.org/10.7717/peerj.2584" },
  { title: "DADA2: high-resolution sample inference",                authors: "Callahan B. J. et al.", journal: "Nature Methods",         year: "2016", doi: "https://doi.org/10.1038/nmeth.3869" },
  { title: "The SILVA ribosomal RNA gene database project",          authors: "Quast C. et al.",      journal: "Nucleic Acids Research", year: "2013", doi: "https://doi.org/10.1093/nar/gks1219" },
];

export const TeamSection = () => {
  return (
    <div className="space-y-16">
      <section>
        <h2 className="font-display text-3xl mb-8 text-center">Project architect</h2>
        <Card className="p-8 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-hero shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-2xl mb-1">{architect.name}</h3>
              <p className="text-primary text-sm mb-4">{architect.role}</p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5 whitespace-pre-line">
                {architect.bio}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-5">
                {architect.expertise.map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                ))}
              </div>
              <div className="flex gap-1.5">
                <a aria-label="GitHub"   href="https://github.com/ShAuRyA-Noodle"                            target="_blank" rel="noreferrer" className="inline-flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Github   className="w-4 h-4" /></a>
                <a aria-label="LinkedIn" href="https://www.linkedin.com/in/shaurya-punj-2287513b3/"          target="_blank" rel="noreferrer" className="inline-flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Linkedin className="w-4 h-4" /></a>
                <a aria-label="Email"    href="mailto:workwithshaurya10@gmail.com"                                                              className="inline-flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Mail     className="w-4 h-4" /></a>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section>
        <Card className="p-10 text-center">
          <h2 className="font-display text-3xl mb-5">Mission & vision</h2>
          <p className="text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Push environmental DNA research beyond traditional tooling by combining modern
            AI, scalable software engineering, and rigorous scientific workflows — making
            biodiversity monitoring faster, more accurate, and operationally practical.
          </p>
        </Card>
      </section>

      <section>
        <h2 className="font-display text-3xl mb-8 text-center">Scientific acknowledgments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {acknowledgments.map((a) => (
            <Card key={a.organization} className="p-6">
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <h3 className="font-display text-base">{a.organization}</h3>
                <Badge variant="outline" className="text-[10px] shrink-0">{a.type}</Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{a.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-3xl mb-8 text-center">Research foundations</h2>
        <Card className="p-8">
          <ul className="space-y-5">
            {references.map((r, i) => (
              <li key={i} className="border-l-2 border-primary/30 pl-5">
                <p className="font-medium mb-1">{r.title}</p>
                <p className="text-sm text-muted-foreground">{r.authors} ({r.year})</p>
                <p className="text-sm text-muted-foreground italic mb-1.5">{r.journal}</p>
                <a href={r.doi} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  DOI <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section>
        <Card className="p-10 bg-gradient-hero text-center">
          <h2 className="font-display text-3xl mb-3">Research collaboration & inquiry</h2>
          <p className="text-base text-muted-foreground mb-5 max-w-2xl mx-auto leading-relaxed">
            Open to academic collaboration, applied research, and real-world biodiversity
            monitoring deployments.
          </p>
          <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4" />
            <span>workwithshaurya10@gmail.com</span>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Independent open-source project · MIT License</p>
        </Card>
      </section>
    </div>
  );
};
