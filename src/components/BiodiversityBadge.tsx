import { useEffect, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Leaf, TrendingUp } from "lucide-react";
import { useRef } from "react";

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
  label = "Biodiversity Index",
  size = "md",
  animated = true,
  showTrend = false,
  className
}: BiodiversityBadgeProps) => {
  const [currentScore, setCurrentScore] = useState(0);
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const sizes = {
    sm: { ring: 60, stroke: 4, text: "text-sm" },
    md: { ring: 80, stroke: 6, text: "text-base" },
    lg: { ring: 120, stroke: 8, text: "text-xl" }
  };

  const config = sizes[size];
  const circumference = 2 * Math.PI * ((config.ring - config.stroke) / 2);
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;

  // Color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald";
    if (score >= 60) return "text-yellow-500";
    return "text-orange-500";
  };

  const getScoreRing = (score: number) => {
    if (score >= 80) return "stroke-emerald";
    if (score >= 60) return "stroke-yellow-500";
    return "stroke-orange-500";
  };

  useEffect(() => {
    if (inView && animated) {
      controls.start({
        scale: [0.8, 1.05, 1],
        transition: { duration: 0.6, ease: "easeOut" }
      });

      // Animate score counting
      const timer = setTimeout(() => {
        const duration = 1500;
        const steps = 60;
        const increment = score / steps;
        let current = 0;

        const counter = setInterval(() => {
          current += increment;
          if (current >= score) {
            setCurrentScore(score);
            clearInterval(counter);
          } else {
            setCurrentScore(Math.floor(current));
          }
        }, duration / steps);

        return () => clearInterval(counter);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [inView, animated, controls, score]);

  return (
    <motion.div
      ref={ref}
      className={`inline-flex flex-col items-center space-y-3 ${className}`}
      animate={controls}
      initial={{ scale: animated ? 0.8 : 1 }}
    >
      {/* Radial Progress Ring */}
      <div className="relative">
        <svg
          width={config.ring}
          height={config.ring}
          className="transform -rotate-90"
        >
          {/* Background ring */}
          <circle
            cx={config.ring / 2}
            cy={config.ring / 2}
            r={(config.ring - config.stroke) / 2}
            stroke="hsl(var(--muted))"
            strokeWidth={config.stroke}
            fill="transparent"
            className="opacity-20"
          />
          {/* Progress ring */}
          <motion.circle
            cx={config.ring / 2}
            cy={config.ring / 2}
            r={(config.ring - config.stroke) / 2}
            strokeWidth={config.stroke}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${getScoreRing(score)} data-point-glow`}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            className={`font-bold font-display ${config.text} ${getScoreColor(score)}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.3 }}
          >
            {Math.round(currentScore)}
          </motion.div>
          <div className="text-xs text-muted-foreground font-medium">
            / 100
          </div>
        </div>

        {/* Floating icon */}
        <motion.div
          className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald/10 flex items-center justify-center"
          animate={{
            y: [0, -2, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Leaf className="w-3 h-3 text-emerald" />
        </motion.div>
      </div>

      {/* Label and trend */}
      <div className="text-center space-y-1">
        <Badge variant="secondary" className="text-xs">
          <span>{label}</span>
          {showTrend && (
            <TrendingUp className="w-3 h-3 ml-1 text-emerald" />
          )}
        </Badge>
        
        {showTrend && (
          <motion.div
            className="text-xs text-emerald font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.3 }}
          >
            +12% from baseline
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};