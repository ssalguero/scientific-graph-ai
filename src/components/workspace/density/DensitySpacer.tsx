import { WORKSPACE_DENSITY_TOKENS } from "./densityTokens";

/**
 * UX-2.25 — Presentational density spacer (tokens only).
 * Fully deterministic via DENSITY_SPACER_MAP — no if / switch / ternaries.
 */
export type DensitySpacerProps = {
  size: "section" | "row" | "list" | "card";
};

/** Frozen size → token lookup. No if / switch. */
const DENSITY_SPACER_MAP = {
  section: WORKSPACE_DENSITY_TOKENS.sectionGap,
  row: WORKSPACE_DENSITY_TOKENS.rowGap,
  list: WORKSPACE_DENSITY_TOKENS.listGap,
  card: WORKSPACE_DENSITY_TOKENS.cardGap,
} as const;

export function DensitySpacer({ size }: DensitySpacerProps) {
  return <div className={DENSITY_SPACER_MAP[size]} aria-hidden />;
}
