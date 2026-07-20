import { InspectorLayout } from "./InspectorLayout";
import type { InspectorProps } from "./types";

/**
 * D50.2 — Inspector root host. Delegates to layout.
 * Move-only infrastructure: no state, hooks, handlers, or domain logic.
 */
export function Inspector({ visible, width, children }: InspectorProps) {
  return (
    <InspectorLayout visible={visible} width={width}>
      {children}
    </InspectorLayout>
  );
}
