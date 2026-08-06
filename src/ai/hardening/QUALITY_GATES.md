# AI Quality Gates (AI-I9)

**Status:** ACTIVE (AI-I9)  
**Authority:** AI-P10 Hardening Strategy · AI-P6 AI-I9 · AI-I0…AI-I8  
**Aggregate:** `npm run validate:ai`

Quality Gates verify the certified implementation.  
They never reinterpret Planning Finality or freezes.  
Violations fail the gate — they do not license redesign.

## Gates AI-G1…AI-G11

| Gate | Name | Script | Phase |
|------|------|--------|-------|
| AI-G1 | Foundation | `validate:ai-foundation` | AI-I0 |
| AI-G2 | Infrastructure | `validate:ai-infrastructure` | AI-I1 |
| AI-G3 | Core Intelligence | `validate:ai-core` | AI-I2 |
| AI-G4 | Contextual Assistance | `validate:ai-contextual` | AI-I3 |
| AI-G5 | Core Capabilities | `validate:ai-i4` | AI-I4 |
| AI-G6 | Supporting | `validate:ai-supporting` | AI-I5 |
| AI-G7 | Governance | `validate:ai-governance` | AI-I6 |
| AI-G8 | Integration | `validate:ai-integration` | AI-I7 |
| AI-G9 | Extension | `validate:ai-extension` | AI-I8 |
| AI-G10 | Boundaries | `validate:ai-boundaries` | cross-cutting |
| AI-G11 | Hardening | `validate:ai-hardening` | AI-I9 |

## Aggregate

```bash
npm run validate:ai
```

## Explicit non-scope (AI-I9)

No new capabilities, contracts, APIs, runtime behavior, prompts, providers, LLM, UI, or CI pipelines.
