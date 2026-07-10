import { defineConfig } from "vite";

// Static JS/TS Telegram Mini App (RS-02): light bundle, no framework runtime.
// Lessons are bundled (not fetched) so a session survives offline — iOS WebView
// has no service worker (RS-15); the source of truth for progress stays on the server.
export default defineConfig({
  root: ".",
  build: {
    target: "es2020",
    outDir: "dist",
    sourcemap: false,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
});
