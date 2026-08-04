# UX-7.8 — Visual Integration

> **Architectural principles:**
> - UI consumes infrastructure · Never infrastructure consumes UI.
> - Representation only · Query Only · Read-only · No mutation · No metadata.
> - Visual Integration Freeze · Rendering Ownership Freeze · Component Purity Freeze · Snapshot Lifetime Freeze.
> - Rendering Rules · Consumption Rules · Dependency Rules.
> - React autorizado **solo** bajo `src/ui/visual-integration/`.
> - Architecture Freeze UX-7.1–UX-7.7 = VIGENTE.
> - Local barrel only · sin expansión `@/ui`.
> - Sin product wire (Toolbar / Menus / Context Menus / AppShell).
> - Sin production register · sin llenado SSOT.

**Épica:** UX-7 — User Visibility / Discoverability  
**Microfase:** UX-7.8 — Visual Integration  
**Fecha:** 2026-08-04  
**Prerrequisitos:** UX-7.7 Visibility Diagnostics COMPLETE · UX-7.1–7.6 COMPLETE · UX-7.0 Roadmap FROZEN  
**SSOT de serie:** [`UX-7.0-roadmap.md`](./UX-7.0-roadmap.md)

**Declaración:**

```text
UX-7.8 = Visual Integration
SCOPE = src/ui/visual-integration/ · presentational React · local barrel
Visual Integration Freeze = UI = representación · Infrastructure = verdad
Rendering Ownership Freeze = React → Pipeline → Snapshot → render ONLY
Component Purity Freeze = componentes puros · sin state/cache/memo/effects de Discoverability
Snapshot Lifetime Freeze = un Snapshot completo por render · inmutable · sin update parcial
NO resolve* individuales · NO registry directo · NO Diagnostics como input de render
NO product wire · NO Toolbar · NO Menus · NO Context Menus · NO AppShell
NO register · NO metadata · NO SSOT mutation · NO Pipeline/Diagnostics/proyecciones changes
NO @/ui public barrel expansion
Architecture Freeze UX-7.1–UX-7.7 = VIGENTE
API FREEZE UX-3 / UX-4 / UX-5 / UX-6 = VIGENTE
Next: UX-7.9 Final Audit
```

---

## 1. Purpose / Objetivo

Crear la capa oficial de **Visual Integration** bajo
`src/ui/visual-integration/`, como consumidor presentacional aislado de
DiscoverabilityPipeline → DiscoverabilitySnapshot, **sin product wire**,
**sin production register** y **sin mutación del SSOT**.

```text
UX-7.8 establishes Visual Integration only.
It represents frozen DiscoverabilitySnapshot slots via DiscoverabilityPipeline.
It does not register, project, diagnose, execute, or wire product chrome.
```

---

## 2. Estado de partida

| Hecho | Evidencia |
|-------|-----------|
| UX-7.1 Visibility Foundation COMPLETE | [`UX-7.1.md`](./UX-7.1.md) · `validate:ux-7.1` |
| UX-7.2 Tooltip Foundation COMPLETE | [`UX-7.2.md`](./UX-7.2.md) · `validate:ux-7.2` |
| UX-7.3 Shortcut Hint Foundation COMPLETE | [`UX-7.3.md`](./UX-7.3.md) · `validate:ux-7.3` |
| UX-7.4 Command Description Bridge COMPLETE | [`UX-7.4.md`](./UX-7.4.md) · `validate:ux-7.4` |
| UX-7.5 Context Help Foundation COMPLETE | [`UX-7.5.md`](./UX-7.5.md) · `validate:ux-7.5` |
| UX-7.6 Discoverability Pipeline COMPLETE | [`UX-7.6.md`](./UX-7.6.md) · `validate:ux-7.6` |
| UX-7.7 Visibility Diagnostics COMPLETE | [`UX-7.7.md`](./UX-7.7.md) · `validate:ux-7.7` |
| Roadmap UX-7.0 FROZEN | [`UX-7.0-roadmap.md`](./UX-7.0-roadmap.md) |
| Sin `src/ui/visual-integration/` | objetivo de esta microfase |

---

## 3. In Scope / Out of Scope

**In**

- `src/ui/visual-integration/` flat
- Presentational views para TooltipContent · ShortcutHint · ContextHelp · CommandDescription
- Query adapter Pipeline → Snapshot only
- Composite DiscoverabilityView
- Local `index.ts` barrel
- Docs + `validate:ux-7.8`

**Out**

- Product wire Toolbar / Menus / Context Menus / AppShell
- Production `register` / llenado Visibility SSOT
- Harness/demo de ejecución
- Modificar Pipeline · Snapshot · Diagnostics · proyecciones · Visibility SSOT
- Metadata / ViewModel nuevos
- Usar VisibilityDiagnosticsReport / missing* como semántica de render
- Expansión del barrel público `@/ui`
- Command execution / Dispatcher / CEP
- Final Audit / Certification (→ UX-7.9–7.10)

---

## 4. Architecture / Pipeline visual

```text
VisibilityDefinition (SSOT)
├── TooltipContent
├── ShortcutHint
├── CommandDescription
├── ContextHelp
        │
        ▼
DiscoverabilityPipeline
        │
        ▼
DiscoverabilitySnapshot
        │
        ├──────────────► VisibilityDiagnostics
        │
        ▼
Visual Integration
```

**Flujo de consumo UI (único autorizado):**

```text
React presentational layer (pure)
        │
        ▼
DiscoverabilityPipeline.resolve(id)
  | resolveByCommandId(commandId)
        │
        ▼
DiscoverabilitySnapshot (completo · inmutable · lifetime = este render)
        │
        ▼
render slot fields as-is
```

Diagnostics permanece paralelo (inspección). No es input de render.

---

## 5. Responsabilidades

| Componente | Responsabilidad |
|------------|-----------------|
| Query adapter | Llamar exclusivamente `pipeline.resolve` / `resolveByCommandId` |
| Slot presenters | Renderizar campos del slot sin transformar |
| DiscoverabilityView | Componer slots del mismo Snapshot sin fusionar contratos |
| `index.ts` | Único export oficial del módulo (local barrel) |

---

## 6. No responsabilidades

```text
No register · No clear · No Visibility Registry mutation
No createVisibilityDefinition · No createTooltipContent / Hint / CommandDescription / ContextHelp
No resolveTooltipContent · resolveShortcutHint · resolveCommandDescription · resolveContextHelp
No createVisibilityDiagnosticsReport · No interpret missing* as error
No transformar / enriquecer / agregar / inferir campos de contratos
No fallback cruzado entre slots (Slot Independence)
No recomputar Snapshot fuera del Pipeline
No estado propio de Discoverability · No cache · No memoization de Snapshots
No efectos secundarios · No update parcial del Snapshot
No product wire · No AppShell · No Toolbar · No Menus · No Context Menus
No command execution · No Dispatcher · No CEP
No i18n / localization de contenido SSOT
No @/ui public barrel expansion
No modificar modules UX-7.1–7.7
No harness/demo obligatorio
```

---

## 7. API Freeze

### Superficie pública (local barrel)

```text
API Freeze UX-7.8
  Public surface = presentational views + Pipeline→Snapshot query adapter + types
  Entry point de datos = DiscoverabilityPipeline ONLY
    · resolve(VisibilityId) → DiscoverabilitySnapshot
    · resolveByCommandId(CommandId) → DiscoverabilitySnapshot
  NO registry API
  NO resolve* de proyecciones
  NO Diagnostics API en el path de render
  NO nuevos contratos de metadata / ViewModel
  NO reexport desde src/ui/index.ts
```

### Visual Integration Freeze

```text
Visual Integration Freeze
  UI = representación
  Infrastructure = verdad
  Ninguna decisión funcional vive en componentes React
  Ninguna proyección se crea en UI
  Ningún metadata se registra en UI
  Ningún diagnóstico se interpreta como error de producto en UI
  Slot undefined ⇒ no renderizar ese slot (no inventar contenido)
  Slot Independence vigente en la capa visual
```

### Rendering Ownership Freeze

```text
Rendering Ownership Freeze
  Los componentes visuales únicamente renderizan DiscoverabilitySnapshot.

  Único punto de entrada:
    React Components
      → DiscoverabilityPipeline
      → DiscoverabilitySnapshot
      → render()

  Nunca:
    React → resolveTooltipContent
    React → resolveShortcutHint
    React → resolveCommandDescription
    React → resolveContextHelp
    React → visibilityRegistry.get / getAll
    React → createVisibilityDiagnosticsReport

  Impide reintroducir orquestación ad-hoc y preserva UX-7.6 Pipeline Freeze.
```

### Component Purity Freeze

```text
Component Purity Freeze
  Los componentes React son funciones puras.
  No mantienen estado propio
  relacionado con Discoverability.
  No sincronizan caches.
  No memorizan snapshots.
  No producen efectos secundarios.

  Impide que fases futuras introduzcan
  lógica de negocio, sync o lifetime
  de datos Discoverability dentro de React.
```

### Snapshot Lifetime Freeze

```text
Snapshot Lifetime Freeze
  Cada render utiliza
  un único DiscoverabilitySnapshot.
  El Snapshot no se modifica.
  No se actualiza parcialmente.
  Un nuevo render implica
  un nuevo Snapshot completo.

  Cierra el ciclo de vida del dato
  en la capa visual.
  Refuerza Snapshot Freeze (UX-7.6):
  contenedor inmutable · sin estado · sin cache.
```

### Rendering Rules

```text
Rendering Rules
  1. No transformación de contratos.
  2. No agregación de campos entre slots.
  3. No enriquecimiento de datos (no defaults, no i18n rewrite del SSOT).
  4. No inferencias (title vacío no se sustituye; shortcut ausente no se inventa).
  5. No fallbacks cruzados (ausencia de tooltip ≠ usar contextHelp).
  6. No recomputación del Snapshot fuera de Pipeline.resolve*.
  7. Campos se muestran as-is (trim/proyección ya ocurrió en infra).
  8. undefined slot ⇒ omit render de ese slot (no placeholder semántico de “error”).
  9. Component Purity Freeze + Snapshot Lifetime Freeze aplican en cada render.
```

### Consumption Rules

```text
Consumption Rules
  1. Consumir exclusivamente APIs públicas congeladas.
  2. No acceder a internals de UX-7.1–7.7.
  3. No consultar registries directamente.
  4. No llamar resolve* individuales de proyecciones.
  5. No reconstruir el Pipeline (no reimplementar orquestación de 4 slots).
  6. No reconstruir Diagnostics.
  7. No mutar SSOT · no register · no clear.
  8. No usar Coverage Freeze fields (missing*/with*) como input de chrome.
```

### Dependency Rules

```text
Dependencias permitidas:
  visual-integration → discoverability
    (Pipeline · Snapshot types · VisibilityId/CommandId via public surface)
  visual-integration → react / react-dom (solo este módulo UX-7)
  visual-integration → projection modules (TYPE-ONLY imports)

Dependencias prohibidas:
  visual-integration ↛ visibility (runtime registry / factories)
  visual-integration ↛ resolve* runtime de proyecciones
  visual-integration ↛ visibility-diagnostics
  visual-integration ↛ toolbar | menus | context-menus | AppShell | execution | CEP
  visual-integration ↛ src/ui/index.ts expansion

Unidirectional:
  UX-7.1–7.7 nunca importan visual-integration.
```

### UX-7.1–UX-7.7 Freeze (reafirmado)

```text
VisibilityRegistryApi = register / get / getAll / clear ONLY
VisibilityDefinition fields = 5
TooltipContent fields = 4
ShortcutHint fields = 3
CommandDescription fields = 5 · CommandId
ContextHelp fields = 4 · VisibilityId
DiscoverabilityPipeline = resolve · resolveByCommandId ONLY
DiscoverabilitySnapshot = 4 slots contenedor only
Diagnostics Freeze = createVisibilityDiagnosticsReport ONLY
NO React under visibility/ · tooltips/ · shortcut-hints/ · command-descriptions/
  · context-help/ · discoverability/ · visibility-diagnostics/
NO @/ui expansion for UX-7 modules
```

---

## 8. Extension Points

| Congelado en UX-7.8 | Diferido |
|---------------------|----------|
| Visual Integration · Rendering Ownership · Component Purity · Snapshot Lifetime · Rendering/Consumption/Dependency Rules · presentational layer · local barrel | Product wire Toolbar/Menus/Context Menus/AppShell |
| Pipeline como único entry de datos UI · Slot Independence · un Snapshot completo por render | Production `register` / llenado SSOT |
| No Diagnostics-as-chrome · No `@/ui` · No harness obligatorio · No state/cache Discoverability en React | Harness/demo controlado (si se autoriza) |
| | Final Audit → UX-7.9 |
| | Release Certification → UX-7.10 |
| | Snapshot growth / ViewModel / findBy* → UX-8+ |

---

## 9. Exclusions / Decoupling fence

Files under `src/ui/visual-integration/` must not import or reference:

- Toolbar / Menus / Context Menus / AppShell
- `src/ui/shortcuts/` (execution)
- `src/ui/diagnostics/**` (UX-6.9)
- `src/ui/visibility-diagnostics/**`
- Command execution / CommandExecutionPipeline / Dispatcher
- Expanding `src/ui/index.ts`
- Contiguous historical product-wire tokens (use fence-safe bindings)

Also prohibited: production registration · App mount · registry mutation ·
individual projection resolve* · Diagnostics-as-render · Snapshot mutation.

**Fence-safe note:** bindings a Pipeline/Snapshot usan computed export keys para
preservar product-wire gates históricos UX-7.1–7.7 (mismo patrón que UX-7.7).

---

## 10. Protected files

| Path | Role |
|------|------|
| `src/ui/visual-integration/VisualIntegrationTypes.ts` | Props / inject types |
| `src/ui/visual-integration/queryDiscSnapshot.ts` | Query adapter Pipeline only |
| `src/ui/visual-integration/TooltipContentView.tsx` | Slot tooltip |
| `src/ui/visual-integration/ShortcutHintView.tsx` | Slot shortcutHint |
| `src/ui/visual-integration/ContextHelpView.tsx` | Slot contextHelp |
| `src/ui/visual-integration/CommandDescriptionView.tsx` | Slot commandDescription |
| `src/ui/visual-integration/DiscoverabilityView.tsx` | Composite Snapshot |
| `src/ui/visual-integration/index.ts` | Local barrel |

**Protected from this phase:** `src/ui/visibility/**`, `src/ui/tooltips/**`,
`src/ui/shortcut-hints/**`, `src/ui/command-descriptions/**`,
`src/ui/context-help/**`, `src/ui/discoverability/**`,
`src/ui/visibility-diagnostics/**`, `src/ui/diagnostics/**`,
`src/ui/shortcuts/**`, `src/ui/commands/**`, `src/ui/toolbar/**`,
`src/ui/menus/**`, `src/ui/context-menus/**`, `src/ui/index.ts`,
AppShell / production chrome,
`validate-ux-7.1` … `validate-ux-7.7`.

---

## 11. Acceptance criteria

| ID | Criterion |
|----|-----------|
| CA-UX-7.8.1 | Docs con Visual Integration · Rendering Ownership · Component Purity · Snapshot Lifetime · Rendering · Consumption · Dependency freezes/rules · No responsabilidades · Extension Points |
| CA-UX-7.8.2 | Módulo `src/ui/visual-integration/` + archivos core |
| CA-UX-7.8.3 | Visual Integration + Rendering Ownership + Component Purity + Snapshot Lifetime Freezes |
| CA-UX-7.8.4 | Rendering Rules: no transform / aggregate / enrich / infer / cross-fallback / Snapshot recompute / partial update |
| CA-UX-7.8.5 | Consumption Rules: public APIs · no registry · no individual resolve* · no Diagnostics render |
| CA-UX-7.8.6 | Representation only: no register/metadata/SSOT mutation · no product wire · no Discoverability state/cache/memo/effects |
| CA-UX-7.8.7 | Local barrel · sin expansión `@/ui` |
| CA-UX-7.8.8 | Architecture Freeze UX-7.1–7.7 intacto |
| CA-UX-7.8.9 | Freeze fences (infra React-free · no Toolbar/Menus/AppShell/CEP wire) |
| CA-UX-7.8.10 | Dependency fence unidireccional autorizada |

Gate: `npm run validate:ux-7.8` → **PASS 10/10**

---

## 12. Gate

```text
npm run validate:ux-7.8
→ PASS 10/10
```

---

## 13. Próximas fases

| Fase | Objetivo |
|------|----------|
| UX-7.9 | Final Audit |
| UX-7.10 | Release Certification |
