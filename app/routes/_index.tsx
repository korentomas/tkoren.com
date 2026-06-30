import type { MetaFunction } from "@vercel/remix";
import { Link } from "@remix-run/react";
import { SITE, SITE_URL } from "~/utils/site-config";

export const meta: MetaFunction = () => [
  { title: `${SITE.name} · ${SITE.title}` },
  { name: "description", content: SITE.description },
  { tagName: "link", rel: "canonical", href: SITE_URL },
  { property: "og:type", content: "website" },
  { property: "og:url", content: SITE_URL },
  { property: "og:title", content: `${SITE.name} · ${SITE.title}` },
  { property: "og:description", content: SITE.description },
  { property: "og:image", content: `${SITE_URL}/og-image.png` },
  { property: "og:image:width", content: "1200" },
  { property: "og:image:height", content: "630" },
  { property: "og:site_name", content: SITE.name },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: `${SITE.name} · ${SITE.title}` },
  { name: "twitter:description", content: SITE.shortDescription },
  { name: "twitter:image", content: `${SITE_URL}/og-image.png` },
  {
    "script:ld+json": {
      "@context": "https://schema.org",
      "@type": "Person",
      name: SITE.name,
      alternateName: SITE.alternateName,
      url: SITE_URL,
      image: `${SITE_URL}${SITE.image}`,
      email: SITE.email,
      jobTitle: SITE.title,
      knowsAbout: [...SITE.knowsAbout],
      sameAs: [SITE.social.github, SITE.social.linkedin, SITE.social.orcid],
    },
  },
];

export default function Index() {
  return (
    <main id="content">
      <figure className="headshot">
        <picture>
          <source
            srcSet="/optimized-images/tomas-400w-80q.webp 400w, /optimized-images/tomas-800w-90q.webp 800w"
            sizes="9rem"
            type="image/webp"
          />
          <img src="/tomas.png" alt="Tomás Korenblit" width={800} height={800} />
        </picture>
      </figure>

      {SITE.homeBio.split(/\n{2,}/).map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}

      <p>
        I also write. I wrote a story about the myth of the Golem, it's about
        AI really. I would love if you <Link to="/writing">read it</Link> and{" "}
        <a href={`mailto:${SITE.email}`}>send your thoughts over</a>.
      </p>

    </main>
  );
}
