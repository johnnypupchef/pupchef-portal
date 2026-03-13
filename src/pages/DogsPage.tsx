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

  if (loading) return <div className="text-center py-16 text-brand/40 font-body">Loading…</div>;
  if (error) return <div className="text-center py-16 text-red-500 font-body">{error}</div>;

  return (
    <div className="space-y-5">
      <h1 className="font-heading font-extrabold text-2xl text-brand">My Dogs</h1>

      {dogs.length === 0 && (
        <p className="text-brand/50 text-sm font-body">No dogs found.</p>
      )}

      {dogs.map((dog) => (
        <div key={dog.id} className="bg-white rounded-2xl border border-cream-dark shadow-sm overflow-hidden">
          {/* Dog header */}
          <div className="bg-forest px-5 py-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">🐶</div>
            <div>
              <h2 className="font-heading font-extrabold text-white text-lg">{dog.name}</h2>
              <p className="text-xs text-white/60 font-body">
                {[dog.breed, dog.sex, dog.age_months ? `${Math.floor(dog.age_months / 12)}y ${dog.age_months % 12}m` : null].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Weight", value: dog.weight_kg ? `${dog.weight_kg} kg` : "—" },
                { label: "Daily kcal", value: dog.daily_kcal ?? "—" },
                { label: "Activity", value: dog.activity_level ? (ACTIVITY_LABELS[dog.activity_level] ?? dog.activity_level) : "—" },
                { label: "Body condition", value: dog.body_condition ? (BODY_LABELS[dog.body_condition] ?? dog.body_condition) : "—" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-cream rounded-xl p-3">
                  <p className="text-xs text-brand/50 font-body mb-0.5">{label}</p>
                  <p className="font-body font-semibold text-brand text-sm">{String(value)}</p>
                </div>
              ))}
            </div>

            {dog.health_issues.length > 0 && (
              <div>
                <p className="text-xs text-brand/50 font-body mb-2">Health notes</p>
                <div className="flex flex-wrap gap-1.5">
                  {dog.health_issues.map((h) => (
                    <span key={h} className="text-xs bg-coral/10 text-coral font-body font-medium px-2.5 py-1 rounded-full">{h}</span>
                  ))}
                </div>
              </div>
            )}

            {editingId === dog.id ? (
              <div className="border-t border-cream-dark pt-4 space-y-3">
                <p className="text-xs font-heading font-bold text-brand/50 uppercase tracking-wide">Edit profile</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-brand/60 font-body font-medium">Weight (kg)</label>
                    <input
                      type="number" step="0.1"
                      value={form.weight_kg ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, weight_kg: e.target.value }))}
                      className="w-full mt-1 border border-cream-dark rounded-xl px-3 py-2.5 text-sm text-brand bg-cream focus:outline-none focus:ring-2 focus:ring-coral/40 font-body"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-brand/60 font-body font-medium">Activity Level</label>
                    <select
                      value={form.activity_level ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, activity_level: e.target.value }))}
                      className="w-full mt-1 border border-cream-dark rounded-xl px-3 py-2.5 text-sm text-brand bg-cream focus:outline-none focus:ring-2 focus:ring-coral/40 font-body"
                    >
                      <option value="">Select…</option>
                      {Object.entries(ACTIVITY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-brand/60 font-body font-medium">Body Condition</label>
                    <select
                      value={form.body_condition ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, body_condition: e.target.value }))}
                      className="w-full mt-1 border border-cream-dark rounded-xl px-3 py-2.5 text-sm text-brand bg-cream focus:outline-none focus:ring-2 focus:ring-coral/40 font-body"
                    >
                      <option value="">Select…</option>
                      {Object.entries(BODY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => saveDog(dog.id)}
                    disabled={saving}
                    className="bg-coral text-white rounded-xl px-5 py-2.5 text-sm font-heading font-bold hover:bg-coral-dark disabled:opacity-50 transition-colors"
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="border border-cream-dark rounded-xl px-5 py-2.5 text-sm font-body text-brand/60 hover:bg-cream transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => startEdit(dog)}
                className="text-sm text-coral font-heading font-bold hover:text-coral-dark transition-colors"
              >
                Edit profile →
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
