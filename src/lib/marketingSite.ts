/** Public marketing site (pupchef.ae) — same origin constants as pupchef-marketing. */
export const MARKETING_ORIGIN =
  (import.meta.env.VITE_MARKETING_ORIGIN as string | undefined)?.replace(/\/$/, "") ?? "https://pupchef.ae";
