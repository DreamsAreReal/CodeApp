import { defineConfig } from "vite";

// Static JS/TS Telegram Mini App (RS-02): light bundle, no framework runtime.
// Lessons are bundled (not fetched) so a session survives offline — iOS WebView
// has no service worker (RS-15); the source of truth for progress stays on the server.
// Fonts are self-hosted via @fontsource (imported in src/styles/fonts.css); Vite
// fingerprints + bundles the woff2 into dist/assets. The browser only fetches the
// subsets it actually renders (latin/cyrillic), gated by each face's unicode-range.
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
