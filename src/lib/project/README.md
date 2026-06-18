# PROD-2A — Scientific Project File Core

Local `.sgproj` persistence for the scientific workspace.

## File envelope

```json
{
  "kind": "scientific-graph-ai.project",
  "schemaVersion": 1,
  "appVersion": "0.1.0",
  "exportedAt": "ISO-8601",
  "project": { ... ScientificProjectV1 ... }
}
```

## ScientificProjectV1 blocks

| Block | Persists |
|-------|----------|
| `metadata` | id, name, timestamps |
| `dataset` | `ExperimentalSeries[]`, `ImportedDatasetInfo` |
| `importProvenance` | `ImportReport`, preserve-on-reimport flag |
| `analysisConfig` | visibility toggles, modes, selections, legend |
| `workflow` | `GuidedWorkflowSession` (SCI-59) |
| `comparison` | SCI-58 slot profiles A/B (KPI snapshots) |
| `workspace` | section, inspector, enabled modules |
| `graphContext` | math curves + axis config (optional) |

**Not persisted:** SCI-53→60 outputs, `useMemo` analyses, PDF, wizard state, Supabase graph list.

## Module layout

| Phase | Deliverable |
|-------|-------------|
| F0 | contracts, keys, fixtures |
| F1 | types, parse, validate, migrate |
| F2 | serialize |
| F3 | hydrate, sanitize |
| F4 | GraphEditor boundary + UX |
| F5 | E2E Playwright gate |
| F6 | UX hardening, user messages, final gate |

## UI (F4/F6)

Sidebar **Proyecto científico**:

- Inline project name (no native `prompt`)
- Inline discard confirmation when dirty (no native `confirm`)
- Status banner: success / warning / error with dismiss
- Extension guard: only `.sgproj` on open

## Error recovery (`userMessages.ts`)

- Sniffs JSON kind: `sgproj` | `graph-json` | `invalid-json` | `unknown-json`
- Maps parse/migrate codes to Spanish messages
- Suggests **Importar JSON** when a math graph file is selected by mistake

## Key files

- `keys.ts` — `VISIBILITY_KEYS_V1` (58), modules, workflow subset
- `serialize.ts` — `normalizeProjectSnapshot`, `serializeProject`
- `sanitize.ts` — selection/workflow/workspace/comparison sanitizers
- `hydrate.ts` — `hydrateProjectJson`, `buildHydrateProjectPatch`
- `userMessages.ts` — user-facing open/save errors
- `src/app/projectPersistence.ts` — collect / apply boundary
- `src/app/ProjectScientificFilePanel.tsx` — sidebar UX

## Fixtures

- `scripts/fixtures/project-v1-empty.sgproj`
- `scripts/fixtures/project-v1-dataset5-minimal.sgproj`

## Validation

```bash
npm run validate:prod2a-f0      # envelope + keys
npm run validate:prod2a-unit    # F1–F3 domain unit tests
npm run validate:prod2a-f6      # F6 edge cases + user messages
npm run validate:prod2a         # F5 E2E save/reload (Playwright)
npm run validate:prod2a-gate    # full PROD-2A gate (F6 closure)
```

Requires `DATASET5_PATH` / `DATASET6_PATH` for E2E and baseline steps (defaults to Desktop paths).

## Architecture notes

- `ScientificProjectV1` is the single source of truth
- `HydrateProjectPatch` is the domain↔UI contract
- No scientific logic in `src/lib/project/`
- No inverse deps: SCI/workflow → project
- Apply order: ephemeral reset → dataset → graph → analysis → selections → comparison/workflow → workspace → `generateGraph(curveSource)`
