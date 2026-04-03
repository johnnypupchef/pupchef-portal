import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getPortalApiBaseUrl } from "../lib/apiBaseUrl";

const API_URL = getPortalApiBaseUrl();

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
const inputClass = "w-full border border-cream-dark rounded-xl px-4 py-3 text-sm text-brand bg-cream focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral transition font-body";

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

  if (loadingPreview) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-brand/40 font-body text-sm">Loading…</div>
    </div>
  );

  if (loadError) return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 text-center gap-4">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-2xl">❌</div>
      <h2 className="font-heading font-extrabold text-xl text-brand">Invalid checkout link</h2>
      <p className="text-sm text-brand/60 font-body">{loadError}</p>
    </div>
  );

  if (confirmed) return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 text-center gap-5">
      <div className="w-20 h-20 bg-forest/10 rounded-full flex items-center justify-center text-4xl">🎉</div>
      <div>
        <h2 className="font-heading font-black text-3xl text-brand mb-2">You're all set!</h2>
        <p className="text-sm text-brand/60 font-body max-w-sm leading-relaxed">
          Your PupChef subscription is confirmed. Your first delivery is on its way soon.
          Check your email for a login link to manage your account.
        </p>
      </div>
      <img src="/logo.png" alt="PupChef" className="h-8 w-auto mt-4" />
    </div>
  );

  if (!preview) return null;

  const { person, quote } = preview;

  return (
    <div className="min-h-screen bg-cream py-8 px-4">
      <div className="max-w-md mx-auto space-y-5">
        {/* Logo */}
        <div className="text-center mb-6">
          <img src="/logo.png" alt="PupChef" className="h-9 w-auto mx-auto mb-2" />
          <p className="text-sm text-brand/50 font-body">
            Hey {person.first_name ?? "there"}, confirm your order below
          </p>
        </div>

        {/* Plan summary */}
        <div className="bg-forest rounded-2xl p-5 text-white">
          <h2 className="font-heading font-bold text-white/80 text-sm uppercase tracking-wide mb-4">Your Plan</h2>
          <div className="space-y-3 mb-4">
            {quote.quote_dogs.map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-base">🐶</div>
                  <div>
                    <p className="font-body font-semibold text-sm">{d.dog_name}</p>
                    <p className="text-xs text-white/50 font-body">{d.daily_kcal} kcal · {d.full_per_day_display}</p>
                  </div>
                </div>
                <p className="font-heading font-bold">AED {d.discounted_monthly_price.toFixed(0)}<span className="text-xs font-body font-normal text-white/50">/mo</span></p>
              </div>
            ))}
          </div>
          <div className="border-t border-white/20 pt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-white/70 font-body">{quote.trial_days}-day trial</span>
              <span className="font-heading font-extrabold text-lg">AED {quote.trial_total.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-xs text-white/50 font-body">
              <span>Then monthly</span>
              <span>AED {quote.recurring_total.toFixed(0)}/mo</span>
            </div>
          </div>
        </div>

        {/* Address form */}
        <form onSubmit={confirmOrder} className="bg-white rounded-2xl border border-cream-dark shadow-sm p-5 space-y-4">
          <h2 className="font-heading font-bold text-brand">Delivery Address</h2>
          <div>
            <label className="text-xs text-brand/60 font-body font-medium block mb-1">Address line 1 *</label>
            <input type="text" required value={address.address_line_1} onChange={(e) => setAddress((a) => ({ ...a, address_line_1: e.target.value }))} placeholder="Villa / Apt, building name" className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-brand/60 font-body font-medium block mb-1">Address line 2</label>
            <input type="text" value={address.address_line_2} onChange={(e) => setAddress((a) => ({ ...a, address_line_2: e.target.value }))} placeholder="Street, community" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-brand/60 font-body font-medium block mb-1">City</label>
              <input type="text" value={address.city} onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-brand/60 font-body font-medium block mb-1">Emirate *</label>
              <select required value={address.emirate} onChange={(e) => setAddress((a) => ({ ...a, emirate: e.target.value }))} className={inputClass}>
                <option value="">Select…</option>
                {EMIRATES.map((em) => <option key={em} value={em}>{em}</option>)}
              </select>
            </div>
          </div>

          {confirmError && <p className="text-sm text-red-600 font-body">{confirmError}</p>}

          <button
            type="submit"
            disabled={confirming}
            className="w-full bg-coral text-white rounded-xl py-4 text-sm font-heading font-bold hover:bg-coral-dark disabled:opacity-50 transition-colors"
          >
            {confirming ? "Confirming…" : `Confirm order · AED ${quote.trial_total.toFixed(0)}`}
          </button>
          <p className="text-xs text-brand/40 text-center font-body leading-relaxed">
            Trial payment collected by your sales representative. No card required online.
          </p>
        </form>
      </div>
    </div>
  );
}
