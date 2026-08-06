# AI Evidence Package (AI-I9)

**Authority:** AI-P10 · AI-I9 Domain Hardening  
**Purpose:** Inventory of evidence for AI-I10 Domain Certification.

| Evidence | Path / Command |
|----------|----------------|
| Official Records AI-P0…P11 | `docs/AI/official-records/` |
| Implementation Records AI-I0…I8 | `docs/AI/implementation/` |
| AI-I9 Hardening Record | `docs/AI/implementation/AI-I9-Domain-Hardening.md` |
| Physical architecture | `src/ai/ARCHITECTURE.md` |
| Quality Gates | `src/ai/hardening/QUALITY_GATES.md` |
| Traceability | `src/ai/hardening/TRACEABILITY.md` |
| Certification readiness | `src/ai/hardening/CERTIFICATION_READINESS.md` |
| Aggregate validator | `npm run validate:ai` |
| Hardening validator | `npm run validate:ai-hardening` |
| Boundary policy SSOT | `src/ai/internal/boundary-policy.ts` |

## Registry counts (frozen inventory)

| Registry | Expected count |
|----------|----------------|
| Core capabilities (AI-P3 §6) | 7 |
| Supporting (AI-P3 §7) | 3 |
| Governance (AI-P3 §9) | 3 |
| Extension slots (AI-P3 §8) | 3 |
| Integration pathways (AI-I7) | 5 |

## Explicit non-claims

This package does not certify production intelligence, providers, or user-facing assistants.
