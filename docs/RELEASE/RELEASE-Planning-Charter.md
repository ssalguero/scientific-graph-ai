# RELEASE Planning Charter

**Artifact:** RELEASE Planning Charter  
**Status:** **RELEASE CERTIFIED / FROZEN**  
**Date:** 2026-08-08  
**Role:** Planning Authority for the RELEASE Planning Series (RELEASE-P0 onward) and any subsequent RELEASE-I\* under inherited project methodology  
**Nature:** Release-domain planning constitution only — does not recreate Scientific Graph AI project methodology  
**Path:** `docs/RELEASE/RELEASE-Planning-Charter.md`

---

## Verdict

RELEASE Planning inherits the RELEASE-CERTIFIED project methodology as **stable infrastructure**. This Charter is the **official planning artifact** for the RELEASE Domain. Official Records **cite** this Charter; they do **not** re-copy its constitutional freezes and principles.

Reading order: Executive Summary → Authority Precedence → Methodology → Identity → Ownership → Evidence Distinctions → Peer Baseline Pointer → Series Opening → Planning Rules → Certification.

---

## 1. Executive Summary

RELEASE is the **consolidation / release-authority layer** of Scientific Graph AI: the last authority that consumes certified peer evidence and determines whether the certified set may become a release.

Peers ENGINE, DATA, AI, COLLAB, PLUGINS, PERFORMANCE, and UX **build and certify** capabilities. RELEASE **does not replace** those certifications; it **consolidates** them as evidence for global readiness. RELEASE may **block or approve** promotion; it must **not** modify peer implementations.

Constitutional motto:

> **Consolidate without replacing.**

Central rule:

> **RELEASE does not replace domain certifications; it consolidates them as evidence for global readiness.**

This Charter freezes Planning Authority for the RELEASE series opening. It does **not** authorize code, `src/release/`, validators, CI gates, peer changes, ops-doc sync, product shipment, or RELEASE-I\*.

---

## Authority Precedence (immutable)

```
Project Governance
        ↓
Certified Architecture
        ↓
RELEASE Planning Charter
        ↓
RELEASE Official Records
```

**Citation formulas (stable):**

> **Planning Authority:** `docs/RELEASE/RELEASE-Planning-Charter.md` (RELEASE CERTIFIED / FROZEN)

or

> This Official Record is governed by the RELEASE Planning Charter and the Scientific Graph AI certified project methodology.

**Citation rule:** RELEASE identity, Owns / Never Owns, Peer Ownership Freeze, Evidence ≠ Certification ≠ Release, Series Opening (P0 / P1), No-Code Rule, No-Peer-Reopen, and I\* lock until Planning Certification are **defined once in this Charter**. Official Records reference them; they do not rewrite them unless a phase-specific delta is required. The Charter SHALL NOT be rewritten by Official Records.

---

## Methodology Inheritance

RELEASE Planning inherits certified project methodology as infrastructure. Official Records **cite** these authorities; they do **not** recreate them.

| Layer | Authority (SSOT) |
|-------|------------------|
| Constitution | [docs/governance/](../governance/) — PROJECT_PRINCIPLES, DOMAIN_BOUNDARIES, CERTIFICATION_FRAMEWORK, QUALITY_GATES, DECISION_FRAMEWORK, ARCHITECTURE_GOVERNANCE |
| Architecture | [docs/architecture/](../architecture/) — DOMAIN_MATRIX, DEPENDENCY_MATRIX, SYSTEM_INTERACTIONS, ARCHITECTURE_DECISIONS, ARCHITECTURAL_LAYERS, ARCHITECTURAL_PATTERNS |
| Vision seed | [MASTER ROADMAP V2](../roadmaps/MASTER%20ROADMAP%20V2.md) — domain list (RELEASE); **§29 Release Strategy** |
| Release Certification process | [CERTIFICATION_FRAMEWORK.md](../governance/CERTIFICATION_FRAMEWORK.md) — Release Certification (cite) |
| Peer freezes | ENGINE, DATA, AI, UX, COLLAB, PLUGINS, PERFORMANCE — immutable under RELEASE Planning (statuses registered in RELEASE-P0 Cross-Domain Baseline) |
| Method pattern | PERFORMANCE / PLUGINS / COLLAB Official Record template: Authority Precedence · Freeze ladder · Planning Finality · no-code during early P\* |
| **RELEASE Planning Authority** | **This RELEASE Planning Charter (RELEASE CERTIFIED / FROZEN)** |

**Conflict rule (inherited):** Architectural Decisions and certified peer domains prevail. RELEASE Planning never reopens ENGINE / DATA / AI / COLLAB / PLUGINS / PERFORMANCE / UX freezes. Within RELEASE planning, this Charter prevails over informal notes; certified Official Records prevail for their frozen phase content.

**Out of scope for this Charter:** recreating planning/certification/freeze/evidence/traceability methodology, generic Quality Gates, peer-domain ownership, or a full P2–P11 ladder.

---

## Documentation Layout

```
docs/RELEASE/
  RELEASE-Planning-Charter.md   # THIS ARTIFACT — Planning Authority (RELEASE CERTIFIED / FROZEN)
  official-records/             # RELEASE-P0 … (planning only; cite Charter)
```

- No `src/release/` (or equivalent) during RELEASE-P0 (and until separately authorized).
- No ROADMAP.md / PROJECT_STATUS.md sync during RELEASE-P0 — **DEFERRED**.
- Each Official Record: lean header (**Planning Authority citation** + Authority Precedence + freeze matrix) → phase-specific freezes → exit criteria. No methodology essays. No re-copy of Charter principles.

---

## 2. Identity

**Canonical identity:** Consolidation / Release-Authority Layer (RELEASE Domain).

RELEASE is **not** a product capability owner and **not** a functional peer that introduces end-user capabilities. It is the permanent last authority layer that:

- integrates peer certification evidence;
- evaluates release readiness;
- operates final release gates;
- records release identity, state, and decisions.

Motto:

> **Consolidate without replacing.**

---

## 3. Owns / Never Owns

### Owns (RELEASE SSOT — planning-level until later authorized phases)

- release readiness determination;
- evidence integration and consolidation for global readiness;
- final release gates (categories frozen in RELEASE-P0; criteria later);
- version / release identity (baseline naming in RELEASE-P0; machinery later);
- release certification checklist and release-state model;
- preparation / consolidation of release artifacts (baseline names in RELEASE-P0);
- promotion criteria ownership at the RELEASE layer;
- release traceability and final decision records;
- authority to **block or approve** promotion based on consolidated evidence.

### Peer Ownership Freeze (binding)

> **Certified peer domains exclusively own their responsibilities, public contracts, and semantics.**
>
> **RELEASE consumes peer certification as evidence. RELEASE does not absorb, replace, or rewrite peer certifications.**

### Never owns

- ENGINE workflow / Product Flows / functional logic;
- DATA scientific objects / truth / models;
- AI reasoning / intelligence behavior;
- COLLAB collaboration behavior;
- PLUGINS extensibility implementation;
- PERFORMANCE measurement/optimization ownership;
- UX design / interaction ownership;
- peer implementation changes of any kind.

RELEASE may **block or approve** a promotion. RELEASE must **not** implement or modify peer domains.

---

## 4. Evidence ≠ Certification ≠ Release

Frozen distinction:

| Term | Meaning |
|------|---------|
| **Evidence** | Objective artifacts (certs, gates, tests, validators, docs, limitations, checks) consumed by RELEASE |
| **Certification** | Domain- or level-scoped certified status for a peer or prior gate — necessary input, not global authorization |
| **Release** | Global decision that the certified set may become a release, under RELEASE gates and authority |

An isolated PASS, a single domain certification, or partial evidence **does not** authorize release.

---

## 5. Peer Baseline Pointer

Detailed current peer truth for RELEASE Planning is registered in:

> [`RELEASE-P0-Constitution-and-Domain-Baseline.md`](./official-records/RELEASE-P0-Constitution-and-Domain-Baseline.md) — **§ P0.8 Cross-Domain Baseline**

This Charter does not duplicate peer certification history. Peers are **immutable** under RELEASE Planning. RELEASE does not re-certify peers.

---

## 6. Series Opening

| Phase | Title | Authorization |
|-------|-------|----------------|
| **RELEASE-P0** | Constitution & Domain Baseline | Authorized by this Charter; materialized as Official Record |
| **RELEASE-P1** | Release Governance & Evidence Architecture | **NOT AUTHORIZED** by this Charter alone; requires separate authorization after P0 |

**No P2–P11 ladder is invented by this Charter.** Later phases, if any, require separate authorization and shall not be presumed by Official Records.

If an Implementation Series (RELEASE-I\*) is later authorized, **I\* remains LOCKED until Planning Certification** (or an equivalent certified planning unlock explicitly defined in a later authorized phase).

---

## 7. Planning Rules

Binding for RELEASE Planning under this Charter:

1. **No-Code** — no `src/release/`, runtime release machinery, versioning code, validators, or CI gates during RELEASE-P0; none until separately authorized.
2. **No-Peer-Reopen** — ENGINE, DATA, AI, COLLAB, PLUGINS, PERFORMANCE, UX freezes and packages SHALL NOT be altered under RELEASE Planning.
3. **I\* lock** — any future RELEASE-I\* remains locked until Planning Certification (or equivalent unlock) if an I-series is later authorized.
4. **Consume, do not invent** — RELEASE consumes peer evidence; it does not invent peer certifications.
5. **Ops sync deferred** — ROADMAP.md / PROJECT_STATUS.md synchronization is **DEFERRED** during RELEASE-P0.
6. **Cite architecture** — MASTER ROADMAP, DOMAIN_MATRIX, DEPENDENCY_MATRIX are cited, not rewritten by this series opening.

---

## 8. Certification Status

**RELEASE CERTIFIED / FROZEN** — 2026-08-08

This Charter is the immutable Planning Authority for the RELEASE Planning Series opening (P0; P1 by separate authorization). Official Records cite it; they SHALL NOT rewrite it.

| Item | State |
|------|-------|
| RELEASE Planning Charter | **RELEASE CERTIFIED / FROZEN** |
| RELEASE-P0 | Materialized under this Authority |
| RELEASE-P1 | **NOT AUTHORIZED** by this Charter alone |
| RELEASE-I\* | **LOCKED** (if later authorized — until Planning Certification unlock) |
| `src/release/` | **FORBIDDEN** |
| Peer domains | **IMMUTABLE** under RELEASE Planning |
| Product Release | **NOT AUTHORIZED** by this Charter |
| ROADMAP / PROJECT_STATUS sync | **DEFERRED** |
