import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Waves, Trees, Droplets, ArrowRight } from "lucide-react";
import sampleImage from "@/assets/edna-sample-microscopic.jpg";

const useCases = [
  {
    title: "Marine Biodiversity",
    description: "Monitor ocean health and fish populations through seawater eDNA analysis. Track species distribution, abundance, and ecosystem changes.",
    icon: Waves,
    color: "emerald",
    applications: ["Commercial fisheries assessment", "Marine protected area monitoring", "Invasive species detection"],
    image: sampleImage
  },
  {
    title: "Forest Ecosystems", 
    description: "Assess terrestrial biodiversity using soil and stream eDNA samples. Understand forest health and wildlife populations non-invasively.",
    icon: Trees,
    color: "accent",
    applications: ["Wildlife population surveys", "Habitat restoration monitoring", "Conservation impact assessment"],
    image: sampleImage
  },
  {
    title: "Freshwater Systems",
    description: "Evaluate river, lake, and wetland ecosystems through comprehensive eDNA monitoring of aquatic and semi-aquatic species.",
    icon: Droplets,
    color: "glacier",
    applications: ["Water quality assessment", "Endangered species monitoring", "Ecological restoration tracking"],
    image: sampleImage
  }
];

export const UseCasesSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-display font-bold mb-6">
            Real-World Applications
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Environmental DNA analysis is transforming biodiversity research 
            across marine, terrestrial, and freshwater ecosystems worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {useCases.map((useCase) => (
            <Card key={useCase.title} className="glass hover-lift overflow-hidden">
              {/* Image header */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={useCase.image}
                  alt={`${useCase.title} eDNA sampling`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
                <div className={`absolute top-4 left-4 p-3 bg-${useCase.color}/10 backdrop-blur-sm rounded-lg`}>
                  <useCase.icon className={`w-6 h-6 text-${useCase.color}`} />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-display font-semibold mb-3">
                  {useCase.title}
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {useCase.description}
                </p>

                {/* Applications list */}
                <div className="space-y-2 mb-6">
                  {useCase.applications.map((app) => (
                    <div key={app} className="flex items-start space-x-2 text-sm">
                      <div className={`w-1.5 h-1.5 bg-${useCase.color} rounded-full mt-2 flex-shrink-0`}></div>
                      <span className="text-muted-foreground">{app}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="p-8 glass max-w-4xl mx-auto">
            <h3 className="text-2xl font-display font-semibold mb-4">
              Ready to analyze your environmental DNA samples?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Experience the power of AI-driven biodiversity analysis with our 
              interactive demonstration platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="hover-lift">
                <Link to="/demo">
                  Start Demo Analysis
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/visualize">
                  Explore Sample Data
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};