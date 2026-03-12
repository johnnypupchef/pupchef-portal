import { useEffect, useState } from "react";
import { api } from "../lib/api";

interface SubDog { dog_name: string; daily_kcal: number; discounted_monthly_price: string }
interface Subscription {
  id: string; status: string; selling_price_total: string; trial_price: string | null;
  trial_ends_at: string | null; created_at: string;
  dogs: SubDog[];
}

const STATUS_COLORS: Record<string, string> = {
  trial: "bg-blue-100 text-blue-700", active: "bg-green-100 text-green-700",
  paused: "bg-yellow-100 text-yellow-800", past_due: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-600",
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
      setActionMsg("Subscription resumed!");
    } catch (e: unknown) {
      setActionMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <div className="text-center py-16 text-gray-400">Loading…</div>;
  if (error) return <div className="text-center py-16 text-red-500">{error}</div>;
  if (!sub) return (
    <div className="text-center py-16 space-y-2">
      <p className="text-gray-500">No active subscription found.</p>
    </div>
  );

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Subscription</h1>

      {actionMsg && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">{actionMsg}</div>
      )}

      {/* Status card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Plan Status</h2>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[sub.status] ?? "bg-gray-100 text-gray-600"}`}>
            {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Monthly price</p>
            <p className="font-bold text-gray-900 text-lg">AED {Number(sub.selling_price_total).toFixed(0)}</p>
          </div>
          {sub.trial_price && (
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Trial price</p>
              <p className="font-semibold text-gray-900">AED {Number(sub.trial_price).toFixed(0)}</p>
            </div>
          )}
          {sub.trial_ends_at && (
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Trial ends</p>
              <p className="font-semibold text-gray-900">{formatDate(sub.trial_ends_at)}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Started</p>
            <p className="font-semibold text-gray-900">{formatDate(sub.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Per dog pricing */}
      {sub.dogs.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Per Dog Breakdown</h2>
          <div className="space-y-2">
            {sub.dogs.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>🐶</span>
                  <div>
                    <p className="font-medium text-gray-900">{d.dog_name}</p>
                    <p className="text-xs text-gray-500">{d.daily_kcal} kcal/day</p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">AED {Number(d.discounted_monthly_price).toFixed(0)}/mo</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {(sub.status === "active" || sub.status === "trial") && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
          <h2 className="font-semibold text-gray-900">Manage</h2>
          <button
            onClick={pause}
            disabled={actionLoading}
            className="w-full border border-gray-300 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {actionLoading ? "Working…" : "⏸ Pause subscription"}
          </button>
          <p className="text-xs text-gray-400 text-center">Your deliveries will pause until you resume. No charges during pause.</p>
        </div>
      )}

      {sub.status === "paused" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
          <h2 className="font-semibold text-gray-900">Subscription paused</h2>
          <p className="text-sm text-gray-500">Your subscription is currently paused. Resume to restart deliveries.</p>
          <button
            onClick={resume}
            disabled={actionLoading}
            className="w-full bg-orange-500 text-white rounded-xl py-3 text-sm font-semibold hover:bg-orange-600 disabled:opacity-50"
          >
            {actionLoading ? "Working…" : "▶ Resume subscription"}
          </button>
        </div>
      )}
    </div>
  );
}
