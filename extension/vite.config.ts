import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
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
