/**
 * ENGINE Domain — temporary adapter to `@/lib/project` export use-cases.
 * OWNERSHIP: ENGINE coordination only — does not redesign exporters or chart capture.
 *
 * Parity (ENGINE-6):
 * - Covered: exportLocalProjectToSgproj (durable .sgproj JSON), payload pass-through
 * - Deferred to ENG-8/9: chart PNG/SVG/PDF DOM capture (`src/app/chartExport.ts`),
 *   Blob download / file-dialog UX
 */

import type { LocalProjectRepository } from "@/lib/project/domain/local-project";
import { exportLocalProjectToSgproj } from "@/lib/project/application/local-project";

import { EXPORT_ERROR_CODES, ExportFlowError } from "./errors";
import type { ExportPort } from "./ports";
import type { ExportProjectInput, ExportProjectResult } from "./types";

export type LibProjectExportAdapterOptions = {
  readonly repo: LocalProjectRepository;
};

/**
 * Temporary ExportPort → local-project exportLocalProjectToSgproj + payload mode.
 */
export function createLibProjectExportAdapter(
  options: LibProjectExportAdapterOptions,
): ExportPort {
  const { repo } = options;

  return {
    async exportProject(
      input: ExportProjectInput,
    ): Promise<ExportProjectResult> {
      if ("mode" in input && input.mode === "payload") {
        const json = input.json;
        return {
          format: "payload",
          json,
          projectId: input.projectId,
          byteLength: json.length,
        };
      }

      const projectId = input.projectId;
      const result = await exportLocalProjectToSgproj(repo, projectId);
      if (!result.ok) {
        const code =
          result.error.code === "NOT_FOUND"
            ? EXPORT_ERROR_CODES.NOT_FOUND
            : EXPORT_ERROR_CODES.EXPORT_FAILED;
        throw new ExportFlowError(
          code,
          result.error.message || `Export failed for project ${projectId}`,
        );
      }

      return {
        format: "sgproj",
        json: result.value,
        projectId,
        byteLength: result.value.length,
      };
    },
  };
}
