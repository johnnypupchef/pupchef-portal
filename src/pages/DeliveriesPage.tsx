import { useState } from "react";
import { Soup, SkipForward, ChevronDown, Lock } from "lucide-react";
import { api, invalidateCache } from "../lib/api";
import { useApiQuery } from "../lib/useApiQuery";
import { Pill, SectionHeader } from "../components/portal-ui";
import type { PillStatus } from "../components/portal-ui";

const PREPARING_WINDOW_HOURS = 12;
const PREPARING_WINDOW_MS = PREPARING_WINDOW_HOURS * 60 * 60 * 1000;

/**
 * Within 12h of delivery, present a "scheduled" event as "preparing" (yellow)
 * and lock the skip button. Backend status may still be "scheduled" right up
 * until the prep batch is locked — the user-facing rule is purely time-based.
 */
function effectiveStatus(deliveryDate: string, apiStatus: string): string {
  if (apiStatus !== "scheduled") return apiStatus;
  const ms = new Date(deliveryDate).getTime() - Date.now();
  return ms <= PREPARING_WINDOW_MS ? "preparing" : "scheduled";
}

interface RecipeGroup {
  dogName: string;
  recipeName: string;
  count: number;
  status: string;
}

/** Group N (dog × day) schedule rows into one row per (dog, recipe) with ×count. */
function groupSchedules(schedules: Schedule[]): RecipeGroup[] {
  const map = new Map<string, RecipeGroup>();
  for (const s of schedules) {
    const key = `${s.dog_name}__${s.recipe_name}`;
    const prev = map.get(key);
    if (prev) prev.count += 1;
    else
      map.set(key, {
        dogName: s.dog_name,
        recipeName: s.recipe_name,
        count: 1,
        status: s.status,
      });
  }
  return Array.from(map.values());
}

interface Schedule {
  id: string;
  dog_name: string;
  recipe_name: string;
  stack_slot: string;
  status: string;
}
interface Delivery {
  id: string;
  delivery_date: string;
  delivery_type: string;
  status: string;
  delivery_photo_url: string | null;
  delivered_at: string | null;
  schedules: Schedule[];
}

const STATUS_LABEL: Record<string, string> = {
  scheduled: "scheduled",
  preparing: "preparing",
  delivered: "delivered",
  cancelled: "cancelled",
  skipped: "skipped",
};

function recipeSetLabel(type: string) {
  if (type === "day_a") return "Recipe set A";
  if (type === "day_b") return "Recipe set B";
  return type.replace("_", " ");
}

function NextDeliveryHero({ delivery }: { delivery: Delivery }) {
  const date = new Date(delivery.delivery_date);
  const eff = effectiveStatus(delivery.delivery_date, delivery.status);
  const isPreparing = eff === "preparing";
  return (
    <div className="surface-hero forest-tex fade-up" style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 18,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.55)",
          }}
        >
          {isPreparing ? "Out for delivery" : "Next delivery"}
        </div>
        <Pill status={isPreparing ? "preparing" : "scheduled"} dark>
          {isPreparing ? "Preparing" : "Scheduled"}
        </Pill>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 14,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: 80,
            lineHeight: 0.85,
            letterSpacing: "-0.04em",
            color: "#fff",
          }}
        >
          {date.getDate()}
        </div>
        <div style={{ paddingBottom: 6 }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: 22,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              color: "var(--orange)",
            }}
          >
            <em style={{ fontStyle: "italic" }}>
              {date.toLocaleDateString("en-AE", { month: "long" })}
            </em>
          </div>
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.7)",
              marginTop: 4,
            }}
          >
            {date.toLocaleDateString("en-AE", { weekday: "long" })}
          </div>
        </div>
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.06)",
          borderRadius: 14,
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {delivery.schedules.map((s) => (
          <div
            key={s.id}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <Soup size={14} color="rgba(255,255,255,0.5)" />
            <span style={{ fontWeight: 700, fontSize: 13, color: "#fff" }}>
              {s.dog_name}
            </span>
            <span
              style={{
                flex: 1,
                fontSize: 12,
                color: "rgba(255,255,255,0.6)",
              }}
            >
              {s.recipe_name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeliveryRow({
  delivery,
  expanded,
  onToggle,
  onSkip,
  skipping,
}: {
  delivery: Delivery;
  expanded: boolean;
  onToggle: () => void;
  onSkip?: (id: string) => void;
  skipping?: boolean;
}) {
  const date = new Date(delivery.delivery_date);
  const eff = effectiveStatus(delivery.delivery_date, delivery.status);
  const delivered = eff === "delivered";
  const status = eff as PillStatus;
  const bowlCount = delivery.schedules.length * 2;
  const grouped = groupSchedules(delivery.schedules);
  const skipLocked = eff !== "scheduled";

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid var(--line)",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "var(--sh-1)",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: "100%",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "none",
          border: "none",
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            flexShrink: 0,
            background: delivered ? "rgba(143,166,138,0.16)" : "var(--cream)",
            color: delivered ? "var(--sage)" : "var(--forest)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            {date.toLocaleDateString("en-AE", { month: "short" })}
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: 18,
              letterSpacing: "-0.02em",
              lineHeight: 1,
              marginTop: 2,
            }}
          >
            {date.getDate()}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>
            {date.toLocaleDateString("en-AE", { weekday: "long" })}
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>
            {bowlCount} bowls · {recipeSetLabel(delivery.delivery_type)}
          </div>
        </div>
        <Pill status={status}>{STATUS_LABEL[eff] ?? eff}</Pill>
        <ChevronDown
          size={16}
          color="var(--ink-faint)"
          style={{
            transform: expanded ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        />
      </button>
      {expanded && (
        <div
          style={{
            padding: "0 16px 16px",
            borderTop: "1px solid var(--line-soft)",
          }}
        >
          {delivery.delivery_photo_url && (
            <div style={{ margin: "12px 0" }}>
              <div className="page-eyebrow" style={{ marginBottom: 8 }}>
                Proof of delivery
              </div>
              <img
                src={delivery.delivery_photo_url}
                alt="Delivery"
                style={{
                  width: "100%",
                  borderRadius: 12,
                  maxHeight: 180,
                  objectFit: "cover",
                }}
              />
              {delivery.delivered_at && (
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--ink-muted)",
                    marginTop: 6,
                  }}
                >
                  Delivered{" "}
                  {new Date(delivery.delivered_at).toLocaleTimeString("en-AE", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
            </div>
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              paddingTop: 12,
            }}
          >
            {grouped.map((g) => {
              const sStatus = (g.status as PillStatus) || "scheduled";
              return (
                <div
                  key={`${g.dogName}__${g.recipeName}`}
                  style={{
                    background: "var(--cream-light)",
                    borderRadius: 10,
                    padding: "10px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span
                    style={{ fontWeight: 700, fontSize: 13, color: "var(--ink)" }}
                  >
                    {g.dogName}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 12,
                      color: "var(--ink-muted)",
                    }}
                  >
                    {g.recipeName}
                    {g.count > 1 && (
                      <span
                        style={{
                          marginLeft: 6,
                          fontWeight: 700,
                          color: "var(--orange-dark)",
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                        }}
                      >
                        ×{g.count}
                      </span>
                    )}
                  </span>
                  <Pill status={sStatus}>{g.status}</Pill>
                </div>
              );
            })}
          </div>
          {onSkip && eff !== "delivered" && (
            <button
              type="button"
              className="btn btn-danger"
              style={{ marginTop: 12, width: "100%" }}
              onClick={() => !skipLocked && onSkip(delivery.id)}
              disabled={skipping || skipLocked}
              title={skipLocked ? `Locked: less than ${PREPARING_WINDOW_HOURS}h until delivery` : undefined}
            >
              {skipLocked ? (
                <>
                  <Lock size={16} strokeWidth={2} />
                  Skip locked — preparing
                </>
              ) : (
                <>
                  <SkipForward size={16} strokeWidth={2} />
                  {skipping ? "Skipping…" : "Skip this delivery"}
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function DeliveriesPage() {
  const { data, loading, error, refetch } = useApiQuery<{ deliveries: Delivery[] }>(
    "/api/portal/deliveries",
  );
  const deliveries = data?.deliveries ?? [];
  const [skipping, setSkipping] = useState<string | null>(null);
  const [skipError, setSkipError] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  async function skipDelivery(id: string) {
    if (!confirm("Skip this delivery? This cannot be undone.")) return;
    setSkipping(id);
    setSkipError("");
    try {
      await api.post(`/api/portal/deliveries/${id}/skip`);
      invalidateCache("/api/portal/deliveries");
      refetch();
    } catch (e: unknown) {
      setSkipError(e instanceof Error ? e.message : "Failed to skip");
    } finally {
      setSkipping(null);
    }
  }

  if (loading && !data)
    return (
      <div className="cream-paper min-h-screen flex items-center justify-center text-ink-muted">
        Loading…
      </div>
    );
  if (error || skipError)
    return (
      <div className="cream-paper min-h-screen flex items-center justify-center text-terracotta">
        {error || skipError}
      </div>
    );

  const upcoming = deliveries.filter(
    (d) => d.status === "scheduled" || d.status === "preparing",
  );
  const past = deliveries.filter(
    (d) => d.status !== "scheduled" && d.status !== "preparing",
  );

  const heroDelivery =
    upcoming.find((d) => d.status === "preparing") || upcoming[0] || null;
  const restUpcoming = heroDelivery
    ? upcoming.filter((d) => d.id !== heroDelivery.id)
    : upcoming;

  function toggle(id: string) {
    setExpanded((e) => ({ ...e, [id]: !e[id] }));
  }

  return (
    <div
      className="screen cream-paper"
      style={{
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <div style={{ padding: "8px 4px 0" }}>
        <div className="page-eyebrow" style={{ marginBottom: 4 }}>
          Schedule
        </div>
        <h1 className="page-h1">Deliveries</h1>
      </div>

      {deliveries.length === 0 && (
        <p style={{ color: "var(--ink-muted)", padding: "0 4px" }}>
          No deliveries found.
        </p>
      )}

      {heroDelivery && <NextDeliveryHero delivery={heroDelivery} />}

      {restUpcoming.length > 0 && (
        <div>
          <SectionHeader title="Coming up" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {restUpcoming.map((d) => (
              <DeliveryRow
                key={d.id}
                delivery={d}
                expanded={!!expanded[d.id]}
                onToggle={() => toggle(d.id)}
                onSkip={skipDelivery}
                skipping={skipping === d.id}
              />
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <SectionHeader title="Past deliveries" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {past.map((d) => (
              <DeliveryRow
                key={d.id}
                delivery={d}
                expanded={!!expanded[d.id]}
                onToggle={() => toggle(d.id)}
              />
            ))}
          </div>
        </div>
      )}

      <div style={{ height: 8 }} />
    </div>
  );
}
