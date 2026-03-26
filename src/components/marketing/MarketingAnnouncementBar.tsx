import { MARKETING_ORIGIN } from "../../lib/marketingSite";

const QUIZ_URL = `${MARKETING_ORIGIN}/signup`;

export default function MarketingAnnouncementBar() {
  return (
    <>
      <div
        className="announcement-bar"
        style={{
          backgroundColor: "#173B33",
          fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
          fontWeight: 500,
          color: "#FFFFFF",
          textAlign: "center",
          padding: "10px 16px",
          fontSize: "14px",
          lineHeight: "1.4",
        }}
      >
        <span>You&apos;ve been gifted 50% off your first&nbsp;purchase!</span>
        <a
          href={QUIZ_URL}
          style={{
            color: "#F2674B",
            fontWeight: 800,
            textDecoration: "none",
            letterSpacing: "-0.3px",
            whiteSpace: "nowrap",
          }}
        >
          REDEEM NOW →
        </a>
      </div>
      <style>{`
        .announcement-bar {
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          align-items: center;
          justify-content: center;
          gap: 0.35em;
        }
        @media (max-width: 768px) {
          .announcement-bar {
            flex-direction: column;
            gap: 8px;
          }
          .announcement-bar span {
            display: block;
            width: 100%;
            max-width: 100%;
            padding: 0 4px;
            box-sizing: border-box;
          }
        }
      `}</style>
    </>
  );
}
