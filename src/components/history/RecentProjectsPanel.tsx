"use client";

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

type RecentProjectStorageState = RecentProjectsPanelProps["projects"][number]["storageState"];

const panelClassName =
  "rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-2 text-xs text-[var(--app-text)]";

const itemClassName =
  "flex items-start justify-between gap-2 rounded-md border border-[var(--app-border)]/60 bg-[var(--app-surface-muted)]/40 px-2 py-1.5";

const btnOpenClassName =
  "shrink-0 rounded-lg bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 transition-colors";

const btnLinkClassName =
  "text-[11px] font-medium text-[var(--app-accent)] hover:underline";

const storageStateLabel: Record<RecentProjectStorageState, string> = {
  NORMAL: "Guardado",
  DIRTY: "Cambios pendientes",
  RECOVERABLE: "Recuperable",
  CORRUPTED: "Corrupto",
};

const storageStateClass: Record<RecentProjectStorageState, string> = {
  NORMAL: "text-emerald-700",
  DIRTY: "text-amber-700",
  RECOVERABLE: "text-orange-700",
  CORRUPTED: "text-red-700",
};

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
      aria-label="Historial de proyectos recientes"
    >
      {isLoading ? (
        <p
          className="px-0.5 text-[11px] text-[var(--app-text-muted)]"
          role="status"
        >
          Cargando…
        </p>
      ) : null}

      {loadError ? (
        <p
          className="px-0.5 text-[11px] text-[var(--app-danger-text)]"
          role="alert"
        >
          {loadError}
        </p>
      ) : null}

      {showEmpty ? (
        <p
          className="px-0.5 text-[11px] text-[var(--app-text-muted)]"
          role="status"
        >
          No hay proyectos recientes en la biblioteca local.
        </p>
      ) : null}

      {projects.length > 0 ? (
        <ul className="max-h-48 overflow-y-auto space-y-1.5 pr-0.5" role="list">
          {projects.map((project) => {
            const isActive = project.id === activeProjectId;
            return (
              <li
                key={project.id}
                className={`${itemClassName}${
                  isActive
                    ? " border-[var(--app-accent)] bg-[var(--app-accent)]/5"
                    : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[var(--app-text)] leading-snug break-words">
                    {project.name}
                  </p>
                  <time
                    className="mt-0.5 block text-[10px] text-[var(--app-text-muted)]"
                    dateTime={project.lastAccessedAt}
                  >
                    Último acceso: {formatLastAccessedAt(project.lastAccessedAt)}
                  </time>
                  <p
                    className={`mt-0.5 text-[10px] font-medium ${storageStateClass[project.storageState]}`}
                  >
                    {storageStateLabel[project.storageState]}
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

      {onOpenLibrary ? (
        <div className="mt-2 border-t border-[var(--app-border)]/60 pt-2">
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
