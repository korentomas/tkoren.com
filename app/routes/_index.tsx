import type { MetaFunction } from "@vercel/remix";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { json } from "@remix-run/node";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllPosts } from "~/utils/blog.server";
import type { BlogPost } from "~/utils/blog.server";
import { MeshGradient } from "@paper-design/shaders-react";
import { ShaderBanner } from "~/components/ShaderBanner";
import { PostArticle } from "~/components/PostArticle";
import { FilterBar } from "~/components/FilterBar";
import { SITE_URL, SITE, SOCIAL_LINKS, CATEGORY_LABELS, mdxComponents } from "~/utils/site-config";

/* ─── Layout ─────────────────────────────────────── */
const MAX_VISIBLE_POSTS = 5;
const DEFAULT_HUE = 250;

/* ─── Animation ──────────────────────────────────── */
const OVERLAY_EXIT_MS = 400;
const SPRING_CONTENT = { type: "spring" as const, stiffness: 200, damping: 30 };
const FADE_OVERLAY_BG = { duration: 0.2 };
const FADE_OVERLAY = { duration: 0.3 };
const FADE_TOAST = { duration: 0.3 };

/* ─── Easter eggs ────────────────────────────────── */
const SHIMMER_CLICKS = 3;
const SHIMMER_MS = 800;
const WOBBLE_CLICKS = 7;
const WOBBLE_MS = 600;
const REVEAL_CLICKS = 10;
const REVEAL_MS = 3000;
const KONAMI_INVERT_MS = 2000;
const KONAMI_TOAST_MS = 2500;

// Inline content for tall tiles — defined outside component to prevent remount
function TallTileContent({ slug, isStatic }: { slug: string; isStatic?: boolean }) {
  const [Content, setContent] = useState<React.ComponentType | null>(null);
  const [overflows, setOverflows] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    import(`../blog/${slug}.mdx`).then((mod) => setContent(() => mod.default));
  }, [slug]);
  useEffect(() => {
    if (contentRef.current) {
      setOverflows(contentRef.current.scrollHeight > contentRef.current.clientHeight);
    }
  }, [Content]);
  return (
    <>
      <div className="tile-inline-content" ref={contentRef}>
        {Content && <Content components={mdxComponents} />}
      </div>
      {overflows && !isStatic && (
        <div className="tile-inline-fade">
          <span className="tile-read-more">Read more</span>
        </div>
      )}
    </>
  );
}

function TilePreview({ post, height }: { post: BlogPost; height: string }) {
  if (post.shader) {
    return (
      <div className="tile-preview">
        <ShaderBanner shader={post.shader} colors={post.shaderColors} height={height} />
      </div>
    );
  }
  if (post.cover) {
    return (
      <div className="tile-preview">
        <img src={post.cover} alt={post.title} loading="lazy" style={{ width: "100%", height, objectFit: "cover" }} />
      </div>
    );
  }
  return null;
}

export const loader = async () => {
  const posts = getAllPosts();
  return json({ posts });
};

export const meta: MetaFunction = () => [
  { title: `${SITE.name} — ${SITE.title}` },
  { name: "description", content: SITE.description },
  { property: "og:type", content: "website" },
  { property: "og:url", content: SITE_URL },
  { property: "og:title", content: `${SITE.name} — ${SITE.title}` },
  { property: "og:description", content: SITE.description },
  { property: "og:image", content: `${SITE_URL}/og-image.png` },
  { property: "og:image:width", content: "1200" },
  { property: "og:image:height", content: "630" },
  { property: "og:image:alt", content: `${SITE.name} — personal site` },
  { property: "og:locale", content: "en_US" },
  { property: "og:site_name", content: SITE.name },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: `${SITE.name} — ${SITE.title}` },
  { name: "twitter:description", content: SITE.shortDescription },
  { name: "twitter:image", content: `${SITE_URL}/og-image.png` },
  { name: "twitter:image:alt", content: `${SITE.name} — personal site` },
  {
    "script:ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      name: SITE.name,
      alternateName: SITE.alternateName,
      url: SITE_URL,
      image: `${SITE_URL}${SITE.image}`,
      email: SITE.email,
      jobTitle: SITE.title,
      worksFor: {
        "@type": "Organization",
        name: SITE.worksFor,
      },
      knowsAbout: [...SITE.knowsAbout],
      sameAs: [
        SITE.social.github,
        SITE.social.linkedin,
      ],
    }),
  },
];

export default function Index() {
  const { posts } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeFilter = (() => {
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    if (category) return { type: "category" as const, value: category };
    if (tag) return { type: "tag" as const, value: tag };
    return null;
  })();

  const handleFilter = useCallback((filter: { type: "category" | "tag"; value: string } | null) => {
    if (!filter) {
      setSearchParams({});
    } else {
      setSearchParams({ [filter.type]: filter.value });
    }
  }, [setSearchParams]);

  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [PostComponent, setPostComponent] = useState<React.ComponentType | null>(null);
  const [postMeta, setPostMeta] = useState<BlogPost | null>(null);

  // Easter egg state
  const [nameClicks, setNameClicks] = useState(0);
  const [shimmer, setShimmer] = useState(false);
  const [wobble, setWobble] = useState(false);
  const [hiddenMsg, setHiddenMsg] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [inverted, setInverted] = useState(false);
  const konamiRef = useRef<string[]>([]);

  const openPost = useCallback(async (slug: string) => {
    const mod = await import(`../blog/${slug}.mdx`);
    setPostComponent(() => mod.default);
    setPostMeta(posts.find((p) => p.slug === slug) || null);
    setExpandedSlug(slug);
    document.body.classList.add("scroll-locked");
    window.history.pushState(null, "", `/blog/${slug}`);
  }, [posts]);

  const closePost = useCallback(() => {
    setExpandedSlug(null);
    document.body.classList.remove("scroll-locked");
    window.history.pushState(null, "", "/");
    setTimeout(() => {
      setPostComponent(null);
      setPostMeta(null);
    }, OVERLAY_EXIT_MS);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (expandedSlug) {
        closePost();
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [expandedSlug, closePost]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && expandedSlug) {
        closePost();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [expandedSlug, closePost]);

  // Identity name click handler
  const handleNameClick = useCallback(() => {
    const next = nameClicks + 1;
    setNameClicks(next);

    if (next === SHIMMER_CLICKS) {
      setShimmer(true);
      setTimeout(() => setShimmer(false), SHIMMER_MS);
    }
    if (next === WOBBLE_CLICKS) {
      setWobble(true);
      setTimeout(() => setWobble(false), WOBBLE_MS);
    }
    if (next === REVEAL_CLICKS) {
      setHiddenMsg(true);
      setTimeout(() => setHiddenMsg(false), REVEAL_MS);
      setNameClicks(0);
    }
  }, [nameClicks]);

  // Konami code listener
  useEffect(() => {
    const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    const handleKonami = (e: KeyboardEvent) => {
      konamiRef.current.push(e.key);
      if (konamiRef.current.length > KONAMI.length) {
        konamiRef.current = konamiRef.current.slice(-KONAMI.length);
      }
      if (konamiRef.current.length === KONAMI.length && konamiRef.current.every((k, i) => k === KONAMI[i])) {
        konamiRef.current = [];
        setInverted(true);
        setToast("nice");
        setTimeout(() => setInverted(false), KONAMI_INVERT_MS);
        setTimeout(() => setToast(null), KONAMI_TOAST_MS);
      }
    };
    window.addEventListener("keydown", handleKonami);
    return () => window.removeEventListener("keydown", handleKonami);
  }, []);

  // Theme toggle
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const preferred = saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(preferred);
    document.documentElement.setAttribute("data-theme", preferred);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
      return next;
    });
  }, []);

  // Deterministic hue from slug when no hue is specified
  const slugToHue = (slug: string): number => {
    let hash = 0;
    for (let i = 0; i < slug.length; i++) {
      hash = slug.charCodeAt(i) + ((hash << 5) - hash);
    }
    return ((hash % 360) + 360) % 360;
  };

  const getHue = (post: BlogPost) => post.hue ?? slugToHue(post.slug);

  // Bento size: hero is tall, essays are wide, notes are 1x1
  const tileSize = (post: BlogPost): "wide" | "tall" | "small" => {
    if (post.layout) return post.layout;
    if (post.type === "essay" || post.type === "project") return "wide";
    return "small";
  };

  const filteredPosts = activeFilter
    ? posts.filter((post) => {
        if (activeFilter.type === "category") return post.category === activeFilter.value;
        if (activeFilter.type === "tag") return post.tags?.includes(activeFilter.value);
        return true;
      })
    : posts;
  const visiblePosts = filteredPosts.slice(0, activeFilter ? filteredPosts.length : MAX_VISIBLE_POSTS);

  return (
    <div className={inverted ? "inverted" : ""} style={{ transition: "filter 0.5s ease" }}>
      <motion.div
        className="bento"
        animate={wobble ? { rotate: [0, -1, 1, -1, 0] } : undefined}
        transition={wobble ? { duration: 0.5, ease: "easeInOut" } : undefined}
        layout={false}
      >
        {/* Identity Tile */}
        <div className="tile tile--identity">
          <div className="tile-shader-bg">
            <MeshGradient
              colors={theme === "dark"
                ? ["#3B6CB5", "#1A4F8A", "#2A3A5C", "#4A7AC7"]
                : ["#4A90D9", "#89CFF0", "#B8D4E3", "#F7F6F3"]
              }
              speed={0.15}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: theme === "dark" ? 0.5 : 0.3 }}
            />
          </div>
          <div className="identity-image">
            <img
              src={SITE.image}
              alt={SITE.name}
              draggable="false"
            />
          </div>
          <div className="identity-content">
            <div>
              <h1
                className={`identity-name${shimmer ? " shimmer" : ""}`}
                onClick={handleNameClick}
                style={{ cursor: "pointer" }}
              >
                {SITE.name}
              </h1>
              <p className="identity-bio">
                {SITE.bio}
              </p>
              <AnimatePresence>
                {hiddenMsg && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}
                  >
                    you found me
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            <div className="identity-links">
            {SOCIAL_LINKS.map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noreferrer" aria-label={link.label}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: link.icon }} />
              </a>
            ))}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
            >
              {theme === "light" ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
              )}
            </button>
            </div>
          </div>
        </div>

        <FilterBar posts={posts} activeFilter={activeFilter} onFilter={handleFilter} />

        {/* Live region for screen readers */}
        <div className="sr-only" aria-live="polite" role="status">
          {activeFilter
            ? `Showing ${filteredPosts.length} post${filteredPosts.length !== 1 ? "s" : ""}`
            : `Showing all ${posts.length} posts`}
        </div>

        {/* Blog tiles — sized by type */}
        {visiblePosts.map((post, i) => {
          const size = tileSize(post);
          const interactive = !post.static;
          return (
            <motion.div
              key={post.slug}
              className={`tile tile--${size}${interactive ? " tile--clickable" : ""} tile--colored`}
              {...(interactive ? {
                onClick: () => openPost(post.slug),
                role: "button" as const,
                tabIndex: 0,
                onKeyDown: (e: React.KeyboardEvent) => (e.key === "Enter" || e.key === " ") && openPost(post.slug),
              } : {})}
              style={{ "--tile-hue": getHue(post) } as React.CSSProperties}
              layout="position"
            >
              <TilePreview post={post} height={size === "small" ? "48px" : "80px"} />
              <div>
                <span className="tile-type">
                  {post.type}{post.category && ` · ${CATEGORY_LABELS[post.category] ?? post.category}`}
                </span>
                <h2 className="tile-title">{post.title}</h2>
                {size !== "tall" && (
                  <p className="tile-excerpt">{post.excerpt}</p>
                )}
              </div>
              {size === "tall" && <TallTileContent slug={post.slug} isStatic={post.static} />}
              <div className="tile-footer">
                {post.type === "project" && (
                  <span className="tile-project-links">
                    {post.status && (
                      <span className={`tile-status tile-status--${post.status}`} aria-label={`Project status: ${post.status}`}>
                        <span className="tile-status-dot" aria-hidden="true" />
                        {post.status}
                      </span>
                    )}
                    {post.repo && (
                      <a href={post.repo} target="_blank" rel="noopener noreferrer" aria-label={`${post.title} source code on GitHub`} className="tile-link-icon" onClick={(e) => e.stopPropagation()}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>
                      </a>
                    )}
                    {post.demo && (
                      <a href={post.demo} target="_blank" rel="noopener noreferrer" aria-label={`${post.title} live demo`} className="tile-link-icon" onClick={(e) => e.stopPropagation()}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                      </a>
                    )}
                  </span>
                )}
                <span className="tile-date">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </motion.div>
          );
        })}

        {/* View all tile */}
        {!activeFilter && posts.length > MAX_VISIBLE_POSTS && (
          <div className="tile tile--small tile--viewall tile--clickable">
            <span className="viewall-text">View all writing →</span>
          </div>
        )}
      </motion.div>

      {/* Expanded post overlay */}
      <AnimatePresence>
        {expandedSlug && (
          <>
            <motion.div
              className="post-overlay-bg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={FADE_OVERLAY_BG}
            />
            <motion.div
              className="post-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={FADE_OVERLAY}
            >
              <motion.article
                className="post-expanded post-expanded--colored"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={SPRING_CONTENT}
                style={{ "--tile-hue": postMeta ? getHue(postMeta) : DEFAULT_HUE } as React.CSSProperties}
              >
                <PostArticle
                  frontmatter={postMeta!}
                  slug={expandedSlug}
                  Component={PostComponent}
                  onBack={closePost}
                  onTagClick={(filter) => {
                    closePost();
                    handleFilter(filter);
                  }}
                />
              </motion.article>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={FADE_TOAST}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
