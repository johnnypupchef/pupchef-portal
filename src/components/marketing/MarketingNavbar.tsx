import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MARKETING_ORIGIN } from "../../lib/marketingSite";

const QUIZ_URL = `${MARKETING_ORIGIN}/signup`;
const LOGO_URL =
  "https://rkgrfzsmkymkfnsvewzo.supabase.co/storage/v1/object/public/label-assets/website%20content/MAIN%20LOGO.png";

const NAV_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Our Recipes", href: "#recipes" },
  { label: "Why PupChef", href: "#why-pupchef" },
  { label: "Reviews", href: "#reviews" },
  { label: "FAQ", href: "#faq" },
];

/** Logo only — used on login (no menu, no Log In). */
function MarketingNavbarMinimal() {
  return (
    <nav
      style={{
        display: "block",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #f0ebe4",
        position: "sticky",
        top: 0,
        zIndex: 50,
        width: "100%",
      }}
    >
      <div
        style={{
          width: "100%",
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 72,
          boxSizing: "border-box",
        }}
      >
        <a href={`${MARKETING_ORIGIN}/`} style={{ display: "flex", alignItems: "center" }}>
          <img
            src={LOGO_URL}
            alt="PupChef"
            width={160}
            height={52}
            style={{ objectFit: "contain", height: "52px", width: "auto" }}
          />
        </a>
      </div>
    </nav>
  );
}

function HamburgerButton({ menuOpen, onClick }: { menuOpen: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className="mobile-hamburger"
      onClick={onClick}
      aria-label="Toggle menu"
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "6px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "24px",
          height: "2px",
          backgroundColor: "#173B33",
          marginBottom: "5px",
          transition: "transform 0.2s",
          transform: menuOpen ? "rotate(45deg) translateY(7px)" : "none",
        }}
      />
      <div
        style={{
          width: "24px",
          height: "2px",
          backgroundColor: "#173B33",
          marginBottom: "5px",
          opacity: menuOpen ? 0 : 1,
          transition: "opacity 0.2s",
        }}
      />
      <div
        style={{
          width: "24px",
          height: "2px",
          backgroundColor: "#173B33",
          transform: menuOpen ? "rotate(-45deg) translateY(-7px)" : "none",
          transition: "transform 0.2s",
        }}
      />
    </button>
  );
}

function MarketingNavbarFull() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showRedeem, setShowRedeem] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      const hero = document.getElementById("hero-section");
      if (!hero) {
        setShowRedeem(false);
        return;
      }
      const rect = hero.getBoundingClientRect();
      setShowRedeem(rect.bottom < 0);
    };
    checkScroll();
    window.addEventListener("scroll", checkScroll, { passive: true });
    return () => window.removeEventListener("scroll", checkScroll);
  }, []);

  useEffect(() => {
    const applyScrollLock = () => {
      if (menuOpen && window.innerWidth <= 1023) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    };
    applyScrollLock();
    const onResize = () => {
      if (window.innerWidth > 1023) setMenuOpen(false);
      applyScrollLock();
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const loginLinkStyle = {
    fontFamily: "var(--font-montserrat), Montserrat, sans-serif" as const,
    fontWeight: 700,
    fontSize: "15px",
    color: "#173B33",
    textDecoration: "none" as const,
    whiteSpace: "nowrap" as const,
  };

  return (
    <nav
      style={{
        display: "block",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #f0ebe4",
        position: "sticky",
        top: 0,
        zIndex: 50,
        width: "100%",
      }}
    >
      <div
        className="navbar-desktop-section"
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        <div
          className="navbar-desktop-inner"
          style={{
            width: "100%",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "72px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "48px",
              minWidth: 0,
            }}
          >
            {showRedeem ? (
              <a
                href={QUIZ_URL}
                className="navbar-cta"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  backgroundColor: "#F2674B",
                  color: "#FFFFFF",
                  fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                  fontWeight: 800,
                  fontSize: "14px",
                  letterSpacing: "-0.4px",
                  padding: "10px 18px",
                  borderRadius: "999px",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                  maxWidth: "min(200px, 36vw)",
                  boxSizing: "border-box",
                }}
              >
                Redeem 50% off
              </a>
            ) : (
              <a href={`${MARKETING_ORIGIN}/`} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                <img
                  src={LOGO_URL}
                  alt="PupChef"
                  width={160}
                  height={52}
                  style={{ objectFit: "contain", height: "52px", width: "auto" }}
                />
              </a>
            )}
            <div
              className="desktop-nav"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "32px",
                flexWrap: "wrap",
                minWidth: 0,
              }}
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={`${MARKETING_ORIGIN}${link.href}`}
                  style={{
                    fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                    fontWeight: 500,
                    fontSize: "15px",
                    color: "#173B33",
                    textDecoration: "none",
                    letterSpacing: "-0.2px",
                    transition: "color 0.15s",
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div
            className="navbar-actions"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexShrink: 0,
            }}
          >
            <Link to="/login" className="navbar-login" style={loginLinkStyle}>
              Log In
            </Link>
          </div>
        </div>
      </div>

      <div
        className="navbar-mobile-wrap"
        style={{
          display: "none",
          width: "100%",
          flexDirection: "column",
        }}
      >
        <div
          className="navbar-mobile-inner"
          style={{
            display: "none",
            width: "100%",
            padding: "0 16px",
            alignItems: "center",
            height: "66px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "52px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            {!menuOpen && <HamburgerButton menuOpen={false} onClick={() => setMenuOpen(true)} />}
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minWidth: 0,
              minHeight: "44px",
            }}
          >
            {showRedeem ? (
              <a
                href={QUIZ_URL}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#F2674B",
                  color: "#FFFFFF",
                  fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                  fontWeight: 800,
                  fontSize: "15px",
                  letterSpacing: "-0.4px",
                  padding: "12px 20px",
                  borderRadius: "999px",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                  maxWidth: "min(252px, 66vw)",
                  boxSizing: "border-box",
                  textAlign: "center",
                }}
              >
                Redeem 50% off
              </a>
            ) : (
              <a
                href={`${MARKETING_ORIGIN}/`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "opacity 0.2s",
                }}
              >
                <img
                  src={LOGO_URL}
                  alt="PupChef"
                  width={140}
                  height={46}
                  style={{
                    objectFit: "contain",
                    height: "46px",
                    width: "auto",
                    maxWidth: "min(200px, 50vw)",
                  }}
                />
              </a>
            )}
          </div>
          <div
            className="navbar-mobile-login-slot"
            style={{
              minWidth: "64px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            {!menuOpen && (
              <Link to="/login" style={{ ...loginLinkStyle, fontSize: "14px" }}>
                Log In
              </Link>
            )}
          </div>
        </div>
      </div>

      {menuOpen && (
        <div
          className="navbar-mobile-fullscreen"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "column",
            paddingBottom: "env(safe-area-inset-bottom, 0)",
          }}
        >
          <div
            style={{
              flexShrink: 0,
              height: "66px",
              padding: "0 8px 0 16px",
              display: "flex",
              alignItems: "center",
              borderBottom: "1px solid #f0ebe4",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "44px",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                style={{
                  width: "44px",
                  height: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  color: "#173B33",
                }}
              >
                <span
                  style={{
                    fontSize: "28px",
                    lineHeight: 1,
                    fontWeight: 300,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  ×
                </span>
              </button>
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 0,
              }}
            >
              <a
                href={`${MARKETING_ORIGIN}/`}
                onClick={() => setMenuOpen(false)}
                style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <img
                  src={LOGO_URL}
                  alt="PupChef"
                  width={140}
                  height={46}
                  style={{
                    objectFit: "contain",
                    height: "46px",
                    width: "auto",
                    maxWidth: "min(200px, 50vw)",
                  }}
                />
              </a>
            </div>
            <div style={{ width: "44px", flexShrink: 0 }} aria-hidden />
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              padding: "8px 24px 24px",
            }}
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={`${MARKETING_ORIGIN}${link.href}`}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "block",
                  fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                  fontWeight: 500,
                  fontSize: "18px",
                  color: "#173B33",
                  textDecoration: "none",
                  padding: "16px 0",
                  borderBottom: "1px solid #f0ebe4",
                }}
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block",
                fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                fontWeight: 700,
                fontSize: "18px",
                color: "#173B33",
                textDecoration: "none",
                padding: "16px 0",
              }}
            >
              Log In
            </Link>
          </div>

          <div
            style={{
              flexShrink: 0,
              padding: "16px",
              paddingBottom: "max(16px, env(safe-area-inset-bottom, 16px))",
              borderTop: "1px solid #f0ebe4",
              backgroundColor: "#ffffff",
            }}
          >
            <a
              href={QUIZ_URL}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block",
                width: "100%",
                boxSizing: "border-box",
                backgroundColor: "#F2674B",
                color: "#FFFFFF",
                fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                fontWeight: 800,
                fontSize: "16px",
                letterSpacing: "-0.4px",
                textDecoration: "none",
                textAlign: "center",
                padding: "14px 22px",
                borderRadius: "999px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
              }}
            >
              Redeem 50% off
            </a>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1023px) {
          .navbar-desktop-section { display: none !important; }
          .navbar-mobile-wrap {
            display: flex !important;
            width: 100%;
            flex-direction: column !important;
            align-items: stretch;
          }
          .navbar-mobile-inner {
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: nowrap !important;
            width: 100%;
            min-width: 0;
          }
        }
        @media (min-width: 1024px) {
          .navbar-mobile-wrap { display: none !important; }
          .navbar-mobile-fullscreen { display: none !important; }
        }
      `}</style>
    </nav>
  );
}

export default function MarketingNavbar({ minimal = false }: { minimal?: boolean }) {
  if (minimal) return <MarketingNavbarMinimal />;
  return <MarketingNavbarFull />;
}
