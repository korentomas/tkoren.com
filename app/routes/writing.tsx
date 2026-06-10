import type { MetaFunction } from "@vercel/remix";
import { WRITING, SITE, SITE_URL } from "~/utils/site-config";

export const meta: MetaFunction = () => [
  { title: `Writing · ${SITE.name}` },
  {
    name: "description",
    content: `Short fiction by ${SITE.name}.`,
  },
  { property: "og:title", content: `Writing · ${SITE.name}` },
  { property: "og:url", content: `${SITE_URL}/writing` },
  { tagName: "link", rel: "canonical", href: `${SITE_URL}/writing` },
];

export default function Writing() {
  return (
    <main id="content">
      <h1>Writing</h1>
      <p className="lede">Short fiction.</p>

      {WRITING.map((piece) => (
        <article key={piece.title} className="writing-piece">
          <h2>{piece.title}</h2>
          <p className="muted">{piece.year}</p>
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
