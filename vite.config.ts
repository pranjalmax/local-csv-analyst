// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// IMPORTANT for GitHub Pages:
// - If your repo is named "local-csv-analyst", base should be "/local-csv-analyst/".
// - If you use a different repo name, change this to "/that-repo-name/".
export default defineConfig({
  plugins: [react()],
  base: "/local-csv-analyst/",
  build: {
    // Default outDir is "dist"; we keep that for GitHub Pages.
    outDir: "dist",
    sourcemap: false
  },
  server: {
    port: 5173
  }
});
