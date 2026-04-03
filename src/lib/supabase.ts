import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let browserClient: SupabaseClient | null = null;

/**
 * Single browser client so auth URL params aren't processed twice (e.g. React Strict Mode
 * remounts + detectSessionInUrl would otherwise race and burn the one-time PKCE code).
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (!url || !anon) {
    throw new Error("VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set");
  }
  if (!browserClient) {
    browserClient = createClient(url, anon, {
      auth: {
        // We handle /auth/callback explicitly in AuthCallbackPage (hash + PKCE code).
        detectSessionInUrl: false,
        /** Refresh tokens persist in WebView localStorage — session survives restarts until app uninstall/clear data. */
        persistSession: true,
        autoRefreshToken: true,
        storage: typeof window !== "undefined" ? window.localStorage : undefined,
      },
    });
  }
  return browserClient;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anon);
}
