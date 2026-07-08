"use client";

import type {
  ProjectHistoryEntry,
  ProjectHistoryEventType,
} from "@/lib/project-history";

type HistoryPanelProps = {
  entries: readonly ProjectHistoryEntry[];
  className?: string;
};

const PROJECT_HISTORY_EVENT_ICONS: Record<ProjectHistoryEventType, string> = {
  "project.opened": "📂",
  "project.saved": "💾",
  "dataset.added": "➕",
  "dataset.removed": "➖",
  "workflow.started": "▶",
  "workflow.cancelled": "⏹",
  "report.generated": "📄",
};

const panelClassName =
  "rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-2 text-xs text-[var(--app-text)]";

const formatProjectHistoryTimestamp = (occurredAt: string): string => {
  const date = new Date(occurredAt);
  if (Number.isNaN(date.getTime())) {
    return occurredAt;
  }
  return date.toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

export function HistoryPanel({ entries, className }: HistoryPanelProps) {
  if (entries.length === 0) {
    return (
      <div
        className={[panelClassName, className].filter(Boolean).join(" ")}
        role="status"
      >
        <p className="text-[11px] text-[var(--app-text-muted)] px-0.5">
          Aún no hay actividad registrada en este proyecto.
        </p>
      </div>
    );
  }

  return (
    <div
      className={[panelClassName, className].filter(Boolean).join(" ")}
      role="log"
      aria-label="Actividad del proyecto"
    >
      <ul className="max-h-48 overflow-y-auto space-y-1.5 pr-0.5">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="flex items-start gap-2 rounded-md border border-[var(--app-border)]/60 bg-[var(--app-surface-muted)]/40 px-2 py-1.5"
          >
            <span
              className="mt-0.5 shrink-0 text-sm leading-none"
              aria-hidden
            >
              {PROJECT_HISTORY_EVENT_ICONS[entry.type]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-[var(--app-text)] leading-snug break-words">
                {entry.description}
              </p>
              <time
                className="mt-0.5 block text-[10px] text-[var(--app-text-muted)]"
                dateTime={entry.occurredAt}
              >
                {formatProjectHistoryTimestamp(entry.occurredAt)}
              </time>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
