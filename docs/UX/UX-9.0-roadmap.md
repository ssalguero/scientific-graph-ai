# UX-9.0 — Productivity Layer · Roadmap

```text
Status: FROZEN
Series: UX-9
Version: 1.0
Supersedes: UX-8.10 Next
Prerequisites: UX-8 SERIES CERTIFIED
Architecture SSOT: UX-9-architecture.md
Next: UX-9.4
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

---

## Declaración

```text
UX-9 = Productivity Layer (OPEN)
UX-9.0  = FROZEN (roadmap oficial · SSOT de secuencia · Version 1.0)
UX-9.1  = COMPLETE (Workspace Activation)
UX-9.2  = COMPLETE (Focus + Selection Visual)
UX-9.3  = COMPLETE (Hover + Visibility)
UX-9.4  = PENDING (Keyboard Navigation)
UX-9.5  = PENDING (Clipboard Integration)
UX-9.6  = PENDING (Command Palette + Interaction Commands)
UX-9.7  = PENDING (Undo / Redo Integration)
UX-9.8  = PENDING (Workspace Polish + Diagnostics)
UX-9.9  = PENDING (Documentation Freeze)
UX-9.10 = PENDING (Release Certification)
Architecture SSOT = UX-9-architecture.md (FROZEN)
Prerequisite = UX-8 RELEASE CERTIFIED
No validate:ux-9.0
No package.json changes in UX-9.0
No src/** changes in UX-9.0
Visible User Outcome = governance rule for UX-9.1 → UX-9.8
ProductCompositionHost = architectural target (not implemented in UX-9.0)
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
| UX-9.4 | Keyboard Navigation | PENDING |
| UX-9.5 | Clipboard Integration | PENDING |
| UX-9.6 | Command Palette + Interaction Commands | PENDING |
| UX-9.7 | Undo / Redo Integration | PENDING |
| UX-9.8 | Workspace Polish + Diagnostics | PENDING |
| UX-9.9 | Documentation Freeze | PENDING |
| UX-9.10 | Release Certification | PENDING |

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

- **No** `validate:ux-9.0`
- **No** `package.json` changes in UX-9.0
- **No** nested `npm run validate:ux-9.*` chains
- Validators begin with **UX-9.1**
- Historical UX-8 validators remain; do not modify prior gates
- UX-8.10 RELEASE CERTIFIED remains the series-entry prerequisite

---

## 7. Next → UX-9.4

**UX-9.0 FROZEN** · roadmap + architecture SSOT published.  
**UX-9.1 COMPLETE** · Workspace Activation ([`UX-9.1.md`](./UX-9.1.md)) · `validate:ux-9.1`.  
**UX-9.2 COMPLETE** · Focus + Selection Visual ([`UX-9.2.md`](./UX-9.2.md)) · `validate:ux-9.2`.  
**UX-9.3 COMPLETE** · Hover + Visibility / Discoverability ([`UX-9.3.md`](./UX-9.3.md)) · `validate:ux-9.3`.

**Next microphase → UX-9.4 (Keyboard Navigation)**

Expected Visible User Outcome direction: keyboard navigation feedback
perceptible on the ProductCompositionHost integration — without new base systems.

Prerequisite reminder:

- UX-8 RELEASE CERTIFIED · [`UX-8.10.md`](./UX-8.10.md) · `validate:ux-8.10`
- UX-8 architecture frozen · [`UX-8-architecture.md`](./UX-8-architecture.md)
- UX-9.1 Workspace Activation COMPLETE · [`UX-9.1.md`](./UX-9.1.md)
- UX-9.2 Focus + Selection Visual COMPLETE · [`UX-9.2.md`](./UX-9.2.md)
- UX-9.3 Hover + Visibility COMPLETE · [`UX-9.3.md`](./UX-9.3.md)
