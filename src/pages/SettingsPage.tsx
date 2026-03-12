import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

interface ProfileData {
  first_name: string | null; last_name: string | null; phone: string | null;
  area: string | null; address_line_1: string | null; address_line_2: string | null;
  city: string | null; emirate: string | null;
}

const EMIRATES = ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"];

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
      .then((d) => {
        setForm({
          first_name: d.person.first_name,
          last_name: d.person.last_name,
          phone: d.person.phone,
          area: d.person.area,
          address_line_1: d.person.address_line_1,
          address_line_2: d.person.address_line_2,
          city: d.person.city,
          emirate: d.person.emirate,
        });
      })
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

  if (loading) return <div className="text-center py-16 text-gray-400">Loading…</div>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">{person?.email}</p>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
          ✓ Profile updated successfully
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={save} className="space-y-5">
        {/* Personal info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Personal Info</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 font-medium">First name</label>
              <input
                type="text" value={form.first_name ?? ""}
                onChange={(e) => set("first_name", e.target.value)}
                className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 font-medium">Last name</label>
              <input
                type="text" value={form.last_name ?? ""}
                onChange={(e) => set("last_name", e.target.value)}
                className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600 font-medium">Phone</label>
            <input
              type="tel" value={form.phone ?? ""}
              onChange={(e) => set("phone", e.target.value)}
              className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 font-medium">Area / Neighbourhood</label>
            <input
              type="text" value={form.area ?? ""}
              onChange={(e) => set("area", e.target.value)}
              className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        </div>

        {/* Delivery address */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Delivery Address</h2>
          <div>
            <label className="text-xs text-gray-600 font-medium">Address line 1</label>
            <input
              type="text" value={form.address_line_1 ?? ""}
              onChange={(e) => set("address_line_1", e.target.value)}
              placeholder="Villa / Apt number, building name"
              className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 font-medium">Address line 2</label>
            <input
              type="text" value={form.address_line_2 ?? ""}
              onChange={(e) => set("address_line_2", e.target.value)}
              placeholder="Street, community"
              className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 font-medium">City</label>
              <input
                type="text" value={form.city ?? ""}
                onChange={(e) => set("city", e.target.value)}
                className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 font-medium">Emirate</label>
              <select
                value={form.emirate ?? ""}
                onChange={(e) => set("emirate", e.target.value)}
                className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="">Select…</option>
                {EMIRATES.map((em) => <option key={em} value={em}>{em}</option>)}
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-orange-500 text-white rounded-2xl py-3 text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
