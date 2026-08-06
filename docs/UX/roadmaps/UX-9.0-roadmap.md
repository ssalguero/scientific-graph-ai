# UX-9.0 — Productivity Layer · Roadmap

```text
Status: CLOSED
Series: UX-9
Version: 1.0
Supersedes: UX-8.10 Next
Prerequisites: UX-8 SERIES CERTIFIED
Architecture SSOT: UX-9-architecture.md
UX-9 RELEASE CERTIFIED
Next Series: UX-10
```

**Épica:** UX-9 — Productivity Layer  
**Microfase:** UX-9.0 — ROADMAP (documental)  
**Fecha:** 2026-08-05  
**Prerrequisitos:** UX-8 CLOSED · UX-8 RELEASE CERTIFIED ([`UX-8.10.md`](./UX-8.10.md))  
**Architecture SSOT:** [`UX-9-architecture.md`](./UX-9-architecture.md)

---

## SSOT precedence

> [`UX-9-architecture.md`](./UX-9-architecture.md) is the Single Source of Truth for
> UX-9 **architecture**. This roadmap is the SSOT for **series sequencing**,
> microphase status, and governance. Microphase docs must not redefine the
> global architecture model.
>
> [`UX-8-architecture.md`](./UX-8-architecture.md) remains the frozen SSOT for
> UX-8 and is not rewritten by UX-9.

---

## Change Policy

| Tipo de cambio | Política |
|----------------|----------|
| Menor (redacción, referencias, enlaces) | Permitido sin nuevo freeze |
| Arquitectura, fases, objetivos o gates | Requiere **nuevo freeze** o un **ADR** asociado |

---

## Series discipline

```text
UX-5  → Features
UX-6  → Commands
UX-7  → Visibility
UX-8  → Interaction
UX-9  → Productivity
```

---

## Series Identity

```text
Official name:           UX-9 — Productivity Layer
Implementation strategy: Visual Integration of certified UX-1 → UX-8 infrastructure
```

**Visual Integration is not the official series name.** It is the
implementation strategy by which the Productivity Layer becomes visible and
usable.

```text
Interaction Infrastructure (UX-8)
        ↓
Visible Productivity (UX-9)
```

Series Identity Freeze = VIGENTE after UX-9.10. The official name remains
**Productivity Layer**. UX-9.10 certifies identity; it does not redefine it.

---

## Declaración

```text
UX-9 = CLOSED (Productivity Layer)
UX-9 RELEASE CERTIFIED
UX-9.0  = FROZEN (roadmap oficial · SSOT de secuencia · Version 1.0)
UX-9.1  = COMPLETE (Workspace Activation)
UX-9.2  = COMPLETE (Focus + Selection Visual)
UX-9.3  = COMPLETE (Hover + Visibility)
UX-9.4  = COMPLETE (Keyboard Navigation)
UX-9.5  = COMPLETE (Clipboard Integration)
UX-9.6  = COMPLETE (Command Palette + Interaction Commands)
UX-9.7  = COMPLETE (Undo / Redo Integration)
UX-9.8  = COMPLETE (Workspace Polish + Diagnostics)
UX-9.9  = COMPLETE (Documentation Freeze)
UX-9.10 = COMPLETE (Release Certification)
Architecture SSOT = UX-9-architecture.md (FROZEN)
Prerequisite = UX-8 RELEASE CERTIFIED
No validate:ux-9.0
No package.json changes in UX-9.0
No src/** changes in UX-9.0
Visible User Outcome = governance rule for UX-9.1 → UX-9.8
ProductCompositionHost = architectural target (not implemented in UX-9.0)
Certification Finality Freeze = VIGENTE
Productivity Finality = VIGENTE
```

---

## 1. Objetivo

Establecer el roadmap y la arquitectura oficiales de la **Productivity Layer**:
integrar visualmente la infraestructura certificada de UX-1 → UX-8 para que el
usuario perciba y use foco, selección, hover, teclado, clipboard, palette,
comandos de interacción y undo/redo — **sin crear infraestructura paralela**.

```text
UX-8 = estado de interacción (infraestructura)
UX-9 = productividad visible sobre esa infraestructura
```

No implementation in UX-9.0. Architectural planning only.

---

## 2. Architecture reference

All architectural rules (ProductCompositionHost, Authorities Matrix,
Dependency Rule, Clipboard Integration Bridge, Undo exception, UX-9.8
subblocks, reused inventory) live in
[`UX-9-architecture.md`](./UX-9-architecture.md).
This roadmap does not duplicate them.

---

## 3. Microfases UX-9.0–UX-9.10

| Fase | Objetivo | Estado |
|------|----------|--------|
| UX-9.0 | Roadmap + Architecture | **FROZEN** |
| UX-9.1 | Workspace Activation | **COMPLETE** |
| UX-9.2 | Focus + Selection Visual | **COMPLETE** |
| UX-9.3 | Hover + Visibility | **COMPLETE** |
| UX-9.4 | Keyboard Navigation | **COMPLETE** |
| UX-9.5 | Clipboard Integration | **COMPLETE** |
| UX-9.6 | Command Palette + Interaction Commands | **COMPLETE** |
| UX-9.7 | Undo / Redo Integration | **COMPLETE** |
| UX-9.8 | Workspace Polish + Diagnostics | **COMPLETE** |
| UX-9.9 | Documentation Freeze | **COMPLETE** |
| UX-9.10 | Release Certification | **COMPLETE** |

### Visible perception targets (guidance)

| Fase | El usuario debe notar |
|------|------------------------|
| UX-9.1 | Ventana activa · chrome distinto |
| UX-9.2 | Focus · selección |
| UX-9.3 | Hover · visibility |
| UX-9.4 | Navegación por teclado |
| UX-9.5 | Copy / paste funcionando |
| UX-9.6 | Command palette funcionando |
| UX-9.7 | Undo / redo |
| UX-9.8 | La aplicación «se siente terminada» |

---

## 4. Visible User Outcome (governance)

**Frozen rule for every functional microphase UX-9.1 → UX-9.8:**

Each microphase document **must** include a mandatory section titled
**Visible User Outcome** that describes:

1. **Visible changes** — what the user can see or feel after the phase
2. **Reused infrastructure** — which certified UX-1 → UX-8 surfaces are used
3. **User verification** — how to confirm the outcome **without DevTools**
   and without inspecting source code

This is a governance change, not a technical API. It prevents architecture-only
progress that is invisible in the product.

UX-9.0, UX-9.9, and UX-9.10 are documentation / certification gates and are
exempt from delivering a product Visible User Outcome (they may reference the
rule).

---

## 5. Out of Scope / Non-goals (series)

| Non-goal | Destino |
|----------|---------|
| Advanced Drag & Drop | post–UX-9 / UX-10+ |
| Smart Context Menus | post–UX-9 / UX-10+ |
| Configurable Shortcuts | post–UX-9 |
| Macros | post–UX-9 |
| AI features | post–UX-9 (AI domain) |
| Selection persistence | post–UX-9 |
| Scientific Runtime / Math Engine | never in UX-9 |
| Rewrites of UX-1 → UX-8 | never |
| Parallel Registry / Provider / Context / Dispatcher / State / Contracts | never (except documented Undo thin adapter rules) |
| Desktop / Plugin clipboard adapters (full delivery) | post–UX-9.5 unless a later microphase explicitly owns them |
| Implementing ProductCompositionHost | UX-9.1+ (target frozen in architecture; not in UX-9.0) |

---

## 6. Validator governance

- Active gate = `validate:ux-9.10` (series final · RELEASE CERTIFIED)
- Historical validators remain; do not modify prior gates
- No nested `npm run validate:ux-9.*` chains
- Final series gate = `validate:ux-9.10` COMPLETE
- UX-8.10 RELEASE CERTIFIED remains the series-entry prerequisite

---

## 7. Next → UX-10

**UX-9 RELEASE CERTIFIED** · gate final [`UX-9.10.md`](./UX-9.10.md) · `validate:ux-9.10`

**Series Closed.** Series Closure Freeze / Certification Finality Freeze /
Productivity Finality = VIGENTE.
Ninguna microfase UX-9 puede reabrirse. Cualquier cambio posterior requiere
nueva serie (UX-10+) o decisión explícita de gobierno.

**Next Series → UX-10**

UX-10 begins the product redesign phase outside the certified UX-9 Productivity
Layer (AppShell, sidebar, toolbar, dashboard, and replacement of temporary
seeds by real product flows).

Architecture SSOT remains [`UX-9-architecture.md`](./UX-9-architecture.md)
for the closed UX-9 series.

Historical gates (do not nest):

- UX-9.1 Workspace Activation · [`UX-9.1.md`](./UX-9.1.md) · `validate:ux-9.1`
- UX-9.2 Focus + Selection Visual · [`UX-9.2.md`](./UX-9.2.md) · `validate:ux-9.2`
- UX-9.3 Hover + Visibility / Discoverability · [`UX-9.3.md`](./UX-9.3.md) · `validate:ux-9.3`
- UX-9.4 Keyboard Navigation · [`UX-9.4.md`](./UX-9.4.md) · `validate:ux-9.4`
- UX-9.5 Clipboard Integration · [`UX-9.5.md`](./UX-9.5.md) · `validate:ux-9.5`
- UX-9.6 Command Palette + Interaction Commands · [`UX-9.6.md`](./UX-9.6.md) · `validate:ux-9.6`
- UX-9.7 Undo / Redo Integration · [`UX-9.7.md`](./UX-9.7.md) · `validate:ux-9.7`
- UX-9.8 Workspace Polish + Diagnostics · [`UX-9.8.md`](./UX-9.8.md) · `validate:ux-9.8`
- UX-9.9 Documentation Freeze · [`UX-9.9.md`](./UX-9.9.md) · `validate:ux-9.9`
- UX-9.10 Release Certification · [`UX-9.10.md`](./UX-9.10.md) · `validate:ux-9.10`
