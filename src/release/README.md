# RELEASE Domain

**Layer:** Consolidation / Release-Authority Layer  
**Motto:** Consolidate without replacing.  
**Phase:** RELEASE-P1 — Governance & Evidence Architecture  
**Status:** P1 **CERTIFIED / FROZEN** · P2 **CERTIFIED / FROZEN** (not global Product Release)  
**Public import:** `@/release` only

## What this package is

TypeScript contracts and pure functions for release governance and evidence architecture:

- evidence model, classification, lifecycle, trust
- cross-domain baseline intake (P0.8 facts as data — no peer package imports)
- gaps/exceptions (WARNING vs BLOCKER)
- Evidence Index architecture (in-memory; **not** the definitive artifact)
- evidence → gate relationships (categories only)
- certification boundary and decision provenance drafts

## What this package is not

- Product release / promotion / deployment / shipping
- Release Candidate or Final Certification execution
- Concrete gate criteria or release thresholds
- Peer re-certification
- Circular dependency on ENGINE/DATA/AI/COLLAB/PLUGINS/PERFORMANCE/UX

## Authority

- [`docs/RELEASE/RELEASE-Planning-Charter.md`](../../docs/RELEASE/RELEASE-Planning-Charter.md)
- [`docs/RELEASE/official-records/RELEASE-P0-Constitution-and-Domain-Baseline.md`](../../docs/RELEASE/official-records/RELEASE-P0-Constitution-and-Domain-Baseline.md)
- [`docs/RELEASE/official-records/RELEASE-P1-Planning-Certification.md`](../../docs/RELEASE/official-records/RELEASE-P1-Planning-Certification.md)
- Implementation record: [`docs/RELEASE/implementation/RELEASE-P1-Governance-and-Evidence-Architecture.md`](../../docs/RELEASE/implementation/RELEASE-P1-Governance-and-Evidence-Architecture.md)

## Validate

```bash
npm run validate:release-p1
```
