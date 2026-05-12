import type { ReactNode } from "react";

export type PillStatus =
  | "active"
  | "trial"
  | "paused"
  | "scheduled"
  | "preparing"
  | "delivered"
  | "cancelled"
  | "skipped"
  | "past_due";

interface PillProps {
  status?: PillStatus;
  children: ReactNode;
  dark?: boolean;
}

const statusToClass: Record<PillStatus, string> = {
  active: "pill-active",
  trial: "pill-trial",
  paused: "pill-paused",
  scheduled: "pill-coral",
  preparing: "pill-trial",
  delivered: "pill-active",
  cancelled: "pill-paused",
  skipped: "pill-paused",
  past_due: "pill-coral",
};

/**
 * Status pills used inside dark forest hero blocks. Statuses without an entry
 * fall back to the generic translucent-white `pill-on-dark` look.
 */
const statusToDarkClass: Partial<Record<PillStatus, string>> = {
  preparing: "pill-preparing-on-dark",
  delivered: "pill-active-on-dark",
  active: "pill-active-on-dark",
};

export default function Pill({ status, children, dark = false }: PillProps) {
  let cls: string;
  if (dark) {
    cls = (status && statusToDarkClass[status]) ?? "pill-on-dark";
  } else {
    cls = status ? statusToClass[status] : "pill-ghost";
  }
  return (
    <span className={`pill ${cls}`}>
      <span className="dot" />
      {children}
    </span>
  );
}
