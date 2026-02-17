import { useEffect, useRef } from "react";

interface CommentsProps {
  slug: string;
}

export function Comments({ slug }: CommentsProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Clean up any existing giscus instance
    const existing = ref.current.querySelector("iframe");
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", "tomaskorenblit/remix-portfolio-1");
    // TODO: Configure these IDs after enabling GitHub Discussions on the repo
    // and completing setup at https://giscus.app
    script.setAttribute("data-repo-id", "");
    script.setAttribute("data-category", "Blog Comments");
    script.setAttribute("data-category-id", "");
    script.setAttribute("data-mapping", "specific");
    script.setAttribute("data-term", slug);
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", "light_tritanopia");
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

  return <div ref={ref} className="comments-section" />;
}
