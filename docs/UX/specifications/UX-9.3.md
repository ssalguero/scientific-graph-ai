# UX-9.3 — Hover + Discoverability Integration

> **Architectural principles:**
> - Visual Integration of certified UX-1 → UX-8 infrastructure (no parallel stack).
> - ProductCompositionHost = sole authorized composition point.
> - Official roadmap name: **Hover + Visibility**. Within UX-9.3, **Visibility means Discoverability (UX-7)**.
> - Hover ≠ Workspace Active ≠ Focused ≠ Selected · Discoverability ≠ Window lifecycle.
> - Visual Mapping parallel · Visual Priority Active > Focused > Selected > Hover > Discoverability.
> - Hover Ephemerality · Discoverability Pipeline Lifetime · Render Independence.
> - Small Incremental Visual Integration — extends UX-9.2; never replaces the host.
> - Architecture SSOT: [`UX-9-architecture.md`](./UX-9-architecture.md).

**Épica:** UX-9 — Productivity Layer  
**Microfase:** UX-9.3 — Hover + Visibility (Discoverability Integration)  
**Fecha:** 2026-08-05  
**Prerrequisitos:** UX-8 RELEASE CERTIFIED ([`UX-8.10.md`](./UX-8.10.md)) · UX-9.0 FROZEN · UX-9.1 COMPLETE · UX-9.2 COMPLETE · Architecture SSOT FROZEN  
**SSOT de arquitectura:** [`UX-9-architecture.md`](./UX-9-architecture.md)  
**SSOT de serie:** [`UX-9.0-roadmap.md`](./UX-9.0-roadmap.md)

**Declaración:**

```text
UX-9.3 = Hover + Discoverability Integration
Official roadmap name = Hover + Visibility
Within UX-9.3: Visibility = Discoverability (UX-7) · NOT window lifecycle
SCOPE = HoverProvider mount · Hover chrome · Discoverability hints
        · HoverVisualSeed · docs · validate:ux-9.3
Visual Priority = Active > Focused > Selected > Hover > Discoverability
Hover Ephemerality = one-shot seed · never re-sync
Pipeline Lifetime = one DiscoverabilityPipeline per product composition
NO new Registry · Provider · Context · Dispatcher · State · Contract
Token Freeze = UI_TOKENS + existing CSS variables only
Small Incremental Visual Integration = VIGENTE
Architecture Freeze UX-9 = VIGENTE
Next: UX-9.4 Keyboard Navigation
```

---

## Executive Summary

UX-9.3 integrates certified **HoverRegistry** (UX-8.4) and certified **UX-7
Discoverability** (Pipeline → Snapshot → presentational views) into
FloatingWindow chrome so the user can distinguish Workspace Active, Focus,
Selection, Hover, and Discoverability hints without DevTools — without
building parallel infrastructure.

**Official roadmap name remains Hover + Visibility.** Within UX-9.3,
**Visibility means Discoverability (UX-7)**. It never means `visible` /
`hidden` / `collapsed` / `minimized`. Window lifecycle remains WindowManager
and other subsystems.

```text
ProductCompositionHost
        ↓
WindowManager
        ↓
FocusProvider
        ↓
SelectionProvider
        ↓
HoverProvider
        ↓
WorkspaceActivationSeed · FocusSelectionVisualSeed · HoverVisualSeed
        ↓
application tree → FloatingWindowBridge (one Pipeline)
        ↓
FloatingWindow chrome (Active · Focus · Selection · Hover · Discoverability)
```

**Small Incremental Visual Integration:** UX-9.3 extends UX-9.2. It never
replaces ProductCompositionHost. Future UX-9 phases continue to extend this
host rather than restructuring composition.

---

## Scope Fence

**Create**

- `docs/UX/UX-9.3.md`
- `scripts/validate-ux-9.3.ts`

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
                      └─ HoverProvider
                           ├─ WorkspaceActivationSeed (UX-9.1)
                           ├─ FocusSelectionVisualSeed (UX-9.2)
                           ├─ HoverVisualSeed (UX-9.3 · temporary · ephemeral)
                           └─ SessionProvider → GraphEditor → … → FloatingWindowBridge
                                · one createDiscoverabilityPipeline() via useRef
                                └─ FloatingWindow (Active · Focus · Selection · Hover · Disc)
```

Providers are mounted **only** inside ProductCompositionHost. Never from
`page.tsx`.

Provider composition progression:

```text
UX-9.1  WindowManager → FocusProvider
UX-9.2  → SelectionProvider
UX-9.3  → HoverProvider
```

---

## Hover Integration Freeze

- HoverRegistry remains the sole Hover authority
- React consumers use `useHover()` only
- Module singleton `hoverRegistry` is **not** used in production UI
- UX-9.3 chrome **observes** HoverState snapshot only
- FloatingWindow **never** calls `hoverWindow()` · `hoverContent()` ·
  `hoverSeries()` · `clear()` on HoverRegistry

---

## Discoverability Integration Freeze

- UX-7 Discoverability remains the sole Discoverability authority
- Authorized consume path only:

```text
createDiscoverabilityPipeline()
        ↓
queryDiscSnapshot()
        ↓
DiscoverabilityView / ShortcutHintView
```

- FloatingWindow consumes **snapshots** and **presentational views** only
- Never registers · never fills VisibilityRegistry
- Empty Snapshot → empty views is **correct**
- No VisibilityProvider · no useVisibility

---

## Discoverability Freeze

UX-7 Discoverability keeps its certified meaning (metadata → Pipeline →
Snapshot → views).

UX-9.3 only reuses certified snapshots and presentational views.

**Forbidden reinterpretation:** Discoverability is **not** Window Visibility.
It never represents `visible` · `hidden` · `collapsed` · `minimized`.

Window lifecycle ≠ Discoverability.

---

## Discoverability Pipeline Lifetime Freeze

Exactly **one** Discoverability Pipeline exists per product composition.

```text
ProductCompositionHost composition
        ↓
FloatingWindowBridge · useRef(createDiscoverabilityPipeline())
        ↓
FloatingWindow(s) receive shared pipeline prop
```

- Never one pipeline per FloatingWindow
- No Context introduced to pass the pipeline
- Preferential ownership at the composition fan-out (Bridge under Host)
- Validator asserts this freeze is **documented**; no React AST inspection required

---

## Hover Visual Seed Freeze

Temporary visual-integration utility only (same philosophy as UX-9.1 / UX-9.2).

Execute only when:

- `hoveredWindowId == null`
- **AND** `hoveredContentId == null`
- **AND** at least one window exists

Otherwise **NO-OP**.

Seed writes only:

- `hoverWindow(firstWindow)`
- `hoverContent(firstContent)`

Forbidden: `enter` · `leave` · history · coordinates · `clear` · singleton usage.

---

## Hover Ephemerality Freeze

The seed performs a **one-shot** initialization only.

After writing **or** after detecting existing hover, it becomes **permanently
inactive**. It never synchronizes with real hover.

```text
real hover (future product)
        ↓
seed remains inactive forever
```

UX-9.4+ must not treat the seed as a competitor to real pointer events.

---

## Hover Semantics Freeze

```text
Hover
  ≠ Workspace Active
  ≠ Focused
  ≠ Selected
  ≠ Discoverability
```

Four interaction domains remain independent; Discoverability is a separate
metadata domain.

---

## Visual Mapping Freeze

```text
Workspace Active
        │
Focus
        │
Selection
        │
Hover
        │
Discoverability
        ▼
FloatingWindow Chrome
```

Parallel mapping. Never chained. Each domain maps independently into chrome.

---

## Visual Priority Freeze

Architectural ordering:

```text
Workspace Active
  >
Focused
  >
Selected
  >
Hover
  >
Discoverability hints
```

Hover never eclipses Focus. Focus never eclipses Active. Discoverability
hints never compete with interaction states.

---

## Chrome Freeze

**Allowed** visual changes only:

- border
- shadow
- header
- accent
- hover overlay
- badges
- discoverability indicators

**Forbidden:** geometry · layout · dock · resize · drag · position · z-order.

---

## Token Freeze

Use **only**:

- `UI_TOKENS`
- existing CSS variables
- existing design tokens

**Forbidden:** hex colors · `rgb()` · `rgba()` · new palettes · new tokens.

---

## Render Independence Freeze

Freeze only the observable effect:

```text
Hover snapshot
        ↓
FloatingWindow chrome reflects the snapshot
```

UX-9.3 does **not** freeze any concrete React re-render mechanism.

---

## Provider Composition Completion Freeze

```text
ProductCompositionHost
  └─ WindowManager
       └─ FocusProvider
            └─ SelectionProvider
                 └─ HoverProvider
```

HoverProvider Completion: UX-9.3 completes the mount of HoverProvider.
Never mounted from `page.tsx`. Only ProductCompositionHost.

No new Providers · Contexts · Contracts.

---

## Dependency Rule

**Forbidden:**

- Hover → Focus mutation
- Hover → Selection mutation
- Hover → Discoverability mutation
- Discoverability → Hover mutation

**Window lifecycle ≠ Discoverability** — distinct domains.

Integration is observe-only.

---

## Authorities

| Domain | Authority |
|--------|-----------|
| Workspace Active | WindowManager |
| Focus | FocusRegistry |
| Selection | SelectionRegistry |
| Hover | HoverRegistry |
| Discoverability | UX-7 Discoverability Pipeline |
| Chrome | FloatingWindow |

---

## Visible User Outcome

Without DevTools the user must distinguish Workspace Active, Focus, Selection,
Hover, and Discoverability hints.

### Visible Changes

- Hover chrome (badge / overlay / border priority) distinguishes hovered window
- Discoverability hint slots wired at lowest priority (content when SSOT has definitions; empty Snapshot → no hint is correct)
- Prior domains (Active · Focus · Selection) remain visually distinct

### Reused Infrastructure

- HoverProvider · HoverRegistry · `useHover()` (UX-8.4)
- UX-7 DiscoverabilityPipeline · queryDiscSnapshot · DiscoverabilityView · ShortcutHintView
- No new Registry · Provider · Context · Dispatcher · Contract

### User Verification

1. Confirm two seed windows remain (UX-9.1).
2. Confirm Focus / Selection badges remain (UX-9.2).
3. Confirm Hover badge / chrome on the hovered window without eclipsing Active/Focus.
4. Confirm Discoverability hints never outrank interaction chrome.
5. Confirm empty Discoverability SSOT yields no false window-lifecycle labels.

---

## Acceptance Criteria

- `npm run validate:ux-9.3` → PASS
- HoverProvider mounted only in ProductCompositionHost
- FloatingWindow observes `useHover()`; never mutates HoverRegistry
- FloatingWindowBridge owns one composition Pipeline; fans out to FloatingWindow
- HoverVisualSeed ephemeral · NO-OP · one-shot only
- Discoverability ≠ Window Visibility documented and enforced in chrome vocabulary
- Visual Priority Active > Focused > Selected > Hover > Discoverability
- Visible User Outcome triad present (Visible Changes · Reused Infrastructure · User Verification)
- No new infrastructure
- Token Freeze · Chrome Freeze · Dependency Rule respected

---

## Protected Files

**Never modify in UX-9.3:**

- `src/ui/hover/**`
- `src/ui/visual-integration/**` internals (consume only)
- Visibility pipeline internals
- Focus · Selection · Keyboard · Clipboard · Interaction Commands
- WindowRegistry · Runtime · `scientific/**`
- `page.tsx` · AppShell
- UX-8 documentation · historical validators
- FocusRegistry · SelectionRegistry · HoverRegistry · ClipboardRegistry internals
- InteractionCommandDispatcher · VisibilityRegistry · WindowRegistry

---

## Gate

**UX-9.3 COMPLETE** when:

1. Documentation published (`docs/UX/UX-9.3.md`)
2. `validate:ux-9.3` PASS
3. Roadmap UX-9.3 → COMPLETE
4. Hover + Discoverability perceptible via certified infrastructure only
5. No new infrastructure introduced

Render Independence Freeze vigente.  
Hover Ephemerality Freeze vigente.  
Discoverability Pipeline Lifetime Freeze vigente.

---

## Next UX-9.4

**Next microphase → UX-9.4 (Keyboard Navigation)**

Keyboard infrastructure becomes perceptible chrome — still via
ProductCompositionHost extension, without new base systems.
