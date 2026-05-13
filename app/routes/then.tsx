import type { MetaFunction } from "@vercel/remix";
import { Link } from "@remix-run/react";
import { THEN, SITE, SITE_URL } from "~/utils/site-config";
import { SparkleText } from "~/components/SparkleText";

export const meta: MetaFunction = () => [
  { title: `Then · ${SITE.name}` },
  {
    name: "description",
    content: `Archive of past /now snapshots from ${SITE.name}.`,
  },
  { property: "og:title", content: `Then · ${SITE.name}` },
  { property: "og:url", content: `${SITE_URL}/then` },
  { tagName: "link", rel: "canonical", href: `${SITE_URL}/then` },
];

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function Then() {
  return (
    <main id="content">
      <h1>Then</h1>
      <p className="lede">A record of past /now pages.</p>

      {THEN.length === 0 ? (
        <p className="muted">
          Nothing archived yet. When the <Link to="/now">/now</Link> page
          gets its next update, the current snapshot will land here.
        </p>
      ) : (
        THEN.map((snap) => (
          <section key={snap.date}>
            <h2>{formatDate(snap.date)}</h2>
            {snap.sections.map((s) => (
              <div key={s.heading} className="stack">
                <h3>{s.heading}</h3>
                <p>
                  <SparkleText text={s.body} />
                  {s.link && (
                    <>
                      {" "}
                      <a href={s.link.href}>{s.link.label}</a>.
                    </>
                  )}
                </p>
              </div>
            ))}
          </section>
        ))
      )}
    </main>
  );
}
