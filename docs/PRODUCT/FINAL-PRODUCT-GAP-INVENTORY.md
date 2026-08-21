# FINAL RECONCILED PRODUCT GAP INVENTORY

**Basis:** original Product Gap Inventory + Claude Opus red-team audit + direct re-verification against the current repository, current CRP governance records, and the closed Tier 3 state (`f0730a2`).
**Authority rule applied:** repository code > current CRP records > older UX-10/UXC-1 documentation.
**Nature:** read-only reconciliation. No implementation is authorized or contained here.

---

## A. Executive Summary

Both prior audits agreed on the two things that matter most, and both were right: **the "Explorer" family carries recognized scientific method names over heuristic score blends**, and **a certified calculation (the Visual Graph Builder error margin) is selectable by the user but produces no visible effect anywhere**. Re-verification confirms both, and confirms one escalation the first audit missed: those heuristic method names are copied verbatim into `supportingModules` by the SCI-50 Consistency Engine and rendered in the scientific report as "Módulos de apoyo", where they read as methodological evidence.

The first audit was, however, working from a stale UX baseline. It audited against UX-10 / UXC-1 and never consulted the **CRP series**, which is newer, product-focused, and already resolved several items the first audit listed as open: the screenshot corpus exists (20 captures), the "Current Project / Ready" header is visually suppressed, demo seed windows are off by default, and `tsc --noEmit` was recorded as passing. Those are removed from the active list in section S.

The first audit also overstated two absences. Export surfaces do exist (`.sgproj`, PNG, SVG, JSON, worksheet TSV, PDF, Pack Lite) — the real finding is narrower and sharper: **none of them carry statistical results**, and the JSON export in particular carries only expressions and axis bounds. Likewise, the Visual Graph Builder is not a dead end for viewing (its graphs render in Results and persist in projects); it is a dead end for **analysis, reporting, and image export**.

Finally, the mechanism behind the VGB↔analysis boundary was wrong in both directions until re-verified: `displaySeries` is built for scatter and line, and then read by nothing. No VGB graph type of any kind is analysis-ready.

Net: **24 active gaps**, of which 3 are P0. Eleven previously reported items are removed as obsolete, false, intentional, or duplicate. Seven items are reclassified as **PRODUCT DECISION REQUIRED** rather than gaps, because the repository does not determine the intended answer.

---

## B. Reconciliation Verdict

### B.1 Confirmed by both audits and by re-verification

| Finding | Evidence anchor |
|---|---|
| Explorers are heuristics under method names | `buildManovaExplorerAnalysis:7426`, `buildPcrExplorerAnalysis:8174`, `buildBootstrapExplorerAnalysis:8684`, `buildTsneExplorerAnalysis:9176`, `buildUmapExplorerPoints:9444` (all `src/app/page.tsx`) |
| VGB error margin invisible | `computeErrorMargin` (`visualGraphBuilder.ts:535`) vs `GraphPreview.tsx` bar branch |
| No session-level restore UI | `SessionRestoreEngine.ts` deferral header; no restore chrome |
| AI domain is not runtime | zero `@/ai` imports in product code |
| Graph math excluded from PDF by policy | `visibility/registry.ts` `inferPdfExportPolicy` → `"never"` |

### B.2 Corrected from the original audit

| Original claim | Correction | Evidence |
|---|---|---|
| "Scatter/line become experimental series" | **No VGB type is analysis-ready**; `displaySeries` has no consumer | search for `displaySeries`: only builder, entry factory, clone helper, tests |
| "VGB is a workflow dead end" | Graphs **do** render in Results and persist | `page.tsx:23262-23311`; `.sgproj` `visualGraphs` |
| "No numeric export" | Several exports exist; **none carry statistics** | `exportChartPng/Svg/Json` (`page.tsx:15839/15857/15873`), worksheet TSV (`ScientificWorksheetPanel.tsx:592,671`) |
| "VGB rendered without useful numeric readout" (general) | VGB **PCA** shows variance % and 4-dp scores | `PCAPreview.tsx:26,28` |
| PG-002 classed as observability | Numbers are shown; the **graphic** is false | `BoxPlotPreview` fixed `left:8%/28%`, `width:84%/44%` |
| p-value approximation treated as minor | Appears in Results, report, and PDF at 4 dp, unqualified | `formatPValue` (`page.tsx:1166`) over four approximation functions |

### B.3 Rejected / obsolete

Screenshot corpus "missing"; "Current Project / Ready" as a live defect; seed demo windows as current noise; TS debt as current; EXPORT-3 as a gap; `explore-structure` as an incompleteness. Details and reasons in **section S**.

### B.4 Newly discovered (this reconciliation)

SCI-50 `supportingModules` name laundering; orphaned `displaySeries`; VGB creation overwriting the Graph Editor title; VGB figures unexportable; JSON export without data; VGB rendered without publication tokens in Results; duplicate quantile helper; dual PCA configuration divergence; project-layer draft recovery **does** exist (which narrows the restore gap to the Session layer).

---

## C. Current Product Capability Map

| Surface | Runtime reality | SSOT |
|---|---|---|
| Import / worksheet | CSV/workbook import, transforms incl. `zscore`, TSV clipboard copy/paste | DATA / worksheet |
| Home / Smart Start | Rule-based intent cards, commercial copy (CRP-6.1) | `src/lib/smart-start/` |
| Graph Editor | Expressions + experimental series; error bars drawn and tabulated; outlier detectors (IQR/z); math overlays | `src/lib/graph/` + `page.tsx` |
| Visual Graph Builder | Worksheet-driven scatter/line/bar/histogram/box/violin/heatmap/bubble/PCA; preview + persistence + Results display only | `src/lib/visualGraphBuilder.ts` |
| Análisis | Toggle-gated descriptive / inference / multivariate / explorer / methodology panels | `scientific/visibility/registry.ts` |
| Resultados | Panels + VGB gallery + guided workflow host | `page.tsx` |
| Comparación | SCI-58 two-slot KPI dashboard; snapshots persist | `scientific/comparison/` |
| Reportes y Pack | Scientific report, SCI-19 interpretation, Scientific Assistant, Advisor, PDF, Pack Lite (PDF + PNG) | `scientific/report/` |
| Persistence | `.sgproj` v2, local projects with autosave draft + recovery prompt, IndexedDB session autosave | `lib/project/`, `useLocalProjectPersistence.ts`, `SessionProvider` |
| Product Face | CRP-6.1/6.2: single brand, seeds off, IDE scaffold collapsed | CRP official records |
| AI domain | Certified **markers only**, unimported | `src/ai/` |
| Plugins / Collab | Skeletons; no loading, no realtime | `src/plugins/`, `src/collab/` |

---

## D. Final Active Product Gap Inventory

### P0

---

**FINAL-PG-001 — Explorer names do not correspond to the named methods**

- **Current state:** Nine panels named after recognized multivariate methods compute weighted averages of other engines' scores. None implements the named algorithm.
- **Evidence:** `src/app/page.tsx` — MANOVA `:7426` (`(pcaVar/100 + clipped distance ratio)/2`); LDA `:7675`; Canonical Correlation `:7913`; PCR `:8174`; PLS `:8414`; Bootstrap `:8684` (**no resampling**); Sensitivity `:8952`; t-SNE `:9176` (**MDS points copied**); UMAP `:9444` (**MDS + `sin/cos` jitter**). Report lines: `getManovaExplorerReportLines` etc. PDF ids: `pdf-section-filter.ts:54-68`.
- **Affected surface:** Results, Reports, PDF.
- **User impact:** A researcher may believe MANOVA, PLS, bootstrap resampling, or a t-SNE/UMAP embedding was performed.
- **Scientific impact:** Communication risk, not calculation risk. The engines compute exactly what their code says; the labels misdescribe them.
- **Primary classification:** SCIENTIFIC-COMMUNICATION · **Secondary:** PRODUCT, OUTPUT-CONTRACT.
- **Dependency:** none technical; requires a naming/disclosure decision.
- **Priority:** **P0**.
- **Recommendation:** Requires a product decision on how these capabilities are described to users wherever they appear (panel, report, PDF). This is not a Tier 3 matter and must not be addressed by implementing the real algorithms under time pressure.

---

**FINAL-PG-002 — Heuristic method names enter the report as methodological evidence (SCI-50)**

- **Current state:** The Consistency Engine appends literal method names to `supportingModules` when heuristic thresholds pass, and the report prints them as "Módulos de apoyo".
- **Evidence:** `scientific/methodology/consistency/build.ts:139-195` pushes `"MANOVA"`, `"LDA"`, `"PCR"`, `"PLS"`, `"Bootstrap"`, `"Sensitivity"`, `"t-SNE"`, `"UMAP"`; `consistency/reporting.ts:17-21` renders them; PDF section id `sci-50-consistency`; the same names also feed SCI-53 evidence inputs (`evidence/input-types.ts`).
- **Affected surface:** Results, Reports, **PDF**.
- **User impact:** An exported PDF can list "Bootstrap" and "MANOVA" as supporting modules of a consistency claim.
- **Scientific impact:** Highest-severity communication issue in the product: heuristics are presented as method-level corroboration inside an exportable scientific document.
- **Primary classification:** OUTPUT-CONTRACT · **Secondary:** SCIENTIFIC-COMMUNICATION, GOVERNANCE.
- **Dependency:** FINAL-PG-001 (same naming decision).
- **Priority:** **P0**.
- **Recommendation:** Treat as a distinct output-contract item from FINAL-PG-001 because it survives into the exported artifact even when the panels are not consulted.

---

**FINAL-PG-003 — VGB error-bar selector has no effect anywhere**

- **Current state:** The user chooses `Ninguna / SD / SEM / IC 95%`; the half-width is computed and stored, then never drawn, printed, reported, or exported.
- **Evidence:** control at `VisualGraphBuilder.tsx:433-449`; `computeErrorMargin` (`visualGraphBuilder.ts:535`) → `barData[].error` (`:1409`); `GraphPreview.tsx` imports no `ErrorBar` and renders `<Bar dataKey="value">`; Y domain computed from `value` only; T3-015 reference notes the observability caveat (`batch3D/README.md`).
- **Affected surface:** VGB builder, Results VGB gallery.
- **User impact:** A scientific control that silently does nothing.
- **Scientific impact:** Certified calculation with zero output contract. Engine correctness unaffected.
- **Primary classification:** PRODUCT (misleading affordance) · **Secondary:** UX, OUTPUT-CONTRACT.
- **Dependency:** FINAL-PG-007 decision on VGB's role.
- **Priority:** **P0**.
- **Recommendation:** Needs product attention as a broken affordance, independent of whether VGB ever becomes publication-grade.

---

### P1

---

**FINAL-PG-004 — p-values presented as exact**

- **Current state:** All four p-value paths are approximations; the UI and report print `p = 0.0123` (4 dp, floor `< 0.0001`) with no qualifier. The product already demonstrates the honest pattern elsewhere via `EFFECT_SIZE_POWER_DISCLAIMER`.
- **Evidence:** `inference/distribution.ts` `approximateTwoTailedTPValue`, `approximateUpperTailFPValue`, `approximateTwoTailedNormalPValue`, `approximateUpperTailChiSquarePValue`; `formatPValue` (`page.tsx:1166`); report lines `page.tsx:12037-12083`; UI `26041/26118/26334/26389`.
- **Affected surface:** Results, Reports, PDF.
- **User impact / Scientific impact:** The most-cited number in any paper is displayed with implied exactness.
- **Primary classification:** OUTPUT-CONTRACT · **Secondary:** SCIENTIFIC-COMMUNICATION.
- **Dependency:** none. **Explicitly not a Tier 3 item** — the gap is disclosure, not computation.
- **Priority:** **P1**.

---

**FINAL-PG-005 — VGB box plot geometry does not encode its statistics**

- **Current state:** Five-number summary is computed and printed; the drawn box/whisker uses fixed percentages.
- **Evidence:** `computeBoxPlot` (`visualGraphBuilder.ts:491`, R-7 `getQuantile:480`); `BoxPlotPreview` (`GraphPreview.tsx:51-90`) hardcodes `left:"8%"/width:"84%"` and `left:"28%"/width:"44%"`; no IQR or outliers (contrast Graph Editor T3-019 which exposes `outlierCount`).
- **Affected surface:** VGB.
- **Primary:** SCIENTIFIC-COMMUNICATION · **Secondary:** UX. **Priority: P1.**

---

**FINAL-PG-006 — VGB "violin" is not a density plot**

- **Current state:** Raw values rendered as adjacent bars; a certified KDE engine exists only on the Graph Editor side.
- **Evidence:** `visualGraphBuilder.ts:1455` violin case; `ViolinPreview` (`GraphPreview.tsx:92-127`); GE `kernelDensityAnalyses` (`page.tsx:16891`).
- **Primary:** SCIENTIFIC-COMMUNICATION · **Secondary:** UX. **Priority: P1.**

---

**FINAL-PG-007 — VGB output cannot reach report, PDF, or image export**

- **Current state:** VGB graphs render in Results and persist in `.sgproj`, but no VGB figure or number enters the scientific report, the PDF, or any image export.
- **Evidence:** report/PDF title map contains no VGB entries (`pdf-section-filter.ts`); image capture is bound to `chartExportRef` (declared `page.tsx:15470`, attached at `23391` inside the Graph Editor section), while the VGB gallery sits at `23262-23311` outside it; the PDF chart image uses the same node (`15915-15926`).
- **Affected surface:** VGB → Reports → PDF → Export.
- **User impact:** Figures built in the builder cannot be published from the product.
- **Primary:** OUTPUT-CONTRACT · **Secondary:** PRODUCT, WORKFLOW.
- **Dependency:** **PRODUCT DECISION REQUIRED** — is VGB a publication surface or an exploration surface?
- **Priority:** **P1**.

---

**FINAL-PG-008 — `displaySeries` is computed and consumed by nothing**

- **Current state:** For scatter and line, `buildVisualGraphSeries` produces `ExperimentalSeries[]`, stored on the runtime entry, deliberately excluded from persistence, and read by no runtime consumer.
- **Evidence:** `visualGraphBuilder.ts:1520-1550, 1579`; `page.tsx:17999`; clone helper `visual-graph-session-ui.ts:46`; tests assert absence from JSON (`visual-graph-collect.cases.ts:152`, `visual-graph-ui.cases.ts:156`).
- **Classification of the artifact itself:** not dead code (it is produced and cloned), not confirmed future architecture (no roadmap entry found). Honest verdict: **orphaned / transitional, intent undetermined**.
- **Primary:** ARCHITECTURE · **Secondary:** WORKFLOW.
- **Dependency:** **PRODUCT DECISION REQUIRED** — should VGB feed inference?
- **Priority:** **P1**.

---

**FINAL-PG-009 — Creating a VGB graph renames the Graph Editor chart**

- **Current state:** `handleVisualGraphCreate` sets the global `title`, which drives Graph Editor export filenames and the report chart identity.
- **Evidence:** `page.tsx:18002-18004`; `getChartExportFileName(title, "png"/"svg"/"json")` at `15849/15865/15896`.
- **User impact:** A silent cross-surface state change with downstream naming effects on exported artifacts.
- **Primary:** WORKFLOW · **Secondary:** PRODUCT. **Priority: P1.**

---

**FINAL-PG-010 — No export carries scientific results; the JSON export implies otherwise**

- **Current state:** Seven export surfaces exist; none emits statistics. `exportChartJson` emits only expressions and axis configuration.
- **Evidence:** `page.tsx:15878-15889` payload = `{title, expression, curves[{expression,color}], min_x, max_x, auto_scale_y, color}`; `.sgproj` via `localProjectActions.ts:253-259`; Pack Lite = PDF + PNG (`publication-pack-lite.ts`).
- **User impact:** Certified numbers can only leave the product as PDF prose or copied text (`handleCopyScientificReport` `:18593`).
- **Primary:** OUTPUT-CONTRACT · **Secondary:** PRODUCT (misleading affordance). **Priority: P1.**

---

**FINAL-PG-011 — Session-layer restore has no user surface**

- **Current state:** Reconciled and narrowed. The **project** layer has real, user-visible recovery (autosave draft + `recoveryPrompt` + restore action). The **session** layer has a working engine and autosave controller with no UI, and restores only registry entries — windows, tabs, content, and series are explicitly deferred.
- **Evidence:** `useLocalProjectPersistence.ts:54,109-165`; `SessionProvider.tsx:88` wires `createSessionAutosaveController`; `SessionRestoreEngine.ts` header defers D68–D70 scope.
- **Primary:** PRODUCT · **Secondary:** UX, ARCHITECTURE.
- **Dependency:** Session/D47 architecture decision (deferred, ARCH-U).
- **Priority:** **P1** for the missing surface; the deferred restore scope stays deferred.

---

### P2

| ID | Title | Current state / Evidence | Surface | Impact | Primary / Secondary | Dependency | Rec. |
|---|---|---|---|---|---|---|---|
| **FINAL-PG-012** | ANOVA effect sizes live behind a separate toggle | η²/ω² computed in `effect-size.ts:312,322`, surfaced only under `showEffectSizePower` / `sci-57`; the ANOVA panel shows F and p | Análisis, Results, PDF | Effect size may be omitted from a report that includes ANOVA | OUTPUT-CONTRACT / UX | none | Review panel adjacency of inferential and effect-size output |
| **FINAL-PG-013** | Two PCA implementations with different configuration | GE `buildPCAAnalysis:3712` always standardizes, no sign normalization; VGB `buildPCAFromWorksheet:986` offers `pcaStandardize` and calls `normalizePCAEigenvectorSign` | GE vs VGB | Same data, two "PCA" results with different conventions | ARCHITECTURE / OUTPUT-CONTRACT | PRODUCT DECISION (shared SSOT?) | Decide whether one PCA contract is canonical |
| **FINAL-PG-014** | VGB looks different in builder vs Results | Builder passes `chartTokens` (`VisualGraphBuilder.tsx:624`); Results omits it (`page.tsx:23296`) → publication presets never apply to VGB | VGB, Results | Visual inconsistency; presets ineffective | UX / OUTPUT-CONTRACT | FINAL-PG-007 | Align preset application once VGB's role is decided |
| **FINAL-PG-015** | Duplicate quantile helper | `visualGraphBuilder.ts:480` re-implements the R-7 convention that `batch3G/README.md` describes as the shared Graph Editor helper | GE vs VGB | Silent drift risk between surfaces | ARCHITECTURE | FINAL-PG-013 | Track as SSOT drift, not a calculation defect |
| **FINAL-PG-016** | Undo/redo is structural only | `UndoRedoBridge.ts`: "Structural undo/redo only — no domain inversion"; UX-9.10 lists integration as UX-10+ | Windows, editor | No undo for data/graph/analysis actions | PRODUCT / UX | none | Scope decision for a real history product |
| **FINAL-PG-017** | Comparison resumes as KPI snapshot only | `ProjectComparisonV1` / `DatasetAnalysisProfileV1` persist; type comment: "SCI-58 KPI snapshot — not full comparison analysis or series" | Comparación | Reopened project shows KPIs, not a live comparison | OUTPUT-CONTRACT | PRODUCT DECISION | Decide if comparison must be resumable as analysis |
| **FINAL-PG-018** | Validator debt remains open | CRP-6.2 §12 records `validate:workspace-architecture` **FAIL 22/26 pre-existing**; scripts present in `package.json:40,142,364`; **not re-run in this audit** | Engineering | Gate noise | GOVERNANCE | OBS-1 | Keep as disclosed debt |
| **FINAL-PG-019** | Graph math cannot enter the PDF | `inferPdfExportPolicy` → `"never"` for derivative/integral/intersections/critical points/roots; enforced by tests | Editor vs PDF | On-chart analysis absent from publication output | OUTPUT-CONTRACT | **PRODUCT DECISION REQUIRED** | Confirm intent or revise policy deliberately |

### P3

| ID | Title | Evidence | Primary | Note |
|---|---|---|---|---|
| **FINAL-PG-020** | Inconsistent numeric conventions | p 4 dp; Cohen's d 2 dp; η²/ω² 3 dp; explorer scores 1 dp; VGB PCA 4 dp | OUTPUT-CONTRACT | Cosmetic-scientific consistency |
| **FINAL-PG-021** | EmptyState kit unused by data surfaces | data panels use `dataEmptyState` class strings; kit lives in `components/workspace/panels/empty/` | UX | UX-10 #9, still true |
| **FINAL-PG-022** | Module-gated items shown disabled without explanation | `Sidebar.tsx:544,554` driven by `isScientificModuleEnabled` (`page.tsx:15292,15296`) | UX | Not a broken feature |
| **FINAL-PG-023** | No runtime scientific assistance | `src/ai/` markers only; zero product imports | AI-ASSISTANCE | Gated by AIR-1 |
| **FINAL-PG-024** | Engines compute while panels are hidden | `resolve-toggle-visibility-hint.ts` already discloses this in-product | UX | Mitigated; monitor only |

---

## E. Existing-but-Poorly-Observable

Reconciled and reduced to what survives evidence: **FINAL-PG-003** (VGB error margin — the only true "calculated but wholly invisible" case), **FINAL-PG-012** (effect sizes reachable but not adjacent to their test), **FINAL-PG-008** (`displaySeries`, invisible because unconsumed), and **FINAL-PG-024** (disclosed, therefore lowest).

Explicitly **not** in this category any more: VGB PCA (variance % is displayed), VGB box numbers (printed), Graph Editor error bars (drawn, tooltipped at `MainComposedChart.tsx:123-150`, and tabulated at `page.tsx:23787-23826`).

---

## F. Missing Product Functions

1. Statistical/numeric export of certified results (**FINAL-PG-010**).
2. Publication path for VGB figures (**FINAL-PG-007**) — decision-gated.
3. Session-level restore surface (**FINAL-PG-011**).
4. Domain-level undo/redo (**FINAL-PG-016**).
5. Runtime scientific assistance (**FINAL-PG-023**) — governance-gated.

**Not** missing product functions, though previously implied: EXPORT-3 ZIP (deferred by charter), real MANOVA/t-SNE/UMAP/etc. (future scientific capability, section Q), draft recovery (exists).

---

## G. UX / CRP Status

| Item | Reconciled status | Evidence |
|---|---|---|
| UX-10 certification | **CLOSED WITH NON-BLOCKING FOLLOW-UPS** — both audits framed this correctly; follow-ups outstanding ≠ certification invalid | `UX-10-P0-CLOSURE-MATRIX.md`, `UX-10-FOLLOW-UP-REGISTER.md` |
| UX-10 #4 "Error Bars" label | **COMPLETED** | `VisualGraphBuilder.tsx:433` |
| UX-10 #5 WorkspaceContent identity | **OBSOLETE as a visible defect**; D47 decision still open | `WorkspaceContent.tsx:49-75` (`hidden`+`display:none`+`aria-hidden`), CRP-6.1 §4 |
| UX-10 #6 screenshots / Lovable | **COMPLETED** | `docs/CRP/visual-corpus/` (VC-01…VC-18, `INDEX.md`, `CAPTURE-MANIFEST.json`, Lovable package) |
| UX-10 #8 TS debt | **LIKELY OBSOLETE / UNVERIFIED** | CRP-6.2 §12 records `npx tsc --noEmit` **PASS**; not re-run here |
| UX-10 #7 validator debt | **PARTIAL / OPEN** | CRP-6.2 §12 `workspace-architecture` FAIL 22/26 |
| UX-10 #1 Session restore UI | **NOT IMPLEMENTED** (narrowed — project recovery exists) | FINAL-PG-011 |
| UX-10 #2 dirty/autosave presentation | **DEFERRED** (architectural) | Session contracts unchanged per CRP-6.2 §11 |
| UX-10 #3 Recharts interior | **PARTIAL / REDIRECTED** — GE interior is rich; the untouched interior is VGB's | `MainComposedChart.tsx` vs `GraphPreview.tsx` |
| UX-10 #9 EmptyState kit | **DEFERRED** | FINAL-PG-021 |
| CRP-2 false-affordance diagnosis | **CONSUMED** by CRP-6.1 §5.9 (New Series, Explorer/LeftPanel inert actions, Console theater) | CRP-2 §8-9, CRP-6.1 §5 |
| CRP-3/6.2 IDE scaffold + seeds | **ADDRESSED** — seeds off by default, panels collapsed | `ProductCompositionHost.tsx:122,133`; CRP-6.2 §13 |
| CRP-6 A14 empty-state honesty | **PARTIAL** by its own record | CRP-6 §A14 |
| CRP Phase 3 | **OPTIONAL / BLOCKED / NOT DEBT** per living roadmap | CRP-6.2 §15 superseding note |

**Governance note (FINAL-PG-018 adjacent):** CRP-6.2 documents an intentional validator tension (`validate-ux-2.10` freezes historical `*Collapsed: false` while the commercial face sets `true`) and states validators were deliberately not modified. That is a disclosed decision, not a gap.

---

## H. Duplications / SSOT / Architecture

**Verdict: Graph Editor and Visual Graph Builder have genuinely different input contracts and must not be merged on similarity grounds.** VGB consumes a `WorksheetModel` (columns, `xVariable`/`yVariable`/`groupVariable`, registry); the Graph Editor consumes `ExperimentalSeries[]`. `applyVisualGraphSpecification` bridges one way through `seriesToWorksheet(series)`.

| Capability | GE engine / SSOT | VGB engine / SSOT | Duplicated calc | Duplicated UI | Intentional | Behavioral divergence | Workflow implication |
|---|---|---|---|---|---|---|---|
| PCA | `buildPCAAnalysis:3712` | `buildPCAFromWorksheet:986` | Yes | Yes | Surfaces yes; divergence undetermined | **Yes** — standardize option, sign normalization | FINAL-PG-013 |
| Error bars | `buildErrorBarSeries` → `{meanY,stdDevY,semY,ci95Y,mode}`, drawn + tabulated | `computeErrorMargin` → single `error` | Related formula, different contract | GE only | Split yes; silence no | Yes — one surfaces, one doesn't | FINAL-PG-003 |
| Box plot | T3-019 Results contract incl. `outlierCount` | five-number summary, decorative geometry | Overlapping quantiles, two helpers | Yes, incompatible | Yes (batch3F separates them) | Yes | FINAL-PG-005, FINAL-PG-015 |
| Outliers | IQR (T3-020) + z (T3-021) detectors | none | No | No | Yes | — | none |
| KDE / violin | KDE engine feeding assumptions/report | raw values | No | Name collision | Accidental | Yes | FINAL-PG-006 |
| Heatmap | `HeatmapAnalysis` (correlation/values, bounds) | worksheet heatmap builder | Parallel | Yes | Yes | Minor | export gap only |
| Bubble | `BubblePlotAnalysis` (links SCI-8 outliers) | `buildBubblePointsFromWorksheet` | Parallel | Yes | Yes | GE richer | export gap only |
| Scatter / line | series → chart → full analysis chain | preview + orphaned `displaySeries` | Partial | Yes | Split yes; orphan no | Yes | FINAL-PG-008 |

---

## I. Workflow Inconsistencies

Traced create-path: `handleCreateGraph` → `applyVisualGraphSpecification` → `handleVisualGraphCreate` → append to `projectVisualGraphs`, **overwrite `title`**, navigate to Results.

| VGB type | Preview | Persisted | Results | Analysis-ready | Report | PDF | PNG/SVG | JSON/data |
|---|---|---|---|---|---|---|---|---|
| scatter | Yes | spec (preview rebuilt on hydrate) | Yes | **No** | No | No | No | No |
| line | Yes | Yes | Yes | **No** | No | No | No | No |
| bar | Yes, minus error | Yes | Yes | No | No | No | No | No |
| histogram | Yes | Yes | Yes | No | No | No | No | No |
| box | Numbers + decorative shape | Yes | Yes | No | No | No | No | No |
| violin | Raw-value bars | Yes | Yes | No | No | No | No | No |
| heatmap | Yes | Yes | Yes | No | No | No | No | No |
| bubble | Yes | Yes | Yes | No | No | No | No | No |
| PCA | Yes, with variance % | Yes | Yes | No | No | No | No | No |

**Boundary verdict: C — both.** Intentional: the two input contracts, spec-only persistence, and explicit no-preview-leak tests. Incomplete: `displaySeries` produced for no consumer, no export path, no report presence, and the title side effect. The intentional half is **not** a gap; the incomplete half is FINAL-PG-007/008/009/014.

Other workflow items: guided workflows navigate and toggle but do not carry VGB output; `explore-structure` stops at SCI-40 by charter (intentional); Pack Lite degrades to `pdf-only` when the chart is empty (documented status, `resolvePublicationPackLiteStatus`).

---

## J. Results / Report / PDF / Export Parity

Parity is **not** inferred from the existence of an export function.

| Capability | Calculated | User-visible | Results | Report | PDF | Export |
|---|---|---|---|---|---|---|
| VGB error margin | Yes | **No** | No | No | No | No |
| GE error bars (SD/SEM/IC95 + mode) | Yes | Yes | Yes | Yes | when visible | pixels only |
| ANOVA η²/ω² | Yes | Toggle-gated (SCI-57) | Partial | Yes | `sci-57` | PDF only |
| p-values | Yes (approximate) | Yes, unqualified | Yes | Yes | Yes | PDF only |
| N | Yes | Mostly | Yes | Yes | Yes | PDF only |
| Uncertainty (CI d, mean diff, IC95) | Yes | Yes | Yes | Yes | Yes | PDF only |
| Outlier counts | GE yes | Yes | Yes | `panel--outliers` | Yes | PDF only |
| PCA | GE + VGB | Both | GE + VGB gallery | GE only | GE only | pixels (GE only) |
| MDS | Yes | Yes | Yes | `panel--m-d-s` | Yes | PDF only |
| Explorers | Always when inputs exist | Toggle-gated | Yes | Yes, under method names | Yes | PDF only |
| Comparison SCI-58 | Yes | Dashboard | Yes | Report lines | `PDF_BLOCK_COMPARISON_ID` | snapshot in `.sgproj` |
| Graph math | Yes | Chart only | Chart | No | **Never** | pixels only |

**Export surface inventory (reconciled):**

| Export | Geometry | Source data | Calculated points | Statistics | Metadata | Result contracts |
|---|---|---|---|---|---|---|
| `.sgproj` project | VGB specs (preview rebuilt) | datasets | no (ephemeral excluded) | comparison KPI snapshot only | yes | partial |
| PNG (`exportChartPng`) | pixels | — | rendered only | no | filename only | no |
| SVG (`exportChartSvg`) | vector | — | rendered only | no | filename only | no |
| JSON (`exportChartJson`) | axis bounds | **no** | **no** | **no** | title/expression | **no** |
| Worksheet TSV (clipboard) | — | **yes** | transforms | no | no | no |
| PDF | chart image + report prose | no | no | **as prose** | report metadata | filtered sections |
| Pack Lite | PDF + companion PNG | no | no | as prose | pack semantics | no ZIP |

Structural notes: `isPdfSectionTitleAllowed` keeps unknown titles ("no silent drop"); `shouldIncludePdfExportBlock` includes all blocks when `allowedPdfSectionIds` is undefined, so PDF content varies by call path.

---

## K. Scientific Communication / Honesty (final reconciled table)

| UI name | Actual method | Heuristic | Reuses | True impl. | Honest name | Results | Report | PDF | Enters SCI-50 | Presented as evidence | Class | Priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| MANOVA Explorer | `(pcaVar/100 + clipped distance ratio)/2` | Yes | PCA, distance, clustering | No | **No** | Yes | Yes | Yes | **Yes** | **Yes** | SCI-COMM | P0 |
| LDA Explorer | `(pcaVar + manovaScore·100)/2` | Yes | PCA, MANOVA expl. | No | **No** | Yes | Yes | Yes | **Yes** | **Yes** | SCI-COMM | P0 |
| Canonical Correlation | `(corrDensity·100 + avgSimilarity·100)/2` | Yes | networks, importance | No | **No** | Yes | Yes | Yes | indirect | Yes | SCI-COMM | P0 |
| PCR Explorer | `(pcaVar + top3Importance)/2` | Yes | PCA, importance | No | **No** | Yes | Yes | Yes | **Yes** | **Yes** | SCI-COMM | P0 |
| PLS Explorer | mean(pcaVar, pcrScore, canonicalScore) | Yes | above | No | **No** | Yes | Yes | Yes | **Yes** | **Yes** | SCI-COMM | P0 |
| Bootstrap Explorer | mean(sample, normality, PCA, PCR) — **no resampling** | Yes | above | No | **No** (most severe) | Yes | Yes | Yes | **Yes** | **Yes** | SCI-COMM | P0 |
| Sensitivity Explorer | mean(bootstrap, PCA, PLS, importance balance) | Yes | above | No | **No** | Yes | Yes | Yes | **Yes** | **Yes** | SCI-COMM | P0 |
| t-SNE Explorer | MDS points copied; score = similarity·100 | Yes | MDS | No | **No** | Yes (tsne1/tsne2 axes) | Yes | Yes | **Yes** | **Yes** | SCI-COMM | P0 |
| UMAP Explorer | MDS + `sin/cos·0.15` jitter | Yes | MDS | No | **No** (most misleading geometry) | Yes (UMAP-1/2 axes, 4 dp) | Yes | Yes | **Yes** | **Yes** | SCI-COMM | P0 |
| Variable Importance | additive index: PC1 contribution + degrees + distance, ×0.25 if constant | Composite | PCA, networks | Not permutation/SHAP | Borderline — needs method note | Yes | Yes | Yes | indirect | Yes | SCI-COMM | P1 |
| VGB Violin | raw values as bars | Viz | none | No | **No** | Yes | No | No | No | No | SCI-COMM | P1 |
| p-values | approximate CDFs, printed 4 dp | Approx. | `distribution.ts` | Approximation | **Not disclosed** | Yes | Yes | Yes | via inference | Yes | OUTPUT-CONTRACT | P1 |
| MDS | classical scaling, power iteration, stress | No | own | **Yes** | Yes | Yes | Yes | Yes | Yes | Yes | — | — |
| PCA (GE/VGB) | covariance + power iteration | No | own | **Yes** (2 components) | Yes with a method note | Yes | GE only | GE only | Yes | Yes | — | — |
| Observed power | derived from statistic, **disclaimer emitted** | Known limit | `effect-size.ts` | — | **Yes — the in-product precedent** | Yes | Yes | Yes | — | — | — | — |

---

## L. AI / Scientific Assistance

| Layer | Runtime today | Correct description |
|---|---|---|
| `src/ai/**` | **Not runtime** — phase/status constants, zero product imports | Architecture markers |
| Scientific Assistant | **Runtime, deterministic rules** over ~60 analysis inputs, copyable | Rule-based synthesis, **not LLM** |
| Statistical Advisor | **Runtime, deterministic rules** with confidence bands (n = 15/30) | Rule-based recommendation |
| SCI-19 interpretation | **Runtime, deterministic text** | Templated interpretation |
| SCI-50+ methodology | **Runtime, deterministic scoring** — and the vector for FINAL-PG-002 | Scored methodology summary |
| Smart Start | **Runtime, rule-based intent mapping** | Navigation aid |
| Guided workflows | **Runtime, static templates + conditional toggles** | Workflow scaffolding |

Nothing here is model-backed. The assistive role — explanation, assumption surfacing, method counsel, inconsistency detection, workflow guidance — remains available as future scope under AIR-1. Autonomous paper generation and autonomous scientific claims remain out of scope and are not proposed anywhere in this document.

---

## M. Product vs Scientific-Engine Classification

| Observation | Correct category |
|---|---|
| T3-015…T3-021 estimators, GE error-bar math, KDE, MDS, PCA, inference statistics | **SCIENTIFIC ENGINE CORRECT** (closed) |
| Hidden VGB error margin; decorative box; violin without density | **SCIENTIFIC OUTPUT / PRODUCT incomplete** |
| Explorer names; SCI-50 supporting modules; undisclosed p-value approximation | **SCIENTIFIC COMMUNICATION** |
| Orphaned `displaySeries`; dual PCA; duplicate quantile helper | **ARCHITECTURE** |
| VGB unexportable; JSON without data; effect-size adjacency | **OUTPUT-CONTRACT** |
| Title overwrite; session restore surface | **WORKFLOW / PRODUCT** |
| Real MANOVA / t-SNE / UMAP / bootstrap | **FUTURE SCIENTIFIC-CAPABILITY** — never a Tier 3 reopen |
| Validator tension; AIR-1; EXPORT-3 | **GOVERNANCE / DEFERRED** |

---

## N. Final Priority Matrix

**P0 (3)** — FINAL-PG-001 explorer naming · FINAL-PG-002 SCI-50 supporting modules in report/PDF · FINAL-PG-003 silent error-bar control.

**P1 (8)** — FINAL-PG-004 p-value disclosure · FINAL-PG-005 box geometry · FINAL-PG-006 violin · FINAL-PG-007 VGB publication path · FINAL-PG-008 orphaned `displaySeries` · FINAL-PG-009 title overwrite · FINAL-PG-010 results export · FINAL-PG-011 session restore surface.

**P2 (8)** — FINAL-PG-012 effect-size adjacency · FINAL-PG-013 dual PCA · FINAL-PG-014 preset inconsistency · FINAL-PG-015 quantile duplication · FINAL-PG-016 undo scope · FINAL-PG-017 comparison resumability · FINAL-PG-018 validator debt · FINAL-PG-019 graph-math PDF policy.

**P3 (5)** — FINAL-PG-020 rounding · FINAL-PG-021 EmptyState kit · FINAL-PG-022 disabled affordances · FINAL-PG-023 AI runtime · FINAL-PG-024 hidden-but-computed.

---

## O. Dependencies

```
FINAL-PG-001 ── FINAL-PG-002        (same naming/disclosure decision; PG-002 also exits in PDF)
FINAL-PG-003 ── FINAL-PG-007        (what VGB is for determines how far the number must travel)
FINAL-PG-007 ── FINAL-PG-014        (presets only matter if VGB is publication-grade)
FINAL-PG-008 ── VGB-feeds-inference decision
FINAL-PG-013 ── FINAL-PG-015        (both resolve under one PCA/quantile SSOT decision)
FINAL-PG-011 ── Session/D47 architecture (ARCH-U, deferred)
FINAL-PG-010 ── independent (consumes existing result objects only)
FINAL-PG-004 ── independent (disclosure only; engines untouched)
FINAL-PG-023 ── AIR-1 authorization
```

**PRODUCT DECISIONS REQUIRED** (facts insufficient — not gaps):

| # | Decision | Evidence to weigh |
|---|---|---|
| 1 | Is VGB a publication surface or exploration-only? | Persisted specs + Results gallery vs zero report/PDF/image path |
| 2 | Should VGB feed inference? | `displaySeries` exists, unconsumed, deliberately non-persisted |
| 3 | One PCA/quantile SSOT, or two by contract? | Divergent standardization and sign handling |
| 4 | Should graph math enter the PDF? | `"never"` policy is explicit and test-locked |
| 5 | Must comparison resume as live analysis? | Snapshot contract is documented in the type |
| 6 | Remedy direction for explorer naming: disclose/rename vs future real implementations | Names already reach report and PDF |
| 7 | Does session-level restore warrant a UI? | Engine complete; scope deferred; project recovery already exists |

---

## P. Recommended Execution Order (workstreams only)

1. **Scientific communication integrity** — the naming and disclosure surface, including the SCI-50 report/PDF path and the p-value qualifier. Highest trust impact, no engine dependency.
2. **Affordance truthfulness** — controls and graphics that promise something they do not deliver (error-bar selector, box geometry, violin, JSON export label).
3. **Product decision round** — the seven decisions in section O, which unblock most P1/P2 work.
4. **Output contract completion** — whatever the decisions authorize: results export, VGB publication path, effect-size adjacency.
5. **Continuity and state** — session restore surface, comparison resumability, title-coupling cleanup.
6. **Architecture hygiene** — PCA/quantile SSOT, orphaned `displaySeries` disposition, validator debt.
7. **Deferred tracks** — AI assistance under AIR-1, EXPORT-3, plugins, collaboration.

No phases, sequencing commitments, or implementation steps are defined here.

---

## Q. Explicitly Deferred

AIR-1 / runtime AI · EXPORT-3 ZIP manuscript pack · COLLAB realtime / CRDT · PLUGINS loading · Cloud + Supabase RLS · ARCH-U (D47, Session contracts, Window/Dock/Layout) · UX-10 #2 dirty/autosave presentation · OBS-1 validator campaign · CRP Phase 3 (classified OPTIONAL / BLOCKED / NOT DEBT) · version bump · genuine future implementations of MANOVA, LDA, CCA, PCR, PLS, bootstrap resampling, t-SNE, UMAP, and permutation-based importance — **as future scientific capability, never as a Tier 3 reopen**.

---

## R. Items That Must NOT Be Implemented

- Reopening T3-015…T3-021 or creating **T3-022+**.
- Implementing real multivariate methods **merely to justify existing labels** under product pressure.
- Altering p-value engines in response to FINAL-PG-004 — the gap is disclosure.
- Merging Graph Editor and VGB engines on similarity grounds.
- Modifying validators to obtain PASS (explicitly forbidden by CRP-6.2 §11).
- Autonomous paper generation, autonomous scientific claims, or any substitution for researcher judgment.
- Any refactor, rename, commit, push, or deployment authorized by this document — none is.

---

## S. Removed / Rejected Findings

| Removed | Verdict | Why |
|---|---|---|
| "Screenshot corpus MISSING" (UX-10 #6) | **OBSOLETE** | `docs/CRP/visual-corpus/` contains VC-01…VC-18 with index, manifest, capture script, and Lovable package |
| "Static Current Project / Ready" | **OBSOLETE** | Rendered `hidden` + `display:none` + `aria-hidden`; retained only for freeze validators (CRP-6.1 §4) |
| "Seed demo windows overlay work" | **OBSOLETE** | CRP-6.2 turned seeds off by default (env opt-in) |
| "TypeScript debt" (UX-10 #8) | **LIKELY OBSOLETE / UNVERIFIED** | CRP-6.2 §12 records `tsc --noEmit` PASS; not re-run here |
| "VGB output invisible / dead end" | **FALSE** | Results gallery `page.tsx:23262-23311`; persisted in `.sgproj` |
| "Scatter/line are analysis-ready" | **FALSE** | `displaySeries` unconsumed — now FINAL-PG-008 |
| "No export capability" | **FALSE** | Seven surfaces exist — reframed as FINAL-PG-010 (no *statistics*) |
| "VGB has no numeric readout" | **OVERGENERALIZED** | VGB PCA shows variance % and 4-dp scores |
| "EXPORT-3 ZIP missing" | **INTENTIONAL / DEFERRED** | Out of scope by SPE/SDC charters; not a gap |
| "`explore-structure` incomplete" | **INTENTIONAL** | SPE charter designates it regression-only, not the DoD spine |
| "Comparison persistence broken" | **INTENTIONAL, narrowed** | Snapshot contract documented in `project/types.ts:84`; retained only as FINAL-PG-017 decision |
| Duplicate framings of VGB CI (PG-001 vs PG-007 vs parity rows) | **DEDUPLICATED** | Consolidated into FINAL-PG-003 and FINAL-PG-007 |

---

## T. Governance Confirmation

- No files were modified.
- No source code was changed.
- No refactor, reorganization, or rename occurred.
- No UX implementation was performed.
- No AI implementation was performed.
- No scientific engine was implemented or altered.
- No validator, contract, or configuration was touched.
- No Tier 3 case was reopened; no **T3-022+** was created.
- No commit, push, or deployment occurred.
- No build, typecheck, or validator was executed during this reconciliation; items depending on execution are marked **UNVERIFIED** rather than asserted.

**Tier 3 remains CLOSED at `f0730a2`.** This document is the authoritative, reconciled evidence base for Product Reorganization and Product Completion — findings and decisions only, no implementation.
