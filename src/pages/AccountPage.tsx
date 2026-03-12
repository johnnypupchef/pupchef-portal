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
  trial: "bg-blue-100 text-blue-700", active: "bg-green-100 text-green-700",
  paused: "bg-yellow-100 text-yellow-800", past_due: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-600",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AE", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
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

  if (loading) return <div className="text-center py-16 text-gray-400">Loading…</div>;
  if (error) return <div className="text-center py-16 text-red-500">{error}</div>;
  if (!data) return null;

  const { person, dogs, subscription, next_delivery } = data;
  const fullName = [person.first_name, person.last_name].filter(Boolean).join(" ") || "—";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back{person.first_name ? `, ${person.first_name}` : ""}!</h1>
        <p className="text-sm text-gray-500 mt-0.5">{person.email}</p>
      </div>

      {/* Subscription status */}
      {subscription ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Your Plan</h2>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[subscription.status] ?? "bg-gray-100 text-gray-600"}`}>
              {STATUS_LABELS[subscription.status] ?? subscription.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500 text-xs mb-0.5">Monthly price</p>
              <p className="font-semibold text-gray-900">AED {Number(subscription.selling_price_total).toFixed(0)}</p>
            </div>
            {subscription.trial_price && (
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Trial price</p>
                <p className="font-semibold text-gray-900">AED {Number(subscription.trial_price).toFixed(0)}</p>
              </div>
            )}
            {subscription.trial_ends_at && (
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Trial ends</p>
                <p className="font-semibold text-gray-900">{formatDate(subscription.trial_ends_at)}</p>
              </div>
            )}
          </div>
          <Link to="/subscription" className="text-sm text-orange-500 font-medium hover:underline">
            Manage subscription →
          </Link>
        </div>
      ) : (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 text-sm text-orange-700">
          No active subscription found.
        </div>
      )}

      {/* Next delivery */}
      {next_delivery && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-2">Next Delivery</h2>
          <p className="text-sm text-gray-700">
            <span className="font-medium">{formatDate(next_delivery.delivery_date)}</span>
            <span className="ml-2 text-xs text-gray-500 uppercase">{next_delivery.delivery_type.replace("_", " ")}</span>
          </p>
          <Link to="/deliveries" className="text-sm text-orange-500 font-medium hover:underline mt-2 inline-block">
            View all deliveries →
          </Link>
        </div>
      )}

      {/* Dogs summary */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">My Dogs</h2>
          <Link to="/dogs" className="text-sm text-orange-500 font-medium hover:underline">View all →</Link>
        </div>
        <div className="space-y-2">
          {dogs.map((dog) => (
            <div key={dog.id} className="flex items-center gap-3 text-sm">
              <span className="text-lg">🐶</span>
              <div>
                <p className="font-medium text-gray-900">{dog.name}</p>
                <p className="text-xs text-gray-500">
                  {[dog.breed, dog.weight_kg ? `${dog.weight_kg} kg` : null, dog.daily_kcal ? `${dog.daily_kcal} kcal/day` : null].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Profile summary */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Profile</h2>
          <Link to="/settings" className="text-sm text-orange-500 font-medium hover:underline">Edit →</Link>
        </div>
        <div className="text-sm text-gray-700 space-y-1">
          <p>{fullName}</p>
          <p>{person.email}</p>
          {person.phone && <p>{person.phone}</p>}
          {person.area && <p>{person.area}</p>}
        </div>
      </div>
    </div>
  );
}
