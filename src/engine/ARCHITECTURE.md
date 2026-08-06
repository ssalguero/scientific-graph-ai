# ENGINE Domain — Architecture Freeze (ENGINE-0)

**Status:** FROZEN (boundaries) · ENGINE-10 Diagnostics & Hardening complete  
**Authority:** ENGINE Implementation Plan · `docs/architecture/*` · `docs/governance/*`  
**Gate:** Architecture + Design (ENGINE-0) · Package Skeleton (ENGINE-1) · Workflow Engine Core (ENGINE-2) · Command Bridge (ENGINE-3) · Project Product Flows (ENGINE-4) · Session Coordination (ENGINE-5) · Import/Export Flows (ENGINE-6) · Document & Lifecycle (ENGINE-7) · Boundary Enforcement (ENGINE-8) · GraphEditor Thinning (ENGINE-9) · Diagnostics & Hardening (ENGINE-10)

This document freezes package boundaries, public surface, and forbidden-import rules.  
Implementations may evolve under later ENGINE-* phases; **boundaries and contract names do not**.

**ENGINE-1:** Public barrels, contract types, orchestrator interfaces, and constructable empty shells are in place.

**ENGINE-2:** Workflow Engine core — registration, lifecycle state machine, ordered pipeline skeleton, diagnostics recording, ValidationCoordinator pass-through hook. Empty registered workflows run to `Completed`.

**ENGINE-3:** Command Orchestrator — business command registry, route to `WorkflowEngine.run`, UX-style intention DTO bridge (plain serializable; no React / `@/ui`). Public `executeCommand` returns Failed for unregistered ids (no throw).

**ENGINE-4:** Project Product Flows — Create / Open / Save / Close registered on the default composition. Project Engine + `LocalProjectAdapter` (temporary `@/lib/project/application/local-project` bridge). Business commands `project.create|open|save|close`. No page / GraphEditor wiring.

**ENGINE-5:** Session Coordination — Restore Session + autosave flush Product Flows via `SessionCoordinator` and injectable Session ports. Optional save coordination after project save (dual-path). Platform adapters wrap non-React Session modules only. No page / GraphEditor wiring. Public Workflow API does **not** yet expose `restoreSession` (internal workflow id + `session.*` commands).

**ENGINE-6:** Import Dataset + Export Results — `importDataset` / `exportProject` Product Flows via ImportCoordinator / ExportCoordinator and injectable ports. Temporary adapters wrap `@/lib/import` and project export use-cases. Chart DOM capture deferred. No page / GraphEditor wiring. Business commands `dataset.import` / `project.export`.

**ENGINE-7:** Document Engine + Lifecycle Coordinator — application init / workspace activate / document activate / shutdown. Injectable Runtime / Workspace / Windows ports (no-op defaults). Lifecycle Product Flows registered as internal workflow ids matching frozen LifecycleApi names. Business commands `app.initialize` / `workspace.activate` / `document.activate` / `app.shutdown`. No page / GraphEditor wiring.

**ENGINE-8:** Boundary Enforcement — UX→ENGINE→DATA is the exclusive *approved* path for certified Product Flows. Validators forbid dual-path orchestration outside an explicit allowlist. `composeEngine` is the single composition root for public facades.

**ENGINE-9:** GraphEditor Thinning — certified flows cut over to `@/engine` (`localProjectActions`, import handler, close on new project). App bootstrap `configureEngine` injects IndexedDB. Dual-path allowlist emptied. GraphEditor retains view state / hydrate / Blob UX. See `BOUNDARY_ENFORCEMENT.md`.

**ENGINE-10:** Diagnostics & Hardening — stable workflow/command error codes, Failed-path diagnostics (incl. failure `code`), optional `compensate` hook on workflow definitions, shared diagnostics in `composeEngine`, ValidationCoordinator injectable rules, lifecycle failure recording. Integration validators via `validate:engine-diagnostics-unit` / `validate:engine`. No public API expansion.
---

## 1. Public API freeze

Consumers (UX, COLLABORATION, PLUGINS) may import **only**:

| Entry | Purpose |
|-------|---------|
| `@/engine` | Application API barrel (`src/engine/index.ts`) |
| `@/engine/contracts` | Type-only contracts (`src/engine/contracts`) |

`src/engine/index.ts` exports **only**:

- Contract **types** from `contracts/`
- Thin facades from `public/` (Workflow / Lifecycle / Command)

It must **not** re-export:

- `internal/`, `business/`, `coordination/`, `orchestration/`
- `flows/` implementations
- `diagnostics/` (non-consumer; internal tracing only)

### Frozen Application API names

**Workflow**

- `createProject`, `openProject`, `closeProject`, `saveProject`
- `importDataset`, `exportProject`

**Lifecycle**

- `initializeApplication`, `activateWorkspace`, `activateDocument`, `shutdownApplication`

**Command**

- `executeCommand(commandId, payload?, context?)`

**Coordination / Result** (type contracts only)

- `ValidationOutcome`, `CompletionReport`, `RollbackRequest`, `CoordinationApi`
- `EngineResult`, `EngineFailure`, `EngineNotificationPayload`

Do **not** invent additional public product APIs in this package without a plan revision.  
Future catalog items (`restoreSession`, `createScientificGraph`) remain off the public Workflow facade until an approved public surface change. ENGINE-5 registers `restoreSession` / `sessionAutosaveFlush` as **internal** workflow ids (WorkflowEngine string registry) with business commands `session.restore` / `session.autosave.flush`. ENGINE-6 registers `exportResults` as an **alias** of frozen public `exportProject` (Product Flow name: Export Results).
---

## 2. Folder responsibility map

| Folder | Single responsibility |
|--------|------------------------|
| `contracts/` | Public types / interfaces (Application API SSOT for shapes) |
| `public/` | Thin facades implementing the public surface |
| `orchestration/` | Orchestrator interfaces + WorkflowEngine / CommandOrchestrator / LifecycleCoordinator / ValidationCoordinator |
| `business/` | Project / Document engines and policies |
| `coordination/` | Adapters to DATA / Session / Workspace / Windows / Runtime |
| `flows/` | Product Flow definitions |
| `diagnostics/` | Workflow tracing (internal — not a consumer API) |
| `internal/` | Private helpers — never imported from UX / DATA / outside ENGINE |
| `__tests__/` | ENGINE tests |

---

## 3. Internal visibility

| Path | Visibility |
|------|------------|
| `index.ts`, `contracts/**`, `public/**` | Public (via `@/engine` / `@/engine/contracts`) |
| `orchestration/**`, `business/**`, `coordination/**`, `flows/**`, `diagnostics/**`, `internal/**` | **ENGINE-internal only** |

Outside `src/engine/**` must not import ENGINE-internal paths (relative or `@/engine/...` deep imports).

---

## 4. Forbidden imports

### Into ENGINE (from outside)

Forbidden for any file outside `src/engine/**`:

- `@/engine/internal/**`, `@/engine/business/**`, `@/engine/coordination/**`
- `@/engine/orchestration/**`, `@/engine/flows/**`, `@/engine/diagnostics/**`
- Relative paths into those folders

Allowed for consumers: `@/engine` and `@/engine/contracts` only.

### From ENGINE (ENGINE ✕ UX)

ENGINE must not import:

- `src/ui/**`, `@/ui/**`
- Presentation UX under `src/components/**` (except Session/Windows **Platform** modules via `coordination/**` — see Session allowlist)
- `src/app/page.tsx`, GraphEditor, or other page hosts

### Session Platform allowlist (ENGINE-5)

`src/components/session/**` is **Platform infrastructure** (misplaced path historically), not UX.

Only files under `src/engine/coordination/session/**` may import:

- `@/components/session/restore`
- `@/components/session/autosave`
- `@/components/session/persistence`
- `@/components/session/snapshots`
- `@/components/session/restorePoints`
- `@/components/session/SessionRegistry` / `SessionTypes` / `SessionDefinition` / `SessionState`

**Forbidden** (even in coordination/session):

- `@/components/session` root barrel
- `SessionProvider` / `SessionBridge` / `SessionContext` (React)

### Scientific / DATA

- ENGINE must not import `@/lib/scientific/**`, `@/lib/graph/**`
- **ENGINE-4 exception:** `coordination/project/**` may import `@/lib/project/**` as a temporary DATA/platform adapter (use-cases / repositories only — no React)
- **ENGINE-6 exception:** `coordination/import/**` may import `@/lib/import/**`; `coordination/export/**` may import `@/lib/project/**` export use-cases
- Never import `@/app/chartExport` or other `@/app/**` / React export UI from ENGINE

### Wiring (ENGINE-8)

- Consumers **may** import `@/engine` and `@/engine/contracts` only.
- Certified Product Flows: ENGINE is the exclusive *approved* orchestration layer.
- GraphEditor / `page.tsx` dual-path to `@/lib/project` / `@/lib/import` remains **allowlisted** until ENGINE-9 (see `BOUNDARY_ENFORCEMENT.md` + `internal/boundary-policy.ts`).
- Do **not** add new dual-path orchestration outside the allowlist.
- Do **not** restructure GraphEditor in ENGINE-8 — that is ENGINE-9.

---

## 5. Product Flow catalog (IDs)

| Module | Flow ID | Public Workflow API | Status |
|--------|---------|---------------------|--------|
| `create-project.ts` | `createProject` | `createProject` | **ENGINE-4 executable** |
| `open-project.ts` | `openProject` | `openProject` | **ENGINE-4 executable** |
| `close-project.ts` | `closeProject` | `closeProject` | **ENGINE-4 executable** |
| `save-project.ts` | `saveProject` | `saveProject` | **ENGINE-4 executable** (+ ENGINE-5 session save hook) |
| `import-dataset.ts` | `importDataset` | `importDataset` | **ENGINE-6 executable** |
| `export-results.ts` | `exportProject` (+ alias `exportResults`) | `exportProject` (Product Flow: Export Results) | **ENGINE-6 executable** |
| `restore-session.ts` | `restoreSession` | future public surface | **ENGINE-5 executable (internal)** |
| `session-autosave-flush.ts` | `sessionAutosaveFlush` | not public | **ENGINE-5 executable (internal)** |
| `initialize-application.ts` | `initializeApplication` | Lifecycle API (not WorkflowApi) | **ENGINE-7 executable (internal)** |
| `activate-workspace.ts` | `activateWorkspace` | Lifecycle API (not WorkflowApi) | **ENGINE-7 executable (internal)** |
| `activate-document.ts` | `activateDocument` | Lifecycle API (not WorkflowApi) | **ENGINE-7 executable (internal)** |
| `shutdown-application.ts` | `shutdownApplication` | Lifecycle API (not WorkflowApi) | **ENGINE-7 executable (internal)** |

Business command ids:

- ENGINE-4: `project.create`, `project.open`, `project.save`, `project.close`
- ENGINE-5: `session.restore`, `session.autosave.flush`
- ENGINE-6: `dataset.import`, `project.export`
- ENGINE-7: `app.initialize`, `workspace.activate`, `document.activate`, `app.shutdown`

---

## 6. Workflow Engine core (ENGINE-2)

Canonical pipeline:

```text
User Request → Business Validation → Workflow Planning → Service Coordination
  → Execution → Verification → Completion
```

Lifecycle states: `Requested → Validated → Prepared → Executing → Completed | Failed`

- `register(definition)` — store by id; optional `execute(ctx)` (omit for empty workflows)
- `run(request)` — drive state machine through pipeline stages
- Unknown id → `Failed` with `ENGINE_WORKFLOW_NOT_REGISTERED`
- `ProjectFlowError` / `SessionFlowError` / `ImportFlowError` / `ExportFlowError` / `DocumentFlowError` / `LifecycleFlowError` in execute → `Failed` with the error's `code`
- `ctx.result` copied to `WorkflowResponse.result` on success
- Diagnostics recorder stores state/stage transitions per `operationId`

---

## 7. Command Bridge (ENGINE-3)

Two-layer model (mandatory):

```text
UX interaction (UX-6) → ENGINE CommandOrchestrator → WorkflowEngine.run
```

- UX owns interaction (palette, shortcuts, enablement, presentation)
- ENGINE owns business routing / validation hooks / sequencing
- ENGINE ✕ UX: no React / `@/ui` imports from ENGINE

| Piece | Role |
|-------|------|
| `BusinessCommandDefinition` | `{ id, workflowId?, handler? }` |
| `CommandOrchestrator.registerHandler` | Register business command |
| `CommandOrchestrator.execute` | Route → WorkflowEngine (default) or custom handler |
| Unregistered id | `Failed` / `ENGINE_COMMAND_NOT_REGISTERED` (no throw) |
| `internal/ux-command-bridge.ts` | Plain serializable UX intention → `EngineCommandRequest` |

---

## 8. Project Product Flows (ENGINE-4)

```text
Public createProject/openProject/saveProject/closeProject
  → WorkflowEngine.run
  → Product Flow execute
  → ProjectEngine
  → LocalProjectAdapter
  → @/lib/project/application/local-project use-cases
```

Composition: `internal/compose.ts` (`composeEngine` / `getDefaultComposition`).

**Parity covered:** durable create/open/save via local-project use-cases + in-memory (or injected) repository; close clears Project Engine active id.

**Parity deferred (ENGINE-9):** file-dialog Blob download, React hydrate apply into GraphEditor, IndexedDB app wiring, integrity-warning UX copy.

---

## 9. Session Coordination (ENGINE-5)

```text
session.restore / restoreSession
  → SessionCoordinator.restoreSession
  → RestoreSessionPort
  → SessionRestoreEngine (Platform) or fake

project.save (optional)
  → ProjectEngine.save (LocalProjectAdapter)
  → SessionCoordinator.coordinateSave
  → SessionSavePort → optional AutosaveCoordinationPort.requestFlush

session.autosave.flush
  → SessionCoordinator.requestAutosaveFlush
  → AutosaveCoordinationPort (SessionAutosaveController.flush)
```

- Default composition uses **no-op** Session ports (safe for Node tests).
- Inject `session.restoreEngine` / `session.autosaveController` / `session.ports` via `composeEngine({ session })`.
- Platform adapters: `createPlatformRestoreSessionPort`, `createPlatformAutosavePort`.
- Session ownership unchanged — ENGINE orchestrates only.
- Dual-path OK: SessionProvider-mounted app behavior unchanged until ENGINE-9 (allowlisted dual-path; ENGINE-8).

---

## 10. Import Dataset + Export Results (ENGINE-6)

```text
Public importDataset / dataset.import
  → WorkflowEngine.run
  → ImportCoordinator.importDataset
  → ImportPort
  → createLibImportAdapter → attemptExperimentalImport (@/lib/import)

Public exportProject / project.export  (Product Flow name: Export Results)
  → WorkflowEngine.run (id exportProject; alias exportResults)
  → ExportCoordinator.exportProject
  → ExportPort
  → createLibProjectExportAdapter → exportLocalProjectToSgproj (@/lib/project)
```

- Composition: `internal/compose.ts` — inject `import.port` / `export.port` via `composeEngine({ import, export })`.
- Default import port = lib import adapter; default export port = lib project export (shared in-memory / injected repo).
- Wizard UI remains UX; ENGINE returns `kind: "wizard"` for workbook paths (dual-path allowlisted until ENGINE-9).
- **Deferred (ENGINE-9):** chart PNG/SVG/PDF DOM capture (`src/app/chartExport.ts`), Blob download / file-dialog, GraphEditor series hydrate cutover.

---

## 11. Document Engine + Application Lifecycle (ENGINE-7)

```text
Public initializeApplication / app.initialize
  → LifecycleCoordinator.initializeApplication
  → RuntimePort.notifyInitialized + WorkspacePort.prepare

Public activateWorkspace / workspace.activate
  → LifecycleCoordinator.activateWorkspace
  → WorkspacePort.activate

Public activateDocument / document.activate
  → LifecycleCoordinator.activateDocument
  → DocumentEngine.activate (ENGINE in-memory registry)
  → WindowsPort.notifyDocumentActivated (optional)

Public shutdownApplication / app.shutdown
  → LifecycleCoordinator.shutdownApplication
  → DocumentEngine.clear + WorkspacePort.clear + SessionShutdownPort? + RuntimePort.notifyShutdown
```

- Composition: `internal/compose.ts` — inject `lifecycle.runtime|workspace|windows|sessionShutdown` via `composeEngine({ lifecycle })`.
- Default Platform ports are **no-ops** (safe for Node tests); injectable hooks/fakes for future wiring.
- Lifecycle Product Flows use **internal** workflow ids matching frozen LifecycleApi names — **not** added to public `WorkflowId` / `WorkflowApi`.
- Document Engine owns an in-memory registry only — does **not** move WindowRegistry.
- Dual-path OK: app / GraphEditor behavior unchanged until ENGINE-9 (allowlisted; ENGINE-8).

---

## 12. Hard constraints (permanent)

- Never render UI
- Never perform scientific calculations
- Never implement persistence
- Never replace Runtime
- Never depend on UX (`ENGINE ✕ UX`)
- Never bypass public contracts for new business paths

---

## 13. Validation

Run:

```bash
npm run validate:engine
# or individually:
npm run validate:engine-boundaries
npm run validate:engine-boundary-unit
npm run validate:engine-workflow-unit
npm run validate:engine-command-unit
npm run validate:engine-project-flows-unit
npm run validate:engine-session-unit
npm run validate:engine-import-export-unit
npm run validate:engine-lifecycle-unit
npm run validate:engine-diagnostics-unit
```

---

## 14. Next phase

**ENGINE-10** (complete): Diagnostics & Hardening — failure codes, compensation hooks, shared diagnostics, integration validators.

**ENGINE-11 — Domain Certification:** evidence pack vs §15 certification requirements. Do not claim Domain Certification complete until ENGINE-11 lands.
