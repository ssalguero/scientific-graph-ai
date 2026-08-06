/**
 * ENGINE Domain — Export Coordinator.
 * OWNERSHIP: ENGINE orchestrates Export Results Product Flow (`exportProject`).
 * Durable project JSON export via ExportPort; chart DOM capture deferred to ENG-8/9.
 */

import { EXPORT_ERROR_CODES, ExportFlowError } from "./errors";
import type { ExportPort } from "./ports";
import type {
  ExportExecutionContext,
  ExportProjectInput,
  ExportProjectResult,
} from "./types";

export type ExportCoordinatorOptions = {
  readonly port: ExportPort;
};

/**
 * Coordinates Export Results / exportProject via ExportPort (lib adapter or fake).
 */
export class ExportCoordinator {
  private readonly port: ExportPort;

  constructor(options: ExportCoordinatorOptions) {
    this.port = options.port;
  }

  /** Export Project — delegates to ExportPort.exportProject. */
  async exportProject(
    input: ExportProjectInput,
    _ctx?: ExportExecutionContext,
  ): Promise<ExportProjectResult> {
    if (input == null || typeof input !== "object") {
      throw new ExportFlowError(
        EXPORT_ERROR_CODES.INVALID_PAYLOAD,
        "exportProject requires payload object",
      );
    }

    if ("mode" in input && input.mode === "payload") {
      if (typeof input.json !== "string" || !input.json.trim()) {
        throw new ExportFlowError(
          EXPORT_ERROR_CODES.INVALID_PAYLOAD,
          "exportProject payload mode requires json: non-empty string",
        );
      }
      return this.port.exportProject(input);
    }

    const projectId =
      "projectId" in input ? input.projectId : undefined;
    if (typeof projectId !== "string" || !projectId.trim()) {
      throw new ExportFlowError(
        EXPORT_ERROR_CODES.INVALID_PAYLOAD,
        "exportProject requires projectId: non-empty string (or mode: payload)",
      );
    }

    return this.port.exportProject({
      mode: "sgproj",
      projectId: projectId.trim(),
    });
  }
}

export function createExportCoordinator(
  options: ExportCoordinatorOptions,
): ExportCoordinator {
  return new ExportCoordinator(options);
}
