# UX-5.0 — Feature Integration · Roadmap

```text
Status: FROZEN
Series: UX-5
Version: 1.0
Supersedes: UX-4.10 Next
Next Series: UX-6 Migration Completion + Accessibility + Performance + Polish
```

**Épica:** UX-5 — Feature Integration  
**Microfase:** UX-5.0 — ROADMAP (documental)  
**Fecha:** 2026-08-03  
**Prerrequisitos:** UX-4 CLOSED · UX-4 SERIES CERTIFIED ([`UX-4.10.md`](./UX-4.10.md)) · AppShell sole composition root

---

## SSOT precedence

> This document is the Single Source of Truth (SSOT) for the UX-5 series.
> If any implementation, validation script, or planning document conflicts with
> this roadmap, this document takes precedence until superseded by a later
> frozen roadmap.

---

## Change Policy

| Tipo de cambio | Política |
|----------------|----------|
| Menor (redacción, referencias, enlaces) | Permitido sin nuevo freeze |
| Arquitectura, fases, objetivos o gates | Requiere **nuevo freeze** (p. ej. UX-5.0 → UX-5.0.1 Roadmap Revision) o un **ADR** asociado |

El roadmap no puede cambiar silenciosamente durante la implementación.

---

## Declaración

```text
UX-5 = Feature Integration (IN PROGRESS)
UX-5.0  = FROZEN (roadmap oficial · SSOT · Version 1.0)
UX-5.1  = COMPLETE (Feature Registry Foundation)
UX-5.2  = COMPLETE (Feature Discovery)
UX-5.3  = COMPLETE (Feature Metadata)
UX-5.4  = COMPLETE (Feature Visibility)
UX-5.5  = COMPLETE (Feature State)
UX-5.6  = PENDING (Feature Provider)
UX-5.7  = PENDING (Feature Hooks)
UX-5.8  = PENDING (Feature Integration Bridge)
UX-5.9  = PENDING (Feature Diagnostics)
UX-5.10 = PENDING (Integration Certification)
Next = UX-5.6 (Feature Provider)
Registry = único SSOT de features
Metadata = completely immutable
Estado runtime = separado de definición
Sin lógica de negocio en el Registry
Sin dependencias desde Runtime UX-3
API Freeze por fase
Integración progresiva y reversible
Sin cambios funcionales visibles hasta UX-5.8
AppShell architecture = FROZEN (UX-4)
Runtime API Freeze = VIGENTE (UX-3.21)
Next Series = UX-6
```

---

## 1. Objetivo

Crear un registro centralizado de todas las features visibles para la UI
(Feature Registry = SSOT) e integrarlas progresivamente sobre el App Shell y
Theme Runtime certificados en UX-4, sin romper contratos públicos ni introducir
cambios funcionales visibles hasta la fase de bridge (UX-5.8).

```text
UX-5 wires product features onto certified AppShell + Runtime.
UX-5.1–5.7 freeze architecture before any visible behavior change.
```

---

## 2. Estado de partida

| Capa | Estado |
|------|--------|
| Runtime UX-3 | Certificado, API frozen ([`UX-3.21.md`](./UX-3.21.md)) |
| Theme Runtime Host | Montado vía ThemeRuntimeHost ([`UX-4.1.md`](./UX-4.1.md)) |
| AppShell | Sole composition root · layout-only ([`UX-4.2.md`](./UX-4.2.md)) |
| Chrome | Toolbar / Sidebar / Workspace / Inspector / Status Bar bajo AppShell |
| Feature Registry | **No existe** — objetivo de UX-5.1 |
| Spec Lovable | [`LAYOUT.md`](../../ux/docs/LAYOUT.md) |

**Freeze técnico:** no romper contratos públicos `@/ui` / Runtime; no ampliar
el barrel público `@/ui` hasta que una microfase lo autorice explícitamente;
AppShell permanece layout-only.

---

## 3. Decisiones arquitectónicas

1. **Registry primero** (UX-5.1): SSOT tipado e inmutable antes de discovery, metadata, React o bridge.
2. **Metadata inmutable · estado separado:** definición ≠ runtime state (5.3 vs 5.5).
3. **Sin lógica de negocio en el Registry:** sólo catálogo y consultas.
4. **Sin dependencias desde Runtime:** `src/ui/features/**` no importa `src/ui/theme/runtime/**`.
5. **API Freeze por fase:** cada microfase congela su superficie; no adelantar discovery/hooks/bridge.
6. **Integración progresiva y reversible:** bridge en 5.8; certificación en 5.10.
7. **Cero impacto visual hasta UX-5.8.**

```text
UX-4 SERIES CERTIFIED (AppShell + Runtime Host)
        │
        ▼
UX-5.1 Feature Registry Foundation
        │
        ▼
UX-5.2–5.5 Discovery → Metadata → Visibility → State
        │
        ▼
UX-5.6–5.7 Provider → Hooks (API Freeze)
        │
        ▼
UX-5.8 Feature Integration Bridge
        │
        ▼
UX-5.9 Feature Diagnostics
        │
        ▼
UX-5.10 Integration Certification
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
      + Lovable App Shell (Certified)
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
| Feature Registry SSOT bajo `src/ui/features/` |
| Discovery, metadata, visibility, runtime state (fases dedicadas) |
| FeatureProvider + Context + hooks públicos (5.6–5.7) |
| Bridge adaptativo a Toolbar / Sidebar / Inspector / Panels / Menus (5.8) |
| Diagnostics de integridad del registry (5.9) |
| Validators / gates / docs de certificación (hasta 5.10) |

---

## 5. Out of Scope / Non-goals

| Non-goal | Destino |
|----------|---------|
| Accessibility profunda | UX-6 |
| Performance tuning | UX-6 |
| Canvas polish | UX-6 |
| Authentication / Permissions | UX-6 / post–v1 |
| Cambios al Runtime API Freeze UX-3 | congelado UX-3.21 |
| Reescritura de AppShell / chrome layout contracts | congelado UX-4 |
| Lógica de negocio dentro del Registry | prohibido en toda la serie |

Cualquier propuesta fuera de esta lista se rechaza o se reubica a UX-6.

---

## 6. Microfases UX-5.1–UX-5.10

### UX-5.1 — Feature Registry Foundation · COMPLETE

```text
Create centralized Feature Registry SSOT.
Immutable · query-only · no React · no Context · no hooks.
No production chrome wiring · no visible functional change.
```

Evidencia: [`UX-5.1.md`](./UX-5.1.md) · `validate:ux-5.1`

- `src/ui/features/` — FeatureTypes, FeatureDefinition, FeatureRegistry, index
- Define FeatureId, FeatureCategory, FeatureDefinition, FeatureRegistry
- Registry inmutable con operaciones de consulta únicamente (`get` / `has` / `size`)
- Sin metadata / visibility / state / discovery / Provider

### UX-5.2 — Feature Discovery · COMPLETE

```text
Automatic discovery queries on the frozen registry.
No UI.
```

Evidencia: [`UX-5.2.md`](./UX-5.2.md) · `validate:ux-5.2`

- `registry.getAll()` · `registry.byCategory()` · `registry.find()` · `registry.enabled()`
- Sin UI · sin Provider · sin bridge

### UX-5.3 — Feature Metadata · COMPLETE

```text
Stable immutable metadata per feature.
Does not render anything.
```

- icon · title · description · tags · keywords · experimental · hidden
- Sin render · sin React

### UX-5.4 — Feature Visibility · COMPLETE

```text
Visibility rules without permissions.
```

- visible · hidden · experimental · beta · internal
- Sin auth / permissions

### UX-5.5 — Feature State · COMPLETE

```text
Runtime state separated from definition/metadata.
```

- enabled · disabled · loading · error
- Separado de metadata

### UX-5.6 — Feature Provider · PENDING

```text
First React Provider. Exposes Registry only.
Does not wire product components.
```

- FeatureProvider · FeatureContext
- Sólo expone Registry · sin conectar Toolbar/Sidebar/Inspector

### UX-5.7 — Feature Hooks · PENDING

```text
Public hooks · API Freeze.
```

- `useFeature()` · `useFeatures()` · `useFeatureState()`
- API Freeze de superficie pública de hooks

### UX-5.8 — Feature Integration Bridge · PENDING

```text
Adaptation bridge only — progressive, reversible.
First phase where visible wiring may begin.
```

- Bridge entre Toolbar · Sidebar · Inspector · Panels · Menus
- Adaptación sin reescritura masiva de comportamiento

### UX-5.9 — Feature Diagnostics · PENDING

```text
Integrity reports for the registry SSOT.
```

- enabled · hidden · duplicates · invalid ids · missing metadata

### UX-5.10 — Integration Certification · PENDING

```text
Certification only. Series close.
```

- Script final `validate-ux-5.10.ts`
- Checklist completa · SERIES CERTIFIED = all-or-nothing

---

## 7. Reutilización de componentes

No reescribir:

- AppShell / AppShellLayout / AppShellRegions (UX-4 frozen)
- ThemeRuntimeHost / ThemeProvider (UX-3 / UX-4 contracts)
- Sidebar, AdaptiveToolbar, Inspector, Workspace panels (adapt via bridge only in 5.8)
- Runtime completo `src/ui/theme/runtime/**`

---

## 8. Gates y certificación (UX-5.10)

- Feature Registry = SSOT único; metadata inmutable; state separado
- Provider + hooks públicos congelados (5.6–5.7)
- Bridge adaptativo certificado (5.8)
- Diagnostics reportan integridad (5.9)
- Contratos públicos UX-3 / AppShell UX-4 intactos
- `tsc` + validators en PASS
- **UX-5 SERIES CERTIFIED** (declarable sólo en 5.10)

---

## 9. Definition of Done (serie UX-5)

UX-5 se da por **cerrada** solo cuando se cumplen todos:

- [ ] Feature Registry Foundation (5.1)
- [ ] Discovery (5.2)
- [ ] Metadata (5.3)
- [ ] Visibility (5.4)
- [ ] Feature State (5.5)
- [ ] Feature Provider (5.6)
- [ ] Feature Hooks API Freeze (5.7)
- [ ] Integration Bridge (5.8)
- [ ] Feature Diagnostics (5.9)
- [ ] Integration Certification (5.10)
- [ ] Sin deuda arquitectónica bloqueante para UX-6

```text
UX-5 SERIES CERTIFIED may only be declared if every mandatory certification
block passes. Partial certification is not permitted.
```

---

## 10. Next → UX-6

**Next:** UX-6 — Migration Completion + Accessibility + Performance + Polish

Completar migración residual de canvas, a11y profunda, performance tuning y
polish hacia v1.0. Auth / permissions permanecen fuera de UX-5.

---

## Related

- [`docs/UX/UX-4.10.md`](./UX-4.10.md) — UX-4 Integration Certification (prerequisite)
- [`docs/UX/UX-4.0-roadmap.md`](./UX-4.0-roadmap.md) — prior series SSOT
- [`ux/docs/LAYOUT.md`](../../ux/docs/LAYOUT.md) — Lovable 5-region shell
- [`src/ui/features/`](../../src/ui/features/) — Feature Registry (from UX-5.1)
