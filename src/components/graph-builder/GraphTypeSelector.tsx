"use client";

import {
  VISUAL_GRAPH_TYPE_LABELS,
  VISUAL_GRAPH_TYPES_FUTURE,
  VISUAL_GRAPH_TYPES_V1,
  type VisualGraphType,
} from "@/lib/visualGraphBuilder";

type GraphTypeSelectorProps = {
  value: VisualGraphType | null;
  onChange: (graphType: VisualGraphType) => void;
  soonBadgeClassName: string;
};

export function GraphTypeSelector({
  value,
  onChange,
  soonBadgeClassName,
}: GraphTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          Tipo de gráfico
        </p>
        {value === null ? (
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Seleccione un tipo para configurar variables y vista previa.
          </p>
        ) : (
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Seleccionado:{" "}
            <span className="font-medium text-[var(--color-text-primary)]">
              {VISUAL_GRAPH_TYPE_LABELS[value]}
            </span>
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2" role="listbox" aria-label="Tipos de gráfico">
        {VISUAL_GRAPH_TYPES_V1.map((graphType) => (
          <button
            key={graphType}
            type="button"
            role="option"
            aria-selected={value === graphType}
            onClick={() => onChange(graphType)}
            className={`rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors ${
              value === graphType
                ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/10 text-[var(--color-text-primary)] ring-1 ring-[var(--color-brand-primary)]/30"
                : "border-[var(--color-border-default)] bg-[var(--color-surface-default)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-canvas)]"
            }`}
          >
            {VISUAL_GRAPH_TYPE_LABELS[graphType]}
          </button>
        ))}
      </div>
      {VISUAL_GRAPH_TYPES_FUTURE.length > 0 ? (
        <div className="space-y-1.5 border-t border-dashed border-[var(--color-border-default)] pt-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Futuros
          </p>
          {VISUAL_GRAPH_TYPES_FUTURE.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-dashed border-[var(--color-border-default)] px-3 py-2 text-xs text-[var(--color-text-muted)]"
            >
              <span>{item.label}</span>
              <span className={soonBadgeClassName}>Próximamente</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
