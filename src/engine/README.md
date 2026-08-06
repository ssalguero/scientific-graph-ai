# ENGINE Domain (`src/engine`)

**Status:** ENGINE-9 GraphEditor Thinning — certified Product Flows exclusive via `@/engine`; dual-path allowlist empty.

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for the frozen public API, folder responsibilities, and forbidden-import rules.  
See **[BOUNDARY_ENFORCEMENT.md](./BOUNDARY_ENFORCEMENT.md)** for certified flows, cutover status, and remaining non-certified app code.

## Ownership

ENGINE is the sole **Application Layer**: Product Flows, business commands, workflow orchestration, and application lifecycle coordination.

| Owns | Does not own |
|------|----------------|
| Business rules, Product Flows, command orchestration | UI / presentation (UX) |
| Application lifecycle transitions | Scientific computation (DATA) |
| Validation pipelines, failure coordination | Persistence mechanisms (Sessions) |
| Composition of Platform + DATA via adapters | Runtime, Windows, Workspace infra |

**Hard constraints:** never render UI; never perform scientific calculations; never implement persistence; never replace Runtime; never depend on UX (`ENGINE ✕ UX`).

## Public surface (frozen)

Consumers may import only:

- `@/engine` — Application API barrel
- `@/engine/contracts` — type contracts (optional)

Do **not** import `business/`, `coordination/`, `orchestration/`, `flows/`, `diagnostics/`, or `internal/` from outside ENGINE.

### Application API names (frozen)

- Workflow: `createProject`, `openProject`, `closeProject`, `saveProject`, `importDataset`, `exportProject`
- Lifecycle: `initializeApplication`, `activateWorkspace`, `activateDocument`, `shutdownApplication`
- Command: `executeCommand`
- Composition (ENGINE-9): `configureEngine`

Public workflow facades delegate to the default composed `WorkflowEngine` with Project + Session + Import/Export Product Flows registered (ENGINE-4/5/6).

Public lifecycle facades delegate to the default composed `LifecycleCoordinator` (ENGINE-7).

Public `executeCommand` delegates to the default composed `CommandOrchestrator`.

Call `configureEngine({ projectRepository })` at app bootstrap so IndexedDB (or test fakes) backs project/export flows.

Business commands:

- Project: `project.create`, `project.open`, `project.save`, `project.close`
- Session (ENGINE-5, internal): `session.restore`, `session.autosave.flush`
- Import / Export (ENGINE-6): `dataset.import`, `project.export`
- Lifecycle (ENGINE-7): `app.initialize`, `workspace.activate`, `document.activate`, `app.shutdown`

## Boundary Enforcement (ENGINE-8/9)

```text
Approved (certified flows):  UX → @/engine → adapters → DATA / Platform
```

- `composeEngine` / `getDefaultComposition` is the single composition root for public facades
- App/UX must not call superseded use-cases (`saveLocalProject`, `openLocalProject`, `exportLocalProjectToSgproj`, `attemptExperimentalImport`)
- ENGINE-9 emptied `LEGACY_ORCHESTRATION_ALLOWLIST` — see `BOUNDARY_ENFORCEMENT.md`

## Project Product Flows (ENGINE-4 + ENGINE-9 cutover)

```text
UX intention → CommandOrchestrator → WorkflowEngine → ProjectEngine → LocalProjectAdapter → local-project use-cases
```

- Temporary adapter under `coordination/project/` (may import `@/lib/project/**`)
- Default composition: `internal/compose.ts`; app injects IndexedDB via `configureEngine`
- GraphEditor open/save/export/close call `@/engine` (presentation glue remains in app helpers)

## Session Coordination (ENGINE-5)

```text
session.restore → SessionCoordinator → RestoreSessionPort → SessionRestoreEngine (or fake)
project.save → ProjectEngine.save → optional SessionSavePort (autosave flush)
session.autosave.flush → SessionCoordinator → AutosaveCoordinationPort.flush
```

- Adapters under `coordination/session/` — injectable ports; Platform adapters wrap non-React Session modules
- Default Session ports are no-ops; inject deps via `composeEngine({ session })`
- Session Provider / Registry / AutosaveScheduler ownership unchanged
- IndexedDB draft autosave (`saveLocalProjectDraft`) remains app-owned until a public draft facade exists

## Import Dataset + Export Results (ENGINE-6)

```text
importDataset / dataset.import → ImportCoordinator → ImportPort → @/lib/import
exportProject / project.export → ExportCoordinator → ExportPort → exportLocalProjectToSgproj
```

- Product Flow name **Export Results**; frozen public / primary flow id **`exportProject`** (alias `exportResults` registered)
- Adapters under `coordination/import/` and `coordination/export/`
- Inject fakes via `composeEngine({ import: { port }, export: { port } })`
- Wizard UI stays in UX; chart PNG/SVG/PDF DOM capture remains app-owned
- ENGINE-9: GraphEditor import / local export call `@/engine`

## Document Engine + Lifecycle (ENGINE-7)

```text
initializeApplication → LifecycleCoordinator → RuntimePort / WorkspacePort
activateWorkspace → LifecycleCoordinator → WorkspacePort
activateDocument → DocumentEngine → WindowsPort (notify)
shutdownApplication → clear ENGINE state + SessionShutdown? + RuntimePort
```

- Document Engine: in-memory register/activate/deactivate (does not own WindowRegistry)
- Injectable Runtime / Workspace / Windows ports under `coordination/{runtime,workspace,windows}/`
- Default ports are no-ops; inject via `composeEngine({ lifecycle })`
- Lifecycle Product Flows registered as internal workflow ids (same names as LifecycleApi)
- ENGINE-9: `initializeApplication` invoked from app bootstrap (no-op Platform ports)

## Workflow Engine (ENGINE-2)

```text
User Request → Business Validation → Workflow Planning → Service Coordination
  → Execution → Verification → Completion
```

Lifecycle: `Requested → Validated → Prepared → Executing → Completed | Failed`

## Command Bridge (ENGINE-3)

```text
UX interaction (UX-6) → CommandOrchestrator → WorkflowEngine.run
```

## Layout (one responsibility per folder)

```text
src/engine/
  index.ts                    # Public Application API only
  contracts/                  # Public types (Application API SSOT)
  public/                     # Thin facades → orchestrators (+ configureEngine)
  orchestration/              # WorkflowEngine / Command / Lifecycle / Validation
  business/                   # Project / Document / policies
  coordination/               # Adapters (project + session + import + export + runtime/workspace/windows)
  flows/                      # Product Flow definitions
  diagnostics/                # Workflow + lifecycle tracing (internal)
  internal/                   # compose + boundary-policy + private helpers
  BOUNDARY_ENFORCEMENT.md     # Certified-flow inventory + remaining non-certified
  __tests__/
```

## Boundary checks

```bash
npm run validate:engine-boundaries
npm run validate:engine-boundary-unit
npm run validate:engine-workflow-unit
npm run validate:engine-command-unit
npm run validate:engine-project-flows-unit
npm run validate:engine-session-unit
npm run validate:engine-import-export-unit
npm run validate:engine-lifecycle-unit
npm run validate:engine-diagnostics-unit
npm run validate:engine
```

## Next phases

- **ENGINE-10:** Diagnostics & failure/compensation hardening — **complete**
- **ENGINE-11:** Domain Certification evidence pack
