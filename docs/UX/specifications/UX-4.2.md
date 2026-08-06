# UX-4.2 — App Shell Foundation

> **Architectural principles:**
> - AppShell is the only composition root for application chrome.
> - WorkspaceLayout acts as a transitional bridge.
> - AppShell is layout-only. It owns no application state.

**Épica:** UX-4 — Runtime Host Integration + Lovable App Shell  
**Microfase:** UX-4.2 — App Shell Foundation  
**Fecha:** 2026-08-03  
**Prerrequisitos:** UX-4.0 Roadmap FROZEN · UX-4.1 Theme Runtime Host Integration COMPLETE  
**SSOT de serie:** [`UX-4.0-roadmap.md`](./UX-4.0-roadmap.md)

**Declaración:**

```text
UX-4.2 = App Shell Foundation
SCOPE = five-region AppShell structure · layout-only · placeholders
AppShell = only composition root for application chrome
WorkspaceLayout = transitional bridge (NOT a composition root)
AppShell is layout-only. It owns no application state.
NO hooks · NO providers · NO stores · NO effects · NO business logic
NO AppShellContext · NO portals · NO slot framework
NO AdaptiveToolbar migration (deferred to UX-4.4)
NO page.tsx edits · NO ThemeRuntimeHost edits · NO Runtime UX-3 edits
API FREEZE UX-3 = VIGENTE
Next: UX-4.3 Sidebar Alignment
```

---

## 1. Purpose / Objetivo

Introducir el AppShell como el único composition root del application chrome,
materializando la estructura de cinco regiones de [`LAYOUT.md`](../../ux/docs/LAYOUT.md),
reutilizando la infraestructura existente y **sin** introducir funcionalidades nuevas.

Esta es la primera fase donde el usuario visualiza el esqueleto del layout Lovable.

```text
UX-4.2 establishes the App Shell structure only.
Existing chrome remains in its current location unless explicitly
migrated by later microphases. Toolbar relocation is explicitly
deferred to UX-4.4.
```

---

## 2. Estado de partida

| Hecho | Evidencia |
|-------|-----------|
| UX-4.1 COMPLETE | [`UX-4.1.md`](./UX-4.1.md) · ThemeRuntimeHost montado |
| Runtime UX-3 certificado + API Freeze | [`UX-3.21.md`](./UX-3.21.md) |
| Sin AppShell | composición vía `WorkspaceLayout` (3 slots) |
| Sidebar / AdaptiveToolbar / WindowManager | existentes y reutilizables |
| `page.tsx` protegido | política UX-4.1 |

---

## 3. In Scope / Out of Scope

**In**

- `src/components/app-shell/` (`AppShell`, `AppShellLayout`, `AppShellRegions`, `index`)
- Bridge: `WorkspaceLayout` monta AppShell
- Cinco regiones estructurales (`data-app-shell-region`)
- Placeholders: Toolbar, Inspector, Status Bar
- Doc + `validate:ux-4.2`

**Out**

- Migración AdaptiveToolbar (→ UX-4.4)
- AppShellContext / portals / slot framework
- Responsive avanzado / docking nuevo
- Inspector / Status Bar funcionales
- `useTheme()` / chrome migration a `@/ui`
- Providers / state / hooks / effects en AppShell
- Edits a `page.tsx` / ThemeRuntimeHost / Runtime UX-3

---

## 4. Arquitectura

```text
ThemeRuntimeHost                         ← intacto (UX-4.1)
  └─ WindowManager / SessionProvider / GraphEditor
       └─ WorkspaceLayout                ← transitional bridge
            └─ AppShell                  ← ONLY chrome composition root
                 ├── Toolbar Region          (placeholder)
                 ├── Sidebar Region          ← props.sidebar
                 ├── Workspace Region        ← props.workspace + panels
                 ├── Inspector Region        (placeholder)
                 └── Status Bar Region       (placeholder)
```

### Policy

```text
WorkspaceLayout acts as a transitional bridge.
AppShell is the only composition root for application chrome.
AppShell is layout-only. It owns no application state.
```

### AdaptiveToolbar

```text
AdaptiveToolbar remains in WorkspaceContent.
Migration deferred to UX-4.4.
app-shell/** must NOT import AdaptiveToolbar.
```

---

## 5. Riesgos

- Interpretar `WorkspaceLayout` como segundo composition root → mitigado por principio bridge.
- Introducir state/hooks en AppShell → mitigado por layout-only + validator `layoutOnly`.
- Adelantar UX-4.3/4.4 (Sidebar/Toolbar migration) → fuera de scope.

---

## 6. Rollback Strategy

1. Revertir `WorkspaceLayout` al `<main>` de 3 slots.
2. Eliminar `src/components/app-shell/`.
3. Quitar `validate:ux-4.2` / doc asociada.
4. ThemeRuntimeHost y Runtime UX-3 permanecen exactamente como UX-4.1.

---

## 7. Archivos

| Archivo | Acción |
|---------|--------|
| `src/components/app-shell/AppShell.tsx` | CREATE |
| `src/components/app-shell/AppShellLayout.tsx` | CREATE |
| `src/components/app-shell/AppShellRegions.ts` | CREATE |
| `src/components/app-shell/index.ts` | CREATE |
| `src/components/workspace/WorkspaceLayout.tsx` | MODIFY — bridge → AppShell |
| `docs/UX/UX-4.2.md` | CREATE |
| `scripts/validate-ux-4.2.ts` | CREATE |
| `package.json` | `validate:ux-4.2` |
| `docs/UX/UX-4.0-roadmap.md` | Status UX-4.2 COMPLETE · Next UX-4.3 |

**Protegidos:** `page.tsx`, `theme-runtime-host.tsx`, `src/ui/providers/**`,
`src/ui/theme/runtime/**`, `src/lib/ui/**`, certificación UX-4.1.

---

## 8. Acceptance (CA-UX-4.2)

- [x] CA-UX-4.2.1 Existe `AppShell` en `src/components/app-shell/`
- [x] CA-UX-4.2.2 AppShell is the only composition root for application chrome; `WorkspaceLayout` is a transitional bridge only
- [x] CA-UX-4.2.3 Cinco regiones estructuralmente presentes (`data-app-shell-region`); Toolbar / Inspector / Status Bar pueden ser placeholders
- [x] CA-UX-4.2.4 Workspace reutiliza WindowManager / FloatingWindowBridge (panels en región Workspace)
- [x] CA-UX-4.2.5 Sidebar reutilizada vía slot bridge (sin rewrite)
- [x] CA-UX-4.2.6 Toolbar Region exists; AdaptiveToolbar migration deferred to UX-4.4
- [x] CA-UX-4.2.7 ThemeRuntimeHost / layout mount intactos
- [x] CA-UX-4.2.8 Sin cambios Runtime UX-3 (API freeze)
- [x] CA-UX-4.2.9 Sin migración chrome a `@/ui` / sin `useTheme()` en shell
- [x] CA-UX-4.2.10 AppShell is layout-only + sin nuevas features de producto
- [x] CA-UX-4.2.11 `npx tsc --noEmit` PASS
- [x] CA-UX-4.2.12 `npm run validate:ux-4.2` PASS

---

## 9. Gate

```text
npm run validate:ux-4.2
```

Blocks: `appShellExists` · `fiveRegions` · `soleCompositionRoot` ·
`layoutOnly` · `reuseFence` · `hostIntact` · `runtimeFreeze` ·
`priorGate` · `tscCompile`

---

## 10. Definition of Done

- [x] AppShell existe; único composition root del chrome
- [x] WorkspaceLayout es únicamente bridge transicional
- [x] Cinco regiones visibles (placeholders Toolbar / Inspector / Status Bar)
- [x] UX-4.1 / ThemeRuntimeHost intactos
- [x] Runtime UX-3 intacto
- [x] Sin migración AdaptiveToolbar
- [x] Sin nuevas funcionalidades
- [x] `docs/UX/UX-4.2.md` completo
- [x] Gates PASS
- [x] Roadmap: UX-4.2 = COMPLETE; Next = UX-4.3

---

## 11. Next

**Next:** UX-4.3 — Sidebar Alignment  
Integrar completamente la Sidebar existente dentro del AppShell
(jerarquía, slots, dimensiones LAYOUT.md). Sin funcionalidades nuevas.

---

## Related

- [`UX-4.0-roadmap.md`](./UX-4.0-roadmap.md)
- [`UX-4.1.md`](./UX-4.1.md)
- [`ux/docs/LAYOUT.md`](../../ux/docs/LAYOUT.md)
- [`src/components/app-shell/AppShell.tsx`](../../src/components/app-shell/AppShell.tsx)
- [`scripts/validate-ux-4.2.ts`](../../scripts/validate-ux-4.2.ts)
