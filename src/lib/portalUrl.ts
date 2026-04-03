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
 * Native magic-link redirect. Must be a custom scheme (not https) so that after
 * Supabase verifies in the browser, the redirect is handled by the OS and opens
 * the app. If we used https://my.pupchef.ae/auth/callback, Chrome would keep
 * the session in the browser tab instead of handing off to the app.
 * Add this exact URL to Supabase → Authentication → Redirect URLs.
 */
export function getNativeMagicLinkRedirectUrl(): string {
  const raw = import.meta.env.VITE_NATIVE_AUTH_REDIRECT as string | undefined;
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  return trimmed || "pupchef://auth/callback";
}
