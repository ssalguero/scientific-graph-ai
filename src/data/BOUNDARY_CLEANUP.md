# DATA-I8 Boundary Cleanup Report

**Phase:** DATA-I8  
**Nature:** Inventory + controlled non-removal of transitional dual-paths

## Cleanup performed

| Item | Action |
|------|--------|
| Boundary policy SSOT | Added `internal/boundary-policy.ts` |
| Import/public/API validators | Added `scripts/validate-data-boundaries.ts` |
| Unit policy suite | Added `src/data/__tests__/boundary-enforcement.cases.ts` |
| Enforcement docs | Added `BOUNDARY_ENFORCEMENT.md` |

## Intentionally retained (roadmap transitional)

| Path | Why retained |
|------|----------------|
| `engine/coordination/import/lib-import-adapter.ts` | Import science feedstock; identity already via `@/data` |
| `engine/coordination/project/LocalProjectAdapter.ts` | Platform persistence — not DATA ownership |
| `engine/coordination/export/lib-project-export-adapter.ts` | Export mechanics — Platform/project |

Mass deletion of these adapters is **out of scope** for DATA-I8 (belongs to later feedstock cutover / hardening evidence, not Architecture redesign).

## Violations found requiring code change

None at I8 open — consumer imports of `@/data` are limited to the public surface via ENGINE coordination/data.

## Next gate

DATA-I9 — Hardening & reserved Quality Gates activation.
