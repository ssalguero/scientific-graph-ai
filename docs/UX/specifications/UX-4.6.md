# UX-4.6 — Inspector Integration

> **Architectural principles:**
> - AppShell remains the only composition root for application chrome.
> - Inspector Integration in UX-4.6 consists of composition migration only. Inspector functionality, bindings and analysis remain unchanged.
> - Reuse before rewrite.
> - Move-only identity preservation. The Inspector subtree retains its identity, props, visibility contract and children. Only its composition path changes.
> - Inspector owns width and visibility. AppShell owns region bounds and position.
> - WorkspaceLayout forwards the inspector slot transparently. It must not inspect, wrap, transform or conditionally render the inspector.
> - There must be exactly one Inspector instance.
> - The Inspector owns functionality. AppShell owns position.

**Épica:** UX-4 — Runtime Host Integration + Lovable App Shell  
**Microfase:** UX-4.6 — Inspector Integration  
**Fecha:** 2026-08-03  
**Prerrequisitos:** UX-4.5 Workspace Integration COMPLETE  
**SSOT de serie:** [`UX-4.0-roadmap.md`](./UX-4.0-roadmap.md)  
**Estado:** FROZEN · COMPLETE

**Declaración:**

```text
UX-4.6 = Inspector Integration
SCOPE = move Inspector → AppShell Inspector Region · composition only
AppShell = only composition root for application chrome
WorkspaceLayout = transitional bridge (transparent inspector forward)
Move-only identity preservation — Inspector JSX subtree identity preserved
Inspector owns width and visibility · AppShell owns region bounds and position
AppShell renders received slot — does NOT create Inspector
DockRoot / DockZone / DockPanel remain — DockPanel no longer hosts Inspector
Single Inspector instance — never dual mount
NO Inspector v2 · NO new panels · NO bindings · NO analysis migration
NO Status Bar · NO Responsive · NO Docking features
NO ThemeRuntimeHost · NO Runtime UX-3 · NO src/lib/ui edits
page.tsx = authorized move-only slot rewire only
API FREEZE UX-3 = VIGENTE
Next: UX-4.7 Status Bar Integration
```

---

## 1. Purpose / Objetivo

Migrar el `Inspector` existente desde el `DockPanel` en `page.tsx` hacia la
Inspector Region del AppShell, respetando [`LAYOUT.md`](../../ux/docs/LAYOUT.md),
**sin** modificar comportamiento, **sin** reescribir el Inspector y **sin**
nuevas funcionalidades.

```text
There is a single Inspector instance. Only its home region changes.
```

---

## 2. Estado de partida

| Hecho | Evidencia |
|-------|-----------|
| UX-4.5 COMPLETE | [`UX-4.5.md`](./UX-4.5.md) · Workspace ownership normalizado |
| AppShell Inspector Region | placeholder hasta UX-4.6 |
| Inspector | vivía en `page.tsx` → WorkspacePanels → DockRoot → DockZone → DockPanel |
| Frozen subtree | `visible={false}` · `width={INSPECTOR_TOKENS.defaultWidth}` · `<InspectorPanel />` |
| WorkspaceLayout | bridge (toolbar + sidebar + workspace) |
| ThemeRuntimeHost / Runtime UX-3 | intactos |

---

## 3. Ownership (FROZEN)

| Concern | Owner |
|---------|--------|
| Props / visibility / width / children / behavior | Inspector (page-composed subtree) |
| Position / Inspector Region bounds | AppShell |
| Transparent slot forwarding | WorkspaceLayout |
| Dock infrastructure (DockRoot / DockZone / DockPanel) | Docking (untouched; no longer hosts Inspector) |

```text
Move-only identity preservation.
The Inspector subtree retains its identity, props, visibility contract and children.
Only its composition path changes.

Inspector owns width and visibility.
AppShell owns region bounds and position.

WorkspaceLayout forwards the inspector slot transparently.
It must not inspect, wrap, transform or conditionally render the inspector.

AppShell owns position, not inspector creation.
```

**Frozen subtree:**

```tsx
<Inspector
  visible={false}
  width={INSPECTOR_TOKENS.defaultWidth}
>
  <InspectorPanel />
</Inspector>
```

**UX-4 size ownership symmetry:**

| Region | Size / content owner | AppShell owns |
|--------|----------------------|---------------|
| Sidebar | Sidebar | position / region bounds |
| Toolbar | Toolbar | position / region bounds |
| Workspace | Workspace | position / region bounds |
| Inspector | Inspector (width + visibility) | position / region bounds |

---

## 4. In Scope / Out of Scope

**In**

- Mover slot Inspector: DockPanel → WorkspaceLayout → AppShell Inspector Region
- Bridge transparente `inspector?: ReactNode` / `inspector={inspector}`
- AppShellRegion wrap del slot recibido (bounds only)
- Detach Inspector render from DockPanel; keep DockRoot / DockZone / DockPanel
- Move-only rewire autorizado en `page.tsx`
- Doc + `validate:ux-4.6`

**Out**

- Inspector v2 / Context / Provider / stores / hooks nuevos
- Nuevos paneles / propiedades / herramientas / acciones / features
- Binding profundo / Analysis Inspector migration (UX-5)
- Status Bar · Responsive · Docking features
- `useTheme()` · Chrome Runtime Migration · Runtime UX-3 edits

---

## 5. Arquitectura

```text
Antes:
page.tsx → WorkspacePanels → DockRoot → DockZone → DockPanel → Inspector
AppShell Inspector Region = placeholder

Después:
page.tsx
  │
  inspector (Inspector subtree — identity preserved)
  │
WorkspaceLayout  ← forward only: inspector={inspector}
  │
AppShell         ← position only: Inspector Region wraps the slot
  │
Inspector Region
  │
Inspector  ← unique instance

DockRoot / DockZone / DockPanel remain (no longer host Inspector)
```

---

## 6. Rollback

1. Restaurar montaje de Inspector en `DockPanel`.
2. Eliminar montaje desde AppShell Inspector Region / bridge `inspector`.
3. Revertir únicamente cambios de composición.
4. Conservar UX-4.1–UX-4.5 intactos.

---

## 7. Archivos

| Archivo | Acción |
|---------|--------|
| `src/components/app-shell/AppShell.tsx` | MODIFY — Inspector Region wraps received slot (bounds only) |
| `src/components/workspace/WorkspaceLayout.tsx` | MODIFY — transparent `inspector` forward |
| `src/components/workspace/types.ts` | MODIFY — `inspector?` on Layout |
| `src/app/page.tsx` | MODIFY — move-only Inspector slot rewire |
| `docs/UX/UX-4.6.md` | CREATE |
| `scripts/validate-ux-4.6.ts` | CREATE |
| `package.json` | `validate:ux-4.6` |
| `docs/UX/UX-4.0-roadmap.md` | UX-4.6 COMPLETE · Next UX-4.7 |

**Protegidos:** ThemeRuntimeHost, Runtime, providers, `src/lib/ui/**`,
WindowManager, WorkspaceContent, Sidebar, AdaptiveToolbar,
Inspector component body (`src/components/inspector/**`).

---

## 8. Acceptance (CA-UX-4.6)

- [x] CA-UX-4.6.1 Inspector Region contiene el Inspector existente
- [x] CA-UX-4.6.2 Existe una única instancia
- [x] CA-UX-4.6.3 El placeholder desaparece
- [x] CA-UX-4.6.4 Sin cambios funcionales (move-only identity preserved)
- [x] CA-UX-4.6.5 AppShell = único composition root
- [x] CA-UX-4.6.6 WorkspaceLayout = bridge transparente
- [x] CA-UX-4.6.7 Toolbar, Sidebar y Workspace permanecen intactos
- [x] CA-UX-4.6.8 ThemeRuntimeHost intacto
- [x] CA-UX-4.6.9 Runtime UX-3 intacto
- [x] CA-UX-4.6.10 Sin nuevas funcionalidades
- [x] CA-UX-4.6.11 `npx tsc --noEmit` PASS
- [x] CA-UX-4.6.12 `npm run validate:ux-4.6` PASS

---

## 9. Gate

```text
npm run validate:ux-4.6
```

Blocks: `inspectorRegion` · `singleInspector` · `inspectorIdentity` ·
`placeholderRemoved` · `workspaceBridge` · `appShellRoot` ·
`toolbarSidebarWorkspaceIntact` · `runtimeFreeze` · `priorGate` · `tscCompile`

---

## 10. Definition of Done

- [x] Inspector migrado al AppShell Inspector Region
- [x] Una sola instancia; identity preserved; sin rewrite
- [x] DockPanel ya no monta el Inspector; DockRoot intacto
- [x] Bridge transparente; AppShell slot-only (bounds + position)
- [x] Runtime / ThemeRuntimeHost / Toolbar / Sidebar / Workspace intactos
- [x] Gates PASS · Roadmap Next = UX-4.7

---

## 11. Next

**Next:** UX-4.7 — Status Bar Integration  
Sustituir el placeholder de la Status Bar por el componente definitivo.
Mantener la misma filosofía de composición y reutilización.
Sin introducir nuevas funcionalidades.

---

## Related

- [`UX-4.0-roadmap.md`](./UX-4.0-roadmap.md)
- [`UX-4.5.md`](./UX-4.5.md)
- [`UX-4.4.md`](./UX-4.4.md)
- [`UX-4.3.md`](./UX-4.3.md)
- [`UX-4.2.md`](./UX-4.2.md)
- [`ux/docs/LAYOUT.md`](../../ux/docs/LAYOUT.md)
- [`scripts/validate-ux-4.6.ts`](../../scripts/validate-ux-4.6.ts)
