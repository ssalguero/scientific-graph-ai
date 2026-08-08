# PERFORMANCE-I4 — Workloads / Baselines Implementation

**Status:** **RELEASE CERTIFIED / FROZEN** · Workloads / Baselines **COMPLETE**  
**Date:** 2026-08-08  
**Authority:** PERFORMANCE-P2 Workload Model · P3 C-WL/C-BASE/C-EVD · P6 I4 · I0–I3  
**Constraints:** Fixture/generic workloads only · In-memory baselines · Baseline ≠ Budget · No peer orchestration · No I5+ · No Git commit/push  

---

## Purpose

Implement **C-WL**, **C-BASE**, and **C-EVD**: controlled workload harness execution, baseline creation/retrieval, and provenance evidence for Baseline → Measure foundations.

Flow: **Workload → Measure (I1) → Aggregate → Baseline → Evidence**

---

## Components

| ID | Responsibility |
|----|----------------|
| **C-WL** | Workload identity/definition + harness (`runWorkloadHarness`) |
| **C-BASE** | In-memory baseline registry (create/lookup/list) |
| **C-EVD** | Baseline provenance (`BaselineEvidence`) |

Not implemented: C-OPT, C-CMP (full regression), C-GRD.

---

## Workload lifecycle

1. Validate `WorkloadDefinition` (`fixture` | `definition`; class `isolated` | `baseline`)  
2. Harness accepts explicit `numericValues` — does **not** call peers  
3. Feeds Collect → Aggregate  
4. Optional: create baseline with reproducible evidence  

Conditional sources `ai` / `collab` / `plugins` → **EVIDENCE_DEPENDENCY** (not executable).  
Cross-domain class → rejected (I6).

No product-specific ENGINE/DATA/UX scenario catalogs invented.

---

## Baseline semantics

- Baseline = reference observation package (`isBudget: false`)  
- Budget remains I3 / C-BUD only  
- Empty aggregation / unreproducible runs cannot become baselines  
- Persistence: **process-local Map only** (not DB/Supabase)  
- Comparison primitive: workload-identity comparability only (not regression/CI)

---

## Delivered

| Artifact | Path |
|----------|------|
| Workloads package | `src/performance/workloads/` |
| Record | `docs/PERFORMANCE/implementation/PERFORMANCE-I4-Workloads-Baselines.md` |
| Validator | `scripts/validate-performance-workloads.ts` |
| npm | `validate:performance-workloads` |

---

## Explicitly not delivered

- Domain measurement waves (I5) · cross-domain scenarios (I6) · optimization (I7) · CI/gates (I8) · hardening/cert (I9/I10)  
- Peer modifications · invented peer APIs · product workload catalogs · production persistence  

---

## Validation

| Check | Result |
|-------|--------|
| C-WL / C-BASE / C-EVD | PASS |
| Harness + baseline + evidence | PASS |
| Conditional / incomplete never silent PASS | PASS |
| Baseline ≠ budget | PASS |
| No peer mods / no I5+ | PASS |
| `validate:performance-workloads` | PASS (117 checks) |
| I0–I3 validators (regression) | PASS at I4 certification |
| Peer `git diff` (engine/data/ai/ui/plugins) | empty |

---

## Official Declarations

- PERFORMANCE-I4: **RELEASE CERTIFIED / FROZEN**  
- Next eligible: **PERFORMANCE-I5** (separate authorization)  
- I6–I10: **LOCKED / NOT AUTHORIZED**  
- Git: **NO COMMIT / NO PUSH**  

---

## Unlock State

| Item | State |
|------|--------|
| I0–I4 | RELEASE CERTIFIED / FROZEN |
| I5 | ELIGIBLE FOR SEPARATE IMPLEMENTATION AUTHORIZATION |
| I6–I10 | LOCKED / NOT AUTHORIZED |
| Git | Uncommitted accumulation; no commit/push this phase |
