/**
 * Public HTTPS origin where the portal is deployed (magic links, App Links).
 * Must match Android intent-filter host and Supabase "Redirect URLs".
 */
export function getPortalPublicOrigin(): string {
  const raw = import.meta.env.VITE_PORTAL_URL as string | undefined;
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  return (trimmed || "https://my.pupchef.ae").replace(/\/$/, "");
}
