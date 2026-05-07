import type { MetaFunction } from "@vercel/remix";
import { INTERESTS, SITE, SITE_URL } from "~/utils/site-config";
import { SparkleText } from "~/components/SparkleText";

export const meta: MetaFunction = () => [
  { title: `Interests · ${SITE.name}` },
  {
    name: "description",
    content: `What ${SITE.name} keeps returning to: Bayesian and causal inference, AI safety, tools for thought.`,
  },
  { property: "og:title", content: `Interests · ${SITE.name}` },
  { property: "og:url", content: `${SITE_URL}/interests` },
  { tagName: "link", rel: "canonical", href: `${SITE_URL}/interests` },
];

export default function Interests() {
  return (
    <main id="content">
      <h1>Interests</h1>
      <p className="lede">Subjects I keep coming back to.</p>

      {INTERESTS.map((it) => (
        <section key={it.title}>
          <h2>{it.title}</h2>
          <p><SparkleText text={it.body} /></p>
        </section>
      ))}
    </main>
  );
}
