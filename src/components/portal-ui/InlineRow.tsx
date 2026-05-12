import type { ReactNode } from "react";

interface InlineRowProps {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
  action?: ReactNode;
}

export default function InlineRow({ icon, label, value, action }: InlineRowProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 0",
        borderBottom: "1px solid var(--line-soft)",
      }}
    >
      {icon && <div style={{ color: "var(--ink-muted)" }}>{icon}</div>}
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
        <div
          style={{
            fontSize: 14,
            color: "var(--ink)",
            fontWeight: 600,
            marginTop: 2,
          }}
        >
          {value}
        </div>
      </div>
      {action}
    </div>
  );
}
