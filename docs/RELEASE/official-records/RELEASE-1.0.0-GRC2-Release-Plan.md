# Official Record

# RELEASE-1.0.0-GRC2 — Release Plan (GRC-2 Execution Reference)

**Domain:** RELEASE — Consolidation / Release-Authority Layer  
**Artifact:** Release Plan (P0.7) — **GRC-2**  
**Release Identity:** **1.0.0** (display **v1.0**)  
**Release Context:** **RC-DECISION-002** — ESTABLISHED WITH EXPLICIT OPEN ITEMS · **IN FORCE**  
**GRC Authorization:** **GRC-AUTH-002** — **GRC-2 AUTHORIZED** · **IN FORCE**  
**Baseline:** `cace2820fa2f2a24c608eedf13f827b635198a0b`  
**Nature:** GRC-2 execution reference — planned release intent and scope under RC-DECISION-002  
**Status:** **ISSUED AS GRC-2 EXECUTION ARTIFACT**  
**Date:** 2026-08-10  
**Does not mutate:** RELEASE-1.0.0-Release-Plan.md (GRC-001 historical)

```text
THIS ARTIFACT DOES NOT REWRITE HISTORICAL CERTIFICATIONS.
IT DOES NOT AUTHORIZE PRODUCTION DEPLOYMENT, LOVABLE, CI/CD, OR PACKAGE PUBLISHING.
IT DOES NOT INHERIT GRC-DECISION-001 AS CERTIFICATION OF BASELINE cace282…
```

---

## 1. Intent

Execute Global Release Certification / Decision Execution (**GRC-2**) for Canonical Version Identity **1.0.0** of **Scientific Graph AI**, within Release Context **RC-DECISION-002**, against repository baseline **`cace2820fa2f2a24c608eedf13f827b635198a0b`**, consuming eligible domain and RELEASE architecture evidence — including durable **COLLAB I0–I10** as evaluable peer input — without re-certifying peers and without inheriting GRC-DECISION-001.

---

## 2. Scope

### In scope

| Item | Notes |
|------|--------|
| Evidence binding within RC-DECISION-002 §11 boundary | Permitted under GRC-AUTH-002 |
| Evaluation of all ten P0.6 gate categories | Cumulative; no invented extra gates |
| Production of P0.7 GRC-2 artifacts | Evidence Index, Gate Report, Certification, Final Decision, Release Notes |
| Classification of RC-002 open items | Resolve / Warning / Exclusion / Blocker as evidenced |
| Independent evaluation of COLLAB I0–I10 peer evidence | Domain PRODUCTION CERTIFIED ≠ global RELEASE CERTIFIED |
| Final Release Decision for identity 1.0.0 under RC-002 | Distinct from Production / RC / Lovable |

### Out of scope

| Item | Basis |
|------|--------|
| Implementation code changes | RC-002 §5; GRC-AUTH-002 |
| Production deployment / hosting / CI/CD | Domain Closure; RC-002 §5.3 |
| Package publishing / marketplace | RC-002 §5.3 |
| Lovable execution / screenshot corpus | RC-002 K6 |
| `package.json` / APP_VERSION sync to 1.0.0 | RC-002 K7 |
| Git tag creation | RC-002 K8 |
| Peer domain re-certification / reopen | Charter / RC-002 |
| Silent Release Context amendment | Forbidden |
| Inheritance of GRC-001 as certification of `cace282…` | GRC-AUTH-002 / Series Plan |

---

## 3. Included domains (inputs only)

ENGINE · DATA · AI · **COLLAB (I0–I10 durable; evaluable peer evidence; realtime/CRDT deferred)** · PLUGINS · PERFORMANCE · UX · RELEASE (architecture CLOSED; consolidation authority)

---

## 4. Gate evaluation policy (authorized for GRC-2)

Concrete numeric thresholds were never invented in RELEASE-P0–P2 (by design). Under Domain Closure §9 item 3 and **GRC-AUTH-002**:

1. Use P0.6 **category purpose** as the required condition.  
2. Bind only evidence eligible under RC-DECISION-002 §11.  
3. Treat domain RELEASE / PRODUCTION CERTIFIED packs as **consumable inputs**, not rewritten “certified for 1.0.0 global release” claims.  
4. Honor explicit EXCLUSIONS (do not treat as PASS).  
5. Preserve WARNINGS (do not silently promote to unconditional PASS).  
6. Report MISSING evidence explicitly.  
7. Independently evaluate COLLAB; do not inherit GRC-001 COLLAB exclusion framing as current-tree truth, and do not auto-upgrade COLLAB to global PASS.  
8. Do not require out-of-scope Production / Lovable / publishing evidence.

---

## 5. Required artifacts (this GRC-2)

| Artifact | Path |
|----------|------|
| Release Plan (this record) | `docs/RELEASE/official-records/RELEASE-1.0.0-GRC2-Release-Plan.md` |
| Release Evidence Index | `docs/RELEASE/certification/RELEASE-1.0.0-GRC2-Evidence-Index.md` |
| Release Gate Report | `docs/RELEASE/certification/RELEASE-1.0.0-GRC2-Gate-Report.md` |
| Release Certification | `docs/RELEASE/certification/RELEASE-1.0.0-GRC2-Certification.md` |
| Final Decision Record | `docs/RELEASE/official-records/GRC-DECISION-002-Final-Decision-Record.md` |
| Release Notes | `docs/RELEASE/certification/RELEASE-1.0.0-GRC2-Release-Notes.md` |

---

## 6. Success criteria

| Criterion | Target |
|-----------|--------|
| All ten P0.6 gates evaluated | Required |
| Evidence binding performed within RC-002 boundary | Required |
| Overall GRC-2 result explicit | Required |
| Global certification result explicit | Required |
| Final Decision status explicit (GRC-DECISION-002) | Required |
| Historical GRC-001 / RC-001 bodies untouched | Required |
| No deploy / publish / tag / package sync / Lovable | Required |

**End of Release Plan — RELEASE-1.0.0-GRC2**
