import { useState } from "react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "../lib/supabase";

const API_URL = import.meta.env.VITE_API_URL ?? "https://pup-ops.vercel.app";

export default function LoginPage() {
  const [email, setEmail] = useState("");
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
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4">
      <div className="text-center mb-10">
        <img src="/logo.png" alt="PupChef" className="h-10 w-auto mx-auto mb-2" />
        <p className="text-sm text-brand/50 font-body">My Account</p>
      </div>

      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-sm border border-cream-dark p-8">
          {!sent ? (
            <>
              <h2 className="font-heading font-extrabold text-2xl text-brand mb-1">Welcome back</h2>
              <p className="text-sm text-brand/60 mb-6 font-body leading-relaxed">
                Enter your email and we&apos;ll send you a one-click login link from our secure sign-in
                provider. No password needed.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full border border-cream-dark rounded-xl px-4 py-3.5 text-sm text-brand bg-cream focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral transition font-body"
                />
                {error && <p className="text-sm text-red-600 font-body">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-coral text-white rounded-xl py-3.5 text-sm font-heading font-bold hover:bg-coral-dark disabled:opacity-50 transition-colors"
                >
                  {loading ? "Sending…" : "Email me a login link"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-forest/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">✉️</span>
              </div>
              <h2 className="font-heading font-extrabold text-xl text-brand">Check your email</h2>
              <p className="text-sm text-brand/60 font-body leading-relaxed">
                If an account exists for <strong className="text-brand">{email}</strong>, we sent a login
                link. Click it to sign in.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setError("");
                }}
                className="text-sm text-coral hover:text-coral-dark font-heading font-bold transition-colors"
              >
                Use a different email
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-brand/40 mt-6 font-body">
          Fresh food, tailored for your dog.
        </p>
      </div>
    </div>
  );
}
