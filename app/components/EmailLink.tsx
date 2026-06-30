import { PixelIcon } from "./PixelIcon";

// Address kept in split parts and assembled only on click, so the raw
// "user@domain" string and a mailto: href never appear in the static HTML
// that scrapers harvest. Display uses " at "/" dot " for the same reason.
const USER = "tomaskorenblit";
const DOMAIN = "gmail.com";

export function EmailLink() {
  const open = () => {
    window.location.href = `mailto:${USER}@${DOMAIN}`;
  };
  return (
    <button type="button" className="email-link" onClick={open} aria-label="Email">
      <PixelIcon name="mail" />
      <span>{`${USER} at ${DOMAIN.replace(".", " dot ")}`}</span>
    </button>
  );
}
