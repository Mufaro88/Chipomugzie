import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Farmer's Pocket Book",
    short_name: "Pocket Book",
    description: "Your farm records, always with you",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#FFF8F0",
    theme_color: "#ea580c",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
