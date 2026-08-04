# UX-6.0 — Command System · Roadmap

```text
Status: FROZEN
Series: UX-6
Version: 1.0
Supersedes: UX-5.10 Next
Prerequisites: UX-5 SERIES CERTIFIED
```

**Épica:** UX-6 — Command System  
**Microfase:** UX-6.0 — ROADMAP (documental)  
**Fecha:** 2026-08-03  
**Prerrequisitos:** UX-5 CLOSED · UX-5 SERIES CERTIFIED ([`UX-5.10.md`](./UX-5.10.md))

---

## SSOT precedence

> This document is the Single Source of Truth (SSOT) for the UX-6 series.
> If any implementation, validation script, or planning document conflicts with
> this roadmap, this document takes precedence until superseded by a later
> frozen roadmap.

---

## Declaración

```text
UX-6 = Command System (in progress)
UX-6.0  = FROZEN (roadmap oficial · SSOT · Version 1.0)
UX-6.1  = Command System Foundation
UX-6.2  = Command Registration
UX-6.3  = Command Execution Pipeline
UX-6.4  = Keyboard Shortcuts Foundation
UX-6.5  = Command Palette Foundation
UX-6.6  = Menus Integration
UX-6.7  = Toolbar Integration
UX-6.8  = Context Menus
UX-6.9  = Command Diagnostics & Metrics
UX-6.10 = Integration Certification
Registry = único SSOT de commands (CommandRegistryApi)
Estado runtime = separado de definición
Sin lógica de ejecución hasta UX-6.3
API Freeze por fase
Integración progresiva y reversible
Sin cambios funcionales visibles hasta fases de chrome (UX-6.5+)
AppShell architecture = FROZEN (UX-4)
Feature Architecture = FROZEN (UX-5)
Runtime API Freeze = VIGENTE (UX-3.21)
```

---

## 1. Objetivo

Crear una capa unificada para representar cualquier acción ejecutable de la
aplicación como un **Command**, de modo que menús, toolbar, palette, shortcuts,
macros y plugins reutilicen exactamente el mismo comando.

```text
UX-6 wires a Command System onto certified Features + AppShell + Runtime.
UX-6.1 freezes infrastructure before any registration or execution.
```

---

## 2. Estado de partida

| Capa | Estado |
|------|--------|
| Runtime UX-3 | Certificado, API frozen ([`UX-3.21.md`](./UX-3.21.md)) |
| AppShell | Sole composition root · layout-only ([`UX-4.2.md`](./UX-4.2.md)) |
| Feature Architecture | SERIES CERTIFIED ([`UX-5.10.md`](./UX-5.10.md)) |
| Command System | **No existe** — objetivo de UX-6.1 |

**Freeze técnico:** no romper contratos públicos `@/ui` / Runtime / Features;
no ampliar el barrel público `@/ui` hasta que una microfase lo autorice;
AppShell permanece layout-only.

---

## 3. Decisiones arquitectónicas

1. **Infrastructure first** (UX-6.1): Definition → Registry → State → Provider → Hooks → Bridge → Diagnostics before registration or execution.
2. **Definition ≠ State:** identity catalog vs runtime `enabled` / `visible`.
3. **Contract ≠ singleton:** `CommandRegistryApi` vs `commandRegistry`.
4. **Empty registry by design in UX-6.1:** registration deferred to UX-6.2.
5. **No execution until UX-6.3:** no handlers, dispatcher, or executor earlier.
6. **API Freeze por fase:** no adelantar shortcuts / palette / menus / toolbar.
7. **Local barrel only** until a phase authorizes `@/ui` expansion.
8. **Same pipeline shape as Features** for maintainability and validators.

```text
UX-5 SERIES CERTIFIED (Features)
        │
        ▼
UX-6.1 Command System Foundation
        │
        ▼
UX-6.2 Command Registration
        │
        ▼
UX-6.3 Command Execution Pipeline
        │
        ▼
UX-6.4–6.8 Shortcuts → Palette → Menus → Toolbar → Context Menus
        │
        ▼
UX-6.9–6.10 Diagnostics/Metrics → Integration Certification
```

---

## 4. Microfases UX-6.1–UX-6.10

| Fase | Objetivo |
|------|----------|
| UX-6.1 | Command System Foundation (infra only · empty registry) |
| UX-6.2 | Command Registration |
| UX-6.3 | Command Execution Pipeline |
| UX-6.4 | Keyboard Shortcuts Foundation |
| UX-6.5 | Command Palette Foundation |
| UX-6.6 | Menus Integration |
| UX-6.7 | Toolbar Integration |
| UX-6.8 | Context Menus |
| UX-6.9 | Command Diagnostics & Metrics |
| UX-6.10 | Integration Certification |

---

## 5. Out of Scope / Non-goals (series)

| Non-goal | Destino |
|----------|---------|
| Lovable layout chrome materialization | UX-7+ |
| Engine / AI / Collab product capabilities | post–UX series |
| Feature Registry mutations | UX-5 frozen |
| Runtime API changes | UX-3.21 frozen |

---

## 6. Validator governance

- Active gate = latest completed microfase (`validate:ux-6.N`)
- Historical validators remain; do not modify prior gates
- No nested `npm run validate:ux-6.*` chains that hang on Windows

---

## 7. Next

**UX-6.1 — Command System Foundation** · [`UX-6.1.md`](./UX-6.1.md) · `validate:ux-6.1`
