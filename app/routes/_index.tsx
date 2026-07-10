import type { MetaFunction } from "@vercel/remix";
import { RESEARCH, SITE, SITE_URL } from "~/utils/site-config";

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
      sameAs: [SITE.social.github, SITE.social.linkedin],
    },
  },
];

export default function Index() {
  return (
    <main id="content">
      <header className="site-head">
        <h1>{SITE.name}</h1>
        <a className="cv-link" href={SITE.resumeUrl}>CV</a>
      </header>

      {SITE.homeBio.split(/\n{2,}/).map((paragraph, i) => (
        <p key={i} className="bio">
          {paragraph.split(/(\([^)]*\))/).map((chunk, j) =>
            chunk.startsWith("(") && chunk.endsWith(")") ? (
              <span key={j} className="nowrap">{chunk}</span>
            ) : (
              chunk
            ),
          )}
        </p>
      ))}

      <section aria-labelledby="publications">
        <h2 id="publications">Publications</h2>
        <ul className="publications">
          {RESEARCH.map((entry) => (
            <li key={entry.title}>
              <p className="pub-title">{entry.title}</p>
              <p className="pub-meta">
                {entry.venue}
                {entry.status ? `, ${entry.status}` : null}
              </p>
              {entry.summary ? (
                <p className="pub-summary">{entry.summary}</p>
              ) : null}
              {entry.note ? <p className="pub-note">{entry.note}</p> : null}
              {entry.links && entry.links.length > 0 ? (
                <p className="pub-links">
                  {entry.links.map((link, i) => (
                    <span key={link.href}>
                      {i > 0 ? " / " : null}
                      <a href={link.href}>{link.label}</a>
                    </span>
                  ))}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <p className="contact">
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a> /{" "}
        <a href={SITE.social.github}>GitHub</a>
      </p>
    </main>
  );
}
