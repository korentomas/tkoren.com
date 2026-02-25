import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { Analytics } from "@vercel/analytics/remix";
import styles from "./styles/global.css?url";
import { SITE_URL, SITE } from "~/utils/site-config";

export const links = () => [
  { rel: "stylesheet", href: styles },
  { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
  { rel: "apple-touch-icon", href: "/me.png" },
  { rel: "canonical", href: SITE_URL },
];

export const meta = () => [
  { name: "author", content: SITE.name },
  { name: "theme-color", content: "#F7F6F3" },
  { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var t = localStorage.getItem('theme');
            if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', t);
          })();
        ` }} />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <Analytics />
      </body>
    </html>
  );
}
