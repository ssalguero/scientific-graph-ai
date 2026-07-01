"use client";

import { useMemo, useState } from "react";

import type {
  LocalProjectStorageState,
  LocalProjectSummary,
} from "@/lib/project/domain/local-project";

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

const storageStateLabel: Record<LocalProjectStorageState, string> = {
  NORMAL: "Guardado",
  DIRTY: "Cambios pendientes",
  RECOVERABLE: "Recuperable",
  CORRUPTED: "Corrupto",
};

const storageStateClass: Record<LocalProjectStorageState, string> = {
  NORMAL: "text-emerald-700",
  DIRTY: "text-amber-700",
  RECOVERABLE: "text-orange-700",
  CORRUPTED: "text-red-700",
};

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

  const sortedProjects = useMemo(() => projects, [projects]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--app-border)] px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--app-text)]">
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
            <p className="text-xs text-[var(--app-text-muted)]">Cargando…</p>
          ) : null}
          {loadError ? (
            <p className="text-xs text-[var(--app-danger-text)]">{loadError}</p>
          ) : null}
          {!isLoading && sortedProjects.length === 0 ? (
            <p className="text-xs text-[var(--app-text-muted)]">
              No hay proyectos guardados localmente.
            </p>
          ) : null}

          {sortedProjects.map((project) => {
            const renameValue = renameDrafts[project.id] ?? project.name;
            return (
              <div
                key={project.id}
                className={`rounded-lg border px-3 py-2 ${
                  project.id === activeProjectId
                    ? "border-[var(--app-accent)] bg-[var(--app-accent)]/5"
                    : "border-[var(--app-border)]"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
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
                      className={`mt-0.5 text-[11px] font-medium ${storageStateClass[project.storageState]}`}
                    >
                      {storageStateLabel[project.storageState]}
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
                      <div className="rounded border border-red-300 bg-red-50 p-2 text-[11px]">
                        <p>¿Eliminar permanentemente?</p>
                        <div className="mt-1 flex gap-1">
                          <button
                            type="button"
                            className="rounded border border-red-400 px-2 py-0.5"
                            onClick={() => {
                              onDelete(project.id);
                              setPendingDeleteId(null);
                            }}
                          >
                            Sí, eliminar
                          </button>
                          <button
                            type="button"
                            className="rounded border border-[var(--app-border)] px-2 py-0.5"
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
