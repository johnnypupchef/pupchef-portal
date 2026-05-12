import type { ReactNode } from "react";

interface StatTileProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  sub?: string;
  accent?: boolean;
}

export default function StatTile({ icon, label, value, sub, accent = false }: StatTileProps) {
  return (
    <div
      style={{
        background: accent ? "var(--cream)" : "#fff",
        border: "1px solid var(--line)",
        borderRadius: 16,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        minWidth: 0,
        flex: 1,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: accent ? "rgba(242,103,75,0.12)" : "var(--cream-light)",
          color: accent ? "var(--orange-dark)" : "var(--forest)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--ink-muted)",
            marginBottom: 2,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: 18,
            letterSpacing: "-0.02em",
            color: "var(--forest)",
            lineHeight: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {value}
        </div>
        {sub && (
          <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 4 }}>{sub}</div>
        )}
      </div>
    </div>
  );
}
