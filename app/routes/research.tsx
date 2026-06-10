import type { MetaFunction } from "@vercel/remix";
import { RESEARCH, SITE, SITE_URL } from "~/utils/site-config";
import { SparkleText } from "~/components/SparkleText";

export const meta: MetaFunction = () => [
  { title: `Research · ${SITE.name}` },
  {
    name: "description",
    content: `Papers and open-source evaluation work by ${SITE.name}, mostly on AI safety.`,
  },
  { property: "og:title", content: `Research · ${SITE.name}` },
  { property: "og:url", content: `${SITE_URL}/research` },
  { tagName: "link", rel: "canonical", href: `${SITE_URL}/research` },
];

export default function Research() {
  return (
    <main id="content">
      <h1>Research</h1>
      <p className="lede">
        My papers, and the open-source evals that come with them. Mostly AI safety.
      </p>

      {RESEARCH.map((entry) => (
        <section key={entry.title}>
          <h2>{entry.title}</h2>
          <p className="muted">
            {entry.venue}
            {entry.status && `. ${entry.status}.`}
          </p>
          <p>
            <SparkleText text={entry.summary} />
          </p>
          {entry.note && (
            <p>
              <SparkleText text={entry.note} />
            </p>
          )}
          {entry.links && entry.links.length > 0 && (
            <p>
              {entry.links.map((l, i) => (
                <span key={l.href}>
                  {i > 0 && " · "}
                  <a href={l.href}>{l.label}</a>
                </span>
              ))}
            </p>
          )}
        </section>
      ))}
    </main>
  );
}
