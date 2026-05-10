import { useEffect, useRef, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Leaf, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface BiodiversityBadgeProps {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  showTrend?: boolean;
  className?: string;
}

export const BiodiversityBadge = ({
  score,
  label = "Biodiversity index",
  size = "md",
  animated = true,
  showTrend = false,
  className,
}: BiodiversityBadgeProps) => {
  const [current, setCurrent] = useState(0);
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  const sizes = {
    sm: { ring: 60, stroke: 4, text: "text-sm" },
    md: { ring: 80, stroke: 5, text: "text-base" },
    lg: { ring: 120, stroke: 7, text: "text-xl" },
  };
  const cfg = sizes[size];
  const circumference = 2 * Math.PI * ((cfg.ring - cfg.stroke) / 2);
  const dashoffset = circumference - (current / 100) * circumference;

  const tone = score >= 80 ? "text-success" : score >= 60 ? "text-amber-500" : "text-destructive";
  const stroke = score >= 80 ? "stroke-[hsl(var(--success))]" : score >= 60 ? "stroke-amber-500" : "stroke-[hsl(var(--destructive))]";

  useEffect(() => {
    if (!inView || !animated) return;
    controls.start({ scale: [0.95, 1.02, 1], transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } });
    const t = setTimeout(() => {
      const dur = 1500;
      const steps = 60;
      const inc = score / steps;
      let v = 0;
      const id = setInterval(() => {
        v += inc;
        if (v >= score) {
          setCurrent(score);
          clearInterval(id);
        } else {
          setCurrent(Math.floor(v));
        }
      }, dur / steps);
      return () => clearInterval(id);
    }, 200);
    return () => clearTimeout(t);
  }, [inView, animated, controls, score]);

  return (
    <motion.div
      ref={ref}
      className={cn("inline-flex flex-col items-center gap-3", className)}
      animate={controls}
      initial={{ scale: animated ? 0.95 : 1 }}
    >
      <div className="relative">
        <svg width={cfg.ring} height={cfg.ring} className="-rotate-90">
          <circle
            cx={cfg.ring / 2}
            cy={cfg.ring / 2}
            r={(cfg.ring - cfg.stroke) / 2}
            stroke="hsl(var(--border))"
            strokeWidth={cfg.stroke}
            fill="none"
          />
          <motion.circle
            cx={cfg.ring / 2}
            cy={cfg.ring / 2}
            r={(cfg.ring - cfg.stroke) / 2}
            strokeWidth={cfg.stroke}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            strokeLinecap="round"
            className={stroke}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashoffset }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-display tabular-nums", cfg.text, tone)}>
            {Math.round(current)}
          </span>
          <span className="text-[10px] text-muted-foreground">/ 100</span>
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-success/10 flex items-center justify-center">
          <Leaf className="w-3 h-3 text-success" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <Badge variant="secondary" className="text-xs">
          {label}
          {showTrend && <TrendingUp className="w-3 h-3 ml-1 text-success" />}
        </Badge>
        {showTrend && (
          <p className="text-xs text-success font-medium">+12% from baseline</p>
        )}
      </div>
    </motion.div>
  );
};
