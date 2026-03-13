import { useEffect, useState } from "react";
import { api } from "../lib/api";

interface Schedule {
  id: string; dog_name: string; recipe_name: string; stack_slot: string; status: string;
}
interface Delivery {
  id: string; delivery_date: string; delivery_type: string; status: string;
  schedules: Schedule[];
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  preparing: "bg-amber-100 text-amber-700",
  out_for_delivery: "bg-coral/10 text-coral",
  delivered: "bg-forest/10 text-forest",
  cancelled: "bg-brand/10 text-brand/50",
  skipped: "bg-brand/5 text-brand/40",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AE", { weekday: "long", day: "numeric", month: "long" });
}

function DeliveryCard({ delivery, onSkip, skipping }: {
  delivery: Delivery;
  onSkip?: (id: string) => void;
  skipping?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const isUpcoming = delivery.status === "scheduled" || delivery.status === "preparing";

  return (
    <div className="bg-white rounded-2xl border border-cream-dark shadow-sm overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-cream/50 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${isUpcoming ? "bg-coral/10" : "bg-brand/5"}`}>
            {delivery.delivery_type === "day_a" ? "📦" : "📫"}
          </div>
          <div>
            <p className="font-body font-semibold text-brand text-sm">{formatDate(delivery.delivery_date)}</p>
            <p className="text-xs text-brand/50 font-body uppercase tracking-wide">{delivery.delivery_type.replace("_", " ")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-body font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[delivery.status] ?? "bg-brand/10 text-brand/50"}`}>
            {delivery.status}
          </span>
          <span className="text-brand/30 text-xs">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-cream-dark">
          <div className="mt-3 space-y-2">
            {delivery.schedules.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm bg-cream rounded-xl px-3 py-2">
                <span className="font-body font-medium text-brand">{s.dog_name}</span>
                <span className="text-brand/50 font-body text-xs">{s.recipe_name}</span>
                <span className={`text-xs font-body px-2 py-0.5 rounded-full ${STATUS_COLORS[s.status] ?? "bg-brand/10 text-brand/50"}`}>{s.status}</span>
              </div>
            ))}
          </div>

          {delivery.status === "scheduled" && onSkip && (
            <button
              onClick={() => onSkip(delivery.id)}
              disabled={skipping}
              className="mt-3 text-sm text-red-500 hover:text-red-700 font-heading font-bold disabled:opacity-50 transition-colors"
            >
              {skipping ? "Skipping…" : "Skip this delivery"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [skipping, setSkipping] = useState<string | null>(null);

  async function load() {
    const d = await api.get<{ deliveries: Delivery[] }>("/api/portal/deliveries");
    setDeliveries(d.deliveries);
  }

  useEffect(() => {
    load().catch((e: Error) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  async function skipDelivery(id: string) {
    if (!confirm("Skip this delivery? This cannot be undone.")) return;
    setSkipping(id);
    try {
      await api.post(`/api/portal/deliveries/${id}/skip`);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to skip");
    } finally {
      setSkipping(null);
    }
  }

  if (loading) return <div className="text-center py-16 text-brand/40 font-body">Loading…</div>;
  if (error) return <div className="text-center py-16 text-red-500 font-body">{error}</div>;

  const upcoming = deliveries.filter((d) => d.status === "scheduled" || d.status === "preparing");
  const past = deliveries.filter((d) => d.status !== "scheduled" && d.status !== "preparing");

  return (
    <div className="space-y-6">
      <h1 className="font-heading font-extrabold text-2xl text-brand">Deliveries</h1>

      {deliveries.length === 0 && (
        <div className="bg-white rounded-2xl border border-cream-dark p-8 text-center">
          <div className="text-4xl mb-3">📦</div>
          <p className="font-body text-brand/50 text-sm">No deliveries found.</p>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-heading font-bold text-brand/40 uppercase tracking-widest">Upcoming</h2>
          {upcoming.map((delivery) => (
            <DeliveryCard
              key={delivery.id}
              delivery={delivery}
              onSkip={skipDelivery}
              skipping={skipping === delivery.id}
            />
          ))}
        </div>
      )}

      {past.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-heading font-bold text-brand/40 uppercase tracking-widest">Past</h2>
          {past.map((delivery) => (
            <DeliveryCard key={delivery.id} delivery={delivery} />
          ))}
        </div>
      )}
    </div>
  );
}
