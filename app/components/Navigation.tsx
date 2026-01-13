import { Link, useLocation } from "@remix-run/react";

export default function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="navigation">
      <div className="nav-content">
        <Link to="/" className="nav-logo-link">
          <img src="/croco.png" alt="Logo" className="nav-logo-img" />
        </Link>
        <div className="nav-links">
          <Link
            to="/"
            className={`nav-link ${isActive('/') && !location.pathname.startsWith('/blog') ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link
            to="/blog"
            className={`nav-link ${isActive('/blog') ? 'active' : ''}`}
          >
            Writing
          </Link>
        </div>
      </div>
    </nav>
  );
}
