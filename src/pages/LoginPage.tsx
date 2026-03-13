import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "https://pup-ops.vercel.app";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devLink, setDevLink] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/portal/magic-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json() as { ok?: boolean; error?: string; dev_link?: string };
      if (!res.ok) { setError(data.error ?? "Failed to send link"); return; }
      setSent(true);
      if (data.dev_link) setDevLink(data.dev_link);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="text-center mb-10">
        <div className="inline-flex items-baseline gap-0.5">
          <span className="font-heading font-black text-3xl text-brand tracking-tight">PupChef</span>
          <span className="font-heading font-black text-3xl text-coral">.</span>
        </div>
        <p className="text-sm text-brand/50 mt-1 font-body">My Account</p>
      </div>

      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-sm border border-cream-dark p-8">
          {!sent ? (
            <>
              <h2 className="font-heading font-extrabold text-2xl text-brand mb-1">Welcome back</h2>
              <p className="text-sm text-brand/60 mb-6 font-body leading-relaxed">
                Enter your email and we'll send you a one-click login link. No password needed.
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
                {error && (
                  <p className="text-sm text-red-600 font-body">{error}</p>
                )}
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
                We sent a login link to <strong className="text-brand">{email}</strong>.
                Click the link to sign in. It expires in 1 hour.
              </p>
              <button
                onClick={() => { setSent(false); setDevLink(""); }}
                className="text-sm text-coral hover:text-coral-dark font-heading font-bold transition-colors"
              >
                Use a different email
              </button>

              {devLink && (
                <div className="mt-2 p-4 bg-forest/5 border border-forest/20 rounded-xl text-left">
                  <p className="text-xs font-heading font-bold text-forest mb-2">DEV MODE — Login link:</p>
                  <a
                    href={devLink}
                    className="text-xs text-coral underline break-all font-body leading-relaxed"
                  >
                    {devLink}
                  </a>
                </div>
              )}
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
