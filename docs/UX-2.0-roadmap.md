# UX-2.0 — Screen Migration Foundation · Roadmap

**Épica:** UX-2 — Screen Migration Foundation  
**Microfase:** UX-2.0 — ROADMAP (documental)  
**Fase:** Roadmap oficial  
**Fecha:** 2026-07-29  
**Estado:** **UX-2.0 = COMPLETE (documental)** · **UX-2.1 = CERTIFIED** · **UX-2.2 = COMPLETE (awaiting human review)** · **UX-2.3 = COMPLETE (Workspace & Canvas — awaiting human review)**  
**Prerrequisitos:** UX-1.0–1.3 COMPLETE · Architecture Freeze vigente (D38.2) · D48 SSOT · `DESIGN_SYSTEM.md` referencia visual  

**Declaración:**

```text
UX-2 = OPEN (Screen Migration Foundation)
UX-2.0 = COMPLETE (roadmap oficial)
UX-2.1 = CERTIFIED (AppShell foundation)
UX-2.2 = COMPLETE (Toolbar foundation — awaiting human review)
UX-2.3 = COMPLETE (Workspace & Canvas — awaiting human review)
RESEQUENCE = UX-2.3 is Workspace & Canvas (not Sidebar); Sidebar deferred
D48 = SOLE TOKEN SSOT (tokens.ts + --app-*)
DESIGN_SYSTEM.md = VISUAL REFERENCE ONLY
Architecture Freeze = VIGENTE
AppShell = CONCEPTUAL (WorkspaceLayout + getAppShell)
Toolbar = AdaptiveToolbar (D49 frozen)
NO layout/AppShell.tsx · NO workstation/ · NO styles.css · NO shadcn/Radix
UI_TOKENS API = FROZEN (valores only)
VISUAL-ONLY = ENFORCED
STOP — human review of UX-2.3 before next visual consolidation phase
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
| Inspector | `inspector/*` + Analysis inline |
| Sidebar | Proyecto / Visualización / Ajustes |
| Workspace | `WorkspaceContent` |
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
    ├── WorkspaceContent (AdaptiveToolbar + sections)
    └── WorkspacePanels (Inspector dock + FloatingWindowBridge)
```

---

## 5. Roadmap UX-2.1 → UX-2.14

| ID | Objetivo | Alcance | OUT explícito |
|----|----------|---------|---------------|
| **UX-2.1** | Shell foundation (AppShell conceptual) | Valores `layout.appShellLight\|Dark`; verificar composición `WorkspaceLayout` | StatusBar, `layout/AppShell.tsx`, providers |
| **UX-2.2** | Toolbar | Restyle `AdaptiveToolbar`; mismos handlers | Rewire de handlers |
| **UX-2.3** | **Workspace & Canvas** (resequenced) | Header + canvas surface en `WorkspaceContent`; DOM-stable wrap de `{workspace}` | Sidebar (deferred); StatusBar; nuevos archivos Workspace*; GraphEditor logic |
| **UX-2.3b** | Sidebar *(deferred from original UX-2.3)* | Migración visual Proyecto / Visualización / Ajustes | Paneles Series/Windows/Session nuevos; SessionProvider |
| **UX-2.4** | Inspector | Chrome `inspector/*` + Analysis presentacional | Extraer GraphSettings domain; docking behavior |
| **UX-2.5** | Workspace chrome | Presentación `FloatingWindow` / tab chrome | Drag / resize / snap / tabs logic |
| **UX-2.6** | Ventanas / content surfaces | Header, padding, borders de hosts; `ContentDefinition` intacto | ContentRegistry / kinds |
| **UX-2.7** | Dialogs / overlays | SettingsPanel, wizards, modales — shells visuales | Nueva capa modal / providers |
| **UX-2.8** | Forms | Primitivas presentacionales sobre tokens | Cambiar schemas / bindings |
| **UX-2.9** | Responsive | Desktop / tablet / notebook / 1080p / 4K | Rediseñar Layout Engine |
| **UX-2.10** | Accessibility | Contraste, focus, teclado, ARIA, reduced-motion | Reescribir engines |
| **UX-2.11** | Dark mode + tokens | Auditoría hardcoded → `--app-*`; HC solo si cabe sin API nueva | Segundo tema SSOT |
| **UX-2.12** | Animation | 100 ms color/opacity; open/close presentacional | Animaciones que afecten layout/measure |
| **UX-2.13** | Performance | Paint / CLS; sin memo especulativo masivo | Optimizaciones masivas no justificadas |
| **UX-2.14** | QA | Checklist CA-UX-2 + validators suite | Features nuevas |

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

Tras certificar UX-2.1, UX-2.2 (Toolbar) es la microfase de BUILD previa. **UX-2.3** se resecuenció intencionalmente a **Workspace & Canvas** (migración UI hacia diseño Lovable primero); la Sidebar queda como **UX-2.3b** diferida. Ver [`docs/UX-2.3-workspace-canvas.md`](UX-2.3-workspace-canvas.md).

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
SIDEBAR = deferred as UX-2.3b
STOP — human review of UX-2.3 before next visual consolidation
```
