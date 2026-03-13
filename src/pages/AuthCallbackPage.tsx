import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL ?? "https://pup-ops.vercel.app";

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) { setError("Invalid or missing login link."); return; }

    fetch(`${API_URL}/api/portal/auth/validate?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d: { session_token?: string; person?: { id: string; first_name: string | null; last_name: string | null; email: string }; error?: string }) => {
        if (d.session_token && d.person) {
          login(d.session_token, d.person);
          navigate("/account", { replace: true });
        } else {
          setError(d.error ?? "Login failed. The link may have expired.");
        }
      })
      .catch(() => setError("Network error. Please try again."));
  }, []);

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
