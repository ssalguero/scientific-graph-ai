# PP Issues Registry

**Artifact:** Production Readiness Issues Registry  
**Date:** 2026-08-10  
**Planning Authority:** [`../PRODUCTION-Planning-Charter.md`](../PRODUCTION-Planning-Charter.md) (RELEASE CERTIFIED / FROZEN)  
**Seed phase:** **PP0**  
**Status:** **IN FORCE** (seed frozen at PP0; dispositions may advance only under unlocked PP gates)

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
| **FR-01** | ENGINE certification-path gap (`src/engine/certification/CERTIFICATION.md` missing) | HANDED OFF — OPEN OUTSIDE PRS | **REQUIRED BEFORE RELEASE** | PP1 / PP9 | May be reclassified to **ACCEPTED RISK** only after PP1/PP9 evidence review; not silent |
| **FR-02** | Operational `package.json` **0.1.0** ≠ VI **1.0.0** | CLOSED AS ACCEPTED | **ACCEPTED RISK** | PP8 | PP8 must **reconfirm** before any package sync; sync remains NOT AUTHORIZED until PP11 |
| **FR-03** | No Git tag for 1.0.0 | CLOSED AS ACCEPTED | **ACCEPTED RISK** | PP8 / PP11 | PP8/PP11 must **reconfirm** before tag; tag remains NOT AUTHORIZED until PP11 |
| **FR-04** | No live full GRC validator re-run inside GRC-2 | CLOSED AS ACCEPTED | **REQUIRED BEFORE RELEASE** | PP1 | Fresh umbrella readiness evidence under PP1 — **not** a GRC reopen |
| **FR-05** | Security/Safety dedicated evidence gap | HANDED OFF — OPEN OUTSIDE PRS | **REQUIRED BEFORE RELEASE** | PP7 | Security & configuration readiness corpus |
| **FR-06** | UX-10 non-blocking follow-ups | HANDED OFF — FUTURE WORK BOUNDARY | **DEFERRED** | PP6 (watch) | Remains Future Work Boundary unless PP6 evidences a production blocker |
| **FR-07** | PLUGINS execution/loading deferred | HANDED OFF — FUTURE WORK BOUNDARY | **OUT OF SCOPE** | — | Separate Planning Charter required if pursued |
| **FR-08** | COLLAB realtime / CRDT deferred | HANDED OFF — FUTURE WORK BOUNDARY | **OUT OF SCOPE** | — | Separate Planning Charter required if pursued |
| **FR-09** | PERFORMANCE cert-pack / conditionality gap | HANDED OFF — OPEN OUTSIDE PRS | **REQUIRED BEFORE RELEASE** | PP5 | Performance readiness evidence completeness |
| **FR-10** | ROADMAP / PROJECT_STATUS sync | CLOSED WITH P3 EVIDENCE | **CLOSED** | PP0 | PRS alignment complete; PP0 updates live banners for PP series start only |
| **FR-11** | Domain-scoped peer certifications (not unconditional global reissue) | CLOSED AS ACCEPTED | **ACCEPTED RISK** | PP9 | Disclosed observation; preserved |

---

## Disposition counts (PP0 seed)

| Classification | Count | IDs |
|----------------|-------|-----|
| **BLOCKER** | 0 | — |
| **REQUIRED BEFORE RELEASE** | 4 | FR-01, FR-04, FR-05, FR-09 |
| **ACCEPTED RISK** | 3 | FR-02, FR-03, FR-11 |
| **DEFERRED** | 1 | FR-06 |
| **OUT OF SCOPE** | 2 | FR-07, FR-08 |
| **CLOSED** | 1 | FR-10 |
| **Total** | **11** | FR-01…FR-11 |

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

**End of PP Issues Registry (PP0 seed)**
