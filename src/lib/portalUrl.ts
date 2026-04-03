/**
 * Public HTTPS origin where the portal is deployed (magic links, App Links).
 * Must match Android intent-filter host and Supabase "Redirect URLs".
 */
export function getPortalPublicOrigin(): string {
  const raw = import.meta.env.VITE_PORTAL_URL as string | undefined;
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  return (trimmed || "https://my.pupchef.ae").replace(/\/$/, "");
}

/**
 * Where Supabase redirects after verifying the magic link (native app only).
 * Must NOT be the SPA route /auth/callback — that loads React, completes login
 * in Chrome, then shows "Open in app". This URL is a tiny static HTML file that
 * immediately redirects to pupchef:// with the same hash (tokens).
 * Add this exact URL to Supabase → Authentication → Redirect URLs.
 */
export function getNativeMagicLinkRedirectUrl(): string {
  const raw = import.meta.env.VITE_NATIVE_AUTH_REDIRECT as string | undefined;
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  if (trimmed) return trimmed;
  return `${getPortalPublicOrigin()}/auth/native-handoff.html`;
}
