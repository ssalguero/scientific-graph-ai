# UX-9.2 — Focus + Selection Visual

> **Architectural principles:**
> - Visual Integration of certified UX-1 → UX-8 infrastructure (no parallel stack).
> - ProductCompositionHost = sole authorized composition point.
> - Workspace Active ≠ Focused ≠ Selected (independent domains).
> - Visual Mapping parallel · Visual Priority Active > Focused > Selected.
> - Demo Minimality · Render Independence · Focus & Selection Seed Freeze.
> - Provider Composition Completion · Dependency Rule · Authorities Matrix.
> - Small Incremental Visual Integration — extends UX-9.1; never replaces the host.
> - Architecture SSOT: [`UX-9-architecture.md`](./UX-9-architecture.md).

**Épica:** UX-9 — Productivity Layer  
**Microfase:** UX-9.2 — Focus + Selection Visual  
**Fecha:** 2026-08-05  
**Prerrequisitos:** UX-8 RELEASE CERTIFIED ([`UX-8.10.md`](./UX-8.10.md)) · UX-9.0 FROZEN · UX-9.1 COMPLETE ([`UX-9.1.md`](./UX-9.1.md)) · Architecture SSOT FROZEN  
**SSOT de arquitectura:** [`UX-9-architecture.md`](./UX-9-architecture.md)  
**SSOT de serie:** [`UX-9.0-roadmap.md`](./UX-9.0-roadmap.md)

**Declaración:**

```text
UX-9.2 = Focus + Selection Visual
SCOPE = SelectionProvider mount · Focus/Selection chrome · minimal Visual Seed
        · docs · validate:ux-9.2
Workspace Active ≠ Focused Window ≠ Selected Content ≠ Selected Series
Visual Priority = Active > Focused > Selected
Demo Minimality = focus + selectWindow + selectContent ONLY
NO toggle* · range* · auto multi-select in seed
NO new Registry · Provider · Context · Dispatcher · State · Contract
Token Freeze = UI_TOKENS + existing CSS variables only
Small Incremental Visual Integration = VIGENTE
Architecture Freeze UX-9 = VIGENTE
Next: UX-9.3 Hover + Visibility
```

---

## Executive Summary

UX-9.2 integrates certified **FocusRegistry** and **SelectionRegistry** into
FloatingWindow chrome so the user can distinguish Workspace Active, Focused,
and Selected states without DevTools — without building parallel infrastructure.

```text
ProductCompositionHost
        ↓
WindowManager
        ↓
FocusProvider
        ↓
SelectionProvider
        ↓
WorkspaceActivationSeed · FocusSelectionVisualSeed · application tree
        ↓
FloatingWindow chrome (Active · Focus · Selection)
```

**Small Incremental Visual Integration:** UX-9.2 extends UX-9.1. It never
replaces ProductCompositionHost. Future UX-9 phases continue to extend this
host rather than restructuring composition.

---

## Scope Fence

**Create**

- `docs/UX/UX-9.2.md`
- `scripts/validate-ux-9.2.ts`

**Modify**

- `docs/UX/UX-9.0-roadmap.md`
- `package.json`
- `src/components/windows/ProductCompositionHost.tsx`
- `src/components/windows/FloatingWindow.tsx`
- `src/components/windows/FloatingWindowBridge.tsx`

**No other files.**

---

## Architecture

```text
page.tsx
  └─ ProductCompositionHost
       └─ WindowManager
            └─ FocusProvider
                 └─ SelectionProvider
                      ├─ WorkspaceActivationSeed (UX-9.1)
                      ├─ FocusSelectionVisualSeed (UX-9.2 · temporary · minimal)
                      └─ SessionProvider → GraphEditor → … → FloatingWindowBridge
                           └─ FloatingWindow (Active · Focus · Selection chrome)
```

Providers are mounted **only** inside ProductCompositionHost. Never from
`page.tsx`.

---

## Focus Integration Freeze

- FocusRegistry remains the sole Focus authority
- React consumers use `useFocus()` only
- UX-9.2 chrome **observes** `focusedId` / `isFocused`
- FloatingWindow and FloatingWindowBridge **never** call `focus()` · `blur()` ·
  `clear()` on FocusRegistry

---

## Selection Integration Freeze

- SelectionRegistry remains the sole Selection authority
- React consumers use `useSelection()` only
- Module singleton `selectionRegistry` is **not** used in production UI
- UX-9.2 chrome **consumes snapshots** only
- FloatingWindow and FloatingWindowBridge **never** call select* · toggle* ·
  range* · clear* on SelectionRegistry

---

## Visual Mapping Freeze

```text
Workspace Active ──┐
Focus ─────────────┼──► FloatingWindow Chrome
Selection ─────────┘
```

Parallel mapping. Never chained. Focus and Selection do not depend on each
other. No Focus → Selection · Selection → Focus · Window → Selection coupling.

---

## Visual Priority Freeze

When multiple states coexist, visual priority is architectural:

```text
Workspace Active
        >
Focused
        >
Selected
```

Never reverse. Active chrome dominates; focus accents never overpower Active;
selection never overpowers Focus or Active.

---

## Focus Semantics Freeze

```text
Workspace Active
        ≠
Focused Window
        ≠
Selected Content
        ≠
Selected Series
```

Activation (`WindowManager.activeId`) is independent of FocusRegistry and
SelectionRegistry.

---

## Chrome Freeze

Focus / Selection visual may modify **only**:

- border
- shadow
- header
- accent
- indicators
- focus badges
- selection badges

**Never:** geometry · layout · docking · size · position · z-order · drag ·
resize.

Indicators: `data-workspace-active` · `data-window-focused` ·
`data-window-selected` · `data-focus-badge` · `data-selection-badge` ·
`data-content-selected`.

---

## Token Freeze

UX-9.2 must not introduce new colors. Chrome reuses **only**:

- `UI_TOKENS`
- existing CSS variables (`--app-accent`, `--app-surface`, `--app-heading`, …)
- certified design tokens

**Forbidden:** hardcoded colors · hex literals · `rgb()` / `rgba()` · new
palette definitions · new tokens.

---

## Demo Minimality Freeze

`FocusSelectionVisualSeed` performs **only**:

```text
focus(firstWindow)
selectWindow(firstWindow)
selectContent(firstContent)
```

**Forbidden in seed:** `toggle*` · `range*` · automatic multi-selection ·
simulation of user interaction sequences.

The seed exists only to make visual integration observable. Multi-select
verification is deferred (later phases / tests).

---

## Render Independence Freeze

Freeze **only** the observable effect:

```text
Registry snapshot changes
        ↓
FloatingWindow chrome reflects the snapshot
```

UX-9.2 does **not** freeze any concrete React re-render mechanism. How updates
propagate is an internal detail.

---

## Focus & Selection Seed Freeze

`FocusSelectionVisualSeed` (inside ProductCompositionHost) is **exclusively** a
temporary visual-integration utility.

```text
if focusedId != null OR selection not empty
        ↓
NO-OP

if no windows exist
        ↓
NO-OP

else
        ↓
minimal Demo Minimality writes
```

**The seed MUST NOT become a permanent source of Focus or Selection.**

When product interaction owns focus/selection, the seed disables automatically.

---

## Provider Composition Completion Freeze

UX-9.2 completes the certified provider mount required for this Productivity
Layer slice:

```text
ProductCompositionHost
        ↓
WindowManager
        ↓
FocusProvider
        ↓
SelectionProvider
        ↓
Application
```

- All UX provider composition passes through `ProductCompositionHost`
- Providers mount **once**, only in the host
- **No** ad-hoc provider constellations in `page.tsx`
- **No** new Providers invented — only certified FocusProvider + SelectionProvider

---

## Dependency Rule

```text
No cross-registry mutation.
No Focus → Selection · Selection → Focus · Window → Selection · Selection → Window.
Orchestration occurs only inside ProductCompositionHost (integration layer).
Public contracts / hooks / APIs only.
Only visual integration — no ownership transfer.
```

---

## Authorities

| Dominio | Autoridad |
|---------|-------------|
| Window lifecycle | WindowManager / WindowAPI |
| Workspace Active | WindowManager (`activeId`) |
| Focus | FocusRegistry |
| Selection | SelectionRegistry |
| Chrome | FloatingWindow UI |

---

## Visible User Outcome

### Visible Changes

Without DevTools, the user can distinguish:

- the **Workspace Active** window (strongest chrome — accent border/shadow/title)
- the **Focused** window (focus badge / distinct focus chrome; may differ from Active)
- the **Selected** window (selection badge / softer selection chrome)
- **Selected content** indicator when content selection is present
- difference between Active / Focused / Selected when states diverge

### Reused Infrastructure

- WindowManager · WindowAPI
- FocusProvider · FocusRegistry (via `useFocus`)
- SelectionProvider · SelectionRegistry (via `useSelection`)
- FloatingWindow · Window Chrome
- ProductCompositionHost (extended — not replaced)
- WorkspaceActivationSeed (UX-9.1; unchanged role)

### User Verification

1. Open the application (no DevTools).
2. Observe seed windows when no product windows exist.
3. Confirm Active chrome on the activated window.
4. Confirm Focus badge / focus chrome on the focused window.
5. Confirm Selection badge and content selection indicator on the selected window.
6. Click another window — Active moves; Focus/Selection remain until product owns them — Active ≠ Focused ≠ Selected is perceptible.

---

## Acceptance Criteria

### Architecture

- Reuses UX-8 certified Focus + Selection infrastructure
- No new registries · providers · contracts
- ProductCompositionHost owns composition
- All freezes documented (Demo Minimality · Render Independence · Visual Priority · Seeds · Tokens · Chrome)

### Visible User Outcome

- Active · Focused · Selected · Selected Content perceptible without DevTools

### Validator

- `npm run validate:ux-9.2` PASS

---

## Protected Files

Never touch in UX-9.2:

- `src/ui/focus/**` · `src/ui/selection/**` (consume only)
- FocusRegistry · SelectionRegistry · HoverRegistry · ClipboardRegistry internals
- InteractionCommandDispatcher · VisibilityRegistry · WindowRegistry
- Runtime · `scientific/**`
- UX-1 → UX-8 contracts · historical validators
- `page.tsx` (host already mounted)

**No new Registry · Provider · Context · Dispatcher · State · Contract** parallel to UX-1 → UX-8.

---

## Gate

```text
docs/UX/UX-9.2.md exists
SelectionProvider mounted in ProductCompositionHost
Focus + Selection chrome live
Demo Minimality Freeze vigente
Visual Priority Freeze vigente
Render Independence Freeze vigente
Token Freeze vigente
validate:ux-9.2 PASS
roadmap UX-9.2 = COMPLETE
```

---

## Next → UX-9.3

**UX-9.2 COMPLETE** · Focus + Selection Visual.

**Next microphase → UX-9.3 (Hover + Visibility)**

Hover and Visibility become perceptible chrome — still via ProductCompositionHost
extension, never replacement.
