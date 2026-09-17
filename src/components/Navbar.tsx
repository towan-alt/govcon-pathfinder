import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logoTi from "@/assets/logo-ti.png";
import { BRAND } from "@/lib/brand";
import { trackCta } from "@/lib/track";

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/#services" },
  { label: "Results", href: "/#results" },
  { label: "NAICS Finder", href: "/naics" },
  { label: "Free Kit", href: "/kit" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (e: React.MouseEvent, href: string) => {
    setMobileOpen(false);
    if (!href.includes("#")) return; // let <Link> handle plain routes

    e.preventDefault();
    const hash = href.slice(href.indexOf("#"));
    if (location.pathname === "/") {
      document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(`/${hash}`);
    }
  };

  const linkClass = (mobile: boolean) =>
    mobile
      ? "block text-sm font-semibold uppercase tracking-wider text-foreground/80 hover:text-primary py-2"
      : `text-xs font-semibold uppercase tracking-wider transition-colors hover:text-primary ${
          scrolled ? "text-foreground/75" : "text-white/80"
        }`;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-card/95 backdrop-blur-md shadow-sm border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
          <img src={logoTi} alt={`${BRAND.platform} logo`} className="h-14 w-14 rounded-lg" />
          <span className="leading-tight">
            <span
              className={`block font-display text-xl font-bold tracking-tight transition-colors ${
                scrolled ? "text-foreground" : "text-white"
              }`}
            >
              {BRAND.platform}
            </span>
            <span
              className={`block text-[10px] font-semibold uppercase tracking-[0.18em] ${
                scrolled ? "text-muted-foreground" : "text-white/60"
              }`}
            >
              Led by {BRAND.founder}
            </span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={(e) => go(e, link.href)}
              className={linkClass(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/assessment"
            onClick={() => trackCta("nav-assessment")}
            className="btn-gold text-xs px-6 py-3 rounded-md"
          >
            Free Assessment
          </Link>
          <Link
            to="/book"
            onClick={() => trackCta("nav-book")}
            className={`text-xs font-semibold uppercase tracking-wider transition-colors hover:text-primary ${
              scrolled ? "text-foreground/75" : "text-white/80"
            }`}
          >
            Book a Call
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`md:hidden p-2 min-h-11 min-w-11 ${scrolled ? "text-foreground" : "text-white"}`}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-card/95 backdrop-blur-md border-b border-border px-6 pb-6 pt-2 space-y-2">
          {navLinks.map((link) => (
            <Link key={link.href} to={link.href} onClick={(e) => go(e, link.href)} className={linkClass(true)}>
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-3 pt-3">
            <Link
              to="/assessment"
              onClick={() => {
                trackCta("nav-mobile-assessment");
                setMobileOpen(false);
              }}
              className="btn-gold text-sm px-6 py-3 rounded-md text-center"
            >
              Free Assessment
            </Link>
            <Link
              to="/book"
              onClick={() => {
                trackCta("nav-mobile-book");
                setMobileOpen(false);
              }}
              className="text-sm font-semibold uppercase tracking-wider text-foreground/80 hover:text-primary text-center py-2"
            >
              Book a Call
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
