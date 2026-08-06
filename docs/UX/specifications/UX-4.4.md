# UX-4.4 — Toolbar Migration

> **Architectural principles:**
> - AppShell remains the only composition root for application chrome.
> - Toolbar migration is a composition task, not a feature task.
> - Reuse before rewrite.
> - Move-only migration. The AdaptiveToolbar JSX subtree must be relocated without semantic modifications. Props, callbacks, children, identity and ownership remain unchanged; only the composition path changes.
> - WorkspaceLayout forwards the toolbar slot transparently. It must not inspect, wrap, transform or conditionally render the toolbar.
> - There must be exactly one AdaptiveToolbar instance.
> - The Toolbar owns functionality. AppShell owns position.

**Épica:** UX-4 — Runtime Host Integration + Lovable App Shell  
**Microfase:** UX-4.4 — Toolbar Migration  
**Fecha:** 2026-08-03  
**Prerrequisitos:** UX-4.3 Sidebar Alignment COMPLETE  
**SSOT de serie:** [`UX-4.0-roadmap.md`](./UX-4.0-roadmap.md)  
**Estado:** FROZEN · COMPLETE

**Declaración:**

```text
UX-4.4 = Toolbar Migration
SCOPE = move AdaptiveToolbar → AppShell Toolbar Region · composition only
AppShell = only composition root for application chrome
WorkspaceLayout = transitional bridge (transparent toolbar forward)
Move-only migration — AdaptiveToolbar JSX subtree identity preserved
Single AdaptiveToolbar instance — never dual mount
Toolbar owns functionality · AppShell owns position
AppShell renders received slot — does NOT create AdaptiveToolbar
WorkspaceContent no longer owns toolbar position
NO Toolbar v2 · NO ToolbarContext · NO ToolbarProvider · NO stores
NO Inspector · NO Status Bar · NO Responsive · NO Docking
NO ThemeRuntimeHost · NO Runtime UX-3 · NO src/lib/ui edits
page.tsx = authorized move-only slot rewire only
API FREEZE UX-3 = VIGENTE
Next: UX-4.5 Workspace Integration
```

---

## 1. Purpose / Objetivo

Migrar el `AdaptiveToolbar` existente desde `WorkspaceContent` hacia la Toolbar
Region del AppShell, respetando [`LAYOUT.md`](../../ux/docs/LAYOUT.md), **sin**
modificar comportamiento, **sin** reescribir el toolbar y **sin** nuevas
funcionalidades.

```text
There is a single AdaptiveToolbar instance. Only its home region changes.
```

---

## 2. Estado de partida

| Hecho | Evidencia |
|-------|-----------|
| UX-4.3 COMPLETE | [`UX-4.3.md`](./UX-4.3.md) · Sidebar alineada |
| AppShell Toolbar Region | placeholder hasta UX-4.4 |
| AdaptiveToolbar | vivía en `WorkspaceContent` |
| WorkspaceLayout | bridge (sidebar + workspace) |
| ThemeRuntimeHost / Runtime UX-3 | intactos |

---

## 3. Ownership (FROZEN)

| Concern | Owner |
|---------|--------|
| Props / callbacks / children / behavior | AdaptiveToolbar (page-composed subtree) |
| Position / Toolbar Region | AppShell |
| Transparent slot forwarding | WorkspaceLayout |
| Workspace content (no toolbar) | WorkspaceContent |

```text
Move-only migration.
The AdaptiveToolbar JSX subtree must be relocated without semantic modifications.
Props, callbacks, children, identity and ownership remain unchanged;
only the composition path changes.

WorkspaceLayout forwards the toolbar slot transparently.
It must not inspect, wrap, transform or conditionally render the toolbar.

AppShell owns position, not toolbar creation.
```

---

## 4. In Scope / Out of Scope

**In**

- Mover slot AdaptiveToolbar: `WorkspaceContent` → `WorkspaceLayout` → AppShell Toolbar Region
- Bridge transparente `toolbar?: ReactNode` / `toolbar={toolbar}`
- AppShellRegion wrap del slot recibido (posición)
- Detach render en WorkspaceContent
- Move-only rewire autorizado en `page.tsx`
- Doc + `validate:ux-4.4`

**Out**

- Toolbar v2 / Context / Provider / stores / hooks nuevos
- Nuevos botones / acciones / features
- Inspector · Status Bar · Responsive · Docking
- `useTheme()` · Chrome Runtime Migration · Runtime UX-3 edits

---

## 5. Arquitectura

```text
Antes:
page.tsx → WorkspaceContent → AdaptiveToolbar
AppShell Toolbar Region = placeholder

Después:
page.tsx
  │
  toolbar (AdaptiveToolbar subtree — identity preserved)
  │
WorkspaceLayout  ← forward only: toolbar={toolbar}
  │
AppShell         ← position only: Toolbar Region wraps the slot
  │
Toolbar Region
  │
AdaptiveToolbar  ← unique instance

WorkspaceContent = workspace only
```

---

## 6. Rollback

1. Restaurar montaje de AdaptiveToolbar en `WorkspaceContent`.
2. Eliminar montaje desde AppShell Toolbar Region / bridge `toolbar`.
3. Revertir únicamente cambios de composición.
4. Conservar UX-4.1, UX-4.2 y UX-4.3 intactos.

---

## 7. Archivos

| Archivo | Acción |
|---------|--------|
| `src/components/app-shell/AppShell.tsx` | MODIFY — Toolbar Region wraps received slot |
| `src/components/workspace/WorkspaceLayout.tsx` | MODIFY — transparent `toolbar` forward |
| `src/components/workspace/types.ts` | MODIFY — `toolbar?` on Layout; remove from Content |
| `src/components/workspace/WorkspaceContent.tsx` | MODIFY — detach toolbar render |
| `src/app/page.tsx` | MODIFY — move-only AdaptiveToolbar slot rewire |
| `docs/UX/UX-4.4.md` | CREATE |
| `scripts/validate-ux-4.4.ts` | CREATE |
| `package.json` | `validate:ux-4.4` |
| `docs/UX/UX-4.0-roadmap.md` | UX-4.4 COMPLETE · Next UX-4.5 |

**Protegidos:** ThemeRuntimeHost, Runtime, providers, `src/lib/ui/**`,
WindowManager, Sidebar (functional), AdaptiveToolbar component body.

---

## 8. Acceptance (CA-UX-4.4)

- [x] CA-UX-4.4.1 Toolbar Region contiene AdaptiveToolbar
- [x] CA-UX-4.4.2 Existe una única instancia
- [x] CA-UX-4.4.3 WorkspaceContent deja de montar el toolbar
- [x] CA-UX-4.4.4 Sin cambios funcionales (move-only)
- [x] CA-UX-4.4.5 AppShell = único composition root
- [x] CA-UX-4.4.6 WorkspaceLayout = bridge transparente
- [x] CA-UX-4.4.7 Sidebar permanece intacta
- [x] CA-UX-4.4.8 ThemeRuntimeHost intacto
- [x] CA-UX-4.4.9 Runtime UX-3 intacto
- [x] CA-UX-4.4.10 Sin nuevas funcionalidades
- [x] CA-UX-4.4.11 `npx tsc --noEmit` PASS
- [x] CA-UX-4.4.12 `npm run validate:ux-4.4` PASS

---

## 9. Gate

```text
npm run validate:ux-4.4
```

Blocks: `toolbarRegion` · `singleToolbar` · `toolbarIdentity` · `workspaceDetached` ·
`noRewrite` · `appShellRoot` · `workspaceBridge` · `sidebarIntact` ·
`runtimeFreeze` · `priorGate` · `tscCompile`

---

## 10. Definition of Done

- [x] Toolbar migrada al AppShell Toolbar Region
- [x] Una sola instancia; sin rewrite
- [x] WorkspaceContent ya no contiene el toolbar
- [x] Bridge transparente; AppShell slot-only
- [x] Runtime / ThemeRuntimeHost / Sidebar intactos
- [x] Gates PASS · Roadmap Next = UX-4.5

---

## 11. Next

**Next:** UX-4.5 — Workspace Integration  
Consolidar la región Workspace dentro del AppShell.
Refinar la composición del área central respetando LAYOUT.md.
Sin cambios funcionales del motor de ventanas.

---

## Related

- [`UX-4.0-roadmap.md`](./UX-4.0-roadmap.md)
- [`UX-4.3.md`](./UX-4.3.md)
- [`UX-4.2.md`](./UX-4.2.md)
- [`ux/docs/LAYOUT.md`](../../ux/docs/LAYOUT.md)
- [`scripts/validate-ux-4.4.ts`](../../scripts/validate-ux-4.4.ts)
