# UX-10 — Validator Evidence Index

**Assessment date:** 2026-08-08  
**Battery:** P0.6 certification execution (read-only)  
**Rule:** Failures not repaired. Classifications require evidence.

Classification values: `PASS` · `PRE-EXISTING FAILURE` · `P0-INTRODUCED FAILURE` · `UNKNOWN` · `NOT RUN`

---

## Battery results

### `npm run validate:ui-architecture`

| Field | Value |
|-------|--------|
| **Result** | FAIL (36/37) |
| **Classification** | **PRE-EXISTING FAILURE** |
| **Evidence** | Failed case `no.new.icon.libraries`. `lucide-react` present in `HEAD:package.json` (`^1.28.0`). `package.json` not modified by P0 (`git diff --name-only HEAD -- package.json` empty). |

### `npm run validate:workspace-architecture`

| Field | Value |
|-------|--------|
| **Result** | FAIL (22/26) |
| **Classification** | **PRE-EXISTING FAILURE** |
| **Evidence** | Failed: `workspace.files.exact`, `governance.workspace.singleMainOwner`, `workspace.tokens.frozen.shape`, `governance.workspace.tokensOnly`. Failures target historical workspace tree shape / AppShell `<main>` ownership / frozen token string expectations superseded by UX-I3+ evolution. P0 only changed presentation classes in `WorkspaceContent.tsx` (+8/−4); did not add workspace modules or alter `WorkspaceTokens.ts` / `tokens.ts`. |

### `npm run validate:graph-rendering-unit`

| Field | Value |
|-------|--------|
| **Result** | PASS |
| **Classification** | **PASS** |
| **Evidence** | Exit 0; `"phase": "graph-rendering-unit", "pass": true`. |

### `npm run validate:graph-interaction-unit`

| Field | Value |
|-------|--------|
| **Result** | PASS |
| **Classification** | **PASS** |
| **Evidence** | Exit 0; `"phase": "graph-interaction-unit", "pass": true`. |

### `npm run validate:graph-axes-unit`

| Field | Value |
|-------|--------|
| **Result** | PASS |
| **Classification** | **PASS** |
| **Evidence** | Exit 0; `"phase": "graph-axes-unit", "pass": true`. |

### `npm run validate:graph-series-unit`

| Field | Value |
|-------|--------|
| **Result** | PASS |
| **Classification** | **PASS** |
| **Evidence** | Exit 0; `"phase": "graph-series-unit", "pass": true`. |

### `npm run validate:chart-viewport`

| Field | Value |
|-------|--------|
| **Result** | PASS |
| **Classification** | **PASS** |
| **Evidence** | Exit 0; `"phase": "chart-viewport-unit", "pass": true` (9 cases). |

### `npm run validate:export1-chart-export-unit`

| Field | Value |
|-------|--------|
| **Result** | PASS |
| **Classification** | **PASS** |
| **Evidence** | Exit 0; `validate-export1-chart-export-unit: 11 checks PASS`. |

### `npm run validate:visual-graph-builder-render-unit`

| Field | Value |
|-------|--------|
| **Result** | PASS |
| **Classification** | **PASS** |
| **Evidence** | Exit 0; `"phase": "visual-graph-builder-render-unit", "pass": true`. |

### `npm run validate:prod2c-c7-visual-graph-ui`

| Field | Value |
|-------|--------|
| **Result** | PASS |
| **Classification** | **PASS** |
| **Evidence** | Exit 0; `"phase": "prod-2c-c7-visual-graph-ui", "pass": true` (12/12). |

### `npm run validate:prod2e-data3b-gate`

| Field | Value |
|-------|--------|
| **Result** | FAIL |
| **Classification** | **PRE-EXISTING FAILURE** |
| **Evidence** | Functional nested units PASS (heatmap/bubble/pca units, golden fixtures, prod2c-c8). Failures: governance roadmap/plan/status/api-freeze doc checks; nested `visual-graph-builder-unit` case `scatter.amend.api-freeze-prerequisite` (doc `PROJECT_DISCOVERY_PROD_3.md` **MISSING** in repo); nested `typescript` errors only in `scripts/validate-performance-gates.ts`, `src/data/internal/registry/interaction.ts`, `src/ui/visibility-*` / `visual-integration/*` — **none** in P0 modified files. |

### `npm run validate:prod2e-d26-heatmap-perf`

| Field | Value |
|-------|--------|
| **Result** | PASS |
| **Classification** | **PASS** |
| **Evidence** | Exit 0; medianMs 0.0689; documental note. |

### `npm run validate:prod2e-d27-bubble-perf`

| Field | Value |
|-------|--------|
| **Result** | PASS |
| **Classification** | **PASS** |
| **Evidence** | Exit 0; medianMs 0.044; documental note. |

### `npm run validate:prod2e-d28-pca-perf`

| Field | Value |
|-------|--------|
| **Result** | PASS |
| **Classification** | **PASS** |
| **Evidence** | Exit 0; medianMs 1.4698; documental note. |

### `npx tsc --noEmit`

| Field | Value |
|-------|--------|
| **Result** | FAIL (exit 2) |
| **Classification** | **PRE-EXISTING FAILURE** |
| **Evidence** | Errors only in: `scripts/validate-performance-gates.ts` (TS2367), `src/data/internal/registry/interaction.ts` (TS2345), `src/ui/visibility-diagnostics/VisibilityDiagnostics.ts`, `src/ui/visual-integration/VisualIntegrationTypes.ts` (TS1340). Zero errors referencing P0 presentation paths. |

---

## Summary counts

| Classification | Count |
|----------------|-------|
| PASS | 11 |
| PRE-EXISTING FAILURE | 4 (`ui-architecture`, `workspace-architecture`, `prod2e-data3b-gate`, `tsc`) |
| P0-INTRODUCED FAILURE | **0** |
| UNKNOWN | 0 |
| NOT RUN | N/A for listed battery |

---

## Note on prior increment validators

P0.2/P0.3 also recorded PASS for `validate:prod2b-b6-ux`, `validate:prod2b-b6-wiring`, `validate:d68`, `validate:persistence-unit`, `validate:worksheet-import-unit`, `validate:prod2c-c3-worksheet-ui`, `validate:data-boundaries`. Those were **NOT RUN** in the P0.6 battery (not required by the approved minimum list). They remain historical increment evidence, not re-verified here.
