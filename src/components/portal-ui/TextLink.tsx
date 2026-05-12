import type { MouseEvent, ReactNode } from "react";
import { ChevronRight } from "lucide-react";

interface TextLinkProps {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}

export default function TextLink({ children, onClick }: TextLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        padding: "4px 0",
        color: "var(--orange-dark)",
        fontWeight: 700,
        fontSize: 13,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        letterSpacing: "-0.01em",
        cursor: "pointer",
      }}
    >
      {children}
      <ChevronRight size={14} strokeWidth={2} />
    </button>
  );
}
