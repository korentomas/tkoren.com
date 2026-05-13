import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { Analytics } from "@vercel/analytics/remix";
import styles from "./styles/global.css?url";
import { SITE } from "~/utils/site-config";
import { SiteHeader, Footer } from "~/components/Layout";

export const links = () => [
  { rel: "stylesheet", href: styles },
  { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
  { rel: "apple-touch-icon", href: "/me.png" },
];

export const meta = () => [
  { name: "author", content: SITE.name },
  { name: "theme-color", content: "#0a1b0a" },
  { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
];

export default function App() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script src="/theme-init.js" />
        <Meta />
        <Links />
      </head>
      <body>
        <a href="#content" className="skip-link">Skip to content</a>
        <SiteHeader />
        <Outlet />
        <Footer />
        <ScrollRestoration />
        <Scripts />
        <Analytics />
      </body>
    </html>
  );
}

export { ErrorBoundary } from "~/components/ErrorBoundary";
