"use client";

import {
  LOCAL_PROJECT_STORAGE_STATE_CLASS,
  LOCAL_PROJECT_STORAGE_STATE_LABEL,
} from "@/lib/project/userMessages";
import { projectFileBtnPrimary } from "@/lib/ui/theme";

export type RecentProjectsPanelProps = {
  projects: readonly {
    id: string;
    name: string;
    lastAccessedAt: string;
    storageState: "NORMAL" | "DIRTY" | "RECOVERABLE" | "CORRUPTED";
  }[];
  isLoading: boolean;
  loadError: string | null;
  activeProjectId: string | null;
  onOpen: (id: string) => void;
  onOpenLibrary?: () => void;
  className?: string;
};

const panelClassName =
  "rounded-lg border border-[var(--color-border-default)] bg-[var(--color-surface-default)] px-2 py-2 text-xs text-[var(--color-text-primary)]";

const itemClassName =
  "flex items-start justify-between gap-2 rounded-md border border-[var(--color-border-default)]/60 bg-[var(--color-surface-canvas)]/40 px-2 py-1.5";

const btnOpenClassName = `shrink-0 ${projectFileBtnPrimary}`;

const btnLinkClassName =
  "text-[11px] font-medium text-[var(--color-brand-primary)] hover:underline";

const activeBadgeClass =
  "inline-flex shrink-0 rounded border border-[var(--color-brand-primary)]/40 bg-[var(--color-brand-primary)]/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[var(--color-brand-primary)]";

const formatLastAccessedAt = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

export function RecentProjectsPanel({
  projects,
  isLoading,
  loadError,
  activeProjectId,
  onOpen,
  onOpenLibrary,
  className,
}: RecentProjectsPanelProps) {
  const showEmpty =
    !isLoading && loadError === null && projects.length === 0;

  return (
    <section
      className={[panelClassName, className].filter(Boolean).join(" ")}
      aria-label="Proyectos recientes"
    >
      <p className="px-0.5 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        Proyectos recientes
      </p>

      {isLoading ? (
        <p
          className="px-0.5 text-[11px] text-[var(--color-text-muted)]"
          role="status"
        >
          Cargando…
        </p>
      ) : null}

      {loadError ? (
        <p
          className="rounded-md border border-[color-mix(in_srgb,var(--color-feedback-danger)_35%,var(--color-border-default))] bg-[color-mix(in_srgb,var(--color-feedback-danger)_14%,var(--color-surface-default))] px-2 py-1.5 text-[11px] text-[var(--color-feedback-danger)]"
          role="alert"
        >
          {loadError}
        </p>
      ) : null}

      {showEmpty ? (
        <div
          className="rounded-md border border-dashed border-[var(--color-border-default)] bg-[var(--color-surface-canvas)]/40 px-2 py-2 space-y-1"
          role="status"
        >
          <p className="text-[11px] font-medium text-[var(--color-text-primary)]">
            No hay proyectos recientes
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)]">
            Guarde un proyecto localmente o abra la biblioteca completa.
          </p>
          {onOpenLibrary ? (
            <button
              type="button"
              className={btnLinkClassName}
              onClick={onOpenLibrary}
            >
              Ver biblioteca completa
            </button>
          ) : null}
        </div>
      ) : null}

      {projects.length > 0 ? (
        <ul className="max-h-48 overflow-y-auto space-y-1.5 pr-0.5" role="list">
          {projects.map((project) => {
            const isActive = project.id === activeProjectId;
            const isRecoverable = project.storageState === "RECOVERABLE";
            return (
              <li
                key={project.id}
                className={`${itemClassName}${
                  isActive
                    ? " border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/5"
                    : isRecoverable
                      ? " border-[color-mix(in_srgb,var(--color-feedback-warning)_35%,var(--color-border-default))] bg-[color-mix(in_srgb,color-mix(in_srgb,var(--color-feedback-warning)_16%,var(--color-surface-default))_40%,transparent)]"
                      : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-xs font-medium text-[var(--color-text-primary)] leading-snug break-words">
                      {project.name}
                    </p>
                    {isActive ? (
                      <span className={activeBadgeClass}>Activo</span>
                    ) : null}
                  </div>
                  <time
                    className="mt-0.5 block text-[10px] text-[var(--color-text-muted)]"
                    dateTime={project.lastAccessedAt}
                  >
                    Último acceso: {formatLastAccessedAt(project.lastAccessedAt)}
                  </time>
                  <p
                    className={`mt-0.5 text-[10px] font-medium ${LOCAL_PROJECT_STORAGE_STATE_CLASS[project.storageState]}`}
                  >
                    {LOCAL_PROJECT_STORAGE_STATE_LABEL[project.storageState]}
                  </p>
                </div>
                <button
                  type="button"
                  className={btnOpenClassName}
                  onClick={() => onOpen(project.id)}
                  aria-label={`Abrir proyecto ${project.name}`}
                >
                  Abrir
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {onOpenLibrary && !showEmpty ? (
        <div className="mt-2 border-t border-[var(--color-border-default)]/60 pt-2">
          <button
            type="button"
            className={btnLinkClassName}
            onClick={onOpenLibrary}
          >
            Ver biblioteca completa
          </button>
        </div>
      ) : null}
    </section>
  );
}
