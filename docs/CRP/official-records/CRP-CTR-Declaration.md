# CRP — CTR Declaration

**Date:** 2026-08-18  
**Series:** Commercial Readiness Preparation (CRP)  
**Nature:** Formal CTR declaration — **NO `src/**` · NO implementation · NO SemVer bump · NO DEP-2 amendment · NO new product series**  
**Product:** Scientific Graph AI **v1.0.0** / display **v1.0**  
**Authority:** Living SSOT [`docs/roadmaps/ROADMAP.md`](../../roadmaps/ROADMAP.md)

```text
CTR DECLARATION                    = COMPLETE
CTR                                = DECLARED
CTR CERTIFIED WITH EXPLICIT DISCLOSURES = IN FORCE
PRODUCT 1.0 — COMMERCIAL TEST READY  = DECLARED (Owner Gate)
≠ CTR RELEASED                     (v1.0.0 already RELEASED / VERIFIED — PP11)
≠ DEP-2 reopen
≠ cloud CERTIFIED
≠ AIR-1 CERTIFIED
≠ CRP program CLOSED as index
```

**Nomenclature (existing SSOT):** CRP records use **CTR DECLARE** / **NOT DECLARED**. The Owner Gate reserved **CTR CERTIFIED** for this separate act and forbade **CTR RELEASED**. GRC/DEP use **CERTIFIED WITH EXPLICIT WARNINGS / disclosures**. This record applies those terms; it does not invent `CTR RELEASED`.

**Trace:** PLAN → BUILD → PRODUCT FACE REVIEW → OWNER ACCEPTANCE → CTR DECLARATION (this record).

---

## A. CTR Declaration Context

| Field | Value |
|-------|--------|
| Version | **1.0.0** / display **v1.0** · tags `1.0.0` / `v1.0` · operational `package.json` **1.0.0** |
| Prior state | `CTR READY FOR FORMAL DECLARATION` · Owner Gate **ACCEPTED WITH DISCLOSURES** |
| Readiness | [`CRP-CTR-Readiness-Assessment.md`](./CRP-CTR-Readiness-Assessment.md) — COMPLETE · BUILD PASS — OWNER GATE READY |
| Entry validation | CTR Entry Validation Pack 2026-08-17 **PASS** (`tsc` · `validate:spe-1v-umbrella` 13/13 · `d65`–`d68` gates · `validate:ui-sidebar-architecture` 12/12 · `validate:workflow-unit` 15/15) |
| Product Face | **PRODUCT FACE REVIEW — PASS WITH OBSERVATIONS** (2026-08-18 · no BLOCKER) |
| Owner acceptance | [`CRP-CTR-Owner-Certification.md`](./CRP-CTR-Owner-Certification.md) — **OWNER GATE — ACCEPTED WITH DISCLOSURES** · `PRODUCT 1.0 — COMMERCIAL TEST READY` |

---

## B. CTR Decision

```text
CTR DECLARED
CTR CERTIFIED WITH EXPLICIT DISCLOSURES
```

Scientific Graph AI **v1.0.0** is formally **CTR DECLARED** on the evidence chain above and the Owner Gate of 2026-08-18.

This is **not** a new Release identity. PP11 **RELEASED / VERIFIED** and DEP-2 hosted execution remain the release/deploy authorities.

---

## C. Owner Conditions (preserved)

Unchanged from the Owner Gate. This declaration does **not** add conditions.

### Auth

Authentication entry only (`Iniciar sesión` / `Registrarse`).  
No cloud certification implied.

### Cloud

DEP-2 disclosures remain explicit.  
Cloud remains **NOT CERTIFIED**.  
RLS remains **DEFERRED**.  
G6 remains **OUT**.  
`biblioteca en nube` does not change DEP-2 scope.

### Scientific Assistant

Beta only.  
AIR-1 remains **DEFERRED / NOT CERTIFIED**.

---

## D. Scope Boundary

CTR **DECLARED** does **not** certify:

- Cloud
- RLS
- AIR-1
- D71
- CRP-6.4 implementation
- Phase 3
- ARCH-U
- COLLAB
- PLUGINS
- EXPORT-3
- marketplace / Lovable packaging
- v1.1 SemVer bump

These remain **DEFERRED / OUT / Owner-optional** as already classified. They are **not** opened as CTR residual debt by this record.

DEP-2 remains **CERTIFIED / CLOSED** with its existing disclosures. GRC-DECISION-002 remains **IN FORCE**.

---

## E. After this declaration

Per SPE-1.C, Commercial Test Ready is followed by **EXTERNAL COMMERCIAL TEST** (operational; not an implementation series).

Per living ROADMAP discipline: **no** product domain is selected here. Next living work, if any, is a **separate post-CTR planning / reorganization** act — not D71, CRP-6.4, Phase 3, AIR-1, COLLAB, PLUGINS, EXPORT-3, or v1.1.

CRP official-records remain the **index** (**OPEN** as directory). This declaration **closes the CTR checkpoint**, not the CRP folder.

---

## F. Freeze

- `src/**` — not modified
- validators / `package.json` / SemVer **1.0.0** — not modified
- SPE-1.C — not rewritten
- DEP-2 — not amended

---

## G. Official close

```text
CTR DECLARATION = COMPLETE
CTR = DECLARED
CTR CERTIFIED WITH EXPLICIT DISCLOSURES = IN FORCE
PRODUCT 1.0 — COMMERCIAL TEST READY
```
