# UX-9.6 — Command Palette + Interaction Commands Integration

> **Architectural principles:**
> - Visual Integration of certified UX-1 → UX-8 infrastructure (no parallel stack).
> - ProductCompositionHost = sole authorized composition point.
> - Visual shell (overlay) belongs to UX-9 · data APIs belong to UX-6.5.
> - Visual Priority Active > Focused > Selected > Hover > Keyboard Navigation > Discoverability.
> - Command Palette is a temporary overlay · never changes the hierarchy.
> - Command Envelope Canonical · Search Purity · Overlay State · Execution Ownership.
> - Legacy Isolation · Module Purity · Paint Independence.
> - Small Incremental Visual Integration — extends UX-9.5; never replaces the host.
> - Architecture SSOT: [`UX-9-architecture.md`](./UX-9-architecture.md).

**Épica:** UX-9 — Productivity Layer  
**Microfase:** UX-9.6 — Command Palette + Interaction Commands Integration  
**Fecha:** 2026-08-05  
**Prerrequisitos:** UX-8 RELEASE CERTIFIED ([`UX-8.10.md`](./UX-8.10.md)) · UX-9.0 FROZEN · UX-9.1 COMPLETE · UX-9.2 COMPLETE · UX-9.3 COMPLETE · UX-9.4 COMPLETE · UX-9.5 COMPLETE · Architecture SSOT FROZEN  
**SSOT de arquitectura:** [`UX-9-architecture.md`](./UX-9-architecture.md)  
**SSOT de serie:** [`UX-9.0-roadmap.md`](./UX-9.0-roadmap.md)

**Declaración:**

```text
UX-9.6 = Command Palette + Interaction Commands Integration
SCOPE = InteractionCommandProvider mount · CommandPaletteBridge
        · InteractionCommandBridge · CommandPaletteDomHost
        · palette chrome · docs · validate:ux-9.6
Visual Priority = Active > Focused > Selected > Hover > Keyboard Navigation > Discoverability
Command Palette = temporary overlay · outside cascade
Overlay Ownership = Productivity Layer only · never src/ui/palette/**
Product Catalog Isolation = local createCommandRegistry(productDefinitions)
Command Envelope Canonical = InteractionCommandBridge.createCommandEnvelope()
Search Purity = query → search(index, query) → results only
Overlay State = open · query · selectedIndex only
Dispatcher Authority = InteractionCommandBridge sole dispatch()
Execution Ownership = Bridge ends at Dispatcher · feedback only
Interaction Success = accepted → positive · rejected → reason · no positive
Command Feedback Lifetime = ephemeral · auto disappear
Legacy Isolation = page.tsx · ScientificWorksheetPanel out of fence
Paint Independence = Dispatcher snapshot → Overlay → chrome · no React mechanism frozen
NO new Registry · Provider · Context · Dispatcher · Contract
Token Freeze = UI_TOKENS + existing CSS variables only
Small Incremental Visual Integration = VIGENTE
Architecture Freeze UX-9 = VIGENTE
Next: UX-9.7 Undo / Redo Integration
```

---

## Executive Summary

UX-9.6 integrates certified **Command Palette** search/catalog APIs (UX-6.5) and
**Interaction Commands** (UX-8.7) into the Productivity Layer so the user can
open a visible Command Palette (Ctrl/Cmd+K), search, navigate, execute, and
receive accepted/rejected feedback — without DevTools and without building
parallel base infrastructure.

The visual overlay is owned exclusively by UX-9 product chrome. UX-6.5 remains
query-only infrastructure. UX-8.7 remains shape-only dispatch. Bridges orchestrate.

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
application tree → FloatingWindowBridge
        ↓
FloatingWindow chrome (palette status · accepted / rejected · execution badge)
```

**Small Incremental Visual Integration:** UX-9.6 extends UX-9.5. It never
replaces ProductCompositionHost. Future UX-9 phases continue to extend this
host rather than restructuring composition.

---

## Scope Fence

**Create**

- `docs/UX/UX-9.6.md`
- `scripts/validate-ux-9.6.ts`
- `src/components/windows/commands/CommandPaletteBridge.ts`
- `src/components/windows/commands/InteractionCommandBridge.ts`
- `src/components/windows/commands/CommandPaletteDomHost.tsx`
- `src/components/windows/commands/index.ts`

**Modify**

- `docs/UX/UX-9.0-roadmap.md`
- `package.json`
- `src/components/windows/ProductCompositionHost.tsx`
- `src/components/windows/FloatingWindow.tsx`

**No other files.** FloatingWindowBridge is not modified.
`src/ui/palette/**` and `src/ui/interaction-commands/**` are never modified
(Module Purity Freezes). Legacy surfaces are not migrated (Legacy Isolation).

---

## Architecture

```text
page.tsx
  └─ ProductCompositionHost
       └─ WindowManager
            └─ FocusProvider
                 └─ SelectionProvider
                      └─ HoverProvider
                           └─ KeyboardNavigationProvider
                                └─ ClipboardProvider
                                     └─ InteractionCommandProvider
                                          ├─ WorkspaceActivationSeed
                                          ├─ FocusSelectionVisualSeed
                                          ├─ HoverVisualSeed
                                          ├─ KeyboardNavigationVisualSeed
                                          ├─ ClipboardVisualSeed
                                          └─ KeyboardNavigationDomHost
                                               └─ ClipboardDomHost
                                                    └─ CommandPaletteDomHost
                                                         └─ SessionProvider → … → FloatingWindow
```

Providers are mounted **only** inside ProductCompositionHost. Never from
`page.tsx`. InteractionCommandProvider is mounted only here.

```text
CommandPaletteDomHost
        ↓
CommandPaletteBridge
        ↓
Local Product Registry (createCommandRegistry(productDefinitions))
        ↓
UX-6.5 Catalog / Index / Search
        ↓
InteractionCommandBridge.createCommandEnvelope()
        ↓
InteractionCommandDispatcher.dispatch()
        ↓
FloatingWindow feedback
```

---

## Command Palette Authority Freeze

Within the Productivity Layer, palette **data authority** remains UX-6.5
catalog / index / search APIs. The **visual overlay** belongs only to UX-9.

The UI never talks directly to InteractionCommandDispatcher.

```text
Palette UI
        ↓
CommandPaletteBridge
        ↓
InteractionCommandBridge
        ↓
Dispatcher
```

---

## Overlay Ownership Freeze

Overlay · query input · command list · keyboard navigation · execution
feedback chrome exist exclusively inside
`src/components/windows/commands/`.

Never inside `src/ui/palette/**`.

```text
UX-6.5  →  infrastructure (catalog / index / search)
UX-9    →  overlay visible
```

---

## Product Catalog Isolation Freeze

The Productivity Layer owns a local registry created by:

```text
createCommandRegistry(productDefinitions)
```

Demo commands (Open Clipboard · Show Diagnostics · Focus Workspace) exist
only for visible integration.

**Never modify:**

- global `commandRegistry`
- UX-6 catalog
- UX-6 index
- UX-6 infrastructure

Definitions belong only to UX-9.6 product chrome. They do not register
global commands.

---

## Command Envelope Canonical Freeze

Every InteractionCommand generated by the Productivity Layer is created
**only** via:

```text
InteractionCommandBridge.createCommandEnvelope()
```

**Never** inside DomHost · Overlay · FloatingWindow · CommandPaletteBridge.

Canonical shape:

```text
{ id: commandId, type: "palette.execute", payload: { commandId } }
```

---

## Search Purity Freeze

Typing performs **only**:

```text
query
        ↓
search(index, query)
        ↓
results
```

**Never** during typing: dispatch · feedback · registry mutation.

Execution occurs with Enter (or list activation) exclusively through
InteractionCommandBridge — never as a side effect of search.

---

## Overlay State Freeze

Overlay state is limited to:

```text
open
query
selectedIndex
```

**Forbidden:** history · favorites · recent searches · sessions · persistence.

---

## Dispatcher Authority Freeze

Within the Productivity Layer, **only** InteractionCommandBridge may call
`dispatcher.dispatch()`.

---

## Execution Ownership Freeze

InteractionCommandBridge ends at `dispatcher.dispatch()`.

It never executes business logic. It never calls:

- Clipboard · Focus · Selection · Workspace · Hover · Keyboard

The Dispatcher responds only with `{ accepted, reason }`. The Bridge only
transforms that into ephemeral visual feedback.

---

## Interaction Success Freeze

```text
dispatch()
        ↓
accepted == true
        ↓
positive feedback

dispatch()
        ↓
accepted == false
        ↓
rejected feedback + reason
        ↓
no positive feedback
```

---

## Palette Module Purity Freeze

Never modify `src/ui/palette/**`.

Do **not** mount `CommandPaletteProvider` in production composition.
Do **not** import `CommandPaletteProvider` outside `src/ui/palette/**`
(preserves `validate:ux-6.5`).

---

## Interaction Module Purity Freeze

Never modify `src/ui/interaction-commands/**`.

React uses only `useInteractionCommands()`. Never the singleton in
production ProductCompositionHost / FloatingWindow / commands bridges
beyond the certified Provider instance.

FloatingWindow never calls `dispatch()` or `clear()`.

---

## Command Feedback Freeze

Feedback never mutates Workspace · Focus · Selection · Hover · Keyboard ·
Clipboard · Discoverability · WindowRegistry · Pipeline.

Additive only:

- palette status
- command accepted
- command rejected
- execution badge

---

## Command Feedback Lifetime Freeze

Accepted / rejected feedback auto disappears. Never persistent. Never authority.

---

## Palette DOM Freeze

CommandPaletteDomHost captures only Ctrl/Cmd+K and Esc (plus overlay-local
Arrow / Enter while open) via React `onKeyDown`.

No `document.addEventListener()`. No `window.addEventListener()`.

KeyboardNavigation remains authority for navigation outside the overlay.

---

## Visual Priority Freeze

```text
Workspace Active
  > Focused
  > Selected
  > Hover
  > Keyboard Navigation
  > Discoverability
```

Command Palette is a temporary overlay. Never changes the hierarchy.

---

## Token Freeze

Use **only**:

- `UI_TOKENS`
- existing CSS variables
- existing design tokens

**Forbidden:** hex colors · `rgb()` · `rgba()` · new palettes · new tokens.

---

## Paint Independence Freeze

Freeze only the observable effect:

```text
Dispatcher snapshot
        ↓
Overlay
        ↓
FloatingWindow feedback
```

UX-9.6 does **not** freeze any concrete React re-render mechanism.

---

## Provider Composition Freeze

```text
ProductCompositionHost
  └─ WindowManager
       └─ FocusProvider
            └─ SelectionProvider
                 └─ HoverProvider
                      └─ KeyboardNavigationProvider
                           └─ ClipboardProvider
                                └─ InteractionCommandProvider
```

InteractionCommandProvider is mounted only in ProductCompositionHost.
Never from `page.tsx`.

No new Providers · Contexts · Contracts (bridges + DomHost are the
architecture-authorized product surface only).

CommandPaletteProvider is **not** mounted (Palette Module Purity /
validate:ux-6.5).

---

## Dependency Rule

**Forbidden:**

- Command Palette → Focus mutation
- Command Palette → Selection mutation
- Command Palette → Hover mutation
- Command Palette → Keyboard mutation
- Command Palette → Clipboard mutation
- Command Palette → Window lifecycle mutation

Integration is observe-only for chrome. Dispatch goes through
InteractionCommandBridge only.

---

## Authorities

| Domain | Authority |
|--------|-----------|
| Workspace Active | WindowManager |
| Focus | FocusRegistry |
| Selection | SelectionRegistry |
| Hover | HoverRegistry |
| Keyboard Navigation | KeyboardNavigationRegistry |
| Clipboard | ClipboardRegistry |
| Interaction | InteractionCommandDispatcher |
| Palette (product shell) | CommandPaletteBridge |
| Chrome | FloatingWindow |

---

## Visible User Outcome

Without DevTools the user must perceive a working Command Palette and
interaction-command feedback on FloatingWindow.

### Visible Changes

- Ctrl/Cmd+K opens the Command Palette overlay
- Esc closes the palette
- Search filters the demo command list
- Arrow keys navigate the list
- Enter executes the selected command
- FloatingWindow shows palette status and accepted / rejected ephemeral feedback
- Prior domains (Active · Focus · Selection · Hover · Keyboard · Clipboard · Discoverability) remain distinct

### Reused Infrastructure

- UX-6.5 `createCommandPaletteCatalog` · `createCommandPaletteIndex` · `search`
- UX-6 `createCommandDefinition` · `createCommandRegistry` (local product only)
- InteractionCommandProvider · `useInteractionCommands()` · InteractionCommandDispatcher (UX-8.7)
- ProductCompositionHost composition (UX-9.1–UX-9.5)
- No new Registry · Provider · Context · Dispatcher · Contract
- New product surface only: CommandPaletteBridge · InteractionCommandBridge · CommandPaletteDomHost

### User Verification

1. Confirm prior chrome (Active · Focus · Selection · Hover · Nav · Clip) remains.
2. Press Ctrl/Cmd+K and confirm the overlay opens without DevTools.
3. Type a filter and confirm the list updates (search purity — no feedback flash while typing).
4. Use Arrow keys to move selection; press Enter to execute.
5. Confirm ephemeral Accepted feedback appears then disappears.
6. Press Esc to close the palette.
7. Confirm Visual Priority cascade ordering is unchanged.

---

## Acceptance Criteria

- `npm run validate:ux-9.6` → PASS
- InteractionCommandProvider mounted only in ProductCompositionHost
- No CommandPaletteProvider import outside `src/ui/palette/**`
- FloatingWindow observes feedback only; never mutates dispatcher
- CommandPaletteDomHost is the sole Ctrl/Cmd+K · Esc palette surface
- Local `createCommandRegistry(productDefinitions)` only
- `createCommandEnvelope()` sole envelope creator
- Feedback lifetime ephemeral
- Freezes documented
- No new base infrastructure

---

## Protected Files

Never modify in UX-9.6:

- `src/ui/palette/**`
- `src/ui/interaction-commands/**`
- `src/ui/clipboard/**`
- `src/ui/focus/**`
- `src/ui/selection/**`
- `src/ui/hover/**`
- `src/ui/keyboard-nav/**`
- FloatingWindowBridge.tsx
- WindowRegistry
- Runtime
- `scientific/**`
- `page.tsx`
- Historical validators

---

## Gate

```text
npm run validate:ux-9.6
```

Must PASS. Historical `validate:ux-6.5` remains green (no CommandPaletteProvider
production mount).

---

## Next UX-9.7

**Next microphase → UX-9.7 (Undo / Redo Integration)**

Expected Visible User Outcome direction: undo / redo perceptible on the
ProductCompositionHost integration — without new base systems.

Prerequisite: UX-9.6 COMPLETE · `validate:ux-9.6`.
