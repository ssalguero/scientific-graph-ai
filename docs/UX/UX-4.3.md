# UX-4.3 — Sidebar Alignment

> **Architectural principles:**
> - AppShell remains the only composition root for application chrome.
> - WorkspaceLayout acts as a transitional bridge.
> - Sidebar alignment is a composition task, not a feature task.
> - Reuse before rewrite.
> - The AppShell Sidebar Region must never impose a minimum width larger than the Sidebar component itself. Sidebar owns width. AppShell owns position.
> - Scrolling ownership remains inside Sidebar. AppShell only bounds the region.

**Épica:** UX-4 — Runtime Host Integration + Lovable App Shell  
**Microfase:** UX-4.3 — Sidebar Alignment  
**Fecha:** 2026-08-03  
**Prerrequisitos:** UX-4.2 App Shell Foundation COMPLETE  
**SSOT de serie:** [`UX-4.0-roadmap.md`](./UX-4.0-roadmap.md)  
**Estado:** FROZEN · COMPLETE

**Declaración:**

```text
UX-4.3 = Sidebar Alignment
SCOPE = align existing Sidebar to AppShell Sidebar Region · composition only
AppShell = only composition root for application chrome
WorkspaceLayout = transitional bridge
Single Sidebar instance — never old + new dual mount
Sidebar owns width · AppShell owns position
Scrolling ownership remains inside Sidebar · AppShell only bounds the region
NO Sidebar v2 · NO SidebarContext · NO SidebarProvider · NO stores
NO AdaptiveToolbar migration (deferred to UX-4.4)
NO page.tsx · NO ThemeRuntimeHost · NO Runtime UX-3 · NO src/lib/ui edits
API FREEZE UX-3 = VIGENTE
Next: UX-4.4 Toolbar Migration
```

---

## 1. Purpose / Objetivo

Alinear la Sidebar existente con la Sidebar Region del AppShell, respetando
[`LAYOUT.md`](../../ux/docs/LAYOUT.md), **sin** modificar comportamiento,
**sin** reescribir componentes y **sin** nuevas funcionalidades.

```text
There is a single Sidebar instance. Only its home region changes.
```

---

## 2. Estado de partida

| Hecho | Evidencia |
|-------|-----------|
| UX-4.2 COMPLETE | [`UX-4.2.md`](./UX-4.2.md) · AppShell 5 regiones |
| Sidebar Region | slot existente vía bridge |
| Sidebar funcional | `src/components/ui/sidebar/Sidebar.tsx` |
| AdaptiveToolbar | permanece en WorkspaceContent |
| ThemeRuntimeHost / Runtime UX-3 | intactos |

---

## 3. Ownership (FROZEN)

| Concern | Owner |
|---------|--------|
| Position / region rectangle | AppShell |
| Expanded / collapsed width | Sidebar |
| Scrolling | Sidebar |
| AppShell region role | Bound rectangle only (`min-h-0`, overflow clip) — **not** scroll content |

```text
The AppShell Sidebar Region must never impose a minimum width
larger than the Sidebar component itself.
Expanded and collapsed widths are exclusively owned by Sidebar.

Scrolling ownership remains inside Sidebar.
AppShell only bounds the region.
```

---

## 4. In Scope / Out of Scope

**In**

- Geometría Sidebar Region (sin min-width 240px desde AppShell)
- Fill de altura de región (no viewport)
- Overrides mínimos de layout en `Sidebar.tsx`
- Doc + `validate:ux-4.3`

**Out**

- Sidebar v2 / Context / Provider / stores / hooks nuevos
- Toolbar migration · Inspector · Status Bar · Responsive · Docking
- `useTheme()` · Runtime migration · features / acciones / paneles nuevos

---

## 5. Arquitectura

```text
ThemeRuntimeHost
  └─ … GraphEditor
       └─ WorkspaceLayout (bridge)
            └─ AppShell
                 └─ Sidebar Region (bounds only · no width min > Sidebar)
                      └─ <Sidebar />  ← unique instance (page slot)
```

---

## 6. Rollback

1. Restaurar columnas/clases previas en AppShell* / Sidebar layout overrides.
2. Quitar doc/validator UX-4.3.
3. Conservar UX-4.1 y UX-4.2 intactos.

---

## 7. Archivos

| Archivo | Acción |
|---------|--------|
| `src/components/app-shell/AppShellLayout.tsx` | MODIFY — columna sidebar `auto` (sin min 240px) |
| `src/components/app-shell/AppShell.tsx` | MODIFY — Sidebar Region bounds-only |
| `src/components/ui/sidebar/Sidebar.tsx` | MODIFY — `!h-full !min-h-0` (layout only) |
| `src/components/workspace/WorkspaceLayout.tsx` | MODIFY — comentarios bridge UX-4.3 |
| `docs/UX/UX-4.3.md` | CREATE |
| `scripts/validate-ux-4.3.ts` | CREATE |
| `package.json` | `validate:ux-4.3` |
| `docs/UX/UX-4.0-roadmap.md` | UX-4.3 COMPLETE · Next UX-4.4 |

**Protegidos:** `page.tsx`, ThemeRuntimeHost, Runtime, providers, `src/lib/ui/**`,
WorkspaceContent, AdaptiveToolbar, WindowManager.

---

## 8. Acceptance (CA-UX-4.3)

- [x] CA-UX-4.3.1 Sidebar contenida en Sidebar Region; AppShell bounds only
- [x] CA-UX-4.3.2 Sin duplicación — un solo `<Sidebar />`
- [x] CA-UX-4.3.3 Sin cambio funcional; widths owned by Sidebar; rail collapse safe
- [x] CA-UX-4.3.4 Workspace independiente
- [x] CA-UX-4.3.5 AppShell = único composition root
- [x] CA-UX-4.3.6 WorkspaceLayout = bridge
- [x] CA-UX-4.3.7 AdaptiveToolbar en WorkspaceContent
- [x] CA-UX-4.3.8 ThemeRuntimeHost intacto
- [x] CA-UX-4.3.9 Runtime UX-3 intacto
- [x] CA-UX-4.3.10 Sin features nuevas
- [x] CA-UX-4.3.11 `npx tsc --noEmit` PASS
- [x] CA-UX-4.3.12 `npm run validate:ux-4.3` PASS

---

## 9. Gate

```text
npm run validate:ux-4.3
```

Blocks: `sidebarRegion` · `singleSidebar` · `railCollapseSafe` · `noRewrite` ·
`workspaceIsolation` · `appShellRoot` · `workspaceBridge` · `toolbarDeferred` ·
`scrollOwnership` · `runtimeFreeze` · `priorGate` · `tscCompile`

---

## 10. Definition of Done

- [x] Sidebar alineada al AppShell
- [x] Una sola instancia; sin rewrite
- [x] Width + scroll ownership en Sidebar
- [x] AdaptiveToolbar deferred
- [x] Runtime / ThemeRuntimeHost intactos
- [x] Gates PASS · Roadmap Next = UX-4.4

---

## 11. Next

**Next:** UX-4.4 — Toolbar Migration  
Mover `AdaptiveToolbar` desde `WorkspaceContent` → Toolbar Region del AppShell,
sin cambio funcional.

---

## Related

- [`UX-4.0-roadmap.md`](./UX-4.0-roadmap.md)
- [`UX-4.2.md`](./UX-4.2.md)
- [`ux/docs/LAYOUT.md`](../../ux/docs/LAYOUT.md)
- [`scripts/validate-ux-4.3.ts`](../../scripts/validate-ux-4.3.ts)
