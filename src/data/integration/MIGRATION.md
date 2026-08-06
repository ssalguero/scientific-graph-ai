# DATA-I7 Migration Report — ENGINE → `@/data`

**Phase:** DATA-I7  
**Authority:** DATA-P3 / P4 / P7 · Architecture Freeze · API Freeze

## Objective

Retarget ENGINE scientific-data consumption to the certified public surface `@/data` / `@/data/contracts`.

## Retargeted

| Path | Before | After |
|------|--------|-------|
| `engine/coordination/data` | Placeholder ownership string | `@/data` via `configureData` / `getDataApi` / `registerDatasetWithData` |
| `engine/public/composition` (`configureEngine`) | ENGINE only | Also `ensureDataConfigured()` |
| `ImportCoordinator.importDataset` | lib import only | lib import science + DATA identity registration via `@/data` |
| DATA Integration Layer | Placeholder | Runtime facades for frozen Capability Groups |

## Transitional (intentionally not removed)

| Adapter | Reason |
|---------|--------|
| `coordination/import/lib-import-adapter` → `@/lib/import` | Import **science/parsing** feedstock not yet strangler-migrated into DATA; identity SSOT is DATA |
| `coordination/project/LocalProjectAdapter` → `@/lib/project` | **Persistence** is Platform/Sessions — not DATA ownership |
| `coordination/export/lib-project-export-adapter` | Export payload mechanics remain Platform/project feedstock |

These are **not** DATA scientific authority paths. Removal belongs to later feedstock cutover / I8 boundary enforcement — not I7.

## Consumer rules (verified by design)

ENGINE may import:

- `@/data`
- `@/data/contracts`

ENGINE must not import:

- `@/data/model/**`, `metadata/**`, `processing/**`, `validation/**`, `repository/**` (component paths), `integration/**`, `internal/**`

## Compatibility

- ENGINE Workflow / Command / Lifecycle **public Product Flow API unchanged**
- DATA Capability Groups / Contract Categories **unchanged**
- No new public capabilities invented

## Diagnostics

- DATA: `IntegrationLayer.diagnostics`
- ENGINE: uses DATA public `DataResult` outcomes for registration/publish helpers
