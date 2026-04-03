import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { App } from "@capacitor/app";
import { isNativeApp } from "../lib/platform";

function handleAuthCallbackUrl(url: string, navigate: ReturnType<typeof useNavigate>): void {
  try {
    const u = new URL(url);
    if (!u.pathname.includes("/auth/callback")) return;
    navigate(`/auth/callback${u.search}${u.hash}`, { replace: true });
  } catch {
    /* ignore */
  }
}

/**
 * When the app opens from an Android App Link / Universal Link (magic link in email),
 * route into /auth/callback with the same hash/query Supabase appended.
 */
export default function AppDeepLinks() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isNativeApp()) return;

    let remove: (() => void) | undefined;

    const run = async () => {
      try {
        const launch = await App.getLaunchUrl();
        if (launch?.url) handleAuthCallbackUrl(launch.url, navigate);
      } catch {
        /* ignore */
      }

      const sub = await App.addListener("appUrlOpen", ({ url }) => {
        handleAuthCallbackUrl(url, navigate);
      });
      remove = () => sub.remove();
    };

    void run();

    return () => {
      remove?.();
    };
  }, [navigate]);

  return null;
}
