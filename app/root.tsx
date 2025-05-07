import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "~/context/ThemeContext";
import styles from "./styles/global.css?url";

export const links = () => [
  { rel: "stylesheet", href: styles }
];

// This script needs to run before any content renders
const themeScript = `
  let theme = (() => {
    if (typeof document !== "undefined") {
      let stored = localStorage.getItem("theme");
      if (stored) return stored;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  })();
  document.documentElement.setAttribute("data-theme", theme);
`;

export default function App() {
  return (
    <html lang="en" data-theme="light">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>
          <Outlet />
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
        <Analytics />
      </body>
    </html>
  );
}
