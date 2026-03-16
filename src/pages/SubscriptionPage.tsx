import { useEffect, useState } from "react";
import { api } from "../lib/api";

interface SubDog { dog_name: string; daily_kcal: number; discounted_monthly_price: string; household_discount_rate: number; dog_index: number }
interface Subscription {
  id: string; status: string; selling_price_total: string; trial_price: string | null;
  trial_ends_at: string | null; created_at: string;
  dogs: SubDog[];
}

const STATUS_COLORS: Record<string, string> = {
  trial: "bg-blue-100 text-blue-700",
  active: "bg-forest/10 text-forest",
  paused: "bg-amber-100 text-amber-700",
  past_due: "bg-red-100 text-red-700",
  cancelled: "bg-brand/10 text-brand/50",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AE", { day: "numeric", month: "long", year: "numeric" });
}

export default function SubscriptionPage() {
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  async function load() {
    const d = await api.get<{ subscription: Subscription | null }>("/api/portal/subscription");
    setSub(d.subscription);
  }

  useEffect(() => {
    load().catch((e: Error) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  async function pause() {
    if (!confirm("Pause your subscription? Deliveries will stop until you resume.")) return;
    setActionLoading(true);
    try {
      await api.post("/api/portal/subscription/pause");
      await load();
      setActionMsg("Subscription paused.");
    } catch (e: unknown) {
      setActionMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function resume() {
    setActionLoading(true);
    try {
      await api.post("/api/portal/subscription/resume");
      await load();
      setActionMsg("Subscription resumed! 🎉");
    } catch (e: unknown) {
      setActionMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <div className="text-center py-16 text-brand/40 font-body">Loading…</div>;
  if (error) return <div className="text-center py-16 text-red-500 font-body">{error}</div>;

  if (!sub) return (
    <div className="space-y-5">
      <h1 className="font-heading font-extrabold text-2xl text-brand">My Plan</h1>
      <div className="bg-white rounded-2xl border border-cream-dark p-8 text-center">
        <div className="text-4xl mb-3">🔄</div>
        <p className="font-body text-brand/50 text-sm">No active subscription found.</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <h1 className="font-heading font-extrabold text-2xl text-brand">My Plan</h1>

      {actionMsg && (
        <div className="bg-forest/10 border border-forest/20 rounded-xl p-3 text-sm text-forest font-body font-medium">
          {actionMsg}
        </div>
      )}

      {/* Hero price card */}
      <div className="bg-forest rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white/60 text-xs font-body uppercase tracking-wide mb-1">Monthly price</p>
            <p className="font-heading font-black text-4xl">AED {Number(sub.selling_price_total).toFixed(0)}</p>
          </div>
          <span className={`text-xs font-heading font-bold px-3 py-1.5 rounded-full ${STATUS_COLORS[sub.status] ?? "bg-white/10 text-white"}`}>
            {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {sub.trial_price && (
            <div>
              <p className="text-white/50 text-xs font-body mb-0.5">Trial price</p>
              <p className="font-body font-semibold">AED {Number(sub.trial_price).toFixed(0)}</p>
            </div>
          )}
          {sub.trial_ends_at && (
            <div>
              <p className="text-white/50 text-xs font-body mb-0.5">Trial ends</p>
              <p className="font-body font-semibold">{formatDate(sub.trial_ends_at)}</p>
            </div>
          )}
          <div>
            <p className="text-white/50 text-xs font-body mb-0.5">Started</p>
            <p className="font-body font-semibold">{formatDate(sub.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Per dog */}
      {sub.dogs.length > 0 && (
        <div className="bg-white rounded-2xl border border-cream-dark shadow-sm p-5">
          <h2 className="font-heading font-bold text-brand mb-4">Per Dog Breakdown</h2>
          <div className="space-y-3">
            {sub.dogs.map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-cream rounded-xl flex items-center justify-center text-lg">🐶</div>
                  <div>
                    <p className="font-body font-semibold text-brand text-sm">{d.dog_name}</p>
                    <p className="text-xs text-brand/50 font-body">{Math.round(d.daily_kcal)} kcal/day</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-heading font-bold text-brand">AED {Number(d.discounted_monthly_price).toFixed(0)}<span className="font-body font-normal text-brand/50 text-xs">/mo</span></p>
                  {d.household_discount_rate > 0 && (
                    <span className="inline-block mt-0.5 text-[10px] font-heading font-bold bg-coral/10 text-coral px-2 py-0.5 rounded-full">
                      {Math.round(d.household_discount_rate * 100)}% household discount
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {(sub.status === "active" || sub.status === "trial") && (
        <div className="bg-white rounded-2xl border border-cream-dark shadow-sm p-5 space-y-3">
          <h2 className="font-heading font-bold text-brand">Manage Plan</h2>
          <p className="text-sm text-brand/60 font-body">Need a break? You can pause anytime and resume when you're ready.</p>
          <button
            onClick={pause}
            disabled={actionLoading}
            className="w-full border-2 border-brand/20 rounded-xl py-3 text-sm font-heading font-bold text-brand/70 hover:bg-cream disabled:opacity-50 transition-colors"
          >
            {actionLoading ? "Working…" : "⏸  Pause subscription"}
          </button>
        </div>
      )}

      {sub.status === "paused" && (
        <div className="bg-white rounded-2xl border border-cream-dark shadow-sm p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⏸</span>
            <h2 className="font-heading font-bold text-brand">Subscription paused</h2>
          </div>
          <p className="text-sm text-brand/60 font-body">Your deliveries are paused. Resume anytime to start receiving meals again.</p>
          <button
            onClick={resume}
            disabled={actionLoading}
            className="w-full bg-coral text-white rounded-xl py-3 text-sm font-heading font-bold hover:bg-coral-dark disabled:opacity-50 transition-colors"
          >
            {actionLoading ? "Working…" : "▶  Resume subscription"}
          </button>
        </div>
      )}
    </div>
  );
}
