import { useState } from "react";
import { PixelIcon } from "./PixelIcon";

// Address kept in split parts and assembled only on click, so the raw
// "user@domain" string never appears in the static HTML scrapers harvest.
// Display uses " at "/" dot " for the same reason. Click copies the real
// address to the clipboard (the action this audience actually wants).
const USER = "tomaskorenblit";
const DOMAIN = "gmail.com";
const SHOWN = `${USER} at ${DOMAIN.replace(".", " dot ")}`;

export function EmailLink() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${USER}@${DOMAIN}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked (insecure context / permissions): fall back to mailto.
      window.location.href = `mailto:${USER}@${DOMAIN}`;
    }
  };

  return (
    <button
      type="button"
      className={`email-link${copied ? " email-link-copied" : ""}`}
      onClick={copy}
      aria-label="Copy email address"
    >
      <PixelIcon name="mail" />
      <span aria-live="polite">{copied ? "copied!" : SHOWN}</span>
    </button>
  );
}
