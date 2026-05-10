import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ReactLenis } from "@studio-freight/react-lenis";
import { AnimatePresence, motion } from "framer-motion";
import CustomCursor from "@/components/CustomCursor";

// Defer the 3D backdrop (three.js ~860KB) so first paint isn't blocked
const BioNetworkBackground = lazy(() =>
  import("@/components/BioNetworkBackground").then((m) => ({ default: m.BioNetworkBackground })),
);

import Index from "./pages/Index";
import Demo from "./pages/Demo";
import Visualize from "./pages/Visualize";
import Impact from "./pages/Impact";
import About from "./pages/About";
import JobResults from "./pages/JobResults";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
});

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -4 },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
};

const RoutedApp = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} {...pageTransition}>
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/jobs/:jobId" element={<JobResults />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/visualize" element={<Visualize />} />
          <Route path="/impact" element={<Impact />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ReactLenis
        root
        options={{
          lerp: 0.1,
          duration: 1.15,
          smoothWheel: true,
          syncTouch: false,
          wheelMultiplier: 1,
          touchMultiplier: 1.4,
        }}
      >
        <Suspense fallback={null}>
          <BioNetworkBackground />
        </Suspense>
        <CustomCursor />
        <TooltipProvider delayDuration={200}>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <RoutedApp />
          </BrowserRouter>
        </TooltipProvider>
      </ReactLenis>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
