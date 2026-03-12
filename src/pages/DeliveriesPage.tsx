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
  preparing: "bg-yellow-100 text-yellow-800",
  out_for_delivery: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  skipped: "bg-gray-100 text-gray-600",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AE", { weekday: "long", day: "numeric", month: "long" });
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

  if (loading) return <div className="text-center py-16 text-gray-400">Loading…</div>;
  if (error) return <div className="text-center py-16 text-red-500">{error}</div>;

  const upcoming = deliveries.filter((d) => d.status === "scheduled" || d.status === "preparing");
  const past = deliveries.filter((d) => d.status !== "scheduled" && d.status !== "preparing");

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Deliveries</h1>

      {deliveries.length === 0 && (
        <p className="text-gray-500 text-sm">No deliveries found.</p>
      )}

      {upcoming.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Upcoming</h2>
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
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Past</h2>
          {past.map((delivery) => (
            <DeliveryCard key={delivery.id} delivery={delivery} />
          ))}
        </div>
      )}
    </div>
  );
}

function DeliveryCard({ delivery, onSkip, skipping }: {
  delivery: Delivery;
  onSkip?: (id: string) => void;
  skipping?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{delivery.delivery_type === "day_a" ? "📦" : "📫"}</span>
          <div>
            <p className="font-medium text-gray-900 text-sm">{formatDate(delivery.delivery_date)}</p>
            <p className="text-xs text-gray-500 uppercase">{delivery.delivery_type.replace("_", " ")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[delivery.status] ?? "bg-gray-100 text-gray-600"}`}>
            {delivery.status}
          </span>
          <span className="text-gray-400">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="mt-3 space-y-1.5">
            {delivery.schedules.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{s.dog_name} — <span className="text-gray-500">{s.recipe_name}</span></span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[s.status] ?? "bg-gray-100 text-gray-600"}`}>{s.status}</span>
              </div>
            ))}
          </div>

          {delivery.status === "scheduled" && onSkip && (
            <button
              onClick={() => onSkip(delivery.id)}
              disabled={skipping}
              className="mt-3 text-sm text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
            >
              {skipping ? "Skipping…" : "Skip this delivery"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
