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

export const links = () => [
  { rel: "stylesheet", href: styles },
  { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
  { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
];

export const meta = () => [
  { name: "author", content: SITE.name },
  { name: "theme-color", content: "#14161a" },
  { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <a href="#content" className="skip-link">Skip to content</a>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <Analytics />
      </body>
    </html>
  );
}

export { ErrorBoundary } from "~/components/ErrorBoundary";
