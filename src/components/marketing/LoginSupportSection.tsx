const SUPPORT_ILLUSTRATION =
  "https://rkgrfzsmkymkfnsvewzo.supabase.co/storage/v1/object/public/label-assets/quiz/Gemini_Generated_Image_v8khi0v8khi0v8kh.png";
const WHATSAPP_HREF = "https://wa.me/971543573313";

/** Native app login footer: support illustration + WhatsApp (no portion-details CTA). */
export default function LoginSupportSection() {
  return (
    <section
      className="login-support-section"
      style={{
        width: "100%",
        marginTop: "auto",
        padding: "32px 20px 40px",
        boxSizing: "border-box",
        fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
      }}
    >
      <div style={{ maxWidth: 400, margin: "0 auto", textAlign: "center" }}>
        <div style={{ textAlign: "center" }}>
          <img
            src={SUPPORT_ILLUSTRATION}
            alt=""
            width={180}
            height={120}
            style={{ width: 180, height: "auto", display: "block", margin: "0 auto 14px" }}
          />
          <p
            style={{
              fontWeight: 700,
              fontSize: 16,
              lineHeight: 1.35,
              color: "#333",
              textAlign: "center",
              margin: 0,
            }}
          >
            Have questions? Call or WhatsApp us at
          </p>
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              marginTop: 4,
              color: "#E85A3A",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: "-0.02em",
            }}
          >
            054 357 3313
          </a>
        </div>
      </div>
    </section>
  );
}
