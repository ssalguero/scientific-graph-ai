# UX-I5 — Accessibility Audit

**Date:** 2026-08-06  
**Scope:** Presentation / keyboard / focus / reduced-motion polish only  
**Authority:** Certified Design System `--focus-ring-*` · `--motion-*`

---

## Improvements delivered


| Area | Evidence |
|------|----------|
| Shared focus ring | `src/lib/ui/focus-ring.ts` → `DS_FOCUS_RING` |
| Token compositions | `tokens.ts` buttons, inputs, sidebar, toolbar use `DS_FOCUS_RING` |
| Disclosure / reveal | `RevealButton`, `DisclosureSection`, `PanelOverflowMenu` |
| Context actions | `ContextAction` |
| Busy / loading | `PanelBusyOverlay` (`role="status"`, `aria-live`, reduced-motion spinner) |
| Skip link | `ThemeRuntimeHost` (`#main-content` on host wrapper) |
| Reduced motion | `motion-reduce:transition-none` on shared motion helpers + `globals.css` body |

---

## Keyboard navigation

- Skip link appears on focus and targets the Theme Runtime host main content region (`#main-content`).  
- Interactive chrome continues to use `focus-visible` rings (windows, palette, tabs via UX-I4; shared controls via UX-I5).  
- Disclosure controls retain `aria-expanded` / `aria-controls` / `role="region"`.

---

## Explicit non-goals

- No redesign of interaction models or focus trapping behavior.  
- No WCAG full-site audit tooling run as a gate (manual / structural polish only).  
- No ENGINE / DATA / AI changes.

---

## Verdict

**Accessibility improved** relative to pre–UX-I5 chrome; focus visibility and reduced-motion handling are Design System–aligned.
