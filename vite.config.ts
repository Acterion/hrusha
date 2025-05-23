import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { cloudflare } from "@cloudflare/vite-plugin";
import devtoolsJson from "vite-plugin-devtools-json";

export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflare(), devtoolsJson()],
  resolve: {
    alias: {
      "@/app": path.resolve(__dirname, "./src"),
      "@/types": path.resolve(__dirname, "./types"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"), // Entry for the main app
        "cv-upload": path.resolve(__dirname, "cv-upload.html"), // Entry for the CV upload page using the HTML template
      },
    },
  },
});
