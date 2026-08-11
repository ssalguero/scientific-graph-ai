# Official Record

# DEP-DECISION-001 — Option B: Real Supabase Env for Frozen 1.0.0

**Domain:** DEP — Deployment Execution  
**Decision ID:** DEP-DECISION-001  
**Date:** 2026-08-11  
**Status:** **IN FORCE**  
**Phase:** DEP-2 (**CERTIFIED / CLOSED**; this decision remains **IN FORCE**)  
**Planning Authority:** [`../DEP-Planning-Charter.md`](../DEP-Planning-Charter.md) (**FROZEN / IN FORCE**)  
**Prior records:** [`DEP-1-Deployment-Execution-Planning-Freeze.md`](./DEP-1-Deployment-Execution-Planning-Freeze.md) · [`DEP-2-Hosted-Deployment-Execution.md`](./DEP-2-Hosted-Deployment-Execution.md)

```text
OPTION B — APPROVED / IN FORCE
Revision: tags 1.0.0 / v1.0 @ f38cc6ff31c9ec77ae1edca79890df6f041366d2
Host: Vercel Production
G6: OUT OF SCOPE
RLS: UNVERIFIED / DEFERRED
Cloud readiness: NOT CERTIFIED
Source / Option C / new version / retag / amend / SHA change: NOT AUTHORIZED
```

---

## 1. Owner decision

**SELECT OPTION B.**

Continue DEP-2 on the frozen **1.0.0 / v1.0** revision:

**SHA:** `f38cc6ff31c9ec77ae1edca79890df6f041366d2`

**Decision:** Use the **real** Supabase project **URL** and **anon key** as **Vercel Production build-time** environment variables for this frozen SHA:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 2. Purpose

Make the frozen 1.0.0 binary operational enough to continue DEP-2 smoke validation and evaluate **G4 / G5 / G7 / G8**.

---

## 3. This decision DOES NOT

- certify Supabase/cloud readiness  
- certify RLS  
- reopen G6  
- certify cloud architecture  
- authorize source changes  
- authorize lazy/conditional Supabase work (Option C)  
- authorize a new version  
- authorize retagging/amending 1.0.0  
- authorize changes to the frozen SHA  

| Item | Disposition |
|------|-------------|
| **G6** | **OUT OF SCOPE** |
| **RLS** | **UNVERIFIED / DEFERRED** |
| Cloud readiness | **NOT CERTIFIED** |
| Option C | **NOT AUTHORIZED** |
| Source changes | **NOT AUTHORIZED** |
| New version / retag / amend / force-push | **NOT AUTHORIZED** |
| Frozen SHA change | **NOT AUTHORIZED** |

---

## 4. Explicit disclosure

The deployed application may operationally communicate with Supabase and its cloud graph library may function, but this is **NOT** a cloud-readiness or RLS certification.

---

## 5. Governance fences (unchanged)

| Fence | Status |
|-------|--------|
| PP0–PP11 | **CLOSED** |
| Production Approval | **CLOSED** (GRANTED remains historical; not reopened) |
| Repository Release | **CLOSED** |
| PRV | **CLOSED** |
| RELEASE | **CLOSED** |
| SDC-1 | **CLOSED** |
| DEP-1 | **FROZEN / IN FORCE** |
| DEP-2 | **CERTIFIED / CLOSED** (this decision enabled final smoke) |

---

## 6. Authorized subsequent actions (not executed by this record)

1. Obtain/use the existing authorized Supabase project URL and anon key.  
2. Inject them **only** into Vercel Production environment variables (build-time).  
3. Redeploy the **SAME** frozen SHA `f38cc6ff31c9ec77ae1edca79890df6f041366d2`.  
4. Do **not** create a new tag or version.  
5. Re-run DEP-2 smoke gates: **G4**, **G5**, **G7**, **G8** — **G6** remains **OUT OF SCOPE**.

---

## 7. This materialization turn

Documentation only. **No** Vercel env injection, redeploy, Supabase/RLS access, source changes, commits, push, or tag/version changes were performed by this record.

```text
DEP-DECISION-001 — IN FORCE
DEPLOY / smoke resume — NOT EXECUTED BY THIS RECORD
```

**End of Official Record — DEP-DECISION-001 IN FORCE**
