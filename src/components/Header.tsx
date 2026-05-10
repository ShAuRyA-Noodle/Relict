import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV = [
  { name: "Demo", href: "/demo" },
  { name: "Visualize", href: "/visualize" },
  { name: "Impact", href: "/impact" },
  { name: "About", href: "/about" },
];

export const Header = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header
      data-scrolled={scrolled}
      className="header-glass fixed top-0 inset-x-0 z-50 border-b border-transparent"
    >
      <div className="mx-auto max-w-6xl px-6 md:px-8 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group" aria-label="Relict — home">
          <Wordmark />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((item) => {
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "relative px-3 h-9 inline-flex items-center text-sm rounded-md",
                  "transition-colors duration-fast ease-out",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {item.name}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute left-3 right-3 -bottom-px h-px bg-foreground"
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/demo"
            className={cn(
              "inline-flex items-center gap-1.5 h-9 px-4 rounded-md text-sm font-medium",
              "bg-foreground text-background hover:bg-foreground/90",
              "transition-colors duration-fast ease-out",
            )}
          >
            Run pipeline
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="md:hidden flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <motion.span
              key={String(open)}
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ duration: 0.2 }}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl"
          >
            <nav className="px-6 py-4 flex flex-col gap-1">
              {NAV.map((item) => {
                const active = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm",
                      active
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
              <Link
                to="/demo"
                className="mt-2 inline-flex items-center justify-center h-10 rounded-md bg-foreground text-background text-sm font-medium"
              >
                Run pipeline
                <ArrowUpRight className="w-4 h-4 ml-1.5" />
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const Wordmark = () => (
  <span className="inline-flex items-baseline gap-1.5 font-display text-[17px] tracking-tight">
    <span className="inline-flex w-6 h-6 items-center justify-center">
      <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.25" opacity="0.35" />
        <path
          d="M12 3 C 8 8, 16 16, 12 21 M12 3 C 16 8, 8 16, 12 21"
          stroke="currentColor"
          strokeWidth="1.25"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </span>
    <span className="font-semibold">Relict</span>
  </span>
);
