import type { MetaFunction } from "@vercel/remix";
import { BOOKS, SITE, SITE_URL } from "~/utils/site-config";
import { SparkleText } from "~/components/SparkleText";

export const meta: MetaFunction = () => [
  { title: `Books · ${SITE.name}` },
  {
    name: "description",
    content: `Books ${SITE.name} recommends, organized by theme.`,
  },
  { property: "og:title", content: `Books · ${SITE.name}` },
  { property: "og:url", content: `${SITE_URL}/books` },
  { tagName: "link", rel: "canonical", href: `${SITE_URL}/books` },
];

function Stars({ n }: { n: number }) {
  return (
    <span className="book-rating" aria-label={`${n} out of 5`}>
      {"★".repeat(n)}
      {"☆".repeat(5 - n)}
    </span>
  );
}

export default function Books() {
  return (
    <main id="content">
      <h1>Books</h1>
      <p className="lede">
        A small, opinionated shelf. Not everything I've read, just what I'd
        pass to a friend.
      </p>

      {BOOKS.map((section) => (
        <section key={section.section}>
          <h2>{section.section}</h2>
          {section.items.map((b) => (
            <div className="book" key={`${b.title}-${b.author}`}>
              <span className="book-title">{b.title}</span>
              {", "}
              <span className="book-author">{b.author}</span>
              {b.rating && <Stars n={b.rating} />}
              {b.note && (
                <span className="book-note">
                  <SparkleText text={b.note} />
                </span>
              )}
            </div>
          ))}
        </section>
      ))}

      <hr />
      <p className="muted">
        Last updated April 2026. Recommendations?{" "}
        <a href={`mailto:${SITE.email}`}>Email me</a>.
      </p>
    </main>
  );
}
