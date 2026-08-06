/**
 * ENGINE Domain — Export Results ports (injectable; no React / no DOM).
 * OWNERSHIP: ENGINE defines ports; project export use-cases fulfill via adapters / fakes.
 *
 * DOM chart capture is intentionally absent — see DEFERRED_EXPORT_CAPABILITIES.
 */

import type { ExportProjectInput, ExportProjectResult } from "./types";

/** Export Project port — maps to exportLocalProjectToSgproj / payload pass-through (or fake). */
export type ExportPort = {
  exportProject(input: ExportProjectInput): Promise<ExportProjectResult>;
};
