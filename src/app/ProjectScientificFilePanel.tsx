"use client";

import { useEffect, useRef, useState, type ChangeEvent, type RefObject } from "react";

import {
  DEFAULT_PROJECT_NAME,
  PROJECT_FILE_EXTENSION,
  type ProjectMetadataV1,
} from "@/lib/project";
import { formatPersistenceConflictResolutionLabel } from "@/lib/project/userMessages";

import type { PendingFileOpenConflict } from "./persistence";
import type { AutosaveIndicatorView, PersistenceConflictView } from "./persistence/types";
import type { ProjectFileFeedback } from "./projectFileActions";
import { btnSave, btnSecondary, fieldLabel, inputField } from "./projectFileUiStyles";

export type { ProjectFileFeedback };

type PendingDiscardAction = "new" | "open" | "local-open";

const promptBannerClass =
  "rounded-lg border border-[color-mix(in_srgb,var(--color-feedback-warning)_35%,var(--color-border-default))] bg-[color-mix(in_srgb,var(--color-feedback-warning)_16%,var(--color-surface-default))] px-3 py-2 text-xs text-[var(--color-feedback-warning)] space-y-2";

const promptPrimaryBtnClass =
  "rounded-md border border-[color-mix(in_srgb,var(--color-feedback-warning)_35%,var(--color-border-default))] px-2 py-1 text-xs font-semibold hover:bg-[var(--color-surface-canvas)]";

const promptSecondaryBtnClass =
  "rounded-md border border-[var(--color-border-default)] px-2 py-1 text-xs font-semibold hover:bg-[var(--color-surface-canvas)]";

export type ProjectScientificFilePanelProps = {
  projectMetadata: ProjectMetadataV1;
  feedback: ProjectFileFeedback | null;
  onDismissFeedback: () => void;
  onNewProject: () => void;
  onSaveProject: (projectName: string) => void;
  onOpenProjectFile: (file: File) => Promise<void>;
  onSaveLocalProject?: (projectName: string) => void | Promise<void>;
  onOpenLocalLibrary?: () => void | Promise<void>;
  autosaveIndicator: AutosaveIndicatorView;
  sessionConflict: PersistenceConflictView;
  projectSizeMessage?: string | null;
  recoveryPrompt?: { projectName: string } | null;
  recoveryPromptMessage?: string | null;
  onRestoreRecovery?: () => void | Promise<void>;
  onDismissRecovery?: () => void;
  pendingFileOpenConflict?: PendingFileOpenConflict | null;
  onDismissPendingFileOpenConflict?: () => void;
  onResolvePendingFileOpenConflict?: (
    resolution: "LOAD_INCOMING" | "DISCARD_AND_LOAD" | "CANCEL"
  ) => void | Promise<void>;
  openProjectButtonRef?: RefObject<HTMLButtonElement | null>;
};

export function ProjectScientificFilePanel({
  projectMetadata,
  feedback,
  onDismissFeedback,
  onNewProject,
  onSaveProject,
  onOpenProjectFile,
  onSaveLocalProject,
  onOpenLocalLibrary,
  autosaveIndicator,
  sessionConflict,
  projectSizeMessage,
  recoveryPrompt,
  recoveryPromptMessage,
  onRestoreRecovery,
  onDismissRecovery,
  pendingFileOpenConflict,
  onDismissPendingFileOpenConflict,
  onResolvePendingFileOpenConflict,
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
  const [moreOpen, setMoreOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const openAfterDiscardRef = useRef(false);

  useEffect(() => {
    setDraftName(toDisplayName(projectMetadata.name));
  }, [projectMetadata.id, projectMetadata.name]);

  const requestNewProject = () => {
    if (sessionConflict.shouldBlock) {
      setPendingDiscard("new");
      return;
    }
    onNewProject();
  };

  const requestOpenProject = () => {
    if (sessionConflict.shouldBlock) {
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
      ? "text-[var(--color-feedback-danger)] bg-[color-mix(in_srgb,var(--color-feedback-danger)_14%,var(--color-surface-default))] border-[color-mix(in_srgb,var(--color-feedback-danger)_35%,var(--color-border-default))]"
      : feedback?.kind === "warning"
        ? "text-[var(--color-feedback-warning)] bg-[color-mix(in_srgb,var(--color-feedback-warning)_16%,var(--color-surface-default))] border-[color-mix(in_srgb,var(--color-feedback-warning)_35%,var(--color-border-default))]"
        : feedback?.kind === "success"
          ? "text-[var(--color-feedback-success)] bg-[color-mix(in_srgb,var(--color-feedback-success)_16%,var(--color-surface-default))] border-[var(--color-feedback-success)]"
          : "text-[var(--color-text-muted)] bg-[var(--color-surface-canvas)] border-[var(--color-border-default)]";

  const discardPrompt =
    pendingDiscard && sessionConflict.prompt ? sessionConflict.prompt : null;

  const resolvedName = draftName.trim() || DEFAULT_PROJECT_NAME;

  return (
    <div className="space-y-2">
      <div>
        <label htmlFor="scientific-project-name" className={fieldLabel}>
          Mi proyecto
        </label>
        <input
          id="scientific-project-name"
          type="text"
          value={draftName}
          onChange={(event) => setDraftName(event.target.value)}
          placeholder="Nombre del proyecto"
          className={`${inputField} mt-0.5`}
        />
        <p
          className={`text-[11px] mt-1 font-medium ${autosaveIndicator.className}`}
          role="status"
          aria-live="polite"
        >
          {autosaveIndicator.label}
        </p>
        {projectSizeMessage ? (
          <p className="text-[11px] text-[var(--color-feedback-warning)] mt-0.5">
            {projectSizeMessage}
          </p>
        ) : null}
      </div>

      {recoveryPrompt && recoveryPromptMessage ? (
        <div className={promptBannerClass} role="status" aria-live="polite">
          <p className="font-semibold">Recuperación de borrador</p>
          <p>{recoveryPromptMessage}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void onRestoreRecovery?.()}
              className={promptPrimaryBtnClass}
            >
              Recuperar borrador
            </button>
            <button
              type="button"
              onClick={onDismissRecovery}
              className={promptSecondaryBtnClass}
            >
              {formatPersistenceConflictResolutionLabel("KEEP_CURRENT")}
            </button>
          </div>
        </div>
      ) : null}

      {pendingFileOpenConflict?.view.prompt ? (
        <div className={promptBannerClass} role="status" aria-live="polite">
          <p className="font-semibold">Conflicto al abrir archivo</p>
          <p>{pendingFileOpenConflict.view.prompt}</p>
          <div className="flex flex-wrap gap-2">
            {pendingFileOpenConflict.view.shouldBlock ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    void onResolvePendingFileOpenConflict?.("DISCARD_AND_LOAD")
                  }
                  className={promptPrimaryBtnClass}
                >
                  {formatPersistenceConflictResolutionLabel("DISCARD_AND_LOAD")}
                </button>
                <button
                  type="button"
                  onClick={() => onDismissPendingFileOpenConflict?.()}
                  className={promptSecondaryBtnClass}
                >
                  {formatPersistenceConflictResolutionLabel("CANCEL")}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() =>
                    void onResolvePendingFileOpenConflict?.("LOAD_INCOMING")
                  }
                  className={promptPrimaryBtnClass}
                >
                  {formatPersistenceConflictResolutionLabel("LOAD_INCOMING")}
                </button>
                <button
                  type="button"
                  onClick={() => onDismissPendingFileOpenConflict?.()}
                  className={promptSecondaryBtnClass}
                >
                  {formatPersistenceConflictResolutionLabel("CANCEL")}
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}

      {discardPrompt ? (
        <div className={promptBannerClass} role="status" aria-live="polite">
          <p className="font-semibold">Cambios sin guardar</p>
          <p>{discardPrompt}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={confirmDiscard}
              className={promptPrimaryBtnClass}
            >
              {formatPersistenceConflictResolutionLabel("DISCARD_AND_LOAD")}
            </button>
            <button
              type="button"
              onClick={cancelDiscard}
              className={promptSecondaryBtnClass}
            >
              {formatPersistenceConflictResolutionLabel("CANCEL")}
            </button>
          </div>
        </div>
      ) : null}

      <div className="space-y-1">
        <button type="button" onClick={requestNewProject} className={`w-full h-8 ${btnSecondary}`}>
          Nuevo
        </button>
        <button
          ref={openProjectButtonRef}
          type="button"
          onClick={requestOpenProject}
          className={`w-full h-8 ${btnSecondary}`}
          title={`Abrir archivo de proyecto ${PROJECT_FILE_EXTENSION}`}
        >
          Abrir
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={`${PROJECT_FILE_EXTENSION},application/vnd.scientific-graph-ai.project+json`}
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => onSaveProject(resolvedName)}
          className={`w-full h-8 ${btnSave}`}
          title={`Guardar como archivo ${PROJECT_FILE_EXTENSION}`}
        >
          Guardar
        </button>
      </div>

      <div className="space-y-1">
        <button
          type="button"
          onClick={() => setMoreOpen((open) => !open)}
          className={`w-full h-8 ${btnSecondary}`}
          aria-expanded={moreOpen}
        >
          {moreOpen ? "Menos opciones" : "Más opciones"}
        </button>
        {moreOpen ? (
          <div className="space-y-1 rounded-md border border-[var(--color-border-default)]/70 bg-[var(--color-surface-canvas)]/40 p-1.5">
            <p className="px-1 text-[10px] leading-snug text-[var(--color-text-muted)]">
              Archivo del proyecto ({PROJECT_FILE_EXTENSION}): biblioteca local
              del navegador o disco.
            </p>
            {onOpenLocalLibrary ? (
              <button
                type="button"
                onClick={() => void onOpenLocalLibrary()}
                className={`w-full h-8 ${btnSecondary}`}
                title="Abre la biblioteca local de este navegador para recuperar o abrir un proyecto guardado aquí."
                aria-label="Proyectos locales — recuperar proyectos de este navegador"
              >
                Proyectos locales
              </button>
            ) : null}
            {onSaveLocalProject ? (
              <button
                type="button"
                onClick={() => void onSaveLocalProject(resolvedName)}
                className={`w-full h-8 ${btnSave}`}
                title="Guarda el proyecto en la biblioteca local de este navegador (Proyectos locales)."
              >
                Guardar localmente
              </button>
            ) : null}
          </div>
        ) : null}
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
