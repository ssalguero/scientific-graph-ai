# UX-1.1 — Visual Prototype

**Épica:** UX-1 — Lovable Design System Integration  
**Microfase:** UX-1.1 — BUILD (Visual Prototype)  
**Fase:** Build presentacional  
**Fecha:** 2026-07-29  
**Estado:** **UX-1.1 = COMPLETE (awaiting human review)** · **NO UX-1.2**  
**Prerrequisitos:** UX-1.0 Intake aprobado · Architecture Freeze vigente · D48 SSOT · `DESIGN_SYSTEM.md` referencia visual  

**Declaración:**

```text
UX-1.1 = COMPLETE (visual prototype)
SCOPE = Toolbar + Sidebar + Floating Window Chrome
BEHAVIOR = UNCHANGED
ARCHITECTURE = UNCHANGED
D48 = SOLE TOKEN SSOT
NO workstation/ · NO styles.css · NO shadcn/Radix
READY FOR HUMAN REVIEW
STOP — do not open UX-1.2
```

---

## 1. Objetivo

Primer prototipo visual del Design System sobre la arquitectura certificada.

Exclusivamente presentacional: densidad, espaciados, jerarquía, bordes, radios, sombras, hover/active y composición chrome — inspirado en [`DESIGN_SYSTEM.md`](../DESIGN_SYSTEM.md), aplicado mediante **Visual Token Alignment** sobre D48.

---

## 2. Archivos modificados

| Archivo | Cambio |
|---------|--------|
| [`src/lib/ui/tokens.ts`](../src/lib/ui/tokens.ts) | Valores de composiciones `UI_TOKENS.toolbar` y `UI_TOKENS.sidebar` (+ `typography.sidebarSectionLabel`); mismas claves públicas |
| [`src/components/ui/sidebar/Sidebar.tsx`](../src/components/ui/sidebar/Sidebar.tsx) | Ajustes visuales densos en header, module cards y filas de biblioteca |
| [`src/components/windows/FloatingWindow.tsx`](../src/components/windows/FloatingWindow.tsx) | Chrome presentacional (shell / title bar 28px / body) compuesto desde primitivas D48 |
| [`docs/UX-1.1-visual-prototype.md`](UX-1.1-visual-prototype.md) | Este documento |

**No modificados (explícito):** Providers, Registries, Session, Restore, Persistence, Autosave, Layout Engine, Docking, Snap Engine, Window lifecycle/handlers, APIs públicas, `ToolbarTokens.ts` bridge keys, `AdaptiveToolbar` props/wiring, `DESIGN_SYSTEM.md`, `workstation/`, `styles.css`.

---

## 3. Decisiones visuales

### 3.1 Visual Token Alignment (D48)

- Sin nuevo sistema de tokens y sin nuevas claves públicas en `UI_TOKENS`.
- Solo se alteraron **valores** de composiciones existentes (`toolbar`, `sidebar`, label tipográfico de sección).
- Floating Window chrome reutiliza primitivas existentes (`radius`, `border`, `shadow`, `spacing`, `transition`, `--app-*`) en una composición local presentacional — no segundo SSOT.

### 3.2 Toolbar

- `root` pasa a chrome de panel: `bg-[var(--app-surface)]` + borde inferior (hairline estructural).
- Secciones más densas (`space-y-3` → `space-y-2`).
- Grupos con `gap-1.5`; acciones activas con sombra ligera; altura de acción alineada a control denso (`h-7`).
- Radio de chrome `md` (más instrumento, menos “card web”).

### 3.3 Sidebar

- Shell/overlay: transición de color (sin `transition-all` / scale en chrome).
- Header y body con padding más compacto; divisores más cortos.
- Nav items: `rounded-md`, `py-1`, tipografía `text-xs`; active/hover conservados vía `--app-*`.
- Section headers / group labels: escala tipo rail-label (10px, uppercase, tracking amplio).
- Badges menos “pill” (`rounded-md`, 9px).
- Module cards y filas de biblioteca densificadas; hover de inactivo más legible.

### 3.4 Floating Window Chrome

- Shell: superficie `--app-surface`, borde, `rounded-md`, `shadow-md`.
- Title bar **28px** (`h-7`), fondo muted, tipografía 11px/semibold, `cursor-grab` / `grabbing` (visual; handlers D57 intactos).
- Body scrollable con padding denso.
- Geometría sigue en `style` inline (API Freeze); close button sin nuevo comportamiento.

### 3.5 Tipografía / iconografía

- Tipografía: solo escalas ya disponibles en el proyecto (fragmentos Tailwind / tokens); **no** se cargaron IBM Plex / JetBrains Mono.
- Iconografía: registry existente (`getIcon` / `UI_ICONS`); sin Lucide.

---

## 4. Limitaciones

- El acento global `--app-accent` permanece el azul D48 (no migrado a cian Lovable) para no alterar toda la app fuera del chrome objetivo.
- Motion global de botones/composiciones compartidas (`button.*`, etc.) no se forzó a 100ms; el chrome tocado prioriza `transition-colors`.
- High Contrast (`.hc`) no implementado.
- `AdaptiveToolbar` sigue siendo un stack vertical de slots (no TopBar 48px horizontal de la referencia).
- Anchos de sidebar / docking numéricos sin cambio (Layout/Dock freeze).

---

## 5. Elementos deliberadamente no implementados

- `StatusBar`, `CommandPalette`, `ThemeSwitch` HC, `PlotCanvas` visual DS
- Importación de `workstation/`, `src/styles.css`, shadcn o Radix
- Fuentes Plex/Mono de la referencia
- Reemplazo de componentes existentes
- Cambios de comportamiento (close window wiring, drag/resize/snap, session, etc.)
- Inspector / paneles genéricos (fuera de alcance UX-1.1)
- UX-1.2 y microfases posteriores

---

## 6. Verificación

Ejecutado en esta microfase:

| Check | Resultado |
|-------|-----------|
| `npx tsc --noEmit` | PASS |
| `validate:design-tokens-v2` | PASS |
| `validate:toolbar-architecture` | PASS |
| `validate:toolbar-move-only` | PASS |
| `validate:ui-sidebar-architecture` | PASS |
| `validate:sidebar-v2` | PASS |
| `validate:ui-architecture` | PASS |
| `validate:workspace-architecture` | PASS |
| `validate:d55-window-api` | PASS |
| `validate:d56-floating-api` | PASS |
| `validate:d56-governance` | PASS |
| `validate:d57-governance` | PASS |
| `validate:d57-bridge` | PASS |
| `validate:d58-governance` | PASS |
| `validate:d58-boundaries` | PASS |

---

## 7. Acceptance Criteria

| Criterio | Estado |
|----------|--------|
| Sin cambios de comportamiento | Cumple (handlers / props / lifecycle intactos) |
| Sin cambios de arquitectura | Cumple |
| Sin regresiones funcionales de validadores tocados | Cumple |
| Proyecto compila (`tsc --noEmit`) | Cumple |
| Aspecto hacia `DESIGN_SYSTEM.md` respetando D48 SSOT | Cumple (prototipo parcial; ver limitaciones) |

---

## 8. Próximo paso

**Detenerse.** Esperar revisión humana.

No abrir **UX-1.2**.
