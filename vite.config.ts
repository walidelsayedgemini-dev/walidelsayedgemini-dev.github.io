import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" keeps every asset URL relative so the same build works on
// Manus hosting and on GitHub Pages (user site or project site).
export default defineConfig({
  base: "./",
  plugins: [react()],
  server: { host: "0.0.0.0", port: 3000, allowedHosts: true },
  preview: { host: "0.0.0.0", port: 3000, allowedHosts: true },
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules/three")) return "three";
          if (id.includes("node_modules/framer-motion") || id.includes("node_modules/motion-")) return "motion";
        },
      },
    },
  },
});
