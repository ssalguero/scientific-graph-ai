/**
 * ENGINE Domain — Local project persistence adapter (temporary DATA/platform bridge).
 * OWNERSHIP: ENGINE coordination — delegates to `@/lib/project/application/local-project`
 * use-cases. Does not own IndexedDB schema or serializers.
 *
 * Parity (ENGINE-4 / ENGINE-9):
 * - Covered: create/open/save/close via local-project use-cases + in-memory or injected repo
 * - ENGINE-9: App injects IndexedDB via `configureEngine`; hydrate / Blob download stay in UX
 */

import type { EditorProjectCollectContextV2 } from "@/lib/project/editor-collect-context-v2";
import type {
  LocalProjectRepository,
  LocalProjectResult,
} from "@/lib/project/domain/local-project";
import {
  InMemoryLocalProjectRepository,
  openLocalProject,
  saveLocalProject,
} from "@/lib/project/application/local-project";

import {
  PROJECT_ERROR_CODES,
  ProjectFlowError,
} from "../../business/project/errors";
import type { ProjectPersistencePort } from "../../business/project/ports";
import type {
  CloseProjectInput,
  CloseProjectResult,
  CreateProjectInput,
  CreateProjectResult,
  OpenProjectInput,
  OpenProjectResult,
  ProjectCollectContext,
  SaveProjectInput,
  SaveProjectResult,
} from "../../business/project/types";
import {
  buildEmptyProjectCollectContext,
  ENGINE_DEFAULT_PROJECT_NAME,
} from "./empty-collect-context";

export type LocalProjectAdapterOptions = {
  /** Repository implementation — defaults to in-memory; app injects IndexedDB via configureEngine. */
  readonly repo?: LocalProjectRepository;
};

function unwrapOrThrow<T>(
  result: LocalProjectResult<T>,
  fallbackCode: string,
  fallbackMessage: string,
): T {
  if (result.ok) {
    return result.value;
  }
  const code =
    result.error.code === "NOT_FOUND"
      ? PROJECT_ERROR_CODES.NOT_FOUND
      : result.error.code === "INVALID_NAME"
        ? PROJECT_ERROR_CODES.INVALID_PAYLOAD
        : fallbackCode;
  throw new ProjectFlowError(
    code,
    result.error.message || fallbackMessage,
  );
}

function asCollectContext(
  ctx: ProjectCollectContext,
): EditorProjectCollectContextV2 {
  return ctx as unknown as EditorProjectCollectContextV2;
}

/**
 * Temporary adapter: ProjectPersistencePort → local-project application use-cases.
 */
export class LocalProjectAdapter implements ProjectPersistencePort {
  private readonly repo: LocalProjectRepository;

  constructor(options: LocalProjectAdapterOptions = {}) {
    this.repo = options.repo ?? new InMemoryLocalProjectRepository();
  }

  /** Exposed for tests / composition introspection. */
  getRepository(): LocalProjectRepository {
    return this.repo;
  }

  async create(input: CreateProjectInput): Promise<CreateProjectResult> {
    const name =
      input.name?.trim() ||
      input.ctx?.metadata.name?.trim() ||
      ENGINE_DEFAULT_PROJECT_NAME;
    const ctx =
      input.ctx ??
      buildEmptyProjectCollectContext({
        name,
        id: undefined,
      });

    // Ensure name on metadata matches requested name when ctx was provided.
    const namedCtx: ProjectCollectContext = {
      ...ctx,
      metadata: {
        ...ctx.metadata,
        name,
        updatedAt: new Date().toISOString(),
      },
    };

    const summary = unwrapOrThrow(
      await saveLocalProject({
        repo: this.repo,
        ctx: asCollectContext(namedCtx),
        projectName: name,
        appVersion: input.appVersion,
      }),
      PROJECT_ERROR_CODES.CREATE_FAILED,
      "Failed to create local project",
    );

    return {
      id: summary.id,
      name: summary.name,
      createdAt: summary.createdAt,
      updatedAt: summary.updatedAt,
    };
  }

  async open(input: OpenProjectInput): Promise<OpenProjectResult> {
    const opened = unwrapOrThrow(
      await openLocalProject({
        repo: this.repo,
        id: input.id,
        touchAccess: input.touchAccess,
      }),
      PROJECT_ERROR_CODES.OPEN_FAILED,
      `Failed to open local project ${input.id}`,
    );

    return {
      id: opened.summary.id,
      name: opened.summary.name,
      integrityStatus: opened.integrityStatus,
      patch: opened.patch,
      summary: opened.summary,
    };
  }

  async save(input: SaveProjectInput): Promise<SaveProjectResult> {
    const summary = unwrapOrThrow(
      await saveLocalProject({
        repo: this.repo,
        ctx: asCollectContext(input.ctx),
        projectName: input.projectName,
        appVersion: input.appVersion,
      }),
      PROJECT_ERROR_CODES.SAVE_FAILED,
      "Failed to save local project",
    );

    return {
      id: summary.id,
      name: summary.name,
      updatedAt: summary.updatedAt,
      summary,
    };
  }

  async close(input: CloseProjectInput): Promise<CloseProjectResult> {
    // Close is an ENGINE orchestration concern: clear active document association.
    // Persistence record remains (no delete). File-dialog / React reset stays in UX until ENG-9.
    void input.discardUnsaved;
    return {
      closedId: input.id?.trim() ? input.id.trim() : null,
    };
  }
}

export function createLocalProjectAdapter(
  options?: LocalProjectAdapterOptions,
): LocalProjectAdapter {
  return new LocalProjectAdapter(options);
}
