# UX-9.1 — Workspace Activation

> **Architectural principles:**
> - Visual Integration of certified UX-1 → UX-8 infrastructure (no parallel stack).
> - ProductCompositionHost = sole authorized composition point.
> - Workspace Active → Window Chrome → User Feedback.
> - Activation Semantics Freeze · Chrome Freeze · Token Freeze · Activation Seed Freeze.
> - Provider Composition Freeze · Dependency Rule · Authorities Matrix.
> - Smallest Possible Production Integration — future UX-9 phases extend, never replace.
> - Architecture SSOT: [`UX-9-architecture.md`](./UX-9-architecture.md).

**Épica:** UX-9 — Productivity Layer  
**Microfase:** UX-9.1 — Workspace Activation  
**Fecha:** 2026-08-05  
**Prerrequisitos:** UX-8 RELEASE CERTIFIED ([`UX-8.10.md`](./UX-8.10.md)) · UX-9.0 FROZEN ([`UX-9.0-roadmap.md`](./UX-9.0-roadmap.md)) · Architecture SSOT FROZEN  
**SSOT de arquitectura:** [`UX-9-architecture.md`](./UX-9-architecture.md)  
**SSOT de serie:** [`UX-9.0-roadmap.md`](./UX-9.0-roadmap.md)

**Declaración:**

```text
UX-9.1 = Workspace Activation
SCOPE = ProductCompositionHost · FocusProvider mount · Workspace Active chrome
        · temporary Activation Seed · docs · validate:ux-9.1
Workspace Active ≠ Window Focus ≠ Panel Selection
NO FocusRegistry → chrome wiring (→ UX-9.2)
NO VisibilityProvider invention
NO new Registry · Provider · Context · Dispatcher · State · Contract
Activation Seed = temporary integration utility ONLY
Token Freeze = UI_TOKENS + existing CSS variables only
Smallest Possible Production Integration = VIGENTE
Architecture Freeze UX-9 = VIGENTE
Next: UX-9.2 Focus + Selection Visual
```

---

## Executive Summary

UX-9.1 is the first **visible** production integration of the Productivity Layer.

It reuses certified WindowManager, WindowAPI, FocusProvider, WorkspaceLayout,
FloatingWindow, and Window Chrome so the user can perceive **Workspace Active**
without DevTools — without building parallel infrastructure.

```text
ProductCompositionHost
        ↓
WindowManager
        ↓
FocusProvider
        ↓
existing application tree
        ↓
FloatingWindow chrome (Workspace Active)
```

**Smallest Possible Production Integration:** UX-9.1 intentionally performs the
smallest possible production integration. Future UX-9 phases build on this
integration rather than replacing it. ProductCompositionHost is protected from
future restructures by this freeze.

---

## Scope Fence

**Create**

- `docs/UX/UX-9.1.md`
- `scripts/validate-ux-9.1.ts`
- `src/components/windows/ProductCompositionHost.tsx`

**Modify**

- `src/app/page.tsx`
- `src/components/windows/FloatingWindow.tsx`
- `src/components/windows/FloatingWindowBridge.tsx`
- `src/components/windows/index.ts`
- `docs/UX/UX-9.0-roadmap.md`
- `package.json`

**No other files.**

---

## In Scope / Out of Scope

**In**

- ProductCompositionHost (WindowManager → FocusProvider → children)
- page.tsx host mount
- Workspace Active chrome on FloatingWindow
- Click-to-activate via FloatingWindowBridge → `WindowAPI.activate`
- Temporary WorkspaceActivationSeed (auto NO-OP when product windows exist)
- Documentation + `validate:ux-9.1`

**Out**

- Selection / Hover / Keyboard / Clipboard / Palette / Undo / Diagnostics visuals
- FocusRegistry → chrome (→ UX-9.2)
- VisibilityProvider invention
- New registries, providers, contexts, dispatchers, state models, contracts
- Geometry · layout · docking · drag · resize · z-order behavior changes
- Runtime · `scientific/**` · UX-1 → UX-8 contract mutation

---

## Architecture

```text
page.tsx
  └─ ProductCompositionHost
       └─ WindowManager
            └─ FocusProvider
                 ├─ WorkspaceActivationSeed (temporary · NO-OP if windows exist)
                 └─ SessionProvider → GraphEditor → … → FloatingWindowBridge
                      └─ FloatingWindow (Workspace Active chrome)
```

Activation chain:

```text
Workspace Active
        ↓
Window Chrome
        ↓
User Feedback
```

FocusProvider is mounted for Provider Composition Freeze readiness. It is **not**
bridged to chrome in UX-9.1.

Visibility remains registry/query infrastructure under UX-7. **No VisibilityProvider.**

---

## Activation Semantics Freeze

```text
Workspace Active
        ≠
Window Focus
        ≠
Panel Selection
```

UX-9.1 integrates **only** Workspace Active (`WindowManager` / `WindowAPI.activate`
→ `state.activeId`) into Window Chrome.

Window Focus (FocusRegistry) belongs to UX-9.2.  
Panel Selection (`ActivePanelProvider`) remains orthogonal.

---

## Chrome Freeze

Activation visual may modify **only**:

- border
- shadow
- background
- title
- accent
- indicators

**Never:** geometry · layout · docking · size · position · z-order · drag · resize.

Indicators: `data-workspace-active` · `data-workspace-active-indicator`.

---

## Token Freeze

UX-9.1 must not introduce new colors. Chrome reuses **only**:

- `UI_TOKENS`
- existing CSS variables (`--app-accent`, `--app-surface`, `--app-heading`, …)
- certified design tokens

**Forbidden:** hardcoded colors · hex literals · `rgb()` / `rgba()` · new palette definitions.

---

## Activation Seed Freeze

`WorkspaceActivationSeed` (inside ProductCompositionHost) is **exclusively** a
temporary integration utility.

```text
if product windows already exist
        ↓
NO-OP

if no windows exist
        ↓
create two temporary windows
        ↓
activate one
```

**The seed MUST NOT become a permanent source of production windows.**

When ENGINE, DATA, or other product domains create real windows, the seed
disables automatically and never competes as a population authority.

---

## Provider Composition Freeze

- All UX provider composition passes through `ProductCompositionHost`
- `page.tsx` mounts the host; the host owns composition
- **No** ad-hoc provider constellations in `page.tsx`
- **No** new Providers invented in UX-9.1
- Only certified `FocusProvider` is mounted (reuse)

---

## Dependency Rule

```text
No cross-registry mutation.
No Focus → Visibility · Visibility → Focus · Window → Selection · Selection → Focus.
Orchestration occurs only inside ProductCompositionHost (integration layer).
Public contracts / hooks / APIs only.
```

---

## Authorities

| Dominio | Autoridad |
|---------|-------------|
| Window lifecycle | WindowManager / WindowAPI |
| Activation visual | Workspace integration (UX-9.1) reading `activeId` |
| Focus | FocusRegistry (mounted via FocusProvider; not wired to chrome) |
| Visibility | VisibilityRegistry (documented reuse; no React Provider) |
| Layout | WorkspaceLayout |
| Chrome | FloatingWindow / Window UI |

---

## Visible User Outcome

### Visible Changes

Without DevTools, the user can distinguish:

- the **active** workspace window (accent border/shadow/title/indicator)
- **inactive** workspace window(s) (muted chrome)
- updated window chrome reflecting Workspace Active
- workspace activation feedback when clicking another window

### Reused Infrastructure

- WindowManager · WindowAPI
- FocusProvider (mount only; no FocusRegistry→chrome)
- WorkspaceLayout (existing tree under host)
- FloatingWindow · Window Chrome
- ProductCompositionHost (new composition shell only — not new interaction infra)
- Visibility / Discoverability inventory (documented; no VisibilityProvider)

### User Verification

1. Open the application (no DevTools).
2. Observe two floating windows (seed, only when no product windows exist).
3. Confirm one window shows active chrome; the other shows inactive chrome.
4. Click the inactive window.
5. Confirm chrome swaps — activation feedback is visible without inspecting source.

---

## Acceptance Criteria

### Architecture

- Reuses UX-8 certified infrastructure
- No new registries · providers · contracts
- ProductCompositionHost owns composition
- Activation Semantics / Chrome / Token / Seed freezes documented

### Visible User Outcome

- Active window perceptible
- Inactive window(s) perceptible
- Chrome updated
- Workspace activation feedback without DevTools

### Validator

- `npm run validate:ux-9.1` PASS

---

## Protected Files

Never touch in UX-9.1:

- FocusRegistry · SelectionRegistry · HoverRegistry · ClipboardRegistry
- InteractionCommandDispatcher · VisibilityRegistry · WindowRegistry
- Runtime · `scientific/**`
- UX-1 → UX-8 contracts

---

## Gate

```text
docs/UX/UX-9.1.md exists
ProductCompositionHost mounted from page.tsx
Workspace Active chrome live
Activation Seed Freeze vigente
Token Freeze vigente
validate:ux-9.1 PASS
roadmap UX-9.1 = COMPLETE
```

---

## Next → UX-9.2

**UX-9.1 COMPLETE** · Workspace Activation visible.

**Next microphase → UX-9.2 (Focus + Selection Visual)**

FocusRegistry and SelectionRegistry become visible chrome — still via
ProductCompositionHost extension, never replacement.
