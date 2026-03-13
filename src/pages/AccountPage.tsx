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
  active: "bg-forest/10 text-forest",
  paused: "bg-amber-100 text-amber-700",
  past_due: "bg-red-100 text-red-700",
  cancelled: "bg-brand/10 text-brand/50",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AE", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-cream-dark p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
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
    <div className="space-y-5">
      {/* Greeting */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl text-brand">
          {person.first_name ? `Hey, ${person.first_name}! 👋` : "Welcome back!"}
        </h1>
        <p className="text-sm text-brand/50 font-body mt-0.5">{person.email}</p>
      </div>

      {/* Subscription status */}
      {subscription ? (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-brand">Your Plan</h2>
            <span className={`text-xs font-heading font-bold px-3 py-1 rounded-full ${STATUS_COLORS[subscription.status] ?? "bg-brand/10 text-brand/60"}`}>
              {STATUS_LABELS[subscription.status] ?? subscription.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-brand/50 text-xs font-body mb-0.5">Monthly price</p>
              <p className="font-heading font-extrabold text-brand text-xl">AED {Number(subscription.selling_price_total).toFixed(0)}</p>
            </div>
            {subscription.trial_price && (
              <div>
                <p className="text-brand/50 text-xs font-body mb-0.5">Trial price</p>
                <p className="font-heading font-bold text-brand">AED {Number(subscription.trial_price).toFixed(0)}</p>
              </div>
            )}
            {subscription.trial_ends_at && (
              <div>
                <p className="text-brand/50 text-xs font-body mb-0.5">Trial ends</p>
                <p className="font-body font-medium text-brand">{formatDate(subscription.trial_ends_at)}</p>
              </div>
            )}
          </div>
          <Link to="/subscription" className="inline-block mt-4 text-sm text-coral font-heading font-bold hover:text-coral-dark transition-colors">
            Manage plan →
          </Link>
        </Card>
      ) : (
        <Card className="bg-forest text-white border-forest">
          <p className="font-body text-sm text-white/80">No active subscription found.</p>
        </Card>
      )}

      {/* Next delivery */}
      {next_delivery && (
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-brand mb-1">Next Delivery</h2>
              <p className="font-body font-medium text-brand">{formatDate(next_delivery.delivery_date)}</p>
              <p className="text-xs text-brand/50 font-body uppercase tracking-wide mt-0.5">{next_delivery.delivery_type.replace("_", " ")}</p>
            </div>
            <div className="w-12 h-12 bg-coral/10 rounded-xl flex items-center justify-center text-2xl">📦</div>
          </div>
          <Link to="/deliveries" className="inline-block mt-4 text-sm text-coral font-heading font-bold hover:text-coral-dark transition-colors">
            View all deliveries →
          </Link>
        </Card>
      )}

      {/* Dogs */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-brand">My Dogs</h2>
          <Link to="/dogs" className="text-sm text-coral font-heading font-bold hover:text-coral-dark transition-colors">View all →</Link>
        </div>
        <div className="space-y-3">
          {dogs.map((dog) => (
            <div key={dog.id} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cream rounded-xl flex items-center justify-center text-xl shrink-0">🐶</div>
              <div>
                <p className="font-body font-semibold text-brand text-sm">{dog.name}</p>
                <p className="text-xs text-brand/50 font-body">
                  {[dog.breed, dog.weight_kg ? `${dog.weight_kg} kg` : null, dog.daily_kcal ? `${dog.daily_kcal} kcal/day` : null].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Profile */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-bold text-brand">Profile</h2>
          <Link to="/settings" className="text-sm text-coral font-heading font-bold hover:text-coral-dark transition-colors">Edit →</Link>
        </div>
        <div className="text-sm text-brand/70 font-body space-y-1">
          {[person.first_name, person.last_name].filter(Boolean).join(" ") && (
            <p className="font-medium text-brand">{[person.first_name, person.last_name].filter(Boolean).join(" ")}</p>
          )}
          <p>{person.email}</p>
          {person.phone && <p>{person.phone}</p>}
          {person.area && <p>{person.area}</p>}
        </div>
      </Card>
    </div>
  );
}
