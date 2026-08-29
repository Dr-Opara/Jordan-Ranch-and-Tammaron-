import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/home",
    name: "JRT.Community",
    short_name: "JRT",
    description: "A private community app for Jordan Ranch and Tamarron residents.",
    start_url: "/home",
    scope: "/",
    display: "standalone",
    background_color: "#f7f7f5",
    theme_color: "#234e3f",
    orientation: "portrait",
    categories: ["social", "lifestyle", "local"],
    icons: [
      {
        src: "/icon-192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Marketplace",
        short_name: "Marketplace",
        description: "Browse resident marketplace listings",
        url: "/marketplace",
      },
      {
        name: "Local Business",
        short_name: "Businesses",
        description: "Find local businesses",
        url: "/business",
      },
      {
        name: "Deals",
        short_name: "Deals",
        description: "View resident deals",
        url: "/deals",
      },
    ],
  };
}
