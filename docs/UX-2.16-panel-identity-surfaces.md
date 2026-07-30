# UX-2.16 — Panel Identity & Surface Foundation

**Épica:** UX-2 — Screen Migration Foundation  
**Microfase:** UX-2.16 — BUILD (Panel Identity & Surface Foundation)  
**Fase:** Presentational surface primitives + panel identity wiring  
**Fecha:** 2026-07-30  
**Estado:** **UX-2.16 = COMPLETE (awaiting human review)**  
**Prerrequisitos:** [`docs/UX-2.0-roadmap.md`](UX-2.0-roadmap.md) · UX-2.15 COMPLETE · D48 SSOT  

**Declaración:**

```text
UX-2.16 = COMPLETE (panel identity / surface foundation)
SCOPE = workspace/surfaces/ + Explorer/Inspector/Console/Canvas wiring
API FREEZE = PanelSurface · PanelAccent · PanelDivider ·
             PanelIconSlot · PanelMetadata · SURFACE_TOKENS
PACKAGE ISOLATION = surfaces/ ⊥ PanelState ⊥ persistence ⊥ resize ⊥ focus ⊥ modes
NO tone on PanelSurface · NO "use client" · NO hooks · NO domain metadata
READY FOR HUMAN REVIEW
```

---

## 1. Purpose

Introduce reusable visual surface primitives so each panel communicates identity before its content is read — Explorer, Inspector, Console, and Canvas gain consistent structure, accents, and density tokens without changing behavior, state, or layout engines.

---

## 2. Architecture

```text
workspace/surfaces/
  SurfaceTokens.ts      ← full visual SSOT
  PanelSurface.tsx      ← structure (variant / padding / elevated / muted)
  PanelAccent.tsx       ← identity color (position / tone)
  PanelDivider.tsx      ← decorative <div aria-hidden>
  PanelIconSlot.tsx     ← ReactNode icon slot
  PanelMetadata.tsx     ← secondary text (children only)
  index.ts

Explorer  → Surface + Accent + Icon + Metadata + Disclosure…
Inspector → Surface + Accent + PanelDivider + ContextDivider + Disclosure…
Console   → Surface + Accent + Disclosure…
Canvas    → PanelSurface wraps Hints + children only (outer node untouched)
```

```text
surfaces/
    │
    ▼
SurfaceTokens

surfaces/  ──✗──►  panels/state
surfaces/  ──✗──►  panels/persistence
surfaces/  ──✗──►  panels/resize
surfaces/  ──✗──►  focus/
surfaces/  ──✗──►  modes
surfaces/  ──✗──►  session
surfaces/  ──✗──►  providers
```

**Mapping:** Explorer → Left · Inspector → Right · Console → Bottom · Canvas → BodyLayout inner wrap.

**Separation:** Surface = structure · Accent = identity color.

---

## 3. IN

1. `workspace/surfaces/` presentational package (six modules + barrel)
2. `SURFACE_TOKENS` as sole visual constant / map source for the package
3. Static wiring in Explorer / Inspector / Console content + Canvas inner wrap
4. This document + `validate:ux-2.16` + roadmap resequence (2.16–2.19)

---

## 4. OUT

- `tone` on `PanelSurface`
- Dynamic metadata (counts, selection, Ready/Idle/Errors)
- `"use client"` or hooks inside `surfaces/`
- Panel.tsx / PanelHeader / PanelState / persistence / focus / resize / modes / session
- New `UI_TOKENS` keys or global CSS variables
- Expanding public `@/components/workspace` barrel with `surfaces/`
- Wrapping the outer canvas node (`data-workspace-canvas`)
- Replacing UX-2.15 `ContextDivider`
- Icon libraries / `iconName` enums

---

## 5. Frozen APIs

### 5.1 SURFACE_TOKENS

```ts
export const SURFACE_TOKENS = {
  radius: { … },
  padding: { … },
  gap: { … },
  border: { … },
  mutedOpacity: …,
  variant: { … },
  tone: { … },
  accent: { … },
  // divider / metadata / iconSlot maps
} as const;
```

Primitives look up keys only — no local Tailwind variant/tone maps.

### 5.2 PanelSurface

```ts
type PanelSurfaceProps = {
  children: React.ReactNode;
  variant?: "default" | "explorer" | "inspector" | "console" | "canvas";
  padding?: "none" | "sm" | "md";
  elevated?: boolean;
  muted?: boolean;
};
```

No `tone`. No hooks. No state.

### 5.3 PanelAccent

```ts
type PanelAccentProps = {
  position?: "left" | "top" | "none";
  tone?: "default" | "explorer" | "inspector" | "console";
};
```

Decorative; `aria-hidden`.

### 5.4 PanelDivider

```ts
type PanelDividerProps = {
  spacing?: "sm" | "md";
  muted?: boolean;
};
```

Renders `<div aria-hidden />` only — never `<hr>`.

### 5.5 PanelMetadata

```ts
type PanelMetadataProps = {
  children: React.ReactNode;
};
```

Style from `SURFACE_TOKENS` only — no variant / tone / size props.

### 5.6 PanelIconSlot

```ts
type PanelIconSlotProps = {
  icon: React.ReactNode;
  size?: "sm" | "md";
  tone?: "default" | "explorer" | "inspector" | "console";
};
```

No `iconName` / enums (prepared for UX-2.18).

---

## 6. Accessibility

- PanelAccent / PanelDivider / PanelIconSlot: `aria-hidden`
- PanelMetadata: plain text span (no interactive role)
- Canvas outer markers and focus/resize chrome unchanged

---

## 7. Validations

```bash
npm run validate:ux-2.16
```

Runs UX-2.16 structural checks, delegates `validate:ux-2.15` (`UX_SKIP_DELEGATES` leaf pattern), then `tsc --noEmit` and ESLint.

---

## 8. Acceptance criteria

| ID | Criterion | Result |
|----|-----------|--------|
| **CA-2.16.1** | `workspace/surfaces/` presentational package exists | PASS |
| **CA-2.16.2** | `SURFACE_TOKENS` is the only visual constant source | PASS |
| **CA-2.16.3** | PanelSurface stateless; no tone; no hooks / `"use client"` | PASS |
| **CA-2.16.4** | PanelAccent decorative; PanelDivider is `<div aria-hidden>` | PASS |
| **CA-2.16.5** | PanelMetadata children-only; PanelIconSlot uses ReactNode | PASS |
| **CA-2.16.6** | Explorer / Inspector / Console / Canvas migrated; ContextDivider kept | PASS |
| **CA-2.16.7** | No PanelState / focus / resize / persistence / modes coupling | PASS |
| **CA-2.16.8** | Roadmap 2.16–2.19 resequence documented | PASS |
| **CA-2.16.9** | `npm run validate:ux-2.16` PASS | PASS |

---

## 9. STOP

```text
UX-2.16 = COMPLETE (awaiting human review)
API FREEZE = PanelSurface · PanelAccent · PanelDivider ·
             PanelIconSlot · PanelMetadata · SURFACE_TOKENS
PACKAGE ISOLATION = surfaces/ ⊥ state ⊥ persistence ⊥ resize ⊥ focus ⊥ modes
Next: UX-2.17 — Toolbar & Action Refinement
Do NOT add tone to PanelSurface · Do NOT wire domain metadata · Do NOT reopen Panel.tsx
```
