import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Chhavani Police Station Malegaon",
        short_name: "Chhavani Police",
        description: "Police City Religious and Festival Management System",
        theme_color: "#0b1f3a",
        background_color: "#eef4fb",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
  {
    src: "/icon-192.png",
    sizes: "192x192",
    type: "image/png",
  },
  {
    src: "/icon-512.png",
    sizes: "512x512",
    type: "image/png",
  },
]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.up\.railway\.app\/api\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 5,
            },
          },
        ],
      },
    }),
  ],
});