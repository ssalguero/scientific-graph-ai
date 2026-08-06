# DATA Quality Gates (DATA-I9)

**Status:** ACTIVE (DATA-I9)  
**Authority:** DATA-P10 · Architecture Freeze (P8) · API Freeze (P9)  
**Aggregate:** `npm run validate:data`

Quality Gates verify certified architecture.  
They never reinterpret Architecture Freeze or API Freeze.  
Violations produce diagnostics and fail the gate — they do not license redesign.

## Gates G1–G9

| Gate | Name | Script | Pass criterion (P10) |
|------|------|--------|----------------------|
| **DATA-G1** | Architecture | `validate:data-g1-architecture` | No unauthorized structural change; P8 compliance |
| **DATA-G2** | Dependencies | `validate:data-g2-dependencies` | No forbidden domain/internal edges |
| **DATA-G3** | Boundaries | `validate:data-g3-boundaries` | Delegates to certified I8 `validate:data-boundaries` |
| **DATA-G4** | API Freeze | `validate:data-g4-api-freeze` | Public surface = frozen groups/categories |
| **DATA-G5** | Ownership | `validate:data-g5-ownership` | Owns / References / Never Owns respected |
| **DATA-G6** | Registry | `validate:data-g6-registry` | No shadow Authoritative Registry |
| **DATA-G7** | Lifecycle / Validation | `validate:data-g7-lifecycle` | Validation before Available / Publication |
| **DATA-G8** | Documentation | `validate:data-g8-documentation` | Freeze docs present; no contradiction |
| **DATA-G9** | Certification Readiness | `validate:data-g9-certification` | Evidence pack complete (I10 prep) |

## Aggregate

```bash
npm run validate:data
```

Runs G1→G9, then `validate:data-boundary-unit`, then `validate:data-hardening-unit`.

## Independence

Each gate is an independent npm script. Failure of one does not rewrite another gate’s criteria.

## Explicit non-scope (DATA-I9)

No CI pipelines, benchmarks, coverage tooling, runtime metrics, or performance optimizations.
