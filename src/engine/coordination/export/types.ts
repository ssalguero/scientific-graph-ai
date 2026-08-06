/**
 * ENGINE Domain — Export Results coordination types (orchestration DTOs).
 * OWNERSHIP: ENGINE defines shapes; project serialize / exportLocalProjectToSgproj
 * remain authoritative for durable project export payloads.
 *
 * Product Flow name: **Export Results**
 * Frozen public Workflow API / flow id: `exportProject`
 *
 * Deferred to ENG-8/9 (UI/DOM-only — not orchestrated here):
 * - Chart PNG / SVG / PDF capture via `src/app/chartExport.ts` (html-to-image + DOM)
 * - Blob download / file-dialog UX
 */

/** Export durable project JSON (.sgproj payload) by local project id. */
export type ExportProjectByIdInput = {
  readonly mode?: "sgproj";
  readonly projectId: string;
};

/**
 * Pass-through of an already-serialized project payload (no DOM).
 * Useful when UX collected + serialized and ENGINE only coordinates completion.
 */
export type ExportProjectPayloadInput = {
  readonly mode: "payload";
  readonly json: string;
  readonly projectId?: string;
};

export type ExportProjectInput =
  | ExportProjectByIdInput
  | ExportProjectPayloadInput;

export type ExportProjectResult = {
  readonly format: "sgproj" | "payload";
  readonly json: string;
  readonly projectId?: string;
  readonly byteLength: number;
};

export type ExportExecutionContext = {
  readonly operationId?: string;
  readonly flowId?: string;
  readonly reason?: string;
};

/**
 * Documented deferred export capabilities (not on ExportPort until cutover).
 * Chart capture requires chart DOM — stays in app/UX until ENGINE-8/9.
 */
export const DEFERRED_EXPORT_CAPABILITIES = [
  "chart-png-capture",
  "chart-svg-capture",
  "chart-pdf-export",
  "blob-download-dialog",
] as const;

export type DeferredExportCapability =
  (typeof DEFERRED_EXPORT_CAPABILITIES)[number];
