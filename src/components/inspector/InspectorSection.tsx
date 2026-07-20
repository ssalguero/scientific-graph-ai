import { INSPECTOR_TOKENS } from "./InspectorTokens";
import type { InspectorSectionProps } from "./types";

/**
 * D50.2 — Titled section. Presentational only.
 * Move-only infrastructure: no state, hooks, or domain logic.
 */
export function InspectorSection({ title, children }: InspectorSectionProps) {
  return (
    <section className={INSPECTOR_TOKENS.section}>
      <h3 className={INSPECTOR_TOKENS.sectionHeader}>{title}</h3>
      <div className={INSPECTOR_TOKENS.sectionSpacing}>{children}</div>
    </section>
  );
}
