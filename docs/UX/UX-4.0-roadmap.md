# UX-4.0 — Runtime Host Integration + Lovable App Shell · Roadmap

```text
Status: FROZEN
Series: UX-4
Version: 1.0
Supersedes: UX-3.21 Next
Next Series: UX-5 Feature Integration
```

**Épica:** UX-4 — Runtime Host Integration + Lovable App Shell  
**Microfase:** UX-4.0 — ROADMAP (documental)  
**Fecha:** 2026-08-02  
**Prerrequisitos:** UX-3 CLOSED · Runtime Certified ([`UX-3.21.md`](./UX-3.21.md)) · [`LAYOUT.md`](../../ux/docs/LAYOUT.md)

---

## SSOT precedence

> This document is the Single Source of Truth (SSOT) for the UX-4 series.
> If any implementation, validation script, or planning document conflicts with
> this roadmap, this document takes precedence until superseded by a later
> frozen roadmap.

---

## Change Policy

| Tipo de cambio | Política |
|----------------|----------|
| Menor (redacción, referencias, enlaces) | Permitido sin nuevo freeze |
| Arquitectura, fases, objetivos o gates | Requiere **nuevo freeze** (p. ej. UX-4.0 → UX-4.0.1 Roadmap Revision) o un **ADR** asociado |

El roadmap no puede cambiar silenciosamente durante la implementación.

---

## Declaración

```text
UX-4 = OPEN (Runtime Host Integration + Lovable App Shell)
UX-4.0 = FROZEN (roadmap oficial · SSOT · Version 1.0)
UX-4.1 = COMPLETE (Theme Runtime Host Integration)
UX-4.2 = COMPLETE (App Shell Foundation)
UX-4.3 = COMPLETE (Sidebar Alignment)
UX-4.4 = COMPLETE (Toolbar Migration)
UX-4.5 = COMPLETE (Workspace Integration)
UX-4.6 = COMPLETE (Inspector Integration)
UX-4.7 = COMPLETE (Status Bar Integration)
UX-4.8 = NEXT (Responsive + Docking Integration)
SCOPE = visual infrastructure only
NO new end-user features
AppShell = sole composition root for application chrome (from UX-4.2)
WorkspaceLayout = transitional bridge (NOT a composition root)
AppShell is layout-only. It owns no application state.
ThemeProvider = host-scoped (UX-3 contract intact · mounted via ThemeRuntimeHost)
Runtime API Freeze = VIGENTE (UX-3.21)
Next Series = UX-5 Feature Integration
```

---

## 1. Objetivo

Montar el Theme Runtime certificado (host-scoped) en la aplicación e introducir
el Lovable App Shell de [`ux/docs/LAYOUT.md`](../../ux/docs/LAYOUT.md) como único
composition root del chrome, migrando ese chrome a `@/ui` sin introducir
features de producto.

```text
UX-4 does not introduce new end-user features.
UX-4 = visual infrastructure only.
```

---

## 2. Estado de partida

| Capa | Estado |
|------|--------|
| Runtime UX-3 | Certificado, API frozen ([`UX-3.21.md`](./UX-3.21.md)) |
| `ThemeProvider` | Existe en `src/ui/providers/theme-provider.tsx`; **no montado**; host-only `data-theme` + CSS vars |
| Product UI | `--app-*` / `UI_TOKENS` (`src/lib/ui/tokens.ts`) |
| Shell | Conceptual vía `WorkspaceLayout`; sin `AppShell.tsx`, sin Status Bar |
| Spec Lovable | [`LAYOUT.md`](../../ux/docs/LAYOUT.md) — Toolbar / Sidebar / Workspace / Inspector / Status Bar |

**Freeze técnico:** no romper contratos públicos `@/ui` / Runtime; no exportar
Pipeline / Diagnostics / Reporter; dual-stack `--app-*` + `--color-*` permitido
hasta cierre de chrome en UX-4.10.

---

## 3. Decisiones arquitectónicas

1. **Theme Runtime Host Integration primero** (UX-4.1), luego layout Lovable encima — evita doble migración sobre `UI_TOKENS`.
2. **App Shell = only composition root for application chrome** (congelado en UX-4.2).
3. **Chrome Runtime Migration** (UX-4.9) cubre solo shell chrome; canvas → UX-5 / UX-6.
4. Contrato host UX-3 intacto: host-scoped; `data-theme` + CSS vars; sin Diagnostics; sin `<html>`; sin persistence.

```text
UX-3 Runtime Engine (Certified)
        │
        ▼
UX-4.1 Theme Runtime Host Integration
        │
        ▼
UX-4.2 App Shell Foundation
   (sole composition root for application chrome)
        │
        ▼
UX-4.3–4.8 Sidebar → Toolbar → Workspace → Inspector → Status Bar → Responsive/Docking
        │
        ▼
UX-4.9 Chrome Runtime Migration
        │
        ▼
UX-4.10 Integration Certification
```

### Roadmap de series

```text
UX-1  Foundation
        ↓
UX-2  Theme Foundation
        ↓
UX-3  Runtime Engine (Certified)
        ↓
UX-4  Runtime Host Integration
      + Lovable App Shell
        ↓
UX-5  Feature Integration
        ↓
UX-6  Migration Completion
      + Accessibility
      + Performance
      + Polish
        ↓
      v1.0
```

---

## 4. In Scope

| Permitido |
|-----------|
| Montar ThemeProvider host-scoped; autorizar `@/ui` |
| Crear AppShell; reorganizar layout según LAYOUT.md |
| Mover / alinear Sidebar, Toolbar, Workspace, Inspector, StatusBar bajo AppShell |
| Responsive + docking chrome (reutilizando Dock / WindowManager) |
| Migrar chrome a `useTheme()` / ThemeContext / CSS vars / `@/ui` |
| Validators / gates / docs de certificación |
| Dual-stack temporal `--app-*` + `--color-*` hasta cierre de chrome en 4.10 |

---

## 5. Out of Scope / Non-goals

| Non-goal | Destino |
|----------|---------|
| No nuevas funcionalidades para el usuario | UX-5 |
| No migración completa del canvas | UX-5 / UX-6 |
| No persistencia de tema | post–UX-4.1 / UX-6 |
| No FOUC mitigation en `<html>` | post–UX-4.1 / UX-6 |
| No DevTools / Runtime overlays | UX-5+ consumers |
| No cambios en Runtime API Freeze | congelado UX-3.21 |
| No wiring de `RuntimeDiagnostics` en ThemeProvider | CA-UX-3.21.8 |
| No reescritura de componentes maduros | reutilizar |
| No nuevos gráficos, ventanas funcionales, IA, paneles o herramientas | UX-5 |

Cualquier propuesta fuera de esta lista se rechaza o se reubica a UX-5 / UX-6.

---

## 6. Microfases UX-4.1–UX-4.10

### UX-4.1 — Theme Runtime Host Integration

Integración controlada del runtime con el host de aplicación.

Contrato host (heredado de UX-3, sin ampliar):

- Provider **host-scoped**
- Aplica `data-theme` + CSS variables en el host
- **No** integra `RuntimeDiagnostics`
- **No** toca `<html>` / `documentElement`
- **No** persiste tema

Trabajo:

- Montar `ThemeProvider` en el árbol principal (root layout / GraphEditor host)
- Autorizar imports de `@/ui` en app
- Exponer `useTheme()` / ThemeContext al shell; **sin** migración masiva
- Dual-stack permitido: UI sigue en `--app-*`; provider aplica `--color-*` en el host
- Doc + validator gate `validate:ux-4.1`

### UX-4.2 — App Shell Foundation · COMPLETE

```text
The App Shell becomes the only composition root for application chrome.
WorkspaceLayout acts as a transitional bridge.
AppShell is layout-only. It owns no application state.
Toolbar relocation deferred to UX-4.4.
```

Evidencia: [`UX-4.2.md`](./UX-4.2.md) · `validate:ux-4.2`

- Composición explícita de 5 regiones según LAYOUT.md
- `WorkspaceLayout` = bridge; AppShell = único composition root
- Placeholders: Toolbar / Inspector / Status Bar
- AdaptiveToolbar permanece en `WorkspaceContent` (→ UX-4.4)
- Sin reescritura de Sidebar / Toolbar / Windows; sin features nuevas

### UX-4.3 — Sidebar Alignment · COMPLETE

```text
Sidebar owns width · AppShell owns position.
Scrolling ownership remains inside Sidebar · AppShell only bounds the region.
Single Sidebar instance — composition only.
```

Evidencia: [`UX-4.3.md`](./UX-4.3.md) · `validate:ux-4.3`

- Alinear Sidebar existente a Sidebar Region bajo AppShell
- Sin min-width 240px impuesto por AppShell (rail collapse safe)
- Reorganizar, no reescribir; sin Sidebar v2/Context/Provider

### UX-4.4 — Toolbar Migration · COMPLETE

```text
Move-only AdaptiveToolbar → AppShell Toolbar Region.
Transparent WorkspaceLayout bridge · single instance.
Toolbar owns functionality · AppShell owns position.
```

Evidencia: [`UX-4.4.md`](./UX-4.4.md) · `validate:ux-4.4`

- Mover `AdaptiveToolbar` desde `WorkspaceContent` → región Toolbar top-level del AppShell
- Freeze comportamental de acciones; foco en posición / composición
- Sin Toolbar v2 / Context / Provider; AppShell no crea AdaptiveToolbar

### UX-4.5 — Workspace Integration · COMPLETE

```text
Composition certification + ownership normalization.
No structural relocation is performed.
Workspace Region owns overlay containing block (relative).
AppShell bounds (overflow-hidden) · Workspace owns scroll.
```

Evidencia: [`UX-4.5.md`](./UX-4.5.md) · `validate:ux-4.5`

- Certificar Workspace Region como host exclusivo de composición del área central
- Normalizar límites: `relative h-full min-h-0 min-w-0 overflow-hidden`
- Reutilizar WorkspaceBodyLayout, WindowManager, FloatingWindowLayer (intactos)
- Sin nuevas herramientas de canvas (UX-5)
- Sin mover WindowManager / FloatingWindow* / providers

### UX-4.6 — Inspector

- Activar / alinear región Inspector docked bajo AppShell
- Shell chrome primero; binding profundo de props / análisis → UX-5
- Evidencia: [`UX-4.6.md`](./UX-4.6.md) · `validate:ux-4.6`

### UX-4.7 — Status Bar

- Nuevo Status Bar; región inferior LAYOUT.md
- Contenido mínimo (placeholder visual); features reales → UX-5
- Evidencia: [`UX-4.7.md`](./UX-4.7.md) · `validate:ux-4.7`

### UX-4.8 — Responsive + Docking

- Reglas de [`ux/docs/RESPONSIVE.md`](../../ux/docs/RESPONSIVE.md); colapso Sidebar / Inspector; docking zones
- Reutilizar `DockRoot` / `DockZone` / layout-engine

### UX-4.9 — Chrome Runtime Migration

Migración **solo del application chrome**, no de toda la aplicación:

- AppShell, Sidebar, Toolbar, Inspector, StatusBar → `useTheme()` / ThemeContext / CSS vars / `@/ui`
- Canvas y dominio residuales → UX-5 / UX-6
- Eliminación de dependencias directas de `UI_TOKENS` / `--app-*` **en chrome**

### UX-4.10 — Integration Certification

Gates:

- Shell 5 regiones presente; AppShell = único composition root de chrome
- ThemeProvider montado (host-scoped; sin Diagnostics / sin `<html>` / sin persistence)
- **No remaining direct theme dependencies inside App Shell** — AppShell, Sidebar, Toolbar, Inspector, StatusBar no leen `UI_TOKENS` directamente; solo `useTheme()` / ThemeContext / CSS vars / `@/ui`
- API Freeze UX-3 intacto; tsc + validators PASS
- Doc de cierre + **Next: UX-5 Feature Integration**

---

## 7. Reutilización de componentes

No reescribir:

- `WorkspaceLayout`, `WorkspaceContent`, `WorkspacePanels`, body panels
- `WindowManager` + floating / dock
- `Sidebar`, `AdaptiveToolbar`
- Sessions / `SessionProvider`
- Runtime completo `src/ui` (UX-3)

---

## 8. Gates y certificación (UX-4.10)

- Shell 5 regiones presente
- AppShell = único composition root de chrome
- ThemeProvider montado (host-scoped; sin Diagnostics / `<html>` / persistence)
- Chrome (AppShell, Sidebar, Toolbar, Inspector, StatusBar) sin `UI_TOKENS` directo
- Contratos públicos UX-3 intactos
- `tsc` + validators en PASS

---

## 9. Definition of Done (serie UX-4)

UX-4 se da por **cerrada** solo cuando se cumplen todos:

- [ ] Theme Runtime integrado al host (host-scoped)
- [ ] App Shell implementado como único composition root
- [ ] Las 5 regiones de LAYOUT.md presentes
- [ ] Chrome principal migrado a `@/ui`
- [ ] Sin dependencias directas a `UI_TOKENS` dentro del App Shell
- [ ] Contratos públicos de UX-3 intactos
- [ ] Validadores y gates en PASS
- [ ] UX-5 habilitado sin deuda arquitectónica bloqueante

---

## 10. Next → UX-5

**Next:** UX-5 — Feature Integration

Conectar funcionalidades reales (editor, propiedades, datasets, ventanas,
proyectos, exportación, IA, etc.) sobre el App Shell y runtime ya integrados.
Migration residual de canvas / a11y / perf / polish → UX-6 → v1.0.

---

## Related

- [`docs/UX/UX-3.21.md`](./UX-3.21.md) — Runtime Final Certification (superseded Next)
- [`ux/docs/LAYOUT.md`](../../ux/docs/LAYOUT.md) — Lovable 5-region shell
- [`ux/docs/RESPONSIVE.md`](../../ux/docs/RESPONSIVE.md)
- [`src/ui/docs/THEME.md`](../../src/ui/docs/THEME.md) — Theme Integration Contract
- [`src/ui/providers/theme-provider.tsx`](../../src/ui/providers/theme-provider.tsx)
