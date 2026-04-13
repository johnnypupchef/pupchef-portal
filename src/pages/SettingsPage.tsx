import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ProfileData {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  area: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  emirate: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface AddressResult {
  address_line_1: string;
  address_line_2: string;
  area: string;
  city: string;
  emirate: string;
  latitude: number;
  longitude: number;
}

// ── Shared components ─────────────────────────────────────────────────────────

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

const inputClass =
  "w-full border border-cream-dark rounded-xl px-4 py-3 text-sm text-brand bg-cream focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral transition font-body";

// ── Google Maps helpers ────────────────────────────────────────────────────────

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyB0EtbCcH9jM9KSIckCzlsPMaJnF9Ys3wM";
const MAPS_SCRIPT_ID = "pc-portal-google-maps-js";
let mapsScriptLoaded = false;
let mapsReady = false;
let mapsLoadError: string | null = null;
const mapsReadyCallbacks: (() => void)[] = [];
const mapsErrorCallbacks: ((message: string) => void)[] = [];

function resolveMapsReady() {
  mapsReady = true;
  mapsLoadError = null;
  mapsReadyCallbacks.forEach((fn) => fn());
  mapsReadyCallbacks.length = 0;
  mapsErrorCallbacks.length = 0;
}

function rejectMapsLoad(message: string) {
  mapsLoadError = message;
  mapsErrorCallbacks.forEach((fn) => fn(message));
  mapsErrorCallbacks.length = 0;
}

function ensureGoogleMaps(cb: () => void, onError?: (message: string) => void) {
  if (!MAPS_API_KEY) {
    onError?.("Google Maps key is missing.");
    return;
  }
  if ((window as any).google?.maps) {
    resolveMapsReady();
    cb();
    return;
  }
  if (mapsReady) { cb(); return; }
  if (mapsLoadError) {
    onError?.(mapsLoadError);
    return;
  }

  mapsReadyCallbacks.push(cb);
  if (onError) mapsErrorCallbacks.push(onError);
  if (mapsScriptLoaded) return;
  mapsScriptLoaded = true;

  (window as any).__portalInitGoogleMaps = () => {
    resolveMapsReady();
  };

  const existing = document.getElementById(MAPS_SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    existing.addEventListener(
      "load",
      () => {
        if ((window as any).google?.maps) resolveMapsReady();
      },
      { once: true }
    );
    existing.addEventListener(
      "error",
      () => {
        rejectMapsLoad("Failed to load Google Maps script.");
      },
      { once: true }
    );
    return;
  }

  const s = document.createElement("script");
  s.id = MAPS_SCRIPT_ID;
  s.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=places&callback=__portalInitGoogleMaps&loading=async`;
  s.async = true;
  s.defer = true;
  s.onerror = () => {
    rejectMapsLoad("Failed to load Google Maps. Please try again.");
  };
  window.setTimeout(() => {
    if (!mapsReady && !(window as any).google?.maps) {
      rejectMapsLoad("Google Maps did not initialize.");
    }
  }, 8000);
  document.head.appendChild(s);
}

function getAddressComponent(
  comps: google.maps.GeocoderAddressComponent[],
  types: string[]
): string {
  for (const type of types) {
    const found = comps.find((c) => c.types.includes(type));
    if (found) return found.long_name;
  }
  return "";
}

type NominatimSuggestion = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

function LeafletRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
}

function LeafletClickCapture({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// ── Address picker modal ───────────────────────────────────────────────────────

type AddrStep = "map" | "type" | "details";
type AddrType = "apartment" | "house";

function AddressPickerModal({
  onClose,
  onSave,
  initialLat,
  initialLng,
}: {
  onClose: () => void;
  onSave: (result: AddressResult) => void;
  initialLat: number | null;
  initialLng: number | null;
}) {
  const [step, setStep] = useState<AddrStep>("map");
  const [addrType, setAddrType] = useState<AddrType>("apartment");
  const [placeName, setPlaceName] = useState("Locating your position…");

  // Map state
  const mapDivRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const pinLatRef = useRef<number>(initialLat ?? 25.2048);
  const pinLngRef = useRef<number>(initialLng ?? 55.2708);
  const geoCity = useRef("Dubai");
  const geoEmirate = useRef("Dubai");
  const isDragging = useRef(false);

  // Detail fields
  const [aptNum, setAptNum] = useState("");
  const [bldName, setBldName] = useState("");
  const [aptArea, setAptArea] = useState("");
  const [villaNum, setVillaNum] = useState("");
  const [streetName, setStreetName] = useState("");
  const [community, setCommunity] = useState("");
  const [detailError, setDetailError] = useState("");
  const [mapError, setMapError] = useState("");
  const [useFallbackMap, setUseFallbackMap] = useState(false);
  const [fallbackCenter, setFallbackCenter] = useState<[number, number]>([
    initialLat ?? 25.2048,
    initialLng ?? 55.2708,
  ]);
  const [fallbackQuery, setFallbackQuery] = useState("");
  const [fallbackSuggestions, setFallbackSuggestions] = useState<NominatimSuggestion[]>([]);
  const fallbackInitialized = useRef(false);

  // Init Google Maps when the modal mounts
  useEffect(() => {
    ensureGoogleMaps(
      () => initMap(),
      (message) => {
        setMapError(message);
        setUseFallbackMap(true);
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-trigger resize when returning to map step
  useEffect(() => {
    if (step === "map" && mapRef.current && !useFallbackMap) {
      google.maps.event.trigger(mapRef.current, "resize");
    }
  }, [step, useFallbackMap]);

  // Fallback search suggestions via Nominatim
  useEffect(() => {
    if (!useFallbackMap) return;
    const q = fallbackQuery.trim();
    if (q.length < 3) {
      setFallbackSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=ae&limit=5&q=${encodeURIComponent(q)}`,
          { signal: controller.signal }
        );
        if (!res.ok) return;
        const data = (await res.json()) as NominatimSuggestion[];
        setFallbackSuggestions(Array.isArray(data) ? data : []);
      } catch {
        // ignore transient network errors for suggestion typing
      }
    }, 260);

    return () => {
      controller.abort();
      window.clearTimeout(t);
    };
  }, [fallbackQuery, useFallbackMap]);

  useEffect(() => {
    if (!useFallbackMap || fallbackInitialized.current) return;
    fallbackInitialized.current = true;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        pinLatRef.current = lat;
        pinLngRef.current = lng;
        setFallbackCenter([lat, lng]);
        await reverseGeocodeFallback(lat, lng);
      },
      () => {
        // keep Dubai fallback center
      },
      { timeout: 6000, maximumAge: 0 }
    );
  }, [useFallbackMap]);

  function extractCityEmirate(comps: google.maps.GeocoderAddressComponent[]) {
    const loc = getAddressComponent(comps, ["locality", "administrative_area_level_2"]);
    const em = getAddressComponent(comps, ["administrative_area_level_1"]);
    if (loc) geoCity.current = loc;
    if (em) geoEmirate.current = em;
  }

  function reverseGeocode(lat: number, lng: number) {
    if (!geocoderRef.current) return;
    geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results && results.length > 0) {
        extractCityEmirate(results[0].address_components);
        const premise = getAddressComponent(results[0].address_components, [
          "premise", "establishment", "point_of_interest",
        ]);
        setPlaceName(premise || results[0].formatted_address || "Dubai, UAE");
      } else {
        setPlaceName("Dubai, UAE");
      }
    });
  }

  async function reverseGeocodeFallback(lat: number, lng: number) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      if (!res.ok) return;
      const data = (await res.json()) as {
        display_name?: string;
        address?: Record<string, string>;
      };
      const address = data.address || {};
      const city = address.city || address.town || address.village || address.municipality;
      const state = address.state || address.state_district;
      if (city) geoCity.current = city;
      if (state) geoEmirate.current = state;
      setPlaceName(data.display_name || "Selected location");
    } catch {
      setPlaceName("Selected location");
    }
  }

  function initMap() {
    if (!mapDivRef.current || !searchRef.current) return;
    if (mapRef.current) return;
    if (!(window as any).google?.maps) {
      setMapError("Google Maps unavailable. Using backup map.");
      setUseFallbackMap(true);
      return;
    }

    const center = { lat: pinLatRef.current, lng: pinLngRef.current };
    const map = new google.maps.Map(mapDivRef.current, {
      center,
      zoom: initialLat != null ? 17 : 15,
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: "greedy",
    });
    mapRef.current = map;
    geocoderRef.current = new google.maps.Geocoder();

    const autocomplete = new google.maps.places.Autocomplete(searchRef.current!, {
      componentRestrictions: { country: "ae" },
      fields: ["geometry", "address_components", "formatted_address", "name"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry?.location) return;
      isDragging.current = false;
      map.panTo(place.geometry.location);
      map.setZoom(17);
      pinLatRef.current = place.geometry.location.lat();
      pinLngRef.current = place.geometry.location.lng();
      if (place.address_components) extractCityEmirate(place.address_components);
      setPlaceName(place.name || place.formatted_address || "");
    });

    map.addListener("dragstart", () => { isDragging.current = true; });
    map.addListener("idle", () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      const c = map.getCenter()!;
      pinLatRef.current = c.lat();
      pinLngRef.current = c.lng();
      reverseGeocode(c.lat(), c.lng());
    });

    // Auto-geolocate if no initial coords
    if (initialLat == null && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude, lng = pos.coords.longitude;
          map.setCenter({ lat, lng });
          map.setZoom(17);
          pinLatRef.current = lat;
          pinLngRef.current = lng;
          reverseGeocode(lat, lng);
        },
        () => {
          setPlaceName("Dubai, UAE");
          reverseGeocode(center.lat, center.lng);
        },
        { timeout: 6000 }
      );
    } else if (initialLat != null) {
      reverseGeocode(initialLat, initialLng!);
    } else {
      setPlaceName("Dubai, UAE");
    }
  }

  function handleMapNext() {
    setStep("type");
  }

  function handleSelectType(type: AddrType) {
    setAddrType(type);
    setDetailError("");
    setStep("details");
  }

  function handleConfirm() {
    setDetailError("");
    if (addrType === "apartment") {
      if (!aptNum.trim()) { setDetailError("Please enter your apartment number."); return; }
      if (!bldName.trim()) { setDetailError("Please enter your building name."); return; }
      if (!aptArea.trim()) { setDetailError("Please enter your area / community."); return; }
    } else {
      if (!villaNum.trim()) { setDetailError("Please enter your house / villa number."); return; }
      if (!community.trim()) { setDetailError("Please enter your community."); return; }
    }

    let a1 = "", a2 = "", area = "";
    if (addrType === "apartment") {
      a1 = (aptNum ? `Apt ${aptNum}, ` : "") + bldName;
      a2 = aptArea;
      area = aptArea;
    } else {
      a1 = villaNum ? `Villa ${villaNum}` : "";
      a2 = [streetName, community].filter(Boolean).join(", ");
      area = community;
    }

    onSave({
      address_line_1: a1,
      address_line_2: a2,
      area,
      city: geoCity.current || "Dubai",
      emirate: geoEmirate.current || "Dubai",
      latitude: pinLatRef.current,
      longitude: pinLngRef.current,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <style>{`.pac-container{z-index:99999 !important;}`}</style>
      {/* ── Step: Map ── */}
      {step === "map" && (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 pt-4 pb-2">
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-cream border border-cream-dark text-brand font-bold text-lg"
            >
              ←
            </button>
            <h2 className="font-heading font-extrabold text-brand text-lg">Set delivery location</h2>
          </div>
          <p className="px-4 text-xs text-brand/50 font-body mb-2">
            📍 Please be precise — we use this pin for your deliveries.
          </p>
          {mapError && (
            <p className="px-4 text-xs text-red-600 font-body mb-2">{mapError}</p>
          )}

          {/* Map */}
          <div className="relative flex-1 mx-4 rounded-2xl overflow-hidden shadow-md bg-gray-200">
            {/* Floating search */}
            <div className="absolute top-3 left-3 right-3 z-20">
              <div className="flex items-center bg-white rounded-xl shadow-lg px-3">
              <span className="text-sm opacity-50 mr-2">🔍</span>
              <input
                ref={searchRef}
                type="text"
                placeholder="Search address, building or community…"
                className="flex-1 py-3 text-sm bg-transparent outline-none text-brand font-body"
                autoComplete="off"
                disabled={Boolean(mapError) && !useFallbackMap}
                value={useFallbackMap ? fallbackQuery : undefined}
                onChange={
                  useFallbackMap
                    ? (e) => setFallbackQuery(e.target.value)
                    : undefined
                }
              />
            </div>
              {useFallbackMap && fallbackSuggestions.length > 0 && (
                <div className="mt-2 bg-white rounded-xl shadow-lg border border-cream-dark overflow-hidden max-h-56 overflow-y-auto">
                  {fallbackSuggestions.map((s) => (
                    <button
                      key={s.place_id}
                      type="button"
                      className="w-full text-left px-3 py-2 text-xs text-brand hover:bg-cream border-b border-cream-dark last:border-0"
                      onClick={async () => {
                        const lat = Number(s.lat);
                        const lng = Number(s.lon);
                        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
                        pinLatRef.current = lat;
                        pinLngRef.current = lng;
                        setFallbackCenter([lat, lng]);
                        setPlaceName(s.display_name);
                        setFallbackQuery(s.display_name);
                        setFallbackSuggestions([]);
                        await reverseGeocodeFallback(lat, lng);
                      }}
                    >
                      {s.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Map canvas */}
            {!useFallbackMap && (
              <>
                <div ref={mapDivRef} style={{ width: "100%", height: "100%" }} />
                {/* Fixed center pin */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center" style={{ bottom: 64 }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 28 40"
                    style={{ width: 36, transform: "translateY(-50%)", filter: "drop-shadow(0 4px 8px rgba(0,0,0,.3))" }}
                  >
                    <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 26 14 26S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="#E63946" />
                    <circle cx="14" cy="14" r="5.5" fill="#fff" />
                  </svg>
                </div>
              </>
            )}
            {useFallbackMap && (
              <MapContainer
                center={fallbackCenter}
                zoom={14}
                style={{ width: "100%", height: "100%" }}
                attributionControl={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LeafletRecenter lat={fallbackCenter[0]} lng={fallbackCenter[1]} />
                <LeafletClickCapture
                  onPick={async (lat, lng) => {
                    pinLatRef.current = lat;
                    pinLngRef.current = lng;
                    setFallbackCenter([lat, lng]);
                    await reverseGeocodeFallback(lat, lng);
                  }}
                />
                <CircleMarker
                  center={fallbackCenter}
                  radius={10}
                  pathOptions={{ color: "#0f766e", fillColor: "#14b8a6", fillOpacity: 0.85 }}
                />
              </MapContainer>
            )}
            {/* Bottom place card */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-3 py-2 flex items-center gap-2" style={{ minHeight: 56 }}>
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm flex-shrink-0">📍</div>
              <span className="flex-1 text-xs text-gray-600 font-body leading-tight">{placeName}</span>
              <button
                onClick={handleMapNext}
                disabled={Boolean(mapError) && !useFallbackMap}
                className="flex-shrink-0 bg-brand text-white rounded-xl px-5 py-2 text-sm font-heading font-bold"
              >
                Next
              </button>
            </div>
          </div>
          <div className="h-4" />
        </div>
      )}

      {/* ── Step: Address type ── */}
      {step === "type" && (
        <div className="flex flex-col h-full px-4 pt-4">
          <button
            onClick={() => setStep("map")}
            className="text-brand/60 text-sm font-body font-medium mb-4 text-left"
          >
            ← Back
          </button>
          <h2 className="font-heading font-extrabold text-brand text-xl mb-5">Choose address type</h2>
          <div className="border border-cream-dark rounded-2xl overflow-hidden">
            {(
              [
                {
                  type: "apartment" as AddrType,
                  label: "Apartment",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-brand">
                      <rect x="4" y="2" width="16" height="20" rx="1" />
                      <path d="M9 22v-4h6v4" />
                      <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
                    </svg>
                  ),
                },
                {
                  type: "house" as AddrType,
                  label: "House / Villa",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-brand">
                      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
                      <path d="M9 21V12h6v9" />
                    </svg>
                  ),
                },
              ] as const
            ).map(({ type, label, icon }) => (
              <button
                key={type}
                onClick={() => handleSelectType(type)}
                className="flex items-center gap-4 w-full px-5 py-4 bg-white border-b border-cream-dark last:border-0 text-left hover:bg-cream transition-colors"
              >
                <span className="w-10 h-10 bg-cream rounded-xl flex items-center justify-center flex-shrink-0">
                  {icon}
                </span>
                <span className="flex-1 font-heading font-semibold text-brand text-base">{label}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-brand/30">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Step: Details ── */}
      {step === "details" && (
        <div className="flex flex-col h-full px-4 pt-4">
          <button
            onClick={() => setStep("type")}
            className="text-brand/60 text-sm font-body font-medium mb-4 text-left"
          >
            ← Back
          </button>
          <h2 className="font-heading font-extrabold text-brand text-xl mb-5">Add address details</h2>

          <div className="space-y-3 flex-1">
            {addrType === "apartment" ? (
              <>
                <input
                  className={inputClass}
                  placeholder="Apartment number *"
                  value={aptNum}
                  onChange={(e) => setAptNum(e.target.value)}
                />
                <input
                  className={inputClass}
                  placeholder="Building name *"
                  value={bldName}
                  onChange={(e) => setBldName(e.target.value)}
                />
                <input
                  className={inputClass}
                  placeholder="Area / Community *"
                  value={aptArea}
                  onChange={(e) => setAptArea(e.target.value)}
                />
              </>
            ) : (
              <>
                <input
                  className={inputClass}
                  placeholder="House / Villa number *"
                  value={villaNum}
                  onChange={(e) => setVillaNum(e.target.value)}
                />
                <input
                  className={inputClass}
                  placeholder="Street name (optional)"
                  value={streetName}
                  onChange={(e) => setStreetName(e.target.value)}
                />
                <input
                  className={inputClass}
                  placeholder="Community *"
                  value={community}
                  onChange={(e) => setCommunity(e.target.value)}
                />
              </>
            )}
            {detailError && (
              <p className="text-xs text-red-600 font-body">{detailError}</p>
            )}
          </div>

          <div className="pb-6 pt-4">
            <button
              onClick={handleConfirm}
              className="w-full bg-brand text-white rounded-2xl py-4 text-sm font-heading font-bold hover:bg-brand/90 transition-colors"
            >
              Confirm address
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main settings page ─────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { person } = useAuth();
  const [form, setForm] = useState<ProfileData>({
    first_name: null, last_name: null, phone: null,
    area: null, address_line_1: null, address_line_2: null,
    city: null, emirate: null, latitude: null, longitude: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [showAddressPicker, setShowAddressPicker] = useState(false);

  useEffect(() => {
    api
      .get<{ person: ProfileData & { email: string } }>("/api/portal/account")
      .then((d) =>
        setForm({
          first_name: d.person.first_name,
          last_name: d.person.last_name,
          phone: d.person.phone,
          area: d.person.area,
          address_line_1: d.person.address_line_1,
          address_line_2: d.person.address_line_2,
          city: d.person.city,
          emirate: d.person.emirate,
          latitude: d.person.latitude,
          longitude: d.person.longitude,
        })
      )
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

  function handleAddressSaved(result: AddressResult) {
    setForm((f) => ({
      ...f,
      address_line_1: result.address_line_1,
      address_line_2: result.address_line_2,
      area: result.area,
      city: result.city,
      emirate: result.emirate,
      latitude: result.latitude,
      longitude: result.longitude,
    }));
    setShowAddressPicker(false);
    // Auto-save after address update
    api.patch("/api/portal/profile", {
      ...form,
      address_line_1: result.address_line_1,
      address_line_2: result.address_line_2,
      area: result.area,
      city: result.city,
      emirate: result.emirate,
      latitude: result.latitude,
      longitude: result.longitude,
    }).catch(() => {});
  }

  /** Format address for display in the collapsed card */
  function formatAddress(): string | null {
    const parts = [form.address_line_1, form.address_line_2, form.area]
      .filter(Boolean)
      .join(", ");
    return parts || null;
  }

  if (loading) return <div className="text-center py-16 text-brand/40 font-body">Loading…</div>;

  return (
    <>
      {/* Address picker modal — full-screen */}
      {showAddressPicker && (
        <AddressPickerModal
          onClose={() => setShowAddressPicker(false)}
          onSave={handleAddressSaved}
          initialLat={form.latitude}
          initialLng={form.longitude}
        />
      )}

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
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 font-body">
            {error}
          </div>
        )}

        <form onSubmit={save} className="space-y-5">
          <SectionCard title="Personal Info">
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name">
                <input
                  type="text"
                  value={form.first_name ?? ""}
                  onChange={(e) => set("first_name", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Last name">
                <input
                  type="text"
                  value={form.last_name ?? ""}
                  onChange={(e) => set("last_name", e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
            <Field label="Phone">
              <input
                type="tel"
                value={form.phone ?? ""}
                onChange={(e) => set("phone", e.target.value)}
                className={inputClass}
              />
            </Field>
          </SectionCard>

          {/* ── Delivery address card ── */}
          <SectionCard title="Delivery Address">
            {formatAddress() ? (
              /* Collapsed address display */
              <div className="flex items-start gap-3 bg-cream rounded-xl p-4 border border-cream-dark">
                <div className="w-9 h-9 rounded-xl bg-white border border-cream-dark flex items-center justify-center flex-shrink-0 text-base">
                  📍
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-heading font-semibold text-brand leading-snug">
                    {form.address_line_1}
                  </p>
                  {(form.address_line_2 || form.area) && (
                    <p className="text-xs text-brand/50 font-body mt-0.5">
                      {[form.address_line_2, form.area].filter(Boolean).join(", ")}
                    </p>
                  )}
                  {form.latitude != null && form.longitude != null && (
                    <p className="text-xs text-brand/30 font-body mt-1">
                      Pin set ✓
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddressPicker(true)}
                  className="flex-shrink-0 text-xs font-heading font-semibold text-brand border border-brand/20 rounded-lg px-3 py-1.5 hover:bg-white transition-colors"
                >
                  Edit
                </button>
              </div>
            ) : (
              /* No address yet */
              <div className="text-center py-4">
                <p className="text-sm text-brand/40 font-body mb-3">No delivery address saved yet.</p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowAddressPicker(true)}
              className="w-full border-2 border-dashed border-brand/20 rounded-xl py-3 text-sm font-heading font-semibold text-brand/60 hover:border-brand/40 hover:text-brand/80 transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-base">＋</span>
              {formatAddress() ? "Update Address" : "Add Delivery Address"}
            </button>
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
    </>
  );
}
