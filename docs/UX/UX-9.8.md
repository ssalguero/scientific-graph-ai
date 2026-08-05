# UX-9.8 — Workspace Polish + Diagnostics

> **Architectural principles:**
> - Visual Integration of certified UX-1 → UX-8 infrastructure (no parallel stack).
> - ProductCompositionHost = sole authorized composition point.
> - Workspace Polish never mutates registries · Diagnostics never mutates UI.
> - Visual Priority Active > Focused > Selected > Hover > Keyboard Navigation > Discoverability.
> - Clipboard · Palette · Undo / Redo · Diagnostics are additive · never change the hierarchy.
> - Small Incremental Visual Integration — extends UX-9.7; never replaces the host.
> - Architecture SSOT: [`UX-9-architecture.md`](./UX-9-architecture.md).

**Épica:** UX-9 — Productivity Layer  
**Microfase:** UX-9.8 — Workspace Polish + Diagnostics  
**Fecha:** 2026-08-05  
**Prerrequisitos:** UX-8 RELEASE CERTIFIED ([`UX-8.10.md`](./UX-8.10.md)) · UX-9.0 FROZEN · UX-9.1 COMPLETE · UX-9.2 COMPLETE · UX-9.3 COMPLETE · UX-9.4 COMPLETE · UX-9.5 COMPLETE · UX-9.6 COMPLETE · UX-9.7 COMPLETE · Architecture SSOT FROZEN  
**SSOT de arquitectura:** [`UX-9-architecture.md`](./UX-9-architecture.md)  
**SSOT de serie:** [`UX-9.0-roadmap.md`](./UX-9.0-roadmap.md)

**Declaración:**

```text
UX-9.8 = Workspace Polish + Diagnostics
SCOPE = FloatingWindow chrome polish · WorkspaceDiagnosticsOverlay
        · docs · validate:ux-9.8
No new productivity capabilities
Polish = UI_TOKENS + existing CSS variables only
Diagnostics = query-only · off by default · NEXT_PUBLIC_WORKSPACE_DIAGNOSTICS
Visual Priority = Active > Focused > Selected > Hover > Keyboard Navigation > Discoverability
Clipboard · Palette · Undo · Diagnostics = additive
Visual System Consistency = same radius · spacing · typography · elevation · rhythm
Chrome Density = padding · spacing · gaps · header height · badge spacing via tokens
Diagnostics Readability = labels · values · grouping only · no JSON
NO new Registry · Provider · Context · Dispatcher · Contract
Token Freeze = UI_TOKENS + existing CSS variables only
Small Incremental Visual Integration = VIGENTE
Architecture Freeze UX-9 = VIGENTE
Series Completion = all functional Productivity Layer work complete
Next: UX-9.9 Documentation Freeze
```

---

## Executive Summary

UX-9.8 is the **final functional microphase** of UX-9. It adds **no** new
productivity capabilities. It consolidates the Productivity Layer into **one
unified visual system** and mounts an optional, passive diagnostics overlay.

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
children
        ↓
WorkspaceDiagnosticsOverlay
```

**Two independent blocks:**

| Block | Nature | Rule |
|-------|--------|------|
| Workspace Polish | Product UI | Never mutates registries · never reads registries for polish |
| Workspace Diagnostics | Internal support | Query-only · never mutates UI · off by default |

**Small Incremental Visual Integration:** UX-9.8 extends UX-9.7. It never
replaces ProductCompositionHost. Remaining phases are documentation and release
certification only.

---

## Scope Fence

**Create**

- `docs/UX/UX-9.8.md`
- `scripts/validate-ux-9.8.ts`
- `src/components/windows/diagnostics/WorkspaceDiagnosticsOverlay.tsx`
- `src/components/windows/diagnostics/index.ts`

**Modify**

- `src/components/windows/FloatingWindow.tsx`
- `src/components/windows/ProductCompositionHost.tsx`
- `docs/UX/UX-9.0-roadmap.md`
- `package.json`

**Never modify**

- `src/ui/**`
- Runtime
- `scientific/**`
- WindowRegistry
- Interaction registries
- Commands
- Clipboard
- Palette
- History
- `page.tsx`
- Historical validators

---

## Architecture

```text
ProductCompositionHost
        ↓
Workspace / WindowManager
        ↓
FloatingWindow Chrome (Workspace Polish)
        ↓
Visual Polish (UI_TOKENS only)
        │
        └─────────────┐
                      Diagnostics Overlay (snapshots only)
```

Polish never consults nor modifies registries.
Diagnostics only consults snapshots.
There is **no** communication between polish and diagnostics.

---

## Workspace Polish

Apply visual polish **only** to FloatingWindow:

- root
- header
- body
- badges
- status indicators
- feedback
- overlays

Never modify layout, geometry, drag, resize, dock, or window lifecycle.

---

## Polish Identity Freeze

Polish changes **only**:

- visual hierarchy styling
- spacing
- elevation
- borders
- surfaces
- typography
- badges
- feedback styling

Never logic.

---

## Workspace Chrome Freeze

**Allowed:** header · body · background · border · shadow · accent · badges · feedback

**Forbidden:** geometry · layout · drag · resize · dock

---

## Lovable Identity Freeze

Apply the documented visual identity only through:

- `UI_TOKENS`
- existing CSS variables
- existing design tokens

Never hardcoded colors · hex · rgb() · rgba() · new themes · new tokens.

---

## Visual System Consistency Freeze

All interaction indicators — Workspace Active, Focused, Selected, Hover,
Keyboard, Clipboard, Palette, Undo / Redo, Discoverability — must share:

- same radius
- same spacing
- same typography
- same elevation
- same rhythm

They must look like **one visual system**. Never appear as distinct component
families.

---

## Chrome Density Freeze

Density adjustments allowed **only** through:

- padding
- spacing
- gaps
- header height
- badge spacing

using `UI_TOKENS` and existing CSS variables.

Never alter layout behavior.

---

## Diagnostics

`WorkspaceDiagnosticsOverlay` is the sole new product surface.

- Default: **OFF**
- Visible only when `NEXT_PUBLIC_WORKSPACE_DIAGNOSTICS=1`
- Otherwise: `return null`
- Mounted only from `ProductCompositionHost` under `UndoRedoDomHost`

---

## Diagnostics Freeze

Diagnostics are query-only.

Never: dispatch · mutate · clear · sync · write.

---

## Diagnostics Visibility Freeze

```text
const DIAGNOSTICS_ENABLED =
  process.env.NEXT_PUBLIC_WORKSPACE_DIAGNOSTICS === "1"
```

No hotkeys. No persistence. No user toggle. Never visible by default.

---

## Diagnostics Data Freeze

Overlay consumes **only**:

- `createInteractionDiagnosticsReport(...)`
- `WindowContext.state` (workspace snapshot)
- UndoRedo overlay snapshot (`canUndo` / `canRedo`)
- Clipboard summary

Never create reports locally. Never enrich data. Never transform authorities.

---

## Diagnostics Readability Freeze

Overlay presents **only**:

- labels
- values
- grouping

Never: JSON · trees · raw dumps · complex tables.

Information must be readable within seconds.

---

## Diagnostics Lifetime Freeze

Overlay exists only while `DIAGNOSTICS_ENABLED`.

No persistence. No history.

---

## Polish / Diagnostics Separation Freeze

```text
Workspace Polish
        ↓
UI only

Diagnostics
        ↓
Snapshots only
```

Never communicate. Never share responsibilities.

---

## Visual Hierarchy Freeze

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

Clipboard · Palette · Undo · Diagnostics remain **additive**.
Never change the cascade.

---

## Animation Freeze

**Allowed transitions:** opacity · transform · shadow · border-color · background-color

Prefer existing `UI_TOKENS.transition.*` · `UI_TOKENS.animation.*`

**Forbidden:** `transition-all` · layout animation · geometry animation

---

## Provider Composition Freeze

No new Provider · Context · Registry · Dispatcher · Contract.

`WorkspaceDiagnosticsOverlay` mounts under `UndoRedoDomHost` only.

---

## Dependency Rule

Workspace Polish never reads registries.

Diagnostics never mutate Focus · Selection · Hover · Keyboard · Clipboard ·
Commands · History · Workspace.

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
| Diagnostics | createInteractionDiagnosticsReport |
| Chrome | FloatingWindow |

---

## Visible User Outcome

### Visible Changes

- One unified workspace chrome across Active / Focus / Selection / Hover /
  Keyboard / Clipboard / Palette / Undo-Redo / Discoverability
- Consistent visual language (shared radius, spacing, typography, elevation,
  rhythm)
- Soft transitions on chrome surfaces and indicators
- Command Palette indicators integrated into the same visual language
- Optional passive diagnostics overlay (off by default)

The workspace should visually resemble a modern professional application rather
than a collection of independent widgets.

Productivity windows read as **one visual system**.

### Reused Infrastructure

- ProductCompositionHost composition (UX-9.1–9.7)
- FloatingWindow observe-only chrome pattern
- `UI_TOKENS` + existing CSS variables (`--app-*`)
- `createInteractionDiagnosticsReport` (UX-8.8)
- WindowContext state (workspace snapshot)
- UndoRedoBridge overlay observe (`canUndo` / `canRedo`)
- Clipboard / Focus / Selection / Hover / Keyboard / Interaction hooks (query)

### User Verification

Without DevTools:

1. Open the product surface under ProductCompositionHost.
2. Observe floating windows: Active / Focus / Selection / Hover badges share
   one visual language and density.
3. Open Command Palette (Ctrl/Cmd+K) — palette chrome matches the same identity.
4. Confirm soft transitions between states (no layout jumps).
5. Confirm diagnostics overlay is **absent** by default.
6. With `NEXT_PUBLIC_WORKSPACE_DIAGNOSTICS=1`, confirm a readable label/value
   overlay appears (no JSON dumps) and does not change product behavior.

---

## Acceptance Criteria

- FloatingWindow chrome polished via `UI_TOKENS` only (no hex / rgb)
- All indicators share Visual System Consistency
- Chrome Density adjusted via tokens only · no layout/geometry changes
- Visual hierarchy cascade unchanged · additive layers remain additive
- Animation Freeze respected (`transition-all` forbidden)
- `WorkspaceDiagnosticsOverlay` exists · env-gated · query-only
- Diagnostics Readability: labels · values · grouping only
- Overlay mounted only from ProductCompositionHost under UndoRedoDomHost
- No new Registry / Provider / Context / Dispatcher / Contract
- `validate:ux-9.8` passes
- Visible User Outcome documents Visible Changes · Reused Infrastructure ·
  User Verification · one visual system · modern professional application

---

## Protected Files

Never modified by UX-9.8:

- `src/ui/**`
- Runtime / `scientific/**`
- WindowRegistry
- Interaction registries
- Commands · Clipboard · Palette · History modules (logic)
- `page.tsx`
- Historical validators (`validate-ux-9.1` … `validate-ux-9.7`)

---

## Gate

```text
docs/UX/UX-9.8.md
scripts/validate-ux-9.8.ts
package.json → validate:ux-9.8
```

Run: `npm run validate:ux-9.8`

---

## Series Completion Note

UX-9.8 completes all **functional** Productivity Layer work.

No new Productivity capabilities remain for UX-9.

Remaining:

- UX-9.9 → Documentation Freeze
- UX-9.10 → Release Certification

---

## Next UX-9.9

**Next microphase → UX-9.9 (Documentation Freeze)**

Focus: freeze documentation and series narrative — not product capabilities.
