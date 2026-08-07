# UX-I5 — Certification Evidence Package

**Date:** 2026-08-06  
**Gate:** `npm run validate:ux-i5`

---

## Evidence inventory


| Artifact | Path |
|----------|------|
| Focus / motion polish SSOT | `src/lib/ui/focus-ring.ts` |
| Host skip link + target | `src/app/theme-runtime-host.tsx` (`#main-content`) |
| Reduced-motion + skip styles | `src/app/globals.css` |
| Build record | `docs/UX/implementation/UX-I5-UX-Polish-Accessibility-Certification-BUILD.md` |
| Certification | `docs/UX/certification/CERTIFICATION.md` |
| Accessibility audit | `docs/UX/certification/ACCESSIBILITY.md` |
| Visual consistency audit | `docs/UX/certification/VISUAL_CONSISTENCY.md` |
| Validator | `scripts/validate-ux-i5.ts` |

---

## Domain preservation

| Domain | Expectation |
|--------|-------------|
| `src/engine` | Present · unmodified by UX-I5 |
| `src/data` | Present · unmodified by UX-I5 |
| `src/ai` | Present · unmodified by UX-I5 |
| `src/ui` ThemeProvider | Present · Design System sources unmodified |

---

## Prerequisite chain

`validate:ux-i5` → `validate:ux-i4` → … → `validate:ux-i0`

---

## Success metrics (qualitative)

- Consistent professional Design System identity  
- Minimal remaining visual debt  
- Cohesive interaction quality  
- Improved accessibility / focus / motion  
- No visible authority of inherited Cursor/Lovable warm hex shell  
