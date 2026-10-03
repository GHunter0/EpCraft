export default function manifest() {
  return {
    name: "EpCraft — Handcrafted Wood, Made For You",
    short_name: "EpCraft",
    description:
      "Artisanal furniture and decor crafted with soul and precision, bridging traditional techniques with modern intelligence.",
    start_url: "/",
    display: "standalone",
    background_color: "#f9f3ea",
    theme_color: "#502c12",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
