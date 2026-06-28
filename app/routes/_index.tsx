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

      <h2>Elsewhere</h2>
      <ul>
        <li>
          <a href={SITE.social.github}>GitHub</a> (code)
        </li>
        <li>
          <a href={SITE.social.linkedin}>LinkedIn</a> (work history)
        </li>
        <li>
          <a href={SITE.social.orcid}>ORCID</a> (publications)
        </li>
        <li>
          <a href={`mailto:${SITE.email}`}>Email</a> (best way to reach me)
        </li>
        <li>
          <a href={SITE.resumeUrl}>Resume (PDF)</a>
        </li>
      </ul>

      <h2>Pages</h2>
      <ul>
        <li>
          <Link to="/research">Research</Link> (papers and open-source evals)
        </li>
        <li>
          <Link to="/writing">Writing</Link> (short fiction)
        </li>
        <li>
          <Link to="/books">Books</Link> (what I've read and liked)
        </li>
        <li>
          <Link to="/interests">Interests</Link> (what I keep returning to)
        </li>
        <li>
          <Link to="/now">Now</Link> (what I'm working on this month)
        </li>
        <li>
          <Link to="/then">Then</Link> (archived /now snapshots)
        </li>
      </ul>
    </main>
  );
}
