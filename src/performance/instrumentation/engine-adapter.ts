/**
 * PERFORMANCE-I2 — ENGINE public-seam read-only adapter.
 *
 * Observes `@/engine` public surface availability without invoking workflows,
 * commands, lifecycle transitions, or composition bootstrap.
 */

import {
  activateDocument,
  activateWorkspace,
  closeProject,
  configureEngine,
  createProject,
  executeCommand,
  exportProject,
  importDataset,
  initializeApplication,
  openProject,
  saveProject,
  shutdownApplication,
} from "@/engine";
import type { MeasurementObservationInput } from "../measurement/types";
import type { AdapterObservationBatch } from "./types";

/** P4-documented ENGINE public operation labels (allowlist; not private modules). */
export const ENGINE_PUBLIC_OPERATION_LABELS = [
  "createProject",
  "openProject",
  "closeProject",
  "saveProject",
  "importDataset",
  "exportProject",
  "initializeApplication",
  "activateWorkspace",
  "activateDocument",
  "shutdownApplication",
  "executeCommand",
  "configureEngine",
] as const;

export type EnginePublicOperationLabel = (typeof ENGINE_PUBLIC_OPERATION_LABELS)[number];

const ENGINE_PUBLIC_FNS: Record<EnginePublicOperationLabel, unknown> = {
  createProject,
  openProject,
  closeProject,
  saveProject,
  importDataset,
  exportProject,
  initializeApplication,
  activateWorkspace,
  activateDocument,
  shutdownApplication,
  executeCommand,
  configureEngine,
};

export function isEnginePublicOperationLabel(
  label: string,
): label is EnginePublicOperationLabel {
  return (ENGINE_PUBLIC_OPERATION_LABELS as readonly string[]).includes(label);
}

/**
 * Read-only: emit one observation per public facade export confirming it is a function.
 * Does not call any ENGINE API.
 */
export function observeEnginePublicSurface(
  collectedAtMs: number,
): AdapterObservationBatch {
  const observations: MeasurementObservationInput[] = ENGINE_PUBLIC_OPERATION_LABELS.map(
    (label, index) => ({
      observationId: `engine.surface.${label}`,
      sourceLabel: "engine",
      signalName: `public.${label}.available`,
      numericValue: typeof ENGINE_PUBLIC_FNS[label] === "function" ? 1 : 0,
      collectedAtMs: collectedAtMs + index,
    }),
  );

  return {
    seamId: "engine",
    collectedAtMs,
    observations,
  };
}
