import type { LoaderFunctionArgs, MetaFunction } from "@vercel/remix";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useState, useEffect } from "react";
import { getPost } from "~/utils/blog.server";
import type { BlogPost } from "~/utils/blog.server";
import { PostArticle } from "~/components/PostArticle";
import { SITE_URL, SITE } from "~/utils/site-config";

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
  if (!data) return [{ title: SITE.name }];
  const { frontmatter, slug } = data;
  const title = `${frontmatter.title} — ${SITE.name}`;
  const url = `${SITE_URL}/blog/${slug}`;
  const image = frontmatter.cover
    ? `${SITE_URL}${frontmatter.cover}`
    : `${SITE_URL}/og-image.png`;

  return [
    { title },
    { name: "description", content: frontmatter.excerpt },
    { property: "og:type", content: "article" },
    { property: "og:url", content: url },
    { property: "og:title", content: frontmatter.title },
    { property: "og:description", content: frontmatter.excerpt },
    { property: "og:image", content: image },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: frontmatter.title },
    { property: "og:locale", content: "en_US" },
    { property: "og:site_name", content: SITE.name },
    { property: "article:published_time", content: frontmatter.date },
    { property: "article:author", content: SITE_URL },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: frontmatter.title },
    { name: "twitter:description", content: frontmatter.excerpt },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: frontmatter.title },
    { tagName: "link", rel: "canonical", href: url },
    {
      "script:ld+json": JSON.stringify([
        {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: frontmatter.title,
          description: frontmatter.excerpt,
          datePublished: frontmatter.date,
          dateModified: frontmatter.date,
          url,
          image,
          author: {
            "@type": "Person",
            name: SITE.name,
            url: SITE_URL,
            jobTitle: SITE.title,
          },
          publisher: {
            "@type": "Person",
            name: SITE.name,
            url: SITE_URL,
          },
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: SITE_URL,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: frontmatter.title,
              item: url,
            },
          ],
        },
      ]),
    },
  ];
};

export default function BlogPostRoute() {
  const { slug, frontmatter } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [Component, setComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    import(`../blog/${slug}.mdx`).then((mod) => {
      setComponent(() => mod.default);
    });
  }, [slug]);

  return (
    <div className="post-overlay" style={{ position: "relative" }}>
      <article
        className="post-expanded post-expanded--colored"
        style={{ "--tile-hue": frontmatter.hue ?? 250 } as React.CSSProperties}
      >
        <PostArticle
          frontmatter={frontmatter as BlogPost}
          slug={slug}
          Component={Component}
          onTagClick={(filter) => navigate(`/?${filter.type}=${filter.value}`)}
        />
      </article>
    </div>
  );
}
