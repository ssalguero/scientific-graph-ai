/**
 * ENGINE Domain — Default composition root (ENGINE-internal).
 * OWNERSHIP: Wires WorkflowEngine + CommandOrchestrator + Project + Session +
 * Import/Export + Document + Lifecycle Product Flows.
 * Not part of the consumer Application API — public facades use the default instance.
 */

import {
  type DocumentEngine,
  type DocumentNotificationPort,
} from "../business/document";
import { createProjectEngine, type ProjectEngine } from "../business/project";
import {
  createExportCoordinator,
  createLibProjectExportAdapter,
  type ExportCoordinator,
  type ExportPort,
} from "../coordination/export";
import {
  createImportCoordinator,
  createLibImportAdapter,
  type ImportCoordinator,
  type ImportPort,
} from "../coordination/import";
import {
  createLocalProjectAdapter,
  type LocalProjectAdapter,
  type LocalProjectAdapterOptions,
} from "../coordination/project";
import {
  createInjectableRuntimePort,
  createNoOpRuntimePort,
  type InjectableRuntimeHooks,
  type RuntimePort,
} from "../coordination/runtime";
import {
  createInjectableAutosavePort,
  createInjectableRestoreSessionPort,
  createInjectableSessionSavePort,
  createNoOpSessionPorts,
  createSessionCoordinator,
  type InjectableAutosaveController,
  type InjectableRestoreEngine,
  type SessionCoordinationPorts,
  type SessionCoordinator,
} from "../coordination/session";
import {
  createInjectableWindowsPort,
  createNoOpWindowsPort,
  type InjectableWindowsHooks,
  type WindowsPort,
} from "../coordination/windows";
import {
  createInjectableWorkspacePort,
  createNoOpWorkspacePort,
  type InjectableWorkspaceHooks,
  type WorkspacePort,
} from "../coordination/workspace";
import { registerImportExportProductFlows } from "../flows/register-import-export-flows";
import { registerLifecycleProductFlows } from "../flows/register-lifecycle-flows";
import { registerProjectProductFlows } from "../flows/register-project-flows";
import { registerSessionProductFlows } from "../flows/register-session-flows";
import {
  createLifecycleDiagnosticsReporter,
  createWorkflowDiagnosticsReporter,
  type LifecycleDiagnostics,
  type WorkflowDiagnostics,
} from "../diagnostics";
import { createCommandOrchestrator } from "../orchestration/CommandOrchestrator";
import type {
  CommandOrchestrator,
  WorkflowEngine,
} from "../orchestration/interfaces";
import {
  createLifecycleCoordinator,
  type LifecycleCoordinator,
  type LifecycleCoordinatorOptions,
  type SessionShutdownPort,
} from "../orchestration/LifecycleCoordinator";
import { createWorkflowEngine } from "../orchestration/WorkflowEngine";

export type ComposeEngineSessionOptions = {
  /**
   * Full Session ports override. When omitted, builds from injectable deps or no-ops.
   */
  readonly ports?: SessionCoordinationPorts;
  /** Injectable restore engine (SessionRestoreEngine or fake). */
  readonly restoreEngine?: InjectableRestoreEngine;
  /** Injectable autosave controller (flush API only). */
  readonly autosaveController?: InjectableAutosaveController | null;
  /**
   * When true (default), SessionSavePort flushes autosave after project save if available.
   */
  readonly enableFlushOnProjectSave?: boolean;
};

export type ComposeEngineImportOptions = {
  /** Override ImportPort (fake in tests; default = lib import adapter). */
  readonly port?: ImportPort;
};

export type ComposeEngineExportOptions = {
  /** Override ExportPort (fake in tests; default = lib project export adapter). */
  readonly port?: ExportPort;
};

export type ComposeEngineLifecycleOptions = {
  /** Full RuntimePort override. */
  readonly runtime?: RuntimePort;
  /** Injectable Runtime hooks (ignored when runtime is set). */
  readonly runtimeHooks?: InjectableRuntimeHooks | null;
  /** Full WorkspacePort override. */
  readonly workspace?: WorkspacePort;
  /** Injectable Workspace hooks (ignored when workspace is set). */
  readonly workspaceHooks?: InjectableWorkspaceHooks | null;
  /** Full WindowsPort override. */
  readonly windows?: WindowsPort;
  /** Injectable Windows hooks (ignored when windows is set). */
  readonly windowsHooks?: InjectableWindowsHooks | null;
  /** Optional Session shutdown coordination. */
  readonly sessionShutdown?: SessionShutdownPort | null;
  /** Document notification port override. */
  readonly documentNotifications?: DocumentNotificationPort;
  /** Pre-built DocumentEngine (tests). */
  readonly documentEngine?: DocumentEngine;
  /** Pre-built LifecycleCoordinator (tests — skips port wiring). */
  readonly lifecycleCoordinator?: LifecycleCoordinator;
  /** Shared lifecycle diagnostics (ENGINE-10). */
  readonly diagnostics?: LifecycleDiagnostics;
};

export type ComposeEngineOptions = {
  /** Local project adapter options (inject repo for tests / IndexedDB later). */
  readonly adapterOptions?: LocalProjectAdapterOptions;
  readonly workflowEngine?: WorkflowEngine;
  readonly commandOrchestrator?: CommandOrchestrator;
  /**
   * Shared workflow/command diagnostics reporter (ENGINE-10).
   * When omitted, composition creates one reporter shared by WorkflowEngine + CommandOrchestrator.
   */
  readonly diagnostics?: WorkflowDiagnostics;
  /** ENGINE-5: optional Session coordination deps (defaults to no-op stubs). */
  readonly session?: ComposeEngineSessionOptions;
  /** ENGINE-6: optional Import Dataset port override. */
  readonly import?: ComposeEngineImportOptions;
  /** ENGINE-6: optional Export Results port override. */
  readonly export?: ComposeEngineExportOptions;
  /** ENGINE-7: optional Lifecycle / Document / Platform port overrides. */
  readonly lifecycle?: ComposeEngineLifecycleOptions;
};

export type ComposedEngine = {
  readonly workflowEngine: WorkflowEngine;
  readonly commandOrchestrator: CommandOrchestrator;
  readonly projectEngine: ProjectEngine;
  readonly projectAdapter: LocalProjectAdapter;
  readonly sessionCoordinator: SessionCoordinator;
  readonly importCoordinator: ImportCoordinator;
  readonly exportCoordinator: ExportCoordinator;
  readonly documentEngine: DocumentEngine;
  readonly lifecycleCoordinator: LifecycleCoordinator;
  /** Shared workflow/command diagnostics (ENGINE-10). */
  readonly diagnostics: WorkflowDiagnostics;
};

function resolveSessionPorts(
  session: ComposeEngineSessionOptions | undefined,
): SessionCoordinationPorts {
  if (session?.ports) {
    return session.ports;
  }

  const hasInjectable =
    session?.restoreEngine != null || session?.autosaveController != null;

  if (!hasInjectable) {
    return createNoOpSessionPorts();
  }

  const restore = session?.restoreEngine
    ? createInjectableRestoreSessionPort(session.restoreEngine)
    : createNoOpSessionPorts().restore;

  const autosave = createInjectableAutosavePort(
    session?.autosaveController ?? null,
  );

  const save = createInjectableSessionSavePort({
    autosave,
    enableFlushOnSave: session?.enableFlushOnProjectSave !== false,
  });

  return { restore, save, autosave };
}

function resolveRuntimePort(
  lifecycle: ComposeEngineLifecycleOptions | undefined,
): RuntimePort {
  if (lifecycle?.runtime) return lifecycle.runtime;
  if (lifecycle?.runtimeHooks) {
    return createInjectableRuntimePort(lifecycle.runtimeHooks);
  }
  return createNoOpRuntimePort();
}

function resolveWorkspacePort(
  lifecycle: ComposeEngineLifecycleOptions | undefined,
): WorkspacePort {
  if (lifecycle?.workspace) return lifecycle.workspace;
  if (lifecycle?.workspaceHooks) {
    return createInjectableWorkspacePort(lifecycle.workspaceHooks);
  }
  return createNoOpWorkspacePort();
}

function resolveWindowsPort(
  lifecycle: ComposeEngineLifecycleOptions | undefined,
): WindowsPort {
  if (lifecycle?.windows) return lifecycle.windows;
  if (lifecycle?.windowsHooks) {
    return createInjectableWindowsPort(lifecycle.windowsHooks);
  }
  return createNoOpWindowsPort();
}

/**
 * Compose ENGINE orchestration with Project + Session + Import/Export +
 * Lifecycle Product Flows registered.
 */
export function composeEngine(
  options: ComposeEngineOptions = {},
): ComposedEngine {
  const projectAdapter = createLocalProjectAdapter(options.adapterOptions);
  const projectEngine = createProjectEngine({ persistence: projectAdapter });
  const sessionCoordinator = createSessionCoordinator({
    ports: resolveSessionPorts(options.session),
  });

  const importPort = options.import?.port ?? createLibImportAdapter();
  const importCoordinator = createImportCoordinator({ port: importPort });

  const exportPort =
    options.export?.port ??
    createLibProjectExportAdapter({
      repo: projectAdapter.getRepository(),
    });
  const exportCoordinator = createExportCoordinator({ port: exportPort });

  const lifecycleOpts = options.lifecycle;
  const runtime = resolveRuntimePort(lifecycleOpts);
  const workspace = resolveWorkspacePort(lifecycleOpts);
  const windows = resolveWindowsPort(lifecycleOpts);

  const lifecycleDiagnostics =
    lifecycleOpts?.diagnostics ?? createLifecycleDiagnosticsReporter();

  const lifecycleCoordinatorOptions: LifecycleCoordinatorOptions = {
    runtime,
    workspace,
    windows,
    sessionShutdown: lifecycleOpts?.sessionShutdown ?? null,
    documentNotifications: lifecycleOpts?.documentNotifications,
    documentEngine: lifecycleOpts?.documentEngine,
    diagnostics: lifecycleDiagnostics,
  };

  const lifecycleCoordinator =
    lifecycleOpts?.lifecycleCoordinator ??
    createLifecycleCoordinator(lifecycleCoordinatorOptions);

  const documentEngine = lifecycleCoordinator.getDocumentEngine();

  // ENGINE-10: one shared reporter for WorkflowEngine + CommandOrchestrator
  const diagnostics =
    options.diagnostics ?? createWorkflowDiagnosticsReporter();

  const workflowEngine =
    options.workflowEngine ?? createWorkflowEngine({ diagnostics });
  const commandOrchestrator =
    options.commandOrchestrator ??
    createCommandOrchestrator({ workflowEngine, diagnostics });

  registerProjectProductFlows({
    workflowEngine,
    commandOrchestrator,
    projectEngine,
    sessionCoordinator,
  });

  registerSessionProductFlows({
    workflowEngine,
    commandOrchestrator,
    sessionCoordinator,
  });

  registerImportExportProductFlows({
    workflowEngine,
    commandOrchestrator,
    importCoordinator,
    exportCoordinator,
  });

  registerLifecycleProductFlows({
    workflowEngine,
    commandOrchestrator,
    lifecycleCoordinator,
  });

  return {
    workflowEngine,
    commandOrchestrator,
    projectEngine,
    projectAdapter,
    sessionCoordinator,
    importCoordinator,
    exportCoordinator,
    documentEngine,
    lifecycleCoordinator,
    diagnostics,
  };
}

/** Singleton default composition for public facades (ENGINE-4…9). */
let defaultComposition: ComposedEngine | null = null;

export function getDefaultComposition(): ComposedEngine {
  if (!defaultComposition) {
    defaultComposition = composeEngine();
  }
  return defaultComposition;
}

/**
 * Replace the default composition (app bootstrap via `configureEngine`, or tests).
 * Pass `null` to reset so the next getDefaultComposition() rebuilds.
 */
export function setDefaultComposition(
  composition: ComposedEngine | null,
): void {
  defaultComposition = composition;
}

/** Tests alias — same as `setDefaultComposition`. */
export function setDefaultCompositionForTests(
  composition: ComposedEngine | null,
): void {
  setDefaultComposition(composition);
}
