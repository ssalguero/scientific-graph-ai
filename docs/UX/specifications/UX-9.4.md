# UX-9.4 — Keyboard Navigation Integration

> **Architectural principles:**
> - Visual Integration of certified UX-1 → UX-8 infrastructure (no parallel stack).
> - ProductCompositionHost = sole authorized composition point.
> - Keyboard Navigation ≠ Workspace Active ≠ Focus ≠ Selection ≠ Hover.
> - Visual Mapping parallel · Visual Priority Active > Focused > Selected > Hover > Keyboard Navigation > Discoverability.
> - Keyboard Seed Canonical · Keyboard Ephemerality · Direction Normalization · Paint Independence.
> - Small Incremental Visual Integration — extends UX-9.3; never replaces the host.
> - Architecture SSOT: [`UX-9-architecture.md`](./UX-9-architecture.md).

**Épica:** UX-9 — Productivity Layer  
**Microfase:** UX-9.4 — Keyboard Navigation Integration  
**Fecha:** 2026-08-05  
**Prerrequisitos:** UX-8 RELEASE CERTIFIED ([`UX-8.10.md`](./UX-8.10.md)) · UX-9.0 FROZEN · UX-9.1 COMPLETE · UX-9.2 COMPLETE · UX-9.3 COMPLETE · Architecture SSOT FROZEN  
**SSOT de arquitectura:** [`UX-9-architecture.md`](./UX-9-architecture.md)  
**SSOT de serie:** [`UX-9.0-roadmap.md`](./UX-9.0-roadmap.md)

**Declaración:**

```text
UX-9.4 = Keyboard Navigation Integration
SCOPE = KeyboardNavigationProvider mount · DomHost onKeyDown → move()
        · KeyboardNavigationVisualSeed · keyboard chrome · docs · validate:ux-9.4
Visual Priority = Active > Focused > Selected > Hover > Keyboard Navigation > Discoverability
Keyboard Seed Canonical = move(NEXT) only · never next()
Keyboard Ephemerality = one-shot seed · never re-sync
Direction Normalization = move(direction) canonical · helpers remain helpers
Paint Independence = snapshot → chrome only · no React mechanism frozen
NO new Registry · Provider · Context · Dispatcher · State · Contract
Token Freeze = UI_TOKENS + existing CSS variables only
Small Incremental Visual Integration = VIGENTE
Architecture Freeze UX-9 = VIGENTE
Next: UX-9.5 Clipboard Integration
```

---

## Executive Summary

UX-9.4 integrates certified **KeyboardNavigationRegistry** (UX-8.5) into
FloatingWindow chrome so the user can perceive Tab / Shift+Tab / arrow / Escape
navigation intent — distinct from Focus — without DevTools and without building
parallel infrastructure.

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
KeyboardNavigationProvider
        ↓
WorkspaceActivationSeed · FocusSelectionVisualSeed · HoverVisualSeed
        · KeyboardNavigationVisualSeed
        ↓
KeyboardNavigationDomHost (onKeyDown → move)
        ↓
application tree → FloatingWindowBridge
        ↓
FloatingWindow chrome (Active · Focus · Selection · Hover · Keyboard · Disc)
```

**Small Incremental Visual Integration:** UX-9.4 extends UX-9.3. It never
replaces ProductCompositionHost. Future UX-9 phases continue to extend this
host rather than restructuring composition.

---

## Scope Fence

**Create**

- `docs/UX/UX-9.4.md`
- `scripts/validate-ux-9.4.ts`

**Modify**

- `docs/UX/UX-9.0-roadmap.md`
- `package.json`
- `src/components/windows/ProductCompositionHost.tsx`
- `src/components/windows/FloatingWindow.tsx`

**No other files.** FloatingWindowBridge is not modified.

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
                                ├─ WorkspaceActivationSeed (UX-9.1)
                                ├─ FocusSelectionVisualSeed (UX-9.2)
                                ├─ HoverVisualSeed (UX-9.3)
                                ├─ KeyboardNavigationVisualSeed (UX-9.4 · temporary · ephemeral)
                                └─ KeyboardNavigationDomHost (onKeyDown → move)
                                     └─ SessionProvider → GraphEditor → … → FloatingWindowBridge
                                          └─ FloatingWindow (observe keyboard snapshot)
```

Providers are mounted **only** inside ProductCompositionHost. Never from
`page.tsx`.

Provider composition progression:

```text
UX-9.1  WindowManager → FocusProvider
UX-9.2  → SelectionProvider
UX-9.3  → HoverProvider
UX-9.4  → KeyboardNavigationProvider
```

---

## Keyboard Integration Freeze

- KeyboardNavigationRegistry remains the sole Keyboard Navigation authority
- React consumers use `useKeyboardNavigation()` only
- Module singleton `keyboardNavigationRegistry` is **not** used in production UI
- UX-9.4 chrome **observes** KeyboardNavigationState snapshot only
- FloatingWindow **never** calls `move()` · `next()` · `previous()` ·
  `escape()` · `clear()` on KeyboardNavigationRegistry

---

## Keyboard DOM Freeze

Keyboard is captured **only** inside `KeyboardNavigationDomHost` using
`onKeyDown` or `onKeyDownCapture`.

```text
KeyboardNavigationDomHost
        ↓
onKeyDown / onKeyDownCapture
        ↓
registry.move(direction)
```

- Host uses `tabIndex={0}` to receive keyboard focus when needed
- **Forbidden:** `document.addEventListener()` · `window.addEventListener()`
- **Forbidden:** global listeners · configurable shortcuts · macros · command routing

---

## Keyboard Seed Canonical Freeze

`KeyboardNavigationVisualSeed` initializes **only** through the certified
canonical operation:

```text
if lastDirection == null AND at least one window exists
        ↓
registry.move(KeyboardNavigationDirection.NEXT)
```

- **Never** `next()` · `previous()` · `escape()` inside the seed
- Helpers remain available for external consumers
- UX-9 integration always uses `move(direction)` (UX-8.5 Direction Normalization)

---

## Keyboard Ephemerality Freeze

The seed performs a **one-shot** initialization only.

Execute only when:

- `lastDirection == null`
- **AND** at least one window exists

Otherwise **NO-OP forever**.

After writing **or** after detecting existing direction, it becomes
**permanently inactive**. It never synchronizes again.

```text
real keyboard navigation (product)
        ↓
seed remains inactive forever
```

---

## Direction Normalization Freeze

All visible navigation uses solely:

```text
move(direction)
```

`KeyboardNavigationDomHost` translates physical keys directly into
`move(direction)`:

| Key | Direction |
|-----|-----------|
| Tab | NEXT |
| Shift+Tab | PREVIOUS |
| ArrowUp | UP |
| ArrowDown | DOWN |
| ArrowLeft | LEFT |
| ArrowRight | RIGHT |
| Escape | ESCAPE |

Helpers `next()` · `previous()` · `escape()` remain helpers only.
No parallel logic.

---

## Keyboard Indicator Freeze

Keyboard Navigation never replaces Workspace Active · Focus · Selection · Hover.

Adds only:

- Direction badge
- Arrow glyph
- Escape glyph
- Subtle keyboard hint

---

## Keyboard Semantics Freeze

```text
Keyboard Navigation
  ≠ Workspace Active
  ≠ Focus
  ≠ Selection
  ≠ Hover
```

Independent domains. Keyboard intent is not Focus traversal.

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
Keyboard Navigation
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
Keyboard Navigation
  >
Discoverability
```

Keyboard Navigation never eclipses Hover. Hover never eclipses Focus.
Focus never eclipses Active. Discoverability hints never compete with
interaction states.

---

## Chrome Freeze

**Allowed** visual changes only:

- border
- shadow
- header
- accent
- badges
- keyboard indicators

**Forbidden:** geometry · layout · dock · resize · drag · position · z-order.

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
Keyboard snapshot
        ↓
FloatingWindow chrome reflects the snapshot
```

UX-9.4 does **not** freeze any concrete React re-render mechanism.
The Host guarantees the snapshot reaches chrome. How updates propagate is an
internal detail (same discipline as UX-9.2 / UX-9.3 Render Independence).

---

## Provider Composition Completion Freeze

```text
ProductCompositionHost
  └─ WindowManager
       └─ FocusProvider
            └─ SelectionProvider
                 └─ HoverProvider
                      └─ KeyboardNavigationProvider
```

Keyboard Provider Completion: UX-9.4 completes the mount of
KeyboardNavigationProvider. Never mounted from `page.tsx`. Only
ProductCompositionHost.

No new Providers · Contexts · Contracts.

---

## Dependency Rule

**Forbidden:**

- Keyboard → Focus mutation
- Keyboard → Selection mutation
- Keyboard → Hover mutation
- Keyboard → Commands mutation

Integration is observe-only.

---

## Authorities

| Domain | Authority |
|--------|-----------|
| Workspace Active | WindowManager |
| Focus | FocusRegistry |
| Selection | SelectionRegistry |
| Hover | HoverRegistry |
| Keyboard Navigation | KeyboardNavigationRegistry |
| Discoverability | UX-7 Discoverability Pipeline |
| Chrome | FloatingWindow |

---

## Visible User Outcome

Without DevTools the user must perceive Tab / Shift+Tab / arrow / Escape
navigation intent and distinguish Keyboard Navigation from Focus.

### Visible Changes

- Keyboard direction badge and arrow / Escape glyph on FloatingWindow chrome
- Tab / Shift+Tab / arrows / Escape update the keyboard indicator
- Focus badge remains visually distinct from Keyboard Navigation
- Prior domains (Active · Focus · Selection · Hover · Discoverability) remain distinct

### Reused Infrastructure

- KeyboardNavigationProvider · KeyboardNavigationRegistry · `useKeyboardNavigation()` (UX-8.5)
- ProductCompositionHost composition (UX-9.1–UX-9.3)
- No new Registry · Provider · Context · Dispatcher · Contract

### User Verification

1. Confirm two seed windows remain (UX-9.1).
2. Confirm Focus / Selection badges remain (UX-9.2).
3. Confirm Hover chrome remains (UX-9.3).
4. Confirm keyboard indicator shows after seed (`NEXT`) without DevTools.
5. Press Tab / Shift+Tab / arrows / Escape and confirm the direction indicator updates.
6. Confirm Keyboard Navigation chrome does not replace or equal the Focus badge.

---

## Acceptance Criteria

- `npm run validate:ux-9.4` → PASS
- KeyboardNavigationProvider mounted only in ProductCompositionHost
- FloatingWindow observes `useKeyboardNavigation()`; never mutates KeyboardNavigationRegistry
- KeyboardNavigationDomHost is the sole key listener (`onKeyDown` / `onKeyDownCapture`)
- KeyboardNavigationVisualSeed ephemeral · NO-OP · one-shot · `move(NEXT)` only
- Direction Normalization · Paint Independence · Visual Priority documented
- Visible User Outcome triad present (Visible Changes · Reused Infrastructure · User Verification)
- No new infrastructure
- Token Freeze · Chrome Freeze · Dependency Rule respected

---

## Protected Files

**Never modify in UX-9.4:**

- `src/ui/keyboard-nav/**`
- Focus · Selection · Hover · Clipboard · Interaction Commands
- WindowRegistry · Runtime · `scientific/**`
- `page.tsx` · AppShell
- FloatingWindowBridge (no functional change)
- UX-8 documentation · historical validators
- FocusRegistry · SelectionRegistry · HoverRegistry · ClipboardRegistry internals
- InteractionCommandDispatcher · VisibilityRegistry · WindowRegistry

---

## Gate

**UX-9.4 COMPLETE** when:

1. Documentation published (`docs/UX/UX-9.4.md`)
2. `validate:ux-9.4` PASS
3. Roadmap UX-9.4 → COMPLETE
4. Keyboard Navigation perceptible via certified infrastructure only
5. No new infrastructure introduced

Keyboard Seed Canonical Freeze vigente.  
Keyboard Ephemerality Freeze vigente.  
Direction Normalization Freeze vigente.  
Paint Independence Freeze vigente.

---

## Next UX-9.5

**Next microphase → UX-9.5 (Clipboard Integration)**

Clipboard infrastructure becomes perceptible — still via
ProductCompositionHost extension, without new base systems.
