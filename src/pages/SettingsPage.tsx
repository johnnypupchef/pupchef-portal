import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

interface ProfileData {
  first_name: string | null; last_name: string | null; phone: string | null;
  area: string | null; address_line_1: string | null; address_line_2: string | null;
  city: string | null; emirate: string | null;
}

const EMIRATES = ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"];

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-cream-dark shadow-sm p-5 space-y-4">
      <h2 className="font-heading font-bold text-brand">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-brand/60 font-body font-medium block mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputClass = "w-full border border-cream-dark rounded-xl px-4 py-3 text-sm text-brand bg-cream focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral transition font-body";

export default function SettingsPage() {
  const { person } = useAuth();
  const [form, setForm] = useState<ProfileData>({
    first_name: null, last_name: null, phone: null,
    area: null, address_line_1: null, address_line_2: null, city: null, emirate: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<{ person: ProfileData & { email: string } }>("/api/portal/account")
      .then((d) => setForm({
        first_name: d.person.first_name,
        last_name: d.person.last_name,
        phone: d.person.phone,
        area: d.person.area,
        address_line_1: d.person.address_line_1,
        address_line_2: d.person.address_line_2,
        city: d.person.city,
        emirate: d.person.emirate,
      }))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      await api.patch("/api/portal/profile", form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function set(field: keyof ProfileData, value: string) {
    setForm((f) => ({ ...f, [field]: value || null }));
  }

  if (loading) return <div className="text-center py-16 text-brand/40 font-body">Loading…</div>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading font-extrabold text-2xl text-brand">Settings</h1>
        <p className="text-sm text-brand/50 font-body mt-0.5">{person?.email}</p>
      </div>

      {saved && (
        <div className="bg-forest/10 border border-forest/20 rounded-xl p-3 text-sm text-forest font-body font-medium">
          ✓ Profile updated successfully
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 font-body">{error}</div>
      )}

      <form onSubmit={save} className="space-y-5">
        <SectionCard title="Personal Info">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name">
              <input type="text" value={form.first_name ?? ""} onChange={(e) => set("first_name", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Last name">
              <input type="text" value={form.last_name ?? ""} onChange={(e) => set("last_name", e.target.value)} className={inputClass} />
            </Field>
          </div>
          <Field label="Phone">
            <input type="tel" value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Area / Neighbourhood">
            <input type="text" value={form.area ?? ""} onChange={(e) => set("area", e.target.value)} className={inputClass} />
          </Field>
        </SectionCard>

        <SectionCard title="Delivery Address">
          <Field label="Address line 1">
            <input
              type="text" value={form.address_line_1 ?? ""}
              onChange={(e) => set("address_line_1", e.target.value)}
              placeholder="Villa / Apt number, building name"
              className={inputClass}
            />
          </Field>
          <Field label="Address line 2">
            <input
              type="text" value={form.address_line_2 ?? ""}
              onChange={(e) => set("address_line_2", e.target.value)}
              placeholder="Street, community"
              className={inputClass}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="City">
              <input type="text" value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Emirate">
              <select value={form.emirate ?? ""} onChange={(e) => set("emirate", e.target.value)} className={inputClass}>
                <option value="">Select…</option>
                {EMIRATES.map((em) => <option key={em} value={em}>{em}</option>)}
              </select>
            </Field>
          </div>
        </SectionCard>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-coral text-white rounded-2xl py-4 text-sm font-heading font-bold hover:bg-coral-dark disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
