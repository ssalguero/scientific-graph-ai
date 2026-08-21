# Official Record

# PR0-A — Contract, Ownership, and Regression Baseline

**Product:** Scientific Graph AI
**Record Date:** 2026-08-21
**Implementation Series:** Product Reorganization
**Phase:** PR0-A
**Phase Status:** **IMPLEMENTED — READY FOR CERTIFICATION**
**Gate:** CP-0 — Architectural Baseline Gate
**Decision Authority:** PROJECT OWNER / PRODUCT GOVERNANCE AUTHORITY

---

## 1. Authority and Scope

This record implements the documentation and characterization outputs of PR0-A from the frozen [Detailed Implementation Roadmap](../../roadmaps/PRODUCT-REORGANIZATION-DETAILED-IMPLEMENTATION-ROADMAP.md).

Authoritative inputs:

- [Product Reorganization Baseline](./PRODUCT-REORGANIZATION-BASELINE.md);
- [Product Decision Register PD-01–PD-07](./PRODUCT-DECISION-REGISTER-PD-01-PD-07.md);
- [Final Product Gap Inventory](../FINAL-PRODUCT-GAP-INVENTORY.md), checkpoint `0c6a40c`;
- [Inventory Decision Supersession](./PRODUCT-INVENTORY-DECISION-SUPERSESSION.md);
- [Final Roadmap Certification](./FINAL-ROADMAP-CERTIFICATION.md);
- Tier 3 checkpoint `f0730a2`;
- current repository behavior and validation infrastructure.

PR0-A characterizes existing authority, state, consumers, parity, journey and regression coverage. It does not implement PD-01–PD-07 behavior and does not close downstream Product Gaps.

Protected boundaries:

```text
TIER 3 = CLOSED
T3-022+ = NOT AUTHORIZED
SCIENTIFIC ESTIMATOR CHANGES = NONE
SOURCE REFACTOR = NONE
UI REDESIGN = NONE
NEW PRODUCT GAP = NONE
NEW PRODUCT DECISION = NONE
NEW ROADMAP PHASE = NONE
```

---

## 2. Repository Baseline

### 2.1 Current composition

The current product is a federated implementation coordinated primarily by `src/app/page.tsx`.

| Concern | Current repository owner | Current role |
|---|---|---|
| Product composition and active editor state | `src/app/page.tsx` | React state, analysis orchestration, Results/Report/PDF composition, workflow/navigation and export handlers |
| Scientific engines | `src/lib/scientific/**` | Inference, normality, methodology, comparison, workflow, visibility and report helpers |
| Graph series and curves | `src/lib/graph/**` | Experimental-series and mathematical-curve domain behavior |
| VGB calculation/specification | `src/lib/visualGraphBuilder.ts` | Worksheet-driven figure specifications, previews and VGB PCA |
| VGB presentation | `src/components/graph-builder/**` | Builder controls and graph previews |
| Project persistence | `src/lib/project/**` | `.sgproj` v2 domain, collect, serialize, migrate, sanitize and hydrate |
| Product dataset runtime | `src/lib/sessionDatasetRegistry.ts` plus `page.tsx` | Multi-dataset runtime slots and active editor projection |
| DATA-domain dataset registry | `src/data/repository/dataset-manager/**` | Certified authoritative DATA registry; not wired as editor runtime SSOT |
| Session infrastructure | `src/components/session/**` | Transient session registry, persistence, autosave, snapshots and restore engine |
| ENGINE coordination | `src/engine/**` | Import/export/project/session product-flow coordination |
| AI architecture | `src/ai/**` | Certified structural scaffolding only; no runtime intelligence |
| Product Face/navigation | `src/components/home/**`, `src/components/workspace/**`, `src/app/useSmartStart.ts`, `page.tsx` | Smart Start, tabs, continuity and guided workflows |

### 2.2 Current composition finding

`page.tsx` is an orchestration and co-location hub, not a single scientific SSOT. Scientific authority is distributed among:

- extracted scientific modules;
- local analysis builders and result types in `page.tsx`;
- graph/VGB engines;
- project persistence contracts;
- output-specific projection helpers.

No monolithic `ResultModel` is required or authorized.

---

## 3. Ownership Catalog

Status legend:

- **IMPLEMENTED** — current runtime/persistence behavior exists.
- **PARTIAL** — some lifecycle or authority is present, but the frozen contract is incomplete.
- **MISSING** — the frozen artifact behavior does not exist.
- **DEFERRED** — explicitly outside the current active path.

| Artifact / capability | Authoritative current owner | State owner | Result owner | Persistence owner | Projection consumers | Locations | Duplication / coupling | Status |
|---|---|---|---|---|---|---|---|---|
| **Dataset** | DATA registry owns domain identity; product editor owns current runtime dataset projection | `page.tsx` `sessionDatasets`, `activeDatasetId`, active `experimentalSeries` | N/A | `ScientificProjectV2.datasets[]` via `src/lib/project/**` | Worksheet, analyses, VGB, comparison, project | `src/data/**`, `src/lib/sessionDatasetRegistry.ts`, `src/app/page.tsx`, `src/lib/project/domain/types-v2.ts` | DATA `DatasetManager` is not wired to editor runtime; active series mirrors session slot payload | IMPLEMENTED with explicit dual boundary |
| **Worksheet** | Experimental worksheet/domain helpers | `page.tsx` column registry, auxiliary columns and modified state | `src/lib/experimentalWorksheet.ts` transforms/views | `ProjectWorksheetV2` within each dataset | VGB, comparison freshness, project collect | `src/lib/experimentalWorksheet.ts`, `src/components/worksheet/**`, `src/lib/project/**` | React state and active session payload must be synchronized | IMPLEMENTED |
| **Experimental Series** | Graph series domain | `page.tsx` active `experimentalSeries`; session dataset payload | `src/lib/graph/series/**` | `ProjectDatasetV2.series[]` | GE, analysis, Results, Report, comparison, VGB | `src/lib/graph/series/**`, `src/app/page.tsx` | Active copy mirrors dataset registry; clone/stat helpers remain distributed | IMPLEMENTED |
| **Analysis Configuration** | Product analysis control plane | `page.tsx` visibility/mode/selection state | N/A | `ScientificProjectV2.analysisConfig` | Live builders, guided workflows, visibility/PDF policy | `src/app/page.tsx`, `src/lib/project/keys.ts`, `src/app/editorVisibilityBindings.ts` | Visibility keys/setters are represented in several integration lists | IMPLEMENTED |
| **Live Derived Result** | Per-capability scientific/graph builder | Ephemeral `useMemo` results in `page.tsx` | `src/lib/scientific/**` and local `build*Analysis` functions | None by design | Results, Report, PDF, comparison capture | `src/app/page.tsx`, `src/lib/scientific/**` | Builders/types are federated; PCA and other semantics have duplicate implementations | IMPLEMENTED as live-only; CTR-02/04 planned |
| **Composite Methodology Result** | Scientific methodology engines | Ephemeral methodology `useMemo` chain | `src/lib/scientific/methodology/**` | KPI subset in comparison profile only | Results, Report, PDF, comparison | `src/lib/scientific/methodology/**`, `src/app/page.tsx` | Inputs assembled in `page.tsx`; disclosure/provenance incomplete | PARTIAL; CTR-05 planned |
| **Comparison / Comparison Snapshot** | Scientific comparison domain with app capture orchestration | Comparison slots and live comparison in `page.tsx` | `src/lib/scientific/comparison/**` | `ScientificProjectV2.comparison.slots` | Results dashboard, comparison PDF block, project reopen | `src/lib/scientific/comparison/**`, `src/components/comparison/**`, `src/lib/project/**` | Persisted KPI profile is not a general citable result; freshness is UI-derived | PARTIAL; CTR-07/11 planned |
| **Working Figure** | VGB engine and project VGB mapper | VGB runtime entries / dataset stash | `src/lib/visualGraphBuilder.ts` | `ProjectVisualGraphPersistedV2` | VGB builder, Results gallery, project reopen | `src/lib/visualGraphBuilder.ts`, `src/components/graph-builder/**`, `src/lib/project/**` | Preview/displaySeries rebuilt; GE title mutation and token divergence are known | PARTIAL; working state exists |
| **Publication Figure** | Frozen PD-03 lifecycle; future implementation owner PR4-A | Not implemented | Not implemented | Not implemented | Future Report, PDF and figure export | Implementation location TBD within PR4-A | Styling preset currently must not be treated as publication state | MISSING — PLANNED, OWNER IDENTIFIED |
| **Scientific Report Draft** | Product report composition | Ephemeral `scientificReport` in `page.tsx` | `generateScientificReport` plus scientific reporting helpers | None | Report UI, PDF, Pack Lite, clipboard | `src/app/page.tsx`, `src/lib/scientific/report/**` | Content/formatting split across local and extracted helpers; no explicit draft identity | PARTIAL |
| **Reviewed Publication Report** | Frozen PD-07 authority; future implementation owner PR3-A | Not implemented | Not implemented | Not implemented | Future PDF/publication export | Implementation location TBD within PR3-A | Current generated interpretation can flow directly to PDF | MISSING — PLANNED, OWNER IDENTIFIED |
| **PDF** | Report/PDF projection pipeline | Export UI state in `page.tsx` | `exportScientificReportPdf` and pure report/PDF helpers | Download-only; not project persisted | User download, Pack Lite | `src/app/page.tsx`, `src/lib/scientific/report/**`, `src/app/chartExport.ts` | Orchestration in `page.tsx`; policy/filter/text helpers distributed | IMPLEMENTED, parity/review contract incomplete |
| **Numeric Scientific Export** | Frozen PD-05; future implementation owner PR3-B | Not implemented | Not implemented | Not implemented | External tools and future comparison/import consumers | Implementation location TBD within PR3-B | Current chart JSON is configuration only | MISSING — PLANNED, OWNER IDENTIFIED |
| **Project** | Project v2 domain and application pipeline | Editor state collected through integration boundary | N/A | `.sgproj` and local IndexedDB project repository | Save/open/recovery, datasets, workflow, comparison, VGB | `src/lib/project/**`, `src/app/graphEditorProjectIntegration.ts`, local-project hooks | Product runtime session datasets are mapped to durable project datasets | IMPLEMENTED |
| **Session** | Session registry/infrastructure | `SessionRegistry` / `SessionProvider` | N/A | IndexedDB `sessions` store | Window/tab/layout references; internal restore coordination | `src/components/session/**`, `src/engine/flows/restore-session.ts` | Separate autosave from Project; no user restore surface | Infrastructure IMPLEMENTED; product UI DEFERRED |

### 3.1 Ownership conclusions

1. Scientific authority is federated by capability; Results is a consumer, not an owner.
2. Project persistence owns durable serialization, not scientific calculation.
3. Session owns transient workspace continuity, not durable scientific project semantics.
4. Presentation owns interaction/rendering only.
5. Exact future module locations remain implementation decisions within their already identified roadmap phases.

---

## 4. CTR-01–CTR-13 Consumer Map

Classification:

- **CURRENT — PARTIAL:** meaningful precursor behavior exists.
- **PLANNED — OWNER IDENTIFIED:** frozen authority, roadmap phase and workstream are known; implementation is not yet present.
- **IMPLEMENTATION GAP — OWNER TO BE RESOLVED:** no roadmap owner exists. No such gap remains after this PR0-A catalog.

| Contract | Authority | Current producers / current owner | Consumers and projections | Persistence | Existing validation | Current status | Planned phase |
|---|---|---|---|---|---|---|---|
| **CTR-01 Capability identity** | PD-01/02 | Explorer builders/titles in `page.tsx`; report/PDF identity maps | Results, Report, PDF, SCI-50, search/migration, export metadata | Internal keys/toggles only | Methodology, visibility and comparison precursors; no identity gate | Not implemented; **PLANNED — OWNER IDENTIFIED** | PR1-A.1 / WS-C |
| **CTR-02 Artifact identity** | PD-06 | Implicit project/comparison/VGB persisted shapes | Provenance, snapshots, VGB, Report, export, Project | Project v2 partial taxonomy | Project collect/serialize/hydrate suites | CURRENT — PARTIAL; **PLANNED — OWNER IDENTIFIED** | PR1-B.1 / WS-A/B/G/H |
| **CTR-03 Provenance** | PD-04/06 | Comparison capture metadata, worksheet lineage, DATA metadata, project checksum | All citable outputs, comparison freshness, export | Comparison profiles and dataset metadata only | Project/worksheet/comparison precursors | CURRENT — fragmented PARTIAL; **PLANNED — OWNER IDENTIFIED** | PR1-B.2 |
| **CTR-04 Scientific result inventory** | Scientific authority under PD-04 | Federated scientific modules and local builders | Results, methodology, Report, PDF, Comparison, export | KPI snapshots only | Per-domain scientific suites; no catalog gate | Not implemented as catalog; **PLANNED — OWNER IDENTIFIED** | PR1-C.1 / WS-A/D/G |
| **CTR-05 Composite disclosure** | PD-02 | SCI-50–60 methodology builders/reporting | Results, Report, PDF, Comparison, export | Comparison methodological KPI subset | Methodology/workflow precursor gates | Computation present, disclosure missing; **PLANNED — OWNER IDENTIFIED** | PR1-A.2 |
| **CTR-06 Semantic parity** | PD-04 | Independent UI/report/PDF/comparison formatters | Results, Report, PDF, Comparison, future figure/numeric exports | N/A | Visibility/PDF/comparison/export mechanics only | Not implemented; **PLANNED — OWNER IDENTIFIED** | PR2-B / WS-D |
| **CTR-07 Citable snapshots** | PD-06 | Comparison profile capture | Comparison, Project, future publication/export | Comparison slots only | Comparison/project round-trip suites | CURRENT — prototype PARTIAL; **PLANNED — OWNER IDENTIFIED** | PR2-A.1 / WS-B/H |
| **CTR-08 Generated-text review** | PD-07 | Deterministic interpretation/advisor/report generators | Report, PDF, SCI-19, Assistant, future AI | None | PDF/report mechanics only | Not implemented; **PLANNED — OWNER IDENTIFIED** | PR3-A / WS-D/E |
| **CTR-09 VGB figure lifecycle** | PD-03 | VGB specification/apply and project mappers | VGB, Results, Project, future Report/PDF/figure export | Working-figure spec only | VGB and project round-trip precursors | CURRENT — working-state PARTIAL; **PLANNED — OWNER IDENTIFIED** | PR4-A / WS-F/B/D/E |
| **CTR-10 Numeric export** | PD-05 | None; current chart JSON is not scientific export | Future external artifact and tooling | None | Chart/PDF export tests only | Not implemented; **PLANNED — OWNER IDENTIFIED** | PR3-B / WS-D/E |
| **CTR-11 Comparison freshness** | PD-06 | UI-only `deriveComparisonSlotFreshness` | Comparison badge, future Report/export | Derived at render; not persisted | Comparison tests without full state taxonomy | CURRENT — PARTIAL; **PLANNED — OWNER IDENTIFIED** | PR2-A.2 |
| **CTR-12 PCA semantic identity** | PD-04 | GE `buildPCAAnalysis`; VGB `buildPCAFromWorksheet` | GE Results/Report/PDF; VGB Results gallery | VGB specification only | VGB PCA tests; no cross-surface parity | Dual behavior exists, contract missing; **PLANNED — OWNER IDENTIFIED** | PR1-C.2 |
| **CTR-13 Project/session boundary** | Frozen lifecycle rule | Project domain and Session infrastructure | Project save/open/recovery; transient session refs | Separate IndexedDB/project file stores | Project gates and D65–D70 session foundation gates | CURRENT — PARTIAL; Session UI DEFERRED; **PLANNED — OWNER IDENTIFIED** | PR5-A / WS-B/H |

### 4.1 Current duplicate semantic facts

| Semantic fact | Current locations | Baseline classification |
|---|---|---|
| PCA computation/configuration | GE in `page.tsx`; VGB in `visualGraphBuilder.ts` | Known dual implementation; CTR-12 owns semantic boundary |
| Quantile/box-stat behavior | `page.tsx`; `visualGraphBuilder.ts` | Known duplication; FINAL-PG-015 |
| Error uncertainty | GE graph series transforms; VGB `computeErrorMargin` | GE visible, VGB currently invisible |
| Explorer method identity | Explorer panel/report titles; SCI-50 supporting-module strings | One false-identity chain; CTR-01/05 |
| p-value display | Inference engines produce approximate values; `page.tsx` formats without qualifier | Scientific value and presentation status are split |
| Dataset identity/state | DATA `DatasetManager`; app `sessionDatasets`; project dataset mapping | Explicit domain/runtime/persistence boundary, not one monolithic owner |

These findings establish baseline risk. They are not automatic refactor instructions.

---

## 5. Scientific Output Parity Baseline

Legend:

- **PRESENT** — materially carried by the surface.
- **PARTIAL** — present with missing context or known divergence.
- **MISSING** — not carried.
- **UNKNOWN** — not verified by available evidence/execution.

### 5.1 Surface-level baseline

| Result family | Results | Report | PDF | Numeric Export | Figure Export | Comparison |
|---|---|---|---|---|---|---|
| Descriptive statistics and inference | PRESENT | PRESENT as prose | PRESENT as prose | MISSING | MISSING | PARTIAL KPI snapshot |
| Approximate p-values | Value PRESENT; qualifier MISSING | Value PRESENT; qualifier MISSING | Value PRESENT; qualifier MISSING | MISSING | MISSING | MISSING |
| GE error bars | PRESENT | PARTIAL | PARTIAL | MISSING | PRESENT visually | MISSING |
| Effect size and observed power | PRESENT but separate from ANOVA | PRESENT | PRESENT | MISSING | MISSING | PARTIAL |
| GE PCA | PRESENT | PRESENT | PRESENT | MISSING | PRESENT visually | PARTIAL variance KPI |
| VGB figures | PRESENT in gallery | MISSING | MISSING | MISSING | MISSING | MISSING |
| VGB error margins | MISSING from render | MISSING | MISSING | MISSING | MISSING | MISSING |
| VGB PCA | PRESENT in gallery | MISSING | MISSING | MISSING | MISSING | MISSING |
| Explorers and SCI-50–60 | Values PRESENT; identity/disclosure deficient | PRESENT with historical identities | PRESENT with same deficiency | MISSING | MISSING | PARTIAL KPI snapshot |
| Multi-dataset comparison | PRESENT | MISSING from Scientific Report body | PRESENT as separate PDF block | PARTIAL only inside `.sgproj` | MISSING | PRESENT |
| Graph math | PRESENT | MISSING by explicit policy | MISSING by explicit policy | PARTIAL chart configuration | PRESENT via GE image | MISSING |
| Outlier diagnostics | PRESENT | PRESENT | PRESENT | MISSING | PARTIAL chart markers | MISSING |

### 5.2 Scientific invariant coverage

| Result family | Values | Units | Uncertainty | Identity | Source | Configuration | Approximation | Warnings | Provenance |
|---|---|---|---|---|---|---|---|---|---|
| Descriptive/inference | PRESENT | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | MISSING | PARTIAL | PARTIAL |
| Effect size/power | PRESENT | PARTIAL | PRESENT | PARTIAL | PARTIAL | PARTIAL | PRESENT for observed power | PARTIAL | MISSING |
| GE PCA | PRESENT | PRESENT for variance | MISSING | PARTIAL | PRESENT | PARTIAL | MISSING | PARTIAL | MISSING |
| VGB figures | PRESENT | PARTIAL | MISSING | PARTIAL | PARTIAL | PARTIAL | N/A | MISSING | PARTIAL |
| Composite methodology | PRESENT | N/A | MISSING | MISSING under PD-01/02 | PARTIAL | PARTIAL | MISSING | PARTIAL | MISSING |
| Comparison | PRESENT | PARTIAL | PARTIAL | PARTIAL | PRESENT | PARTIAL | MISSING | PRESENT | PARTIAL |
| Report/PDF projection | PRESENT as prose | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | MISSING for p-values | PRESENT | PARTIAL |
| Numeric scientific export | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING |

### 5.3 Export artifact distinction

| Existing artifact | Current content | Scientific numeric export? |
|---|---|---|
| `.sgproj` | Project state, datasets, VGB specs and comparison KPI profiles | No |
| Chart JSON | Expressions, axes and curve configuration | No |
| PNG/SVG | GE visual rendering | No |
| Worksheet TSV | Selected worksheet cells | No |
| PDF | Scientific results as prose plus chart image | No structured numeric contract |
| Pack Lite | PDF plus companion PNG | No structured numeric contract |

CTR-06 and CTR-10 remain implementation work for PR2-B and PR3-B respectively.

---

## 6. Researcher Journey Baseline

The current product uses five primary workspace tabs:

```text
Inicio → Datos → Análisis → Resultados → Reportes
```

The frozen twelve-stage journey is a product relationship graph over those surfaces, not twelve required screens.

| Stage | Current entry / surface | Current functions | Current output | Natural next action | Blocked state | Discoverability/workflow finding | Responsible phase |
|---|---|---|---|---|---|---|---|
| **START** | Inicio / Smart Start | Import, Compare, Math Graph, Analyze, Evaluate, Advanced, rule-based intent | Context/navigation intent | Enter a valid data/graph/analysis branch | Smart Start hidden when active context exists | Multiple entries are valid; IDE chrome competes with product launcher | PR5-B.1 |
| **DATA** | Datos / Import destination | Import, dataset registry/switch, Import Report | Active dataset and series | Prepare or Analyze | Dataset-dependent actions without data | Import destination versus Datos remains a documented boundary | PR1-B, PR5-B.1 |
| **PREPARE** | Datos → Experimental worksheet | Transform, column metadata, series selection | Prepared worksheet/series | Explore, Analyze, VGB or Compare | No eligible series/columns | Current stage is implicit inside Datos; no completion signal | PR5-B.1 |
| **EXPLORE** | Análisis toggles / `explore-structure` workflow | Descriptive and structural exploration | Exploratory Results panels | Review in Results | Workflow requires enough observations/series | Workflow is less discoverable than Smart Start Compare/Evaluate | PR1-A/C, PR5-B |
| **ANALYZE** | Análisis inspector and guided workflows | Configure statistics, inference and methodology | Live derived results | View Results | Module/prerequisite gates | Config and results live on separate surfaces; hidden-compute semantics require disclosure | PR1-A/C, PR2-B, PR5-B.2 |
| **RESULTS** | Resultados | Main GE chart, scientific panels, VGB gallery, comparison dashboard | Scientific review context | Report, export, save or return | Empty/disabled result states | Results is current convergence center but hierarchy is implicit | PR2-B, PR5-B.3 |
| **VISUALIZE** | Datos → Curves or Visual Builder | GE and VGB authoring | GE chart or VGB Working Figure in Results | Review/result/export path | VGB needs eligible worksheet; publication path absent | GE/VGB distinction is not obvious to cold users | PR1-D, PR4-A, PR5-B |
| **COMPARE** | Smart Start Compare / Datos slots | Capture A/B, compare dashboard, guided workflow | Comparison profile/dashboard | Review, Report or recapture | Requires eligible datasets/series | Freshness semantics remain partial | PR2-A.2, PR5-B.3 |
| **REPORT** | Reportes / guided report step | Scientific Report composition, Pack Lite availability | Live report document | Researcher review then export | Report/pack prerequisites | Section origins and review authority are not explicit | PR3-A, PR5-B |
| **REVIEW** | Current Results/Report inspection | Manual judgment over deterministic interpretation | Unrecorded human decision | Accept/edit/exclude when lifecycle exists | No draft/review state | PD-07 lifecycle is absent; current generated prose may appear authoritative | PR3-A |
| **EXPORT** | Reportes | PDF, Pack Lite, GE PNG/SVG/chart JSON, project export | External file | Save/continue or external use | Numeric/VGB export missing | Chart configuration is not clearly distinguished from scientific export | PR3-B, PR4-A, PR5-B |
| **CONTINUE** | Project panel, local library, recovery prompt | Open/save/recover `.sgproj`; project autosave | Restored project state and recomputed live results | Resume prior stage | Session UI unavailable | Project recovery exists; full Session continuation remains deferred | PR5-A, PR5-B.1 |

### 6.1 Valid alternate entry points

- Import;
- Open/recover Project;
- Graph Editor;
- VGB after an eligible worksheet exists;
- Analysis;
- Compare;
- guided workflow;
- deterministic guidance.

Full Session continuation and runtime AI are not current entry points.

---

## 7. Validation and Regression Baseline

### 7.1 Existing infrastructure

| Validation area | Existing assets | Current use |
|---|---|---|
| Aggregate product/scientific | `validate:spe-1v-umbrella`, `validate:full` | Product-critical and full-regression umbrellas |
| Scientific methodology | `validate:methodology-unit` | SCI-50–60 precursor computations |
| Comparison | `validate:comparison-unit` | Analysis/profile/report and CTA behavior |
| Visibility/PDF policy | `validate:visibility-unit` | Registry, state and PDF inclusion policy |
| Guided workflow | `validate:workflow-unit` | Visibility snapshot and workflow behavior |
| VGB | `validate:visual-graph-builder-unit` | Graph specification/preview behavior |
| VGB persistence | `validate:prod2c-c8-regression-gate` | Mapper/collect/hydrate/UI round-trip |
| Project persistence | `validate:prod2b-b2-gate`, `validate:persistence-unit` | Project domain, migration, collect/hydrate/serialize |
| Session | D65–D70 and session persistence/boundary gates | Infrastructure only; no product restore UI |
| Export | export1/export2 and Pack Lite suites | Chart/PDF mechanics, not numeric scientific export |
| Release | `validate:release-p1`, `validate:release-p2` | Governance/readiness architecture |
| Performance | performance I0–I8 scripts/workflow | Measurement/governance; optimization evidence-driven |
| Tier 3 | closed checkpoint and batch oracle packages | Reference evidence; not reopened by PR0-A |

Repository scale observed:

- approximately 100 `validate:*` npm scripts;
- 372 `scripts/validate*` files;
- 73 `*.cases.ts` suites;
- Tier 3 batch3B–3H reference packages in the current tree.

### 7.2 Known validation debt

- Product Reorganization CP-1 through CP-7 gates do not yet exist as contract-specific evidence; they belong to their implementation phases.
- CTR-01/05 identity/disclosure tests are absent.
- End-to-end artifact/provenance validation is absent.
- Cross-surface semantic parity validation is absent.
- Generated-text review-state validation is absent.
- Numeric scientific export validation is absent.
- VGB publication-lifecycle validation is absent.
- GE/VGB PCA semantic-parity validation is absent.
- Full journey/no-orphan-action validation is absent.
- `workspace-architecture` and scattered UX/VGB validator noise remain disclosed under FINAL-PG-018.
- Browser/E2E gates remain environment-dependent.

### 7.3 Executed PR0-A baseline

| Command | Result | Notes |
|---|---|---|
| `npm run lint` | BASELINE FAIL | Default heap exhausted; process-only 4096 MB retry completed with 138 errors and 108 warnings in the pre-existing tree |
| `npx tsc --noEmit` | PASS | Exit 0 |
| `npm run validate:spe-1v-umbrella` | PASS | 13/13 subgates, including export, Smart Start, ENGINE import/export and `tsc --noEmit` |
| `npm run validate:methodology-unit` | PASS | 377 cases across F5A–F5E |
| `npm run validate:comparison-unit` | PASS | Comparison analysis/profile/report and CTA suite |
| `npm run validate:visibility-unit` | PASS | Visibility registry/state and PDF policy |
| `npm run validate:workflow-unit` | PASS | Workflow visibility/restore and Report convergence |
| `npm run validate:visual-graph-builder-unit` | BASELINE FAIL | 78/79 cases pass; known `scatter.amend.api-freeze-prerequisite` fails; no validator change |
| `npm run validate:prod2c-c8-regression-gate` | PASS | 5/5 VGB persistence subgates |
| `npm run validate:prod2b-b2-gate` | PASS | Project domain, migration, collect, serialize, hydrate, sanitize, invariants and TypeScript |
| `npm run validate:release-p1` | PASS | 80/80; planning/governance certification only, product release not authorized |
| `npm run validate:release-p2` | PASS | 44/44; readiness architecture only, product release not authorized |

No validator is modified to change these outcomes.

The VGB unit failure is a pre-existing API-freeze prerequisite baseline. The same run confirms all other VGB behavior cases, including PCA, bubble, scatter behavior and round-trip invariants. The dedicated project round-trip gate passes in full. This disclosed validator debt does not indicate a PR0-A scientific behavior regression.

The repository-wide lint retry completed after the initial resource failure and exposed the current lint debt rather than a PR0-A regression. PR0-A changes no linted source file and does not rewrite lint rules or source code to manufacture PASS.

---

## 8. Scientific Output Regression Protection

PR0-A changes no scientific/runtime code. The following current behaviors form the regression-sensitive baseline for PR1+:

| Area | Current protected behavior | Existing protection / gap |
|---|---|---|
| Scientific calculations | Existing inference, normality, methodology and graph values remain unchanged | Domain suites and closed Tier 3; no estimator edits authorized |
| Result values | Current Results/Report/PDF values remain current baseline | Partial per-domain tests; future CTR-06 parity gate required |
| Method identity | Current historical labels are baseline evidence, not approved future identity | PR1-A must change labels without changing calculations |
| Warnings | Existing assumption/comparability warnings must not disappear | Comparison/report suites; parity validation absent |
| Approximation | Observed-power approximation disclosure currently present; p-value disclosure currently absent | PR1-A.3 adds disclosure without numeric change |
| Graph Editor | Main chart, GE error bars and chart exports remain current behavior | Graph/export gates |
| VGB | Current working-figure build, project round-trip and known false-render baselines are recorded | VGB unit/persistence gates; PR1-D owns corrections |
| Persistence | `parse → migrate → validate → sanitize → hydrate` and recomputation-on-open remain current behavior | Project v2 gates |
| Project/Session | Project recovery and separate Session infrastructure remain distinct | Project/session boundary gates |

Any numeric scientific change during a later communication/identity phase is a stop condition.

---

## 9. Implementation Debt and Unknown Register

| ID | Finding | Classification | Owner / disposition | Blocks PR1? |
|---|---|---|---|---|
| PR0-U01 | Canonical Explorer identity registry location TBD | NON-BLOCKING | PR1-A.1 / WS-C | No; authority and phase owner are known |
| PR0-U02 | Artifact taxonomy technical module/location TBD | NON-BLOCKING | PR1-B.1 | No |
| PR0-U03 | DATA metadata, comparison metadata and scientific provenance transport are fragmented | NON-BLOCKING, REQUIRED PR1 WORK | PR1-B.2 | No; current producers are cataloged |
| PR0-U04 | Federated scientific result inventory location TBD | NON-BLOCKING | PR1-C.1 | No |
| PR0-U05 | GE/VGB PCA parity fixture and contract representation TBD | NON-BLOCKING | PR1-C.2 | No |
| PR0-U06 | Inline `page.tsx` builders have uneven isolated test coverage | NON-BLOCKING | Owning PR1/PR2 phase adds targeted evidence as required | No |
| PR0-U07 | Current Results/Report/PDF projection strings are independently assembled | NON-BLOCKING, REQUIRED PR2 WORK | PR2-B | No |
| PR0-U08 | Citable snapshot identity/equivalence format TBD | NON-BLOCKING | PR2-A.1 | No |
| PR0-U09 | Generated-text review persistence/UX TBD | NON-BLOCKING | PR3-A | No |
| PR0-U10 | Numeric scientific export format/schema/home TBD | NON-BLOCKING | PR3-B | No |
| PR0-U11 | VGB publication lifecycle representation TBD | NON-BLOCKING | PR4-A | No |
| PR0-U12 | DATA `DatasetManager` and product runtime datasets have separate current authority scopes | NON-BLOCKING BOUNDARY | PR1-B must preserve/map boundary rather than invent one SSOT | No |
| PR0-U13 | `workspace-architecture` and UX/VGB validator noise | NON-BLOCKING disclosed debt | FINAL-PG-018 / PR6-A | No |
| PR0-U14 | Repository-wide lint baseline reports 138 errors and 108 warnings after a 4096 MB heap retry | NON-BLOCKING pre-existing validation debt | Characterized in PR0-A; owning implementation phases must not increase it | No; TypeScript and product-critical umbrella pass |
| PR0-D01 | Full Session restore UI and product semantics | DEFERRED | ARCH-U / PR5-A.2 disposition | No |
| PR0-D02 | Domain undo/redo | DEFERRED | PR5-A.3 | No |
| PR0-D03 | Runtime AI/AIR-1 | DEFERRED | PR6-A disposition; separate authorization required | No |
| PR0-D04 | COLLAB, PLUGINS, EXPORT-3, CRP Phase 3 | DEFERRED | Frozen non-goals | No |

### 9.1 PR1 blocker determination

After this record is validated:

```text
UNRESOLVED PRODUCT DECISIONS = 0
UNOWNED ROADMAP CONTRACTS = 0
TIER 3 REOPEN REQUIREMENTS = 0
NEW MAJOR ARCHITECTURE REQUIREMENTS = 0
GENUINE PR1 BLOCKERS = 0
```

Implementation locations remain open implementation decisions within already authorized owners. They do not require Product Reorganization.

---

## 10. `page.tsx` Policy

`src/app/page.tsx` is large, but size is not an implementation reason.

### Current ownership within `page.tsx`

- active editor and workspace React state;
- orchestration of extracted scientific builders;
- local/federated analysis builders and result types;
- Results rendering;
- Scientific Report composition;
- PDF/export orchestration;
- comparison capture;
- VGB create integration;
- project collect/hydrate integration;
- Smart Start/workflow navigation.

### Coupling relevant to later phases

| Area | Relevant symbols/region | Future phase |
|---|---|---|
| Explorer identities | `build*ExplorerAnalysis`, panel/report titles | PR1-A.1 |
| Composite methodology orchestration | SCI-50–60 `useMemo` chain | PR1-A.2 |
| p-value formatting | `formatPValue` and report consumers | PR1-A.3 |
| Scientific result inventory | local `build*Analysis` results plus extracted imports | PR1-C.1 |
| GE PCA | `buildPCAAnalysis` | PR1-C.2 |
| VGB title/state coupling | `handleVisualGraphCreate` | PR1-D.3 |
| Comparison capture | `buildCurrentDatasetAnalysisProfile` and slot handlers | PR2-A |
| Report/review | `generateScientificReport`, interpretation/advisor generators | PR3-A |
| Chart exports | PNG/SVG/JSON handlers | PR3-B boundary |
| Results journey | workspace sections and `WorkflowContinuityBar` | PR5-B |

Policy:

- no broad extraction based on line count;
- narrow movement is allowed only when a contract requires a stable owner;
- scientific calculations must not change as a side effect of ownership work;
- presentation may not become scientific authority.

---

## 11. Project vs Session Baseline

### Project

Project owns durable researcher work:

- project metadata and revision;
- datasets and worksheets;
- active dataset;
- analysis configuration;
- guided workflow state;
- comparison slot profiles;
- workspace selection;
- graph context;
- VGB working-figure specifications.

Persistence:

- `.sgproj` v2;
- local IndexedDB committed projects and drafts;
- user-visible save/open/recovery;
- draft autosave and conflict handling.

Live SCI-53–60 outputs and most analysis objects are recomputed on hydrate rather than persisted.

### Session

Session owns transient workspace continuity:

- session definition;
- window/tab/layout references;
- in-memory registry;
- session persistence/autosave infrastructure;
- snapshots/restore points;
- registry-level restore engine.

Current limitation:

- no user-facing full Session restore surface;
- no promise to restore full scientific editor content through Session;
- infrastructure persistence does not convert Session into Project.

Frozen boundary:

```text
PROJECT CONTINUITY ≠ SESSION CONTINUITY
PROJECT RECOVERY = CURRENT
FULL SESSION UI/RESTORE = DEFERRED
```

No Session UI is implemented by PR0-A.

---

## 12. AI Baseline

### `src/ai/**`

Current state:

- AI domain architecture is RELEASE CERTIFIED as structural scaffolding.
- Runtime intelligence is absent.
- `runtimeExposure` and runtime guidance are disabled by contract.
- Existing public exports are phase/status/architecture markers.
- AIR-1 remains required for runtime product assistance.

### Current user-facing assistance

The following are deterministic product generators, not runtime AI:

- Smart Start keyword intent classification;
- Statistical Advisor rules;
- Scientific Assistant template generation;
- SCI-19 deterministic interpretation;
- Scientific Report composition;
- guided workflow step/toggle orchestration.

PD-07 applies to their interpretive/publication text even though they are not AI.

```text
HUMAN = SCIENTIFIC AUTHORITY
AI = NON-AUTHORITATIVE ASSISTANCE
AIR-1 = DEFERRED
```

PR0-A creates no AI architecture or runtime.

---

## 13. PR0-A Acceptance Criteria

| Criterion | Evidence in this record | Status |
|---|---|---|
| Ownership catalog exists | §3 | PASS |
| CTR-01–13 consumer map exists | §4 | PASS |
| Output parity baseline exists | §5 | PASS |
| Researcher journey baseline exists | §6 | PASS |
| Validation baseline exists | §7 | PASS, execution results pending |
| Regression-sensitive areas identified | §8 | PASS |
| Debt/unknown register exists | §9 | PASS |
| `page.tsx` policy documented | §10 | PASS |
| Project/Session boundary documented | §11 | PASS |
| AI baseline documented | §12 | PASS |
| Product decisions unchanged | Frozen records cited; no amendment | PASS |
| Tier 3 remains closed | `f0730a2`; no scientific changes | PASS |
| No new scientific estimator | No `src/**` change | PASS |
| No unrelated refactor | Documentation-only phase output | PASS |
| Existing behavior regression-safe | TypeScript, SPE, methodology, comparison, visibility, workflow, VGB persistence, Project and release gates pass; pre-existing lint/VGB debts disclosed | PASS WITH DISCLOSED BASELINE |
| PR1 blockers explicitly known | §9.1 | PASS |

PR0-A baseline evidence is complete. CP-0 certification remains the next governance action after protected-file and diff verification.

---

## 14. Explicit Non-Changes

PR0-A does not:

- implement Explorer renaming;
- change SCI-50–60 output semantics;
- add p-value qualifiers;
- change VGB rendering or lifecycle;
- implement snapshots;
- implement semantic parity;
- implement generated-text review;
- implement numeric export;
- redesign Results or workflow UX;
- change Project/Session persistence;
- implement Session UI;
- implement AI;
- change scientific calculations;
- modify validators;
- refactor `page.tsx`;
- create gaps, decisions or phases.

---

## 15. Gate Disposition

Current disposition:

```text
CP-0 ARCHITECTURAL BASELINE = MATERIALIZED
PR0-A = READY FOR CERTIFICATION
PR1 ENTRY = PENDING PR0-A CERTIFICATION
```

The disclosed lint and VGB validator findings are current-state baselines, not newly introduced behavior and not reasons to alter validators during PR0-A.
