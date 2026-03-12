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
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center gap-4">
        <div className="text-3xl">❌</div>
        <h2 className="text-lg font-semibold text-gray-900">Login failed</h2>
        <p className="text-sm text-gray-500">{error}</p>
        <a href="/login" className="text-sm text-orange-500 font-medium hover:underline">Try again</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Signing you in…
    </div>
  );
}
