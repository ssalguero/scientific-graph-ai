"use client";

import { useMemo, useState } from "react";

import type { LocalProjectSummary } from "@/lib/project/domain/local-project";
import {
  LOCAL_PROJECT_STORAGE_STATE_CLASS,
  LOCAL_PROJECT_STORAGE_STATE_LABEL,
} from "@/lib/project/userMessages";

import { btnPrimary, btnSecondary, btnSave, fieldLabel, inputField } from "./projectFileUiStyles";

const formatDate = (iso: string) => {
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) return iso;
  return new Date(parsed).toLocaleString();
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const activeBadgeClass =
  "inline-flex shrink-0 rounded border border-[var(--app-accent)]/40 bg-[var(--app-accent)]/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--app-accent)]";

export type LocalProjectsPanelProps = {
  isOpen: boolean;
  projects: LocalProjectSummary[];
  isLoading: boolean;
  loadError: string | null;
  activeProjectId: string | null;
  onClose: () => void;
  onRefresh: () => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string, name: string) => void;
  onRename: (id: string, name: string) => void;
  onExport: (id: string) => void;
};

export function LocalProjectsPanel({
  isOpen,
  projects,
  isLoading,
  loadError,
  activeProjectId,
  onClose,
  onRefresh,
  onOpen,
  onDelete,
  onDuplicate,
  onRename,
  onExport,
}: LocalProjectsPanelProps) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [renameDrafts, setRenameDrafts] = useState<Record<string, string>>({});

  const sortedProjects = useMemo(
    () =>
      [...projects].sort(
        (a, b) => Date.parse(b.lastAccessedAt) - Date.parse(a.lastAccessedAt)
      ),
    [projects]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="local-projects-title"
      >
        <div className="flex items-center justify-between border-b border-[var(--app-border)] px-4 py-3">
          <div>
            <h2
              id="local-projects-title"
              className="text-sm font-semibold text-[var(--app-text)]"
            >
              Proyectos locales
            </h2>
            <p className="text-[11px] text-[var(--app-text-muted)]">
              Biblioteca offline (IndexedDB)
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onRefresh} className={btnSecondary}>
              Actualizar
            </button>
            <button type="button" onClick={onClose} className={btnSecondary}>
              Cerrar
            </button>
          </div>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <p
              className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-2 text-xs text-[var(--app-text-muted)]"
              role="status"
            >
              Cargando biblioteca local…
            </p>
          ) : null}
          {loadError ? (
            <p
              className="rounded-lg border border-[var(--app-danger-border)] bg-[var(--app-danger-bg)] px-3 py-2 text-xs text-[var(--app-danger-text)]"
              role="alert"
            >
              {loadError}
            </p>
          ) : null}
          {!isLoading && !loadError && sortedProjects.length === 0 ? (
            <div
              className="rounded-lg border border-dashed border-[var(--app-border)] bg-[var(--app-surface-muted)]/50 px-3 py-4 text-center space-y-1"
              role="status"
            >
              <p className="text-xs font-medium text-[var(--app-text)]">
                No hay proyectos guardados localmente
              </p>
              <p className="text-[11px] text-[var(--app-text-muted)]">
                Use &quot;Guardar localmente&quot; en el panel de proyecto para
                crear el primero en esta biblioteca.
              </p>
            </div>
          ) : null}

          {sortedProjects.map((project) => {
            const renameValue = renameDrafts[project.id] ?? project.name;
            const isActive = project.id === activeProjectId;
            const isRecoverable = project.storageState === "RECOVERABLE";
            const isCorrupted = project.storageState === "CORRUPTED";

            return (
              <div
                key={project.id}
                className={`rounded-lg border px-3 py-2 ${
                  isActive
                    ? "border-[var(--app-accent)] bg-[var(--app-accent)]/5"
                    : isRecoverable
                      ? "border-[var(--app-warning-border)] bg-[var(--app-warning-bg)]/40"
                      : isCorrupted
                        ? "border-[var(--app-danger-border)] bg-[var(--app-danger-bg)]/40"
                        : "border-[var(--app-border)]"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                      {isActive ? (
                        <span className={activeBadgeClass}>Activo</span>
                      ) : null}
                      {isRecoverable ? (
                        <span className="inline-flex shrink-0 rounded border border-[var(--app-warning-border)] bg-[var(--app-warning-bg)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--app-warning-text)]">
                          Recuperable
                        </span>
                      ) : null}
                    </div>
                    <label className={fieldLabel} htmlFor={`rename-${project.id}`}>
                      Nombre
                    </label>
                    <input
                      id={`rename-${project.id}`}
                      className={`${inputField} mt-0.5`}
                      value={renameValue}
                      onChange={(event) =>
                        setRenameDrafts((current) => ({
                          ...current,
                          [project.id]: event.target.value,
                        }))
                      }
                    />
                    <p className="mt-1 text-[11px] text-[var(--app-text-muted)]">
                      Modificado: {formatDate(project.updatedAt)} · Reciente:{" "}
                      {formatDate(project.lastAccessedAt)} · {formatSize(project.sizeBytes)}
                    </p>
                    <p
                      className={`mt-0.5 text-[11px] font-medium ${LOCAL_PROJECT_STORAGE_STATE_CLASS[project.storageState]}`}
                    >
                      {LOCAL_PROJECT_STORAGE_STATE_LABEL[project.storageState]}
                      {project.integrityStatus === "CHECKSUM_FAILED"
                        ? " · Integridad comprometida"
                        : null}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      className={btnPrimary}
                      onClick={() => onOpen(project.id)}
                    >
                      Abrir
                    </button>
                    <button
                      type="button"
                      className={btnSave}
                      onClick={() => onRename(project.id, renameValue)}
                    >
                      Renombrar
                    </button>
                    <button
                      type="button"
                      className={btnSecondary}
                      onClick={() => onDuplicate(project.id, `${renameValue} (copia)`)}
                    >
                      Duplicar
                    </button>
                    <button
                      type="button"
                      className={btnSecondary}
                      onClick={() => onExport(project.id)}
                    >
                      Exportar .sgproj
                    </button>
                    {pendingDeleteId === project.id ? (
                      <div className="rounded border border-[var(--app-danger-border)] bg-[var(--app-danger-bg)] p-2 text-[11px] text-[var(--app-danger-text)]">
                        <p>¿Eliminar permanentemente?</p>
                        <div className="mt-1 flex gap-1">
                          <button
                            type="button"
                            className="rounded border border-[var(--app-danger-border)] px-2 py-0.5 font-semibold"
                            onClick={() => {
                              onDelete(project.id);
                              setPendingDeleteId(null);
                            }}
                          >
                            Sí, eliminar
                          </button>
                          <button
                            type="button"
                            className="rounded border border-[var(--app-border)] px-2 py-0.5 text-[var(--app-text)]"
                            onClick={() => setPendingDeleteId(null)}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className={btnSecondary}
                        onClick={() => setPendingDeleteId(project.id)}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
