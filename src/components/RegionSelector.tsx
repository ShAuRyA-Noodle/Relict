import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Globe, Waves, TreePine, Droplets } from "lucide-react";
import { motion } from "framer-motion";

const regions = [
  {
    id: "marine",
    name: "Marine Ecosystems",
    icon: Waves,
    color: "emerald",
    speciesCount: 156,
    biodiversityIndex: 0.89,
    description: "Coastal and deep-sea biodiversity"
  },
  {
    id: "forest",
    name: "Forest Ecosystems", 
    icon: TreePine,
    color: "accent",
    speciesCount: 243,
    biodiversityIndex: 0.92,
    description: "Tropical and temperate forests"
  },
  {
    id: "freshwater",
    name: "Freshwater Systems",
    icon: Droplets,
    color: "muted",
    speciesCount: 89,
    biodiversityIndex: 0.76,
    description: "Rivers, lakes, and wetlands"
  },
  {
    id: "global",
    name: "Global Dataset",
    icon: Globe,
    color: "primary",
    speciesCount: 488,
    biodiversityIndex: 0.94,
    description: "Combined multi-ecosystem data"
  }
];

interface RegionSelectorProps {
  onRegionChange?: (region: typeof regions[0]) => void;
  className?: string;
}

export const RegionSelector = ({ onRegionChange, className }: RegionSelectorProps) => {
  const [selectedRegion, setSelectedRegion] = useState(regions[3]); // Default to global

  const handleRegionChange = (regionId: string) => {
    const region = regions.find(r => r.id === regionId);
    if (region) {
      setSelectedRegion(region);
      onRegionChange?.(region);
    }
  };

  return (
    <motion.div 
      className={`space-y-4 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Select Research Region
        </label>
        <Badge variant="secondary" className="text-xs">
          {selectedRegion.speciesCount} species
        </Badge>
      </div>

      <Select value={selectedRegion.id} onValueChange={handleRegionChange}>
        <SelectTrigger className="glass hover-glow">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="glass-strong">
          {regions.map((region) => (
            <SelectItem key={region.id} value={region.id}>
              <div className="flex items-center space-x-3">
                <region.icon className="w-4 h-4" />
                <div>
                  <div className="font-medium">{region.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {region.description}
                  </div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <motion.div 
        className="glass p-4 rounded-lg"
        key={selectedRegion.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center space-x-3 mb-2">
          <selectedRegion.icon className="w-5 h-5 text-emerald" />
          <span className="font-medium">{selectedRegion.name}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Species Count</div>
            <div className="font-semibold text-emerald">{selectedRegion.speciesCount}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Biodiversity Index</div>
            <div className="font-semibold text-emerald">{selectedRegion.biodiversityIndex.toFixed(2)}</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};