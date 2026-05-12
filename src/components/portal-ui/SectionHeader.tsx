import type { ReactNode } from "react";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}

export default function SectionHeader({ eyebrow, title, action }: SectionHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: 12,
        padding: "0 4px",
      }}
    >
      <div>
        {eyebrow && (
          <div className="page-eyebrow" style={{ marginBottom: 4 }}>
            {eyebrow}
          </div>
        )}
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: 22,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: "var(--forest)",
            margin: 0,
          }}
        >
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}
