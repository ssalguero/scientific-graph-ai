import { CONTENT_TOKENS } from "./CONTENT_TOKENS";

/**
 * UX-2.22 — Semantic label/value pair.
 * Exported for UX-2.23+; no fictional pairs this phase.
 * API frozen after UX-2.22.
 */
export type KeyValueProps = {
  label: string;
  value: string;
};

export function KeyValue({ label, value }: KeyValueProps) {
  return (
    <div className={CONTENT_TOKENS.keyValueRoot}>
      <span className={CONTENT_TOKENS.keyValueLabel}>{label}</span>
      <span className={CONTENT_TOKENS.keyValueValue}>{value}</span>
    </div>
  );
}
