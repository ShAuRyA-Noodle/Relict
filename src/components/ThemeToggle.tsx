import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const ThemeToggle = ({ className }: { className?: string }) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const cycle = () => {
    if (!mounted) return;
    const next = theme === "system" ? "light" : theme === "light" ? "dark" : "system";
    setTheme(next);
  };

  const Icon = !mounted
    ? Sun
    : theme === "system"
    ? Monitor
    : resolvedTheme === "dark"
    ? Moon
    : Sun;

  return (
    <button
      onClick={cycle}
      aria-label="Toggle theme"
      className={cn(
        "inline-flex items-center justify-center w-9 h-9 rounded-md",
        "text-muted-foreground hover:text-foreground hover:bg-muted",
        "transition-colors duration-fast ease-out",
        className,
      )}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
};
