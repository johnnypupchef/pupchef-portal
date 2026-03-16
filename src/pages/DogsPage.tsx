import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { getBreedImageSrc, FALLBACK_IMG } from "../lib/breeds";

// Drag-to-scroll container — works with mouse on desktop and touch on mobile
function DragScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const [grabbing, setGrabbing] = useState(false);

  function onMouseDown(e: React.MouseEvent) {
    if (!ref.current) return;
    isDragging.current = true;
    setGrabbing(true);
    startX.current = e.pageX - ref.current.getBoundingClientRect().left;
    scrollLeft.current = ref.current.scrollLeft;
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!isDragging.current || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.getBoundingClientRect().left;
    const walk = (x - startX.current) * 1.2;
    ref.current.scrollLeft = scrollLeft.current - walk;
  }

  function stopDrag() {
    isDragging.current = false;
    setGrabbing(false);
  }

  return (
    <div
      ref={ref}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
      style={{
        display: "flex",
        gap: "12px",
        overflowX: "auto",
        paddingBottom: "8px",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        cursor: grabbing ? "grabbing" : "grab",
        userSelect: "none",
      }}
    >
      {children}
    </div>
  );
}

interface Dog {
  id: string; name: string; breed: string | null; sex: string | null;
  age_months: number | null; neutered: string | null; weight_kg: string | null;
  body_condition: string | null; activity_level: string | null;
  life_stage: string | null; daily_kcal: number | null;
  health_issues: string[];
}

interface RecipeIngredient { name: string; weight_percentage: number }
interface RecipeSupplement { name: string; dose_amount: number; dose_unit: string }
interface Recipe {
  slot: string;
  recipe_id: string;
  name: string;
  label_background_url: string | null;
  grams_per_1000_kcal: number;
  ingredients: RecipeIngredient[];
  supplements: RecipeSupplement[];
}

const ACTIVITY_LABELS: Record<string, string> = {
  low: "Low", moderate: "Moderate", high: "High", very_high: "Very High",
};
const BODY_LABELS: Record<string, string> = {
  underweight: "Underweight", lean: "Lean", ideal: "Ideal", rounded: "Rounded", obese: "Obese",
};
const SLOT_LABELS: Record<string, string> = {
  regular_1: "Slot 1", regular_2: "Slot 2", regular_3: "Slot 3", cheat: "Cheat Day",
};
const SLOT_COLORS: Record<string, string> = {
  regular_1: "bg-blue-500", regular_2: "bg-emerald-500", regular_3: "bg-purple-500", cheat: "bg-amber-500",
};

// Per-bowl grams for a single ingredient for a specific dog
function gramsPerBowl(dailyKcal: number, grams_per_1000_kcal: number, weight_pct: number): number {
  return (dailyKcal / 1000) * grams_per_1000_kcal * (weight_pct / 100) / 2;
}

function RecipeCard({ recipe, dog }: { recipe: Recipe; dog: Dog }) {
  const kcal = dog.daily_kcal ?? 0;
  const totalBowlGrams = kcal > 0 ? (kcal / 1000) * recipe.grams_per_1000_kcal / 2 : 0;

  return (
    <div className="w-64 shrink-0 bg-white rounded-2xl border border-cream-dark shadow-sm overflow-hidden">
      {/* Recipe background image or colored header */}
      {recipe.label_background_url ? (
        <div className="h-44 overflow-hidden">
          <img
            src={recipe.label_background_url}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className={`h-44 flex items-center justify-center ${SLOT_COLORS[recipe.slot] ?? "bg-forest"}`}>
          <span className="text-4xl">🍲</span>
        </div>
      )}

      {/* Content */}
      <div className="p-3.5">
        {/* Slot badge + recipe name */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] font-heading font-bold text-white px-2 py-0.5 rounded-full ${SLOT_COLORS[recipe.slot] ?? "bg-forest"}`}>
            {SLOT_LABELS[recipe.slot] ?? recipe.slot}
          </span>
        </div>
        <h3 className="font-heading font-extrabold text-brand text-sm mb-1 leading-tight">{recipe.name}</h3>

        {/* Bowl size */}
        {kcal > 0 && (
          <p className="text-xs text-brand/50 font-body mb-3">
            1 bowl = <span className="font-semibold text-brand">{Math.round(totalBowlGrams)}g</span> · {Math.round(kcal / 2)} kcal
          </p>
        )}

        {/* Ingredients */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-heading font-bold text-brand/40 uppercase tracking-wide">Per bowl ingredients</p>
          {recipe.ingredients.map((ing) => {
            const grams = kcal > 0 ? gramsPerBowl(kcal, recipe.grams_per_1000_kcal, ing.weight_percentage) : null;
            return (
              <div key={ing.name} className="flex items-center justify-between gap-2">
                <span className="text-xs text-brand/70 font-body truncate">{ing.name}</span>
                <span className="text-xs font-body font-semibold text-brand shrink-0">
                  {grams !== null ? `${Math.round(grams)}g` : `${ing.weight_percentage}%`}
                </span>
              </div>
            );
          })}
          {recipe.supplements && recipe.supplements.length > 0 && (
            <>
              <div className="border-t border-purple-100 pt-1.5 mt-1.5">
                <p className="text-[10px] font-heading font-bold text-purple-400 uppercase tracking-wide mb-1">Supplements</p>
                {recipe.supplements.map((s) => (
                  <div key={s.name} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-purple-600 font-body truncate">+ {s.name}</span>
                    <span className="text-xs font-body font-semibold text-purple-600 shrink-0">
                      {Math.round(s.dose_amount)}{s.dose_unit}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DogsPage() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
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
    Promise.all([
      api.get<{ dogs: Dog[] }>("/api/portal/account").then((d) => setDogs(d.dogs)),
      api.get<{ recipes: Recipe[] }>("/api/portal/recipe-stack").then((d) => setRecipes(d.recipes)).catch(() => {}),
    ])
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
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
        <div key={dog.id} className="space-y-3">
          {/* Dog card */}
          <div className="bg-white rounded-2xl border border-cream-dark shadow-sm overflow-hidden">
            {/* Dog header */}
            <div className="bg-forest px-5 py-3.5 flex items-center gap-3">
              <div>
                <h2 className="font-heading font-extrabold text-white text-lg leading-tight">{dog.name}</h2>
                <p className="text-xs text-white/60 font-body mt-0.5">
                  {[dog.sex, dog.age_months ? `${Math.floor(dog.age_months / 12)}y ${dog.age_months % 12}m` : null, dog.neutered === "yes" ? "neutered" : null].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>

            <div className="p-4">
              {/* Image + stats row */}
              <div className="flex gap-3 mb-4">
                <div className="flex-shrink-0 w-28 self-stretch rounded-xl overflow-hidden bg-cream border border-cream-dark">
                  <img
                    src={getBreedImageSrc(dog.breed)}
                    alt={dog.breed ?? "Dog"}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG; }}
                  />
                </div>

                <div className="flex-1 grid grid-cols-2 gap-2 content-start">
                  {[
                    { label: "Breed", value: dog.breed ?? "—" },
                    { label: "Daily kcal", value: dog.daily_kcal != null ? Math.round(dog.daily_kcal) : "—" },
                    { label: "Weight", value: dog.weight_kg ? `${dog.weight_kg} kg` : "—" },
                    { label: "Activity", value: dog.activity_level ? (ACTIVITY_LABELS[dog.activity_level] ?? dog.activity_level) : "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-cream rounded-xl px-2.5 py-2">
                      <p className="text-[10px] text-brand/50 font-body mb-0.5 leading-none">{label}</p>
                      <p className="font-body font-semibold text-brand text-xs leading-tight">{String(value)}</p>
                    </div>
                  ))}
                  <div className="col-span-2 bg-cream rounded-xl px-2.5 py-2">
                    <p className="text-[10px] text-brand/50 font-body mb-0.5 leading-none">Body condition</p>
                    <p className="font-body font-semibold text-brand text-xs leading-tight">
                      {dog.body_condition ? (BODY_LABELS[dog.body_condition] ?? dog.body_condition) : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {dog.health_issues.length > 0 && (
                <div className="mb-4">
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

          {/* Recipe stack carousel for this dog */}
          {recipes.length > 0 && (
            <div>
              <p className="text-xs font-heading font-bold text-brand/50 uppercase tracking-widest mb-2.5 px-0.5">
                {dog.name}&apos;s Recipe Rotation
              </p>
              <DragScroll>
                {recipes.map((recipe) => (
                  <RecipeCard key={recipe.recipe_id} recipe={recipe} dog={dog} />
                ))}
              </DragScroll>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
