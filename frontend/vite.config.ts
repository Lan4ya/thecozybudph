import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react-swc";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), , svgr()],
  server: {
    port: 5173,
    host: "0.0.0.0",
    open: true,
  },
  build: {
    outDir: path.resolve(__dirname, "../dist-frontend"),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@TheCozyBud/types": path.resolve(__dirname, "../packages/index.ts"),
    },
  },
}));
