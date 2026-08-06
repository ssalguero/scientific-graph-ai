# DATA Boundary Enforcement (DATA-I8)

**Status:** ACTIVE (DATA-I8)  
**Authority:** DATA-P3 · DATA-P8 · DATA-P9 · `ARCHITECTURE.md` · `internal/boundary-policy.ts`  
**Gate:** `npm run validate:data-boundaries` · `npm run validate:data-boundary-unit`

This document records what is enforced for DATA domain boundaries after Integration (DATA-I7).  
It does **not** add capabilities, contracts, or scientific behavior.

---

## 1. Public surface (consumers)

| Allowed | Forbidden |
|---------|-----------|
| `@/data` | `@/data/model/**`, `@/data/metadata/**`, `@/data/processing/**` |
| `@/data/contracts` (+ subpaths) | `@/data/validation/**`, `@/data/repository/**` |
| | `@/data/integration/**`, `@/data/internal/**`, `@/data/public/**` (deep) |

ENGINE, UX, and other peers must not deep-import DATA internals.

---

## 2. Public barrel rules

`src/data/index.ts` may export:

- Contract types / catalogs from `contracts/`
- `configureData` / `getDataApi` / `DataPublicApi` from `public/`

It must **not** re-export managers, registries, lifecycle trackers, or `composeDataDomain`.

---

## 3. Dependency Direction (inside DATA)

Enforced statically for known forbidden edges (P2):

- Model ✕ Processing  
- Model ✕ Repository Services  
- Repository Services ✕ Processing  

Full graph lint may expand in DATA-I9 hardening.

---

## 4. API Freeze compliance

- Exactly six Capability Groups  
- Exactly six Contract Categories  
- Public catalog entries remain Public surface class  
- No new Capability Groups introduced by public barrel  

---

## 5. Transitional residuals (not removed in I8)

See `integration/MIGRATION.md` and `BOUNDARY_CLEANUP.md`.

| Residual | Owner |
|----------|--------|
| `@/lib/import` via ENGINE import adapter | Feedstock import science |
| `@/lib/project` via ENGINE project/export | Platform persistence |

These are **not** DATA Authoritative Registry paths.

---

## 6. Validators

| Script | Purpose |
|--------|---------|
| `validate:data-boundaries` | Layout, public barrel, import boundaries, API freeze, internal edges |
| `validate:data-boundary-unit` | Policy unit cases |
| `validate:data` | Aggregate DATA-I8 gate |

## 7. Runtime guarantees

See `RUNTIME_ENFORCEMENT_GUARANTEES.md`. Enforcement verifies certified architecture; it never reinterprets it.
