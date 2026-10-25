// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Change `site` to the final domain when it's live (used for canonical URLs, sitemap and social cards).
export default defineConfig({
  site: "https://crew-commune-redesign.vercel.app",
  trailingSlash: "never",
  build: {
    format: "file",            // /about.html → served as /about on Vercel (cleanUrls)
    inlineStylesheets: "never", // keep CSS external so the Content-Security-Policy can forbid inline styles
    assets: "_assets",
  },
  compressHTML: true,
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  integrations: [sitemap({ filter: (page) => !page.includes("/404") })],
  vite: { build: { assetsInlineLimit: 0 } },
});
