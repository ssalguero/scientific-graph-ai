# RELEASE Certification — Evidence Index

**Nature:** Certification evidence catalog only.  
**Not:** the definitive Release Evidence Index artifact (P0.7 deferred).

## P1 — Governance & Evidence Architecture

| ID | Evidence | Role |
|----|----------|------|
| E-P0-CHARTER | `docs/RELEASE/RELEASE-Planning-Charter.md` | Planning Authority |
| E-P0-OR | `docs/RELEASE/official-records/RELEASE-P0-Constitution-and-Domain-Baseline.md` | Constitution / P0.8 baseline |
| E-P1-PLAN | `docs/RELEASE/official-records/RELEASE-P1-Planning-Certification.md` | P1 planning baseline |
| E-P1-IMPL | `docs/RELEASE/implementation/RELEASE-P1-Governance-and-Evidence-Architecture.md` | Implementation record |
| E-P1-VAL | `scripts/validate-release-p1.ts` + `npm run validate:release-p1` | P1 validation (**80/80**) |
| E-P1-CERT | `docs/RELEASE/certification/RELEASE-P1-Certification.md` | P1 certification decision |

## P2 — Readiness & Gate Architecture

| ID | Evidence | Role |
|----|----------|------|
| E-P2-PLAN | `docs/RELEASE/official-records/RELEASE-P2-Planning-Certification.md` | P2 planning contract |
| E-P2-IMPL | `docs/RELEASE/implementation/RELEASE-P2-Readiness-and-Gate-Architecture.md` | Implementation record |
| E-P2-SRC | `src/release/readiness/` · `src/release/gates/` | P2 architecture modules |
| E-P2-VAL | `scripts/validate-release-p2.ts` + `npm run validate:release-p2` | P2 validation (**44/44**) |
| E-P2-CERT | `docs/RELEASE/certification/RELEASE-P2-Certification.md` | P2 certification decision |
| E-SRC | `src/release/` | Shared RELEASE package |
| E-BOUND | `src/release/internal/boundary-policy.ts` | Import boundary policy |

## Domain Architectural Closure

| ID | Evidence | Role |
|----|----------|------|
| E-CLOSURE-OR | `docs/RELEASE/official-records/RELEASE-Domain-Closure.md` | Domain Closure Official Record |
| E-CLOSURE-CERT | `docs/RELEASE/certification/RELEASE-Domain-Closure-Certification.md` | Domain Closure Certification decision |

**Validation baselines (certification re-run):**  
`npm run validate:release-p1` → **80/80 PASS**  
`npm run validate:release-p2` → **44/44 PASS**

**Note:** Domain Closure certification is evidence-only (docs). It does not add validators and does not authorize Global Release Certification.
