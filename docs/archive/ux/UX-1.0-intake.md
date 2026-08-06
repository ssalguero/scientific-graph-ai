# UX-1.0 — Lovable Design System Integration · Intake

**Épica:** UX-1 — Lovable Design System Integration  
**Microfase:** UX-1.0 — INTAKE  
**Fase:** Intake (documental)  
**Fecha:** 2026-07-29  
**Estado:** **UX-1.0 = COMPLETE (documental)** · **READY FOR REVIEW** · **NO BUILD AUTHORIZED**  
**Owner:** Lead UX-1  
**Modo:** Documental — create-only este archivo · **cero cambios en `src/**` · `scripts/**` · tests · `package.json` · `components.json` · `DESIGN_SYSTEM.md`** · sin tokens nuevos · sin componentes · sin microfases de implementación abiertas  
**Prerrequisitos:** Architecture Freeze vigente (D38.2) · Design Tokens v2 CERTIFIED (D48) · `DESIGN_SYSTEM.md` presente en la raíz como especificación visual de referencia  

**Nota de naming:** En documentación histórica Product 3, **D47 Workspace Foundation** aparece etiquetado como “UX-1”. Ese label **no** es este epic. **UX-1 — Lovable Design System Integration** es un epic **independiente** del roadmap Product 3. **D71 permanece sin modificaciones.**

**Autoridad documental (SSOT — cita sin redefinir):**

| Documento | Rol |
|-----------|-----|
| [`DESIGN_SYSTEM.md`](../DESIGN_SYSTEM.md) | Especificación visual oficial de referencia (Design System v3 CONGELADO) |
| [`docs/D48.5-design-tokens-v2-certification.md`](D48.5-design-tokens-v2-certification.md) | D48 Design Tokens v2 CERTIFIED — SSOT de tokens de producto |
| [`src/lib/ui/tokens.ts`](../src/lib/ui/tokens.ts) | Único SSOT runtime: `UI_TOKENS` + `--app-*` |
| [`docs/D38.2-architecture-freeze.md`](D38.2-architecture-freeze.md) | Architecture Freeze PROD-3 |
| [`docs/D48.1-design-tokens-v2-discovery.md`](D48.1-design-tokens-v2-discovery.md) | Baseline / patrón documental de tokens |
| [`PROJECT_STATUS_PROD_3.md`](../PROJECT_STATUS_PROD_3.md) | STATUS Product 3 (referencia; D71 no tocado por UX-1) |

**Authority Limits:** UX-1.0 **documenta** el intake visual y el mapeo conceptual hacia D48.  
No autoriza implementación. No crea tokens. No crea componentes. No abre UX-1.1 BUILD. No modifica D71 ni el roadmap Product 3.

**Declaración de solo documentación:**

- Sin cambios en `src/**` · `scripts/**` · tests · `package.json` · `components.json` · `DESIGN_SYSTEM.md`
- Sin creación de tokens nuevos ni refactor de `tokens.ts` / `theme.ts`
- Sin importar `workstation/` ni `src/styles.css`
- Create-only: este documento
- Detenerse tras crear el archivo y esperar revisión humana

**Declaración:**

```text
UX-1 = OPEN (epic independiente de Product 3)
UX-1.0 = COMPLETE (intake documental)
D48 = SOLE TOKEN SSOT (tokens.ts + --app-*)
DESIGN_SYSTEM.md = VISUAL REFERENCE ONLY
Architecture Freeze = VIGENTE
D71 = UNTOUCHED
NO SRC / SCRIPTS / PACKAGE.JSON / COMPONENTS.JSON CHANGES
NO BUILD AUTHORIZED
READY FOR HUMAN REVIEW → next conceptual step UX-1.1 Visual Prototype
```

---

## 1. Meta / Authority

### 1.1 Alcance

UX-1.0 es el **Intake** del epic UX-1. Su único entregable es este documento.

Objetivos del intake:

- Registrar la autoridad documental y de tokens
- Inventariar componentes del Design System de referencia y del chrome Product 3
- Mapear roles equivalentes y gaps
- Definir **Visual Token Alignment** conceptual sobre D48 (sin crear tokens ni cambiar APIs)
- Catalogar incompatibilidades y riesgos
- Fijar estrategia incremental y orden conceptual futuro
- Nombrar el próximo paso: **UX-1.1 — Visual Prototype** (sin abrirlo)

Fuera de alcance de UX-1.0:

- Cualquier cambio de código
- Creación o edición de componentes
- Apertura de microfases de implementación
- Modificación de D71 o del roadmap Product 3

### 1.2 Architecture Freeze

El **Architecture Freeze** permanece vigente ([`docs/D38.2-architecture-freeze.md`](D38.2-architecture-freeze.md)).

UX-1 **no** reemplaza, reestructura ni reabre:

- Providers
- Registries
- Session
- Restore Points
- Persistence
- Autosave
- Layout Engine
- Docking
- Snap Engine
- APIs públicas certificadas

La integración visual se plantea **sobre** la arquitectura certificada, no en sustitución de ella.

### 1.3 Autoridad de tokens

El **único SSOT** de tokens de producto continúa siendo **D48**:

| Superficie | Contrato |
|------------|----------|
| [`src/lib/ui/tokens.ts`](../src/lib/ui/tokens.ts) | `UI_TOKENS` — fragmentos Tailwind + composiciones semánticas |
| `--app-*` | Variables CSS inyectadas por `layout.appShellLight` / `layout.appShellDark` |
| Facades de dominio | `WORKSPACE_TOKENS`, `TOOLBAR_TOKENS`, `INSPECTOR_TOKENS`, `DOCK_TOKENS` — espejos / consumidores de D48, no SSOT paralelo |

No se crean tokens nuevos en UX-1.0. No se modifican APIs públicas de tokens.

### 1.4 Relación entre `DESIGN_SYSTEM.md` y D48

| Artefacto | Rol en UX-1 |
|-----------|-------------|
| [`DESIGN_SYSTEM.md`](../DESIGN_SYSTEM.md) | Especificación **visual** oficial de referencia (identidad Lovable v3 CONGELADA) |
| D48 (`tokens.ts` + `--app-*`) | Único SSOT **runtime / implementación** de tokens del producto certificado |

Reglas de autoridad:

1. `DESIGN_SYSTEM.md` orienta el aspecto deseado (colores, densidad, tipografía, elevación, motion).
2. D48 es el único lugar donde viven los valores que el producto aplica.
3. La adopción futura se denomina **Visual Token Alignment**: alinear la apariencia expresada por D48 hacia la referencia visual, **sin** introducir un segundo SSOT.
4. Las rutas canónicas citadas en `DESIGN_SYSTEM.md` (`src/styles.css`, `src/components/workstation/*`, primitivas shadcn) **no** se adoptan como SSOT ni como base de importación en este epic.

---

## 2. Inventario de componentes

### 2.1 Componentes definidos en `DESIGN_SYSTEM.md`

#### Producto (`src/components/workstation/` en la especificación de referencia)

| Componente | Rol |
|------------|-----|
| `TopBar` | Marca, menús, buscador ⌘K, notificaciones, tema |
| `ThemeSwitch` | Segmentado Light/Dark + toggle HC |
| `LeftRail` | Raíl de actividad, Object Explorer, Layers |
| `PlotCanvas` | Gráfico SVG (ejes, retícula, series, ajuste) |
| `Inspector` | Propiedades de figura; internos: `Section`, `Field`, `NumInput`, `Segmented` |
| `FloatingPanel` | Ventana flotante arrastrable, colapsable y cerrable |
| `CommandPalette` | Buscador de comandos ⌘K |
| `StatusBar` | Telemetría de motor / cursor / métricas / guardado / versión |

#### Primitivas shadcn/ui (inventario de referencia)

accordion · alert · alert-dialog · aspect-ratio · avatar · badge · breadcrumb · button · calendar · card · carousel · chart · checkbox · collapsible · command · context-menu · dialog · drawer · dropdown-menu · form · hover-card · input · input-otp · label · menubar · navigation-menu · pagination · popover · progress · radio-group · resizable · scroll-area · select · separator · sheet · skeleton · slider · sonner · switch · table · tabs · textarea · toggle · toggle-group · tooltip

### 2.2 Componentes existentes en Product 3 (chrome relevante)

| Área | Paths canónicos | Notas |
|------|-----------------|-------|
| Shell / workspace | `src/components/workspace/*` | `WorkspaceLayout`, `WorkspaceContent`, `WorkspacePanels`, `WorkspaceTokens` |
| Toolbar | `src/components/toolbar/*` | `AdaptiveToolbar`, `ToolbarSection`, `ToolbarGroup`, `ToolbarAction`, `ToolbarOverflow`, `ToolbarTokens` |
| Sidebar | `src/components/ui/sidebar/*` | `Sidebar`, `SidebarSection`, `SidebarGroup`, `SidebarItem`, `SidebarFooter` |
| Panel chrome | `src/components/ui/layout/*` | `Panel`, `PanelHeader`, `PanelBody`, `PanelFooter`, … |
| Buttons | `src/components/ui/buttons/*` | Consumen `UI_TOKENS.button` |
| Inspector | `src/components/inspector/*` | Dock-style chrome; `InspectorTokens` → D48 |
| Floating windows | `src/components/windows/FloatingWindow.tsx` (+ Layer / Bridge / Manager) | Chrome funcional; geometría vía `style` inline |
| Tabs (window chrome) | `src/components/windows/tab-ui/*` | Tab strip UI |
| Tokens / theme | `src/lib/ui/tokens.ts`, `theme.ts`, `icons.ts` | D48 SSOT + facades |
| Docking / Layout / Snap | `src/components/docking/*`, `layout-engine/*`, `windows/WindowSnapEngine.ts` | Engines congelados — **fuera de ownership visual de UX-1** |

### 2.3 Observaciones sobre diferencias

- **Densidad:** la referencia Lovable fija TopBar 48px, rail 44px, StatusBar 24px, title bar flotante 28px, inspector 288px. Product 3 usa shell flex, sidebar 240/280 (colapsado 64), toolbar `h-9`, inspector width tokenizado ~320.
- **Floating chrome:** `FloatingPanel` (referencia) es un producto visual completo; `FloatingWindow` (Product 3) es chrome funcional mínimo (title + close + geometría), con poco styling tokenizado hoy.
- **Tema:** la referencia define Light / Dark / HC (`.hc`, `.dark.hc`). Product 3 expone `themeMode: "light" | "dark"` vía `--app-*` en el shell.
- **Iconos:** referencia = Lucide 12/14/16; Product 3 = `UI_ICONS` / `getIcon` (emoji/ASCII registry).
- **Stack:** la especificación de referencia asume `styles.css` + workstation + shadcn; Product 3 usa class strings D48 + Tailwind v4 sin esa pila como runtime.

---

## 3. Mapping de componentes

### 3.1 Design System → Product 3

| Design System (referencia) | Product 3 (equivalente / ancla) | Rol equivalente | Notas |
|----------------------------|----------------------------------|-----------------|-------|
| `TopBar` | `AdaptiveToolbar` + composición de header en shell / page | Barra superior de acciones | No es 1:1 (sin menús/⌘K/notificaciones como en la referencia) |
| `ThemeSwitch` | `themeMode` + `getAppShell` / `layout.appShell*` | Conmutación light/dark | Sin componente dedicado HC |
| `LeftRail` | `src/components/ui/sidebar/*` + `UI_TOKENS.sidebar` | Navegación / rail lateral | Anchos y densidad distintos del rail 44px |
| `Inspector` | `src/components/inspector/*` + `UI_TOKENS.inspector` | Panel de propiedades / dock derecho | Internos Lovable (`NumInput`, `Segmented`) no mapean 1:1 |
| `FloatingPanel` | `FloatingWindow` (+ Layer / Bridge) | Chrome de ventana flotante | Gap visual amplio; candidato UX-1.1 |
| `PlotCanvas` | Superficie de gráfico Product 3 (fuera de chrome UX-1.1) | Canvas de plot | Fuera del primer BUILD visual |
| `CommandPalette` | — | Overlay de comandos | **Sin equivalente** de producto chrome |
| `StatusBar` | — | Barra de estado inferior | **Sin equivalente** chrome 1:1 |
| Primitivas shadcn/ui | Componentes UI certificados D45+ / D48 | Controles / overlays | **No se adoptan** en UX-1 (ver §5) |

### 3.2 Componentes sin equivalente (o fuera del primer tramo)

| Referencia | Estado en Product 3 |
|------------|---------------------|
| `CommandPalette` | Sin equivalente chrome |
| `StatusBar` | Sin equivalente chrome 1:1 |
| `ThemeSwitch` (HC) | Sin HC ortogonal; solo light/dark |
| Subcomponentes Inspector Lovable (`NumInput`, `Segmented`, …) | Parcial / distinto; no objetivo de UX-1.1 |
| Primitivas shadcn listadas en §2.1 | Inventario de referencia únicamente |

---

## 4. Mapping de tokens — Visual Token Alignment

Término oficial: **Visual Token Alignment**.  
No usar “Token Value Alignment”.

### 4.1 Principios

- Correspondencia **conceptual** con D48
- **Sin** crear nuevos tokens
- **Sin** modificar APIs públicas
- Alineación visual futura = ajustar valores / composiciones **dentro** de D48 cuando una microfase posterior lo autorice
- `DESIGN_SYSTEM.md` guía el target visual; D48 permanece el SSOT

### 4.2 Correspondencia conceptual

| Concepto Lovable (`DESIGN_SYSTEM.md`) | Ancla D48 / `--app-*` | Tipo de alineación |
|---------------------------------------|------------------------|--------------------|
| `workspace` (fondo de área de trabajo) | `layout.appShellLight/Dark` (bg de shell) | Visual Token Alignment |
| `panel` | `--app-surface` · composiciones `panel` / `sidebar` / `toolbar` / `inspector` | Visual Token Alignment |
| `surface` | `--app-surface` / `--app-surface-muted` | Visual Token Alignment |
| `hover` | hover via `--app-surface-muted` en composiciones | Visual Token Alignment |
| `foreground` / `muted-foreground` / `dim` | `--app-text` · `--app-text-muted` · `--app-heading` | Visual Token Alignment |
| `accent-primary` (cian pastel en referencia) | `--app-accent` (hoy azul en shell) | Visual Token Alignment (valor futuro) |
| `ok` / `warn` / `destructive` | `--app-success` · `--app-warning` · `--app-danger` (+ variantes bg/text/border) | Visual Token Alignment |
| `border` / `border-strong` | `--app-border` | Visual Token Alignment |
| Radius (`--radius-*`) | `UI_TOKENS.radius` | Visual Token Alignment |
| Spacing / retícula | `UI_TOKENS.spacing` (+ números en `dock` / chrome) | Visual Token Alignment (sin reescribir layout engine) |
| Shadows / elevación | `UI_TOKENS.shadow` · `elevation` | Visual Token Alignment |
| Motion (100 ms, color/opacidad) | `UI_TOKENS.transition` · `animation` | Visual Token Alignment |
| Tipografía (escala / roles) | `UI_TOKENS.typography` | Visual Token Alignment |
| Composiciones Sidebar / Toolbar / Inspector | `UI_TOKENS.sidebar` · `toolbar` · `inspector` | Visual Token Alignment sobre chrome existente |

### 4.3 Fuera de Visual Token Alignment en UX-1

- Nuevas CSS variables paralelas a `--app-*`
- Nuevo archivo tipo `styles.css` como SSOT
- Tokens de geometría de Layout Engine / Dock / Snap (contratos numéricos congelados)
- Adopción de `@theme inline` / utilidades `@utility` de la referencia como runtime

---

## 5. Incompatibilidades

### 5.1 Layout

| Referencia Lovable | Product 3 |
|--------------------|-----------|
| Grid de chrome fijo (TopBar / Rail / Workspace / Inspector / StatusBar) | `WorkspaceLayout` + Docking + Layout Engine + Floating windows |
| Alturas/anchos canónicos de instrumento | Anchos tokenizados sidebar/inspector; toolbar adaptable |

**Decisión:** no rediseñar layout. UX-1 no toca Layout Engine, Docking ni Snap.

### 5.2 Stack UI

| Referencia Lovable | Product 3 |
|--------------------|-----------|
| `src/styles.css` + `workstation/*` + shadcn/Radix | D48 class strings + Tailwind v4 + componentes certificados |

**shadcn/Radix:** fuera del alcance de UX-1 y no se adopta en esta integración porque rompería la arquitectura certificada.

Esta exclusión es de **alcance de UX-1**, no una prohibición permanente a futuro fuera de este epic.

### 5.3 Motion

| Referencia | D48 actual |
|-------------|------------|
| 100 ms; solo `color` / `background-color` / `border-color` / `opacity` | `duration-200` / `duration-300`; incluye `transition-all`, `transition-transform`, `active:scale-[0.98]` |

Visual Token Alignment futuro puede acercar motion del chrome; no en UX-1.0.

### 5.4 Tipografía

| Referencia | Product 3 |
|-------------|-----------|
| IBM Plex Sans + JetBrains Mono; escala 9–13px densa; `.num` tabular | Fragmentos `UI_TOKENS.typography` (Tailwind semántico); sin familias Plex/Mono como contrato D48 |

### 5.5 High Contrast (HC)

| Referencia | Product 3 |
|-------------|-----------|
| Cuatro variantes: light, dark, `.hc`, `.dark.hc` | `themeMode` light/dark vía `--app-*` únicamente |

HC ortogonal **no** forma parte del primer tramo UX-1.1.

### 5.6 Doble SSOT evitado

Para evitar un segundo SSOT:

- No importar `src/components/workstation/`
- No importar `src/styles.css`
- No promover `components.json` / shadcn a runtime del producto certificado
- Mantener `DESIGN_SYSTEM.md` como **referencia visual** y D48 como **único SSOT** de tokens

---

## 6. Riesgos

### 6.1 Técnicos

- Drift visual si se alinean valores de forma parcial entre composiciones (`sidebar` / `toolbar` / `panel`) sin una pasada coherente
- `FloatingWindow` parte de un baseline visual mínimo; el salto a chrome tipo `FloatingPanel` puede ser grande en una sola pasada
- Mismatch de iconografía (Lucide vs `UI_ICONS`) si se intenta “completar” look sin decisión de icon registry
- Motion/tipografía/HC de la referencia no caben en un único cambio de `--app-*`

### 6.2 Arquitectónicos

- Presión para adoptar shadcn/Radix o un segundo CSS SSOT (`styles.css`) y romper el Freeze
- Acoplar cambios visuales a Layout Engine / Docking / Snap / Providers por conveniencia
- Confundir este epic UX-1 con el label histórico D47 “UX-1” o con D71

### 6.3 Regresión

- Edits en `tokens.ts` que rompan validators (`validate-design-tokens-v2`, UI / workspace / toolbar architecture)
- Cambios de chrome que alteren comportamiento (handlers, docking, drag/snap, session/restore)
- Regresiones visuales en light/dark por modificar `--app-*` sin cobertura de ambas variantes

---

## 7. Estrategia incremental

Adopción = **apariencia Lovable sobre arquitectura D48**, no reemplazo de arquitectura.

```text
DESIGN_SYSTEM.md  ──(referencia visual)──►  Visual Token Alignment
                                              │
                                              ▼
                                    D48 UI_TOKENS + --app-*
                                              │
                                              ▼
                         Chrome Product 3 existente (Toolbar / Sidebar / FloatingWindow)
```

Reglas:

1. Evolucionar la mirada visual **dentro** de D48 y de los componentes chrome ya certificados.
2. **No** proponer reemplazar la arquitectura Product 3.
3. **No** importar `workstation/`.
4. **No** importar `src/styles.css`.
5. **No** modificar Providers, Registries, Session, Restore Points, Persistence, Autosave, Layout Engine, Docking, Snap Engine ni APIs públicas.
6. Primer BUILD autorizado solo tras revisión humana de este intake y apertura explícita de UX-1.1.

---

## 8. Orden recomendado

Secuencia **conceptual** futura. No abre microfases de implementación.

1. **UX-1.0 — Intake** (este documento) — documental
2. **Visual Token Alignment** — alinear valores/composiciones D48 hacia la referencia visual (cuando se autorice; sin nuevos tokens ni APIs)
3. **UX-1.1 — Visual Prototype** — primer BUILD exclusivamente visual: Toolbar → Sidebar → Floating Window Chrome
4. **Tramos posteriores (conceptuales)** — Inspector / paneles y otras superficies chrome, siempre sobre D48 y sin tocar engines congelados

No se asignan números Dxx de Product 3. No se autoriza BUILD en este documento más allá de **nombrar** UX-1.1.

---

## 9. Próximo paso

### UX-1.1 — Visual Prototype

**Objetivo:** primer BUILD **exclusivamente visual** sobre:

- Toolbar
- Sidebar
- Floating Window Chrome

**Restricciones de UX-1.1 (preview; no autorizado aún):**

- Sin modificar comportamiento
- Sin tocar Providers, Registries, Session, Restore Points, Persistence, Autosave, Layout Engine, Docking, Snap Engine ni APIs públicas
- Visual Token Alignment sobre D48 únicamente
- Sin importar `workstation/` ni `src/styles.css`
- Sin adoptar shadcn/Radix en este tramo

**Gate:** requiere revisión humana de **UX-1.0** antes de cualquier BUILD.

```text
UX-1.0 = COMPLETE (awaiting human review)
UX-1.1 = NOT OPEN
NO BUILD
STOP
```
