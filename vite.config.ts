import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api":    { target: "http://localhost:8000", changeOrigin: true },
      "/ws":     { target: "ws://localhost:8000",   ws: true },
      "/health": { target: "http://localhost:8000", changeOrigin: true },
      "/ready":  { target: "http://localhost:8000", changeOrigin: true },
      "/docs":   { target: "http://localhost:8000", changeOrigin: true },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2020",
    sourcemap: false,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes("node_modules")) return;
          if (id.includes("three") || id.includes("@react-three")) return "three";
          if (id.includes("recharts") || id.includes("d3-")) return "recharts";
          if (id.includes("framer-motion") || id.includes("motion-dom") || id.includes("motion-utils")) return "motion";
          if (id.includes("@radix-ui")) return "radix";
          if (id.includes("@tanstack/react-query")) return "query";
          if (id.includes("react-router") || id.includes("@remix-run")) return "router";
          if (id.includes("react-dom") || id.includes("/react/")) return "react";
          if (id.includes("@studio-freight") || id.includes("lenis")) return "lenis";
          if (id.includes("lucide-react")) return "icons";
        },
      },
    },
  },
});
