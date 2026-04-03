/**
 * Top bar copy for the Capacitor app login only (web keeps MarketingAnnouncementBar).
 */
export default function NativeLoginAnnouncementBar() {
  return (
    <div
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
      Our food is made with ❤️ and delivered fresh across the UAE.
    </div>
  );
}
