import { Link, useLocation } from "@remix-run/react";
import { SITE } from "~/utils/site-config";
import { ThemePicker } from "./ThemePicker";
import { SparkleText } from "./SparkleText";
import { PixelIcon } from "./PixelIcon";

export function TopNav({ current }: { current?: string }) {
  const links = [
    { to: "/", label: "Home", icon: "home" as const },
    { to: "/research", label: "Research", icon: "research" as const },
    { to: "/writing", label: "Writing", icon: "writing" as const },
    { to: "/books", label: "Books", icon: "books" as const },
    { to: "/interests", label: "Interests", icon: "interests" as const },
    { to: "/now", label: "Now", icon: "now" as const },
    { to: "/then", label: "Then", icon: "then" as const },
    { to: SITE.resumeUrl, label: "Resume", icon: "resume" as const, external: true },
  ];
  return (
    <nav className="topnav" aria-label="Primary">
      {links.map((l) =>
        l.external ? (
          <a key={l.to} href={l.to}>
            <PixelIcon name={l.icon} />
            {l.label}
          </a>
        ) : (
          <Link
            key={l.to}
            to={l.to}
            aria-current={current === l.to ? "page" : undefined}
          >
            <PixelIcon name={l.icon} />
            {l.label}
          </Link>
        ),
      )}
    </nav>
  );
}

export function SiteHeader() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  return (
    <header className="site-header">
      {isHome ? (
        <h1 className="site-name">{SITE.name}</h1>
      ) : (
        <p className="site-name">
          <Link to="/">{SITE.name}</Link>
        </p>
      )}
      <p className="site-tagline">
        <SparkleText text={SITE.bio} />
      </p>
      <p className="site-social">
        <a href={`mailto:${SITE.email}`}>
          <PixelIcon name="mail" />
          {SITE.email}
        </a>{" "}
        ·{" "}
        <a href={SITE.social.github}>
          <PixelIcon name="github" />
          GitHub
        </a>{" "}
        ·{" "}
        <a href={SITE.social.linkedin}>
          <PixelIcon name="linkedin" />
          LinkedIn
        </a>{" "}
        ·{" "}
        <a href={SITE.social.orcid}>
          <PixelIcon name="orcid" />
          ORCID
        </a>
      </p>
      <TopNav current={pathname} />
    </header>
  );
}

export function Footer() {
  return (
    <footer>
      <ThemePicker />
      <p className="muted">© {new Date().getFullYear()} {SITE.name}.</p>
    </footer>
  );
}
