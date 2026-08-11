# DEP Planning Charter

**Artifact:** DEP Planning Charter (Deployment Execution)  
**Status:** **IN FORCE / FROZEN**  
**Date:** 2026-08-11  
**Role:** Planning Authority for the Deployment Execution program (DEP-1 onward)  
**Nature:** Post-release deployment planning constitution — does not reopen PP / Production Approval / Repository Release / PRV / RELEASE / SDC-1; does not itself deploy  
**Path:** `docs/DEP/DEP-Planning-Charter.md`

**Freeze record:** [`official-records/DEP-1-Deployment-Execution-Planning-Freeze.md`](./official-records/DEP-1-Deployment-Execution-Planning-Freeze.md)

---

## Verdict

DEP Planning converts the DRA conclusion (**NOT READY FOR DEPLOYMENT**) into Owner-frozen decisions that authorize **DEP-2 — Hosted Deployment Execution** without reopening certified product-release phases.

Constitutional motto:

> **Plan and authorize before host.**

```text
DEP-1 FROZEN / IN FORCE
  ≠ DEPLOY EXECUTED
  ≠ marketplace / Lovable publish
  ≠ reopen PP0–PP11 / Production Approval / Repository Release / PRV / RELEASE / SDC-1
  ≠ cloud-enabled / Supabase RLS claim (local-primary first deploy)
```

---

## 1. Immutable inputs

| Element | Value |
|---------|--------|
| Product | Scientific Graph AI |
| Version Identity | **1.0.0** / display **v1.0** |
| Repository release | **RELEASED / VERIFIED** (PP11) |
| Production Approval | **GRANTED** (PP10) |
| RELEASE / PRS / PRV / SDC-1 | **CLOSED** / **CERTIFIED** (cite only) |
| DRA | **NOT READY FOR DEPLOYMENT** (complete) — blockers DB-1 / DB-2 / DB-3 |
| DEPLOY evidence | **NOT EXECUTED — EVIDENCE GAP** until DEP-2 closes deploy only |

---

## 2. Owner freeze package (binding)

| ID | Decision | Owner disposition |
|----|----------|-------------------|
| **OD-1** | Hosting target | **APPROVED: Vercel** |
| **OD-2** | Deployment revision | **APPROVED:** tags **`1.0.0` / `v1.0`** → `f38cc6ff31c9ec77ae1edca79890df6f041366d2` — **not** `main` HEAD; no new version; no retag/amend |
| **OD-3** | Deployment profile | **APPROVED: local-primary** |
| **OD-4** | Supabase / RLS | **NOT REQUIRED** for DEP-2 local-primary; cloud-enabled = future separate gate |
| **OD-5** | Next phase | **APPROVED:** authorize **DEP-2 — Hosted Deployment Execution** |

### Local-primary first deployment claim (OD-3)

**IN claim:**

- Core Scientific Graph AI editor
- IndexedDB / local persistence
- `.sgproj` project persistence

**OUT of first deployment claim:**

- Supabase cloud graph functionality
- Production Supabase RLS verification (deferred; do not modify or verify RLS in DEP-2 local-primary)

---

## 3. Objective

Freeze the minimum decision set so DEP-2 may execute a first hosted production deployment of the certified **1.0.0 / v1.0** product surface on **Vercel**, under **local-primary** claims only, with defined env contract, smoke gate, and rollback — without product-code changes required by this Charter.

---

## 4. Architecture basis (cite)

- Next.js 16.2.6 App Router (`src/app/`); `npm run build` / `npm start`
- No API routes, middleware, `vercel.json`, Dockerfile, or deploy CI in-repo (intentional at freeze)
- Thin RSC shell + client editor; persistence = IndexedDB + `.sgproj`; Supabase optional/additive
- Env template: `.env.example` (`NEXT_PUBLIC_SUPABASE_*`, optional diagnostics)

---

## 5. Production environment contract (frozen for DEP-2)

| Variable | Profile | Class |
|----------|---------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Cloud-enabled only (OUT for local-primary claim) | Public / restricted credential |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cloud-enabled only (OUT for local-primary claim) | Public / restricted credential |
| `NEXT_PUBLIC_WORKSPACE_DIAGNOSTICS` | Optional; default **omit/off** in production | Public |
| Gate/dataset/Playwright paths | Local/CI only — **not** production host contract | Tooling |

**Injection:** host env UI only; rebuild required for `NEXT_PUBLIC_*`; never commit real secrets.  
**Forbidden:** service-role key in client/host app config.

---

## 6. DEP-2 execution sequence (authorized to run later; not by this freeze turn)

1. Clean checkout of frozen tags `1.0.0` / `v1.0` (`f38cc6f…`)  
2. Dependency install (`npm ci` or governed equivalent)  
3. Environment provisioning per local-primary posture  
4. `npm run build`  
5. Deploy to Vercel  
6. Smoke verification (local-primary gate)  
7. Rollback via prior Vercel deployment if gate fails  

---

## 7. DEP-2 validation gate (local-primary)

| ID | Check | Required |
|----|-------|----------|
| G1 | Production build succeeds | Yes |
| G2 | Runtime startup / host serves app | Yes |
| G3 | `/` availability | Yes |
| G4 | Critical graph workflow | Yes |
| G5 | IndexedDB and/or `.sgproj` persistence | Yes |
| G6 | Supabase cloud CRUD / `/graph/[id]` cloud claim | **OUT** |
| G7 | No unexpected console/runtime errors on smoke path | Yes |
| G8 | Env verification matches local-primary profile | Yes |

---

## 8. Observability / rollback (minimum)

- **Mandatory:** Vercel deploy/status + HTTP availability; recorded smoke; browser console check  
- **Recommended (non-blocking):** third-party error reporting  
- **Post-deploy enhancement:** APM / product telemetry (separate charter if needed)  
- **Rollback:** promote previous Vercel deployment; env fix → redeploy; never retag history  

---

## 9. Non-reopen fences

SHALL NOT reopen or rewrite:

- PP0–PP11  
- Production Approval  
- Repository Release  
- PRV  
- RELEASE  
- SDC-1  

Marketplace publish and Lovable publish remain **separate** Owner paths (still **NOT EXECUTED — EVIDENCE GAP**).

---

## 10. Scope / non-scope

**In scope:** DEP Official Records; freeze/authorization; DEP-2 procedure against frozen decisions.

**Out of scope unless separately authorized:** product features; UX; architecture refactor; app source changes; inventing hosting manifests in DEP-1; package.json/env/Supabase/RLS mutation for planning; opportunistic cleanup; OBS-1 / UXC-1 / AIR-1 / EXPORT-3.

---

## 11. Program status

| Phase | Status |
|-------|--------|
| DEP-1 | **FROZEN / IN FORCE** |
| DEP-DECISION-001 | **IN FORCE** (Option B) |
| DEP-2 | **CERTIFIED / CLOSED** (with disclosures: G6 OUT · cloud NOT CERTIFIED · RLS DEFERRED) |
| DEPLOY | **EXECUTED · EVIDENCE CLOSED** (deploy-only; marketplace/Lovable remain open gaps) |

**End of DEP Planning Charter**
