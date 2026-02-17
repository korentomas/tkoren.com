import type { MetaFunction } from "@vercel/remix";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllPosts } from "~/utils/blog.server";
import type { BlogPost } from "~/utils/blog.server";
import { Spoiler, Typewriter } from "~/components/EasterEgg";
import { Comments } from "~/components/Comments";

const mdxComponents = {
  Spoiler,
  Typewriter,
};

export const loader = async () => {
  const posts = getAllPosts();
  return json({ posts });
};

export const meta: MetaFunction = () => [
  { title: "Tomás Korenblit" },
  {
    name: "description",
    content: "Writing and work by Tomás Korenblit.",
  },
];

export default function Index() {
  const { posts } = useLoaderData<typeof loader>();
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
    }, 400);
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

    if (next === 3) {
      setShimmer(true);
      setTimeout(() => setShimmer(false), 800);
    }
    if (next === 7) {
      setWobble(true);
      setTimeout(() => setWobble(false), 600);
    }
    if (next === 10) {
      setHiddenMsg(true);
      setTimeout(() => setHiddenMsg(false), 3000);
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
        setTimeout(() => setInverted(false), 2000);
        setTimeout(() => setToast(null), 2500);
      }
    };
    window.addEventListener("keydown", handleKonami);
    return () => window.removeEventListener("keydown", handleKonami);
  }, []);

  const hero = posts[0];
  const rest = posts.slice(1, 5);

  return (
    <div className={inverted ? "inverted" : ""} style={{ transition: "filter 0.5s ease" }}>
      <motion.div
        className="bento"
        animate={wobble ? { rotate: [0, -1, 1, -1, 0] } : { opacity: expandedSlug ? 0 : 1 }}
        transition={wobble ? { duration: 0.5, ease: "easeInOut" } : { duration: 0.2 }}
      >
        {/* Identity Tile */}
        <div className="tile tile--identity">
          <div>
            <h1
              className={`identity-name${shimmer ? " shimmer" : ""}`}
              onClick={handleNameClick}
              style={{ cursor: "pointer" }}
            >
              Tomás Korenblit
            </h1>
            <p className="identity-bio">
              Building things with data, code, and occasionally 3D-printed
              plastic. Based in Buenos Aires.
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
            <a href="https://github.com/tomaskorenblit" target="_blank" rel="noreferrer" aria-label="GitHub">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>
            </a>
            <a href="https://linkedin.com/in/tomaskorenblit" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
            </a>
            <a href="mailto:tomaskorenblit@gmail.com" aria-label="Email">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
            </a>
          </div>
        </div>

        {/* Hero blog tile — latest post */}
        {hero && (
          <motion.div
            className="tile tile--hero tile--clickable"
            layoutId={`tile-${hero.slug}`}
            onClick={() => openPost(hero.slug)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && openPost(hero.slug)}
          >
            <div>
              <span className="tile-type">{hero.type}</span>
              <h2 className="tile-title">{hero.title}</h2>
              <p className="tile-excerpt">{hero.excerpt}</p>
            </div>
            <span className="tile-date">
              {new Date(hero.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </motion.div>
        )}

        {/* Remaining tiles */}
        {rest.map((post) => (
          <motion.div
            key={post.slug}
            className="tile tile--small tile--clickable"
            layoutId={`tile-${post.slug}`}
            onClick={() => openPost(post.slug)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && openPost(post.slug)}
          >
            <div>
              <span className="tile-type">{post.type}</span>
              <h2 className="tile-title">{post.title}</h2>
              <p className="tile-excerpt">{post.excerpt}</p>
            </div>
            <span className="tile-date">
              {new Date(post.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </motion.div>
        ))}

        {/* View all tile */}
        {posts.length > 5 && (
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
              transition={{ duration: 0.2 }}
            />
            <motion.div
              className="post-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                className="post-close"
                onClick={closePost}
                aria-label="Close post"
              >
                ×
              </button>
              <motion.article
                className="post-expanded"
                layoutId={`tile-${expandedSlug}`}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 30,
                }}
              >
                {postMeta && (
                  <header className="post-header">
                    <div className="post-meta">
                      {postMeta.type} ·{" "}
                      {new Date(postMeta.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    <h1 className="post-title">{postMeta.title}</h1>
                  </header>
                )}
                <div className="post-content">
                  {PostComponent && <PostComponent components={mdxComponents} />}
                </div>
                {expandedSlug && <Comments slug={expandedSlug} />}
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
            transition={{ duration: 0.3 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
