# UX-2.0 — Screen Migration Foundation · Roadmap

**Épica:** UX-2 — Screen Migration Foundation  
**Microfase:** UX-2.0 — ROADMAP (documental)  
**Fase:** Roadmap oficial  
**Fecha:** 2026-07-29  
**Estado:** **UX-2.0 = COMPLETE (documental)** · **UX-2.1 = CERTIFIED** · **UX-2.2 = COMPLETE (awaiting human review)** · **UX-2.3 = COMPLETE (Workspace & Canvas — awaiting human review)** · **UX-2.4 = COMPLETE (Panels Foundation — awaiting human review)** · **UX-2.5 = COMPLETE (Panel Infrastructure — awaiting human review)** · **UX-2.6 = COMPLETE (Panel Content — awaiting human review)** · **UX-2.7 = COMPLETE (Panel State Foundation — awaiting human review)** · **UX-2.8 = COMPLETE (Panel Persistence Foundation — awaiting human review)** · **UX-2.9 = COMPLETE (Panel Resize System — awaiting human review)** · **UX-2.10 = COMPLETE (Planning Mode Foundation — awaiting human review)** · **UX-2.11 = COMPLETE (Collapse / Expand UI — awaiting human review)** · **UX-2.12 = COMPLETE (Empty States & Contextual Actions — awaiting human review)** · **UX-2.13 = COMPLETE (Workspace Orientation — awaiting human review)** · **UX-2.14 = COMPLETE (Panel Status & Workspace Feedback — awaiting human review)** · **UX-2.15 = COMPLETE (Progressive Disclosure — awaiting human review)** · **UX-2.16 = COMPLETE (Panel Identity & Surfaces — awaiting human review)** · **UX-2.17 = COMPLETE (Workspace Composition Foundation — awaiting human review)** · **UX-2.18 = COMPLETE (Semantic Layout Foundation — awaiting human review)** · **UX-2.18b = COMPLETE (Panel Semantics Foundation — awaiting human review)** · **UX-2.19 = COMPLETE (Toolbar & Action Foundation — awaiting human review)** · **UX-2.20 = COMPLETE (Iconography & Microinteractions — awaiting human review)** · **UX-2.21 = COMPLETE (Final Visual Polish — awaiting human review)** · **UX-2.22 = COMPLETE (Content Grammar Foundation — awaiting human review)** · **UX-2.23 = COMPLETE (Workspace Surface Polish Foundation — awaiting human review)** · **UX-2.24 = COMPLETE (Workspace Navigation Foundation — awaiting human review)** · **UX-2.25 = COMPLETE (Workspace Density & Spacing System — awaiting human review)** · **UX-2.26 = COMPLETE (Workspace Layout Primitives Foundation — awaiting human review)**  
**Prerrequisitos:** UX-1.0–1.3 COMPLETE · Architecture Freeze vigente (D38.2) · D48 SSOT · `DESIGN_SYSTEM.md` referencia visual  

**Declaración:**

```text
UX-2 = OPEN (Screen Migration Foundation)
UX-2.0 = COMPLETE (roadmap oficial)
UX-2.1 = CERTIFIED (AppShell foundation)
UX-2.2 = COMPLETE (Toolbar foundation — awaiting human review)
UX-2.3 = COMPLETE (Workspace & Canvas — awaiting human review)
UX-2.4 = COMPLETE (Workspace Panels Foundation — awaiting human review)
UX-2.5 = COMPLETE (Panel Infrastructure — awaiting human review)
UX-2.6 = COMPLETE (Panel Content — awaiting human review)
UX-2.7 = COMPLETE (Panel State Foundation — awaiting human review)
UX-2.8 = COMPLETE (Panel Persistence Foundation — awaiting human review)
UX-2.9 = COMPLETE (Panel Resize System — awaiting human review)
UX-2.10 = COMPLETE (Planning Mode Foundation — awaiting human review)
UX-2.11 = COMPLETE (Collapse / Expand UI — awaiting human review)
UX-2.12 = COMPLETE (Empty States & Contextual Actions — awaiting human review)
UX-2.13 = COMPLETE (Workspace Orientation & Progressive Disclosure — awaiting human review)
UX-2.14 = COMPLETE (Panel Status & Workspace Feedback — awaiting human review)
UX-2.15 = COMPLETE (Progressive Disclosure Foundation — awaiting human review)
UX-2.16 = COMPLETE (Panel Identity & Surface Foundation — awaiting human review)
UX-2.17 = COMPLETE (Workspace Composition Foundation — awaiting human review)
UX-2.18 = COMPLETE (Semantic Layout Foundation — awaiting human review)
UX-2.18b = COMPLETE (Panel Semantics Foundation — awaiting human review)
UX-2.19 = COMPLETE (Toolbar & Action Foundation — awaiting human review)
UX-2.20 = COMPLETE (Iconography & Microinteractions — awaiting human review)
UX-2.21 = COMPLETE (Final Visual Polish — awaiting human review)
UX-2.22 = COMPLETE (Content Grammar Foundation — awaiting human review)
UX-2.23 = COMPLETE (Workspace Surface Polish Foundation — awaiting human review)
UX-2.24 = COMPLETE (Workspace Navigation Foundation — awaiting human review)
UX-2.25 = COMPLETE (Workspace Density & Spacing System — awaiting human review)
UX-2.26 = COMPLETE (Workspace Layout Primitives Foundation — awaiting human review)
RESEQUENCE = UX-2.4 Panels → … → UX-2.13 Workspace Orientation → UX-2.14 Panel Status → UX-2.15 Progressive Disclosure → UX-2.16 Panel Identity & Surfaces → UX-2.17 Workspace Composition Foundation → UX-2.18 Semantic Layout Foundation → UX-2.18b Panel Semantics Foundation → UX-2.19 Toolbar & Action Foundation → UX-2.20 Iconography & Microinteractions → UX-2.21 Final Visual Polish → UX-2.22 Content Grammar Foundation → UX-2.23 Surface Polish Foundation → UX-2.24 Workspace Navigation Foundation → UX-2.25 Workspace Density & Spacing System → UX-2.26 Workspace Layout Primitives Foundation
D48 = SOLE TOKEN SSOT (tokens.ts + --app-*)
DESIGN_SYSTEM.md = VISUAL REFERENCE ONLY
Architecture Freeze = VIGENTE
AppShell = CONCEPTUAL (WorkspaceLayout + getAppShell)
Toolbar = AdaptiveToolbar (D49 frozen)
NO layout/AppShell.tsx · NO workstation/ · NO styles.css · NO shadcn/Radix
UI_TOKENS API = FROZEN (valores only)
VISUAL-ONLY = ENFORCED
STOP — human review of UX-2.26 before UX-3.0 docking
```
---

## 1. Objetivo

Migrar progresivamente la apariencia de las pantallas hacia la identidad visual de [`DESIGN_SYSTEM.md`](../DESIGN_SYSTEM.md) **sobre** la arquitectura PROD-3 certificada, sin alterar comportamiento, providers, engines ni contratos.

Al finalizar UX-2:

- misma lógica, estados, contexts y hooks;
- nueva UI / layout visual / diseño responsive y accesible;
- D48 permanece el único SSOT de diseño runtime.

---

## 2. Alcance

### 2.1 IN

- Visual Token Alignment sobre D48 (`UI_TOKENS` + `--app-*`)
- Restyle presentacional del chrome PROD-3 existente
- Documentación de microfases, Regression Gate y STOP rules
- Alineación light/dark, responsive, a11y, motion y performance **sin** reabrir engines

### 2.2 OUT

- Crear `AppShell.tsx` / `src/components/layout/**`
- `ThemeProvider`, `WindowFrame`, `GraphSettings`, `StatusBar` (StatusBar = gap documentado)
- Importar `workstation/*`, `styles.css`, shadcn, Radix
- Modificar Session, Persistence, Autosave, Restore, WindowManager, Graph Engine, Docking, Snap, registries, APIs públicas
- Segunda arquitectura o segundo SSOT de tokens
- Abrir UX-2.2+ antes de certificar la microfase previa

---

## 3. Hard Rules

### 3.1 Visual-only rule

Se permiten **exclusivamente** cambios en:

- tokens (valores)
- clases
- estilos
- composición visual
- props de presentación

Quedan **prohibidos** cambios en:

- flujo de datos
- estado
- efectos
- providers
- hooks
- registries
- WindowManager
- Session
- Persistence
- Autosave
- Restore
- Graph Engine
- Docking
- Snap
- APIs públicas
- contratos certificados

### 3.2 UI_TOKENS API Freeze

Durante **toda** UX-2 pueden modificarse únicamente los **valores** de los tokens existentes.

- No agregar claves
- No renombrar claves
- No eliminar claves

Sin un **Amendment** aprobado, cualquier cambio de forma de `UI_TOKENS` es **FAIL**.

### 3.3 Architecture Freeze

No modificar: `session/`, WindowManager/lifecycle, registries, graph engine, persistence, autosave, restore, Layout Engine, Docking, Snap Engine, APIs públicas certificadas.

### 3.4 Stack

No importar `workstation/`, `src/styles.css`, shadcn ni Radix.  
D48 es el único SSOT. `DESIGN_SYSTEM.md` es solo referencia visual.

---

## 4. Mapeo definitivo UX → PROD-3

Referencia permanente. No crear componentes del brief que no existan en PROD-3.

| Concepto UX | Implementación PROD-3 |
|-------------|------------------------|
| AppShell | `WorkspaceLayout` + `getAppShell(themeMode)` |
| Toolbar | `AdaptiveToolbar` |
| WindowFrame | `FloatingWindow` |
| ThemeProvider | `themeMode` state (en `GraphEditor`) |
| Inspector | `inspector/*` + Analysis inline (montaje futuro en Right panel) |
| Sidebar | Proyecto / Visualización / Ajustes |
| Workspace | `WorkspaceContent` + `WorkspaceBodyLayout` |
| StatusBar | No implementado (gap documentado) |

```text
Graph Engine
    │
WindowManager
    │
SessionProvider
    │
WorkspaceLayout + getAppShell   ← AppShell conceptual
    ├── Sidebar
    ├── WorkspaceContent
    │     ├── AdaptiveToolbar
    │     ├── Header
    │     └── WorkspaceBodyLayout (Left | Canvas | Right + Bottom)
    └── WorkspacePanels (Dock + FloatingWindowBridge)
```

---

## 5. Roadmap UX-2.1 → UX-2.19

| ID | Objetivo | Alcance | OUT explícito |
|----|----------|---------|---------------|
| **UX-2.1** | Shell foundation (AppShell conceptual) | Valores `layout.appShellLight\|Dark`; verificar composición `WorkspaceLayout` | StatusBar, `layout/AppShell.tsx`, providers |
| **UX-2.2** | Toolbar | Restyle `AdaptiveToolbar`; mismos handlers | Rewire de handlers |
| **UX-2.3** | **Workspace & Canvas** (resequenced) | Header + canvas surface; DOM-stable wrap de `{workspace}` | Sidebar (deferred); StatusBar; GraphEditor logic |
| **UX-2.3b** | Sidebar *(deferred from original UX-2.3)* | Migración visual Proyecto / Visualización / Ajustes | Paneles Series/Windows/Session nuevos; SessionProvider |
| **UX-2.4** | **Workspace Panels Foundation** (resequenced) | `WorkspaceBodyLayout` + Left/Right/Bottom placeholders | Inspector logic; resize; persistence |
| **UX-2.5** | **Panel Infrastructure** (resequenced) | Shared `Panel` / `PanelHeader` / `PanelBody`; Left/Right/Bottom wrappers; collapsed + data-* freezes | Explorer/Inspector/Console content; resize; persistence |
| **UX-2.6** | **Panel Content** | Mount Explorer / Inspector / Console content shells into Body slots (Freeze A/B/C) | Domain logic; GraphSettings extract; docking; resize |
| **UX-2.7** | **Panel State Foundation** | PanelProvider / Context / usePanelState; CSS-var sizing; collapsed + width/height state | ResizeHandle; persistence; collapse UI buttons |
| **UX-2.8** | **Panel Persistence Foundation** | `persistence/` + localStorage; serialize/deserialize; Provider hydrate/save | IndexedDB; docking positions; floating windows; reshape PanelState |
| **UX-2.9** | **Resize Handles** | `panels/resize/` + Pointer Capture splitters; session → Panel setters → UX-2.8 | Layout Engine rewrite; docking; new persistence |
| **UX-2.10** | **Planning Mode Foundation** | `workspace/modes/` + PlanningMode.apply() → initial PanelState; ModeProvider above PanelProvider | Other modes; mode persistence; collapse chrome; runtime switch UI |
| **UX-2.11** | **Collapse / Expand UI** *(deferred from original UX-2.10)* | Chrome buttons / affordances for panel collapse | Advanced layout presets; mode switching |
| **UX-2.12** | **Contextual Actions & Empty States** (resequenced; was Forms) | `empty/` + `actions/` + `hints/`; PanelHeader `actions?`; content EmptyState; canvas HintGroup | Domain branching; PanelState; new tokens; real handlers |
| **UX-2.13** | **Workspace Orientation & Progressive Disclosure** (resequenced) | `focus/` ActivePanelProvider; `isActive?` chrome; `data-panel-id/active`; pointerdown activation | Persist activePanelId; PanelState; docking; shortcuts/domain |
| **UX-2.14** | **Panel Status & Workspace Feedback** (resequenced) | `workspace/status/`; PanelHeader `status?`/`badge?`/`chips?`; static mocks | Domain branching; mount PanelBusyOverlay; PanelState |
| **UX-2.15** | **Progressive Disclosure Foundation** (resequenced) | `workspace/disclosure/`; PanelHeader `overflow?`; chrome/content hierarchy (1A) | Real menus; invented domain content; PanelState |
| **UX-2.16** | **Panel Identity & Surface Foundation** (resequenced) | `workspace/surfaces/`; SurfaceTokens SSOT; Explorer/Inspector/Console/Canvas identity chrome | PanelState; tone on PanelSurface; domain metadata; PanelHeader API |
| **UX-2.17** | **Workspace Composition Foundation** (resequenced) | `workspace/composition/`; Section/Stack/Group/Divider/Spacer; layout-only wiring | State; resize; docking; density redesign; public barrel export |
| **UX-2.18** | **Semantic Layout Foundation** (resequenced) | `workspace/layout/`; PanelLayout + regions; LayoutTokens SSOT; shell wiring | Variants; scroll; state; Toolbar actions; public barrel export |
| **UX-2.18b** | **Panel Semantics Foundation** (bridge) | `workspace/semantics/`; Semantic* identity grammar; SEMANTIC_TOKENS compose-only | Behavior; new strings; expand Semantic* props; renumber 2.19–2.21 |
| **UX-2.19** | **Toolbar & Action Foundation** (resequenced; was 2.18) | `workspace/toolbar/`; ACTION_TOKENS compose-only; ActionButton/Group/PanelToolbar shells | Interaction; menus; handlers; docking; touch actions/ |
| **UX-2.20** | **Iconography & Microinteractions** (resequenced; was 2.19) | Consistent iconography and microinteractions | New icon libraries that reopen architecture |
| **UX-2.21** | **Final Visual Polish** (Workspace Polish; was 2.20) | Density, spacing, theme consistency + CA-UX-2 certification | Segundo tema SSOT; features nuevas |
| **UX-2.22** | **Content Grammar Foundation** | `workspace/content/` presentational blocks; CONTENT_TOKENS; pixel-identical wiring | Forms; inputs; KeyValue demo data; behavior |
| **UX-2.23** | **Workspace Surface Polish Foundation** | `workspace/surface/`; SURFACE_TOKENS compose-only; Surface chrome around PanelLayout | Replacing PanelSurface; SurfaceDivider in panels; behavior |
| **UX-2.24** | **Workspace Navigation Foundation** | `workspace/navigation/`; NAVIGATION_TOKENS; breadcrumbs + PageTitle; SemanticHeader title passthrough | Router; pathname; URL; navigation logic; public barrel |
| **UX-2.25** | **Workspace Density & Spacing System** | `workspace/density/`; WORKSPACE_DENSITY_TOKENS; DensityProvider marker; DensitySpacer; unidirectional parity | Context; runtime density; typography/colors; public barrel |
| **UX-2.26** | **Workspace Layout Primitives Foundation** | Extend `workspace/layout/`; Stack/Inline/Cluster/Center/Spacer; LAYOUT_TOKENS expansion; flex wiring | Grid; responsive; overflow helpers; replacing PanelLayout; public barrel |

> **Nota:** Ventanas / content surfaces / dialogs se resecuencian después de la infraestructura de paneles; ver microfases posteriores según certificación.

---

## 6. STOP rule

```text
Tras cada microfase:
  doc COMPLETE
  + validators PASS
  + Regression Gate PASS
  + human review
→ NO abrir la siguiente microfase hasta certificación.
```

**UX-2.4** introduce la infraestructura física de paneles IDE. **UX-2.5 (Panel Infrastructure)** consolida el shell reutilizable (`Panel` / Header / Body). **UX-2.6 (Panel Content)** monta Explorer / Inspector / Console en los Body slots. **UX-2.7 (Panel State)** añade Provider / Context / CSS-var sizing. **UX-2.8 (Panel Persistence)** añade `persistence/` + localStorage (schema v1) sin reshape de `PanelState`. **UX-2.9 (Panel Resize)** añade `panels/resize/` con Pointer Capture y sesión `startSize`-based. **UX-2.10 (Planning Mode)** añade `workspace/modes/` con Planning como productor puro de `PanelState` inicial. **UX-2.11 (Collapse / Expand UI)** añade chrome de colapso / expansión sobre la API existente. **UX-2.12 (Empty States & Contextual Actions)** añade `empty/` / `actions/` / `hints/` presentacionales. **UX-2.13 (Workspace Orientation)** añade `focus/` con `activePanelId` UI-only y chrome `isActive`. **UX-2.14 (Panel Status & Workspace Feedback)** añade `workspace/status/` presentacional y slots `status?`/`badge?`/`chips?` en PanelHeader. **UX-2.15 (Progressive Disclosure)** añade `workspace/disclosure/` y `overflow?` para jerarquía visual sin inventar contenido. **UX-2.16 (Panel Identity & Surfaces)** añade `workspace/surfaces/` con `SURFACE_TOKENS` SSOT e identidad visual por panel. **UX-2.17 (Workspace Composition)** añade `workspace/composition/` con primitives estructurales layout-only. **UX-2.18 (Semantic Layout)** añade `workspace/layout/` con regiones semánticas (`PanelLayout` + Header/Toolbar/Content/Footer). Ver [`docs/UX-2.18-semantic-layout.md`](UX-2.18-semantic-layout.md). **UX-2.18b (Panel Semantics)** añade `workspace/semantics/` con gramática de identidad presentacional (`SemanticHeader` / `SemanticStatus` / `SemanticSectionLabel` / `SemanticInfoBlock` / `SemanticFooter`). Ver [`docs/UX-2.18b-panel-semantics.md`](UX-2.18b-panel-semantics.md). **UX-2.19 (Toolbar & Action Foundation)** añade `workspace/toolbar/` con gramática visual presentacional (`ActionButton` / `ActionGroup` / `PanelToolbar` / `ToolbarSpacer` / `IconSlot`). Ver [`docs/UX-2.19-toolbar-actions.md`](UX-2.19-toolbar-actions.md). UX-2.20–2.21 IDs permanecen sin cambios.

---

## 7. Regression Gate

Obligatorio al cierre de **cada** microfase UX-2.1–2.22.

No porque UX-2 deba modificar estas superficies, sino porque un cambio visual puede afectarlas accidentalmente:

| Check | Resultado requerido |
|-------|---------------------|
| Session Restore | PASS |
| Autosave | PASS |
| Window Tabs | PASS |
| Floating Windows | PASS |
| Docking | PASS |
| Snap | PASS |
| Export | PASS |
| Theme switch | PASS |

---

## 8. Criterios de aceptación globales (CA-UX-2)

| ID | Criterio |
|----|----------|
| **CA-UX-2.1** | La UI utiliza el AppShell **conceptual** (`WorkspaceLayout` + `getAppShell`) sin alterar la arquitectura existente. |
| **CA-UX-2.2** | Todas las acciones de toolbar invocan la misma lógica que antes (`AdaptiveToolbar` + handlers existentes). |
| **CA-UX-2.3** | Sidebar, Inspector y Workspace conservan el comportamiento funcional previo. |
| **CA-UX-2.4** | Las ventanas mantienen drag, resize, snap y tabs sin regresiones (`FloatingWindow` + engines). |
| **CA-UX-2.5** | No se modifican Session, Persistence, Autosave ni Restore. |
| **CA-UX-2.6** | El sistema es responsive y compatible con modo claro/oscuro (HC solo si Amendment / microfase lo autoriza). |
| **CA-UX-2.7** | No se detectan regresiones funcionales respecto a PROD-3 (validators + Regression Gate). |

---

## 9. Autoridad documental

| Documento | Rol |
|-----------|-----|
| Este archivo | Roadmap oficial UX-2 |
| [`docs/UX-2.1-appshell-foundation.md`](UX-2.1-appshell-foundation.md) | Microfase BUILD UX-2.1 (CERTIFIED) |
| [`docs/UX-2.2-toolbar-foundation.md`](UX-2.2-toolbar-foundation.md) | Microfase BUILD UX-2.2 |
| [`docs/UX-2.3-workspace-canvas.md`](UX-2.3-workspace-canvas.md) | Microfase BUILD UX-2.3 (Workspace & Canvas) |
| [`docs/UX-2.4-workspace-panels.md`](UX-2.4-workspace-panels.md) | Microfase BUILD UX-2.4 (Panels Foundation) |
| [`docs/UX-2.5-panel-infrastructure.md`](UX-2.5-panel-infrastructure.md) | Microfase BUILD UX-2.5 (Panel Infrastructure) |
| [`docs/UX-2.6-panel-content.md`](UX-2.6-panel-content.md) | Microfase BUILD UX-2.6 (Panel Content) |
| [`docs/UX-2.7-panel-state.md`](UX-2.7-panel-state.md) | Microfase BUILD UX-2.7 (Panel State Foundation) |
| [`docs/UX-2.8-panel-persistence.md`](UX-2.8-panel-persistence.md) | Microfase BUILD UX-2.8 (Panel Persistence Foundation) |
| [`docs/UX-2.9-panel-resize.md`](UX-2.9-panel-resize.md) | Microfase BUILD UX-2.9 (Panel Resize System) |
| [`docs/UX-2.10-planning-mode.md`](UX-2.10-planning-mode.md) | Microfase BUILD UX-2.10 (Planning Mode Foundation) |
| [`docs/UX-2.11-collapse-expand.md`](UX-2.11-collapse-expand.md) | Microfase BUILD UX-2.11 (Collapse / Expand UI) |
| [`docs/UX-2.12-empty-states.md`](UX-2.12-empty-states.md) | Microfase BUILD UX-2.12 (Empty States & Contextual Actions) |
| [`docs/UX-2.13-workspace-orientation.md`](UX-2.13-workspace-orientation.md) | Microfase BUILD UX-2.13 (Workspace Orientation & Progressive Disclosure) |
| [`docs/UX-2.14-panel-status.md`](UX-2.14-panel-status.md) | Microfase BUILD UX-2.14 (Panel Status & Workspace Feedback) |
| [`docs/UX-2.15-progressive-disclosure.md`](UX-2.15-progressive-disclosure.md) | Microfase BUILD UX-2.15 (Progressive Disclosure Foundation) |
| [`docs/UX-2.16-panel-identity-surfaces.md`](UX-2.16-panel-identity-surfaces.md) | Microfase BUILD UX-2.16 (Panel Identity & Surface Foundation) |
| [`docs/UX-2.17-workspace-composition.md`](UX-2.17-workspace-composition.md) | Microfase BUILD UX-2.17 (Workspace Composition Foundation) |
| [`docs/UX-2.18-semantic-layout.md`](UX-2.18-semantic-layout.md) | Microfase BUILD UX-2.18 (Semantic Layout Foundation) |
| [`docs/UX-2.18b-panel-semantics.md`](UX-2.18b-panel-semantics.md) | Microfase BUILD UX-2.18b (Panel Semantics Foundation) |
| [`docs/UX-2.19-toolbar-actions.md`](UX-2.19-toolbar-actions.md) | Microfase BUILD UX-2.19 (Toolbar & Action Foundation) |
| [`docs/UX-2.20-iconography-microinteractions.md`](UX-2.20-iconography-microinteractions.md) | Microfase BUILD UX-2.20 (Iconography & Microinteractions) |
| [`docs/UX-2.21-final-visual-polish.md`](UX-2.21-final-visual-polish.md) | Microfase BUILD UX-2.21 (Final Visual Polish) |
| [`docs/UX-2.22-content-grammar.md`](UX-2.22-content-grammar.md) | Microfase BUILD UX-2.22 (Content Grammar Foundation) |
| [`docs/UX-2.23-surface-polish.md`](UX-2.23-surface-polish.md) | Microfase BUILD UX-2.23 (Workspace Surface Polish Foundation) |
| [`docs/UX-2.24-workspace-navigation.md`](UX-2.24-workspace-navigation.md) | Microfase BUILD UX-2.24 (Workspace Navigation Foundation) |
| [`docs/UX-2.25-workspace-density.md`](UX-2.25-workspace-density.md) | Microfase BUILD UX-2.25 (Workspace Density & Spacing System) |
| [`docs/UX-2.26-workspace-layout-primitives.md`](UX-2.26-workspace-layout-primitives.md) | Microfase BUILD UX-2.26 (Workspace Layout Primitives Foundation) |
| [`DESIGN_SYSTEM.md`](../DESIGN_SYSTEM.md) | Referencia visual |
| [`src/lib/ui/tokens.ts`](../src/lib/ui/tokens.ts) | SSOT runtime D48 |
| [`docs/D38.2-architecture-freeze.md`](D38.2-architecture-freeze.md) | Architecture Freeze |
| [`docs/UX-1.0-intake.md`](UX-1.0-intake.md) | Intake Visual Token Alignment |

---

## 10. STOP

```text
UX-2.0 = COMPLETE (roadmap oficial)
UX-2.1 = CERTIFIED
UX-2.2 = COMPLETE (awaiting human review)
UX-2.3 = COMPLETE (Workspace & Canvas — awaiting human review)
UX-2.4 = COMPLETE (Panels Foundation — awaiting human review)
UX-2.5 = COMPLETE (Panel Infrastructure — awaiting human review)
UX-2.6 = COMPLETE (Panel Content — awaiting human review)
UX-2.7 = COMPLETE (Panel State Foundation — awaiting human review)
UX-2.8 = COMPLETE (Panel Persistence Foundation — awaiting human review)
UX-2.9 = COMPLETE (Panel Resize System — awaiting human review)
UX-2.10 = COMPLETE (Planning Mode Foundation — awaiting human review)
UX-2.11 = COMPLETE (Collapse / Expand UI — awaiting human review)
UX-2.12 = COMPLETE (Empty States & Contextual Actions — awaiting human review)
UX-2.13 = COMPLETE (Workspace Orientation & Progressive Disclosure — awaiting human review)
UX-2.14 = COMPLETE (Panel Status & Workspace Feedback — awaiting human review)
UX-2.15 = COMPLETE (Progressive Disclosure Foundation — awaiting human review)
UX-2.16 = COMPLETE (Panel Identity & Surface Foundation — awaiting human review)
UX-2.17 = COMPLETE (Workspace Composition Foundation — awaiting human review)
UX-2.18 = COMPLETE (Semantic Layout Foundation — awaiting human review)
UX-2.18b = COMPLETE (Panel Semantics Foundation — awaiting human review)
UX-2.19 = COMPLETE (Toolbar & Action Foundation — awaiting human review)
UX-2.20 = COMPLETE (Iconography & Microinteractions — awaiting human review)
UX-2.21 = COMPLETE (Final Visual Polish — awaiting human review)
UX-2.22 = COMPLETE (Content Grammar Foundation — awaiting human review)
UX-2.23 = COMPLETE (Workspace Surface Polish Foundation — awaiting human review)
UX-2.24 = COMPLETE (Workspace Navigation Foundation — awaiting human review)
UX-2.25 = COMPLETE (Workspace Density & Spacing System — awaiting human review)
UX-2.26 = COMPLETE (Workspace Layout Primitives Foundation — awaiting human review)
NEXT = UX-3.0 Docking Foundation (after UX-2.26 certification)
STOP — human review of UX-2.26 before Docking
```