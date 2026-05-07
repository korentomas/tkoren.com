import { Fragment } from "react";

// Any of these characters, typed inline in a body string, will render
// wrapped in a .sparkle span (theme-accent color). Surrounding text is
// left as-is.
const SPARKLES = ["✦", "✧", "✻", "✽", "✶", "✴", "✳"] as const;
const SPARKLE_RE = new RegExp(`([${SPARKLES.join("")}])`, "g");

export function SparkleText({ text }: { text: string }) {
  if (!SPARKLES.some((s) => text.includes(s))) return <>{text}</>;
  const parts = text.split(SPARKLE_RE);
  return (
    <>
      {parts.map((part, i) =>
        SPARKLES.includes(part as (typeof SPARKLES)[number]) ? (
          <span key={i} className="sparkle" aria-hidden="true">
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
