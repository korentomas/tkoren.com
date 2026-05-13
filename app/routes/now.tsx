import type { MetaFunction } from "@vercel/remix";
import { Link } from "@remix-run/react";
import { NOW, SITE, SITE_URL } from "~/utils/site-config";
import { SparkleText } from "~/components/SparkleText";

export const meta: MetaFunction = () => [
  { title: `Now · ${SITE.name}` },
  {
    name: "description",
    content: `What ${SITE.name} is working on, reading, and thinking about right now.`,
  },
  { property: "og:title", content: `Now · ${SITE.name}` },
  { property: "og:url", content: `${SITE_URL}/now` },
  { tagName: "link", rel: "canonical", href: `${SITE_URL}/now` },
];

export default function Now() {
  const formatted = new Date(NOW.date + "T00:00:00Z").toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" },
  );
  return (
    <main id="content">
      <h1>Now</h1>
      <p className="lede">
        What I'm working on this month. Updated {formatted}.
      </p>

      {NOW.sections.map((s) => (
        <section key={s.heading}>
          <h2>{s.heading}</h2>
          <p>
            <SparkleText text={s.body} />
            {s.link && (
              <>
                {" "}
                <a href={s.link.href}>{s.link.label}</a>.
              </>
            )}
          </p>
        </section>
      ))}

      <hr />
      <p className="muted">
        This is a <a href="https://nownownow.com/about">/now page</a>, a
        snapshot of my current focus. Older snapshots live on{" "}
        <Link to="/then">/then</Link>.
      </p>
    </main>
  );
}
