# UX-4.9 — Chrome Runtime Migration

> **Architectural principles:**
> - Theme Runtime remains the single source of truth for chrome styling.
> - Chrome migration only. Product UI migration is explicitly deferred.
> - Geometry remains frozen after UX-4.8.
> - Visual parity is structural, not pixel-perfect.
> - The legacy-to-runtime CSS variable mapping defined in UX-4.9 is frozen
>   for this phase. Any additional mappings require an explicit roadmap change.
> - Dual-stack outside AppShell is intentional and must not be interpreted as
>   technical debt inside UX-4.9.

**Épica:** UX-4 — Runtime Host Integration + Lovable App Shell  
**Microfase:** UX-4.9 — Chrome Runtime Migration  
**Fecha:** 2026-08-03  
**Prerrequisitos:** UX-4.8 Responsive + Docking Integration COMPLETE  
**SSOT de serie:** [`UX-4.0-roadmap.md`](./UX-4.0-roadmap.md)  
**Estado:** FROZEN · COMPLETE

**Declaración:**

```text
UX-4.9 = Chrome Runtime Migration
SCOPE = AppShell chrome + StatusBar CSS var migration only
Theme Runtime = SSOT for chrome styling
Frozen mapping only — no additional mappings
Dual-stack outside app-shell/** + status-bar/** = intentional
Geometry frozen after UX-4.8
Visual parity = structural (not pixel-perfect)
NO Sidebar / Toolbar / Inspector migration
NO Runtime API changes · NO ThemeProvider edits
NO useTheme() required — CSS vars via ThemeProvider host
ThemeRuntimeHost / Runtime UX-3 = intact
API FREEZE UX-3 = VIGENTE
Next: UX-4.10 Integration Certification
```

---

## 1. Purpose / Objetivo

Migrar el chrome del AppShell y el StatusBar al consumo del Theme Runtime,
sustituyendo exclusivamente las referencias legacy inventariadas (`--app-*`)
por las variables equivalentes (`--color-*`), preservando la geometría, la
composición y el comportamiento estructural del shell.

```text
Chrome Runtime Migration in UX-4.9 consists of migrating AppShell chrome
from legacy CSS variables to the certified Theme Runtime.
Product UI remains intentionally dual-stack.
```

Esta fase es una migración mecánica de variables CSS, no una migración funcional.

---

## 2. Estado de partida (inventario congelado)

| Archivo | Referencias legacy |
|---------|-------------------|
| `src/components/app-shell/AppShell.tsx` | `--app-border`, `--app-surface-muted`, `--app-text-muted` |
| `src/components/status-bar/StatusBarLayout.tsx` | `--app-border`, `--app-surface`, `--app-text-muted` |

- Cero imports de `UI_TOKENS` en `app-shell/**` y `status-bar/**`.
- Este inventario no se amplía en BUILD.

---

## 3. Mapping FROZEN

| Legacy | Runtime |
|--------|---------|
| `--app-border` | `--color-border-default` |
| `--app-surface` | `--color-surface-default` |
| `--app-surface-muted` | `--color-surface-canvas` |
| `--app-text-muted` | `--color-text-muted` |

```text
The legacy-to-runtime CSS variable mapping defined in UX-4.9 is frozen for this phase.
Any additional mappings require an explicit roadmap change.
```

---

## 4. Ownership (FROZEN)

| Concern | Owner |
|---------|--------|
| Chrome CSS var source (AppShell + StatusBar) | Theme Runtime (`--color-*`) |
| Product UI tokens (Sidebar / Toolbar / Inspector / Workspace / Canvas) | Dual-stack `--app-*` / `UI_TOKENS` (intentional) |
| Grid / tracks / responsive / regions | AppShellLayout (frozen UX-4.8) |
| ThemeProvider / Runtime Pipeline / Reporter / Diagnostics | UX-3 (intact) |

---

## 5. Public API (FROZEN)

No new public API in UX-4.9. No Runtime API changes. No ThemeProvider changes.

---

## 6. In Scope / Out of Scope

**In**

- Swap CSS vars in `AppShell.tsx` placeholders and `StatusBarLayout.tsx`
- Doc + `validate:ux-4.9`
- Roadmap close → Next UX-4.10

**Out**

- Sidebar / Toolbar / Inspector / Workspace / Canvas migration
- Theme map edits / Runtime / ThemeProvider / ThemeRuntimeHost
- Geometry / responsive / docking / layout changes
- `useTheme()` hooks in chrome (optional; not required)
- New features

---

## 7. Arquitectura

```text
ThemeRuntimeHost
        │
ThemeProvider  (--color-* injected on host)
        │
AppShell  ← chrome uses --color-* (UX-4.9)
 ├── Toolbar Region
 ├── Sidebar Region   ← product dual-stack (intentional)
 ├── Workspace Region ← product dual-stack (intentional)
 ├── Inspector Region ← product dual-stack (intentional)
 └── StatusBar       ← chrome uses --color-* (UX-4.9)
```

---

## 8. Rollback

1. Restaurar únicamente las refs `--app-*` en `AppShell.tsx` y `StatusBarLayout.tsx`.
2. Conservar ThemeRuntimeHost, Runtime UX-3, geometría UX-4.8 y dual-stack fuera.

---

## 9. Archivos

| Archivo | Acción |
|---------|--------|
| `src/components/app-shell/AppShell.tsx` | MODIFY — placeholder `--color-*` |
| `src/components/status-bar/StatusBarLayout.tsx` | MODIFY — footer `--color-*` |
| `docs/UX/UX-4.9.md` | CREATE |
| `scripts/validate-ux-4.9.ts` | CREATE |
| `package.json` | `validate:ux-4.9` |
| `docs/UX/UX-4.0-roadmap.md` | UX-4.9 COMPLETE · Next UX-4.10 |

**Protegidos:** ThemeRuntimeHost, ThemeProvider, Runtime, Workspace*, Sidebar,
Toolbar, Inspector, WindowManager, DockRoot, DockZone, FloatingWindowLayer,
`page.tsx`, `src/lib/ui/**`, `AppShellLayout` geometry.

---

## 10. Acceptance (CA-UX-4.9)

- [x] CA-UX-4.9.1 Chrome consume Theme Runtime (`--color-*`)
- [x] CA-UX-4.9.2 Sin dependencias directas de `UI_TOKENS` en AppShell chrome
- [x] CA-UX-4.9.3 Sin dependencias directas de `--app-*` en `app-shell/**` / `status-bar/**`
- [x] CA-UX-4.9.4 Sin cambios geométricos (idéntico a UX-4.8)
- [x] CA-UX-4.9.5 Sin cambios visuales intencionales (parity estructural)
- [x] CA-UX-4.9.6 ThemeProvider intacto
- [x] CA-UX-4.9.7 Runtime UX-3 intacto
- [x] CA-UX-4.9.8 Workspace y producto intactos (dual-stack intencional)
- [x] CA-UX-4.9.9 Sin nuevas funcionalidades
- [x] CA-UX-4.9.10 Sin cambios de API
- [x] CA-UX-4.9.11 `npx tsc --noEmit` PASS
- [x] CA-UX-4.9.12 `npm run validate:ux-4.9` PASS

---

## 11. Gate

```text
npm run validate:ux-4.9
```

Blocks: `chromeRuntime` · `noLegacyTokens` · `visualParity` · `geometryFreeze` ·
`runtimeIsolation` · `appShellRoot` · `priorGate` · `tscCompile`

`noLegacyTokens` escanea **únicamente** `app-shell/**` y `status-bar/**`.

---

## 12. Definition of Done

- [x] Chrome migrado al Theme Runtime (mapping congelado)
- [x] Sin tokens legacy en `app-shell/**` ni `status-bar/**`
- [x] Dual-stack fuera del chrome intacto (intencional)
- [x] Runtime intacto
- [x] Geometría intacta (UX-4.8)
- [x] Visual parity estructural
- [x] Gates PASS
- [x] Documentación completa
- [x] Roadmap Next = UX-4.10 — Integration Certification

```text
✅ chrome --color-*
✅ no --app-* in app-shell/** + status-bar/**
✅ frozen mapping only
✅ geometry frozen
✅ dual-stack outside intentional
✅ Runtime intact
```

---

## 13. Next

**Next:** UX-4.10 — Integration Certification  
Certificar toda la serie UX-4. Verificar API Freeze, composición y Theme
Runtime. Emitir la certificación final de la serie antes de iniciar UX-5.

---

## Related

- [`UX-4.0-roadmap.md`](./UX-4.0-roadmap.md)
- [`UX-4.8.md`](./UX-4.8.md)
- [`UX-4.7.md`](./UX-4.7.md)
- [`src/ui/docs/TOKENS.md`](../../src/ui/docs/TOKENS.md)
- [`scripts/validate-ux-4.9.ts`](../../scripts/validate-ux-4.9.ts)
