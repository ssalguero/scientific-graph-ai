# PERFORMANCE-I9 — Hardening / Measurement Integrity

**Status:** **RELEASE CERTIFIED / FROZEN** · Hardening / Measurement Integrity **COMPLETE**  
**Date:** 2026-08-08  
**Authority:** PERFORMANCE-P10 Hardening Strategy · P6 I9 · P8 Validation · I0–I8  
**Constraints:** Harden certified behavior only · No redesign · No peer mutation · No I10 · No Git commit/push  

---

## Purpose

Verify and strengthen integrity of the already-implemented PERFORMANCE layer under adverse, incomplete, inconsistent, or repeated conditions.

I9 is **not** a new feature wave. It hardens I0–I8 contracts so that invalid, incomplete, or unreproducible evidence cannot silently become PASS.

---

## Hardening objectives

| Concern | Goal |
|---------|------|
| Measurement integrity | Malformed / forged batches never aggregate as valid |
| Reproducibility | Unverified reproducibility never creates baselines |
| Evidence integrity | Inconsistent aggregation provenance rejected |
| Budget integrity | Invalid definitions / missing data never PASS |
| Comparison integrity | Non-finite stats → INCONCLUSIVE; attribution conservative |
| Optimization integrity | NO EVIDENCE → NO OPTIMIZATION preserved |
| Gate integrity | Unmeasured / unattributed IMPROVED cannot PASS |
| CI integrity | Measurement-backed entry; non-PASS fails CI |
| Boundary integrity | Public-only consumer imports; I2 peer allowlist |
| Failure paths | FAIL / BLOCKED / INCONCLUSIVE / EVIDENCE_DEPENDENCY / CONDITIONAL stay explicit |

---

## Integrity risks identified

| Risk | Existing behavior | Severity |
|------|-------------------|----------|
| R1 | `aggregateBatch` trusted hand-built batches (NaN / dup IDs) | High |
| R2 | Baseline `reproducible` defaulted true when omitted | High |
| R3 | Evidence accepted with inconsistent signal vs observation counts | High |
| R4 | Budget evaluate skipped definition validation | Medium |
| R5 | Compare accepted non-finite statistics | Medium |
| R6 | Gate could PASS without `measured === true` | High |
| R7 | Gate could PASS on IMPROVED with `attributed !== true` | High |
| R8 | `ciShouldFail` omitted INCONCLUSIVE/CONDITIONAL (helper drift) | High |
| R9 | CI entry could be fixture-outcome-only without measure→compare path | Medium |
| R10 | Consumer deep `@/performance/*` imports not scanned | Medium |

Desirable future improvements (not defects, not implemented): numeric overhead budgets; production persistence; peer opt APIs; I10 certification pack.

---

## Hardening actions

| Risk | Action | Location |
|------|--------|----------|
| R1 | Re-validate observations (finite values, IDs, duplicates, count integrity) | `measurement/aggregation.ts` |
| R2 | Require `options.reproducible === true` explicitly | `workloads/baseline.ts` (+ pipeline / validators) |
| R3 | Reject inconsistent / non-finite signal stats | `workloads/evidence.ts` |
| R4 | `validateBudgetDefinition` before evaluate → BLOCKED | `budgets/evaluate.ts` |
| R5 | Non-finite compare → INCONCLUSIVE | `opt-waves/compare.ts` |
| R6 | `measured !== true` → INCONCLUSIVE | `gates/evaluate.ts` |
| R7 | IMPROVED without attribution → INCONCLUSIVE | `gates/evaluate.ts` |
| R8 | `failCi` includes INCONCLUSIVE/CONDITIONAL; helper aligned | `gates/evaluate.ts` |
| R9 | CI builds Collect→Adjust→Compare→Gate + unmeasured self-check | `scripts/ci-performance-gates.ts` |
| R10 | Boundaries validator + integrity package markers; workflow path filters for peer public barrels | `scripts/validate-performance-boundaries.ts`, workflow, `integrity/` |

---

## Measurement / reproducibility

- Aggregation rejects invalid identity, non-finite values, duplicate observation IDs.
- Baseline creation requires **explicit** `reproducible: true`.
- Evidence requires observationCount ↔ signal count consistency.

## Baseline / budget

- C-BASE / C-BUD semantics unchanged.
- Incomplete aggregations still cannot become baselines.
- Invalid budget definitions evaluate to **BLOCKED**, not PASS.

## Optimization / gate

- Peer-public and missing evidence remain **EVIDENCE_DEPENDENCY**.
- Conditional AI/COLLAB/PLUGINS markers remain **CONDITIONAL** (never PASS).
- Gate PASS requires measured affirmation and attributed IMPROVED when comparison is IMPROVED.

## Failure-path / CI

- Non-PASS outcomes require CI failure via `gateOutcomeRequiresCiFailure`.
- Missing evidence, unmeasured packages, and regression self-checks covered in CI entry.
- Workflow runs integrity + boundaries validators in addition to gates / CI entry.

## Overhead / instrumentation

- No new persistent runtime activity.
- Adapters remain read-only (I2); boundaries validator re-checks peer import allowlist.
- No invented numeric overhead limits.

## Peer boundary

- Expected peer diff: **EMPTY**.
- No modifications under `src/engine|data|ai|ui|plugins`.
- No `src/collab`.

## Conditional domains

- AI / COLLAB / PLUGINS remain CONDITIONAL / EVIDENCE_DEPENDENCY paths.
- Not converted to PASS.

## Explicit I10 boundary

I9 does **not** deliver:

- Final certification pack  
- Release evidence consolidation  
- Domain / production certification  
- Release closure  

I10 owns those under separate authorization.

---

## Delivered

| Artifact | Path |
|----------|------|
| Integrity markers | `src/performance/integrity/` |
| Integrity validator | `scripts/validate-performance-integrity.ts` |
| Boundaries validator | `scripts/validate-performance-boundaries.ts` |
| Record | `docs/PERFORMANCE/implementation/PERFORMANCE-I9-Hardening-Measurement-Integrity.md` |
| Hardened modules | aggregation, evidence, baseline, budget evaluate, compare, gate evaluate, CI entry |
| CI workflow | integrity + boundaries steps; peer public barrel path filters |

---

## Explicitly not delivered

- I10 certification · New product capabilities · Peer opt APIs  
- Redesign of C-COL/C-AGG/C-BUD/C-BASE/C-OPT/C-CMP/C-GRD  
- Future Evolution (GPU, CRDT, autonomous optimization, cloud-scale)  
- Git commit / push  

---

## Validation

| Check | Result |
|-------|--------|
| Objective risks identified + hardened | PASS |
| Measurement / reproducibility integrity | PASS |
| Baseline / budget integrity | PASS |
| Optimization evidence gating | PASS |
| Gate / CI failure semantics | PASS |
| Failure states explicit | PASS |
| Conditional domains remain conditional | PASS |
| Instrumentation read-only / boundaries | PASS |
| Peer files unchanged | PASS |
| No I10 / Future Evolution | PASS |
| `validate:performance-integrity` | PASS |
| `validate:performance-boundaries` | PASS |
| I0–I8 validators (regression) | PASS at I9 certification |
| `ci:performance-gates` | PASS |

---

## Known limitations

- Process-local baseline storage remains non-persistent (I4 intentional).
- Empty product budget registry remains empty (I3 intentional — no invented product budgets).
- Peer-public optimization remains unauthorized (I7 intentional).
- I9 does not claim end-to-end product performance improvement.

---

## Official Declarations

- PERFORMANCE-I9: **RELEASE CERTIFIED / FROZEN**  
- Next eligible: **PERFORMANCE-I10** (separate authorization)  
- Git: **NO COMMIT / NO PUSH**  

---

## Unlock State

| Item | State |
|------|--------|
| P0–P11 / Planning Series | RELEASE CERTIFIED / FROZEN |
| I0–I9 | RELEASE CERTIFIED / FROZEN |
| I10 | ELIGIBLE FOR SEPARATE IMPLEMENTATION AUTHORIZATION |
| Git | NO COMMIT / NO PUSH — working tree intentionally uncommitted |
