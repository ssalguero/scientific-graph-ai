# UX-2.10 — Planning Mode Foundation

**Épica:** UX-2 — Screen Migration Foundation  
**Microfase:** UX-2.10 — BUILD (Planning Mode Foundation)  
**Fase:** Build infraestructura de Workspace Modes  
**Fecha:** 2026-07-30  
**Estado:** **UX-2.10 = COMPLETE (awaiting human review)**  
**Prerrequisitos:** [`docs/UX-2.0-roadmap.md`](UX-2.0-roadmap.md) · UX-2.9 COMPLETE · D48 SSOT  

**Declaración:**

```text
UX-2.10 = COMPLETE (planning mode foundation)
SCOPE = workspace/modes/ + WorkspaceContent wiring + PanelProvider initialState?
SSOT = PlanningMode.apply() produces initial PanelState
MODES = pure PanelState producers (never consumers)
REGISTRY = private Record<WorkspaceModeId, WorkspaceMode> in Provider
DEFAULT_PANEL_STATE = synced with Planning (280 / 280 / 240)
NO mode persistence · NO LocalStorage · NO IndexedDB · NO runtime switch UI
NO panel mutations · NO content switching · NO collapse chrome · NO docking
READY FOR HUMAN REVIEW
```

---

## 1. Purpose

Introduce the first Workspace Mode so layout configuration lives in the Mode, not in panels. Planning is the sole mode and only produces the initial `PanelState`.

---

## 2. Architecture

```text
WorkspaceContent (hook-free)
  └── WorkspaceModeProvider
        └── PanelProvider(initialState={PlanningMode.apply()})
              └── PanelResizeProvider
                    └── WorkspaceBodyLayout
```

```text
Planning.apply()
  → PanelState
  → UI
```

**Rule (frozen):** Workspace modes are pure layout producers and never consume `PanelState`.

```text
Planning  →  PanelState     OK
PanelState → Planning       FORBIDDEN
```

| Module | Role |
|--------|------|
| [`WorkspaceMode.ts`](../src/components/workspace/modes/WorkspaceMode.ts) | `WorkspaceModeId`, `WorkspaceMode` |
| [`PlanningMode.ts`](../src/components/workspace/modes/PlanningMode.ts) | `export const PlanningMode` |
| [`WorkspaceModeContext.tsx`](../src/components/workspace/modes/WorkspaceModeContext.tsx) | Context + frozen API |
| [`WorkspaceModeProvider.tsx`](../src/components/workspace/modes/WorkspaceModeProvider.tsx) | `currentMode` + private registry |
| [`useWorkspaceMode.ts`](../src/components/workspace/modes/useWorkspaceMode.ts) | Public hook |
| [`index.ts`](../src/components/workspace/modes/index.ts) | Barrel (registry **not** exported) |

---

## 3. Frozen API

### WorkspaceMode

```ts
type WorkspaceModeId = "planning";

interface WorkspaceMode {
  id: WorkspaceModeId;
  title: string;
  apply(): PanelState;
}
```

### PlanningMode

```ts
export const PlanningMode: WorkspaceMode = { … }
```

Reference shell: `REF_WIDTH = 1120`, `REF_HEIGHT = 1200` → left/right `280`, bottom `240`; all expanded (`*Collapsed: false`).

### Provider

```ts
currentMode: WorkspaceMode
setMode(id: WorkspaceModeId): void
applyMode(id?: WorkspaceModeId): PanelState
```

**`applyMode` behavior (timing-safe):**

```text
applyMode()      → currentMode.apply()
applyMode(id)    → mode = registry[id]; setCurrentMode(mode); return mode.apply()
```

Private (not exported):

```ts
const registry: Record<WorkspaceModeId, WorkspaceMode> = {
  planning: PlanningMode,
};
```

### PanelProvider (additive)

```ts
initialState?: PanelState
// useState(() => ({ ...(initialState ?? DEFAULT_PANEL_STATE) }))
```

No new callbacks. UX-2.8 persistence unchanged.

### Sync chain

```text
Planning.apply()
  → DEFAULT_PANEL_STATE
  → empty storage
  → fromJSON fallback
```

---

## 4. Integration

```tsx
<WorkspaceModeProvider>
  <PanelProvider initialState={PlanningMode.apply()}>
    <PanelResizeProvider>
      <WorkspaceBodyLayout>{workspace}</WorkspaceBodyLayout>
    </PanelResizeProvider>
  </PanelProvider>
</WorkspaceModeProvider>
```

`WorkspaceContent` remains hook-free. Modes are **not** re-exported from the public workspace barrel.

---

## 5. Validation

```bash
npm run validate:ux-2.10
```

Delegates: `validate:ux-2.9`, `tsc --noEmit`.  
Amends: `validate-ux-2.7` / `validate-ux-2.9` accept `<PanelProvider[\s>]` and ModeProvider hierarchy.

---

## 6. OUT

- Analysis / Dashboard / Presentation / Compare / Focus / AI modes
- Dynamic mode registration
- Mode persistence / LocalStorage / IndexedDB / Supabase
- Effects / listeners / shortcuts in modes
- Runtime mode switching UI
- Panel mutations / content switching / resize changes / collapse chrome / docking
- Public workspace barrel exports of modes
- `PanelState` schema reshape
- Modes reading live `PanelState`

---

## 7. Acceptance criteria

| ID | Criterion | Result |
|----|-----------|--------|
| **CA-2.10.1** | `modes/` exact six files; Planning is sole mode | PASS |
| **CA-2.10.2** | `PlanningMode.apply()` produces PanelState; never consumes it | PASS |
| **CA-2.10.3** | Private registry; `applyMode` timing-safe | PASS |
| **CA-2.10.4** | Hierarchy Mode → Panel(initialState) → Resize → Body | PASS |
| **CA-2.10.5** | `DEFAULT_PANEL_STATE` synced 280/280/240 | PASS |
| **CA-2.10.6** | `npm run validate:ux-2.10` PASS | PASS |

---

## 8. STOP

```text
UX-2.10 = COMPLETE (awaiting human review)
API FREEZE = WorkspaceMode · WorkspaceModeId · PlanningMode · WorkspaceModeContext ·
             WorkspaceModeProvider · useWorkspaceMode() · PanelProvider(initialState?) ·
             DEFAULT_PANEL_STATE
Next: UX-2.11 — Collapse/Expand UI (reprogrammed)
Later modes = new const definitions + registry / WorkspaceModeId entries only
Do NOT reopen panel architecture · Do NOT add mode persistence · Do NOT consume PanelState from modes
```
