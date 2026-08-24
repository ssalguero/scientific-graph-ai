# Official Record

# PR6-A.1 — Integrated Contract and Regression Certification

**Product:** Scientific Graph AI  
**Record Date:** 2026-08-24  
**Implementation Series:** Product Reorganization  
**Phase:** PR6-A Wave 1 (PR6-A.1)  
**Phase Status:** **EVIDENCE RECORDED / NOT A PR6-A CERTIFICATION / CP-7 NOT ISSUED**  
**Baseline checkpoint:** `c0a3599` — `docs(pr6): reconcile validation certification ssot`  
**Decision Authority:** PROJECT OWNER / PRODUCT GOVERNANCE AUTHORITY  
**Implementation Authority:** Frozen PD-01–PD-07; certified PR0-A through PR5; PR6-A charter  
**Charter:** [`PR6-A-INTEGRATED-VALIDATION-PERFORMANCE-EVIDENCE-CERTIFICATION-PROPOSAL.md`](./PR6-A-INTEGRATED-VALIDATION-PERFORMANCE-EVIDENCE-CERTIFICATION-PROPOSAL.md)

```text
PR6-A WAVE 1 = EVIDENCE / CLASSIFICATION ONLY
PR6-A = NOT CERTIFIED
CP-7 = NOT ISSUED
PRODUCT V1 / 1.0.0 = EXISTING BASELINE (NOT REOPENED)
NEW PR6-OWNED BLOCKER = NONE
```

**PR6-A Wave 1 is evidence/certification work and does not certify PR6-A or CP-7.**

No product code, validators, tests, scientific contracts, PERFORMANCE I0–I10 implementation, Session, or Product Face architecture were modified in this wave.

---

## 1. Baseline

| Item | Value |
|---|---|
| Branch | `main` |
| HEAD at Wave 1 start | `c0a3599` |
| Working tree at start | clean; `origin/main` synchronized |
| PR5 | CLOSED / CERTIFIED |
| PR6-A Wave 0 | checkpointed at `c0a3599` |
| Method | inspect existing `package.json` scripts → execute named gates → classify honestly → document → stop |

Commands were taken from `package.json`. No validator names were invented.

---

## 2. Commands actually executed

Executed **now** on this workstation against `c0a3599` (plus this documentation-only working tree). Composite umbrellas `validate:pr3-gate`, `validate:pr4-gate`, `validate:pr5-gate`, `validate:spe-1v-umbrella`, and `validate:prod2a-gate` were **not** run as composites; their constituent units listed below were run instead, plus a single `npx tsc --noEmit`.

| Command | Exit | Result (executed now) |
|---|---|---|
| `npm run validate:pr1-contract-foundation-unit` | 0 | PASS — 39/39 |
| `npm run validate:pr1-scientific-honesty-unit` | 0 | PASS — 30/30 |
| `npm run validate:pr2-snapshot-parity-unit` | 0 | PASS — 59/59 |
| `npm run validate:pr3-review-authority-unit` | 0 | PASS — 36/36 |
| `npm run validate:pr3-output-parity-unit` | 0 | PASS — 23/23 |
| `npm run validate:pr3-numeric-export-unit` | 0 | PASS — 26/26 |
| `npm run validate:pr4-figure-lifecycle-unit` | 0 | PASS — 33/33 |
| `npm run validate:pr5-wave0-diagnostic` | 0 | PASS — 22/22 |
| `npm run validate:pr5-wave1-unit` | 0 | PASS — 20/20 |
| `npm run validate:pr5-wave2-unit` | 0 | PASS — 20/20 |
| `npm run validate:methodology-unit` | 0 | PASS — 388 (F5A 214 + F5B 67 + F5C 38 + F5D 28 + F5E 41) |
| `npm run validate:comparison-unit` | 0 | PASS — 101/101 |
| `npm run validate:persistence-unit` | 0 | PASS — 23/23 |
| `npm run validate:prod2b-indexeddb` | 0 | PASS — 25/25 |
| `npm run validate:prod2c-c8-regression-gate` | 0 | PASS (composite VGB persistence regression; nested mapper/collect/hydrate/UI/fixture gates reported pass) |
| `npm run validate:visual-graph-builder-unit` | 1 | **87/88** — sole failure `scatter.amend.api-freeze-prerequisite` |
| `npm run validate:export2-pdf-toggle-unit` | 0 | PASS — 7/7 |
| `npm run validate:spe-12-pack-lite-unit` | 0 | PASS — 10/10 |
| `npm run validate:workspace-architecture` | 1 | **22/26** — four failures listed in §5 |
| `npx tsc --noEmit` | 0 | PASS |

Not executed (and therefore **not** claimed PASS): `validate:prod2a-gate` (full PROD-2A umbrella; historically environment-sensitive), `validate:spe-1v-umbrella` (duplicates units already run plus additional SPE-era gates not required to re-open SPE), PERFORMANCE I0–I10 runtime/CI suite, browser re-run of F-PR5-01.

---

## 3. Integrated result matrix

| Area | Result | Classification | Evidence |
|---|---|---|---|
| PR1 contracts | PASS 39/39 | executed now | `validate:pr1-contract-foundation-unit` |
| PR1 honesty | PASS 30/30 | executed now | `validate:pr1-scientific-honesty-unit` |
| PR2 snapshots/parity | PASS 59/59 | executed now | `validate:pr2-snapshot-parity-unit` |
| PR3 review | PASS 36/36 | executed now | `validate:pr3-review-authority-unit` |
| PR3 output parity | PASS 23/23 | executed now | `validate:pr3-output-parity-unit` |
| PR3 numeric export | PASS 26/26 | executed now | `validate:pr3-numeric-export-unit` |
| PR4 lifecycle | PASS 33/33 | executed now | `validate:pr4-figure-lifecycle-unit` |
| PR5 Wave 0 | PASS 22/22 | executed now | `validate:pr5-wave0-diagnostic` |
| PR5 Wave 1 | PASS 20/20 | executed now | `validate:pr5-wave1-unit` |
| PR5 Wave 2 | PASS 20/20 | executed now | `validate:pr5-wave2-unit` includes F-PR5-01 unit `pr5.wave2.home.disclosure-in-document-flow-not-overlay` |
| F-PR5-01 browser | previously certified | inspected only | PR5 official record / Wave 0 browser PASS; not re-run in Wave 1 |
| Methodology | PASS 388 | executed now | `validate:methodology-unit` |
| Comparison | PASS 101/101 | executed now | `validate:comparison-unit` |
| Project persistence | PASS 23/23 | executed now | `validate:persistence-unit` |
| IndexedDB | PASS 25/25 | executed now | `validate:prod2b-indexeddb` |
| VGB persistence | PASS | executed now | `validate:prod2c-c8-regression-gate` |
| PDF | PASS 7/7 | executed now | `validate:export2-pdf-toggle-unit` |
| Pack Lite | PASS 10/10 | executed now | `validate:spe-12-pack-lite-unit` |
| TypeScript | PASS | executed now | `npx tsc --noEmit` |
| VGB unit | 87/88 FAIL | **inherited accepted exception** | `validate:visual-graph-builder-unit`; failure `scatter.amend.api-freeze-prerequisite` |
| FINAL-PG-018 | 22/26 FAIL | **already-disclosed non-blocking debt** | `validate:workspace-architecture`; same four failures as CRP / inventory |
| PERFORMANCE I0–I10 baseline | RELEASE CERTIFIED / FROZEN | previously certified; inspected only | [`docs/PERFORMANCE/implementation/README.md`](../../PERFORMANCE/implementation/README.md); Wave 1 did **not** reopen or re-benchmark I0–I10 |

---

## 4. VGB 87/88 accepted exception

**Classification:** inherited accepted non-blocking CP-7 exception.

- Case id: `scatter.amend.api-freeze-prerequisite`
- Gate: `npm run validate:visual-graph-builder-unit` → exit 1, `caseCount: 88`, sole `pass: false`
- Cause (unchanged): test requires repository-root `PROJECT_DISCOVERY_PROD_3.md` containing “Decisión J”; archive remains at `docs/archive/project status/PROJECT_DISCOVERY_PROD_3.md`
- Root file absent (`Test-Path PROJECT_DISCOVERY_PROD_3.md` = False)

Wave 1 did **not**: restore, duplicate, or move the archive; modify the test; suppress the failure; lower thresholds; rewrite the validator; rename the test; treat this as a PR6 bug.

---

## 5. FINAL-PG-018 disposition

**Classification:** already-disclosed non-blocking governance debt (inventory P2; PR6-A.1 owner is **honest classification**, not validator manipulation).

Executed now: `npm run validate:workspace-architecture`

```text
total: 26
passed: 22
failed:
  workspace.files.exact
  governance.workspace.singleMainOwner
  workspace.tokens.frozen.shape
  governance.workspace.tokensOnly
```

This matches the disclosed CRP / FINAL-PG-018 pattern (22/26 with those four architectural-governance checks). It is **not** a new scientific, PR1–PR5, or product-behavior regression. Wave 1 does **not** rewrite the validator to obtain PASS.

**Disposition:** keep visible as disclosed non-blocking debt. Not a NEW PR6-owned blocker. Not a CP-7 scientific exception. Not an accepted “hide the failure” exception — the failure remains visible.

---

## 6. PR1–PR5 regression status

All executed PR1–PR5 owned unit gates **PASS**. Semantics were not reopened. F-PR5-01 remains represented by the Wave 2 unit case that asserts Home disclosure is in document flow, not overlay.

---

## 7. Scientific safety statement

No estimators, formulas, p-values, PCA algorithms, methodology, thresholds, uncertainty, units, provenance, snapshots, CTR-08, CTR-09, or CTR-10 were modified. No scientific failure appeared in executed gates. If one had appeared, Wave 1 would have classified and stopped.

---

## 8. Performance boundary

PERFORMANCE I0–I10 remain RELEASE CERTIFIED / FROZEN. Wave 1 inspected the implementation-series README only. No `src/performance/**` edits, no speculative workloads, no optimization. Wave 2 owns performance evidence.

---

## 9. Frozen non-scope (unchanged)

Session restore/UI/autosave; domain undo/redo; publication picker; dataset-scoped publication state; new persistence store; CTR-08/09/10 redesign; runtime AI / AIR-1; COLLAB/PLUGINS runtime; EXPORT-3; Cloud/Auth/RLS/marketplace/Lovable; five-tab / navigation / `page.tsx` extraction / global Product Face reorganization.

Absence of those features is **out-of-scope**, not a Wave 1 implementation task.

---

## 10. NEW PR6-owned blocker

**NONE.**

The only executed non-zero exits are:

1. VGB `scatter.amend.api-freeze-prerequisite` — inherited accepted exception
2. `validate:workspace-architecture` 22/26 — disclosed FINAL-PG-018 debt

Neither meets the Wave 1 product-code exception test. No implementation work was authorized or performed.

---

## 11. Wave 1 certification boundary

```text
WAVE 1 ≠ PR6-A CERTIFIED
WAVE 1 ≠ CP-7 ISSUED
WAVE 1 ≠ PRODUCT V1 RE-CERTIFIED
WAVE 1 ≠ RELEASE 1.0.0 REOPENED
WAVE 1 ≠ WAVE 2 STARTED
```

Wave 1 records integrated contract/regression evidence and honest classification. It does not close PR6-A.

---

## 12. Files changed by this wave

Documentation only:

- this record
- live index notes in [`README.md`](./README.md)
