import type { MetaFunction } from "@vercel/remix";
import { WRITING, SITE, SITE_URL } from "~/utils/site-config";

export const meta: MetaFunction = () => {
  const featured = WRITING[0];
  const pageTitle = featured
    ? `${featured.title} · ${SITE.name}`
    : `Writing · ${SITE.name}`;
  const description = featured
    ? `${featured.title}, a short story by ${SITE.name} retelling the Jewish myth of the Golem of Chełm as a parable about AI and following instructions.`
    : `Short fiction by ${SITE.name}.`;

  return [
    { title: pageTitle },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: `${SITE_URL}/writing` },
    { property: "og:type", content: "article" },
    { property: "og:url", content: `${SITE_URL}/writing` },
    { property: "og:title", content: pageTitle },
    { property: "og:description", content: description },
    { property: "og:image", content: `${SITE_URL}/og-image.png` },
    { property: "og:site_name", content: SITE.name },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: pageTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: `${SITE_URL}/og-image.png` },
    ...(featured
      ? [
          {
            "script:ld+json": {
              "@context": "https://schema.org",
              "@type": "ShortStory",
              name: featured.title,
              inLanguage: "es",
              datePublished: featured.year,
              url: `${SITE_URL}/writing`,
              about:
                "The Golem of Chełm as a parable about AI and instruction-following",
              author: {
                "@type": "Person",
                name: SITE.name,
                alternateName: SITE.alternateName,
                url: SITE_URL,
                sameAs: [
                  SITE.social.github,
                  SITE.social.linkedin,
                  SITE.social.orcid,
                ],
              },
            },
          },
        ]
      : []),
  ];
};

export default function Writing() {
  return (
    <main id="content">
      <h1>Writing</h1>
      <p className="lede">Fiction and non-fiction.</p>

      {WRITING.map((piece) => (
        <article key={piece.title} className="writing-piece">
          <h2>{piece.title}</h2>
          <p className="muted">
            {piece.year}
            {piece.note && ` · ${piece.note}`}
          </p>
          {piece.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
          {piece.coda && piece.coda.length > 0 && (
            <>
              <hr />
              {piece.coda.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </>
          )}
        </article>
      ))}
    </main>
  );
}
