# UX-9.5 — Clipboard Integration

> **Architectural principles:**
> - Visual Integration of certified UX-1 → UX-8 infrastructure (no parallel stack).
> - ProductCompositionHost = sole authorized composition point.
> - Clipboard ≠ Workspace Active ≠ Focus ≠ Selection ≠ Hover ≠ Keyboard.
> - Visual Mapping parallel · Visual Priority Active > Focused > Selected > Hover > Keyboard Navigation > Discoverability.
> - Clipboard chrome is additive · outside the replacement cascade.
> - Clipboard Bridge Authority · Adapter · Entry Canonical · Success · Feedback Lifetime.
> - Legacy Isolation · Module Purity · Paint Independence.
> - Small Incremental Visual Integration — extends UX-9.4; never replaces the host.
> - Architecture SSOT: [`UX-9-architecture.md`](./UX-9-architecture.md).

**Épica:** UX-9 — Productivity Layer  
**Microfase:** UX-9.5 — Clipboard Integration  
**Fecha:** 2026-08-05  
**Prerrequisitos:** UX-8 RELEASE CERTIFIED ([`UX-8.10.md`](./UX-8.10.md)) · UX-9.0 FROZEN · UX-9.1 COMPLETE · UX-9.2 COMPLETE · UX-9.3 COMPLETE · UX-9.4 COMPLETE · Architecture SSOT FROZEN  
**SSOT de arquitectura:** [`UX-9-architecture.md`](./UX-9-architecture.md)  
**SSOT de serie:** [`UX-9.0-roadmap.md`](./UX-9.0-roadmap.md)

**Declaración:**

```text
UX-9.5 = Clipboard Integration
SCOPE = ClipboardProvider mount · ClipboardIntegrationBridge
        · BrowserClipboardAdapter · ClipboardVisualSeed · ClipboardDomHost
        · clipboard chrome · docs · validate:ux-9.5
Visual Priority = Active > Focused > Selected > Hover > Keyboard Navigation > Discoverability
Clipboard chrome = additive · outside cascade
Clipboard Bridge Authority = Bridge → BrowserAdapter → navigator.clipboard only
Clipboard Adapter = Browser only · Desktop/Plugin slots documented
Clipboard Operations = Copy · Paste only
Clipboard Entry Canonical = Bridge.createClipboardEntry() sole construction
Clipboard Success = Adapter SUCCESS → createEntry → set → feedback
Clipboard Feedback Lifetime = ephemeral copy/paste feedback · auto disappear
Legacy Isolation = page.tsx · ScientificWorksheetPanel out of fence
Paint Independence = snapshot → chrome only · no React mechanism frozen
NO new Registry · Provider · Context · Dispatcher · State · Contract
Token Freeze = UI_TOKENS + existing CSS variables only
Small Incremental Visual Integration = VIGENTE
Architecture Freeze UX-9 = VIGENTE
Next: UX-9.6 Command Palette + Interaction Commands
```

---

## Executive Summary

UX-9.5 integrates certified **ClipboardRegistry** (UX-8.6) into the Productivity
Layer so the user can **copy and paste** with perceptible FloatingWindow chrome —
without DevTools and without building parallel base infrastructure.

This is the first UX-9 microphase where certified UX-8 infrastructure stops being
only visible and starts executing a **real functional capability**, still inside
the architectural borders defined since UX-8.

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
ClipboardProvider
        ↓
WorkspaceActivationSeed · FocusSelectionVisualSeed · HoverVisualSeed
        · KeyboardNavigationVisualSeed · ClipboardVisualSeed
        ↓
KeyboardNavigationDomHost
        ↓
ClipboardDomHost (Ctrl/Cmd+C|V → Bridge)
        ↓
application tree → FloatingWindowBridge
        ↓
FloatingWindow chrome (Active · Focus · Selection · Hover · Keyboard · Clip · Disc)
```

**Small Incremental Visual Integration:** UX-9.5 extends UX-9.4. It never
replaces ProductCompositionHost. Future UX-9 phases continue to extend this
host rather than restructuring composition.

---

## Scope Fence

**Create**

- `docs/UX/UX-9.5.md`
- `scripts/validate-ux-9.5.ts`
- `src/components/windows/clipboard/ClipboardIntegrationBridge.ts`
- `src/components/windows/clipboard/BrowserClipboardAdapter.ts`
- `src/components/windows/clipboard/index.ts`

**Modify**

- `docs/UX/UX-9.0-roadmap.md`
- `package.json`
- `src/components/windows/ProductCompositionHost.tsx`
- `src/components/windows/FloatingWindow.tsx`

**No other files.** FloatingWindowBridge is not modified.
`src/ui/clipboard/**` is never modified (Clipboard Module Purity Freeze).
Legacy `page.tsx` / `ScientificWorksheetPanel.tsx` clipboard calls are not
migrated (Legacy Isolation Freeze).

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
                                     ├─ WorkspaceActivationSeed (UX-9.1)
                                     ├─ FocusSelectionVisualSeed (UX-9.2)
                                     ├─ HoverVisualSeed (UX-9.3)
                                     ├─ KeyboardNavigationVisualSeed (UX-9.4)
                                     ├─ ClipboardVisualSeed (UX-9.5 · temporary · ephemeral)
                                     └─ KeyboardNavigationDomHost
                                          └─ ClipboardDomHost (Ctrl/Cmd+C|V → Bridge)
                                               └─ SessionProvider → GraphEditor → … → FloatingWindowBridge
                                                    └─ FloatingWindow (observe clipboard snapshot)
```

Providers are mounted **only** inside ProductCompositionHost. Never from
`page.tsx`.

Provider composition progression:

```text
UX-9.1  WindowManager → FocusProvider
UX-9.2  → SelectionProvider
UX-9.3  → HoverProvider
UX-9.4  → KeyboardNavigationProvider
UX-9.5  → ClipboardProvider
```

Transport:

```text
ClipboardDomHost
        ↓
ClipboardIntegrationBridge
        ↓
BrowserClipboardAdapter
        ↓
navigator.clipboard
        ↓
Bridge.createClipboardEntry()
        ↓
ClipboardRegistry.set()
        ↓
FloatingWindow chrome
```

Desktop Adapter and Plugin Adapter remain **architectural slots** only
(documented in [`UX-9-architecture.md`](./UX-9-architecture.md) §9) — no stubs.

---

## Clipboard Bridge Authority Freeze

Within the Productivity Layer, **only**:

```text
ClipboardIntegrationBridge
        ↓
BrowserClipboardAdapter
```

may call `navigator.clipboard`.

Host · FloatingWindow · seeds · DomHost never call `navigator.clipboard`
directly. Product code talks to the Bridge; the Bridge selects the adapter.

---

## Clipboard Adapter Freeze

UX-9.5 implements **only** `BrowserClipboardAdapter`.

Desktop Adapter and Plugin Adapter remain documented architectural slots.
**No stub implementations.**

---

## Clipboard Operations Freeze

Visible operations:

- Copy
- Paste

**Out of scope:** Cut · Clipboard History · Clipboard Manager · Undo Clipboard ·
Multi Clipboard · Drag & Drop Clipboard.

---

## Clipboard Entry Canonical Freeze

`ClipboardRegistry.set()` is reached **only** through
`Bridge.createClipboardEntry()`.

```text
BrowserAdapter (SUCCESS)
        ↓
Bridge.createClipboardEntry()
        ↓
ClipboardRegistry.set()
```

ClipboardEntry construction exists in **one place only** inside the Bridge.
Future HTML / images / files change only that construction point.

---

## Clipboard Success Freeze

**Copy**

```text
BrowserAdapter.writeText()
        ↓
SUCCESS
        ↓
Bridge.createClipboardEntry()
        ↓
ClipboardRegistry.set()
        ↓
Feedback
```

**Paste**

```text
BrowserAdapter.readText()
        ↓
SUCCESS
        ↓
Bridge.createClipboardEntry()
        ↓
ClipboardRegistry.set()
        ↓
Feedback
```

**Failure**

```text
Adapter FAIL
        ↓
No Registry.set()
        ↓
No feedback
        ↓
Error propagates
```

Keeps logical Registry and OS clipboard synchronized for Productivity Layer ops.

---

## Clipboard Module Purity Freeze

Never modify `src/ui/clipboard/**`.

Bridge and Adapter live **outside** the certified Clipboard module
(`src/components/windows/clipboard/`) so UX-8.6 Browser Clipboard Freeze remains
intact.

---

## Clipboard Integration Freeze

- ClipboardRegistry remains the sole logical Clipboard authority
- React consumers use `useClipboard()` only
- Module singleton `clipboardRegistry` is **not** used in production UI
- UX-9.5 chrome **observes** ClipboardState snapshot only
- FloatingWindow **never** calls `set()` · `clear()` on ClipboardRegistry

---

## Clipboard DOM Freeze

Clipboard is captured **only** inside `ClipboardDomHost` using `onKeyDown`.

```text
ClipboardDomHost
        ↓
Ctrl+C / Cmd+C / Ctrl+V / Cmd+V
        ↓
ClipboardIntegrationBridge.copy / paste
```

- No `document.addEventListener()`
- No `window.addEventListener()`
- No global listeners
- KeyboardNavigationDomHost remains the only owner of navigation keys

---

## Clipboard Seed Freeze

`ClipboardVisualSeed` is a temporary visual-integration utility.

- Runs once
- NO-OP if Clipboard already contains an entry
- Never synchronizes again
- Uses Bridge.copy (Success Freeze · Entry Canonical Freeze)

---

## Clipboard Feedback Freeze

Clipboard feedback never mutates:

- Workspace Active
- Focus
- Selection
- Hover
- Keyboard Navigation
- Discoverability
- WindowRegistry
- Pipeline

Clipboard feedback is **additive only**.

---

## Clipboard Feedback Lifetime Freeze

Copy animation and Paste feedback are **temporary**.

```text
copy / paste SUCCESS
        ↓
feedback appears
        ↓
auto disappear
```

- Never persistent
- Never authority
- UI only

Badge / status from `entry != null` may remain while the Registry has an entry;
op animations do not persist.

---

## Legacy Isolation Freeze

Existing `navigator.clipboard` usage in:

- `src/app/page.tsx`
- `src/components/data/ScientificWorksheetPanel.tsx`

is **outside** the UX-9.5 Scope Fence.

- Do not migrate
- Do not modify
- Do not delete

These calls are not Productivity Layer authority and remain isolated until a
future consolidation phase. The validator checks only that documentation
declares this rule — it does not require a whole-repo migration.

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

Clipboard feedback is **additive**. Never changes this ordering.

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
Clipboard snapshot
        ↓
FloatingWindow chrome reflects the snapshot
```

UX-9.5 does **not** freeze any concrete React re-render mechanism.
The Host guarantees the snapshot reaches chrome. How updates propagate is an
internal detail (same discipline as UX-9.2 / UX-9.3 / UX-9.4).

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
```

Clipboard Provider Completion: UX-9.5 completes the mount of ClipboardProvider.
Never mounted from `page.tsx`. Only ProductCompositionHost.

No new Providers · Contexts · Contracts (Bridge + Browser Adapter are the
architecture-authorized transport surface only).

---

## Dependency Rule

**Forbidden:**

- Clipboard → Focus mutation
- Clipboard → Selection mutation
- Clipboard → Hover mutation
- Clipboard → Keyboard mutation
- Clipboard → Commands mutation
- Clipboard → Window lifecycle mutation

Integration is observe-only for chrome. Mutations go through Bridge → Registry
only on Adapter SUCCESS.

---

## Authorities

| Domain | Authority |
|--------|-----------|
| Workspace Active | WindowManager |
| Focus | FocusRegistry |
| Selection | SelectionRegistry |
| Hover | HoverRegistry |
| Keyboard Navigation | KeyboardNavigationRegistry |
| Clipboard (logical) | ClipboardRegistry |
| Browser Clipboard (transport) | BrowserClipboardAdapter |
| Discoverability | UX-7 Discoverability Pipeline |
| Chrome | FloatingWindow |

---

## Visible User Outcome

Without DevTools the user must perceive Copy / Paste and clipboard chrome on
FloatingWindow.

### Visible Changes

- Clipboard badge when the logical clipboard has an entry
- Clipboard status indicator (Ready) distinct from Focus / Sel / Hover / Nav
- Ephemeral Copy animation after successful Copy
- Ephemeral Paste feedback after successful Paste
- Ctrl/Cmd+C and Ctrl/Cmd+V drive Bridge → Browser Adapter → Registry
- Prior domains (Active · Focus · Selection · Hover · Keyboard · Discoverability) remain distinct

### Reused Infrastructure

- ClipboardProvider · ClipboardRegistry · `useClipboard()` (UX-8.6)
- ProductCompositionHost composition (UX-9.1–UX-9.4)
- No new Registry · Provider · Context · Dispatcher · Contract
- New transport only: ClipboardIntegrationBridge · BrowserClipboardAdapter

### User Verification

1. Confirm seed windows / Focus / Selection / Hover / Keyboard chrome remain.
2. Confirm Clipboard badge / status appear after seed or Copy without DevTools.
3. Press Ctrl/Cmd+C and confirm ephemeral “Copied” feedback appears then disappears.
4. Press Ctrl/Cmd+V and confirm ephemeral “Pasted” feedback appears then disappears.
5. Confirm Clipboard chrome does not replace or equal Focus / Selection / Hover / Nav badges.
6. Confirm Visual Priority cascade ordering is unchanged.

---

## Acceptance Criteria

- `npm run validate:ux-9.5` → PASS
- ClipboardProvider mounted only in ProductCompositionHost
- FloatingWindow observes `useClipboard()`; never mutates ClipboardRegistry
- ClipboardDomHost is the sole Copy/Paste key surface
- ClipboardVisualSeed ephemeral · NO-OP · one-shot · Bridge.copy only
- BrowserClipboardAdapter is the only `navigator.clipboard` caller in allowed modified/created Productivity files
- Entry Canonical · Success · Feedback Lifetime · Legacy Isolation documented
- Visible User Outcome triad present (Visible Changes · Reused Infrastructure · User Verification)
- No new base infrastructure (Bridge + Browser Adapter only)
- Token Freeze · Dependency Rule respected

---

## Protected Files

**Never modify in UX-9.5:**

- `src/ui/clipboard/**`
- Focus · Selection · Hover · Keyboard · Interaction Commands
- WindowRegistry · Runtime · `scientific/**`
- `page.tsx` · `ScientificWorksheetPanel.tsx` (Legacy Isolation)
- FloatingWindowBridge (no functional change)
- UX-8 documentation · historical validators
- FocusRegistry · SelectionRegistry · HoverRegistry · ClipboardRegistry internals
- InteractionCommandDispatcher · VisibilityRegistry · WindowRegistry

---

## Gate

**UX-9.5 COMPLETE** when:

1. Documentation published (`docs/UX/UX-9.5.md`)
2. `validate:ux-9.5` PASS
3. Roadmap UX-9.5 → COMPLETE
4. Copy / Paste perceptible via certified infrastructure + Bridge only
5. No new base infrastructure introduced

Clipboard Bridge Authority Freeze vigente.  
Clipboard Entry Canonical Freeze vigente.  
Clipboard Success Freeze vigente.  
Clipboard Feedback Lifetime Freeze vigente.  
Legacy Isolation Freeze vigente.

---

## Next UX-9.6

**Next microphase → UX-9.6 (Command Palette + Interaction Commands)**

Interaction Commands / palette become perceptible — still via
ProductCompositionHost extension, without new base systems.
