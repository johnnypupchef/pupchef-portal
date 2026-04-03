import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "../lib/supabase";
import { setToken } from "../lib/api";
import { getPortalApiBaseUrl } from "../lib/apiBaseUrl";

const API_URL = getPortalApiBaseUrl();

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setError("Missing Supabase configuration.");
      return;
    }

    const supabase = getSupabaseBrowserClient();

    async function finish() {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash.includes("access_token")) {
        const params = new URLSearchParams(hash);
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        if (access_token && refresh_token) {
          const { error: e } = await supabase.auth.setSession({ access_token, refresh_token });
          if (e) {
            setError(e.message);
            return;
          }
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
        }
      }

      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        const pkceGuardKey = `pupchef_pkce_done_${code.slice(0, 48)}`;
        if (sessionStorage.getItem(pkceGuardKey) === "1") {
          window.history.replaceState(null, "", window.location.pathname);
        } else {
          const { error: ex } = await supabase.auth.exchangeCodeForSession(code);
          if (ex) {
            setError(ex.message);
            return;
          }
          sessionStorage.setItem(pkceGuardKey, "1");
          window.history.replaceState(null, "", window.location.pathname);
        }
      }

      const {
        data: { session },
        error: sessionErr,
      } = await supabase.auth.getSession();
      if (sessionErr || !session?.access_token) {
        setError(sessionErr?.message ?? "Invalid or expired login link.");
        return;
      }

      setToken(session.access_token);

      const meRes = await fetch(`${API_URL}/api/portal/me`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!meRes.ok) {
        setError("Could not load your account. Your email may not match a PupChef customer record.");
        await supabase.auth.signOut();
        return;
      }
      const me = (await meRes.json()) as {
        person: { id: string; email: string; first_name: string | null; last_name: string | null };
      };
      login(session.access_token, me.person);
      navigate("/account", { replace: true });
    }

    finish().catch(() => setError("Something went wrong. Please try again."));
  }, [login, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 text-center gap-5">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">❌</span>
        </div>
        <h2 className="font-heading font-extrabold text-xl text-brand">Login failed</h2>
        <p className="text-sm text-brand/60 font-body max-w-xs">{error}</p>
        <a
          href="/login"
          className="bg-coral text-white rounded-xl px-6 py-3 text-sm font-heading font-bold hover:bg-coral-dark transition-colors"
        >
          Try again
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4">
      <img src="/logo.png" alt="PupChef" className="h-8 w-auto mb-2" />
      <div className="w-8 h-8 border-3 border-coral border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-brand/50 font-body">Signing you in…</p>
    </div>
  );
}
