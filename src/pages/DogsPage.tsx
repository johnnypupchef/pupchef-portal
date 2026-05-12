import { useState } from "react";
import {
  Flame,
  Scale,
  Activity,
  Heart,
  Edit,
  ChevronRight,
  Sparkles,
  Soup,
} from "lucide-react";
import { api, invalidateCache, setCache } from "../lib/api";
import { useApiQuery } from "../lib/useApiQuery";
import { getBreedImageSrc, FALLBACK_IMG } from "../lib/breeds";
import { DragScroll } from "../components/portal-ui";

interface Dog {
  id: string;
  name: string;
  breed: string | null;
  sex: string | null;
  age_months: number | null;
  neutered: string | null;
  weight_kg: string | null;
  body_condition: string | null;
  activity_level: string | null;
  life_stage: string | null;
  daily_kcal: number | null;
  health_issues: string[];
}

interface RecipeIngredient {
  name: string;
  weight_percentage: number;
}
interface RecipeSupplement {
  name: string;
  dose_amount: number;
  dose_unit: string;
}
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
  low: "Low",
  moderate: "Moderate",
  high: "High",
  very_high: "Very High",
};
const BODY_LABELS: Record<string, string> = {
  underweight: "Underweight",
  lean: "Lean",
  ideal: "Ideal",
  rounded: "Rounded",
  obese: "Obese",
};
const SLOT_LABELS: Record<string, string> = {
  regular_1: "Recipe 1",
  regular_2: "Recipe 2",
  regular_3: "Recipe 3",
  cheat: "Cheat day",
};

/**
 * Canonical bowl images for the three regular recipes (chicken / beef / fish).
 * Overrides whatever `label_background_url` the API returns so the marketing
 * art stays in lockstep with the portal regardless of admin edits.
 */
const RECIPE_IMAGE_OVERRIDES: { match: (name: string) => boolean; url: string }[] = [
  {
    match: (n) => n.includes("chicken"),
    url: "https://rkgrfzsmkymkfnsvewzo.supabase.co/storage/v1/object/public/label-assets/website%20content/farmhouse%20chickenn.png",
  },
  {
    match: (n) => n.includes("beef"),
    url: "https://rkgrfzsmkymkfnsvewzo.supabase.co/storage/v1/object/public/label-assets/website%20content/prime%20beef%20feast.png",
  },
  {
    match: (n) => n.includes("fish") || n.includes("seaside"),
    url: "https://rkgrfzsmkymkfnsvewzo.supabase.co/storage/v1/object/public/label-assets/website%20content/seaside%20fish.png",
  },
];

function recipeImage(recipe: Recipe): string | null {
  const n = recipe.name.toLowerCase();
  for (const o of RECIPE_IMAGE_OVERRIDES) {
    if (o.match(n)) return o.url;
  }
  return recipe.label_background_url;
}

/**
 * Recipe gradient color from README. Match by name keyword first
 * (since colors are tied to protein not slot), then by slot as fallback.
 */
function recipeColor(recipe: Recipe): string {
  const n = recipe.name.toLowerCase();
  if (recipe.slot === "cheat" || n.includes("cheat")) return "#A35446";
  if (n.includes("beef")) return "#7B5A3F";
  if (n.includes("chicken")) return "#C8854A";
  if (n.includes("fish") || n.includes("seaside")) return "#5A7A8C";
  // Slot fallback
  if (recipe.slot === "regular_1") return "#C8854A";
  if (recipe.slot === "regular_2") return "#7B5A3F";
  if (recipe.slot === "regular_3") return "#5A7A8C";
  return "#173B33";
}

function ageLabel(months: number | null) {
  if (months == null) return "";
  const y = Math.floor(months / 12);
  const m = months % 12;
  return `${y}y ${m}m`;
}

function gramsForIngredient(
  dailyKcal: number,
  grams_per_1000_kcal: number,
  weight_pct: number,
): number {
  return ((dailyKcal / 1000) * grams_per_1000_kcal * (weight_pct / 100)) / 2;
}

function RecipeCard({ recipe, dog }: { recipe: Recipe; dog: Dog }) {
  const kcal = dog.daily_kcal ?? 0;
  const totalBowlGrams = kcal > 0 ? ((kcal / 1000) * recipe.grams_per_1000_kcal) / 2 : 0;
  const color = recipeColor(recipe);
  const isCheat = recipe.slot === "cheat";

  return (
    <div
      style={{
        flexShrink: 0,
        width: 240,
        scrollSnapAlign: "start",
        background: "#fff",
        borderRadius: 20,
        border: "1px solid var(--line)",
        overflow: "hidden",
        boxShadow: "var(--sh-1)",
      }}
    >
      {/* Top zone — gradient + bowl image */}
      <div
        style={{
          height: 130,
          background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
          position: "relative",
          display: "flex",
          alignItems: "flex-end",
          padding: 14,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.18,
            background:
              "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.5), transparent 50%)",
            pointerEvents: "none",
          }}
        />
        {(() => {
          const img = recipeImage(recipe);
          if (!img) return null;
          return (
            <div
              style={{
                position: "absolute",
                right: -14,
                top: "50%",
                transform: "translateY(-50%)",
                width: 116,
                height: 116,
                filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.18))",
                pointerEvents: "none",
              }}
            >
              <img
                src={img}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
          );
        })()}
        <span
          className="pill pill-on-dark"
          style={{ position: "absolute", top: 12, left: 12 }}
        >
          {isCheat ? (
            <Sparkles size={12} strokeWidth={2.2} />
          ) : (
            <Soup size={12} strokeWidth={2.2} />
          )}
          {SLOT_LABELS[recipe.slot] ?? recipe.slot}
        </span>
        <div style={{ position: "relative" }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Per bowl
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: 28,
              letterSpacing: "-0.025em",
              color: "#fff",
              lineHeight: 1,
            }}
          >
            {Math.round(totalBowlGrams)}
            <span style={{ fontSize: 14, marginLeft: 2 }}>g</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: 14 }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: 18,
            letterSpacing: "-0.02em",
            color: "var(--forest)",
            lineHeight: 1.1,
            marginBottom: 10,
          }}
        >
          {recipe.name}
        </div>
        <div className="page-eyebrow" style={{ marginBottom: 8 }}>
          Ingredients
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {recipe.ingredients.map((ing) => {
            const g = kcal > 0
              ? gramsForIngredient(kcal, recipe.grams_per_1000_kcal, ing.weight_percentage)
              : null;
            return (
              <div
                key={ing.name}
                style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}
              >
                <span style={{ color: "var(--ink-soft)" }}>{ing.name}</span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: 600,
                    color: "var(--ink)",
                  }}
                >
                  {g != null ? `${Math.round(g)}g` : `${ing.weight_percentage}%`}
                </span>
              </div>
            );
          })}
        </div>
        {recipe.supplements.length > 0 && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px dashed var(--line)" }}>
            <div className="page-eyebrow" style={{ marginBottom: 6, color: "var(--plum)" }}>
              Supplements
            </div>
            {recipe.supplements.map((s) => (
              <div
                key={s.name}
                style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}
              >
                <span style={{ color: "var(--plum)" }}>+ {s.name}</span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: 600,
                    color: "var(--plum)",
                  }}
                >
                  {s.dose_amount}
                  {s.dose_unit}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface DogBlockProps {
  dog: Dog;
  recipes: Recipe[];
  editing: boolean;
  saving: boolean;
  form: Partial<Dog>;
  onEdit: () => void;
  onCancel: () => void;
  onChange: (patch: Partial<Dog>) => void;
  onSave: () => void;
}

function DogBlock({
  dog,
  recipes,
  editing,
  saving,
  form,
  onEdit,
  onCancel,
  onChange,
  onSave,
}: DogBlockProps) {
  const stats = [
    {
      label: "Daily kcal",
      value: dog.daily_kcal != null ? Math.round(dog.daily_kcal).toString() : "—",
      icon: <Flame size={14} strokeWidth={2} />,
    },
    {
      label: "Weight",
      value: dog.weight_kg ? `${dog.weight_kg} kg` : "—",
      icon: <Scale size={14} strokeWidth={2} />,
    },
    {
      label: "Activity",
      value: dog.activity_level ? ACTIVITY_LABELS[dog.activity_level] ?? dog.activity_level : "—",
      icon: <Activity size={14} strokeWidth={2} />,
    },
    {
      label: "Body",
      value: dog.body_condition ? BODY_LABELS[dog.body_condition] ?? dog.body_condition : "—",
      icon: <Heart size={14} strokeWidth={2} />,
    },
  ];

  return (
    <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 24,
          border: "1px solid var(--line)",
          overflow: "hidden",
          boxShadow: "var(--sh-2)",
        }}
      >
        {/* Forest header with breed photo */}
        <div
          className="forest-tex"
          style={{
            position: "relative",
            padding: "26px 22px 18px",
            overflow: "hidden",
            minHeight: 178,
          }}
        >
          <div
            style={{
              position: "absolute",
              right: 24,
              top: 4,
              width: 200,
              height: 200,
              opacity: 0.95,
              pointerEvents: "none",
            }}
          >
            <img
              src={getBreedImageSrc(dog.breed)}
              alt=""
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG;
              }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                objectPosition: "center top",
              }}
            />
          </div>
          <div style={{ position: "relative", maxWidth: "60%" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.55)",
                marginBottom: 4,
              }}
            >
              {dog.breed ?? ""}
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                fontSize: 38,
                letterSpacing: "-0.025em",
                color: "#fff",
                lineHeight: 0.95,
              }}
            >
              {dog.name}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--orange)",
                marginTop: 8,
                fontWeight: 600,
                letterSpacing: "0.01em",
              }}
            >
              {[
                dog.sex,
                dog.age_months != null ? ageLabel(dog.age_months) : null,
                dog.neutered === "yes" ? "neutered" : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div
          style={{
            padding: 16,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
          }}
        >
          {stats.map((s) => (
            <div
              key={s.label}
              style={{
                background: "var(--cream-light)",
                borderRadius: 12,
                padding: "10px 12px",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--ink-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                {s.icon} {s.label}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 400,
                  fontSize: 18,
                  letterSpacing: "-0.02em",
                  color: "var(--forest)",
                  marginTop: 4,
                  lineHeight: 1,
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Health notes */}
        {dog.health_issues.length > 0 && (
          <div style={{ padding: "0 16px 14px" }}>
            <div className="page-eyebrow" style={{ marginBottom: 6 }}>
              Health notes
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {dog.health_issues.map((h) => (
                <span
                  key={h}
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: "rgba(212,146,90,0.14)",
                    color: "#8C5A2A",
                  }}
                >
                  {h}
                </span>
              ))}
            </div>
          </div>
        )}

        {!editing ? (
          <button
            type="button"
            onClick={onEdit}
            style={{
              width: "100%",
              padding: "14px 16px",
              textAlign: "left",
              background: "var(--cream-light)",
              border: "none",
              borderTop: "1px solid var(--line-soft)",
              color: "var(--forest)",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "-0.01em",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Edit size={14} strokeWidth={2} /> Edit profile
            </span>
            <ChevronRight size={16} strokeWidth={2} />
          </button>
        ) : (
          <div style={{ padding: 16, borderTop: "1px solid var(--line-soft)" }}>
            <div className="page-eyebrow" style={{ marginBottom: 10 }}>
              Edit profile
            </div>
            <div
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
            >
              <div>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--ink-muted)",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={form.weight_kg ?? ""}
                  onChange={(e) => onChange({ weight_kg: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1.5px solid var(--line)",
                    background: "#fff",
                    fontSize: 14,
                    color: "var(--ink)",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--ink-muted)",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Activity
                </label>
                <select
                  value={form.activity_level ?? ""}
                  onChange={(e) => onChange({ activity_level: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1.5px solid var(--line)",
                    background: "#fff",
                    fontSize: 14,
                    color: "var(--ink)",
                  }}
                >
                  <option value="">Select…</option>
                  {Object.entries(ACTIVITY_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={onSave}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button type="button" className="btn btn-ghost" onClick={onCancel}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recipe rotation */}
      {recipes.length > 0 && (
        <div>
          <div style={{ padding: "0 4px", marginBottom: 10 }}>
            <div className="page-eyebrow">{dog.name}'s recipe rotation</div>
          </div>
          <DragScroll>
            {recipes.map((r) => (
              <RecipeCard key={r.recipe_id} recipe={r} dog={dog} />
            ))}
          </DragScroll>
        </div>
      )}
    </div>
  );
}

export default function DogsPage() {
  const accountQuery = useApiQuery<{ dogs: Dog[] }>("/api/portal/account");
  const recipesQuery = useApiQuery<{ recipes: Recipe[] }>("/api/portal/recipe-stack");

  const dogs = accountQuery.data?.dogs ?? [];
  const recipes = recipesQuery.data?.recipes ?? [];
  const loading = accountQuery.loading && !accountQuery.data;
  const error = accountQuery.error;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Dog>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  function startEdit(dog: Dog) {
    setEditingId(dog.id);
    setForm({
      weight_kg: dog.weight_kg,
      activity_level: dog.activity_level,
      body_condition: dog.body_condition,
    });
  }

  async function saveDog(id: string) {
    setSaving(true);
    setSaveError("");
    try {
      await api.patch(`/api/portal/dogs/${id}`, form);
      // Optimistic local update + invalidate so next read reflects the change.
      const nextDogs = dogs.map((d) => (d.id === id ? { ...d, ...form } : d));
      setCache("/api/portal/account", { ...(accountQuery.data ?? {}), dogs: nextDogs });
      invalidateCache("/api/portal/recipe-stack");
      accountQuery.refetch();
      setEditingId(null);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className="cream-paper min-h-screen flex items-center justify-center text-ink-muted">
        Loading…
      </div>
    );
  if (error || saveError)
    return (
      <div className="cream-paper min-h-screen flex items-center justify-center text-terracotta">
        {error || saveError}
      </div>
    );

  return (
    <div
      className="screen cream-paper"
      style={{ padding: 20, display: "flex", flexDirection: "column", gap: 18 }}
    >
      <div style={{ padding: "8px 4px 0" }}>
        <div className="page-eyebrow" style={{ marginBottom: 4 }}>
          The pack
        </div>
        <h1 className="page-h1">My dogs</h1>
      </div>

      {dogs.length === 0 && (
        <p style={{ color: "var(--ink-muted)", padding: "0 4px" }}>No dogs found.</p>
      )}

      {dogs.map((dog) => (
        <DogBlock
          key={dog.id}
          dog={dog}
          recipes={recipes}
          editing={editingId === dog.id}
          saving={saving}
          form={form}
          onEdit={() => startEdit(dog)}
          onCancel={() => setEditingId(null)}
          onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
          onSave={() => saveDog(dog.id)}
        />
      ))}

      <div style={{ height: 12 }} />
    </div>
  );
}
