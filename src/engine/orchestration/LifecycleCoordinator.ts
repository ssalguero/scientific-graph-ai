/**
 * ENGINE Domain — Lifecycle Coordinator (application lifecycle orchestration).
 * OWNERSHIP: ENGINE owns application lifecycle transitions (init / activate / shutdown).
 * Does NOT own Runtime, Windows, Sessions, or Workspace infrastructure.
 * ENGINE-7: Real orchestration via injectable Platform ports + Document Engine.
 */

import type { DocumentEngine } from "../business/document/DocumentEngine";
import { createDocumentEngine } from "../business/document/DocumentEngine";
import type { DocumentNotificationPort } from "../business/document/ports";
import type { ActivateDocumentInput } from "../business/document/types";
import type { LifecyclePhase } from "../contracts/lifecycle";
import {
  createLifecycleDiagnosticsReporter,
} from "../diagnostics/LifecycleDiagnosticsReporter";
import type {
  LifecycleDiagnosticReport,
  LifecycleDiagnostics,
} from "../diagnostics/lifecycle-types";
import type { RuntimePort } from "../coordination/runtime/ports";
import { createNoOpRuntimePort } from "../coordination/runtime/noop-ports";
import type { WorkspacePort } from "../coordination/workspace/ports";
import { createNoOpWorkspacePort } from "../coordination/workspace/noop-ports";
import type { WindowsPort } from "../coordination/windows/ports";
import { createNoOpWindowsPort } from "../coordination/windows/noop-ports";
import {
  LIFECYCLE_ERROR_CODES,
  LifecycleFlowError,
} from "./lifecycle-errors";
import type { LifecycleCoordinator as LifecycleCoordinatorContract } from "./interfaces";

/** Optional Session shutdown coordination (orchestration only; Sessions own session lifecycle). */
export type SessionShutdownPort = {
  prepareShutdown?(reason?: string): void | Promise<void>;
};

export type LifecycleCoordinatorOptions = {
  readonly documentEngine?: DocumentEngine;
  readonly runtime?: RuntimePort;
  readonly workspace?: WorkspacePort;
  readonly windows?: WindowsPort;
  readonly sessionShutdown?: SessionShutdownPort | null;
  readonly diagnostics?: LifecycleDiagnostics;
  readonly documentNotifications?: DocumentNotificationPort;
};

function parseObjectPayload(
  payload: unknown,
): Record<string, unknown> {
  if (payload == null) return {};
  if (typeof payload !== "object" || Array.isArray(payload)) {
    throw new LifecycleFlowError(
      LIFECYCLE_ERROR_CODES.INVALID_PAYLOAD,
      "Lifecycle payload must be an object or undefined",
    );
  }
  return payload as Record<string, unknown>;
}

function requireReady(phase: LifecyclePhase, operation: string): void {
  if (phase !== "ready") {
    throw new LifecycleFlowError(
      LIFECYCLE_ERROR_CODES.NOT_READY,
      `${operation} requires lifecycle phase "ready" (current: "${phase}")`,
    );
  }
}

/**
 * Lifecycle Coordinator — tracks ENGINE application phase and orchestrates transitions.
 */
export class LifecycleCoordinator implements LifecycleCoordinatorContract {
  private phase: LifecyclePhase = "uninitialized";
  private activeWorkspaceId: string | null = null;
  private readonly documentEngine: DocumentEngine;
  private readonly runtime: RuntimePort;
  private readonly workspace: WorkspacePort;
  private readonly windows: WindowsPort;
  private readonly sessionShutdown: SessionShutdownPort | null;
  private readonly diagnostics: LifecycleDiagnostics;

  constructor(options: LifecycleCoordinatorOptions = {}) {
    this.runtime = options.runtime ?? createNoOpRuntimePort();
    this.workspace = options.workspace ?? createNoOpWorkspacePort();
    this.windows = options.windows ?? createNoOpWindowsPort();
    this.sessionShutdown = options.sessionShutdown ?? null;
    this.diagnostics =
      options.diagnostics ?? createLifecycleDiagnosticsReporter();

    const windows = this.windows;
    const notifications: DocumentNotificationPort =
      options.documentNotifications ??
      {
        async onDocumentActivated(document) {
          await windows.notifyDocumentActivated({
            documentId: document.id,
            title: document.title,
            kind: document.kind,
            workspaceId: document.workspaceId,
          });
        },
        async onDocumentDeactivated(documentId) {
          await windows.notifyDocumentDeactivated(documentId);
        },
      };

    this.documentEngine =
      options.documentEngine ??
      createDocumentEngine({ notifications });
  }

  getPhase(): LifecyclePhase {
    return this.phase;
  }

  getActiveWorkspaceId(): string | null {
    return this.activeWorkspaceId;
  }

  getDocumentEngine(): DocumentEngine {
    return this.documentEngine;
  }

  getDiagnosticsHistory(): readonly LifecycleDiagnosticReport[] {
    return this.diagnostics.getHistory();
  }

  private record(operation: string, message?: string, code?: string): void {
    this.diagnostics.record({
      operation,
      phase: this.phase,
      message,
      code,
    });
  }

  async initializeApplication(payload?: unknown): Promise<void> {
    if (this.phase === "ready" || this.phase === "initializing") {
      throw new LifecycleFlowError(
        LIFECYCLE_ERROR_CODES.ALREADY_INITIALIZED,
        `initializeApplication refused — phase is "${this.phase}"`,
      );
    }
    if (this.phase === "shuttingDown") {
      throw new LifecycleFlowError(
        LIFECYCLE_ERROR_CODES.INVALID_PHASE,
        "initializeApplication refused during shuttingDown",
      );
    }
    // Allow re-init after full shutdown
    if (this.phase !== "uninitialized" && this.phase !== "shutdown") {
      throw new LifecycleFlowError(
        LIFECYCLE_ERROR_CODES.INVALID_PHASE,
        `initializeApplication refused — phase is "${this.phase}"`,
      );
    }

    const data = parseObjectPayload(payload);
    const appId =
      typeof data.appId === "string" && data.appId.trim()
        ? data.appId.trim()
        : "scientific-graph-ai";

    this.phase = "initializing";
    this.record("initializeApplication", `appId=${appId}`);

    try {
      if (this.workspace.prepare) {
        await this.workspace.prepare({
          appId,
          meta: data.meta as Readonly<Record<string, unknown>> | undefined,
        });
      }
      await this.runtime.notifyInitialized({
        appId,
        meta: data.meta as Readonly<Record<string, unknown>> | undefined,
      });
      this.phase = "ready";
      this.record("initializeApplication", "phase=ready");
    } catch (err) {
      this.phase = "uninitialized";
      if (err instanceof LifecycleFlowError) {
        this.record("initializeApplication", err.message, err.code);
        throw err;
      }
      const message =
        err instanceof Error ? err.message : "Application initialize failed";
      this.record(
        "initializeApplication",
        message,
        LIFECYCLE_ERROR_CODES.INIT_FAILED,
      );
      throw new LifecycleFlowError(LIFECYCLE_ERROR_CODES.INIT_FAILED, message);
    }
  }

  async activateWorkspace(payload?: unknown): Promise<void> {
    try {
      requireReady(this.phase, "activateWorkspace");
      const data = parseObjectPayload(payload);
      const workspaceId =
        typeof data.workspaceId === "string" ? data.workspaceId.trim() : "";
      if (!workspaceId) {
        throw new LifecycleFlowError(
          LIFECYCLE_ERROR_CODES.INVALID_PAYLOAD,
          "activateWorkspace requires a non-empty workspaceId",
        );
      }

      this.record("activateWorkspace", `workspaceId=${workspaceId}`);

      const result = await this.workspace.activate({
        workspaceId,
        meta: data.meta as Readonly<Record<string, unknown>> | undefined,
      });
      this.activeWorkspaceId = result.workspaceId || workspaceId;
      this.record(
        "activateWorkspace",
        `activeWorkspaceId=${this.activeWorkspaceId}`,
      );
    } catch (err) {
      if (err instanceof LifecycleFlowError) {
        this.record("activateWorkspace", err.message, err.code);
        throw err;
      }
      const message =
        err instanceof Error ? err.message : "Workspace activate failed";
      this.record(
        "activateWorkspace",
        message,
        LIFECYCLE_ERROR_CODES.WORKSPACE_ACTIVATE_FAILED,
      );
      throw new LifecycleFlowError(
        LIFECYCLE_ERROR_CODES.WORKSPACE_ACTIVATE_FAILED,
        message,
      );
    }
  }

  async activateDocument(payload?: unknown): Promise<void> {
    try {
      requireReady(this.phase, "activateDocument");
      const data = parseObjectPayload(payload);
      const id = typeof data.id === "string" ? data.id.trim() : "";
      if (!id) {
        // Also accept documentId alias for convenience
        const alt =
          typeof data.documentId === "string" ? data.documentId.trim() : "";
        if (!alt) {
          throw new LifecycleFlowError(
            LIFECYCLE_ERROR_CODES.INVALID_PAYLOAD,
            "activateDocument requires a non-empty id (or documentId)",
          );
        }
        await this.activateDocumentInternal({
          id: alt,
          registerIfMissing: data.registerIfMissing !== false,
          title: typeof data.title === "string" ? data.title : undefined,
          kind: typeof data.kind === "string" ? data.kind : undefined,
          workspaceId:
            typeof data.workspaceId === "string"
              ? data.workspaceId
              : this.activeWorkspaceId,
          meta: data.meta as Readonly<Record<string, unknown>> | undefined,
        });
        return;
      }

      await this.activateDocumentInternal({
        id,
        registerIfMissing: data.registerIfMissing !== false,
        title: typeof data.title === "string" ? data.title : undefined,
        kind: typeof data.kind === "string" ? data.kind : undefined,
        workspaceId:
          typeof data.workspaceId === "string"
            ? data.workspaceId
            : this.activeWorkspaceId,
        meta: data.meta as Readonly<Record<string, unknown>> | undefined,
      });
    } catch (err) {
      if (err instanceof LifecycleFlowError) {
        this.record("activateDocument", err.message, err.code);
        throw err;
      }
      if (err instanceof Error && "code" in err) {
        const coded = err as Error & { code: string };
        this.record("activateDocument", coded.message, coded.code);
        throw err;
      }
      throw err;
    }
  }

  private async activateDocumentInternal(
    input: ActivateDocumentInput,
  ): Promise<void> {
    this.record("activateDocument", `id=${input.id}`);
    const result = await this.documentEngine.activate(input);
    this.record(
      "activateDocument",
      `activeDocumentId=${result.document.id}`,
    );
  }

  async shutdownApplication(payload?: unknown): Promise<void> {
    if (this.phase === "shutdown" || this.phase === "uninitialized") {
      // Idempotent shutdown when nothing is running
      this.phase = "shutdown";
      this.record("shutdownApplication", "idempotent");
      return;
    }
    if (this.phase === "shuttingDown") {
      throw new LifecycleFlowError(
        LIFECYCLE_ERROR_CODES.INVALID_PHASE,
        "shutdownApplication already in progress",
      );
    }
    if (this.phase === "initializing") {
      throw new LifecycleFlowError(
        LIFECYCLE_ERROR_CODES.INVALID_PHASE,
        "shutdownApplication refused during initializing",
      );
    }

    const data = parseObjectPayload(payload);
    const reason =
      typeof data.reason === "string" && data.reason.trim()
        ? data.reason.trim()
        : "shutdown";

    this.phase = "shuttingDown";
    this.record("shutdownApplication", `reason=${reason}`);

    try {
      await this.documentEngine.deactivate({});
      this.documentEngine.clear();
      this.activeWorkspaceId = null;

      if (this.workspace.clear) {
        await this.workspace.clear(reason);
      }
      if (this.sessionShutdown?.prepareShutdown) {
        await this.sessionShutdown.prepareShutdown(reason);
      }
      await this.runtime.notifyShutdown({
        reason,
        meta: data.meta as Readonly<Record<string, unknown>> | undefined,
      });

      this.phase = "shutdown";
      this.record("shutdownApplication", "phase=shutdown");
    } catch (err) {
      // Leave phase as shuttingDown on hard failure so retries can be diagnosed
      if (err instanceof LifecycleFlowError) {
        this.record("shutdownApplication", err.message, err.code);
        throw err;
      }
      const message =
        err instanceof Error ? err.message : "Application shutdown failed";
      this.record(
        "shutdownApplication",
        message,
        LIFECYCLE_ERROR_CODES.SHUTDOWN_FAILED,
      );
      throw new LifecycleFlowError(
        LIFECYCLE_ERROR_CODES.SHUTDOWN_FAILED,
        message,
      );
    }
  }
}

/** Factory — constructs a Lifecycle Coordinator with injectable Platform ports. */
export function createLifecycleCoordinator(
  options?: LifecycleCoordinatorOptions,
): LifecycleCoordinator {
  return new LifecycleCoordinator(options);
}
