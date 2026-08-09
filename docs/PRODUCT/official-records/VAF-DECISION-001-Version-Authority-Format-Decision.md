# Official Record

# VAF-DECISION-001 — Version Authority / Format Decision

**Domain:** PRODUCT — Version Authority / Format  
**Decision ID:** **VAF-DECISION-001**  
**Decision Title:** Version Authority / Format Decision — Scientific Graph AI  
**Decision Date:** 2026-08-09  
**Execution Date:** 2026-08-09  
**Persistence Date:** 2026-08-09  
**Nature:** Formal Version Authority / Format Decision Official Record — authority and format policy only; **not** Version Identity selection  
**Decision Authority:** **PROJECT OWNER / PRODUCT GOVERNANCE AUTHORITY**  
**Decision Status:** **DECIDED / CERTIFIED**  
**Effective Status:** **IN FORCE**

**Prerequisite:** **PI-DECISION-001** — Product Identity **DECIDED / CERTIFIED** · **IN FORCE**

---

## 1. Authority

```text
DECISION AUTHORITY:
PROJECT OWNER / PRODUCT GOVERNANCE AUTHORITY
```

This Official Record persists the Version Authority / Format Decision already established by the project owner's Version Identity — Authority / Format Decision Execution instruction dated 2026-08-09 (Ask-mode decision content; durable write deferred to this record-write-only activity).

This record does **not** invent a third-party grantor, organization, committee, or external approval that does not exist.

Authority precedence for this subject:

```text
PROJECT OWNER / PRODUCT GOVERNANCE AUTHORITY
        ↓
PRODUCT IDENTITY (PI-DECISION-001)
        ↓
VERSION IDENTITY DECISION (VAF-DECISION-001 — this Official Record: authority + format only)
        ↓
RELEASE CONTEXT
        ↓
CERTIFICATION EVIDENCE
        ↓
GLOBAL RELEASE CERTIFICATION
        ↓
RELEASE DECISION
```

VAF-DECISION-001 remains **subordinate** to PI-DECISION-001.

---

## 2. Decision Summary

This Official Record establishes Version Authority, Version Selection Authority, and Canonical Version Format for Scientific Graph AI.

| Field | Value |
|-------|--------|
| **Product Identity** | **Scientific Graph AI** |
| **Product Identity Decision** | **PI-DECISION-001** |
| **Version Authority** | **PROJECT OWNER / PRODUCT GOVERNANCE AUTHORITY** |
| **Version Selection Authority** | **PROJECT OWNER / PRODUCT GOVERNANCE AUTHORITY** |
| **Canonical Version Format** | **SEMANTIC VERSIONING (SemVer 2.0.0)** |
| **Version Identity** | **NOT SELECTED** |

```text
STATUS: DECIDED / CERTIFIED
EFFECTIVE: IN FORCE

VERSION AUTHORITY: ESTABLISHED
VERSION FORMAT: ESTABLISHED — SemVer 2.0.0
VERSION SELECTION AUTHORITY: ESTABLISHED
VERSION IDENTITY: MISSING / NOT SELECTED
```

---

## 3. Product Identity Prerequisite

```text
CANONICAL PRODUCT IDENTIFIER:
Scientific Graph AI

PRODUCT IDENTITY DECISION:
PI-DECISION-001
STATUS: DECIDED / CERTIFIED / IN FORCE
```

This Decision does **not** reopen, modify, or supersede Product Identity or PI-DECISION-001.

Identity relationship preserved:

```text
Scientific Graph AI
        ↓
Version Identity
        ↓
Release Context
        ↓
Certification Evidence
        ↓
Global Release Certification
```

---

## 4. Version Authority Decision

```text
VERSION AUTHORITY:
PROJECT OWNER / PRODUCT GOVERNANCE AUTHORITY
STATUS: ESTABLISHED
```

This authority is solely responsible for the formal Version Identity decision for Scientific Graph AI.

The authority must operate through a durable PRODUCT Official Record. No external grantor or invented authority may establish Version Identity.

---

## 5. Version Selection Authority

```text
VERSION SELECTION AUTHORITY:
PROJECT OWNER / PRODUCT GOVERNANCE AUTHORITY
STATUS: ESTABLISHED
```

The authority may later select the actual Version Identity only through a separately authorized **VERSION IDENTITY — ESTABLISHMENT** activity producing a Version Identity Official Record.

This Decision does **not** itself select any Version Identity value.

---

## 6. Canonical Version Format Decision

```text
CANONICAL VERSION FORMAT:
SEMANTIC VERSIONING (SemVer 2.0.0)
STATUS: ESTABLISHED
```

### Format policy

| Rule | Policy |
|------|--------|
| Permitted syntax | `MAJOR.MINOR.PATCH` with optional pre-release and optional build metadata per SemVer 2.0.0 |
| Major / minor / patch semantics | **YES** — SemVer numeric identifiers and precedence |
| Pre-release identifiers | **PERMITTED** |
| Build metadata | **PERMITTED** |
| Build metadata and equality | Build metadata does **not** participate in Version Identity equality |
| Leading `v` prefix | **NOT** part of the canonical Version Identity string |
| Future release candidates | Represented as SemVer **pre-release** identifiers (e.g. `X.Y.Z-rc.N`) |

```text
EXPLICITLY NOT SELECTED BY THIS DECISION:
v1 · v1.0 · v1.0.0 · 1.0 · 1.0.0 · 0.1.0 · any other version value
```

---

## 7. package.json Policy

```text
package.json version:
NOT AUTHORITATIVE
```

| Rule | Policy |
|------|--------|
| Today | `package.json` version (currently operational/historical `0.1.0`) is **not** Version Identity |
| Future role | May become a **DERIVED** operational representation of the canonical Version Identity |
| Synchronization | Allowed **only after** a real Version Identity is formally established |
| Override rule | `package.json` must **never** independently create or override the canonical Version Identity |

This Decision does **not** modify `package.json` or `package-lock.json`.

---

## 8. Git Policy

| Artifact | Governance role |
|----------|-----------------|
| Git commit | **SUPPORTING BASELINE EVIDENCE** |
| Git tag | **DERIVED / SUPPORTING RELEASE MARKER** |
| Git branch | **NON-AUTHORITATIVE** |
| Working tree | **NON-AUTHORITATIVE** |

Future Version Identity must **not** be inferred merely from a commit or tag.

This Decision does **not** create a Git tag, commit, or push.

---

## 9. Authoritative Artifact

```text
AUTHORITATIVE ARTIFACT CLASS:
PRODUCT Official Record
LOCATION:
docs/PRODUCT/official-records/
THIS RECORD:
VAF-DECISION-001-Version-Authority-Format-Decision.md
```

Version Identity (when later selected) must also be established through a durable PRODUCT Official Record under this convention. That future record is **not** this Decision.

---

## 10. Decision Separation

```text
VERSION AUTHORITY / FORMAT DECISION
≠
VERSION IDENTITY ESTABLISHMENT
```

| Element | Status after this Decision |
|---------|----------------------------|
| Version Authority | **ESTABLISHED** |
| Version Format | **ESTABLISHED — SemVer 2.0.0** |
| Version Selection Authority | **ESTABLISHED** |
| Version Identity | **MISSING / NOT SELECTED** |
| Release Context | **NOT ESTABLISHED** |
| Evidence Binding | **UNBOUND** |
| Global Release Certification | **NOT EXECUTED** |
| Release Decision Execution | **NOT AUTHORIZED** |
| Lovable | **NOT EXECUTED** |

---

## 11. Version Identity Boundary

```text
VERSION IDENTITY:
NOT SELECTED
```

No actual version may appear as the selected Version Identity in this record.

Operational/historical values such as `package.json` `0.1.0`, `APP_VERSION` / `APP_DISPLAY_VERSION` `0.1.0`, and historical roadmap `1.0` / `1.0.0` / RC language remain **non-authoritative**.

---

## 12. Release Boundary

```text
RELEASE CONTEXT:
NOT ESTABLISHED

EVIDENCE BINDING:
UNBOUND

GLOBAL RELEASE CERTIFICATION:
NOT EXECUTED

RELEASE DECISION EXECUTION:
NOT AUTHORIZED
```

RELEASE DOMAIN ARCHITECTURE remains **CERTIFIED / CLOSED**. P0–P2 remain **CERTIFIED / FROZEN**. This Decision does **not** reopen RELEASE architecture and does **not** mean Product Version Released or Global Release Certified.

---

## 13. Evidence Boundary

Current evidence remains **UNBOUND**.

This Decision does **not** retroactively bind UX-10, RELEASE, PERFORMANCE, PLUGINS, DATA, GRAPH, or other domain certification artifacts to a version.

Version binding occurs only after a real Version Identity exists.

---

## 14. Lovable Boundary

```text
Lovable:
NOT EXECUTED

Screenshot Evidence:
STILL REQUIRED
```

This Decision provides **no** Lovable authorization.

---

## 15. Future Version Identity Record Model

A future Version Identity Official Record (separate establishment activity) must include at minimum:

- Decision ID;
- Product Identity;
- Canonical Product Identifier;
- Version Identity (selected only then);
- Version Format (SemVer 2.0.0 per this Decision);
- Decision Authority;
- Status;
- Effective date;
- Repository baseline;
- Git commit supporting the baseline;
- Release scope;
- Explicit non-decisions;
- Supersession / change procedure.

---

## 16. Explicit Non-Decisions

This Decision does **not**:

- select a Version Identity or any version value (`v1`, `v1.0`, `v1.0.0`, `1.0`, `1.0.0`, `0.1.0`, RC values, or any other version);
- establish Release Context;
- bind certification evidence to a version;
- execute Global Release Certification;
- authorize Release Decision Execution;
- execute Lovable;
- reopen or modify Product Identity / PI-DECISION-001;
- reopen UX-10;
- reopen RELEASE architecture;
- modify application implementation, Design System, AppShell, DATA, GRAPH, Session/Persistence, Performance, or RELEASE implementation;
- modify `package.json` or `package-lock.json`;
- create a Git tag, commit, or push;
- execute VERSION IDENTITY — ESTABLISHMENT.

---

## 17. Change / Supersession Procedure

Any future change to Version Authority, Version Selection Authority, or Canonical Version Format requires a **FORMAL VERSION AUTHORITY / FORMAT DECISION** that produces a new Official Record and **explicitly supersedes** this Official Record (**VAF-DECISION-001**).

Silent mutation of this record is forbidden.

Until supersession:

```text
VAF-DECISION-001: IN FORCE
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

Product Identity Decision:
PI-DECISION-001

Version Authority:
ESTABLISHED

Version Format:
ESTABLISHED — SemVer 2.0.0

Version Selection Authority:
ESTABLISHED

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

**VAF-DECISION-001** establishes Version Authority, Version Selection Authority, and Canonical Version Format (**SemVer 2.0.0**) for **Scientific Graph AI** under **PROJECT OWNER / PRODUCT GOVERNANCE AUTHORITY**, subordinate to **PI-DECISION-001**, effective **IN FORCE** as of 2026-08-09.

Version Identity remains **NOT SELECTED**.

Next activity (requires separate authorization): **VERSION IDENTITY — ESTABLISHMENT**.
