"use client";

import type { VisualGraphVariable } from "@/lib/visualGraphBuilder";

type VariableSelectorProps = {
  label: string;
  value: string | null;
  variables: VisualGraphVariable[];
  onChange: (seriesId: string | null) => void;
  allowEmpty?: boolean;
  requireNumeric?: boolean;
  inputClassName: string;
  fieldLabelClassName: string;
  errorMessage?: string | null;
};

export function VariableSelector({
  label,
  value,
  variables,
  onChange,
  allowEmpty = false,
  requireNumeric = false,
  inputClassName,
  fieldLabelClassName,
  errorMessage,
}: VariableSelectorProps) {
  const options = variables.filter(
    (variable) => !requireNumeric || variable.numericCompatible
  );

  return (
    <div>
      <label className={fieldLabelClassName}>{label}</label>
      <select
        value={value ?? ""}
        onChange={(event) =>
          onChange(event.target.value.length > 0 ? event.target.value : null)
        }
        className={inputClassName}
      >
        {allowEmpty ? <option value="">—</option> : null}
        {options.map((variable) => (
          <option
            key={`${variable.kind}-${variable.seriesId}`}
            value={variable.seriesId}
            disabled={requireNumeric && !variable.numericCompatible}
          >
            {variable.label}
            {variable.badges.includes("fx") ? "  ƒx" : ""}
            {variable.badges.includes("transform") ? "  ⇄" : ""}
            {!variable.numericCompatible && requireNumeric
              ? " (no numérica)"
              : ""}
          </option>
        ))}
      </select>
      {errorMessage ? (
        <p className="mt-1 text-xs text-[var(--app-danger-text)]">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

export function VariableBadgeList({
  variables,
  onInsert,
}: {
  variables: VisualGraphVariable[];
  onInsert?: (seriesId: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {variables.map((variable) => (
        <button
          key={`${variable.kind}-${variable.seriesId}`}
          type="button"
          onClick={() => onInsert?.(variable.seriesId)}
          className="inline-flex items-center gap-1 rounded-full border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-2 py-0.5 text-xs text-[var(--app-text)]"
        >
          <span>{variable.label}</span>
          {variable.badges.includes("fx") ? (
            <span className="text-[10px] font-semibold text-[var(--app-accent)]">
              ƒx
            </span>
          ) : null}
          {variable.badges.includes("transform") ? (
            <span className="text-[10px] font-semibold text-[var(--app-warning-text)]">
              ⇄
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
