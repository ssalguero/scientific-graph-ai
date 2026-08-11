# Official Record

# DEP-2 — Hosted Deployment Execution

**Domain:** DEP — Deployment Execution  
**Series / Phase:** DEP-2  
**Date:** 2026-08-11  
**Nature:** First hosted production deployment of frozen **1.0.0 / v1.0** under DEP-1 + DEP-DECISION-001 Option B  
**Status:** **CERTIFIED / CLOSED** (with explicit disclosures)  
**Final gate:** Smoke G1–G5, G7–G8 **PASS** · G6 **OUT OF SCOPE**  
**Planning Authority:** [`../DEP-Planning-Charter.md`](../DEP-Planning-Charter.md) (**IN FORCE / FROZEN**)  
**Prior freeze:** [`DEP-1-Deployment-Execution-Planning-Freeze.md`](./DEP-1-Deployment-Execution-Planning-Freeze.md)  
**Owner decision:** [`DEP-DECISION-001-Option-B-Supabase-Env-for-Frozen-1.0.0.md`](./DEP-DECISION-001-Option-B-Supabase-Env-for-Frozen-1.0.0.md) (**IN FORCE**)

```text
DEP-2 CERTIFIED / CLOSED
  ≠ cloud readiness certified
  ≠ RLS certified
  ≠ G6 PASS
  ≠ Option C / source changes
  ≠ new version / retag / SHA change
  ≠ reopen PP0–PP11 / Production Approval / Repository Release / PRV / RELEASE / SDC-1
  ≠ marketplace / Lovable publish
```

---

## 1. Final disposition

```text
DEP-1 — FROZEN / IN FORCE
DEP-DECISION-001 — IN FORCE (Option B)
DEP-2 — CERTIFIED / CLOSED
DEPLOY — EXECUTED · EVIDENCE CLOSED (deploy-only; with disclosures)
Host — Vercel Production (scientific-graph-ai.vercel.app)
Revision — tags 1.0.0 / v1.0 @ f38cc6ff31c9ec77ae1edca79890df6f041366d2
```

**Disclosures (binding):**

| Item | Disposition |
|------|-------------|
| **G6** | **OUT OF SCOPE** |
| Cloud readiness | **NOT CERTIFIED** |
| **RLS** | **UNVERIFIED / DEFERRED** |
| Option B operational Supabase traffic | May function; **not** a certification claim |
| Option C | **NOT AUTHORIZED** by this closure |
| Source changes for this closure | **NOT AUTHORIZED** / **not performed** |

---

## 2. Frozen revision (unchanged)

| Field | Value |
|-------|--------|
| Tags | **`1.0.0`** + **`v1.0`** |
| SHA | **`f38cc6ff31c9ec77ae1edca79890df6f041366d2`** |
| Production redeploy under Option B | **SAME** frozen SHA — no source change, no retag, no version bump |

---

## 3. Execution history (summary)

| Stage | Result |
|-------|--------|
| DEP-2.E checkout + `npm ci` (worktree @ frozen SHA) | **PASS** |
| DEP-2.B omit-env build | **FAIL** (historical; superseded by Option A then Option B) |
| DEP2-B2 Owner Option A placeholder build | **PASS** (build only) |
| DEP2-B1 Vercel auth | Resolved by Owner/operator |
| Initial Vercel deploy (Option A placeholders) | DEPLOYED — NOT CERTIFIED (G7 FAIL on placeholder DNS) |
| DEP-DECISION-001 Option B | **IN FORCE** |
| Production redeploy with real `NEXT_PUBLIC_SUPABASE_*` | **SAME SHA** `f38cc6f…` |
| Smoke G1–G8 (final) | See §4 |

No application source modified under DEP-2. No Docker/`vercel.json` invented as a DEP-2 productization requirement. No Git tag/amend/force-push.

---

## 4. Final smoke gate results (authoritative)

| ID | Check | Result | Evidence notes |
|----|-------|--------|----------------|
| **G1** | Production build succeeds | **PASS** | Frozen SHA build under Production env |
| **G2** | Runtime/host serves application | **PASS** | Vercel Production serves app |
| **G3** | `/` loads successfully | **PASS** | Application availability |
| **G4** | Critical local graph workflow | **PASS** | Expression → plot `x^2` → edit to `x^2 + 1` → graph updated; **no cloud library required** |
| **G5** | Local persistence | **PASS** | Local project persistence / reopen path verified |
| **G6** | Supabase cloud graph claim | **OUT OF SCOPE** | Cloud readiness / RLS **NOT CERTIFIED** |
| **G7** | Console/runtime on smoke path | **PASS** | After Option B Production env + reload: no `local-primary-out.invalid` / `ERR_NAME_NOT_RESOLVED` blocking smoke |
| **G8** | Environment / runtime profile check | **PASS** | Expression edited `sin(x)` → `cos(x)`, graph updated; runtime showed **READY** |

**Authoritative first-deployment smoke:** **COMPLETE** for DEP-2 scope (G6 OUT).

---

## 5. DEPLOY evidence

| Claim | Disposition |
|-------|-------------|
| Hosted production deployment of frozen **1.0.0** | **EXECUTED** |
| PP11 historical certificate text (“DEPLOY: NOT EXECUTED — EVIDENCE GAP”) | **Cite-only / not rewritten** (tagged PP11 artifact unchanged) |
| Live DEPLOY evidence gap (deploy-only) | **CLOSED** by this DEP-2 record, with §1 disclosures |
| Marketplace / Lovable publish | Remain **NOT EXECUTED — EVIDENCE GAP** (separate Owner paths) |

---

## 6. Non-blocking observation (not a gate)

Observed UX/layout friction during operator smoke is recorded as a **non-blocking product/UX observation only**.  

**Not opened:** UX work series, application changes, Option C, or any remediation under this closure.

---

## 7. Non-reopen fences (confirmed)

PP0–PP11 · Production Approval · Repository Release · PRV · RELEASE · SDC-1 remain **CLOSED**.  
DEP-1 remains **FROZEN / IN FORCE**.  
Version Identity **1.0.0 / v1.0** and tags **untouched**.

---

## 8. Certification gates — final

```text
GATE DEP-2.E   ENTRY (checkout / install)     PASS
GATE DEP-2.B   BUILD (final Production)       PASS
GATE DEP-2.D   DEPLOY (Vercel, same SHA)      PASS
GATE DEP-2.V   SMOKE G1–G5,G7–G8              PASS
GATE G6        CLOUD CLAIM                    OUT OF SCOPE
GATE DEP-2.C   EVIDENCE / SERIES CLOSE        PASS
SERIES         DEP-2 CERTIFIED / CLOSED       PASS
DISCLOSURES    Cloud NOT CERTIFIED · RLS DEFERRED · G6 OUT   RECORDED
```

**End of Official Record — DEP-2 CERTIFIED / CLOSED · DEPLOY EVIDENCE CLOSED (with disclosures)**
