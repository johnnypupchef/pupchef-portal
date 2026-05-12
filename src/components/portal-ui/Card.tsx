import type { CSSProperties, ReactNode, MouseEvent } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  padding?: number | string;
}

export default function Card({
  children,
  className = "",
  style,
  onClick,
  padding = "20px",
}: CardProps) {
  return (
    <div
      className={`surface-card ${className}`}
      onClick={onClick}
      style={{
        padding,
        boxShadow: "var(--sh-1)",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
