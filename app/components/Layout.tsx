import { Link, useLocation } from "@remix-run/react";
import { SITE } from "~/utils/site-config";
import { ThemePicker } from "./ThemePicker";
import { SparkleText } from "./SparkleText";

export function TopNav({ current }: { current?: string }) {
  const links = [
    { to: "/", label: "Home" },
    { to: "/books", label: "Books" },
    { to: "/interests", label: "Interests" },
    { to: "/now", label: "Now" },
    { to: "/then", label: "Then" },
    { to: SITE.resumeUrl, label: "Resume", external: true },
  ];
  return (
    <nav className="topnav" aria-label="Primary">
      {links.map((l) =>
        l.external ? (
          <a key={l.to} href={l.to}>
            {l.label}
          </a>
        ) : (
          <Link
            key={l.to}
            to={l.to}
            aria-current={current === l.to ? "page" : undefined}
          >
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
      <TopNav current={pathname} />
    </header>
  );
}

export function Footer() {
  return (
    <footer>
      <p>
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a> ·{" "}
        <a href={SITE.social.github}>GitHub</a> ·{" "}
        <a href={SITE.social.linkedin}>LinkedIn</a>
      </p>
      <ThemePicker />
      <p className="muted">© {new Date().getFullYear()} {SITE.name}.</p>
    </footer>
  );
}
