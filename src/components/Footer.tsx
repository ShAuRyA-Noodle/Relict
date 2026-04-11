import { Link } from "react-router-dom";
import { Dna, Github, Mail, ExternalLink } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { name: "Demo", href: "/demo" },
      { name: "Visualizations", href: "/visualize" },
      { name: "Impact", href: "/impact" },
    ],
    research: [
      { name: "About Team", href: "/about" },
    ],
    resources: [
      { name: "NCBI SRA", href: "https://www.ncbi.nlm.nih.gov/sra", external: true },
      { name: "MGnify", href: "https://www.ebi.ac.uk/metagenomics/", external: true },
      { name: "QIIME 2", href: "https://qiime2.org/", external: true },
    ],
  };

  return (
    <footer className="bg-deep-indigo text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Dna className="w-8 h-8 text-emerald" />
              <span className="font-display font-bold text-xl">
                eDNA <span className="text-emerald">Insights</span>
              </span>
            </Link>
            <p className="text-off-white/80 mb-4 leading-relaxed">
              AI-powered environmental DNA analysis for biodiversity research 
              and conservation efforts worldwide.
            </p>
            <div className="flex space-x-4">
              {/* GitHub Icon → Repo */}
              <a
                href="https://github.com/ShAuRyA-Noodle/The-Chainsmokers"
                target="_blank"
                rel="noopener noreferrer"
                className="text-off-white/60 hover:text-emerald transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>

              {/* Mail Icon → Shaurya */}
              <a
                href="mailto:spunj_be23@thapar.edu?subject=eDNA%20Inquiry"
                className="text-off-white/60 hover:text-emerald transition-colors"
                title="Email Shaurya"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Platform links */}
          <div>
            <h3 className="font-display font-semibold mb-4">Platform</h3>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-off-white/80 hover:text-emerald transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Research links */}
          <div>
            <h3 className="font-display font-semibold mb-4">Research</h3>
            <ul className="space-y-3">
              {footerLinks.research.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-off-white/80 hover:text-emerald transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources links */}
          <div>
            <h3 className="font-display font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    target={link.external ? "_blank" : "_self"}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="text-off-white/80 hover:text-emerald transition-colors flex items-center space-x-1"
                  >
                    <span>{link.name}</span>
                    {link.external && <ExternalLink className="w-3 h-3" />}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-off-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-off-white/60">
              <p>
                Built by <strong>Shaurya Punj</strong> • Open-source (MIT) • {currentYear}
              </p>
            </div>
            <div className="text-sm text-off-white/60">
              <p>Research tool. Not for clinical or regulatory decision-making.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
