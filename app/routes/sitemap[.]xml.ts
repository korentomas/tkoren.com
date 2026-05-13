import { SITE_URL } from "~/utils/site-config";

const PAGES = ["/", "/books", "/interests", "/now", "/then"];

export const loader = () => {
  const urls = PAGES.map(
    (path) =>
      `<url><loc>${SITE_URL}${path}</loc><changefreq>monthly</changefreq><priority>${path === "/" ? "1.0" : "0.7"}</priority></url>`,
  );

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.join("\n  ")}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
