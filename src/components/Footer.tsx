import { Link } from "react-router-dom";
import { Github, Mail, ExternalLink } from "lucide-react";

const groups = {
  Product: [
    { name: "Run pipeline", href: "/demo" },
    { name: "Visualize", href: "/visualize" },
    { name: "Profile", href: "/profile" },
  ],
  Project: [
    { name: "Impact", href: "/impact" },
    { name: "About", href: "/about" },
    { name: "Paper (PDF)", href: "/relict_paper.pdf", external: true },
  ],
  References: [
    { name: "NCBI SRA", href: "https://www.ncbi.nlm.nih.gov/sra", external: true },
    { name: "MGnify", href: "https://www.ebi.ac.uk/metagenomics/", external: true },
    { name: "QIIME 2", href: "https://qiime2.org/", external: true },
    { name: "GBIF", href: "https://www.gbif.org/", external: true },
    { name: "IUCN Red List", href: "https://www.iucnredlist.org/", external: true },
  ],
};

export const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="relative border-t border-border bg-background/60">
      <div className="container-page py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_2fr] gap-12">
          <div>
            <p className="font-display text-2xl tracking-tight">Relict</p>
            <p className="mt-3 text-sm text-muted-foreground max-w-sm leading-relaxed">
              Reproducible environmental DNA analysis with conservation cross-referencing
              and signed provenance for every result.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <a
                href="https://github.com/ShAuRyA-Noodle/Bad-Omens"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="mailto:workwithshaurya10@gmail.com"
                className="inline-flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            {Object.entries(groups).map(([title, links]) => (
              <div key={title}>
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-4">{title}</p>
                <ul className="space-y-2.5">
                  {links.map((l) => (
                    <li key={l.href}>
                      {"external" in l && l.external ? (
                        <a
                          href={l.href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                        >
                          {l.name}
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                        </a>
                      ) : (
                        <Link
                          to={l.href}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {l.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {year} Shaurya Punj · MIT-licensed open source</p>
          <p className="font-mono">
            v0.1.0-dev · research scope only — not clinically certified
          </p>
        </div>
      </div>
    </footer>
  );
};
