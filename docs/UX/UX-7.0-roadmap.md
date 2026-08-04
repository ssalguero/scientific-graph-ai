# UX-7.0 — User Visibility · Roadmap

```text
Status: FROZEN
Series: UX-7
Version: 1.0
Supersedes: UX-6.10 Next
Prerequisites: UX-6 SERIES CERTIFIED
Next Series: UX-8 (placeholder)
```

**Épica:** UX-7 — User Visibility / Discoverability  
**Microfase:** UX-7.0 — ROADMAP (documental)  
**Fecha:** 2026-08-04  
**Prerrequisitos:** UX-6 CLOSED · UX-6 RELEASE CERTIFIED ([`UX-6.10.md`](./UX-6.10.md))

---

## SSOT precedence

> This document is the Single Source of Truth (SSOT) for the UX-7 series.
> If any implementation, validation script, or planning document conflicts with
> this roadmap, this document takes precedence until superseded by a later
> frozen roadmap.

---

## Change Policy

| Tipo de cambio | Política |
|----------------|----------|
| Menor (redacción, referencias, enlaces) | Permitido sin nuevo freeze |
| Arquitectura, fases, objetivos o gates | Requiere **nuevo freeze** o un **ADR** asociado |

El roadmap no puede cambiar silenciosamente durante la implementación.

---

## Declaración

```text
UX-7 = CLOSED (User Visibility / Discoverability)
UX-7 RELEASE CERTIFIED
UX-7.0  = FROZEN (roadmap oficial · SSOT · Version 1.0)
UX-7.1  = COMPLETE (Visibility Foundation)
UX-7.2  = COMPLETE (Tooltip Foundation)
UX-7.3  = COMPLETE (Shortcut Hint Foundation)
UX-7.4  = COMPLETE (Command Description Bridge)
UX-7.5  = COMPLETE (Context Help Foundation)
UX-7.6  = COMPLETE (Discoverability Pipeline)
UX-7.7  = COMPLETE (Visibility Diagnostics)
UX-7.8  = COMPLETE (Visual Integration)
UX-7.9  = COMPLETE (Final Audit)
UX-7.10 = COMPLETE (Release Certification)
Series Closure Freeze = VIGENTE
Certification Immutability Freeze = VIGENTE
Infrastructure first · no visual chrome until authorized microphases
API Freeze por fase
Registry Freeze UX-7.1 = four methods only
Sin cambios funcionales visibles en UX-7.1
AppShell architecture = FROZEN (UX-4)
Feature Architecture = FROZEN (UX-5)
Command System = FROZEN (UX-6)
Runtime API Freeze = VIGENTE (UX-3.21)
Next Series = UX-8
```

---

## 1. Objetivo

Establecer una capa oficial de **Discoverability** que exponga comandos, atajos,
acciones y estados mediante ayudas visuales reutilizables — desacoplada del
runtime y sin modificar Commands, Toolbar, Menus, Context Menus ni Pipeline.

```text
UX-7 wires Discoverability onto certified Commands + Features + AppShell + Runtime.
UX-7.1 freezes Visibility infrastructure before any visual chrome.
```

---

## 2. Estado de partida

| Capa | Estado |
|------|--------|
| Runtime UX-3 | Certificado, API frozen ([`UX-3.21.md`](./UX-3.21.md)) |
| AppShell | Sole composition root · layout-only ([`UX-4.2.md`](./UX-4.2.md)) |
| Feature Architecture | SERIES CERTIFIED ([`UX-5.10.md`](./UX-5.10.md)) |
| Command System | RELEASE CERTIFIED ([`UX-6.10.md`](./UX-6.10.md)) |
| Visibility / Discoverability | **No existe** — objetivo de UX-7.1 |

**Freeze técnico:** no romper contratos públicos `@/ui` / Runtime / Features /
Commands; no ampliar el barrel público `@/ui` hasta que una microfase lo
autorice; AppShell permanece layout-only.

---

## 3. Decisiones arquitectónicas

1. **Infrastructure first** (UX-7.1): Definition → Factory → Registry → barrel before tooltips, hints, or bridges.
2. **Metadata only:** Visibility describes actions; it does not execute them.
3. **Mutable registry by design:** modules publish metadata via `register` (upsert); distinct from query-only CommandRegistry.
4. **Registry Freeze:** only `register` / `get` / `getAll` / `clear` until UX-8 without a new architecture series.
5. **Local barrel only** until a phase authorizes `@/ui` expansion.
6. **No production registration / mount in UX-7.1.**
7. **Same incremental philosophy as UX-5 / UX-6.**

```text
UX-6 RELEASE CERTIFIED (Commands)
        │
        ▼
UX-7.1 Visibility Foundation
        │
        ▼
UX-7.2 Tooltip Foundation
        │
        ▼
UX-7.3 Shortcut Hint Foundation
        │
        ▼
UX-7.4 Command Description Bridge
        │
        ▼
UX-7.5–7.7 Context Help → Discoverability Pipeline → Diagnostics
        │
        ▼
UX-7.8–7.10 Integration → Final Audit → Certification
```

---

## 4. Microfases UX-7.1–UX-7.10

| Fase | Objetivo | Estado |
|------|----------|--------|
| UX-7.1 | Visibility Foundation (infra only · empty registry) | COMPLETE |
| UX-7.2 | Tooltip Foundation (content model · Projection Freeze · Resolve Query Only) | COMPLETE |
| UX-7.3 | Shortcut Hint Foundation (hint model · Projection Freeze · Shortcut Freeze · Title exact copy) | COMPLETE |
| UX-7.4 | Command Description Bridge | COMPLETE |
| UX-7.5 | Context Help Foundation | COMPLETE |
| UX-7.6 | Discoverability Pipeline | COMPLETE |
| UX-7.7 | Visibility Diagnostics | COMPLETE |
| UX-7.8 | Visual Integration | COMPLETE |
| UX-7.9 | Final Audit | COMPLETE |
| UX-7.10 | Release Certification | COMPLETE |

---

## 5. Out of Scope / Non-goals (series)

| Non-goal | Destino |
|----------|---------|
| Engine / AI / Collab product capabilities | post–UX series |
| Command Registry / Pipeline mutations | UX-6 frozen |
| Feature Registry mutations | UX-5 frozen |
| Runtime API changes | UX-3.21 frozen |
| Advanced registry query (`findBy*`, `size`, `has`, …) | UX-8+ (nueva serie) |

---

## 6. Validator governance

- Active gate = `validate:ux-7.10` (series final · RELEASE CERTIFIED)
- Historical validators remain; do not modify prior gates
- No nested `npm run validate:ux-7.*` chains that hang on Windows

---

## 7. Next → UX-8

**UX-7 RELEASE CERTIFIED** · gate final [`UX-7.10.md`](./UX-7.10.md) · `validate:ux-7.10`

**Next Series → UX-8**

**Series Closure Freeze:** la serie UX-7 está cerrada. Ninguna microfase UX-7 puede reabrirse. Cualquier cambio posterior requiere nueva serie o decisión explícita de gobierno.

Historical gates (do not nest):

- UX-7.1 Visibility Foundation · [`UX-7.1.md`](./UX-7.1.md) · `validate:ux-7.1`
- UX-7.2 Tooltip Foundation · [`UX-7.2.md`](./UX-7.2.md) · `validate:ux-7.2`
- UX-7.3 Shortcut Hint Foundation · [`UX-7.3.md`](./UX-7.3.md) · `validate:ux-7.3`
- UX-7.4 Command Description Bridge · [`UX-7.4.md`](./UX-7.4.md) · `validate:ux-7.4`
- UX-7.5 Context Help Foundation · [`UX-7.5.md`](./UX-7.5.md) · `validate:ux-7.5`
- UX-7.6 Discoverability Pipeline · [`UX-7.6.md`](./UX-7.6.md) · `validate:ux-7.6`
- UX-7.7 Visibility Diagnostics · [`UX-7.7.md`](./UX-7.7.md) · `validate:ux-7.7`
- UX-7.8 Visual Integration · [`UX-7.8.md`](./UX-7.8.md) · `validate:ux-7.8`
- UX-7.9 Final Audit · [`UX-7.9.md`](./UX-7.9.md) · `validate:ux-7.9`
- UX-7.10 Release Certification · [`UX-7.10.md`](./UX-7.10.md) · `validate:ux-7.10`
