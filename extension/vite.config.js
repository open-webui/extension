import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        dir: "dist/",
        entryFileNames: "main.js",
        assetFileNames: "style.css",
        chunkFileNames: "chunk.js",
        manualChunks: undefined,
      },
    },
  },
});
