import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User as UserIcon,
  Phone as PhoneIcon,
  MapPin,
  Check,
  Edit,
  Bell,
  Leaf,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { Card, SectionHeader } from "../components/portal-ui";

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

const inputClass =
  "w-full bg-white border border-line rounded-[12px] px-4 py-3 text-sm text-ink focus:outline-none focus:border-orange/50 transition";

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

  const mapDivRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const pinLatRef = useRef<number>(initialLat ?? 25.2048);
  const pinLngRef = useRef<number>(initialLng ?? 55.2708);
  const geoCity = useRef("Dubai");
  const geoEmirate = useRef("Dubai");
  const isDragging = useRef(false);

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

  useEffect(() => {
    if (step === "map" && mapRef.current && !useFallbackMap) {
      google.maps.event.trigger(mapRef.current, "resize");
    }
  }, [step, useFallbackMap]);

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
        // ignore
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
      () => {},
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
      {step === "map" && (
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 px-4 pt-4 pb-2">
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-cream-light border border-line text-ink font-bold text-lg"
            >
              ←
            </button>
            <h2 className="font-display font-normal text-forest text-xl">Set delivery location</h2>
          </div>
          <p className="px-4 text-xs text-ink-muted mb-2">
            Please be precise — we use this pin for your deliveries.
          </p>
          {mapError && (
            <p className="px-4 text-xs text-terracotta mb-2">{mapError}</p>
          )}

          <div className="relative flex-1 mx-4 rounded-[20px] overflow-hidden shadow-md bg-gray-200">
            <div className="absolute top-3 left-3 right-3 z-20">
              <div className="flex items-center bg-white rounded-xl shadow-lg px-3">
                <span className="text-sm opacity-50 mr-2">🔍</span>
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search address, building or community…"
                  className="flex-1 py-3 text-sm bg-transparent outline-none text-ink"
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
                <div className="mt-2 bg-white rounded-xl shadow-lg border border-line overflow-hidden max-h-56 overflow-y-auto">
                  {fallbackSuggestions.map((s) => (
                    <button
                      key={s.place_id}
                      type="button"
                      className="w-full text-left px-3 py-2 text-xs text-ink hover:bg-cream-light border-b border-line last:border-0"
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
            {!useFallbackMap && (
              <>
                <div ref={mapDivRef} style={{ width: "100%", height: "100%" }} />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center" style={{ bottom: 64 }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 28 40"
                    style={{ width: 36, transform: "translateY(-50%)", filter: "drop-shadow(0 4px 8px rgba(0,0,0,.3))" }}
                  >
                    <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 26 14 26S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="#F2674B" />
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
                  pathOptions={{ color: "#173B33", fillColor: "#F2674B", fillOpacity: 0.85 }}
                />
              </MapContainer>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-line px-3 py-2 flex items-center gap-2" style={{ minHeight: 56 }}>
              <div className="w-8 h-8 rounded-lg bg-cream-light flex items-center justify-center text-sm flex-shrink-0">📍</div>
              <span className="flex-1 text-xs text-ink-muted leading-tight">{placeName}</span>
              <button
                onClick={handleMapNext}
                disabled={Boolean(mapError) && !useFallbackMap}
                className="flex-shrink-0 btn btn-primary"
                style={{ padding: "8px 18px", fontSize: 13 }}
              >
                Next
              </button>
            </div>
          </div>
          <div className="h-4" />
        </div>
      )}

      {step === "type" && (
        <div className="flex flex-col h-full px-4 pt-4">
          <button
            onClick={() => setStep("map")}
            className="text-ink-muted text-sm mb-4 text-left"
          >
            ← Back
          </button>
          <h2 className="font-display font-normal text-forest text-2xl mb-5">Choose address type</h2>
          <div className="border border-line rounded-[20px] overflow-hidden bg-white">
            {(
              [
                { type: "apartment" as AddrType, label: "Apartment" },
                { type: "house" as AddrType, label: "House / Villa" },
              ] as const
            ).map(({ type, label }) => (
              <button
                key={type}
                onClick={() => handleSelectType(type)}
                className="flex items-center gap-4 w-full px-5 py-4 bg-white border-b border-line-soft last:border-0 text-left hover:bg-cream-light transition-colors"
              >
                <span className="w-10 h-10 bg-cream rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} strokeWidth={2} className="text-forest" />
                </span>
                <span className="flex-1 text-ink text-base font-bold">{label}</span>
                <ChevronRight size={16} className="text-ink-faint" />
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "details" && (
        <div className="flex flex-col h-full px-4 pt-4">
          <button
            onClick={() => setStep("type")}
            className="text-ink-muted text-sm mb-4 text-left"
          >
            ← Back
          </button>
          <h2 className="font-display font-normal text-forest text-2xl mb-5">Add address details</h2>

          <div className="space-y-3 flex-1">
            {addrType === "apartment" ? (
              <>
                <input className={inputClass} placeholder="Apartment number *" value={aptNum} onChange={(e) => setAptNum(e.target.value)} />
                <input className={inputClass} placeholder="Building name *" value={bldName} onChange={(e) => setBldName(e.target.value)} />
                <input className={inputClass} placeholder="Area / Community *" value={aptArea} onChange={(e) => setAptArea(e.target.value)} />
              </>
            ) : (
              <>
                <input className={inputClass} placeholder="House / Villa number *" value={villaNum} onChange={(e) => setVillaNum(e.target.value)} />
                <input className={inputClass} placeholder="Street name (optional)" value={streetName} onChange={(e) => setStreetName(e.target.value)} />
                <input className={inputClass} placeholder="Community *" value={community} onChange={(e) => setCommunity(e.target.value)} />
              </>
            )}
            {detailError && (
              <p className="text-xs text-terracotta">{detailError}</p>
            )}
          </div>

          <div className="pb-6 pt-4">
            <button
              onClick={handleConfirm}
              className="btn btn-primary w-full"
            >
              Confirm address
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Inline editable row ────────────────────────────────────────────────────────

function InlineFieldRow({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  isLast,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  isLast?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 0",
        borderBottom: isLast ? "none" : "1px solid var(--line-soft)",
      }}
    >
      <div style={{ color: "var(--ink-muted)", flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--ink-muted)",
          }}
        >
          {label}
        </div>
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            background: "transparent",
            padding: 0,
            marginTop: 2,
            fontSize: 14,
            color: "var(--ink)",
            fontWeight: 600,
            fontFamily: "inherit",
          }}
        />
      </div>
    </div>
  );
}

// ── Mini map preview using Google Static Maps ──────────────────────────────────

function MiniMapPreview({ lat, lng }: { lat: number | null; lng: number | null }) {
  // No pin set yet — render the soft placeholder.
  if (lat == null || lng == null) {
    return (
      <div
        style={{
          margin: "0 18px 16px",
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid var(--line)",
          position: "relative",
          height: 120,
          background: "linear-gradient(135deg, #DDE5DC 0%, #C9D5C8 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--ink-muted)",
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        Set your pin to preview the map
      </div>
    );
  }

  // 2x scale for retina; marker color matches our orange brand.
  const center = `${lat},${lng}`;
  const url =
    `https://maps.googleapis.com/maps/api/staticmap` +
    `?center=${center}` +
    `&zoom=16` +
    `&size=320x120` +
    `&scale=2` +
    `&maptype=roadmap` +
    `&markers=color:0xF2674B%7C${center}` +
    `&key=${MAPS_API_KEY}`;

  return (
    <div
      style={{
        margin: "0 18px 16px",
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid var(--line)",
        position: "relative",
        height: 120,
        background: "linear-gradient(135deg, #DDE5DC 0%, #C9D5C8 100%)",
      }}
    >
      <img
        src={url}
        alt="Delivery location"
        loading="lazy"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </div>
  );
}

// ── Main settings page ─────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { person, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<ProfileData>({
    first_name: null,
    last_name: null,
    phone: null,
    area: null,
    address_line_1: null,
    address_line_2: null,
    city: null,
    emirate: null,
    latitude: null,
    longitude: null,
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

  async function handleSignOut() {
    try {
      await api.post("/api/portal/logout");
    } catch {
      /* optional */
    }
    await logout();
    navigate("/login");
  }

  function set(field: keyof ProfileData, value: string) {
    setForm((f) => ({ ...f, [field]: value || null }));
  }

  function handleAddressSaved(result: AddressResult) {
    const next = {
      ...form,
      address_line_1: result.address_line_1,
      address_line_2: result.address_line_2,
      area: result.area,
      city: result.city,
      emirate: result.emirate,
      latitude: result.latitude,
      longitude: result.longitude,
    };
    setForm(next);
    setShowAddressPicker(false);
    api.patch("/api/portal/profile", next).catch(() => {});
  }

  if (loading)
    return (
      <div className="cream-paper min-h-screen flex items-center justify-center text-ink-muted">
        Loading…
      </div>
    );

  const pinSet = form.latitude != null && form.longitude != null;

  return (
    <>
      {showAddressPicker && (
        <AddressPickerModal
          onClose={() => setShowAddressPicker(false)}
          onSave={handleAddressSaved}
          initialLat={form.latitude}
          initialLng={form.longitude}
        />
      )}

      <div
        className="screen cream-paper"
        style={{ padding: 20, display: "flex", flexDirection: "column", gap: 18 }}
      >
        <div style={{ padding: "8px 4px 0" }}>
          <div className="page-eyebrow" style={{ marginBottom: 4 }}>
            Account
          </div>
          <h1 className="page-h1">Settings</h1>
          <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: "8px 0 0" }}>
            {person?.email}
          </p>
        </div>

        {saved && (
          <div
            style={{
              background: "rgba(143,166,138,0.16)",
              color: "#4A6646",
              border: "1px solid rgba(143,166,138,0.3)",
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            ✓ Profile updated
          </div>
        )}
        {error && (
          <div
            style={{
              background: "rgba(200,84,58,0.08)",
              color: "var(--terracotta)",
              border: "1px solid rgba(200,84,58,0.2)",
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <SectionHeader title="Personal info" />
            <Card padding="6px 18px">
              <InlineFieldRow
                icon={<UserIcon size={16} />}
                label="First name"
                value={form.first_name ?? ""}
                onChange={(v) => set("first_name", v)}
                placeholder="First name"
              />
              <InlineFieldRow
                icon={<UserIcon size={16} />}
                label="Last name"
                value={form.last_name ?? ""}
                onChange={(v) => set("last_name", v)}
                placeholder="Last name"
              />
              <InlineFieldRow
                icon={<PhoneIcon size={16} />}
                label="Phone"
                value={form.phone ?? ""}
                onChange={(v) => set("phone", v)}
                placeholder="+971 …"
                type="tel"
                isLast
              />
            </Card>
          </div>

          <div>
            <SectionHeader title="Delivery address" />
            <Card padding="0">
              <div
                style={{
                  padding: "16px 18px",
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "var(--cream)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--forest)",
                    flexShrink: 0,
                  }}
                >
                  <MapPin size={20} strokeWidth={2} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {form.address_line_1 ? (
                    <>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>
                        {form.address_line_1}
                      </div>
                      {(form.address_line_2 || form.city) && (
                        <div
                          style={{
                            fontSize: 13,
                            color: "var(--ink-muted)",
                            marginTop: 2,
                          }}
                        >
                          {[form.address_line_2, form.city].filter(Boolean).join(", ")}
                        </div>
                      )}
                      {pinSet && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--sage)",
                            fontWeight: 600,
                            marginTop: 8,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Check size={12} strokeWidth={2.5} /> Pin set on map
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>
                      No delivery address saved yet.
                    </div>
                  )}
                </div>
              </div>
              <MiniMapPreview lat={form.latitude} lng={form.longitude} />
              <button
                type="button"
                className="btn btn-ghost"
                style={{ width: "calc(100% - 36px)", margin: "0 18px 18px" }}
                onClick={() => setShowAddressPicker(true)}
              >
                <Edit size={16} strokeWidth={2} />
                {form.address_line_1 ? "Update address" : "Add address"}
              </button>
            </Card>
          </div>

          <div>
            <SectionHeader title="Preferences" />
            <Card padding="6px 18px">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 0",
                  borderBottom: "1px solid var(--line-soft)",
                }}
              >
                <div style={{ color: "var(--ink-muted)" }}>
                  <Bell size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--ink-muted)",
                    }}
                  >
                    Notifications
                  </div>
                  <div style={{ fontSize: 14, color: "var(--ink)", fontWeight: 600, marginTop: 2 }}>
                    Email & push
                  </div>
                </div>
                <ChevronRight size={16} color="var(--ink-faint)" />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 0",
                }}
              >
                <div style={{ color: "var(--ink-muted)" }}>
                  <Leaf size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--ink-muted)",
                    }}
                  >
                    Packaging
                  </div>
                  <div style={{ fontSize: 14, color: "var(--ink)", fontWeight: 600, marginTop: 2 }}>
                    Recyclable cool box
                  </div>
                </div>
                <ChevronRight size={16} color="var(--ink-faint)" />
              </div>
            </Card>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%" }}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            style={{ width: "100%", marginTop: 4 }}
            onClick={handleSignOut}
          >
            <LogOut size={16} strokeWidth={2} /> Sign out
          </button>
        </form>

        <div style={{ height: 8 }} />
      </div>
    </>
  );
}
