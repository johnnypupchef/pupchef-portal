import { Capacitor } from "@capacitor/core";

const DEFAULT_PORTAL_API = "https://pup-ops.vercel.app";

/**
 * Base URL for PupOps `/api/portal/*` calls.
 * - Treats empty `VITE_API_URL` as unset (Vite `??` does not replace "").
 * - On **native**, `localhost` / `127.0.0.1` would hit the emulator/device, not your dev PC — fall back to production.
 */
export function getPortalApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL as string | undefined;
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  let base = trimmed || DEFAULT_PORTAL_API;

  if (Capacitor.isNativePlatform()) {
    try {
      const u = new URL(base);
      if (u.hostname === "localhost" || u.hostname === "127.0.0.1") {
        return DEFAULT_PORTAL_API;
      }
    } catch {
      return DEFAULT_PORTAL_API;
    }
  }

  return base.replace(/\/$/, "");
}
