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
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">
        Tipo de gráfico
      </p>
      {value === null ? (
        <p className="text-xs text-[var(--app-text-muted)]">
          Seleccione un tipo de gráfico para configurar variables y vista previa.
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        {VISUAL_GRAPH_TYPES_V1.map((graphType) => (
          <button
            key={graphType}
            type="button"
            onClick={() => onChange(graphType)}
            className={`rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors ${
              value === graphType
                ? "border-[var(--app-accent)] bg-[var(--app-accent)]/10 text-[var(--app-heading)]"
                : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] hover:bg-[var(--app-surface-muted)]"
            }`}
          >
            {VISUAL_GRAPH_TYPE_LABELS[graphType]}
          </button>
        ))}
      </div>
      <div className="space-y-1.5 pt-1">
        {VISUAL_GRAPH_TYPES_FUTURE.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg border border-dashed border-[var(--app-border)] px-3 py-2 text-xs text-[var(--app-text-muted)]"
          >
            <span>{item.label}</span>
            <span className={soonBadgeClassName}>Próximamente</span>
          </div>
        ))}
      </div>
    </div>
  );
}
