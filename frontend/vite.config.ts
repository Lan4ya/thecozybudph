import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react-swc";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(() => ({
  plugins: [react(), tailwindcss()],
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
    },
  },
}));
