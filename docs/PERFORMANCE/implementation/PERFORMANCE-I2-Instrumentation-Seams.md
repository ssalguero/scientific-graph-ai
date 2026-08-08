# PERFORMANCE-I2 — Instrumentation Seams Implementation

**Status:** **RELEASE CERTIFIED / FROZEN** · Instrumentation Seams **COMPLETE**  
**Date:** 2026-08-08  
**Authority:** PERFORMANCE-P4 · P6 I2 · P9 I1–I2 · PERFORMANCE-I0 · PERFORMANCE-I1  
**Constraints:** Read-only adapters · P4 public seams only · No peer mutations · No invented contracts · No I3+ · No Git commit/push  

---

## Purpose

Connect the I1 measurement core (C-COL → C-AGG) to authorized **public** observation seams via **read-only** adapters.

Do **not** implement budgets, workloads, baselines, optimization, cross-domain scenarios, CI gates, or peer APIs.

---

## Implemented seams

| Seam | Boundary | Adapter | Behavior |
|------|----------|---------|----------|
| ENGINE | `@/engine` | `observeEnginePublicSurface` | Confirms P4 public facade exports are functions — **does not call them** |
| DATA | `@/data` | `observeDataPublicSurface` | Reads `DATA_PUBLIC_CONTRACT_CATALOG` / `DATA_CAPABILITY_GROUPS` — **does not call configureData/getDataApi** |
| UX | `@/ui` | `observeUxPublicSurface` | Reads token/theme contract versions and theme ids — **no UI mutation** |

Flow: **Public Seam → Read-Only Adapter → C-COL → C-AGG** (`bindAdapterObservations` / `observeSupportedPublicSeams`).

Passive timing samples (`observePassivePublicTiming`) accept caller-owned timings for allowlisted public labels only (ENGINE allowlist enforced).

---

## Unsupported / conditional / evidence dependencies

| Seam | Status | Label |
|------|--------|-------|
| AI | Conditional | **EVIDENCE DEPENDENCY** — no public runtime assistance API |
| COLLAB | Conditional | **EVIDENCE DEPENDENCY** — no `src/collab/` |
| PLUGINS | Partial | **EVIDENCE DEPENDENCY** — execution deferred; deep contracts not consumer seams |
| Cross-domain UX→ENGINE→DATA | Shape supported in P4 | **Not implemented in I2** (I6 owns cross-domain scenarios) |
| UX→ENGINE call catalog | — | **EVIDENCE DEPENDENCY** (not a `@/ui` catalog) |
| ENGINE certification pack path | — | **EVIDENCE DEPENDENCY** |

---

## Delivered

| Artifact | Path |
|----------|------|
| Instrumentation package | `src/performance/instrumentation/` |
| Seam registry | `src/performance/instrumentation/seams.ts` |
| ENGINE/DATA/UX adapters | `engine-adapter.ts` / `data-adapter.ts` / `ux-adapter.ts` |
| C-COL binding | `src/performance/instrumentation/bind.ts` |
| Implementation record | `docs/PERFORMANCE/implementation/PERFORMANCE-I2-Instrumentation-Seams.md` |
| Validator | `scripts/validate-performance-instrumentation.ts` |
| npm script | `validate:performance-instrumentation` |

---

## Explicitly not delivered

- Peer file modifications / invented peer APIs  
- Write-back, command dispatch, orchestration  
- AI/COLLAB/PLUGINS fabricated adapters  
- Cross-domain scenario runner (I6)  
- Budgets (I3) / workloads-baselines (I4) / optimization / CI / certification  

---

## Validation

| Check | Result |
|-------|--------|
| Supported adapters → C-COL → C-AGG | PASS |
| I1 continuity | PASS |
| Conditionals / evidence deps explicit | PASS |
| No peer modifications | PASS |
| No I3+ functionality | PASS |
| `validate:performance-foundation` | PASS |
| `validate:performance-measurement-core` | PASS |
| `validate:performance-instrumentation` | PASS (run at certification) |

---

## Official Declarations

- PERFORMANCE-I2 Instrumentation Seams: **RELEASE CERTIFIED / FROZEN**  
- Peer packages: **UNMODIFIED**  
- Next eligible phase: **PERFORMANCE-I3 — Budgets / SLO Policy** (separate authorization)  
- I4–I10: **LOCKED / NOT AUTHORIZED**  
- Git: **NO COMMIT / NO PUSH**  

---

## Unlock State

| Item | State |
|------|--------|
| P0–P11 / I0 / I1 | RELEASE CERTIFIED / FROZEN |
| I2 | RELEASE CERTIFIED / FROZEN |
| I3 | ELIGIBLE FOR SEPARATE IMPLEMENTATION AUTHORIZATION |
| I4–I10 | LOCKED / NOT AUTHORIZED |
| Git | Uncommitted accumulation allowed; no commit/push this phase |
