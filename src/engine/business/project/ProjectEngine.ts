/**
 * ENGINE Domain — Project Engine (business orchestration).
 * OWNERSHIP: ENGINE owns project lifecycle business rules (create/open/close/save).
 * Persistence is delegated to ProjectPersistencePort (coordination adapter).
 * Does not own IndexedDB, file dialogs, or React editor state.
 */

import { PROJECT_ERROR_CODES, ProjectFlowError } from "./errors";
import type { ProjectPersistencePort } from "./ports";
import type {
  CloseProjectInput,
  CloseProjectResult,
  CreateProjectInput,
  CreateProjectResult,
  OpenProjectInput,
  OpenProjectResult,
  SaveProjectInput,
  SaveProjectResult,
} from "./types";

export type ProjectEngineOptions = {
  readonly persistence: ProjectPersistencePort;
};

/**
 * Project Engine — tracks active project and routes lifecycle ops to the persistence port.
 */
export class ProjectEngine {
  private readonly persistence: ProjectPersistencePort;
  private activeProjectId: string | null = null;

  constructor(options: ProjectEngineOptions) {
    this.persistence = options.persistence;
  }

  /** Currently active project id (ENGINE session view — not Platform Session). */
  getActiveProjectId(): string | null {
    return this.activeProjectId;
  }

  async create(input: CreateProjectInput = {}): Promise<CreateProjectResult> {
    const result = await this.persistence.create(input);
    this.activeProjectId = result.id;
    return result;
  }

  async open(input: OpenProjectInput): Promise<OpenProjectResult> {
    if (!input.id || typeof input.id !== "string" || !input.id.trim()) {
      throw new ProjectFlowError(
        PROJECT_ERROR_CODES.INVALID_PAYLOAD,
        "openProject requires a non-empty project id",
      );
    }
    const result = await this.persistence.open(input);
    this.activeProjectId = result.id;
    return result;
  }

  async save(input: SaveProjectInput): Promise<SaveProjectResult> {
    if (!input.ctx || typeof input.ctx !== "object") {
      throw new ProjectFlowError(
        PROJECT_ERROR_CODES.INVALID_PAYLOAD,
        "saveProject requires a collect context (ctx)",
      );
    }
    if (
      typeof input.projectName !== "string" ||
      !input.projectName.trim()
    ) {
      throw new ProjectFlowError(
        PROJECT_ERROR_CODES.INVALID_PAYLOAD,
        "saveProject requires a non-empty projectName",
      );
    }
    const result = await this.persistence.save(input);
    this.activeProjectId = result.id;
    return result;
  }

  async close(input: CloseProjectInput = {}): Promise<CloseProjectResult> {
    const targetId = input.id?.trim() || this.activeProjectId;
    if (!targetId) {
      // Idempotent close when nothing is active — still a successful Product Flow.
      return this.persistence.close({ ...input, id: undefined });
    }
    if (
      input.id &&
      this.activeProjectId &&
      input.id.trim() !== this.activeProjectId
    ) {
      throw new ProjectFlowError(
        PROJECT_ERROR_CODES.NO_ACTIVE,
        `closeProject id "${input.id}" does not match active project "${this.activeProjectId}"`,
      );
    }
    const result = await this.persistence.close({ ...input, id: targetId });
    if (
      this.activeProjectId &&
      (result.closedId === this.activeProjectId || !input.id)
    ) {
      this.activeProjectId = null;
    }
    return result;
  }
}

export function createProjectEngine(
  options: ProjectEngineOptions,
): ProjectEngine {
  return new ProjectEngine(options);
}
