# Official Record

# Final Product Gap Inventory — Decision Closure and Supersession

**Product:** Scientific Graph AI
**Record Date:** 2026-08-21
**Authority:** PROJECT OWNER / PRODUCT GOVERNANCE AUTHORITY
**Record Status:** **IN FORCE**
**Historical Source:** [FINAL-PRODUCT-GAP-INVENTORY.md](../FINAL-PRODUCT-GAP-INVENTORY.md), checkpoint `0c6a40c`
**Authoritative Successors:** [Product Reorganization Baseline](./PRODUCT-REORGANIZATION-BASELINE.md) and [Product Decision Register PD-01–PD-07](./PRODUCT-DECISION-REGISTER-PD-01-PD-07.md)

---

## 1. Purpose

The Final Product Gap Inventory is an authoritative historical audit record. Sections O–P correctly recorded seven product questions as open when the inventory was created.

Product Reorganization later:

1. reconciled those questions against repository evidence;
2. separated product rules from implementation decisions;
3. received explicit Product Owner approval for PD-01 through PD-07;
4. explicitly retained or deferred remaining V1 policy boundaries;
5. integrated all dispositions into the Detailed Implementation Roadmap.

This record preserves that chronology. It does not rewrite the inventory and does not create a second Product Gap Inventory.

```text
INVENTORY OPEN-DECISION STATE = HISTORICALLY CORRECT
LATER PRODUCT REORGANIZATION = AUTHORITATIVE SUCCESSOR
CURRENT ROADMAP STATE = CLOSED OR EXPLICITLY DEFERRED AS RECORDED BELOW
```

---

## 2. Supersession Map

| Inventory §O open decision | Later Product Decision / frozen rule | Current status | Authoritative successor / roadmap disposition |
|---|---|---|---|
| 1. Is VGB a publication surface or exploration-only? | **PD-03 — VGB Publication Role** | **CLOSED** | VGB uses `Working Figure → Researcher Review → Publication Figure`. Publication lifecycle is implemented in PR4-A. |
| 2. Should VGB feed inference? | **PD-03 — VGB Publication Role** | **CLOSED** | VGB remains separate from Graph Editor and does **not** automatically feed Analysis. `displaySeries` is dispositioned in PR4-A.3 without creating an Analysis feed. |
| 3. One PCA/quantile SSOT, or two by contract? | **PD-04 — Cross-Output Scientific Invariants** plus implementation-open architecture | **CLOSED FOR PRODUCT / IMPLEMENTATION OPEN** | Semantic/configuration parity is mandatory; shared implementation is optional. CTR-12 and PR1-C.2 own the technical disposition. |
| 4. Should graph math enter the PDF? | **PD-04 — Cross-Output Scientific Invariants**; current explicit inclusion policy retained | **CLOSED FOR CURRENT V1** | Current tested `never` policy remains in PR2-B.2. Semantic parity does not require every artifact on every surface. A future inclusion change requires separate product authorization. |
| 5. Must comparison resume as live analysis? | **PD-06 — Artifact Identity and Provenance** | **CLOSED FOR CURRENT V1** | Current snapshot semantics are retained. PR2-A adds immutable identity and current/stale/unknown freshness; no silent auto-refresh or conversion to live analysis. |
| 6. Explorer remedy: disclose/rename or implement real methods? | **PD-01 — Explorer Identity** | **CLOSED** | Functional primary identity is required; historical names are migration/search aliases only. Real methods merely to preserve labels are forbidden. |
| 7. Does session-level restore warrant a UI? | **PD-06 — Artifact Identity and Provenance** plus frozen Project/Session boundary | **EXPLICITLY DEFERRED / NON-BLOCKING** | Project continuity proceeds in PR5-A. Full Session UI/restore remains ARCH-U-deferred and is not a Product V1 requirement. |

Not every inventory question required a new standalone Product Decision ID. Product Reorganization closed some through an approved product invariant plus an explicit V1 implementation/deferment boundary. This record does not create PD-08 or any additional Product Decision.

---

## 3. Relationship to PD-01–PD-07

The complete frozen decision set is:

| Decision | Inventory relationship | Status |
|---|---|---|
| **PD-01 — Explorer Identity** | Closes §O decision 6; governs FINAL-PG-001/002 identity | **CLOSED** |
| **PD-02 — SCI-50–60 Semantics** | Closes composite-methodology authority ambiguity exposed by FINAL-PG-002 | **CLOSED** |
| **PD-03 — VGB Publication Role** | Closes §O decisions 1 and 2; governs FINAL-PG-007/008/014 | **CLOSED** |
| **PD-04 — Cross-Output Scientific Invariants** | Governs §O decisions 3/4 and output-parity questions | **CLOSED** |
| **PD-05 — Machine-Readable Scientific Export** | Closes scientific-export product intent for FINAL-PG-010 | **CLOSED** |
| **PD-06 — Artifact Identity and Provenance** | Governs §O decisions 5/7, citable snapshots and continuity boundaries | **CLOSED** |
| **PD-07 — Generated Text Authority** | Closes human/AI/report authority semantics required for publication | **CLOSED** |

Authoritative wording: [Product Decision Register PD-01–PD-07](./PRODUCT-DECISION-REGISTER-PD-01-PD-07.md).

---

## 4. Section P Execution-Order Supersession

Inventory section P recommended a product-decision round before implementation sequencing. That prerequisite is complete.

The inventory intentionally did not define phases. Its workstream-only ordering is superseded for implementation by:

- [Detailed Implementation Roadmap](../../roadmaps/PRODUCT-REORGANIZATION-DETAILED-IMPLEMENTATION-ROADMAP.md);
- [Final Roadmap Certification](./FINAL-ROADMAP-CERTIFICATION.md);
- [Living Roadmap](../../roadmaps/ROADMAP.md).

Current authorized sequence:

```text
PR0-A → PR1 → PR2 → PR3 → PR4 → PR5 → PR6
```

---

## 5. Historical Integrity

The following remain unchanged:

- FINAL-PG-001 through FINAL-PG-024;
- their inventory evidence and original priorities;
- the inventory's historical wording;
- Tier 3 closure at `f0730a2`;
- the prohibition on T3-022+ and estimator reopening;
- deferred and rejected findings recorded by the inventory.

This supersession changes decision status prospectively. It does not retroactively claim that the decisions were closed when the inventory was authored.

---

## 6. Closure Statement

```text
INVENTORY §O–P HISTORICAL STATE = PRESERVED
PRODUCT DECISION ROUND = COMPLETE
PD-01–PD-07 = CLOSED
CURRENT IMPLEMENTATION DISPOSITIONS = RECORDED
NEW PRODUCT GAPS = NONE
NEW PRODUCT DECISIONS = NONE
```
