import type { MetaFunction } from "@vercel/remix";
import { RESEARCH, SITE, SITE_URL } from "~/utils/site-config";

export const meta: MetaFunction = () => [
  { title: SITE.name },
  { name: "description", content: SITE.description },
  { name: "author", content: SITE.name },
  { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
  { tagName: "link", rel: "canonical", href: `${SITE_URL}/` },
  { property: "og:type", content: "website" },
  { property: "og:url", content: SITE_URL },
  { property: "og:title", content: SITE.name },
  { property: "og:description", content: SITE.description },
  { property: "og:image", content: `${SITE_URL}${SITE.image}` },
  { property: "og:image:alt", content: `${SITE.name}, ${SITE.title}` },
  { property: "og:image:width", content: "440" },
  { property: "og:image:height", content: "440" },
  { property: "og:site_name", content: SITE.name },
  { name: "twitter:card", content: "summary" },
  { name: "twitter:title", content: SITE.name },
  { name: "twitter:description", content: SITE.shortDescription },
  { name: "twitter:image", content: `${SITE_URL}${SITE.image}` },
  { name: "twitter:image:alt", content: `${SITE.name}, ${SITE.title}` },
  {
    "script:ld+json": {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      "@id": `${SITE_URL}/#profile`,
      url: `${SITE_URL}/`,
      mainEntity: {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: SITE.name,
        alternateName: [SITE.alternateName, "Tomas Korenblit", "Tomas Pablo Korenblit"],
        url: `${SITE_URL}/`,
        image: `${SITE_URL}${SITE.image}`,
        description: SITE.description,
        email: SITE.email,
        jobTitle: SITE.title,
        knowsAbout: [...SITE.knowsAbout],
        sameAs: [SITE.social.github, SITE.social.linkedin, SITE.social.orcid],
      },
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

      <div className="introduction">
      <img className="portrait" src={SITE.image}
        srcSet="/images/tomas-korenblit-river-320.jpg 320w, /images/tomas-korenblit-river-440.jpg 440w"
        sizes="(max-width: 480px) 132px, 176px" width="440" height="440"
        alt="Tomás Korenblit in a black fleece beside a river" />
      <div>
      <p className="full-name">I'm Tomás Pablo Korenblit.</p>
      <p>I'm an <a href="https://scholarship.aisafety.ar/">AISAR</a> Research Fellow working on white-box AI control. I also contribute to <a href="https://baish.substack.com/">Alineados</a>, BAISH's Spanish-language AI safety newsletter.</p>
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

      </div>
      </div>

      <section aria-labelledby="publications">
        <h2 id="publications">Publications</h2>
        <ul className="publications">
          {RESEARCH.map((entry) => (
            <li key={entry.title}>
              <p className="pub-title">{entry.title}</p>
              <p className="pub-meta">
                {entry.authors ? `${entry.authors}. ` : null}
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

      <section className="personal" aria-labelledby="personal-photos">
        <h2 id="personal-photos">i am a real human</h2>
        <div className="photo-pair">
          <figure>
            <a href="/images/tomas-korenblit-garden-768.jpg" aria-label="View the garden photo at full size">
              <img src="/images/tomas-korenblit-garden-768.jpg"
                srcSet="/images/tomas-korenblit-garden-384.jpg 384w, /images/tomas-korenblit-garden-768.jpg 768w"
                sizes="(max-width: 480px) calc(100vw - 40px), 288px"
                width="768" height="1024" loading="lazy" decoding="async"
                alt="Tomás Korenblit smiling in a white football shirt beside a garden pond" />
            </a>
            <figcaption>prague</figcaption>
          </figure>
          <figure>
            <a href="/images/tomas-korenblit-mascot-768.jpg" aria-label="View the mascot photo at full size">
              <img src="/images/tomas-korenblit-mascot-768.jpg"
                srcSet="/images/tomas-korenblit-mascot-384.jpg 384w, /images/tomas-korenblit-mascot-768.jpg 768w"
                sizes="(max-width: 480px) calc(100vw - 40px), 288px"
                width="768" height="1024" loading="lazy" decoding="async"
                alt="Tomás Korenblit standing beside a large orange mascot" />
            </a>
            <figcaption>With the Austrian Parliament's mascot.</figcaption>
          </figure>
        </div>
      </section>

      <p className="contact">
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a> /{" "}
        <a href={SITE.social.github}>GitHub</a>
      </p>
    </main>
  );
}
