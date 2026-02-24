import { useEffect, useRef } from "react";

interface CommentsProps {
  slug: string;
}

export function Comments({ slug }: CommentsProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const existing = ref.current.querySelector("iframe");
    if (existing) existing.remove();

    const theme = document.documentElement.getAttribute("data-theme") === "dark"
      ? "dark_dimmed"
      : "light_tritanopia";

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", "korentomas/tkoren.com");
    script.setAttribute("data-repo-id", "R_kgDOOh7s6Q");
    script.setAttribute("data-category", "General");
    script.setAttribute("data-category-id", "DIC_kwDOOh7s6c4C2mR5");
    script.setAttribute("data-mapping", "specific");
    script.setAttribute("data-term", slug);
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", theme);
    script.setAttribute("data-lang", "en");
    script.setAttribute("data-loading", "lazy");
    script.crossOrigin = "anonymous";
    script.async = true;

    ref.current.appendChild(script);

    return () => {
      if (ref.current) {
        const iframe = ref.current.querySelector("iframe");
        if (iframe) iframe.remove();
        const scriptEl = ref.current.querySelector("script");
        if (scriptEl) scriptEl.remove();
      }
    };
  }, [slug]);

  return (
    <div ref={ref} className="comments-section" role="region" aria-label="Comments" />
  );
}
