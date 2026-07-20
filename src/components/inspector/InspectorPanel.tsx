import { INSPECTOR_TOKENS } from "./InspectorTokens";
import type { InspectorPanelProps } from "./types";

/**
 * D50.2 — Inner panel wrapper. Presentational slot only.
 * Move-only infrastructure: no state, hooks, or domain logic.
 */
export function InspectorPanel({ children }: InspectorPanelProps) {
  return <div className={INSPECTOR_TOKENS.panel}>{children}</div>;
}
