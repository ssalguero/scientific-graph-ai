# ENGINE Boundary Enforcement (ENGINE-9)

**Status:** ACTIVE (ENGINE-9 GraphEditor Thinning complete for certified flows)  
**Authority:** ENGINE Implementation Plan · `ARCHITECTURE.md` · Dependency Matrix UX→ENGINE→DATA  
**Exit criteria:** Migrated (certified) Product Flows use ENGINE as the exclusive orchestration path from GraphEditor / app helpers; dual-path allowlist emptied for those symbols.

This document is the honest inventory of what is enforced, what was cut over in ENGINE-9, and what remains outside certified Product Flows.

---

## 1. Certified Product Flows (migrated — exclusive ENGINE path)

| Flow | Public / internal | ENGINE entry | App cutover |
|------|-------------------|--------------|-------------|
| Create Project | public `createProject` | Workflow + `project.create` | Available; durable create via save path |
| Open Project | public `openProject` | Workflow + `project.open` | `localProjectActions` |
| Save Project | public `saveProject` | Workflow + `project.save` | `localProjectActions` |
| Close Project | public `closeProject` | Workflow + `project.close` | GraphEditor new-project + actions |
| Import Dataset | public `importDataset` | Workflow + `dataset.import` | `page.tsx` / GraphEditor import handler |
| Export Results | public `exportProject` | Workflow + `project.export` | `localProjectActions` |
| Restore Session | internal `restoreSession` | Workflow + `session.restore` | Not GraphEditor-owned (Platform Session) |
| Session autosave flush | internal `sessionAutosaveFlush` | Workflow + `session.autosave.flush` | Optional after project save; draft autosave stays lib |
| Initialize Application | Lifecycle `initializeApplication` | LifecycleCoordinator + `app.initialize` | `engineBootstrap` |
| Activate Workspace | Lifecycle `activateWorkspace` | LifecycleCoordinator + `workspace.activate` | Ports no-op until Platform inject |
| Activate Document | Lifecycle `activateDocument` | LifecycleCoordinator + `document.activate` | Available |
| Shutdown Application | Lifecycle `shutdownApplication` | LifecycleCoordinator + `app.shutdown` | Available |

Policy SSOT: `src/engine/internal/boundary-policy.ts`.

**Composition:** App calls `configureEngine({ projectRepository })` via `src/app/engineBootstrap.ts` so IndexedDB matches GraphEditor library UI.

---

## 2. What ENGINE-9 cut over

| Change | Status |
|--------|--------|
| Local open / save / export orchestration → `@/engine` | **Done** (`localProjectActions`) |
| Import Dataset → `importDataset` | **Done** (`page.tsx`) |
| Close Project on new-project UI reset | **Done** |
| IndexedDB injected into `composeEngine` | **Done** (`configureEngine` + bootstrap) |
| Lifecycle `initializeApplication` at bootstrap | **Done** (no-op Platform ports) |
| GraphEditor dual-path allowlist | **Emptied** |
| Presentation / hydrate / Blob download / dirty flags | **Remain in app** (correct UX ownership) |

---

## 3. Remaining non-certified / non-allowlist legacy

These are **not** certified Product Flow dual-path entries (forbidden symbols not used). They stay in app until later phases:

| Path | Role |
|------|------|
| `src/app/useProjectDraftAutosave.ts` | IndexedDB draft autosave (`saveLocalProjectDraft`) — not a public ENGINE facade |
| `src/app/useLocalProjectPersistence.ts` | Draft recovery (`openLocalProjectDraft`), library list UI |
| `src/app/projectFileActions.ts` | File dialog .sgproj serialize/hydrate (UX boundary) |
| `src/app/page.tsx` | Scientific analysis, graph math, worksheet, chart export DOM — not Product Flows |
| Chart PNG/SVG/PDF capture | Deferred DOM export (not `exportProject` durable JSON) |

`LEGACY_ORCHESTRATION_ALLOWLIST` is **empty**. Do not call `saveLocalProject` / `openLocalProject` / `exportLocalProjectToSgproj` / `attemptExperimentalImport` from app/UX — use `@/engine`.

---

## 4. Required routing

```text
UX intention / command
  → configureEngine (bootstrap, once)
  → @/engine (Application API)
  → WorkflowEngine / CommandOrchestrator / LifecycleCoordinator
  → coordination adapters
  → DATA / Session / Workspace / Windows / Runtime
```

Forbidden for certified-path code:

```text
UX / page → @/lib/project use-cases | @/lib/import pipeline  (bypass ENGINE)
UX → @/engine/internal|business|coordination|orchestration|flows|diagnostics
```

---

## 5. Validators

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
# Aggregate convenience (ENGINE-10):
npm run validate:engine
```

---

## 6. Next phase

**ENGINE-11 — Domain Certification:** evidence pack vs §15 certification requirements. Do not reopen diagnostics redesign or GraphEditor certified-flow dual-path.
