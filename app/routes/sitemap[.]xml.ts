import { SITE_URL } from "~/utils/site-config";

const PAGES = ["/"];

export const loader = () => {
  const urls = PAGES.map(
    (path) =>
      `<url><loc>${SITE_URL}${path}</loc>${["river-440", "garden-768", "mascot-768"].map((photo) => `<image:image><image:loc>${SITE_URL}/images/tomas-korenblit-${photo}.jpg</image:loc></image:image>`).join("")}</url>`,
  );

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${urls.join("\n  ")}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
