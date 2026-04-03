import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "../lib/supabase";
import { MARKETING_ORIGIN } from "../lib/marketingSite";
import { isNativeApp } from "../lib/platform";
import MarketingAnnouncementBar from "../components/marketing/MarketingAnnouncementBar";
import NativeLoginAnnouncementBar from "../components/marketing/NativeLoginAnnouncementBar";
import MarketingNavbar from "../components/marketing/MarketingNavbar";
import MarketingFooter from "../components/marketing/MarketingFooter";
import LoginSupportSection from "../components/marketing/LoginSupportSection";

import { getPortalApiBaseUrl } from "../lib/apiBaseUrl";

const SLIDE4_THUMB =
  "https://rkgrfzsmkymkfnsvewzo.supabase.co/storage/v1/object/public/label-assets/quiz/slide-4.jpg";

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
      className={`min-h-screen flex flex-col bg-white ${
        native && !sent ? "min-h-[100dvh] max-h-[100dvh]" : ""
      }`}
    >
      {native ? <NativeLoginAnnouncementBar /> : <MarketingAnnouncementBar />}
      <MarketingNavbar minimal={native} />

      <main
        className={`flex-1 flex flex-col items-center px-4 sm:px-6 w-full min-h-0 ${
          native && !sent ? "py-3 pt-4 pb-1" : "py-10 sm:py-16"
        }`}
      >
        <div className="w-full max-w-[400px] flex flex-col items-stretch min-h-0">
          {!sent ? (
            <>
              {native ? (
                <div
                  className="box-border px-4 sm:px-6 mb-1"
                  style={{
                    width: "100vw",
                    marginLeft: "calc(50% - 50vw)",
                  }}
                >
                  <div
                    className="grid w-full items-center gap-x-3"
                    style={{ gridTemplateColumns: "minmax(0,1fr) auto minmax(0,1fr)" }}
                  >
                    <div aria-hidden className="min-w-0" />
                    <h1
                      className="font-heading font-extrabold text-[2.25rem] sm:text-[2.5rem] leading-tight text-forest m-0 text-center self-center"
                      style={{
                        fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                        letterSpacing: "-2.3px",
                      }}
                    >
                      Welcome!
                    </h1>
                    <div className="flex justify-end items-center min-w-0 pt-2">
                      <img
                        src={SLIDE4_THUMB}
                        alt=""
                        width={96}
                        height={96}
                        className="object-cover shrink-0"
                        style={{ width: 88, height: 88, minWidth: 88, minHeight: 88 }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <h1
                  className="font-heading font-extrabold text-[2.25rem] sm:text-[2.5rem] leading-tight text-forest text-center mb-2"
                  style={{
                    fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                    letterSpacing: "-2.3px",
                  }}
                >
                  Welcome!
                </h1>
              )}
              <p
                className={`text-center text-login-muted text-[15px] font-body ${
                  native ? "mb-3" : "mb-8"
                }`}
                style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}
              >
                Please log in to continue
              </p>

              <form onSubmit={handleSubmit} className={`w-full ${native ? "space-y-3" : "space-y-4"}`}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  autoComplete="email"
                  className={`w-full rounded-md border border-gray-300 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest/15 focus:border-forest ${
                    native ? "py-3" : "py-3.5"
                  }`}
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
                  className={`w-full rounded-md bg-login-grey text-white text-sm font-bold disabled:opacity-50 hover:opacity-95 transition-opacity ${
                    native ? "py-3" : "py-3.5"
                  }`}
                  style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}
                >
                  {loading ? "Sending…" : "Log In"}
                </button>
              </form>

              <p
                className={`text-center text-xs text-gray-500 ${native ? "mt-2" : "mt-3"}`}
                style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}
              >
                We&apos;ll email you a one-click link — no password.
              </p>

              <div className={`border-t border-gray-200 w-full ${native ? "my-4" : "my-10"}`} />

              <h2
                className={`text-center text-forest font-bold text-base ${native ? "mb-2" : "mb-4"}`}
                style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}
              >
                New to Pupchef?
              </h2>
              <a
                href={SIGNUP_URL}
                className={`flex w-full items-center justify-center rounded-md border-2 border-coral bg-transparent text-sm font-bold text-coral hover:bg-coral/5 transition-colors ${
                  native ? "py-2.5" : "py-3.5"
                }`}
                style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}
              >
                Build Your Plan
              </a>
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

      {native ? <LoginSupportSection /> : <MarketingFooter />}
    </div>
  );
}
