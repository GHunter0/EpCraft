export default function sitemap() {
  const base = "https://ep-craft.vercel.app";
  const routes = [
    "",
    "/shop",
    "/wholesale",
    "/ai-stylist",
    "/customize",
    "/contact",
    "/story",
    "/shipping",
    "/care",
    "/terms",
    "/privacy",
  ];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
  }));
}
