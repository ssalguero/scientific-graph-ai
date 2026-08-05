# UX-8.0 — Workspace Interaction System · Roadmap

```text
Status: FROZEN
Series: UX-8
Version: 1.0
Supersedes: UX-7.10 Next
Prerequisites: UX-7 SERIES CERTIFIED
Architecture SSOT: UX-8-architecture.md
Next Series: UX-9
```

**Épica:** UX-8 — Workspace Interaction System  
**Microfase:** UX-8.0 — ROADMAP (documental)  
**Fecha:** 2026-08-04  
**Prerrequisitos:** UX-7 CLOSED · UX-7 RELEASE CERTIFIED ([`UX-7.10.md`](./UX-7.10.md))  
**Architecture SSOT:** [`UX-8-architecture.md`](./UX-8-architecture.md)

---

## SSOT precedence

> [`UX-8-architecture.md`](./UX-8-architecture.md) is the Single Source of Truth for
> UX-8 **architecture**. This roadmap is the SSOT for **series sequencing**,
> microphase status, and governance. Microphase docs must not redefine the
> global architecture model.

---

## Change Policy

| Tipo de cambio | Política |
|----------------|----------|
| Menor (redacción, referencias, enlaces) | Permitido sin nuevo freeze |
| Arquitectura, fases, objetivos o gates | Requiere **nuevo freeze** o un **ADR** asociado |

---

## Declaración

```text
UX-8 = IN PROGRESS (Workspace Interaction System)
UX-8.0  = FROZEN (roadmap oficial · SSOT de secuencia · Version 1.0)
UX-8.1  = COMPLETE (Focus System Foundation)
UX-8.2  = COMPLETE (Selection Foundation)
UX-8.3  = PENDING (Multi Selection)
UX-8.4  = PENDING (Hover System)
UX-8.5  = PENDING (Keyboard Navigation)
UX-8.6  = PENDING (Clipboard Foundation)
UX-8.7  = PENDING (Interaction Commands)
UX-8.8  = PENDING (Interaction Diagnostics)
UX-8.9  = PENDING (Documentation Freeze)
UX-8.10 = PENDING (Release Certification)
Architecture SSOT = UX-8-architecture.md (FROZEN)
Dependency Rule = VIGENTE
Authorities Matrix = VIGENTE
API Freeze por fase
Local barrel only · no @/ui expansion
Sin product mount en UX-8
AppShell / Features / Commands / Visibility / Runtime = FROZEN
Window surfaces D55–D63 = INTOCABLES
Next Series = UX-9
```

---

## 1. Objetivo

Establecer la infraestructura oficial de **estado de interacción** del
workspace (focus, selection, hover, keyboard nav, clipboard, interaction
commands, diagnostics), desacoplada de Runtime y sin modificar WindowRegistry
ni sistemas UX-5–7.

```text
UX-8 = estado de interacción
UX-9 = acciones del usuario sobre esa infraestructura
```

---

## 2. Architecture reference

All architectural rules (Authorities Matrix, Dependency Rule, No Ownership,
Future Integrations) live in [`UX-8-architecture.md`](./UX-8-architecture.md).
This roadmap does not duplicate them.

---

## 3. Microfases UX-8.1–UX-8.10

| Fase | Objetivo | Estado |
|------|----------|--------|
| UX-8.1 | Focus System Foundation | COMPLETE |
| UX-8.2 | Selection Foundation | COMPLETE |
| UX-8.3 | Multi Selection | PENDING |
| UX-8.4 | Hover System | PENDING |
| UX-8.5 | Keyboard Navigation (pure API) | PENDING |
| UX-8.6 | Clipboard Foundation | PENDING |
| UX-8.7 | Interaction Commands | PENDING |
| UX-8.8 | Interaction Diagnostics | PENDING |
| UX-8.9 | Documentation Freeze | PENDING |
| UX-8.10 | Release Certification | PENDING |

---

## 4. Out of Scope / Non-goals (series)

| Non-goal | Destino |
|----------|---------|
| Command Palette visual / product mount | UX-9 |
| Copy/Paste funcional · `navigator.clipboard` | UX-9 |
| DOM keyboard listeners | UX-9 |
| Undo / Redo | UX-9 |
| Advanced DnD · smart context menus | UX-10+ |
| Configurable shortcuts · macros · IA | post–UX-8 |
| Selection persistence | post–UX-8 |
| WindowRegistry / WindowAPI mutations | never in UX-8 |
| Runtime / scientific / graph math | never in UX-8 |

---

## 5. Validator governance

- Active construction gate advances per microphase (`validate:ux-8.N`)
- Historical validators remain; do not modify prior gates
- No nested `npm run validate:ux-8.*` chains that hang on Windows
- Final series gate = `validate:ux-8.10` (when COMPLETE)

---

## 6. Next → UX-9

After UX-8.10 RELEASE CERTIFIED:

**Next Series → UX-9 (Productivity Layer)**

Historical gates (do not nest):

- UX-8.1 Focus System Foundation · [`UX-8.1.md`](./UX-8.1.md) · `validate:ux-8.1`
- UX-8.2 Selection Foundation · [`UX-8.2.md`](./UX-8.2.md) · `validate:ux-8.2`
