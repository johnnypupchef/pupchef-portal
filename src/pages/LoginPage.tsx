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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🐾</div>
          <h1 className="text-2xl font-bold text-gray-900">PupChef</h1>
          <p className="text-gray-500 text-sm mt-1">Customer Portal</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          {!sent ? (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Sign in</h2>
              <p className="text-sm text-gray-500 mb-5">
                Enter your email and we'll send you a one-click login link. No password needed.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-500 text-white rounded-xl py-3 text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition"
                >
                  {loading ? "Sending…" : "Email me a login link"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-3">
              <div className="text-3xl">✉️</div>
              <h2 className="text-lg font-semibold text-gray-900">Check your email</h2>
              <p className="text-sm text-gray-500">
                We sent a login link to <strong>{email}</strong>. Click the link to sign in.
                It expires in 1 hour.
              </p>
              <button
                onClick={() => { setSent(false); setDevLink(""); }}
                className="text-sm text-orange-500 hover:text-orange-600 font-medium"
              >
                Use a different email
              </button>

              {/* Dev mode: show link directly */}
              {devLink && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-left">
                  <p className="text-xs font-semibold text-yellow-700 mb-1">DEV MODE — Login link:</p>
                  <a
                    href={devLink}
                    className="text-xs text-blue-600 underline break-all"
                  >
                    {devLink}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
