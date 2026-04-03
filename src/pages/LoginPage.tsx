import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "../lib/supabase";
import { isNativeApp } from "../lib/nativeApp";
import { MARKETING_ORIGIN } from "../lib/marketingSite";
import MarketingAnnouncementBar from "../components/marketing/MarketingAnnouncementBar";
import MarketingNavbar from "../components/marketing/MarketingNavbar";
import MarketingFooter from "../components/marketing/MarketingFooter";

const API_URL = import.meta.env.VITE_API_URL ?? "https://pup-ops.vercel.app";
const SIGNUP_URL = `${MARKETING_ORIGIN}/signup`;

const native = isNativeApp();

export default function LoginPage() {
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
      setError("Portal is missing Supabase configuration (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).");
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

      const origin = window.location.origin.trim();
      const redirectTo = `${origin}/auth/callback`;
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

  return (
    <div
      className={
        native
          ? "min-h-screen flex flex-col bg-gradient-to-b from-cream via-cream-dark/30 to-white"
          : "min-h-screen flex flex-col bg-white"
      }
    >
      {!native && (
        <>
          <MarketingAnnouncementBar />
          <MarketingNavbar />
        </>
      )}

      <main
        className={
          native
            ? "flex-1 flex flex-col items-center justify-center w-full px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]"
            : "flex-1 flex flex-col items-center px-4 sm:px-6 py-10 sm:py-16 w-full"
        }
      >
        {native && (
          <div className="w-full max-w-[400px] mb-8 text-center">
            <p
              className="font-display text-[1.75rem] text-forest tracking-tight"
              style={{ fontFamily: "var(--font-alike), Alike, Georgia, serif" }}
            >
              PupChef
            </p>
            <p className="text-xs font-semibold uppercase tracking-widest text-login-muted mt-1">My Account</p>
          </div>
        )}

        <div
          className={
            native
              ? "w-full max-w-[400px] flex flex-col items-stretch rounded-2xl bg-white/90 shadow-xl shadow-forest/5 border border-cream-dark/50 px-6 py-8 sm:px-8 sm:py-10"
              : "w-full max-w-[400px] flex flex-col items-stretch"
          }
        >
          {!sent ? (
            <>
              <h1
                className={
                  native
                    ? "font-heading font-extrabold text-2xl leading-tight text-forest text-center mb-2"
                    : "font-heading font-extrabold text-[2.25rem] sm:text-[2.5rem] leading-tight text-forest text-center mb-2"
                }
                style={{
                  fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                  letterSpacing: native ? "-1px" : "-2.3px",
                }}
              >
                {native ? "Sign in" : "Welcome!"}
              </h1>
              <p
                className={
                  native
                    ? "text-center text-login-muted text-sm mb-8 font-body"
                    : "text-center text-login-muted text-[15px] mb-8 font-body"
                }
                style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}
              >
                {native ? "We’ll email you a magic link — no password." : "Please log in to continue"}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  autoComplete="email"
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest/15 focus:border-forest"
                  style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}
                />
                {error && (
                  <p className="text-sm text-red-600" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-md bg-login-grey text-white py-3.5 text-sm font-bold disabled:opacity-50 hover:opacity-95 transition-opacity"
                  style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}
                >
                  {loading ? "Sending…" : "Log In"}
                </button>
              </form>

              {!native && (
                <p
                  className="text-center text-xs text-gray-500 mt-3"
                  style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}
                >
                  We&apos;ll email you a one-click link — no password.
                </p>
              )}

              {!native && (
                <>
                  <div className="border-t border-gray-200 my-10 w-full" />

                  <h2
                    className="text-center text-forest font-bold text-base mb-4"
                    style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}
                  >
                    New to Pupchef?
                  </h2>
                  <a
                    href={SIGNUP_URL}
                    className="flex w-full items-center justify-center rounded-md border-2 border-coral bg-transparent py-3.5 text-sm font-bold text-coral hover:bg-coral/5 transition-colors"
                    style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}
                  >
                    Build Your Plan
                  </a>
                </>
              )}

              {native && (
                <p className="text-center text-[11px] text-gray-400 mt-6 leading-relaxed" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
                  New to PupChef?{" "}
                  <a href={SIGNUP_URL} className="font-bold text-coral hover:text-coral-dark underline-offset-2">
                    Start on the web
                  </a>
                </p>
              )}
            </>
          ) : (
            <div className="text-center space-y-5 w-full">
              <div className="w-14 h-14 bg-forest/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl" aria-hidden>
                  ✉️
                </span>
              </div>
              <h1
                className="font-heading font-extrabold text-2xl text-forest"
                style={{
                  fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                  letterSpacing: "-1px",
                }}
              >
                Check your email
              </h1>
              <p
                className="text-sm text-login-muted leading-relaxed"
                style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}
              >
                If an account exists for <strong className="text-forest">{email}</strong>, we sent a login link. Click
                it to sign in.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setError("");
                }}
                className="text-sm font-bold text-coral hover:text-coral-dark transition-colors"
                style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}
              >
                Use a different email
              </button>
            </div>
          )}
        </div>
      </main>

      {!native && <MarketingFooter />}
    </div>
  );
}
