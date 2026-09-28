import { defineConfig } from "vite";

const port = Number(process.env.PORT) || 5173;

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port,
    strictPort: false,
    hmr: false,
  },
  preview: {
    host: "0.0.0.0",
    port,
    strictPort: false,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});
