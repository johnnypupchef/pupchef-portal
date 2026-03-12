import { useEffect, useState } from "react";
import { api } from "../lib/api";

interface Dog {
  id: string; name: string; breed: string | null; sex: string | null;
  age_months: number | null; neutered: string | null; weight_kg: string | null;
  body_condition: string | null; activity_level: string | null;
  life_stage: string | null; daily_kcal: number | null;
  health_issues: string[];
}

const ACTIVITY_LABELS: Record<string, string> = {
  low: "Low", moderate: "Moderate", high: "High", very_high: "Very High",
};
const BODY_LABELS: Record<string, string> = {
  underweight: "Underweight", lean: "Lean", ideal: "Ideal", rounded: "Rounded", obese: "Obese",
};

export default function DogsPage() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Dog>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadDogs() {
    const d = await api.get<{ dogs: Dog[] }>("/api/portal/account");
    setDogs(d.dogs);
  }

  useEffect(() => {
    loadDogs().catch((e: Error) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  function startEdit(dog: Dog) {
    setEditingId(dog.id);
    setForm({ weight_kg: dog.weight_kg, activity_level: dog.activity_level, body_condition: dog.body_condition });
  }

  async function saveDog(id: string) {
    setSaving(true);
    try {
      await api.patch(`/api/portal/dogs/${id}`, form);
      await loadDogs();
      setEditingId(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-center py-16 text-gray-400">Loading…</div>;
  if (error) return <div className="text-center py-16 text-red-500">{error}</div>;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">My Dogs</h1>

      {dogs.length === 0 && (
        <p className="text-gray-500 text-sm">No dogs found.</p>
      )}

      {dogs.map((dog) => (
        <div key={dog.id} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🐶</span>
            <div>
              <h2 className="font-bold text-gray-900 text-lg">{dog.name}</h2>
              <p className="text-xs text-gray-500">
                {[dog.breed, dog.sex, dog.age_months ? `${Math.floor(dog.age_months / 12)}y ${dog.age_months % 12}m` : null].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><p className="text-xs text-gray-500">Weight</p><p className="font-medium text-gray-900">{dog.weight_kg ? `${dog.weight_kg} kg` : "—"}</p></div>
            <div><p className="text-xs text-gray-500">Daily kcal</p><p className="font-medium text-gray-900">{dog.daily_kcal ?? "—"}</p></div>
            <div><p className="text-xs text-gray-500">Activity</p><p className="font-medium text-gray-900">{dog.activity_level ? (ACTIVITY_LABELS[dog.activity_level] ?? dog.activity_level) : "—"}</p></div>
            <div><p className="text-xs text-gray-500">Body condition</p><p className="font-medium text-gray-900">{dog.body_condition ? (BODY_LABELS[dog.body_condition] ?? dog.body_condition) : "—"}</p></div>
          </div>

          {dog.health_issues.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Health notes</p>
              <div className="flex flex-wrap gap-1">
                {dog.health_issues.map((h) => (
                  <span key={h} className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">{h}</span>
                ))}
              </div>
            </div>
          )}

          {editingId === dog.id ? (
            <div className="border-t border-gray-100 pt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 font-medium">Weight (kg)</label>
                  <input
                    type="number" step="0.1"
                    value={form.weight_kg ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, weight_kg: e.target.value }))}
                    className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-medium">Activity Level</label>
                  <select
                    value={form.activity_level ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, activity_level: e.target.value }))}
                    className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="">Select…</option>
                    {Object.entries(ACTIVITY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-medium">Body Condition</label>
                  <select
                    value={form.body_condition ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, body_condition: e.target.value }))}
                    className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="">Select…</option>
                    {Object.entries(BODY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => saveDog(dog.id)}
                  disabled={saving}
                  className="bg-orange-500 text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => startEdit(dog)}
              className="text-sm text-orange-500 font-medium hover:underline"
            >
              Edit profile
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
