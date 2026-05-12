import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Check } from "lucide-react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "../lib/supabase";
import { MARKETING_ORIGIN } from "../lib/marketingSite";
import { isNativeApp } from "../lib/platform";
import MarketingAnnouncementBar from "../components/marketing/MarketingAnnouncementBar";
import NativeLoginAnnouncementBar from "../components/marketing/NativeLoginAnnouncementBar";
import MarketingNavbar from "../components/marketing/MarketingNavbar";
import MarketingFooter from "../components/marketing/MarketingFooter";
import LoginSupportSection from "../components/marketing/LoginSupportSection";

import { getPortalApiBaseUrl } from "../lib/apiBaseUrl";
import { getNativeMagicLinkRedirectUrl } from "../lib/portalUrl";

const API_URL = getPortalApiBaseUrl();
const SIGNUP_URL = `${MARKETING_ORIGIN}/signup`;

export default function LoginPage() {
  const native = isNativeApp();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const q = searchParams.get("email");
    if (q && q.trim()) setEmail(q.trim());
  }, [searchParams]);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    if (!isSupabaseConfigured()) {
      setError(
        "Portal is missing Supabase configuration (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).",
      );
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/portal/magic-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        proceed?: boolean;
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Failed to send link");
        return;
      }
      if (!data.proceed) {
        setSent(true);
        return;
      }

      const redirectTo = native
        ? getNativeMagicLinkRedirectUrl()
        : `${window.location.origin.trim()}/auth/callback`;
      const supabase = getSupabaseBrowserClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: false,
        },
      });
      if (otpError) {
        setError(otpError.message);
        return;
      }
      setSent(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const formCard = !sent ? (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ textAlign: "center" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: 44,
            letterSpacing: "-0.025em",
            color: "var(--forest)",
            margin: 0,
            lineHeight: 0.95,
          }}
        >
          Welcome back.
        </h1>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontStyle: "italic",
            fontSize: 22,
            color: "var(--orange)",
            margin: "8px 0 0",
            letterSpacing: "-0.02em",
          }}
        >
          The pack's waiting.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <label
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--ink-muted)",
            paddingLeft: 16,
          }}
        >
          Email address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          required
          autoComplete="email"
          autoFocus
          style={{
            padding: "14px 16px",
            borderRadius: 12,
            border: "1.5px solid var(--line)",
            background: "#fff",
            fontSize: 15,
            color: "var(--ink)",
            outline: "none",
          }}
        />
        {error && (
          <p style={{ fontSize: 13, color: "var(--terracotta)", margin: 0 }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ marginTop: 4 }}
        >
          {loading ? "Sending…" : "Send magic link"}
        </button>
        <p
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "var(--ink-muted)",
            margin: 0,
          }}
        >
          We'll email you a one-click link — no password needed.
        </p>
      </form>

      <div
        style={{ height: 1, background: "var(--line)", margin: "8px 0" }}
      />

      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontSize: 13,
            color: "var(--forest)",
            fontWeight: 700,
            margin: "0 0 12px",
          }}
        >
          New to PupChef?
        </p>
        <a
          href={SIGNUP_URL}
          className="btn btn-ghost"
          style={{
            width: "100%",
            borderColor: "var(--orange)",
            color: "var(--orange)",
            textDecoration: "none",
          }}
        >
          Build your plan
        </a>
      </div>
    </div>
  ) : (
    <div
      style={{
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "rgba(143,166,138,0.16)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto",
          color: "var(--sage)",
        }}
      >
        <Check size={28} strokeWidth={2.5} />
      </div>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 400,
          fontSize: 32,
          letterSpacing: "-0.025em",
          color: "var(--forest)",
          margin: 0,
        }}
      >
        Check your email
      </h1>
      <p
        style={{
          fontSize: 14,
          color: "var(--ink-muted)",
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        We sent a login link to
        <br />
        <strong style={{ color: "var(--forest)" }}>{email}</strong>
      </p>
      <button
        type="button"
        onClick={() => {
          setSent(false);
          setError("");
        }}
        style={{
          background: "transparent",
          border: "none",
          color: "var(--orange-dark)",
          fontWeight: 700,
          fontSize: 13,
          cursor: "pointer",
          marginTop: 4,
        }}
      >
        Use a different email
      </button>
    </div>
  );

  // ── Native (Capacitor): clean centered prototype layout, no marketing chrome
  if (native) {
    return (
      <div className="min-h-screen cream-paper flex flex-col">
        <NativeLoginAnnouncementBar />
        <main
          className="flex-1 flex flex-col items-stretch px-6 pb-8 pt-6"
          style={{ minHeight: 0 }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginTop: 8, marginBottom: 56 }}>
            <img
              src="/logo.png"
              alt="PupChef"
              style={{ height: 48, width: "auto" }}
            />
          </div>
          <div className="w-full max-w-[400px] mx-auto">{formCard}</div>
        </main>
      </div>
    );
  }

  // ── Web browser: keep marketing chrome, render redesigned form in the middle
  return (
    <div className="min-h-screen flex flex-col cream-paper">
      <MarketingAnnouncementBar />
      <MarketingNavbar />
      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 w-full py-10 sm:py-16">
        <div className="w-full max-w-[400px]">{formCard}</div>
      </main>
      <MarketingFooter />
      <div className="hidden">
        <LoginSupportSection />
      </div>
    </div>
  );
}
