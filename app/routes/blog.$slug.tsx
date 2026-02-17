import type { LoaderFunctionArgs, MetaFunction } from "@vercel/remix";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getPost, getAllPosts } from "~/utils/blog.server";
import { Spoiler, Typewriter } from "~/components/EasterEgg";
import { Comments } from "~/components/Comments";
import { ShaderBanner } from "~/components/ShaderBanner";

const mdxComponents = {
  Spoiler,
  Typewriter,
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const slug = params.slug;
  if (!slug) throw redirect("/");

  const post = getPost(slug);
  if (!post) throw redirect("/");

  return json({
    frontmatter: post.frontmatter,
    slug,
  });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [{ title: "Tomas Korenblit" }];
  return [
    { title: `${data.frontmatter.title} — Tomas Korenblit` },
    { name: "description", content: data.frontmatter.excerpt },
  ];
};

export default function BlogPost() {
  const { slug, frontmatter } = useLoaderData<typeof loader>();
  const [Component, setComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    import(`../blog/${slug}.mdx`).then((mod) => {
      setComponent(() => mod.default);
    });
  }, [slug]);

  return (
    <div className="post-overlay" style={{ position: "relative" }}>
      <article className="post-expanded" style={{ borderTop: `3px solid ${frontmatter.accent || "var(--accent)"}` }}>
        <motion.a
          href="/"
          className="post-back"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
        >
          &larr; Back
        </motion.a>
        {frontmatter.shader && (
          <div style={{ marginBottom: "2rem", borderRadius: "var(--tile-radius)", overflow: "hidden" }}>
            <ShaderBanner
              shader={frontmatter.shader}
              colors={frontmatter.shaderColors}
              height="180px"
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
        </header>
        <div className="post-content">
          {Component ? <Component components={mdxComponents} /> : null}
        </div>
        <Comments slug={slug} />
      </article>
    </div>
  );
}
