# UX-4.5 — Workspace Integration

> **Architectural principles:**
> - AppShell remains the only composition root for application chrome.
> - Workspace Integration in UX-4.5 consists of composition certification and ownership normalization. No structural relocation is performed.
> - Reuse before rewrite.
> - Workspace owns functionality. AppShell owns position.
> - Workspace Region owns the overlay containing block (`position: relative`). Floating-window ownership remains inside the existing workspace stack.
> - Scroll ownership remains inside Workspace. AppShell only bounds the region (`overflow-hidden`).
> - WorkspaceLayout remains a transparent bridge.
> - AppShell renders the received workspace slot — it does not create Workspace.

**Épica:** UX-4 — Runtime Host Integration + Lovable App Shell  
**Microfase:** UX-4.5 — Workspace Integration  
**Fecha:** 2026-08-03  
**Prerrequisitos:** UX-4.4 Toolbar Migration COMPLETE  
**SSOT de serie:** [`UX-4.0-roadmap.md`](./UX-4.0-roadmap.md)  
**Estado:** FROZEN · COMPLETE

**Declaración:**

```text
UX-4.5 = Workspace Integration
SCOPE = composition certification + ownership normalization
NO structural relocation of Workspace / WindowManager / FloatingWindow*
AppShell = only composition root for application chrome
WorkspaceLayout = transitional bridge (transparent workspace + panels forward)
Workspace owns functionality + scroll · AppShell owns position + bounds + containing block
Workspace Region = relative · h-full · min-h-0 · min-w-0 · overflow-hidden
AppShell renders received slot — does NOT create WorkspaceContent
WindowManager remains at page root (D56.4)
FloatingWindowBridge remains inside WorkspacePanels
NO Workspace v2 · NO window-engine edits · NO provider moves
NO Inspector · NO Status Bar · NO Responsive · NO Docking
NO ThemeRuntimeHost · NO Runtime UX-3 · NO src/lib/ui edits
page.tsx = PROTECTED (no rewire)
API FREEZE UX-3 = VIGENTE
Next: UX-4.6 Inspector Integration
```

---

## 1. Purpose / Objetivo

Certificar la Workspace Region como propietaria exclusiva de la composición del
área de trabajo dentro del AppShell, consolidando límites del contenedor y
normalizando ownership — **sin** relocalizaciones estructurales ni cambios
funcionales.

```text
Workspace Integration in UX-4.5 consists of composition certification
and ownership normalization. No structural relocation is performed.
```

---

## 2. Estado de partida

| Hecho | Evidencia |
|-------|-----------|
| UX-4.4 COMPLETE | [`UX-4.4.md`](./UX-4.4.md) · Toolbar migrada |
| AppShell | Toolbar y Sidebar integradas |
| Workspace Region | ya contiene workspace + panels (vía bridge) |
| WorkspaceLayout | bridge transparente |
| WindowManager | page root (D56.4) |
| Floating windows | WorkspacePanels → FloatingWindowBridge |
| ThemeRuntimeHost / Runtime UX-3 | intactos |

---

## 3. Ownership (FROZEN)

| Concern | Owner |
|---------|--------|
| Canvas, paneles, ventanas, callbacks, providers, scroll, comportamiento | Workspace stack |
| Workspace Region position / bounds / grid placement | AppShell |
| Overlay containing block (`relative` on Workspace Region) | AppShell Workspace Region |
| Floating-window ownership / overlay management | Existing workspace stack |
| Transparent slot forwarding | WorkspaceLayout |
| WindowManager React context at page root | `page.tsx` Home (untouched) |

```text
Workspace Region owns the containing block for overlays.
Floating window ownership remains inside the existing workspace stack.

AppShell → position → containing block (relative)
Workspace → overlay management → floating windows

overflow-hidden → AppShell Workspace Region (bounds only)
overflow-auto  → Workspace (scroll owner)

Workspace owns functionality. AppShell owns position.
No structural relocation. No Workspace v2. No window-engine edits.
```

---

## 4. In Scope / Out of Scope

**In**

- Certificar Workspace Region como host exclusivo de composición
- Normalizar clases de región: `relative h-full min-h-0 min-w-0 overflow-hidden`
- Fill composition en WorkspaceContent: `h-full min-h-0`
- Comentarios de freeze en bridge / AppShell
- Doc + `validate:ux-4.5`

**Out**

- Relocalizar Workspace / WindowManager / FloatingWindowLayer / Bridge
- Provider moves / reorder
- Workspace v2
- Inspector · Status Bar · Responsive · Docking
- `useTheme()` · Chrome Runtime Migration · Runtime UX-3 edits
- Nuevas ventanas / herramientas / features
- Edits a `page.tsx`

---

## 5. Arquitectura

```text
Certified path (unchanged structure):

ThemeRuntimeHost
        │
WindowManager          ← page root context (intact)
        │
WorkspaceLayout        ← transparent bridge
        │
AppShell               ← sole chrome composition root
        │
Workspace Region       ← relative · overflow-hidden · containing block
        │
   ┌────┴────┐
   │         │
WorkspaceContent   WorkspacePanels
(canvas+panels     (Dock + FloatingWindowBridge + toasts)
 + providers
 + scroll)
```

No before/after move diagram — composition was already correct; UX-4.5 certifies it.

---

## 6. Rollback

1. Restaurar clases previas de Workspace Region (`overflow-auto` sin `h-full`).
2. Quitar `h-full min-h-0` de WorkspaceContent.
3. Eliminar únicamente doc / validator / script / líneas de roadmap de UX-4.5.
4. Conservar UX-4.1–4.4 y Runtime UX-3 intactos.

---

## 7. Archivos

| Archivo | Acción |
|---------|--------|
| `src/components/app-shell/AppShell.tsx` | MODIFY — Workspace Region bounds + containing block |
| `src/components/workspace/WorkspaceContent.tsx` | MODIFY — composition fill `h-full min-h-0` |
| `src/components/workspace/WorkspaceLayout.tsx` | MODIFY — UX-4.5 freeze comments only |
| `docs/UX/UX-4.5.md` | CREATE |
| `scripts/validate-ux-4.5.ts` | CREATE |
| `package.json` | `validate:ux-4.5` |
| `docs/UX/UX-4.0-roadmap.md` | UX-4.5 COMPLETE · Next UX-4.6 |

**Protegidos:** `page.tsx`, ThemeRuntimeHost, Runtime, providers, `src/lib/ui/**`,
WindowManager, FloatingWindowLayer, FloatingWindowBridge, Sidebar, AdaptiveToolbar.

---

## 8. Acceptance (CA-UX-4.5)

- [x] CA-UX-4.5.1 Workspace Region contiene el Workspace existente
- [x] CA-UX-4.5.2 No existe duplicación del Workspace
- [x] CA-UX-4.5.3 WindowManager permanece intacto
- [x] CA-UX-4.5.4 Floating windows permanecen intactas
- [x] CA-UX-4.5.5 Workspace continúa siendo dueño de la funcionalidad
- [x] CA-UX-4.5.6 AppShell continúa siendo el único composition root
- [x] CA-UX-4.5.7 WorkspaceLayout continúa siendo bridge transparente
- [x] CA-UX-4.5.8 Toolbar y Sidebar permanecen intactas
- [x] CA-UX-4.5.9 ThemeRuntimeHost y Runtime UX-3 intactos
- [x] CA-UX-4.5.10 Sin nuevas funcionalidades
- [x] CA-UX-4.5.11 `npx tsc --noEmit` PASS
- [x] CA-UX-4.5.12 `npm run validate:ux-4.5` PASS

---

## 9. Gate

```text
npm run validate:ux-4.5
```

Blocks: `workspaceRegion` · `workspaceIdentity` · `singleWorkspace` ·
`windowManagerIntact` · `floatingWindowsIntact` · `workspaceOwnership` ·
`workspaceBridge` · `toolbarSidebarIntact` · `runtimeFreeze` · `priorGate` ·
`tscCompile`

---

## 10. Definition of Done

- [x] Workspace Region certificada (bounds + containing block)
- [x] Sin relocalización estructural; sin duplicación
- [x] WindowManager / FloatingWindow* intactos
- [x] Workspace dueño de lógica + scroll; AppShell layout-only
- [x] Bridge transparente; Runtime / ThemeRuntimeHost intactos
- [x] Gates PASS · Roadmap Next = UX-4.6

---

## 11. Next

**Next:** UX-4.6 — Inspector Integration  
Integrar la región Inspector dentro del AppShell.
Reemplazar el placeholder por el inspector existente, manteniendo su funcionalidad.
Sin introducir nuevas características.

---

## Related

- [`UX-4.0-roadmap.md`](./UX-4.0-roadmap.md)
- [`UX-4.4.md`](./UX-4.4.md)
- [`UX-4.3.md`](./UX-4.3.md)
- [`UX-4.2.md`](./UX-4.2.md)
- [`ux/docs/LAYOUT.md`](../../ux/docs/LAYOUT.md)
- [`scripts/validate-ux-4.5.ts`](../../scripts/validate-ux-4.5.ts)
