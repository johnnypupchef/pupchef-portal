import { MARKETING_ORIGIN } from "../../lib/marketingSite";

const GREEN = "#173B33";
const ORANGE = "#F2674B";

const SITE_MAP_LINKS = [
  { label: "Reviews", href: `${MARKETING_ORIGIN}/#reviews` },
  { label: "About Us", href: `${MARKETING_ORIGIN}/#about` },
  { label: "FAQ", href: `${MARKETING_ORIGIN}/#faq` },
  { label: "Log In", href: "/login" },
  { label: "Sign Up", href: `${MARKETING_ORIGIN}/signup` },
  { label: "Our Recipes", href: `${MARKETING_ORIGIN}/#recipes` },
  { label: "Why PupChef", href: `${MARKETING_ORIGIN}/#why-pupchef` },
  { label: "Careers", href: `${MARKETING_ORIGIN}/#careers` },
];
const LEGAL_LINKS = [
  { label: "Privacy", href: `${MARKETING_ORIGIN}/privacy` },
  { label: "Terms", href: `${MARKETING_ORIGIN}/terms` },
  { label: "Accessibility", href: `${MARKETING_ORIGIN}/#accessibility` },
  { label: "Do Not Sell My Personal Information", href: `${MARKETING_ORIGIN}/#donotsell` },
];

export default function MarketingFooter() {
  return (
    <footer
      className="site-footer"
      style={{
        backgroundColor: GREEN,
        color: "#ffffff",
        padding: "48px 24px 24px",
        fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
      }}
    >
      <div className="footer-inner" style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          className="footer-columns"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "40px 32px",
            marginBottom: 40,
          }}
        >
          <div className="footer-site-map">
            <h3 style={{ fontWeight: 700, fontSize: 15, margin: "0 0 16px", letterSpacing: "0.02em" }}>
              Site Map
            </h3>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {SITE_MAP_LINKS.map(({ label, href }) => (
                <li key={label} style={{ marginBottom: 10 }}>
                  <a href={href} style={{ color: "#ffffff", textDecoration: "none", fontSize: 14 }}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: 15, margin: "0 0 4px", letterSpacing: "0.02em" }}>
              Get Support
            </h3>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", fontStyle: "italic" }}>
              Available 24/7
            </span>
            <p style={{ margin: "12px 0 0", fontSize: 14 }}>
              <a href="mailto:help@pupchef.ae" style={{ color: "#ffffff", textDecoration: "none" }}>
                help@pupchef.ae
              </a>
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 14 }}>(+971) 50 123 4567 — Call or Text</p>
            <h3 style={{ fontWeight: 700, fontSize: 15, margin: "24px 0 12px", letterSpacing: "0.02em" }}>
              Connect
            </h3>
            <p style={{ margin: "0 0 8px", fontSize: 14 }}>
              <a href={`${MARKETING_ORIGIN}/#media`} style={{ color: "#ffffff", textDecoration: "none" }}>
                Media Inquiries
              </a>
            </p>
            <p style={{ margin: "0 0 12px", fontSize: 14 }}>
              <a href={`${MARKETING_ORIGIN}/#partnerships`} style={{ color: "#ffffff", textDecoration: "none" }}>
                Partnership Inquiries
              </a>
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <a
                href="https://instagram.com/pupchef"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                style={{ color: "#ffffff" }}
              >
                <InstagramIcon />
              </a>
              <a
                href="https://facebook.com/pupchef"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                style={{ color: "#ffffff" }}
              >
                <FacebookIcon />
              </a>
              <a
                href="https://tiktok.com/@pupchef"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                style={{ color: "#ffffff" }}
              >
                <TikTokIcon />
              </a>
            </div>
          </div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: 15, margin: "0 0 16px", letterSpacing: "0.02em" }}>
              Free Health and Nutrition Tips
            </h3>
            <form className="footer-newsletter" onSubmit={(e) => e.preventDefault()} style={{ display: "flex", gap: 8, maxWidth: 320 }}>
              <input
                type="email"
                placeholder="Email"
                aria-label="Email for newsletter"
                style={{
                  flex: 1,
                  padding: "12px 14px",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  minWidth: 0,
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "12px 20px",
                  backgroundColor: "#666666",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Submit
              </button>
            </form>
          </div>
        </div>

        <p
          className="footer-tagline"
          style={{
            textAlign: "center",
            fontSize: 14,
            color: "rgba(255,255,255,0.95)",
            margin: "0 0 24px",
            lineHeight: 1.5,
          }}
        >
          Our food is made with ❤️ and delivered fresh across the UAE.
        </p>

        <div className="footer-divider" style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 24 }}>
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.5)" }} aria-hidden />
          ))}
        </div>

        <div
          className="footer-bottom"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            fontSize: 13,
            color: "rgba(255,255,255,0.9)",
          }}
        >
          <span>© 2026 PupChef. Long Live Dogs™</span>
          <div className="footer-legal-links" style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px" }}>
            {LEGAL_LINKS.map(({ label, href }) => (
              <a key={label} href={href} style={{ color: "rgba(255,255,255,0.9)", textDecoration: "none" }}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .site-footer a:hover {
          text-decoration: underline;
        }
        @media (max-width: 768px) {
          .footer-columns {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
            text-align: left;
          }
          .footer-site-map {
            display: none !important;
          }
          .footer-newsletter input[type="email"] {
            background-color: #ffffff !important;
            color: #173b33;
          }
          .footer-newsletter input[type="email"]::placeholder {
            color: rgba(23, 59, 51, 0.45);
          }
          .footer-newsletter button[type="submit"] {
            background-color: ${ORANGE} !important;
            color: #ffffff !important;
          }
          .footer-tagline {
            text-align: center;
          }
          .footer-bottom {
            flex-direction: column;
            text-align: center;
            align-items: center;
          }
          .footer-legal-links {
            justify-content: center;
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
function TikTokIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}
