import { useNavigate } from "react-router-dom";
import { Truck, ChevronRight, PawPrint, Flame, RefreshCw, MapPin, Check } from "lucide-react";
import { useApiQuery } from "../lib/useApiQuery";
import { getBreedImageSrc, FALLBACK_IMG } from "../lib/breeds";
import {
  Card,
  Pill,
  SectionHeader,
  StatTile,
  TextLink,
  DragScroll,
} from "../components/portal-ui";
import type { PillStatus } from "../components/portal-ui";

interface Dog {
  id: string;
  name: string;
  breed: string | null;
  weight_kg: string | null;
  daily_kcal: number | null;
}
interface Subscription {
  id: string;
  status: string;
  trial_price: string | null;
  selling_price_total: string;
  trial_ends_at: string | null;
}
interface AccountData {
  person: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    phone: string | null;
    area: string | null;
    address_line_1: string | null;
    address_line_2: string | null;
    city: string | null;
    emirate: string | null;
    latitude: number | null;
    longitude: number | null;
  };
  dogs: Dog[];
  subscription: Subscription | null;
  next_delivery: { delivery_date: string; delivery_type: string } | null;
}

const STATUS_LABEL: Record<string, string> = {
  trial: "Trial",
  active: "Active",
  paused: "Paused",
  past_due: "Past due",
  cancelled: "Cancelled",
};

function formatLongDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatTodayEyebrow(d = new Date()) {
  const parts = d
    .toLocaleDateString("en-AE", { weekday: "long", day: "numeric", month: "long" })
    .toUpperCase();
  return parts.replace(",", " ·");
}

function joinNames(dogs: Dog[]) {
  if (dogs.length === 0) return "";
  if (dogs.length === 1) return dogs[0].name;
  if (dogs.length === 2) return `${dogs[0].name} & ${dogs[1].name}`;
  return dogs.slice(0, -1).map((d) => d.name).join(", ") + ` & ${dogs[dogs.length - 1].name}`;
}

function shortMonth(iso: string) {
  return new Date(iso).toLocaleDateString("en-AE", { day: "numeric", month: "short" });
}

export default function AccountPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useApiQuery<AccountData>("/api/portal/account");

  if (loading && !data)
    return (
      <div className="cream-paper min-h-screen flex items-center justify-center text-ink-muted">
        Loading…
      </div>
    );
  if (error)
    return (
      <div className="cream-paper min-h-screen flex items-center justify-center text-terracotta">
        {error}
      </div>
    );
  if (!data) return null;

  const { person, dogs, subscription, next_delivery } = data;

  const initials =
    [person.first_name?.[0], person.last_name?.[0]].filter(Boolean).join("").toUpperCase() || "?";

  const namesJoined = joinNames(dogs);
  const isAreVerb = dogs.length === 1 ? "is" : "are";

  const totalDailyKcal = dogs.reduce((sum, d) => sum + (d.daily_kcal ?? 0), 0);

  const today = new Date();
  const daysToNext = next_delivery
    ? Math.max(
        0,
        Math.ceil(
          (new Date(next_delivery.delivery_date).getTime() -
            new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : null;

  const subStatus = (subscription?.status as PillStatus | undefined) ?? undefined;
  const pin_set = person.latitude != null && person.longitude != null;

  return (
    <div
      className="screen cream-paper"
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      {/* HERO */}
      <div className="surface-hero forest-tex fade-up" style={{ padding: "28px 24px 24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.55)",
                marginBottom: 8,
              }}
            >
              {formatTodayEyebrow()}
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                fontSize: 36,
                lineHeight: 0.95,
                letterSpacing: "-0.025em",
                color: "#fff",
                margin: 0,
              }}
            >
              Hi, {person.first_name ?? "there"}.
            </h1>
            {namesJoined && (
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 400,
                  fontSize: 36,
                  lineHeight: 0.95,
                  letterSpacing: "-0.025em",
                  color: "var(--orange)",
                  marginTop: 2,
                }}
              >
                <em style={{ fontStyle: "italic" }}>{namesJoined}</em> {isAreVerb} set.
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => navigate("/settings")}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              flexShrink: 0,
              marginLeft: 12,
            }}
          >
            {initials}
          </button>
        </div>

        {/* Next delivery countdown */}
        {next_delivery && (
          <button
            type="button"
            onClick={() => navigate("/deliveries")}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 16,
              padding: "14px 16px",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 14,
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "var(--orange)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                flexShrink: 0,
              }}
            >
              <Truck size={22} strokeWidth={2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.55)",
                }}
              >
                Next delivery · in {daysToNext} {daysToNext === 1 ? "day" : "days"}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 400,
                  fontSize: 20,
                  letterSpacing: "-0.02em",
                  marginTop: 2,
                }}
              >
                {formatLongDate(next_delivery.delivery_date)}
              </div>
            </div>
            <ChevronRight size={18} color="rgba(255,255,255,0.5)" />
          </button>
        )}
      </div>

      {/* Quick stats — 3 tiles */}
      <div style={{ display: "flex", gap: 10 }}>
        <StatTile
          icon={<PawPrint size={18} strokeWidth={1.8} />}
          label="Pack"
          value={`${dogs.length} ${dogs.length === 1 ? "dog" : "dogs"}`}
          sub={namesJoined || undefined}
        />
        <StatTile
          icon={<Flame size={18} strokeWidth={1.8} />}
          label="Daily kcal"
          value={Math.round(totalDailyKcal).toLocaleString()}
          sub="combined"
        />
        {subscription && (
          <StatTile
            icon={<RefreshCw size={18} strokeWidth={1.8} />}
            label="Plan"
            value={`AED ${Number(subscription.selling_price_total).toFixed(0)}`}
            sub="per month"
            accent
          />
        )}
      </div>

      {/* Your pack */}
      {dogs.length > 0 && (
        <div>
          <SectionHeader
            title="Your pack"
            action={<TextLink onClick={() => navigate("/dogs")}>All dogs</TextLink>}
          />
          <DragScroll>
            {dogs.map((dog) => (
              <button
                key={dog.id}
                type="button"
                onClick={() => navigate("/dogs")}
                style={{
                  flexShrink: 0,
                  width: 200,
                  scrollSnapAlign: "start",
                  background: "#fff",
                  border: "1px solid var(--line)",
                  borderRadius: 20,
                  padding: 16,
                  textAlign: "left",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "var(--sh-1)",
                  cursor: "pointer",
                  minHeight: 140,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    right: -10,
                    bottom: -8,
                    width: 130,
                    height: 130,
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
                      objectPosition: "bottom right",
                      opacity: 0.92,
                    }}
                  />
                </div>
                <div className="page-eyebrow" style={{ marginBottom: 4 }}>
                  {dog.breed ? dog.breed.split(" ")[0] : "Pack"}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 400,
                    fontSize: 28,
                    letterSpacing: "-0.02em",
                    color: "var(--forest)",
                    lineHeight: 1,
                  }}
                >
                  {dog.name}
                </div>
                <div style={{ marginTop: 14, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {dog.weight_kg && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--ink-muted)",
                        background: "var(--cream-light)",
                        padding: "3px 8px",
                        borderRadius: 999,
                      }}
                    >
                      {dog.weight_kg} kg
                    </span>
                  )}
                  {dog.daily_kcal != null && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--ink-muted)",
                        background: "var(--cream-light)",
                        padding: "3px 8px",
                        borderRadius: 999,
                      }}
                    >
                      {Math.round(dog.daily_kcal)} kcal
                    </span>
                  )}
                </div>
              </button>
            ))}
          </DragScroll>
        </div>
      )}

      {/* Plan card */}
      {subscription && (
        <div>
          <SectionHeader
            title="Your plan"
            action={<TextLink onClick={() => navigate("/subscription")}>Manage</TextLink>}
          />
          <Card padding="0">
            <div
              style={{
                padding: "18px 20px",
                borderBottom: "1px solid var(--line-soft)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div className="page-eyebrow" style={{ marginBottom: 2 }}>
                  Monthly
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 400,
                    fontSize: 32,
                    letterSpacing: "-0.03em",
                    color: "var(--forest)",
                    lineHeight: 1,
                  }}
                >
                  <span style={{ fontSize: 14, color: "var(--ink-muted)", marginRight: 4 }}>
                    AED
                  </span>
                  {Number(subscription.selling_price_total).toFixed(0)}
                </div>
              </div>
              {subStatus && (
                <Pill status={subStatus}>
                  {STATUS_LABEL[subscription.status] ?? subscription.status}
                </Pill>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
              <div
                style={{
                  padding: "12px 20px",
                  borderRight: "1px solid var(--line-soft)",
                }}
              >
                <div className="page-eyebrow" style={{ marginBottom: 2 }}>
                  Trial price
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>
                  {subscription.trial_price ? `AED ${Number(subscription.trial_price).toFixed(0)}` : "—"}
                </div>
              </div>
              <div style={{ padding: "12px 20px" }}>
                <div className="page-eyebrow" style={{ marginBottom: 2 }}>
                  Trial ends
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>
                  {subscription.trial_ends_at ? shortMonth(subscription.trial_ends_at) : "—"}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Address */}
      {(person.address_line_1 || person.address_line_2 || person.city) && (
        <div>
          <SectionHeader
            title="Delivering to"
            action={<TextLink onClick={() => navigate("/settings")}>Edit</TextLink>}
          />
          <Card padding="16px 18px">
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  flexShrink: 0,
                  background: "var(--cream)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--forest)",
                }}
              >
                <MapPin size={18} strokeWidth={2} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {person.address_line_1 && (
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>
                    {person.address_line_1}
                  </div>
                )}
                {(person.address_line_2 || person.city) && (
                  <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 2 }}>
                    {[person.address_line_2, person.city].filter(Boolean).join(", ")}
                  </div>
                )}
                {pin_set && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--sage)",
                      fontWeight: 600,
                      marginTop: 6,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Check size={12} strokeWidth={2.5} /> Pin set
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      <div style={{ height: 8 }} />
    </div>
  );
}
