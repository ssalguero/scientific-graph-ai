# Domain migrations (PROD-2B)

Pure V1→V2 migration helpers. No React, no `.sgproj` I/O, no SCI engine calls.

## V1→V2 primary dataset id

**Migrator rule only — not part of the general V2 format contract.**

When migrating a legacy V1 project, the migrator assigns the primary dataset id deterministically as:

```text
{project.metadata.id}::primary
```

| Property | Meaning |
|----------|---------|
| Deterministic | Same V1 input always yields the same dataset id |
| Idempotent | Re-running migration on an already-migrated V2 project is a no-op |
| Scope | Applies to **V1→V2 migration** only |

Native V2 projects (created after multi-dataset wiring in B2+) may use any `ProjectDatasetV2.id` strategy, as long as ids are **unique and stable within the project**. The `::primary` suffix is **not** required for native V2 files.

Implementation: `toPrimaryDatasetId()` in `migrate-v1-to-v2.ts`.
