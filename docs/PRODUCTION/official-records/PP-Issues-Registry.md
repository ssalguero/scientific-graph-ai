# PP Issues Registry

**Artifact:** Production Readiness Issues Registry  
**Date:** 2026-08-10  
**Planning Authority:** [`../PRODUCTION-Planning-Charter.md`](../PRODUCTION-Planning-Charter.md) (RELEASE CERTIFIED / FROZEN)  
**Seed phase:** **PP0** (updated at **PP1**, **PP2**, **PP3**, **PP4**, **PP5**, **PP6**, **PP7**, **PP8**)  
**Status:** **IN FORCE**

---

## Purpose

Mandatory disposition registry for Production Readiness (PP). Every inherited or newly discovered issue receives exactly one classification under Charter §9.

**Binding:** Do not re-litigate PRS finding treatments. PP0 **reclassifies** PRS FR-01…FR-11 into this registry using approved default dispositions.

```text
PRS FR treatment (historical) ≠ PP disposition (live for Production Readiness)
```

---

## Classification taxonomy

| Classification | Meaning |
|----------------|---------|
| **BLOCKER** | Prevents production readiness |
| **REQUIRED BEFORE RELEASE** | Must be fixed before release |
| **ACCEPTED RISK** | Known and consciously accepted |
| **DEFERRED** | Valid work, intentionally postponed |
| **OUT OF SCOPE** | Does not belong to production readiness |
| **CLOSED** | Fully resolved with evidence (terminal) |

---

## Seed inventory — inherited PRS FR-01…FR-11

| ID | Title | PRS final treatment (cite only) | PP disposition (seed) | Target gate | Notes |
|----|-------|----------------------------------|------------------------|-------------|-------|
| **FR-01** | ENGINE certification-path gap (`src/engine/certification/CERTIFICATION.md` missing) | HANDED OFF — OPEN OUTSIDE PRS | **REQUIRED BEFORE RELEASE** | PP9 | PP1/PP2 confirmed not a build/functional blocker (`validate:engine` PASS); remains open for evidence completeness |
| **FR-02** | Operational `package.json` **0.1.0** ≠ VI **1.0.0** | CLOSED AS ACCEPTED | **ACCEPTED RISK** | PP8 (reconfirm complete) | PP8 reconfirm — still `0.1.0` ≠ VI `1.0.0`; sync remains NOT AUTHORIZED until PP11 ([`PP8-Deployment-and-Release-Readiness.md`](./PP8-Deployment-and-Release-Readiness.md)) |
| **FR-03** | No Git tag for 1.0.0 | CLOSED AS ACCEPTED | **ACCEPTED RISK** | PP8 / PP11 (PP8 reconfirm complete) | PP8 reconfirm — no `1.0.0`/`v1.0`/`v1.0.0` tags; tag remains NOT AUTHORIZED until PP11 |
| **FR-04** | No live full GRC validator re-run inside GRC-2 | CLOSED AS ACCEPTED | **CLOSED** | PP1 | Fresh PP1 evidence: build + tsc + release-p1/p2 + production-boundaries + performance-gates — **not** a GRC reopen |
| **FR-05** | Security/Safety dedicated evidence gap | HANDED OFF — OPEN OUTSIDE PRS | **CLOSED** | PP7 | Closed by [`PP7-Security-and-Configuration-Readiness.md`](./PP7-Security-and-Configuration-Readiness.md): `validate:ux-9.8` PASS + secret/config inspection + `.env.example` + Official Record evidence pack |
| **FR-06** | UX-10 non-blocking follow-ups | HANDED OFF — FUTURE WORK BOUNDARY | **DEFERRED** | PP6 (watch complete) | PP6 watch complete — no production blocker; follow-ups remain Future Work Boundary ([`PP6-UX-and-Interaction-Readiness.md`](./PP6-UX-and-Interaction-Readiness.md)) |
| **FR-07** | PLUGINS execution/loading deferred | HANDED OFF — FUTURE WORK BOUNDARY | **OUT OF SCOPE** | — | Separate Planning Charter required if pursued |
| **FR-08** | COLLAB realtime / CRDT deferred | HANDED OFF — FUTURE WORK BOUNDARY | **OUT OF SCOPE** | — | Separate Planning Charter required if pursued |
| **FR-09** | PERFORMANCE cert-pack / conditionality gap | HANDED OFF — OPEN OUTSIDE PRS | **CLOSED** | PP5 | Closed by [`PP5-Performance-Readiness.md`](./PP5-Performance-Readiness.md): CI validators PASS + I10 pack cite; conditionality remains disclosed |
| **FR-10** | ROADMAP / PROJECT_STATUS sync | CLOSED WITH P3 EVIDENCE | **CLOSED** | PP0 | PRS alignment complete; PP0 updates live banners for PP series start only |
| **FR-11** | Domain-scoped peer certifications (not unconditional global reissue) | CLOSED AS ACCEPTED | **ACCEPTED RISK** | PP9 | Disclosed observation; preserved |
| **PP-ISS-001** | ESLint: 132 errors / 102 warnings; default heap OOM without elevated `NODE_OPTIONS` | Discovered PP1 | **ACCEPTED RISK** | PP9 | Does not block `next build`; full lint cleanup out of PP1 scope |
| **PP-ISS-002** | `tsx` used by validators but not declared in package.json (extraneous / npx) | Discovered PP1 | **ACCEPTED RISK** | PP8 (reconfirm complete) | PP8 reconfirm — undeclared; not in lockfile; release validators PASS via `npx tsx`; declare not required for PP8 PASS |

---

## Disposition counts (post-PP8)

PP8 Deployment & Release Readiness reconfirmed **FR-02**, **FR-03**, and **PP-ISS-002** as **ACCEPTED RISK** (no sync/tag/`tsx` declare). FR-01 remains **REQUIRED BEFORE RELEASE**. No in-gate `PP8-B#`. No new `PP-ISS-###`.

| Classification | Count | IDs |
|----------------|-------|-----|
| **BLOCKER** | 0 | — |
| **REQUIRED BEFORE RELEASE** | 1 | FR-01 |
| **ACCEPTED RISK** | 5 | FR-02, FR-03, FR-11, PP-ISS-001, PP-ISS-002 |
| **DEFERRED** | 1 | FR-06 |
| **OUT OF SCOPE** | 2 | FR-07, FR-08 |
| **CLOSED** | 4 | FR-04, FR-05, FR-09, FR-10 |
| **Total** | **13** | FR-01…FR-11 + PP-ISS-001…002 |

---

## Rules for updates after PP0

1. New issues discovered in PP1+ are appended with a new ID (`PP-ISS-###`) and exactly one classification.
2. Seed FR rows may change disposition **only** under the unlocked gate that owns them, with evidence cited in that phase Official Record.
3. **OUT OF SCOPE** / **DEFERRED** / **ACCEPTED RISK** must not become implicit blockers.
4. At PP10, zero unclassified issues and zero unresolved **BLOCKER** / open **REQUIRED BEFORE RELEASE** remain.

---

## Authority cites

- PRS-P3 final FR table: [`../../PRS/official-records/PRS-P3-Closure-Evidence-State-Consistency-and-Program-Closure.md`](../../PRS/official-records/PRS-P3-Closure-Evidence-State-Consistency-and-Program-Closure.md)
- PRS CLOSED: [`../../PRS/certification/PRS-CLOSED.md`](../../PRS/certification/PRS-CLOSED.md)
- Approved PP default dispositions: Post-PRS / Production Readiness Plan (PP0 freeze input)
- PP5 FR-09 closure: [`./PP5-Performance-Readiness.md`](./PP5-Performance-Readiness.md)
- PP6 FR-06 watch: [`./PP6-UX-and-Interaction-Readiness.md`](./PP6-UX-and-Interaction-Readiness.md)
- PP7 FR-05 closure: [`./PP7-Security-and-Configuration-Readiness.md`](./PP7-Security-and-Configuration-Readiness.md)
- PP8 FR-02 / FR-03 / PP-ISS-002 reconfirm: [`./PP8-Deployment-and-Release-Readiness.md`](./PP8-Deployment-and-Release-Readiness.md)

**End of PP Issues Registry**
