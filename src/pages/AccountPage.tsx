import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Link } from "react-router-dom";

interface Dog { id: string; name: string; breed: string | null; weight_kg: string | null; daily_kcal: number | null }
interface Subscription { id: string; status: string; trial_price: string | null; selling_price_total: string; trial_ends_at: string | null }
interface AccountData {
  person: { id: string; first_name: string | null; last_name: string | null; email: string; phone: string | null; area: string | null };
  dogs: Dog[];
  subscription: Subscription | null;
  next_delivery: { delivery_date: string; delivery_type: string } | null;
}

const STATUS_LABELS: Record<string, string> = {
  trial: "Trial", active: "Active", paused: "Paused", past_due: "Past Due", cancelled: "Cancelled",
};
const STATUS_COLORS: Record<string, string> = {
  trial: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-green-700",
  paused: "bg-amber-100 text-amber-700",
  past_due: "bg-red-100 text-red-700",
  cancelled: "bg-brand/10 text-brand/50",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AE", { weekday: "short", day: "numeric", month: "short" });
}

export default function AccountPage() {
  const [data, setData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<AccountData>("/api/portal/account")
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-16 text-brand/40 font-body">Loading…</div>;
  if (error) return <div className="text-center py-16 text-red-500 font-body">{error}</div>;
  if (!data) return null;

  const { person, dogs, subscription, next_delivery } = data;

  return (
    <div className="space-y-4">
      {/* Hero greeting */}
      <div className="bg-forest rounded-2xl p-6 text-white">
        <p className="text-white/50 text-xs font-body uppercase tracking-widest mb-1">Welcome back</p>
        <h1 className="font-heading font-extrabold text-2xl mb-4">
          {person.first_name ? `${person.first_name} 👋` : "Hey there 👋"}
        </h1>
        {subscription && (
          <div className="flex items-end justify-between">
            <div>
              <p className="text-white/50 text-xs font-body mb-0.5">Monthly plan</p>
              <p className="font-heading font-black text-3xl leading-none">
                AED {Number(subscription.selling_price_total).toFixed(0)}
              </p>
            </div>
            <span className={`text-xs font-heading font-bold px-3 py-1.5 rounded-full ${STATUS_COLORS[subscription.status] ?? "bg-white/10 text-white"}`}>
              {STATUS_LABELS[subscription.status] ?? subscription.status}
            </span>
          </div>
        )}
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-3">
        {/* Next delivery */}
        <div className="bg-white rounded-2xl border border-cream-dark p-3.5 shadow-sm flex flex-col gap-1">
          <span className="text-xl">📦</span>
          <p className="text-[10px] text-brand/40 font-body uppercase tracking-wide leading-none">Next delivery</p>
          <p className="font-heading font-bold text-brand text-sm leading-tight">
            {next_delivery ? formatDate(next_delivery.delivery_date) : "—"}
          </p>
        </div>
        {/* Dogs */}
        <div className="bg-white rounded-2xl border border-cream-dark p-3.5 shadow-sm flex flex-col gap-1">
          <span className="text-xl">🐾</span>
          <p className="text-[10px] text-brand/40 font-body uppercase tracking-wide leading-none">Dogs</p>
          <p className="font-heading font-bold text-brand text-sm leading-tight">
            {dogs.length} {dogs.length === 1 ? "dog" : "dogs"}
          </p>
        </div>
        {/* Trial info or status */}
        <div className="bg-white rounded-2xl border border-cream-dark p-3.5 shadow-sm flex flex-col gap-1">
          <span className="text-xl">🔄</span>
          <p className="text-[10px] text-brand/40 font-body uppercase tracking-wide leading-none">
            {subscription?.trial_ends_at ? "Trial ends" : "Status"}
          </p>
          <p className="font-heading font-bold text-brand text-sm leading-tight">
            {subscription?.trial_ends_at
              ? formatDate(subscription.trial_ends_at)
              : (subscription ? STATUS_LABELS[subscription.status] : "—")}
          </p>
        </div>
      </div>

      {/* My Dogs */}
      <div className="bg-white rounded-2xl border border-cream-dark shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 bg-forest">
          <h2 className="font-heading font-bold text-white">My Dogs</h2>
          <Link to="/dogs" className="text-sm text-coral font-heading font-bold hover:text-coral-dark transition-colors">View all →</Link>
        </div>
        <div className="divide-y divide-cream-dark">
          {dogs.length === 0 && (
            <p className="px-5 py-4 text-sm text-brand/40 font-body">No dogs found.</p>
          )}
          {dogs.map((dog) => (
            <div key={dog.id} className="flex items-center gap-3 px-5 py-3.5">
              <div className="w-10 h-10 bg-cream rounded-xl flex items-center justify-center text-xl shrink-0">🐶</div>
              <div className="flex-1 min-w-0">
                <p className="font-body font-semibold text-brand text-sm">{dog.name}</p>
                <p className="text-xs text-brand/50 font-body truncate">
                  {[dog.breed, dog.weight_kg ? `${dog.weight_kg} kg` : null, dog.daily_kcal ? `${Math.round(dog.daily_kcal)} kcal/day` : null].filter(Boolean).join(" · ")}
                </p>
              </div>
              <span className="text-xs text-brand/30 font-body shrink-0">→</span>
            </div>
          ))}
        </div>
      </div>

      {/* Next delivery detail */}
      {next_delivery && (
        <div className="bg-white rounded-2xl border border-cream-dark shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 bg-forest">
            <h2 className="font-heading font-bold text-white">Next Delivery</h2>
            <Link to="/deliveries" className="text-sm text-coral font-heading font-bold hover:text-coral-dark transition-colors">View all →</Link>
          </div>
          <div className="px-5 py-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-coral/10 rounded-xl flex items-center justify-center text-2xl shrink-0">📦</div>
            <div>
              <p className="font-body font-semibold text-brand">
                {new Date(next_delivery.delivery_date).toLocaleDateString("en-AE", { weekday: "long", day: "numeric", month: "long" })}
              </p>
              <p className="text-xs text-brand/50 font-body uppercase tracking-wide mt-0.5">
                {next_delivery.delivery_type.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Plan summary */}
      {subscription && (
        <div className="bg-white rounded-2xl border border-cream-dark shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 bg-forest">
            <h2 className="font-heading font-bold text-white">Your Plan</h2>
            <Link to="/subscription" className="text-sm text-coral font-heading font-bold hover:text-coral-dark transition-colors">Manage →</Link>
          </div>
          <div className="grid grid-cols-2 gap-px bg-cream-dark">
            <div className="bg-white px-5 py-3.5">
              <p className="text-[10px] text-brand/40 font-body uppercase tracking-wide mb-0.5">Monthly price</p>
              <p className="font-heading font-extrabold text-brand text-lg">AED {Number(subscription.selling_price_total).toFixed(0)}</p>
            </div>
            {subscription.trial_price && (
              <div className="bg-white px-5 py-3.5">
                <p className="text-[10px] text-brand/40 font-body uppercase tracking-wide mb-0.5">Trial price</p>
                <p className="font-heading font-bold text-brand text-lg">AED {Number(subscription.trial_price).toFixed(0)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile */}
      <div className="bg-white rounded-2xl border border-cream-dark shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 bg-forest">
          <h2 className="font-heading font-bold text-white">Contact & Address</h2>
          <Link to="/settings" className="text-sm text-coral font-heading font-bold hover:text-coral-dark transition-colors">Edit →</Link>
        </div>
        <div className="px-5 py-4 space-y-1.5 text-sm font-body text-brand/70">
          {[person.first_name, person.last_name].filter(Boolean).join(" ") && (
            <p className="font-semibold text-brand">{[person.first_name, person.last_name].filter(Boolean).join(" ")}</p>
          )}
          <p>{person.email}</p>
          {person.phone && <p>{person.phone}</p>}
          {person.area && <p>📍 {person.area}</p>}
        </div>
      </div>
    </div>
  );
}
