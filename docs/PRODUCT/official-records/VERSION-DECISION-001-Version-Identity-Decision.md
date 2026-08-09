# Official Record

# VERSION-DECISION-001 — Version Identity Decision

**Domain:** PRODUCT — Version Identity  
**Decision ID:** **VERSION-DECISION-001**  
**Decision Title:** Version Identity Decision — Scientific Graph AI 1.0.0  
**Decision Date:** 2026-08-09  
**Execution Date:** 2026-08-09  
**Nature:** Formal Version Identity Establishment / Official Record — canonical product Version Identity only  
**Decision Authority:** **PROJECT OWNER / PRODUCT GOVERNANCE AUTHORITY**  
**Version Selection Authority:** **PROJECT OWNER / PRODUCT GOVERNANCE AUTHORITY**  
**Decision Status:** **DECIDED / CERTIFIED**  
**Effective Status:** **IN FORCE**

**Prerequisites:**

| Prerequisite | Status |
|--------------|--------|
| **PI-DECISION-001** — Product Identity | **DECIDED / CERTIFIED** · **IN FORCE** |
| **VAF-DECISION-001** — Version Authority / Format | **DECIDED / CERTIFIED** · **IN FORCE** |

---

## 1. Authority

```text
DECISION AUTHORITY:
PROJECT OWNER / PRODUCT GOVERNANCE AUTHORITY

VERSION SELECTION AUTHORITY:
PROJECT OWNER / PRODUCT GOVERNANCE AUTHORITY
```

This Official Record establishes the canonical Version Identity by **explicit** Project Owner / Product Governance Authority decision dated 2026-08-09.

```text
CANONICAL VERSION IDENTITY:
1.0.0
```

The evidence for the value **1.0.0** is this explicit governance decision.  
This record does **not** claim that `package.json`, Git tags, roadmap strings, or historical references independently established **1.0.0**.

This record does **not** invent a third-party grantor, organization, committee, or external approval that does not exist.

Authority precedence:

```text
PROJECT OWNER / PRODUCT GOVERNANCE AUTHORITY
        ↓
PRODUCT IDENTITY (PI-DECISION-001)
        ↓
VERSION AUTHORITY / FORMAT (VAF-DECISION-001)
        ↓
VERSION IDENTITY (VERSION-DECISION-001 — this Official Record)
        ↓
RELEASE CONTEXT (future — NOT ESTABLISHED)
        ↓
CERTIFICATION EVIDENCE (future binding — NOT ESTABLISHED)
        ↓
GLOBAL RELEASE CERTIFICATION (NOT EXECUTED)
        ↓
RELEASE DECISION (NOT AUTHORIZED)
```

---

## 2. Decision Summary

| Field | Value |
|-------|--------|
| **Product Identity** | **Scientific Graph AI** |
| **Product Identity Decision** | **PI-DECISION-001** |
| **Canonical Product Identifier** | **Scientific Graph AI** |
| **Version Format Decision** | **VAF-DECISION-001** |
| **Canonical Version Format** | **SEMANTIC VERSIONING (SemVer 2.0.0)** |
| **Version Identity** | **1.0.0** |
| **Display / Release Label** | **v1.0** |
| **Decision Status** | **DECIDED / CERTIFIED** |
| **Effective** | **IN FORCE** |

```text
VERSION IDENTITY: ESTABLISHED — 1.0.0
DISPLAY / RELEASE LABEL: v1.0
```

Per VAF-DECISION-001: the leading **`v`** is **not** part of the canonical Version Identity. Canonical identity is exactly **`1.0.0`**. Do not substitute `1.0`, `v1.0`, or any other string for the canonical identity.

---

## 3. Product Identity Binding

```text
Scientific Graph AI
        ↓
Version 1.0.0
        ↓
Release Context
        ↓
Certification Evidence
        ↓
Global Release Certification
```

| Binding | Value |
|---------|--------|
| Canonical Product Identifier | Scientific Graph AI |
| Product Identity Decision | PI-DECISION-001 |
| Version Identity Decision | VERSION-DECISION-001 |
| Version Identity | 1.0.0 |

This Decision does **not** reopen, modify, or supersede PI-DECISION-001 or VAF-DECISION-001.

---

## 4. Version Format

```text
CANONICAL VERSION FORMAT:
SEMANTIC VERSIONING (SemVer 2.0.0)
CITATION:
VAF-DECISION-001
```

Selected identity **1.0.0** conforms to SemVer 2.0.0 `MAJOR.MINOR.PATCH` with no pre-release identifier and no build metadata.

---

## 5. Version Semantics

```text
MEANING OF 1.0.0:
Formally established product Version Identity for Scientific Graph AI
under PROJECT OWNER / PRODUCT GOVERNANCE AUTHORITY.
```

Rationale (explicit authority + repository-present context; **not** a prior-release claim):

1. **Explicit selection** — PROJECT OWNER / PRODUCT GOVERNANCE AUTHORITY designated canonical Version Identity **1.0.0** and display/release label **v1.0**.
2. **Format compliance** — VAF-DECISION-001 established SemVer 2.0.0; **1.0.0** is a valid SemVer core version.
3. **Product Identity prerequisite** — PI-DECISION-001 is **IN FORCE** for **Scientific Graph AI**.
4. **No prior product SemVer release identity** — Repository evidence does not show an already-established prior public SemVer product Version Identity Official Record; this Decision is the first formal product Version Identity establishment.
5. **Maturity context (supporting only)** — Accumulated domain certifications and RELEASE domain architectural closure exist as supporting certification baseline references; they do **not** independently select **1.0.0** and do **not** equal Global Release Certification.

```text
1.0.0 DOES NOT AUTOMATICALLY MEAN:
PRODUCT RELEASED
GLOBAL RELEASE CERTIFIED
RELEASE DECISION EXECUTED
RELEASE CONTEXT ESTABLISHED
EVIDENCE BOUND
```

This Decision does **not** claim that **1.0.0** was previously released.  
This Decision does **not** fabricate external release history.

---

## 6. Repository Baseline

| Field | Value |
|-------|--------|
| **Repository** | `scientific-graph-ai` |
| **Branch** | `engine/p0-repository-preparation` |
| **Git commit (HEAD)** | `7e9ca2ac4475f8a1a82d70dfbe982ecef112f539` |
| **Commit subject** | `feat(product): establish product identity and version authority` |
| **Working tree at Decision** | **CLEAN** |
| **Git commit role** | **SUPPORTING BASELINE EVIDENCE** (not itself the Version Identity) |
| **Git tag** | **NOT CREATED** |

The Version Identity **1.0.0** is bound to the repository baseline observed at Decision Execution. The Git commit supports the baseline; the Official Record is authoritative for Version Identity.

Because the working tree was **clean** at establishment, Version Identity **1.0.0** may legitimately represent that baseline state for governance purposes. Uncommitted changes did not exist at Decision Execution.

---

## 7. Certification Baseline (reference only)

The following are **referenced** as existing certification / governance baselines. They are **not** rewritten and are **not** bound to Version **1.0.0** by this Decision:

| Baseline | Role |
|----------|------|
| PI-DECISION-001 | Product Identity **IN FORCE** |
| VAF-DECISION-001 | Version Authority / Format **IN FORCE** |
| RELEASE Domain Architecture | **CERTIFIED / CLOSED** (architecture only) |
| RELEASE-P0–P2 | **CERTIFIED / FROZEN** |
| UX-10 | **CERTIFIED / CLOSED WITH NON-BLOCKING FOLLOW-UPS** (historical; not reopened) |
| Domain RELEASE CERTIFIED packs (ENGINE, DATA, AI, PLUGINS, PERFORMANCE, UX, etc.) | Supporting domain maturity only |

```text
EVIDENCE BINDING:
NOT ESTABLISHED
(UNBOUND)
```

A future Release Context activity will determine which certification evidence belongs to Version **1.0.0**.

---

## 8. Release Scope

```text
RELEASE SCOPE (this Decision):
VERSION IDENTITY ESTABLISHMENT ONLY
```

In scope:

- Establish canonical Version Identity **1.0.0**
- Record display/release label **v1.0**
- Bind to repository baseline commit / branch
- Preserve Release / Evidence / GRC / Lovable boundaries

Out of scope:

- Release Context establishment
- Evidence binding
- Global Release Certification
- Release Decision Execution
- Lovable execution
- `package.json` synchronization
- Git tag creation
- Implementation / UI / Design System / architecture changes

---

## 9. package.json Policy

```text
package.json version:
NOT AUTHORITATIVE
CURRENT OPERATIONAL VALUE (unchanged):
0.1.0
```

Per VAF-DECISION-001, `package.json` must **not** independently create or override canonical Version Identity. This Decision does **not** modify `package.json` or `package-lock.json`.

Future synchronization of `package.json` to **1.0.0**, if required, is a **separate authorized implementation activity**.

---

## 10. Git Policy

| Artifact | Role |
|----------|------|
| Git commit `7e9ca2ac4475f8a1a82d70dfbe982ecef112f539` | **SUPPORTING BASELINE EVIDENCE** |
| Git tag | **NOT CREATED** |
| Git branch | Supporting context only; **NON-AUTHORITATIVE** as Version Identity |
| Working tree | Was **CLEAN** at Decision |

VAF-DECISION-001 does not require a Git tag as part of Version Identity establishment. The Official Record is authoritative.

---

## 11. Release Boundary

```text
RELEASE CONTEXT:
NOT ESTABLISHED

EVIDENCE BINDING:
NOT ESTABLISHED

GLOBAL RELEASE CERTIFICATION:
NOT EXECUTED

DECISION EXECUTION (Release):
NOT AUTHORIZED

Lovable:
NOT EXECUTED
```

The existence of Version Identity **1.0.0** must **not** be interpreted as a release declaration, Product Release, Production Release, or Global Release Certification.

---

## 12. Evidence Boundary

Current evidence remains **UNBOUND** / **NOT ESTABLISHED**.

This Decision does **not**:

- retroactively rewrite UX-10 or other domain certification artifacts;
- modify existing domain certification records;
- bind UX-10 or other domain certifications to Version **1.0.0**.

---

## 13. Lovable Boundary

```text
Lovable:
NOT EXECUTED

Screenshot Evidence:
STILL REQUIRED
```

This Decision provides **no** Lovable authorization.

---

## 14. Evidence References

| Reference | Use |
|-----------|-----|
| Explicit Project Owner / Product Governance Authority Version Identity Establishment instruction (2026-08-09) | **AUTHORITATIVE** selection of **1.0.0** / display **v1.0** |
| PI-DECISION-001 | Product Identity prerequisite |
| VAF-DECISION-001 | Format, authority, package.json / Git policies |
| Repository HEAD `7e9ca2ac4475f8a1a82d70dfbe982ecef112f539` | Supporting baseline |
| `package.json` `"0.1.0"` | Non-authoritative operational value (unchanged) |
| Roadmap / historical `1.0` language | Non-authoritative; not the selection evidence |
| Git tags | Non-authoritative; no SemVer product tag created |

---

## 15. Known Exceptions

| Item | Exception / note |
|------|------------------|
| `package.json` / `APP_VERSION` / `APP_DISPLAY_VERSION` still `0.1.0` | Intentional divergence; operational strings remain non-authoritative until a separate sync activity |
| Display label `v1.0` | Not the canonical Version Identity; canonical is `1.0.0` |
| Untracked historical absence of SemVer tags | Tag not created; not required by VAF for VI establishment |

---

## 16. Explicit Non-Decisions

This Decision does **not**:

- establish Release Context;
- establish Evidence Binding;
- execute Global Release Certification;
- authorize or execute Release Decision Execution;
- execute Lovable;
- modify `package.json` or `package-lock.json`;
- create a Git tag, commit, push, or PR;
- reopen or modify Product Identity / PI-DECISION-001;
- reopen or modify VAF-DECISION-001;
- reopen UX-10;
- rewrite domain certification artifacts;
- modify application implementation, UI, Design System, or architecture;
- claim that Version **1.0.0** was previously released or is now Product Released.

---

## 17. Change / Supersession Procedure

Any future change to the canonical Version Identity requires a **FORMAL VERSION IDENTITY DECISION** that produces a new Official Record and **explicitly supersedes** this Official Record (**VERSION-DECISION-001**).

Silent mutation of this record is forbidden.

Until supersession:

```text
VERSION-DECISION-001: IN FORCE
VERSION IDENTITY: 1.0.0
```

---

## 18. Implementation Impact

```text
NO APPLICATION IMPLEMENTATION CHANGES
```

Permitted artifacts for this Decision: PRODUCT Official Records under `docs/PRODUCT/official-records/` only.

---

## 19. Governance State (at Decision)

```text
Product Identity:
DECIDED / CERTIFIED / IN FORCE

Canonical Product Identifier:
Scientific Graph AI

Version Authority:
ESTABLISHED

Version Format:
ESTABLISHED — SemVer 2.0.0

Version Selection Authority:
ESTABLISHED

Version Identity:
ESTABLISHED — 1.0.0

Display / Release Label:
v1.0

Release Context:
NOT ESTABLISHED

Evidence Binding:
NOT ESTABLISHED

Global Release Certification:
NOT EXECUTED

Decision Execution (Release):
NOT AUTHORIZED

Lovable:
NOT EXECUTED
```

---

## 20. Certification Statement

**VERSION-DECISION-001** establishes the canonical Version Identity **1.0.0** (display/release label **v1.0**) for **Scientific Graph AI** under **PROJECT OWNER / PRODUCT GOVERNANCE AUTHORITY**, subordinate to **PI-DECISION-001** and **VAF-DECISION-001**, effective **IN FORCE** as of 2026-08-09, bound to repository baseline commit **7e9ca2ac4475f8a1a82d70dfbe982ecef112f539** on branch **engine/p0-repository-preparation**.

Release Context remains **NOT ESTABLISHED**. Global Release Certification remains **NOT EXECUTED**.

Next activity (requires separate authorization): **RELEASE CONTEXT — ESTABLISHMENT PLANNING**.
