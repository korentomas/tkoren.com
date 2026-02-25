import { motion } from "framer-motion";
import type { BlogPost } from "~/utils/blog.server";
import { ShaderBanner } from "~/components/ShaderBanner";
import { Comments } from "~/components/Comments";
import { mdxComponents } from "~/utils/site-config";

const SLIDE_BACK_BUTTON = { delay: 0.2, duration: 0.3, ease: "easeOut" as const };

interface PostArticleProps {
  frontmatter: BlogPost;
  slug: string;
  Component: React.ComponentType<{ components?: Record<string, React.ComponentType> }> | null;
  onBack?: () => void;
  onTagClick?: (filter: { type: "category" | "tag"; value: string }) => void;
}

/**
 * Shared post article content used by both the overlay in _index.tsx
 * and the dedicated route in blog.$slug.tsx.
 *
 * Renders the back button, banner/cover, header, MDX content, and comments.
 * Does NOT render the wrapping <article> element — each consumer provides
 * its own wrapper with route-specific styling and animation props.
 */
export function PostArticle({ frontmatter, slug, Component, onBack, onTagClick }: PostArticleProps) {
  return (
    <>
      {onBack ? (
        <motion.button
          className="post-back"
          onClick={onBack}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={SLIDE_BACK_BUTTON}
          aria-label="Go back"
        >
          &larr; Back
        </motion.button>
      ) : (
        <motion.a
          href="/"
          className="post-back"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={SLIDE_BACK_BUTTON}
        >
          &larr; Back
        </motion.a>
      )}
      {frontmatter.shader && (
        <div className="post-banner-wrapper">
          <ShaderBanner
            shader={frontmatter.shader}
            colors={frontmatter.shaderColors}
            height="180px"
          />
        </div>
      )}
      {frontmatter.cover && !frontmatter.shader && (
        <div className="post-banner-wrapper">
          <img
            src={frontmatter.cover}
            alt={frontmatter.title}
            className="post-banner-img"
          />
        </div>
      )}
      <header className="post-header">
        <div className="post-meta">
          {frontmatter.type} ·{" "}
          {new Date(frontmatter.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
        <h1 className="post-title">{frontmatter.title}</h1>
        {/* Project metadata bar */}
        {frontmatter.type === "project" && (frontmatter.repo || frontmatter.demo || frontmatter.status) && (
          <div className="post-project-meta">
            {frontmatter.status && (
              <span className={`tile-status tile-status--${frontmatter.status}`} aria-label={`Project status: ${frontmatter.status}`}>
                <span className="tile-status-dot" aria-hidden="true" />
                {frontmatter.status}
              </span>
            )}
            {frontmatter.repo && (
              <a href={frontmatter.repo} target="_blank" rel="noopener noreferrer" className="post-project-link" aria-label="View source code on GitHub">
                GitHub ↗
              </a>
            )}
            {frontmatter.demo && (
              <a href={frontmatter.demo} target="_blank" rel="noopener noreferrer" className="post-project-link" aria-label="View live demo">
                Demo ↗
              </a>
            )}
          </div>
        )}
      </header>
      <div className="post-content">
        {Component && <Component components={mdxComponents} />}
      </div>
      <Comments slug={slug} />
      {frontmatter.tags && frontmatter.tags.length > 0 && (
        <div className="post-tags">
          {frontmatter.tags.map((tag) => (
            <button
              key={tag}
              className="post-tag-pill"
              onClick={() => onTagClick?.({ type: "tag", value: tag })}
              aria-label={`Filter by ${tag}`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
