# UX-4.8 — Responsive + Docking Integration

> **Architectural principles:**
> - AppShell remains the only composition root for application chrome.
> - Responsive + Docking Integration in UX-4.8 consists of composition
>   certification and layout normalization. Existing docking infrastructure
>   is reused unchanged. No new docking behavior is introduced.
> - Normalize existing responsive behavior. Do not introduce a second
>   responsive system or new breakpoint semantics.
> - Responsive behavior is a layout concern, not a feature concern.
> - Docking infrastructure remains the owner of docking behavior. AppShell
>   owns only layout composition.
> - Inspector Region owns only the grid track. Inspector owns width and
>   visibility.
> - No structural relocation is performed in UX-4.8.
> - Tailwind responsive variants only inside `app-shell/**`.

**Épica:** UX-4 — Runtime Host Integration + Lovable App Shell  
**Microfase:** UX-4.8 — Responsive + Docking Integration  
**Fecha:** 2026-08-03  
**Prerrequisitos:** UX-4.7 Status Bar Integration COMPLETE  
**SSOT de serie:** [`UX-4.0-roadmap.md`](./UX-4.0-roadmap.md)  
**Estado:** FROZEN · COMPLETE

**Declaración:**

```text
UX-4.8 = Responsive + Docking Integration
SCOPE = composition certification + layout normalization
Normalize, don't invent — no second responsive system
AppShell = only composition root for application chrome
AppShell owns grid tracks / breakpoints / composition
Sidebar owns width / rail / drawer (reuse)
Inspector owns width / visibility (reuse)
Dock owns docking / floating / drag / drop (reuse)
Inspector Region owns only the grid track
Tailwind responsive variants only · no JS viewport logic in app-shell/**
NO DockRootV2 · NO ResponsiveProvider · NO new docking features
NO WindowManager changes · NO Runtime migration · NO useTheme()
ThemeRuntimeHost / Runtime UX-3 = intact
page.tsx / WorkspaceLayout / Sidebar / Inspector / Toolbar / StatusBar = protected
API FREEZE UX-3 = VIGENTE
Next: UX-4.9 Chrome Runtime Migration
```

---

## 1. Purpose / Objetivo

Normalizar el comportamiento responsive del AppShell conforme a
[`RESPONSIVE.md`](../../ux/docs/RESPONSIVE.md) y certificar la reutilización
de la infraestructura de docking existente, **sin** nuevas funcionalidades y
**sin** un segundo sistema responsive.

```text
Normalize existing responsive behavior.
Do not introduce a second responsive system or new breakpoint semantics.
```

---

## 2. Estado de partida (gap matrix)

| RESPONSIVE rule | Evidence at start | UX-4.8 action |
|-----------------|-------------------|---------------|
| Breakpoints (Tailwind) | AppShell had **zero** breakpoint classes | Normalize grid with `lg:` variant |
| §5 Workspace priority | Inspector track `minmax(280px,auto)` reserved space when hidden | Inspector track → content-driven `auto`; collapse below `lg` |
| §6 Sidebar | Already in Sidebar (`SIDEBAR_MOBILE_MQ`, rail, drawer) | **Certify only** |
| §7 Inspector product drawer | Frozen `visible={false}` in protected `page.tsx` | Region geometry only — no drawer feature |
| §9 Floating windows | Workspace Region `relative` + `overflow-hidden` (UX-4.5) | **Certify reuse** |
| Docking | DockRoot / DockZone / DockPanel in page panels; `DOCK_FEATURES` off | **Certify reuse** |

---

## 3. Ownership (FROZEN)

| Concern | Owner |
|---------|--------|
| Grid tracks / breakpoint class composition / overflow bounds | AppShell (tracks only) |
| Sidebar width + rail + drawer | Sidebar |
| Inspector width + visibility | Inspector |
| Dock drag / drop / floating | Docking + WindowManager |

```text
Inspector Region owns only the grid track.
Inspector owns width and visibility.

Sidebar Region owns only the grid track.
Sidebar owns width (and its rail/drawer).

AppShell decides grid tracks only — never component width/visibility.
```

---

## 4. Public API (FROZEN)

No new public API in UX-4.8. `AppShell` / `AppShellLayout` props unchanged.

---

## 5. In Scope / Out of Scope

**In**

- Normalizar grid responsive de `AppShellLayout`
- Normalizar track del Inspector (`auto`, sin `minmax(280px,…)`)
- Certificar Sidebar drawer ownership
- Certificar reutilización DockRoot / DockZone / FloatingWindowLayer
- Doc + `validate:ux-4.8`

**Out**

- Nuevo docking / nuevas zonas / drag / resize / ventanas nuevas
- Inspector drawer/modal de producto
- Runtime migration / `useTheme()` (→ UX-4.9)
- Cambios en WindowManager / page.tsx / Sidebar / Inspector
- `ResponsiveProvider` / JS viewport logic en `app-shell/**`

---

## 6. Arquitectura

```text
ThemeRuntimeHost
        │
WorkspaceLayout (bridge · protected)
        │
AppShell  ← sole chrome composition root · layout-only
 ├── Toolbar
 ├── Sidebar      ← owns rail / drawer (reuse)
 ├── Workspace    ← hosts DockRoot + FloatingWindowLayer (reuse)
 ├── Inspector    ← owns width / visibility (frozen subtree)
 └── Status Bar
```

Grid (UX-4.8):

```text
Below lg:  grid-cols-[auto_minmax(0,1fr)_0fr]
At lg+:    grid-cols-[auto_minmax(0,1fr)_auto]
Rows:      grid-rows-[auto_minmax(0,1fr)_auto]
Areas:     toolbar / sidebar_workspace_inspector / statusBar
```

---

## 7. Rollback

1. Revertir únicamente clases responsive de `AppShellLayout`.
2. Restaurar `grid-cols-[auto_minmax(0,1fr)_minmax(280px,auto)]` si fuera necesario.
3. Conservar UX-4.1–UX-4.7, Runtime UX-3, WindowManager y docking intactos.

---

## 8. Archivos

| Archivo | Acción |
|---------|--------|
| `src/components/app-shell/AppShellLayout.tsx` | MODIFY — responsive grid + inspector track `auto` |
| `src/components/app-shell/AppShell.tsx` | MODIFY — ownership comments UX-4.8 |
| `docs/UX/UX-4.8.md` | CREATE |
| `scripts/validate-ux-4.8.ts` | CREATE |
| `package.json` | `validate:ux-4.8` |
| `docs/UX/UX-4.0-roadmap.md` | UX-4.8 COMPLETE · Next UX-4.9 |

**Protegidos:** `page.tsx`, WorkspaceLayout / WorkspaceContent / Workspace,
WindowManager, DockRoot, DockZone, FloatingWindowLayer, ThemeRuntimeHost,
Runtime, providers, `src/lib/ui/**`, Toolbar, Sidebar, Inspector, StatusBar.

---

## 9. Acceptance (CA-UX-4.8)

- [x] CA-UX-4.8.1 Breakpoints implementados según RESPONSIVE.md
- [x] CA-UX-4.8.2 Sidebar colapsa correctamente (ownership intacto)
- [x] CA-UX-4.8.3 Inspector responde correctamente (track-only geometry)
- [x] CA-UX-4.8.4 Docking existente reutilizado sin cambios
- [x] CA-UX-4.8.5 WindowManager intacto
- [x] CA-UX-4.8.6 AppShell continúa siendo el único composition root
- [x] CA-UX-4.8.7 Toolbar, Sidebar, Workspace, Inspector y StatusBar intactos funcionalmente
- [x] CA-UX-4.8.8 ThemeRuntimeHost y Runtime UX-3 intactos
- [x] CA-UX-4.8.9 Sin nuevas funcionalidades
- [x] CA-UX-4.8.10 Sin cambios en el sistema de docking
- [x] CA-UX-4.8.11 `npx tsc --noEmit` PASS
- [x] CA-UX-4.8.12 `npm run validate:ux-4.8` PASS

---

## 10. Gate

```text
npm run validate:ux-4.8
```

Blocks: `responsiveLayout` · `sidebarResponsive` · `inspectorResponsive` ·
`noResponsiveLogic` · `dockingReuse` · `noDockRewrite` · `appShellRoot` ·
`runtimeFreeze` · `priorGate` · `tscCompile`

---

## 11. Definition of Done

- [x] Responsive integrado (normalizado, no reinventado)
- [x] Docking reutilizado
- [x] Sin cambios funcionales de producto
- [x] WindowManager intacto
- [x] Runtime intacto
- [x] Gates PASS
- [x] Documentación completa
- [x] Roadmap Next = UX-4.9 — Chrome Runtime Migration

AppShell chrome geometry is complete:

```text
✅ five regions
✅ responsive
✅ docking integrated (reuse)
✅ layout-only
✅ ownership normalized
```

---

## 12. Next

**Next:** UX-4.9 — Chrome Runtime Migration  
Migrar progresivamente el chrome del AppShell al consumo del Theme Runtime
(`@/ui`). Eliminar dependencias residuales de `UI_TOKENS` en el chrome.
Mantener la compatibilidad con el API Freeze de UX-3.
Sin volver a tocar la geometría del AppShell.

---

## Related

- [`UX-4.0-roadmap.md`](./UX-4.0-roadmap.md)
- [`UX-4.7.md`](./UX-4.7.md)
- [`UX-4.6.md`](./UX-4.6.md)
- [`ux/docs/RESPONSIVE.md`](../../ux/docs/RESPONSIVE.md)
- [`ux/docs/LAYOUT.md`](../../ux/docs/LAYOUT.md)
- [`scripts/validate-ux-4.8.ts`](../../scripts/validate-ux-4.8.ts)
