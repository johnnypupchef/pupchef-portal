import { useState } from "react";
import { PawPrint, Pause, Play } from "lucide-react";
import { api, invalidateCache } from "../lib/api";
import { useApiQuery } from "../lib/useApiQuery";
import { Card, Pill, SectionHeader } from "../components/portal-ui";
import type { PillStatus } from "../components/portal-ui";

interface SubDog {
  dog_name: string;
  dog_breed: string | null;
  daily_kcal: number;
  discounted_monthly_price: string;
  household_discount_rate: number;
  dog_index: number;
}
interface Subscription {
  id: string;
  status: string;
  selling_price_total: string;
  trial_price: string | null;
  trial_ends_at: string | null;
  current_period_end: string | null;
  created_at: string;
  dogs: SubDog[];
}

const STATUS_LABEL: Record<string, string> = {
  trial: "Trial",
  active: "Active",
  paused: "Paused",
  past_due: "Past due",
  cancelled: "Cancelled",
};

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AE", { day: "numeric", month: "short" });
}

export default function SubscriptionPage() {
  const { data, loading, error, refetch } = useApiQuery<{ subscription: Subscription | null }>(
    "/api/portal/subscription",
  );
  const sub = data?.subscription ?? null;
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  async function pause() {
    if (!confirm("Pause your subscription? Deliveries will stop until you resume.")) return;
    setActionLoading(true);
    try {
      await api.post("/api/portal/subscription/pause");
      invalidateCache("/api/portal/subscription");
      refetch();
      setActionMsg("Subscription paused.");
    } catch (e: unknown) {
      setActionMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function resume() {
    setActionLoading(true);
    try {
      await api.post("/api/portal/subscription/resume");
      invalidateCache("/api/portal/subscription");
      refetch();
      setActionMsg("Subscription resumed.");
    } catch (e: unknown) {
      setActionMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setActionLoading(false);
    }
  }

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

  if (!sub) {
    return (
      <div
        className="screen cream-paper"
        style={{ padding: 20, display: "flex", flexDirection: "column", gap: 18 }}
      >
        <div style={{ padding: "8px 4px 0" }}>
          <div className="page-eyebrow" style={{ marginBottom: 4 }}>
            Subscription
          </div>
          <h1 className="page-h1">Your plan</h1>
        </div>
        <Card>
          <p style={{ color: "var(--ink-muted)", margin: 0 }}>
            No active subscription found.
          </p>
        </Card>
      </div>
    );
  }

  const status = (sub.status as PillStatus) || "active";
  const dogCount = sub.dogs.length;

  return (
    <div
      className="screen cream-paper"
      style={{ padding: 20, display: "flex", flexDirection: "column", gap: 18 }}
    >
      <div style={{ padding: "8px 4px 0" }}>
        <div className="page-eyebrow" style={{ marginBottom: 4 }}>
          Subscription
        </div>
        <h1 className="page-h1">Your plan</h1>
      </div>

      {actionMsg && (
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
          {actionMsg}
        </div>
      )}

      {/* Hero price */}
      <div className="surface-hero forest-tex fade-up" style={{ padding: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 18,
          }}
        >
          <div className="page-eyebrow" style={{ color: "rgba(255,255,255,0.55)" }}>
            Monthly · {dogCount} {dogCount === 1 ? "dog" : "dogs"}
          </div>
          <Pill status={status} dark>
            {STATUS_LABEL[sub.status] ?? sub.status}
          </Pill>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>
            AED
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: 76,
              lineHeight: 0.85,
              letterSpacing: "-0.04em",
              color: "#fff",
            }}
          >
            {Number(sub.selling_price_total).toFixed(0)}
          </span>
          <span
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.5)",
              marginLeft: 4,
            }}
          >
            / mo
          </span>
        </div>
        {(() => {
          const isTrial = sub.status === "trial";
          const eyebrowColor = "var(--orange)";
          const cells: { label: string; value: string }[] = [];
          if (isTrial && sub.trial_price) {
            cells.push({
              label: "Trial",
              value: `AED ${Number(sub.trial_price).toFixed(0)}`,
            });
          }
          cells.push({
            label: isTrial ? "Trial ends" : "Plan ends",
            value: isTrial
              ? sub.trial_ends_at
                ? shortDate(sub.trial_ends_at)
                : "—"
              : sub.current_period_end
                ? shortDate(sub.current_period_end)
                : "—",
          });
          cells.push({
            label: "Started",
            value: shortDate(sub.created_at),
          });

          return (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${cells.length}, 1fr)`,
                gap: 12,
                marginTop: 22,
              }}
            >
              {cells.map((c) => (
                <div key={c.label}>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: eyebrowColor,
                      marginBottom: 4,
                    }}
                  >
                    {c.label}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>
                    {c.value}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Per-dog */}
      {sub.dogs.length > 0 && (
        <div>
          <SectionHeader title="Per dog" />
          <Card padding="0">
            {sub.dogs.map((d, i) => (
              <div
                key={d.dog_name + i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  borderBottom:
                    i < sub.dogs.length - 1 ? "1px solid var(--line-soft)" : "none",
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
                  <PawPrint size={20} strokeWidth={2} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>
                    {d.dog_name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--ink-muted)",
                      marginTop: 2,
                    }}
                  >
                    {Math.round(d.daily_kcal)} kcal/day
                  </div>
                  {d.household_discount_rate > 0 && (
                    <span
                      className="pill pill-coral"
                      style={{ marginTop: 6, fontSize: 10 }}
                    >
                      <span className="dot" />
                      {Math.round(d.household_discount_rate * 100)}% pack discount
                    </span>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 400,
                      fontSize: 22,
                      letterSpacing: "-0.02em",
                      color: "var(--forest)",
                      lineHeight: 1,
                    }}
                  >
                    {Number(d.discounted_monthly_price).toFixed(0)}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--ink-muted)",
                      marginTop: 2,
                    }}
                  >
                    AED / mo
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* Actions */}
      {(sub.status === "active" || sub.status === "trial") && (
        <Card>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: 20,
              letterSpacing: "-0.02em",
              color: "var(--forest)",
              margin: 0,
              marginBottom: 6,
            }}
          >
            Need a break?
          </h3>
          <p
            style={{
              fontSize: 13,
              color: "var(--ink-muted)",
              margin: 0,
              marginBottom: 14,
              lineHeight: 1.5,
            }}
          >
            Travelling or stocked up? Pause anytime — your dogs' plan stays exactly as it is.
          </p>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ width: "100%" }}
            onClick={pause}
            disabled={actionLoading}
          >
            <Pause size={16} strokeWidth={2} />
            {actionLoading ? "Working…" : "Pause subscription"}
          </button>
        </Card>
      )}

      {sub.status === "paused" && (
        <Card>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: 20,
              letterSpacing: "-0.02em",
              color: "var(--forest)",
              margin: 0,
              marginBottom: 6,
            }}
          >
            Subscription paused
          </h3>
          <p
            style={{
              fontSize: 13,
              color: "var(--ink-muted)",
              margin: 0,
              marginBottom: 14,
              lineHeight: 1.5,
            }}
          >
            Your deliveries are paused. Resume anytime to start receiving meals again.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: "100%" }}
            onClick={resume}
            disabled={actionLoading}
          >
            <Play size={16} strokeWidth={2} />
            {actionLoading ? "Working…" : "Resume subscription"}
          </button>
        </Card>
      )}

      <div style={{ height: 8 }} />
    </div>
  );
}
