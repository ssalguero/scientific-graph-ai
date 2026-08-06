# UX-6.9 — Diagnostics & Metrics Foundation

> **Architectural principles:**
> - Each UX-6 subsystem remains SSOT for its own diagnostics report.
> - UX-6.9 only aggregates public reports — never recalculates orphans/duplicates.
> - `UXDiagnosticsInput` is the sole input contract for Aggregator, Metrics, and Provider.
> - No WeakMap / internals inspection · no React UI · no telemetry · no production mount.
> - UX-6.1 / UX-6.3 / UX-6.4 / UX-6.5 / UX-6.6 / UX-6.7 / UX-6.8 public contracts remain frozen.

**Épica:** UX-6 — Command System  
**Microfase:** UX-6.9 — Diagnostics & Metrics Foundation  
**Fecha:** 2026-08-04  
**Prerrequisitos:** UX-6.1 Foundation · UX-6.3 Pipeline · UX-6.4 Shortcuts · UX-6.5 Palette · UX-6.6 Menus · UX-6.7 Toolbar · UX-6.8 Context Menus · UX-6.0 Roadmap FROZEN  
**SSOT de serie:** [`UX-6.0-roadmap.md`](./UX-6.0-roadmap.md)

**Declaración:**

```text
UX-6.9 = Diagnostics & Metrics Foundation
SCOPE = Input · Aggregator · Metrics · Report · Context · Provider · Hook · Bridge
UXDiagnosticsInput = sole input contract
createUXMetrics(input) = structural counts only
createUXDiagnosticsReport(input) = receive · aggregate · freeze
Context = { report }
NO recalculation of orphans/duplicates
NO WeakMap · NO internals · NO registry.has
NO React UI · NO Charts · NO Dashboard · NO DevTools
NO logging · NO telemetry · NO analytics · NO network · NO performance
NO AppShell
NO production mount · NO @/ui public barrel expansion
API FREEZE UX-6.1 / UX-6.3 / UX-6.4 / UX-6.5 / UX-6.6 / UX-6.7 / UX-6.8 = VIGENTE
Next: UX-6.10 Integration Certification
```

---

## 1. Purpose / Objetivo

Introducir una capa unificada de **Diagnostics & Metrics** que consolida los
reportes públicos de Commands, Shortcuts, Palette, Menus, Toolbar y Context Menus
en un único `UXDiagnosticsReport` con métricas estructurales.

```text
UX-6.9 aggregates existing public diagnostics only.
It does not recalculate diagnostics, inspect internals, render UI, or mount in production.
```

---

## 2. Estado de partida

| Hecho | Evidencia |
|-------|-----------|
| UX-6.1 Foundation | [`UX-6.1.md`](./UX-6.1.md) · `validate:ux-6.1` |
| UX-6.3 Execution Pipeline | [`UX-6.3.md`](./UX-6.3.md) · `validate:ux-6.3` |
| UX-6.4 Shortcuts | [`UX-6.4.md`](./UX-6.4.md) · `validate:ux-6.4` |
| UX-6.5 Command Palette | [`UX-6.5.md`](./UX-6.5.md) · `validate:ux-6.5` |
| UX-6.6 Menus | [`UX-6.6.md`](./UX-6.6.md) · `validate:ux-6.6` |
| UX-6.7 Toolbar | [`UX-6.7.md`](./UX-6.7.md) · `validate:ux-6.7` |
| UX-6.8 Context Menus | [`UX-6.8.md`](./UX-6.8.md) · `validate:ux-6.8` |
| Roadmap UX-6.0 FROZEN | [`UX-6.0-roadmap.md`](./UX-6.0-roadmap.md) |

---

## 3. In Scope / Out of Scope

**In**

- `UXDiagnosticsInput` · `createUXMetrics` · `createUXDiagnosticsReport`
- `UXDiagnosticsReport` · `UXMetricsReport`
- `UXDiagnosticsContext` · `UXDiagnosticsProvider` · `useUXDiagnostics` · `UXDiagnosticsBridge`
- Docs + `validate:ux-6.9`

**Out**

- React UI · Charts · Dashboard · DevTools
- Logging · Telemetry · Analytics · Network · Performance APIs
- AppShell mount · `@/ui` barrel expansion
- Modifications to Commands / Shortcuts / Palette / Menus / Toolbar / Context Menus / Pipeline

---

## 4. Architecture

```text
CommandDiagnosticsReport
        │
ShortcutDiagnosticsReport
        │
CommandPaletteDiagnosticsReport
        │
MenuDiagnosticsReport
        │
ToolbarDiagnosticsReport
        │
ContextMenuDiagnosticsReport
        │
        ▼
UXDiagnosticsInput
        │
        ├── createUXMetrics(input)
        ├── createUXDiagnosticsReport(input)
        └── UXDiagnosticsProvider({ children, input })
                │
                ▼
        UXDiagnosticsReport
                │
                ▼
        useUXDiagnostics() → { report }
                │
                ▼
        UXDiagnosticsBridge (pass-through)
```

---

## 5. UXDiagnosticsInput (sole input contract)

```ts
type UXDiagnosticsInput = Readonly<{
  commands: CommandDiagnosticsReport;
  shortcuts: ShortcutDiagnosticsReport;
  palette: CommandPaletteDiagnosticsReport;
  menus: MenuDiagnosticsReport;
  toolbar: ToolbarDiagnosticsReport;
  contextMenus: ContextMenuDiagnosticsReport;
}>;
```

Unique entry shape for:

- `createUXMetrics(input)`
- `createUXDiagnosticsReport(input)`
- `UXDiagnosticsProvider` props `{ children, input }`

No six-parameter variants.

---

## 6. Aggregator

```ts
createUXDiagnosticsReport(input: UXDiagnosticsInput): UXDiagnosticsReport
```

- Receives existing public reports.
- Calls `createUXMetrics(input)` exactly once.
- Returns `Object.freeze({ ...input, metrics })`.
- Does **not** recalculate orphans/duplicates or inspect WeakMaps / internals.

---

## 7. Metrics

```ts
type UXMetricsReport = Readonly<{
  totalCommandsReferenced: number;
  totalMenus: number;
  totalToolbarItems: number;
  totalContextMenus: number;
  totalShortcuts: number;
  orphanCommands: number;
  duplicatedEntries: number;
}>;
```

| Metric | Source (public fields only) |
|--------|-----------------------------|
| `totalCommandsReferenced` | `commands.count` |
| `totalMenus` | `menus.menus.length` |
| `totalToolbarItems` | `toolbar.items.length` |
| `totalContextMenus` | `contextMenus.contextMenus.length` |
| `totalShortcuts` | `shortcuts.count` |
| `orphanCommands` | sum of public orphan array lengths |
| `duplicatedEntries` | sum of public duplicate array lengths |

No timers · no performance · no profiling · no telemetry. `Object.freeze` applied.

---

## 8. Report

```ts
type UXDiagnosticsReport = Readonly<{
  commands: CommandDiagnosticsReport;
  shortcuts: ShortcutDiagnosticsReport;
  palette: CommandPaletteDiagnosticsReport;
  menus: MenuDiagnosticsReport;
  toolbar: ToolbarDiagnosticsReport;
  contextMenus: ContextMenuDiagnosticsReport;
  metrics: UXMetricsReport;
}>;
```

No additional fields.

---

## 9. Provider / Context / Hook / Bridge

- Context value: `{ report }` only.
- Provider props: `{ children, input: UXDiagnosticsInput }`.
- Provider: `useRef(createUXDiagnosticsReport(input))` — no `useState` / `useReducer`.
- Hook: read-only; throws outside Provider.
- Bridge: availability assertion only (pass-through).
- **NO production mount.**

---

## 10. API Freeze

### New (UX-6.9)

```ts
type UXDiagnosticsInput = Readonly<{ /* six subsystem reports */ }>;
type UXMetricsReport = Readonly<{ /* seven structural metrics */ }>;
type UXDiagnosticsReport = Readonly<{ /* six reports + metrics */ }>;
type UXDiagnosticsContextValue = Readonly<{ report: UXDiagnosticsReport }>;
type UXDiagnosticsProviderProps = Readonly<{
  children: React.ReactNode;
  input: UXDiagnosticsInput;
}>;
```

Freeze: Input · Metrics · Report · Aggregator · Context · Provider · Hook · Bridge.

### Unchanged (UX-6.1 / UX-6.3 / UX-6.4 / UX-6.5 / UX-6.6 / UX-6.7 / UX-6.8)

- Commands · Shortcuts · Palette · Menus · Toolbar · Context Menus
- Execution Pipeline
- All prior `*DiagnosticsReport` shapes and `create*DiagnosticsReport` factories

---

## 11. Exclusions / Decoupling fence

Prohibited under `src/ui/diagnostics/` for this phase:

- React UI · Charts · Dashboard · DevTools
- Logging · Telemetry · Analytics · Network · Performance APIs
- WeakMap · package-internal helpers · `registry.has` · manual orphan/duplicate scans
- AppShell product wiring
- `src/ui/index.ts` modification

Pure modules (Types / Metrics / Report / Aggregator / barrel) remain React-free.
React is allowed only in Context / Provider / Hook / Bridge.

---

## 12. Protected files

| Path | Role |
|------|------|
| `UXDiagnosticsTypes.ts` | `UXDiagnosticsInput` sole input |
| `UXMetrics.ts` | Structural metrics factory |
| `UXDiagnosticsReport.ts` | Consolidated report type |
| `UXDiagnosticsAggregator.ts` | Receive · aggregate · freeze |
| `UXDiagnosticsContext.tsx` | Private context `{ report }` |
| `UXDiagnosticsProvider.tsx` | Owns report via `useRef` |
| `useUXDiagnostics.ts` | Read-only hook |
| `UXDiagnosticsBridge.tsx` | Availability bridge |
| `index.ts` | Local barrel (no React) |

---

## 13. Acceptance criteria

| ID | Criterion |
|----|-----------|
| CA-UX-6.9.1 | Diagnostics stack structure (9 modules + docs) |
| CA-UX-6.9.2 | Aggregator: input · createUXMetrics once · freeze · no recalc |
| CA-UX-6.9.3 | Metrics: seven structural fields from public reports |
| CA-UX-6.9.4 | Report + UXDiagnosticsInput contracts |
| CA-UX-6.9.5 | Context `{ report }` · Provider `useRef(input)` · Hook · Bridge |
| CA-UX-6.9.6 | API Freeze UX-6.1–UX-6.8 intact |
| CA-UX-6.9.7 | No WeakMap / internals access |
| CA-UX-6.9.8 | No telemetry / logging / analytics / performance |
| CA-UX-6.9.9 | No production mount · no AppShell |
| CA-UX-6.9.10 | `tsc --noEmit` compiles |

Gate: `npm run validate:ux-6.9` → **PASS 10/10**

---

## 14. Próximas fases

| Fase | Objetivo |
|------|----------|
| UX-6.10 | Integration Certification |

UX-6.10 will certify the complete UX-6 series using the consolidated diagnostics
report without introducing new functional coupling or product chrome.
