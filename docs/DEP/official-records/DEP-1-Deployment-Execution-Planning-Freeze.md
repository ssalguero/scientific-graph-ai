# Official Record

# DEP-1 — Deployment Execution Planning Freeze & Authorization

**Domain:** DEP — Deployment Execution  
**Series / Phase:** DEP-1  
**Date:** 2026-08-11  
**Nature:** Planning freeze and DEP-2 authorization only — **NO DEPLOY · NO SOURCE CHANGES · NO HOSTING MANIFESTS · NO ENV/SUPABASE/RLS MUTATION**  
**Status:** **FROZEN / IN FORCE**  
**Planning Authority:** [`../DEP-Planning-Charter.md`](../DEP-Planning-Charter.md) (**IN FORCE / FROZEN**)

**Prerequisites (cite only; not reopened):**

- DRA — **NOT READY FOR DEPLOYMENT** (complete) — blockers DB-1 / DB-2 / DB-3  
- PP0…PP11 **COMPLETE** · Production Approval **GRANTED** · Repository Release **VERIFIED**  
- PRV-1 **CLOSED · HANDOFF RECORDED** · RELEASE **CLOSED** · SDC-1 **CERTIFIED / CLOSED**

```text
DEP-1 = Planning Freeze + DEP-2 Authorization
  ≠ Hosted deployment executed
  ≠ Cloud / Supabase / RLS verification
  ≠ Marketplace / Lovable publish
  ≠ Reopen PP / Production Approval / Repository Release / PRV / RELEASE / SDC-1
```

---

## 1. Purpose

Record Owner freeze of the DEP-1 Deployment Execution Planning Charter, close DRA blockers DB-1 / DB-2 for planning purposes under the approved local-primary profile, defer DB-3 (RLS) as not required for first deploy claim, and authorize **DEP-2 — Hosted Deployment Execution**.

---

## 2. Final status

```text
DEP-1 — FROZEN / IN FORCE
DEP-2 — AUTHORIZED
DEPLOY — NOT YET EXECUTED
```

---

## 3. Owner decisions (OD-1 … OD-5) — FROZEN

| ID | Topic | Owner decision |
|----|-------|----------------|
| **OD-1** | Hosting target | **APPROVED: Vercel** |
| **OD-2** | Deployment revision | **APPROVED:** certified release tags **`1.0.0` / `v1.0`** at SHA **`f38cc6ff31c9ec77ae1edca79890df6f041366d2`**. Do **not** deploy `main` HEAD. Do **not** create a new version. Do **not** retag or amend existing tags. |
| **OD-3** | Deployment profile | **APPROVED: local-primary** |
| **OD-4** | Supabase / RLS | **NOT REQUIRED** for DEP-2 local-primary. Do not modify or verify RLS in this phase. Cloud-enabled production = future separately governed gate. |
| **OD-5** | Next phase authorization | **APPROVED.** Authorize **DEP-2 — Hosted Deployment Execution**. |

### OD-3 claim boundary (binding)

**First hosted deployment claim INCLUDES:**

- Core Scientific Graph AI editor  
- IndexedDB / local persistence  
- `.sgproj` project persistence  

**First hosted deployment claim EXCLUDES:**

- Supabase cloud graph functionality (**OUT**)  
- Production Supabase RLS verification (**deferred**; remains unverified)  

### DRA blocker disposition under freeze

| Blocker | Disposition at DEP-1 freeze |
|---------|------------------------------|
| **DB-1** | **Resolved for planning** — target **Vercel** + DEP-2 procedure defined in Charter |
| **DB-2** | **Resolved** — DEP-1 **FROZEN / IN FORCE**; DEP-2 **AUTHORIZED** |
| **DB-3** | **Mitigated / deferred** for local-primary — RLS **not required** for DEP-2; still required before any cloud-enabled production claim |

---

## 4. Frozen deployment revision (confirmed)

| Field | Value |
|-------|--------|
| Tags | **`1.0.0`** + **`v1.0`** (annotated) |
| SHA | **`f38cc6ff31c9ec77ae1edca79890df6f041366d2`** |
| Meaning | PP11 repository release checkpoint / certified product identity |
| `main` HEAD | **OUT** of first deploy (may include post-release continuity docs only) |
| Retag / amend / new version | **FORBIDDEN** by OD-2 |

---

## 5. Frozen deployment profile (confirmed)

| Field | Value |
|-------|--------|
| Profile | **local-primary** |
| Host | **Vercel** |
| Cloud / Supabase claim | **OUT** |
| RLS work in DEP-2 | **NOT REQUIRED** / **NOT AUTHORIZED** under local-primary |

---

## 6. DEP-2 entry criteria (confirmed)

All of the following are **met** for DEP-2 entry (execution may begin when Owner/operators start DEP-2 work):

1. DEP-1 charter **FROZEN / IN FORCE** with OD-1…OD-5 recorded — **PASS** (this record)  
2. Owner **DEP-2 authorization** (OD-5) — **PASS**  
3. Cloud-enabled RLS checks — **NOT APPLICABLE** (local-primary)  
4. Written statement that cloud claims are **OUT** — **PASS** (§3 OD-3)  
5. Access to Vercel account + ability to inject env — **operator prerequisite** (ops readiness; not a planning gap)  
6. Frozen revision tags/SHA reachable — **PASS** (`1.0.0` / `v1.0` → `f38cc6f…`)  
7. No application source modification required to start procedure — **PASS** (procedure-only)

**DEP-2 may execute** the Charter §6 sequence and §7 smoke gate. This Official Record does **not** perform that execution.

---

## 7. Non-reopen fences (confirmed)

The following remain certified/closed and **SHALL NOT** be reopened by DEP-1 freeze or DEP-2 execution:

| Fence | Status preserved |
|-------|------------------|
| PP0–PP11 | **COMPLETE** / cite only |
| Production Approval | **GRANTED** / cite only |
| Repository Release | **VERIFIED** / cite only |
| PRV | **CLOSED · HANDOFF RECORDED** / cite only |
| RELEASE | **CLOSED** / cite only |
| SDC-1 | **CERTIFIED / CLOSED** / cite only |

Note: SDC-1 Future Work Boundary listed DEP-1 as **NOT AUTHORIZED BY SDC-1**. That remains historically true. DEP-1 is now authorized by **this separate Owner freeze**, not by SDC-1.

---

## 8. Scope executed this turn

| Action | Result |
|--------|--------|
| Mark DEP-1 FROZEN / IN FORCE | **DONE** |
| Record OD-1…OD-5 | **DONE** |
| Confirm DEP-2 entry criteria | **DONE** |
| Confirm frozen revision / local-primary / cloud OUT | **DONE** |
| Confirm non-reopen fences | **DONE** |
| Materialize DEP Planning Charter + this Official Record | **DONE** (docs only) |
| Deploy / vercel.json / Dockerfile / package.json / env / Supabase / RLS / install / source changes | **NOT PERFORMED** |

---

## 9. Next official phase

```text
Next official phase:
  DEP-2 — Hosted Deployment Execution
Status:
  AUTHORIZED
  NOT YET STARTED by this record
DEPLOY:
  NOT YET EXECUTED
```

DEP-2 SHALL:

- Check out frozen tags `1.0.0` / `v1.0` only  
- Deploy to **Vercel** under **local-primary** claim  
- Run smoke gate G1–G5, G7–G8 (G6 OUT)  
- Record deploy evidence to close the PP11 **DEPLOY** evidence gap (deploy only)  
- NOT claim cloud/Supabase readiness  
- NOT modify RLS  
- NOT reopen fences in §7  
- NOT execute marketplace or Lovable publish  

---

## 10. Authority cites (do not rewrite)

- `docs/DEP/DEP-Planning-Charter.md`  
- DRA Assessment (2026-08-11) — NOT READY FOR DEPLOYMENT  
- `docs/PRODUCTION/official-records/PP7-Security-and-Configuration-Readiness.md`  
- `docs/PRODUCTION/official-records/PP8-Deployment-and-Release-Readiness.md`  
- `docs/PRODUCTION/official-records/PP11-Release-Transition.md`  
- `docs/PRODUCTION/certification/RELEASE-VERIFIED.md`  
- `docs/SDC/official-records/SDC-1-Scientific-Delivery-Continuity.md`  
- `docs/PRODUCT/official-records/VERSION-DECISION-001-Version-Identity-Decision.md`

**End of Official Record — DEP-1 FROZEN / IN FORCE · DEP-2 AUTHORIZED · DEPLOY NOT YET EXECUTED**
