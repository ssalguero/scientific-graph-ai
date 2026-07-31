import { Inline } from "../layout";
import { CONTENT_TOKENS } from "./CONTENT_TOKENS";

/**
 * UX-2.22 — Semantic label/value pair.
 * UX-2.26 — Composes Inline (no raw flex in keyValueRoot).
 * Exported for UX-2.23+; no fictional pairs this phase.
 * API frozen after UX-2.22.
 */
export type KeyValueProps = {
  label: string;
  value: string;
};

export function KeyValue({ label, value }: KeyValueProps) {
  return (
    <Inline align="baseline" justify="between" gap="md">
      <span className={CONTENT_TOKENS.keyValueLabel}>{label}</span>
      <span className={CONTENT_TOKENS.keyValueValue}>{value}</span>
    </Inline>
  );
}
