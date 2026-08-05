# UX-8.8 — Interaction Diagnostics

> **Architectural principles:**
> - Diagnostics = query-only composition of existing `getState()` snapshots.
> - **No authority** — Focus / Selection / Hover / Keyboard / Clipboard /
>   Interaction Commands retain sole authority.
> - **Report Freeze:** returned report is `Object.freeze`'d · immutable.
> - **Query-only Freeze:** factory calls **only** `getState()` — never mutate.
> - **Snapshot Freeze:** each section originates from `getState()`; never expose
>   registries or mutable internals.
> - **Snapshot Identity Freeze:** every call → **new** report object
>   (`report₁ !== report₂`); no memoization / cached report.
> - **Stateless Diagnostics Freeze:** no private state / cache / memo / history /
>   polling.
> - **Registry Independence Freeze:** never coordinate / synchronize / correct /
>   repair registries — only report them.
> - **Report Composition Freeze:** each section is **exactly**
>   `dependency.getState()` — no map / filter / normalize / transform / derive /
>   enrich / merge.
> - **Report Ordering Freeze:** property order frozen:
>   `focus` → `selection` → `hover` → `keyboardNavigation` → `clipboard` →
>   `interactionCommands`.
> - **Failure Transparency Freeze:** no try/catch / fallback / defaults /
>   partial reports — `getState()` exceptions propagate.
> - Pure function only — no Registry / Provider / Context / Hook / singleton /
>   React.
> - Dependency Rule: solo contratos públicos + `getState()`.
> - Sin product mount · sin expansión `@/ui`.
> - Architecture Freeze: [`UX-8-architecture.md`](./UX-8-architecture.md).

**Épica:** UX-8 — Workspace Interaction System  
**Microfase:** UX-8.8 — Interaction Diagnostics  
**Fecha:** 2026-08-05  
**Prerrequisitos:** UX-8.7 RELEASE CERTIFIED · Architecture SSOT FROZEN · UX-8.0 Roadmap FROZEN  
**SSOT de arquitectura:** [`UX-8-architecture.md`](./UX-8-architecture.md)  
**SSOT de serie:** [`UX-8.0-roadmap.md`](./UX-8.0-roadmap.md)

**Declaración:**

```text
UX-8.8 = Interaction Diagnostics
SCOPE = InteractionDiagnosticsReport
        → createInteractionDiagnosticsReport
        → local barrel
Diagnostics = query only → getState() → freeze → return
NO Registry · NO Provider · NO Context · NO Hook · NO singleton · NO React
Report Ordering Freeze = focus · selection · hover · keyboardNavigation
  · clipboard · interactionCommands
Report Composition Freeze = each section = dependency.getState() EXACTLY
Report Freeze = Object.freeze(report)
Snapshot Freeze = sections from getState · never registries
Snapshot Identity Freeze = every call → NEW report · report₁ !== report₂
Stateless Diagnostics Freeze = no cache / memo / history / polling / private state
Registry Independence Freeze = never coordinate / sync / correct registries
Failure Transparency Freeze = no try/catch · exceptions propagate
API Freeze = InteractionDiagnosticsReport + createInteractionDiagnosticsReport ONLY
Diagnostics owns NO authority
NO Focus · NO Selection · NO Hover · NO Keyboard · NO Clipboard mutations
NO WindowRegistry · NO Runtime · NO scientific · NO product mount
NO @/ui public barrel expansion
Dependency Rule = VIGENTE
Architecture Freeze UX-8 = VIGENTE
API FREEZE UX-3 / UX-4 / UX-5 / UX-6 / UX-7 / UX-8.1–UX-8.7 = VIGENTE
Next: UX-8.9 Documentation Freeze
```

---

## 1. Objective / Objetivo

Crear el sistema oficial de Interaction Diagnostics bajo
`src/ui/interaction-diagnostics/`,
**100% query-only**, **sin mutación**, **sin estado propio**,
**sin product mount**, **sin expansión `@/ui`**.

```text
UX-8.8 consolidates a frozen snapshot of Focus · Selection · Hover ·
Keyboard Navigation · Clipboard · Interaction Commands via getState() only.
It does not mutate infrastructure from UX-8.1–UX-8.7.
It does not register events, poll, or run application logic.
```

---

## 2. Architecture

```text
createInteractionDiagnosticsReport()
        │
        ▼
query registries (getState only)
        │
        ▼
InteractionDiagnosticsReport
        │
        ▼
frozen snapshot (Object.freeze)
```

| Componente | Responsabilidad |
|------------|-----------------|
| `InteractionDiagnosticsReport` | Contrato Readonly de composición pasiva |
| `createInteractionDiagnosticsReport` | Factory pura · query-only · freeze |
| `index.ts` | Local barrel · API Freeze (2 exports) |

No existe Registry. No existe Provider. No existe Context. No existe Hook.

---

## 3. Report Freeze

El reporte es únicamente un snapshot.

- Inmutable vía `Object.freeze(report)`.
- No representa estado vivo.
- No mantiene referencias mutables a registries.
- Cada llamada produce un reporte nuevo.

Forbidden fields: timestamps · ids propios · metadata · counters · runtime info.

---

## 4. Query-only Freeze

La factory **nunca** llama:

```text
focus() · hover() · select() · dispatch() · clear() · move() · set()
```

Solo:

```text
getState()
```

sobre cada dependencia.

---

## 5. Snapshot Freeze

Cada sección del reporte proviene de un snapshot `getState()`.

- Nunca reutilizar referencias internas mutables de registries.
- Nunca devolver registries.
- Nunca exponer APIs mutables.

---

## 6. Snapshot Identity Freeze

Cada invocación de `createInteractionDiagnosticsReport(...)` produce un
**nuevo** objeto reporte.

- No memoización.
- No cached report.
- No reutilización de instancia anterior.

Aunque los `getState()` individuales devuelvan estados equivalentes:

```text
report₁ !== report₂
```

---

## 7. Stateless Diagnostics Freeze

Diagnostics no posee estado privado.

Forbidden:

```text
cache · memo · memoization · history · polling · private state
```

---

## 8. Registry Independence Freeze

Interaction Diagnostics **nunca**:

- coordina registries
- sincroniza estados
- corrige inconsistencias
- repara registries

Simplemente reporta.

---

## 9. Report Composition Freeze

`InteractionDiagnosticsReport` es una composición pasiva de snapshots existentes.

- Nunca enriquece, transforma, normaliza ni deriva información adicional.
- Cada sección es **exactamente** el resultado de `getState()` del módulo
  correspondiente.

Forbidden:

```text
map · filter · normalize · transform · derive · enrich · merge
```

---

## 10. Report Ordering Freeze

El orden de las propiedades queda congelado y coincide con el orden
arquitectónico de la serie:

```text
focus
selection
hover
keyboardNavigation
clipboard
interactionCommands
```

Ningún otro orden es válido.

---

## 11. Failure Transparency Freeze

La factory no captura ni oculta errores.

Si alguno de los `getState()` falla, la excepción se propaga.

Forbidden:

```text
try · catch · fallback · estado parcial · valores por defecto
```

La función es puramente compositiva.

---

## 12. API Freeze

Exportar **únicamente**:

| Export | Rol |
|--------|-----|
| `InteractionDiagnosticsReport` | Tipo del snapshot consolidado |
| `createInteractionDiagnosticsReport` | Factory query-only |

Nada más. Local barrel only — no `@/ui` expansion.

---

## 13. Authorities

Interaction Diagnostics **no posee autoridad**.

| Dominio | Autoridad |
|---------|-----------|
| Focus | FocusRegistry |
| Selection | SelectionRegistry |
| Hover | HoverRegistry |
| Keyboard navigation | KeyboardNavigationRegistry |
| Clipboard | ClipboardRegistry |
| Interaction commands | InteractionCommandDispatcher |
| Diagnostics | Query-only (sin autoridad de mutación) |

---

## 14. Dependency Rule

**Permitido:**

- contratos públicos de UX-8.1–UX-8.7
- `getState()`

**Prohibido:**

- mutaciones / setters / `dispatch`
- WindowRegistry
- Runtime
- `scientific/**`
- React · Provider · Context · Hook

---

## 15. Out of Scope

| Non-goal | Destino |
|----------|---------|
| Product wiring / UI | UX-9+ |
| React components | never in UX-8.8 |
| Registry / Provider / Context / Hook | never in UX-8.8 |
| Caching / memoization / polling | never in UX-8.8 |
| Synchronization / mutation | never in UX-8.8 |
| Derived diagnostics | never in UX-8.8 |
| Runtime integration | never in UX-8 |
| `@/ui` public barrel expansion | never in UX-8.8 |

---

## 16. Integration Fence

Do **not** modify:

- `page.tsx` · AppShell · `src/ui/index.ts`
- WindowRegistry
- Focus / Selection / Hover / Keyboard Navigation / Clipboard /
  Interaction Commands modules
- Visibility · Tabs · Runtime · `scientific/**`
- [`UX-8-architecture.md`](./UX-8-architecture.md)
- Historical validators UX-8.1–UX-8.7

---

## 17. Acceptance Criteria

- `src/ui/interaction-diagnostics/**` (exactly 3 files)
- [`UX-8.8.md`](./UX-8.8.md)
- `scripts/validate-ux-8.8.ts`
- `package.json` → `validate:ux-8.8`
- [`UX-8.0-roadmap.md`](./UX-8.0-roadmap.md) → UX-8.8 COMPLETE
- `validate:ux-8.8` → PASS
- Sin cambios fuera del alcance de UX-8.8

---

## 18. Gate

```text
validate:ux-8.8 → PASS
```

---

## 19. Next → UX-8.9

**Next: UX-8.9 — Documentation Freeze**

Con UX-8.8 se completa la infraestructura funcional de UX-8.
Quedan únicamente Documentation Freeze y Release Certification.
