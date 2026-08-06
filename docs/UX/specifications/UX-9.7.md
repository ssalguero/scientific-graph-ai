# UX-9.7 — Undo / Redo Integration

> **Architectural principles:**
> - Visual Integration of certified UX-1 → UX-8 infrastructure (no parallel stack).
> - ProductCompositionHost = sole authorized composition point.
> - Thin History Adapter = sole UX-9.7 exception (not a Registry).
> - Structural Undo / Redo only · no domain inversion.
> - History State Canonical · Identity · Overlay Ownership · Execution Ownership.
> - Visual Priority Active > Focused > Selected > Hover > Keyboard Navigation > Discoverability.
> - Undo / Redo indicators are additive · never change the hierarchy.
> - Small Incremental Visual Integration — extends UX-9.6; never replaces the host.
> - Architecture SSOT: [`UX-9-architecture.md`](./UX-9-architecture.md).

**Épica:** UX-9 — Productivity Layer  
**Microfase:** UX-9.7 — Undo / Redo Integration  
**Fecha:** 2026-08-05  
**Prerrequisitos:** UX-8 RELEASE CERTIFIED ([`UX-8.10.md`](./UX-8.10.md)) · UX-9.0 FROZEN · UX-9.1 COMPLETE · UX-9.2 COMPLETE · UX-9.3 COMPLETE · UX-9.4 COMPLETE · UX-9.5 COMPLETE · UX-9.6 COMPLETE · Architecture SSOT FROZEN  
**SSOT de arquitectura:** [`UX-9-architecture.md`](./UX-9-architecture.md)  
**SSOT de serie:** [`UX-9.0-roadmap.md`](./UX-9.0-roadmap.md)

**Declaración:**

```text
UX-9.7 = Undo / Redo Integration
SCOPE = ThinHistoryAdapter · UndoRedoBridge · UndoRedoDomHost
        · InteractionCommandBridge envelope reuse
        · undo/redo chrome · docs · validate:ux-9.7
Visual Priority = Active > Focused > Selected > Hover > Keyboard Navigation > Discoverability
Undo / Redo = additive indicators · outside cascade
History Entry = accepted === true only
Undo Semantics = structural only · no domain inversion
Thin History Adapter = push · undo · redo · canUndo · canRedo
History State Canonical = public canUndo · canRedo only · stacks private
History Identity = same reference · no clone · no copy · no normalize
History Canonical = InteractionCommandBridge.recordAccepted only
Command Envelope Reuse = history.undo · history.redo · palette.execute unchanged
History Ownership = Adapter stores · Bridge orchestrates · Dispatcher dispatches
Execution Ownership = executeUndo / executeRedo via InteractionCommandBridge only
History Overlay Ownership = UndoRedoBridge only
Feedback Lifetime = ephemeral · auto disappear
DOM Freeze = UndoRedoDomHost sole Ctrl/Cmd+Z · Shift+Z · Y
NO new Registry · Provider · Context · Dispatcher · Contract
Token Freeze = UI_TOKENS + existing CSS variables only
Small Incremental Visual Integration = VIGENTE
Architecture Freeze UX-9 = VIGENTE
Series Closure = last functional Productivity microphase
Next: UX-9.8 Workspace Polish + Diagnostics
```

---

## Executive Summary

UX-9.7 integrates visible **Undo / Redo** into the Productivity Layer by
connecting accepted Interaction Command outcomes to a Thin History Adapter and
ephemeral FloatingWindow chrome — without DevTools and without building a
domain history engine or parallel base infrastructure.

Undo / Redo are **structural only**: stacks, availability, and feedback.
There is **no domain inversion**. Execution remains shape-only dispatch through
the certified InteractionCommandDispatcher (UX-8.7).

```text
ProductCompositionHost
        ↓
WindowManager
        ↓
FocusProvider → SelectionProvider → HoverProvider
        ↓
KeyboardNavigationProvider → ClipboardProvider
        ↓
InteractionCommandProvider
        ↓
seeds…
        ↓
KeyboardNavigationDomHost → ClipboardDomHost → CommandPaletteDomHost
        ↓
UndoRedoDomHost
        ↓
application tree → FloatingWindowBridge
        ↓
FloatingWindow chrome (Undo / Redo availability · executed feedback)
```

**Target Architecture:**

```text
UndoRedoDomHost
        ↓
UndoRedoBridge
        ├── overlay + feedback
        ├── executeUndo()
        ├── executeRedo()
        └── recordAccepted()
        ↓
ThinHistoryAdapter
        ├── push()
        ├── undo() / redo()
        └── canUndo / canRedo
        ↓
InteractionCommandBridge
        ↓
InteractionCommandDispatcher
        ↓
FloatingWindow feedback
```

**Small Incremental Visual Integration:** UX-9.7 extends UX-9.6. It never
replaces ProductCompositionHost. Future UX-9 phases continue to extend this
host rather than restructuring composition.

---

## Scope Fence

**Create**

- `docs/UX/UX-9.7.md`
- `scripts/validate-ux-9.7.ts`
- `src/components/windows/history/ThinHistoryAdapter.ts`
- `src/components/windows/history/UndoRedoBridge.ts`
- `src/components/windows/history/UndoRedoDomHost.tsx`
- `src/components/windows/history/index.ts`

**Modify**

- `src/components/windows/commands/InteractionCommandBridge.ts`
- `src/components/windows/ProductCompositionHost.tsx`
- `src/components/windows/FloatingWindow.tsx`
- `docs/UX/UX-9.0-roadmap.md`
- `package.json`

**Never modify**

- `src/ui/**`
- `src/ui/interaction-commands/**`
- `src/ui/palette/**`
- `src/ui/clipboard/**`
- `src/ui/focus/**`
- `src/ui/selection/**`
- `src/ui/hover/**`
- `src/ui/keyboard-nav/**`
- `FloatingWindowBridge.tsx`
- WindowRegistry
- Runtime
- `scientific/**`
- `page.tsx`
- Historical validators

---

## Architecture

Undo / Redo live exclusively in the Productivity Layer under
`src/components/windows/history/`. The Adapter is pure. The Bridge owns overlay
and feedback. The DomHost captures shortcuts. FloatingWindow observes only.

InteractionCommandBridge remains the sole envelope + dispatch authority and the
sole caller of `recordAccepted()` after accepted non-history commands.

---

## History Entry Freeze

Only InteractionCommand objects with `accepted === true` enter history.
Rejected commands are never recorded.

---

## Undo Semantics Freeze

Undo / Redo are structural only.
They provide undoStack / redoStack (private), availability, and feedback.
No domain rollback.

---

## Thin History Adapter Freeze

ThinHistoryAdapter owns ONLY:

- `push`
- `undo`
- `redo`
- `canUndo`
- `canRedo`

No React. No registries. No WindowManager. No business logic.

---

## History State Canonical Freeze

Public Adapter state exposes ONLY:

- `canUndo`
- `canRedo`

Stacks remain private.
UI never inspects stacks.

---

## History Identity Freeze

Accepted InteractionCommand references are stored unchanged.
No clone. No copy. No normalize.
`undo()` / `redo()` return the same reference.

---

## History Canonical Freeze

Only InteractionCommandBridge may call `undoRedoBridge.recordAccepted()`.
No other component may push history.

---

## Command Envelope Reuse Freeze

InteractionCommandBridge extends `createCommandEnvelope()` with:

- `history.undo`
- `history.redo`

Existing `palette.execute` behavior remains unchanged.

---

## History Ownership Freeze

- ThinHistoryAdapter stores history.
- InteractionCommandBridge dispatches.
- UndoRedoBridge orchestrates.
- No layer executes business logic.

---

## Execution Ownership Freeze

UndoRedoBridge `executeUndo()` / `executeRedo()` may dispatch only through
InteractionCommandBridge.
Never directly through Dispatcher.

---

## History Overlay Ownership Freeze

Overlay state, feedback, and availability belong ONLY to UndoRedoBridge.
ThinHistoryAdapter remains pure.
FloatingWindow is observe-only.
DomHost never owns overlay state.

---

## Undo / Redo Operations Freeze

**Supported:** Undo · Redo

**Forbidden:** Timeline · History browser · Persistence · Snapshots ·
Checkpointing · Branching · Merge

---

## History Success Freeze

```text
dispatch
  ↓
accepted
  ↓
history update
  ↓
overlay update
  ↓
feedback

Rejected dispatch
  ↓
no history mutation
```

---

## Undo / Redo Feedback Freeze

Feedback kinds:

- undo available
- redo available
- undo executed
- redo executed

Never mutate Workspace · Focus · Selection · Hover · Keyboard · Clipboard ·
Discoverability.

---

## Feedback Lifetime Freeze

Feedback is ephemeral and auto disappears.
Never persistent.

---

## DOM Freeze

UndoRedoDomHost captures ONLY:

- Ctrl/Cmd+Z
- Ctrl/Cmd+Shift+Z
- Ctrl/Cmd+Y

No `document.addEventListener()`.
No `window.addEventListener()`.

---

## Visual Priority Freeze

```text
Workspace Active
  >
Focused
  >
Selected
  >
Hover
  >
Keyboard Navigation
  >
Discoverability
```

Undo / Redo indicators are additive only.

---

## Token Freeze

Use ONLY `UI_TOKENS`, existing CSS variables, and existing design tokens.

---

## Paint Independence Freeze

Freeze only:

```text
Adapter snapshot
  ↓
UndoRedoBridge overlay
  ↓
FloatingWindow chrome
```

No React repaint mechanism is frozen.

---

## Provider Composition Freeze

No new Provider.
No new Context.
UndoRedoDomHost is nested after CommandPaletteDomHost.

```text
KeyboardNavigationDomHost
  → ClipboardDomHost
    → CommandPaletteDomHost
      → UndoRedoDomHost
        → children
```

---

## Dependency Rule

History never mutates Workspace · Focus · Selection · Hover · Keyboard ·
Clipboard · Window lifecycle.
History → Interaction Commands only (via InteractionCommandBridge).

FloatingWindow remains observe-only for undo/redo overlay and feedback.

---

## Authorities

| Domain | Authority |
|--------|-----------|
| Workspace | WindowManager |
| Focus | FocusRegistry |
| Selection | SelectionRegistry |
| Hover | HoverRegistry |
| Keyboard | KeyboardNavigationRegistry |
| Clipboard | ClipboardRegistry |
| Interaction | InteractionCommandDispatcher |
| History | ThinHistoryAdapter |
| Overlay | UndoRedoBridge |
| Chrome | FloatingWindow |

---

## Visible User Outcome

### Visible Changes

- Ctrl/Cmd+Z performs Undo
- Ctrl/Cmd+Shift+Z and Ctrl/Cmd+Y perform Redo
- Undo availability indicator on window chrome when undo is possible
- Redo availability indicator on window chrome when redo is possible
- Ephemeral “Undone” / “Redone” / availability feedback after operations

### Reused Infrastructure

- InteractionCommandDispatcher (UX-8.7)
- InteractionCommandProvider / useInteractionCommands
- InteractionCommandBridge (envelope + dispatch)
- ProductCompositionHost composition
- FloatingWindow observe-only chrome pattern (UX-9.5 / UX-9.6)
- UI_TOKENS + existing CSS variables

### User Verification

Without DevTools:

1. Open the product surface under ProductCompositionHost.
2. Execute a palette command (Ctrl/Cmd+K → Enter) so history records an accepted command.
3. Observe the Undo availability badge.
4. Press Ctrl/Cmd+Z → observe Undone feedback and Redo availability.
5. Press Ctrl/Cmd+Y or Ctrl/Cmd+Shift+Z → observe Redone feedback.

---

## Acceptance Criteria

- ThinHistoryAdapter · UndoRedoBridge · UndoRedoDomHost exist
- Only accepted commands enter history
- Stacks private · public canUndo / canRedo only
- Same InteractionCommand reference preserved
- recordAccepted only from InteractionCommandBridge
- executeUndo / executeRedo via InteractionCommandBridge only
- DomHost captures Z / Shift+Z / Y without global listeners
- FloatingWindow observe-only chrome
- `validate:ux-9.7` passes
- No domain history engine
- No new Registry / Provider / Context / Dispatcher

---

## Protected Files

Never modified by UX-9.7:

- `src/ui/**` (including interaction-commands, palette, clipboard, focus, selection, hover, keyboard-nav)
- `FloatingWindowBridge.tsx`
- WindowRegistry
- Runtime / `scientific/**`
- `page.tsx`
- Historical validators (`validate-ux-9.1` … `validate-ux-9.6`)

---

## Gate

```text
docs/UX/UX-9.7.md
scripts/validate-ux-9.7.ts
package.json → validate:ux-9.7
```

Run: `npm run validate:ux-9.7`

---

## Series Closure Note

After UX-9.7 no new Productivity capabilities are introduced.

- UX-9.8 → Workspace Polish + Diagnostics
- UX-9.9 → Documentation Freeze
- UX-9.10 → Release Certification

UX-9.7 is the last functional Productivity microphase of UX-9.

---

## Next UX-9.8

**Next microphase → UX-9.8 (Workspace Polish + Diagnostics)**

Focus: visual cohesion and diagnostics — not new productivity capabilities.
