import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["pwa-192x192.png", "pwa-512x512.png"],
      manifest: {
        id: "/",
        name: "FocusFlow - Focus Timer",
        short_name: "FocusFlow",
        description: "A minimal focus timer to help you stay productive.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#090909",
        theme_color: "#090909",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
