# SDC Planning Charter

**Artifact:** SDC Planning Charter (Scientific Delivery Continuity)  
**Status:** **IN FORCE / FROZEN**  
**Date:** 2026-08-11  
**Role:** Planning Authority for the Scientific Delivery Continuity program (SDC-1 onward)  
**Nature:** Post-v1.0 product-continuity constitution — does not reopen RELEASE / PRS / PP / GRC / PRV; does not rewrite historical PROD-3  
**Path:** `docs/SDC/SDC-Planning-Charter.md`

---

## Verdict

SDC Planning inherits the **v1.0.0 RELEASED / VERIFIED** baseline and **PRV-1 CLOSED · HANDOFF RECORDED** as immutable inputs. This Charter is the official planning artifact for Scientific Delivery Continuity under Owner-approved Continuity scope (**Option 1**). Official Records **cite** this Charter; they do not re-copy peer certification bodies.

Constitutional motto:

> **Continuity without rebuild.**

Central distinctions (binding):

```text
v1.0.0 RELEASED / VERIFIED
  ≠ PRV-1 CLOSED (handoff only)
  ≠ SDC-1 Scientific Delivery Continuity
  ≠ version bump to v1.1
  ≠ deploy / Lovable publish
  ≠ reopen RELEASE / PRS / PP / GRC / PRV / historical PROD-3
```

Reading order: Executive Summary → Objective → Scope → Authority → Baseline → Lifecycle → Phase Architecture → Validation → Version / Visibility → Future Work Boundary → Certification → Git Policy → Certification Status.

---

## 1. Executive Summary

**What SDC is.**  
SDC (Scientific Delivery Continuity) is the controlled post-v1.0 program that closes the scientific **import → validation → ImportReport → EXPORT-1/2** delivery loop by **auditing and certifying existing capability** rather than rebuilding interrupted historical epics.

**Why SDC exists.**  
After EXPORT-2 RELEASED, D38.4 / D44.5 named **PROD-1B Import Report** as the next epic. That epic was never Discovery/Certified as a living D-series after the UX track diverted; meanwhile ÉPICA B / ImportReport v2 landed in code. PRV-DECISION-001 required a **separately chartered** next cycle. SDC-1 is that charter under Continuity scope.

**State the project enters SDC from.**

| Field | Value |
|-------|--------|
| Version Identity | **1.0.0** / display **v1.0** |
| Repository release | **RELEASED / VERIFIED** — tip historically `f38cc6f…`; live `main` may advance with certified continuity docs only |
| GRC-DECISION-002 | **IN FORCE** (CERTIFIED WITH EXPLICIT WARNINGS) |
| RELEASE / PRS / PP | **CLOSED** / **COMPLETE** |
| PRV-1 | **CLOSED · HANDOFF RECORDED** |
| Scope lock | **Option 1 — Continuity** (Owner) |

---

## 2. Objective

> Audit existing Import Report / ÉPICA B against historical PROD-1B DoD, close residual gaps only (if any), validate the composed delivery loop, and certify continuity for **eligible for v1.1** — without rebuild, without EXPORT-3, without version bump, deploy, or Lovable publication.

---

## 3. Scope

### In scope

- SDC Planning Authority and Official Records under `docs/SDC/`
- Entry hygiene for D1 (`tsx` undeclared / PP-ISS-002 / R-07) as SDC-1.E
- Continuity audit vs historical PROD-1B DoD (cite archives; do not rewrite)
- Residual gap closure **only** when GAP FREEZE is non-empty
- Delivery-loop validation using **existing** validators
- Series certification and live status/roadmap banner sync
- Explicit **eligible for v1.1** language (bump deferred)

### Out of scope

- Rebuild ImportReport / replace ÉPICA B
- EXPORT-3 manuscript package
- AI runtime, PLUGINS loading, COLLAB realtime/CRDT
- Deploy / marketplace / Lovable publish
- UX-10 architecture unfreezes (D47 / Session / Recharts)
- Lint mega-cleanup (PP-ISS-001) unless SDC blocker
- Reopen RELEASE / PRS / PP / GRC / PRV / historical PROD-3 as living epic
- Forced `package.json` / tag bump as part of SDC closure

---

## 4. Authority

```text
Project Governance
        ↓
Certified Architecture
        ↓
GRC-DECISION-002 (IN FORCE)
        ↓
RELEASE Series CLOSED · PRS CLOSED · PP0…PP11 COMPLETE
        ↓
PRV-1 CLOSED · PRV-DECISION-001 (handoff)
        ↓
SDC Planning Charter (this file) — IN FORCE
        ↓
SDC Official Records
```

**Citation rule:** Official Records cite this Charter and frozen phase evidence; they do not invent expanded product scope.

---

## 5. Baseline (immutable inputs)

| Element | Value |
|---------|--------|
| Product version | **1.0.0** |
| Release tags | **1.0.0** + **v1.0** (untouched by SDC) |
| Historical next epic (archive) | PROD-1B Import Report (D38.4 / D44.5) |
| EXPORT-1 / EXPORT-2 | **RELEASED** — consume; do not reimplement |
| PROD-3 archive | Historical OPEN ≠ living reopen |

---

## 6. Lifecycle / Phase Architecture

```text
SDC-1.0  Plan Freeze / Charter
SDC-1.E  Entry Hygiene (D1)
SDC-1.1  Continuity Audit
SDC-1.2  Residual Gap Closure (only if GAP > 0)
SDC-1.3  Delivery Loop Validation
SDC-1.4  Series Certification
CLOSE    Official Record + eligible for v1.1
```

Git policy: **series checkpoint** at Owner-authorized close — not per microphase.

---

## 7. Validation principles

- Reuse existing `validate:*` surfaces
- Continuity may be established by **composed stage evidence**
- Do not invent a literal single-process E2E framework solely for optics
- Do not create “re-GRC”

---

## 8. Version / Visibility disposition (binding)

```text
eligible for v1.1  ≠  version bump executed
eligible for v1.1  ≠  deploy
eligible for v1.1  ≠  Lovable publication
```

Version bump and Lovable/deploy remain **separate Owner decisions**.

---

## 9. Future Work Boundary

Pointers only — **NOT AUTHORIZED BY SDC**:

OBS-1 · UXC-1 · AIR-1 · PLE-1 · PERF-D · DEP-1 · EXPORT-3 · architecture unfreezes

---

## 10. Certification Status

This Charter is **IN FORCE / FROZEN** upon SDC-1.4 certification of series **SDC-1 CERTIFIED / CLOSED**.

**End of SDC Planning Charter**
