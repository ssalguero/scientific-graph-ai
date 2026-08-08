# PERFORMANCE-I8 — Regression / CI Gates

**Status:** **RELEASE CERTIFIED / FROZEN** · Regression / CI Gates **COMPLETE**  
**Date:** 2026-08-08  
**Authority:** PERFORMANCE-P5 Gate Readiness · P3 C-GRD · P6 I8 · P8 Validation · I0–I7  
**Constraints:** Consumes evidence only · Reuses C-CMP · No invented thresholds · No peer mutation · No I9/I10 · No Git commit/push  

---

## Purpose

Implement **C-GRD**: gate-readiness evaluation that consumes comparison/budget/baseline evidence and wires an explicit PERFORMANCE CI entry.

Flow: **Evidence package → prerequisite check → gate outcome → CI exit semantics**

---

## C-GRD

| Responsibility | Behavior |
|----------------|----------|
| Gate identity | `GateDefinition` + `validateGateDefinition` |
| Prerequisites | workload / comparison / budget / baseline flags |
| Decision | `evaluateGateReadiness` |
| CI mapping | `gateOutcomeRequiresCiFailure` |

Reuses **C-CMP** (`ComparisonResult`) without redesign.

---

## Gate outcomes

`PASS` | `FAIL` | `BLOCKED` | `INCONCLUSIVE` | `EVIDENCE_DEPENDENCY` | `CONDITIONAL`

Rules:
- Missing required evidence → **never PASS**
- `REGRESSED` → **FAIL** (visible)
- `INCONCLUSIVE` / `BLOCKED` / `EVIDENCE_DEPENDENCY` → **not PASS**
- Conditional AI/COLLAB/PLUGINS markers → **CONDITIONAL**

---

## CI wiring

| Artifact | Role |
|----------|------|
| `scripts/ci-performance-gates.ts` | CI entry — exits non-zero unless required gate PASS; self-checks FAIL/missing paths |
| `npm run ci:performance-gates` | Package script |
| `npm run validate:performance-gates` | Behavioral validator |
| `.github/workflows/performance-gates.yml` | PERFORMANCE-only GitHub Actions workflow |

Unrelated project CI is not modified. This is **gate readiness**, not release certification (I10).

---

## Integrations (consume only)

| Source | Use |
|--------|-----|
| I7 C-CMP | comparison outcomes |
| I3 C-BUD | budget outcomes (optional) |
| I4 C-BASE | baseline provenance (optional) |
| I5/I6 | domain/scenario ids in evidence package |

No new measurement/optimization paths.

---

## Delivered

| Artifact | Path |
|----------|------|
| Gates package | `src/performance/gates/` |
| Record | `docs/PERFORMANCE/implementation/PERFORMANCE-I8-Regression-CI-Gates.md` |
| Validator | `scripts/validate-performance-gates.ts` |
| CI entry | `scripts/ci-performance-gates.ts` |
| Workflow | `.github/workflows/performance-gates.yml` |

---

## Explicitly not delivered

- Hardening (I9) · Final certification pack (I10)  
- Peer mutation · Invented numeric regression thresholds  
- Organization-wide gate framework  

---

## Validation

| Check | Result |
|-------|--------|
| C-GRD + C-CMP reuse | PASS |
| NO REQUIRED EVIDENCE → NO GATE PASS | PASS |
| Regression FAIL + CI fail mapping | PASS |
| CI workflow + entry scripts | PASS |
| No peer mods / no I9/I10 | PASS |
| `validate:performance-gates` | PASS (179 checks) |
| `ci:performance-gates` | PASS |
| I0–I7 validators (regression) | PASS at I8 certification |
| Peer `git diff` (engine/data/ai/ui/plugins) | empty |

---

## Official Declarations

- PERFORMANCE-I8: **RELEASE CERTIFIED / FROZEN**  
- Next eligible: **PERFORMANCE-I9** (separate authorization)  
- I10: **LOCKED / NOT AUTHORIZED**  
- Git: **NO COMMIT / NO PUSH**  

---

## Unlock State

| Item | State |
|------|--------|
| I0–I8 | RELEASE CERTIFIED / FROZEN |
| I9 | ELIGIBLE FOR SEPARATE IMPLEMENTATION AUTHORIZATION |
| I10 | LOCKED / NOT AUTHORIZED |
| Git | Uncommitted accumulation; no commit/push this phase |
