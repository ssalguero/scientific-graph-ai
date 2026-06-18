"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";

import { PROJECT_FILE_EXTENSION, type ProjectMetadataV1 } from "@/lib/project";

import type { ProjectFileFeedback } from "./projectFileActions";
import { btnPrimary, fieldLabel, inputField } from "./projectFileUiStyles";

export type { ProjectFileFeedback };

type PendingDiscardAction = "new" | "open";

export type ProjectScientificFilePanelProps = {
  projectMetadata: ProjectMetadataV1;
  isProjectDirty: boolean;
  feedback: ProjectFileFeedback | null;
  onDismissFeedback: () => void;
  onNewProject: () => void;
  onSaveProject: (projectName: string) => void;
  onOpenProjectFile: (file: File) => Promise<void>;
};

export function ProjectScientificFilePanel({
  projectMetadata,
  isProjectDirty,
  feedback,
  onDismissFeedback,
  onNewProject,
  onSaveProject,
  onOpenProjectFile,
}: ProjectScientificFilePanelProps) {
  const [draftName, setDraftName] = useState(projectMetadata.name);
  const [pendingDiscard, setPendingDiscard] = useState<PendingDiscardAction | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const openAfterDiscardRef = useRef(false);

  useEffect(() => {
    setDraftName(projectMetadata.name);
  }, [projectMetadata.id, projectMetadata.name]);

  const requestNewProject = () => {
    if (isProjectDirty) {
      setPendingDiscard("new");
      return;
    }
    onNewProject();
  };

  const requestOpenProject = () => {
    if (isProjectDirty) {
      openAfterDiscardRef.current = true;
      setPendingDiscard("open");
      return;
    }
    fileInputRef.current?.click();
  };

  const confirmDiscard = () => {
    const action = pendingDiscard;
    setPendingDiscard(null);
    if (action === "new") {
      onNewProject();
      return;
    }
    if (openAfterDiscardRef.current) {
      openAfterDiscardRef.current = false;
      fileInputRef.current?.click();
    }
  };

  const cancelDiscard = () => {
    openAfterDiscardRef.current = false;
    setPendingDiscard(null);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    await onOpenProjectFile(file);
  };

  const feedbackClass =
    feedback?.kind === "error"
      ? "text-[var(--app-danger-text)] bg-[var(--app-danger-bg)] border-[var(--app-danger-border)]"
      : feedback?.kind === "warning"
        ? "text-[var(--app-warning-text)] bg-[var(--app-warning-bg)] border-[var(--app-warning-border)]"
        : feedback?.kind === "success"
          ? "text-[var(--app-success-text)] bg-[var(--app-success-bg)] border-emerald-200"
          : "text-[var(--app-text-muted)] bg-[var(--app-surface-muted)] border-[var(--app-border)]";

  return (
    <div className="space-y-2">
      <div>
        <label htmlFor="scientific-project-name" className={fieldLabel}>
          Nombre del proyecto
        </label>
        <input
          id="scientific-project-name"
          type="text"
          value={draftName}
          onChange={(event) => setDraftName(event.target.value)}
          placeholder="Proyecto sin título"
          className={`${inputField} mt-1`}
        />
        <p className="text-xs text-[var(--app-text-muted)] mt-1">
          {isProjectDirty ? "Cambios sin guardar" : "Guardado en esta sesión"}
        </p>
      </div>

      {pendingDiscard ? (
        <div className="rounded-lg border border-amber-300 bg-[var(--app-warning-bg)] px-3 py-2 text-xs text-[var(--app-warning-text)] space-y-2">
          <p>Hay cambios sin guardar. ¿Descartarlos y continuar?</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={confirmDiscard}
              className="rounded-md border border-amber-400 px-2 py-1 text-xs font-semibold hover:bg-amber-100/40"
            >
              Descartar cambios y continuar
            </button>
            <button
              type="button"
              onClick={cancelDiscard}
              className="rounded-md border border-[var(--app-border)] px-2 py-1 text-xs font-semibold hover:bg-[var(--app-surface-muted)]"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <button type="button" onClick={requestNewProject} className={`w-full ${btnPrimary} text-sm`}>
          Nuevo proyecto
        </button>
        <button
          type="button"
          onClick={() => onSaveProject(draftName.trim() || projectMetadata.name)}
          className="w-full rounded-lg border border-emerald-600 bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Guardar proyecto
        </button>
        <button
          type="button"
          onClick={requestOpenProject}
          className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-2 text-sm font-semibold text-[var(--app-text)] hover:bg-[var(--app-surface)]"
        >
          Abrir proyecto
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={`${PROJECT_FILE_EXTENSION},application/vnd.scientific-graph-ai.project+json`}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {feedback ? (
        <div
          className={`rounded-lg border px-3 py-2 text-xs ${feedbackClass}`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start justify-between gap-2">
            <p>{feedback.message}</p>
            <button
              type="button"
              onClick={onDismissFeedback}
              className="shrink-0 text-[10px] uppercase tracking-wide opacity-70 hover:opacity-100"
              aria-label="Cerrar mensaje"
            >
              ✕
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
