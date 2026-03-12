import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL ?? "https://pup-ops.vercel.app";

interface QuoteDog {
  dog_name: string; daily_kcal: number;
  full_per_day_display: string; discounted_monthly_price: number;
}
interface CheckoutPreview {
  person: { first_name: string | null; last_name: string | null; email: string };
  quote: { trial_total: number; recurring_total: number; trial_days: number; quote_dogs: QuoteDog[] };
  subscription_id: string;
  expires_at: string;
}

const EMIRATES = ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"];

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [loadError, setLoadError] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(true);

  const [address, setAddress] = useState({ address_line_1: "", address_line_2: "", city: "", emirate: "" });
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  useEffect(() => {
    if (!token) { setLoadError("Invalid or missing checkout link."); setLoadingPreview(false); return; }

    fetch(`${API_URL}/api/checkout/preview?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d: CheckoutPreview & { error?: string }) => {
        if (d.error) { setLoadError(d.error); return; }
        setPreview(d);
      })
      .catch(() => setLoadError("Failed to load checkout. Please try again."))
      .finally(() => setLoadingPreview(false));
  }, [token]);

  async function confirmOrder(e: React.FormEvent) {
    e.preventDefault();
    setConfirming(true);
    setConfirmError("");
    try {
      const res = await fetch(`${API_URL}/api/checkout/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...address }),
      });
      const d = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || !d.ok) { setConfirmError(d.error ?? "Failed to confirm order"); return; }
      setConfirmed(true);
    } catch {
      setConfirmError("Network error. Please try again.");
    } finally {
      setConfirming(false);
    }
  }

  if (loadingPreview) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>;

  if (loadError) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center gap-3">
      <div className="text-3xl">❌</div>
      <h2 className="text-lg font-semibold text-gray-900">Invalid checkout link</h2>
      <p className="text-sm text-gray-500">{loadError}</p>
    </div>
  );

  if (confirmed) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center gap-4">
      <div className="text-5xl">🎉</div>
      <h2 className="text-2xl font-bold text-gray-900">You're all set!</h2>
      <p className="text-sm text-gray-500 max-w-sm">
        Your PupChef subscription is confirmed. Your first delivery is on its way soon.
        Check your email for a login link to manage your account.
      </p>
    </div>
  );

  if (!preview) return null;

  const { person, quote } = preview;
  const fullName = [person.first_name, person.last_name].filter(Boolean).join(" ") || person.email;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-5">
        <div className="text-center">
          <div className="text-3xl mb-2">🐾</div>
          <h1 className="text-2xl font-bold text-gray-900">PupChef</h1>
          <p className="text-sm text-gray-500 mt-1">Confirm your order, {person.first_name ?? fullName}</p>
        </div>

        {/* Plan summary */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Your Plan</h2>
          <div className="space-y-2">
            {quote.quote_dogs.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-gray-900">{d.dog_name}</p>
                  <p className="text-xs text-gray-500">{d.daily_kcal} kcal/day · {d.full_per_day_display}</p>
                </div>
                <p className="font-semibold text-gray-900">AED {d.discounted_monthly_price.toFixed(0)}/mo</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">{quote.trial_days}-day trial</span>
              <span className="font-bold text-gray-900">AED {quote.trial_total.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Then monthly</span>
              <span>AED {quote.recurring_total.toFixed(0)}/mo</span>
            </div>
          </div>
        </div>

        {/* Delivery address */}
        <form onSubmit={confirmOrder} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Delivery Address</h2>
          <div>
            <label className="text-xs text-gray-600 font-medium">Address line 1 *</label>
            <input
              type="text" required
              value={address.address_line_1}
              onChange={(e) => setAddress((a) => ({ ...a, address_line_1: e.target.value }))}
              placeholder="Villa / Apt, building name"
              className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 font-medium">Address line 2</label>
            <input
              type="text"
              value={address.address_line_2}
              onChange={(e) => setAddress((a) => ({ ...a, address_line_2: e.target.value }))}
              placeholder="Street, community"
              className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 font-medium">City</label>
              <input
                type="text"
                value={address.city}
                onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 font-medium">Emirate *</label>
              <select
                required
                value={address.emirate}
                onChange={(e) => setAddress((a) => ({ ...a, emirate: e.target.value }))}
                className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="">Select…</option>
                {EMIRATES.map((em) => <option key={em} value={em}>{em}</option>)}
              </select>
            </div>
          </div>

          {confirmError && <p className="text-sm text-red-600">{confirmError}</p>}

          <button
            type="submit"
            disabled={confirming}
            className="w-full bg-orange-500 text-white rounded-2xl py-3 text-sm font-bold hover:bg-orange-600 disabled:opacity-50 transition"
          >
            {confirming ? "Confirming…" : `Confirm order · AED ${quote.trial_total.toFixed(0)}`}
          </button>
          <p className="text-xs text-gray-400 text-center">
            Trial payment collected by your sales representative. No card required online.
          </p>
        </form>
      </div>
    </div>
  );
}
