import type { CSSProperties } from "react";

import { INSPECTOR_TOKENS } from "./InspectorTokens";
import type { InspectorProps } from "./types";

/**
 * D50.2 — Dock shell. Presentational only.
 * Move-only infrastructure: no state, hooks, handlers, or domain logic.
 */
export function InspectorLayout({ visible, width, children }: InspectorProps) {
  if (!visible) {
    return null;
  }

  const style = {
    width: `${width}px`,
  } satisfies CSSProperties;

  return (
    <aside
      className={INSPECTOR_TOKENS.root}
      style={style}
      aria-label="Inspector"
    >
      <div className={INSPECTOR_TOKENS.body}>{children}</div>
    </aside>
  );
}
