# Official Record

# PI-DECISION-001 — Product Identity Decision

**Domain:** PRODUCT — Whole-Product Identity  
**Decision ID:** **PI-DECISION-001**  
**Decision Title:** Product Identity Decision — Scientific Graph AI  
**Decision Date:** 2026-08-09  
**Execution Date:** 2026-08-09  
**Nature:** Formal Product Identity Decision Execution / Official Record — whole-product identity establishment only  
**Decision Authority:** **PROJECT OWNER / PRODUCT GOVERNANCE AUTHORITY**  
**Decision Status:** **DECIDED / CERTIFIED**  
**Effective Status:** **IN FORCE**

---

## 1. Authority

```text
DECISION AUTHORITY:
PROJECT OWNER / PRODUCT GOVERNANCE AUTHORITY
```

This Decision is authorized by the project owner through an explicit Product Identity Decision Execution instruction dated 2026-08-09.

This record does **not** invent a third-party grantor, organization, committee, or external approval that does not exist.

Authority precedence for this subject:

```text
Project Owner / Product Governance Authority
        ↓
PI-DECISION-001 (this Official Record)
        ↓
Future Version Identity / Release Context (separate authorization)
```

---

## 2. Decision Summary

This Official Record establishes exactly **one** authoritative whole-product identity for the product.

| Field | Value |
|-------|--------|
| **Product Display Name** | **Scientific Graph AI** |
| **Product / Brand Name** | **Scientific Graph AI** |
| **Canonical Product Identifier** | **Scientific Graph AI** |
| **Technical Slug** | `scientific-graph-ai` |
| **Repository Name** | `scientific-graph-ai` |
| **Package Name** | `scientific-graph-ai` |

```text
STATUS: DECIDED / CERTIFIED
EFFECTIVE: IN FORCE
```

This Product Identity is the authoritative baseline prerequisite for future Version Identity governance.

---

## 3. Canonical Product Identifier

```text
CANONICAL PRODUCT IDENTIFIER:
Scientific Graph AI
```

The Canonical Product Identifier is **explicit**, **selected**, and **in force**.

It is **not**:

- MISSING
- AMBIGUOUS
- NOT SELECTED
- the technical slug
- the repository name
- the package name
- a version identifier
- a certification ID

---

## 4. Technical Identity Relationship

```text
Canonical Product Identifier: Scientific Graph AI
        └── technical representation: scientific-graph-ai
```

| Technical field | Value | Role |
|-----------------|--------|------|
| Technical Slug | `scientific-graph-ai` | Technical representation of the Canonical Product Identifier only |
| Repository Name | `scientific-graph-ai` | Repository identity; preserve for compatibility |
| Package Name | `scientific-graph-ai` | npm package name; preserve for compatibility |

The technical slug is **not** itself the Canonical Product Identifier.

This Decision does **not** rename the repository, rename the package, or modify `package.json`.

---

## 5. Identity Relationship Map

```text
Scientific Graph AI
        │
        ├── Product Display Name
        ├── Product / Brand Name
        └── Canonical Product Identifier
                │
                └── technical representation:
                    scientific-graph-ai
                    (repository / package: scientific-graph-ai)

Scientific Assistant Platform:
AI DOMAIN IDENTITY ONLY
```

| Identity facet | Value |
|----------------|--------|
| Display Name | Scientific Graph AI |
| Brand Name | Scientific Graph AI |
| Canonical ID | Scientific Graph AI |
| Technical Slug | scientific-graph-ai |
| Repository | scientific-graph-ai |
| Package | scientific-graph-ai |

---

## 6. Candidate Resolution

| Candidate | Status | Role |
|-----------|--------|------|
| **Scientific Graph AI** | **SELECTED** | Authoritative whole-product Display / Brand / Canonical Product Identity |
| **scientific-graph-ai** | **SELECTED AS TECHNICAL SLUG** | Technical representation only |
| **Scientific Graph Platform** | **NOT AUTHORITATIVE PRODUCT IDENTITY** | Legacy / competing historical UI terminology; future alignment only; must not remain an alternative authoritative whole-product identity |
| **Scientific Assistant Platform** | **DOMAIN-SCOPED ONLY** | AI / Assistant domain identity; **not** the whole-product identity |

---

## 7. AI Domain Identity Boundary

```text
AI Domain Identity:
Scientific Assistant Platform — DOMAIN ONLY
```

`Scientific Assistant Platform` remains valid only as an AI / assistant domain identity. It does **not** supersede, equal, or compete with the whole-product Canonical Product Identifier **Scientific Graph AI**.

---

## 8. Immutability Rule

```text
Canonical Product Identifier: IMMUTABLE BY DEFAULT
Product / Brand Name: STABLE
Product Display Name: STABLE
```

Do **not** change the Canonical Product Identifier because of:

- version changes;
- release changes;
- package changes;
- repository changes;
- UI redesign;
- Lovable;
- domain changes.

---

## 9. Change Procedure

Any future whole-product identity change requires a **FORMAL PRODUCT IDENTITY DECISION** that produces a new Official Record.

Technical slug, repository name, and package name: **PRESERVE FOR COMPATIBILITY** unless a future formal Decision explicitly requires change.

Silent mutation of this record is forbidden.

---

## 10. Supersession Rule

A future Decision must **explicitly supersede** this Official Record (**PI-DECISION-001**) rather than silently replacing it.

Until supersession:

```text
PI-DECISION-001: IN FORCE
```

---

## 11. Evidence Basis

| Item | Role |
|------|------|
| Project owner explicit Decision Execution instruction (2026-08-09) | Decision authorization and selected identity values |
| Prior Product Identity Assessment / Reconstruction planning | Gap evidence that a reconstructable prior Decision Execution was not durable; this Decision is a **new** formal execution |
| Operational branding / package / repo slug | Supporting technical continuity only; not prior authority |
| This Official Record | Authoritative durable evidence of the Decision |

Failed reconstruction of any earlier claimed Decision Execution is **not** authoritative. This record is the authoritative Product Identity Decision.

---

## 12. Explicit Non-Decisions

This Decision does **not**:

- select a Version Identity or any version value (`v1`, `v1.0`, `1.0.0`, RC, build/release numbers);
- establish Release Context;
- perform Global Release Certification;
- authorize Release Decision Execution;
- execute Lovable;
- reopen UX-10;
- modify application implementation, Design System, AppShell, DATA, GRAPH, Session/Persistence, Performance, or export behavior;
- rename repository, package, or technical slug;
- modify `package.json`.

---

## 13. Version Identity Boundary

```text
VERSION IDENTITY:
MISSING / NOT SELECTED
```

Product Identity (this record) is the prerequisite for a future Version Identity Decision. Version Identity remains **not selected**.

---

## 14. Release Boundary

```text
RELEASE CONTEXT:
NOT ESTABLISHED

GLOBAL RELEASE CERTIFICATION:
NOT EXECUTED

Decision Execution (Release):
NOT AUTHORIZED
```

---

## 15. Lovable Boundary

```text
Lovable:
NOT EXECUTED

Screenshot Evidence:
STILL REQUIRED
```

---

## 16. UX-10 Non-Reopening Linkage

UX-10 remains:

```text
UX-10:
CERTIFIED / CLOSED WITH NON-BLOCKING FOLLOW-UPS
```

UX-10 certification artifacts that historically freeze Product Identity as **AMBIGUOUS / NOT EXECUTED** and Canonical Product Identifier as **MISSING** are preserved as **historical certification state** as of UX-10 certification. This Decision does **not** rewrite those historical statements and does **not** reopen UX-10.

Governance linkage (non-reopening):

```text
UX-10 (historical): Product Identity AMBIGUOUS / NOT EXECUTED
        ↓ (superseding whole-product identity decision — separate authority)
PI-DECISION-001 (IN FORCE): Product Identity DECIDED / CERTIFIED
```

---

## 17. GRCA-1 Boundary

GRCA-1 remains **PLAN / PLANNING ONLY**. It did not establish Version Identity, Release Context, or Global Release Certification. This Decision does not convert GRCA-1 into an execution record.

---

## 18. Implementation Impact

```text
NO APPLICATION IMPLEMENTATION CHANGES
```

Permitted artifacts for this Decision: Product Identity Official Records under `docs/PRODUCT/official-records/` only.

---

## 19. Governance State (at Decision)

```text
UX-10:
CERTIFIED / CLOSED WITH NON-BLOCKING FOLLOW-UPS

Product Identity:
DECIDED / CERTIFIED

Product Display Name:
Scientific Graph AI

Product / Brand Name:
Scientific Graph AI

Canonical Product Identifier:
Scientific Graph AI

Technical Slug:
scientific-graph-ai

Repository Name:
scientific-graph-ai

Package Name:
scientific-graph-ai

AI Domain Identity:
Scientific Assistant Platform — DOMAIN ONLY

Version Identity:
MISSING / NOT SELECTED

Release Context:
NOT ESTABLISHED

Evidence Binding:
UNBOUND

Global Release Certification:
NOT EXECUTED

Decision Execution (Release):
NOT AUTHORIZED

Lovable:
NOT EXECUTED
```

---

## 20. Certification Statement

**PI-DECISION-001** establishes the authoritative whole-product Product Identity **Scientific Graph AI** under **PROJECT OWNER / PRODUCT GOVERNANCE AUTHORITY**, effective **IN FORCE** as of 2026-08-09.

Next activity (requires separate authorization): **VERSION IDENTITY — DECISION / ESTABLISHMENT**.
