"use client";

import { useEffect, useRef, useState, type ChangeEvent, type RefObject } from "react";

import {
  DEFAULT_PROJECT_NAME,
  PROJECT_FILE_EXTENSION,
  type ProjectMetadataV1,
} from "@/lib/project";

import type { ProjectFileFeedback } from "./projectFileActions";
import { btnPrimary, btnSave, btnSecondary, fieldLabel, inputField } from "./projectFileUiStyles";

export type { ProjectFileFeedback };

type PendingDiscardAction = "new" | "open" | "local-open";

export type ProjectScientificFilePanelProps = {
  projectMetadata: ProjectMetadataV1;
  isProjectDirty: boolean;
  feedback: ProjectFileFeedback | null;
  onDismissFeedback: () => void;
  onNewProject: () => void;
  onSaveProject: (projectName: string) => void;
  onOpenProjectFile: (file: File) => Promise<void>;
  onSaveLocalProject?: (projectName: string) => void | Promise<void>;
  onOpenLocalLibrary?: () => void | Promise<void>;
  localStorageState?: "NORMAL" | "DIRTY" | "RECOVERABLE" | "CORRUPTED" | null;
  recoveryPrompt?: { projectName: string } | null;
  onRestoreRecovery?: () => void | Promise<void>;
  onDismissRecovery?: () => void;
  openProjectButtonRef?: RefObject<HTMLButtonElement | null>;
};

export function ProjectScientificFilePanel({
  projectMetadata,
  isProjectDirty,
  feedback,
  onDismissFeedback,
  onNewProject,
  onSaveProject,
  onOpenProjectFile,
  onSaveLocalProject,
  onOpenLocalLibrary,
  localStorageState,
  recoveryPrompt,
  onRestoreRecovery,
  onDismissRecovery,
  openProjectButtonRef,
}: ProjectScientificFilePanelProps) {
  const toDisplayName = (name: string) =>
    name.trim() === "" || name === DEFAULT_PROJECT_NAME ? "" : name;

  const [draftName, setDraftName] = useState(() =>
    toDisplayName(projectMetadata.name)
  );
  const [pendingDiscard, setPendingDiscard] = useState<PendingDiscardAction | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const openAfterDiscardRef = useRef(false);

  useEffect(() => {
    setDraftName(toDisplayName(projectMetadata.name));
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
    <div className="space-y-1.5">
      <div>
        <label htmlFor="scientific-project-name" className={fieldLabel}>
          Nombre del proyecto
        </label>
        <input
          id="scientific-project-name"
          type="text"
          value={draftName}
          onChange={(event) => setDraftName(event.target.value)}
          placeholder="Nombre del proyecto"
          className={`${inputField} mt-0.5`}
        />
        <p className="text-[11px] text-[var(--app-text-muted)] mt-0.5">
          {isProjectDirty
            ? localStorageState === "DIRTY" || localStorageState === "RECOVERABLE"
              ? "Cambios sin guardar · autoguardado local activo"
              : "Cambios sin guardar"
            : localStorageState === "NORMAL"
              ? "Guardado localmente"
              : "Guardado en esta sesión"}
        </p>
      </div>

      {recoveryPrompt ? (
        <div className="rounded-lg border border-orange-300 bg-orange-50 px-3 py-2 text-xs text-orange-900 space-y-2">
          <p>
            Hay un borrador más reciente de &quot;{recoveryPrompt.projectName}&quot;.
            ¿Desea recuperarlo?
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void onRestoreRecovery?.()}
              className="rounded-md border border-orange-400 px-2 py-1 text-xs font-semibold hover:bg-orange-100/40"
            >
              Recuperar borrador
            </button>
            <button
              type="button"
              onClick={onDismissRecovery}
              className="rounded-md border border-[var(--app-border)] px-2 py-1 text-xs font-semibold hover:bg-[var(--app-surface-muted)]"
            >
              Descartar
            </button>
          </div>
        </div>
      ) : null}

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

      <div className="space-y-1">
        <button type="button" onClick={requestNewProject} className={`w-full h-8 ${btnPrimary}`}>
          Nuevo proyecto
        </button>
        <button
          type="button"
          onClick={() =>
            onSaveProject(draftName.trim() || DEFAULT_PROJECT_NAME)
          }
          className={`w-full h-8 ${btnSave}`}
        >
          Guardar proyecto (.sgproj)
        </button>
        {onSaveLocalProject ? (
          <button
            type="button"
            onClick={() =>
              void onSaveLocalProject(draftName.trim() || DEFAULT_PROJECT_NAME)
            }
            className={`w-full h-8 ${btnSave}`}
          >
            Guardar localmente
          </button>
        ) : null}
        {onOpenLocalLibrary ? (
          <button
            type="button"
            onClick={() => void onOpenLocalLibrary()}
            className={`w-full h-8 ${btnSecondary}`}
          >
            Proyectos locales
          </button>
        ) : null}
        <button
          ref={openProjectButtonRef}
          type="button"
          onClick={requestOpenProject}
          className={`w-full h-8 ${btnSecondary}`}
          title={`Abre un archivo ${PROJECT_FILE_EXTENSION} con sesión completa`}
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
