# UX-2.0 — Screen Migration Foundation · Roadmap

**Épica:** UX-2 — Screen Migration Foundation  
**Microfase:** UX-2.0 — ROADMAP (documental)  
**Fase:** Roadmap oficial  
**Fecha:** 2026-07-29  
**Estado:** **UX-2.0 = COMPLETE (documental)** · **UX-2.1 = CERTIFIED** · **UX-2.2 = COMPLETE (awaiting human review)** · **UX-2.3 = COMPLETE (Workspace & Canvas — awaiting human review)** · **UX-2.4 = COMPLETE (Panels Foundation — awaiting human review)** · **UX-2.5 = COMPLETE (Panel Infrastructure — awaiting human review)** · **UX-2.6 = COMPLETE (Panel Content — awaiting human review)** · **UX-2.7 = COMPLETE (Panel State Foundation — awaiting human review)**  
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
RESEQUENCE = UX-2.4 Panels → UX-2.5 Panel Infrastructure → UX-2.6 Panel Content → UX-2.7 Panel State → UX-2.8 Resize Handles → UX-2.9 Collapse/Expand UI → UX-2.10 Layout Persistence
D48 = SOLE TOKEN SSOT (tokens.ts + --app-*)
DESIGN_SYSTEM.md = VISUAL REFERENCE ONLY
Architecture Freeze = VIGENTE
AppShell = CONCEPTUAL (WorkspaceLayout + getAppShell)
Toolbar = AdaptiveToolbar (D49 frozen)
NO layout/AppShell.tsx · NO workstation/ · NO styles.css · NO shadcn/Radix
UI_TOKENS API = FROZEN (valores only)
VISUAL-ONLY = ENFORCED
STOP — human review of UX-2.7 before Resize Handles (UX-2.8)
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

## 5. Roadmap UX-2.1 → UX-2.14

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
| **UX-2.8** | **Resize Handles** | Splitters / resize presentacional sobre paneles | Persistence; Layout Engine rewrite |
| **UX-2.9** | **Collapse / Expand UI** | Chrome buttons / affordances for panel collapse | Persistence |
| **UX-2.10** | **Layout Persistence** | Persistencia de tamaños/visibilidad de paneles | Session schema bump no autorizado |
| **UX-2.11** | Forms | Primitivas presentacionales sobre tokens | Cambiar schemas / bindings |
| **UX-2.12** | Responsive | Desktop / tablet / notebook / 1080p / 4K | Rediseñar Layout Engine |
| **UX-2.13** | Accessibility | Contraste, focus, teclado, ARIA, reduced-motion | Reescribir engines |
| **UX-2.14** | Dark mode + tokens | Auditoría hardcoded → `--app-*`; HC solo si cabe sin API nueva | Segundo tema SSOT |
| **UX-2.15** | Animation | 100 ms color/opacity; open/close presentacional | Animaciones que afecten layout/measure |
| **UX-2.16** | Performance | Paint / CLS; sin memo especulativo masivo | Optimizaciones masivas no justificadas |
| **UX-2.17** | QA | Checklist CA-UX-2 + validators suite | Features nuevas |

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

**UX-2.4** introduce la infraestructura física de paneles IDE. **UX-2.5 (Panel Infrastructure)** consolida el shell reutilizable (`Panel` / Header / Body). **UX-2.6 (Panel Content)** monta Explorer / Inspector / Console en los Body slots. **UX-2.7 (Panel State)** añade Provider / Context / CSS-var sizing — sin ResizeHandle ni persistencia. Ver [`docs/UX-2.7-panel-state.md`](UX-2.7-panel-state.md).

---

## 7. Regression Gate

Obligatorio al cierre de **cada** microfase UX-2.1–2.14.

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
NEXT = UX-2.8 Resize Handles (after UX-2.7 certification)
STOP — human review of UX-2.7 before Resize Handles
```
