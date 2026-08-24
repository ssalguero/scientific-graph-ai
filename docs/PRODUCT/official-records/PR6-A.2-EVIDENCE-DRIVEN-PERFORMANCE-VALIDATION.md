# Official Record

# PR6-A.2 — Evidence-Driven Performance Validation

**Product:** Scientific Graph AI  
**Record Date:** 2026-08-24  
**Implementation Series:** Product Reorganization  
**Phase:** PR6-A Wave 2 (PR6-A.2)  
**Phase Status:** **EVIDENCE RECORDED / NOT A PR6-A CERTIFICATION / CP-7 NOT ISSUED**  
**Wave 0 checkpoint:** `c0a3599` — `docs(pr6): reconcile validation certification ssot`  
**Wave 1 checkpoint:** `e47f892` — `docs(pr6): certify integrated regression evidence`  
**HEAD measured:** `e47f8927466b0fa23af47ff5c2f8444dc303a161`  
**Decision Authority:** PROJECT OWNER / PRODUCT GOVERNANCE AUTHORITY  
**Implementation Authority:** Frozen PD-01–PD-07; certified PR0-A through PR5; PR6-A charter; PERFORMANCE I0–I10 **RELEASE CERTIFIED / FROZEN**  
**Charter:** [`PR6-A-INTEGRATED-VALIDATION-PERFORMANCE-EVIDENCE-CERTIFICATION-PROPOSAL.md`](./PR6-A-INTEGRATED-VALIDATION-PERFORMANCE-EVIDENCE-CERTIFICATION-PROPOSAL.md)

```text
PR6-A WAVE 2 = MEASURE FIRST → CLASSIFY → DO NOT OPTIMIZE BY DEFAULT
PR6-A = NOT CERTIFIED
CP-7 = NOT ISSUED
PRODUCT V1 / 1.0.0 = EXISTING BASELINE (NOT REOPENED)
PERFORMANCE I0–I10 = CONSUMED / NOT REOPENED / NOT RE-CERTIFIED
NEW PR6-A PERFORMANCE REGRESSION = NO
OPTIMIZATION IMPLEMENTED = NONE
WAVE 3 = NOT STARTED
```

**PR6-A Wave 2 is evidence work and does not certify PR6-A or CP-7.**

No product code, scientific contracts, PERFORMANCE I0–I10 implementation, validator thresholds, Session, VGB lifecycle semantics, CTR-08/09/10, or Product Face architecture were modified in this wave.

Governing rule applied: **MEASURE FIRST → CLASSIFY → ONLY IMPLEMENT IF A REAL PR6-OWNED REGRESSION IS PROVEN.** Category E was not demonstrated. No optimization was implemented.

---

## 1. Baseline

| Item | Value |
|---|---|
| Branch | `main` |
| HEAD at Wave 2 start | `e47f8927466b0fa23af47ff5c2f8444dc303a161` |
| Tracking | `main...origin/main` (synchronized; working tree clean at start) |
| PR5 | CLOSED / CERTIFIED |
| PR6-A Wave 0 | certified checkpoint `c0a3599` |
| PR6-A Wave 1 | certified checkpoint `e47f892` |
| PR6-A status | CHARTER APPROVED / NOT CERTIFIED |
| Wave 2 | evidence recorded here; does not certify PR6-A or CP-7 |
| Wave 3 | NOT STARTED |
| Method | inspect existing `package.json` scripts and certified PERFORMANCE I0–I10 → execute named commands only → classify → document → stop |

Commands were taken from `package.json`. No validator names were invented. No new benchmark harness was created. I0–I10 certification files were not rewritten.

---

## 2. Environment

Recorded immediately before measurement on 2026-08-24 (UTC start ≈ 20:58).

| Field | Value |
|---|---|
| OS | Microsoft Windows 10 Home Single Language |
| OS version | Microsoft Windows NT 10.0.19045.0 |
| Architecture | AMD64 |
| CPU | Intel(R) Core(TM) i5-3320M CPU @ 2.60GHz |
| Cores | 2 physical / 4 logical |
| RAM total | 3.89 GB |
| RAM free at capture | 0.46 GB |
| Node | v24.16.0 |
| npm | 11.13.0 |
| Package | `scientific-graph-ai@1.0.0` |
| Runtime | local Node / `npx tsx` validators |
| Browser | **not used** (no Playwright/browser pass in this wave) |
| Build mode | **not a Next.js production build**; not production hosting |
| Measurement class | local/dev workstation |

**Environment limitation (binding for classification):** this machine is memory-constrained (~4 GB RAM, <0.5 GB free at capture). Validator **suite wall-clock** includes `npx tsx` startup, npm overhead, and possible paging. Suite duration is **not** a product SLO and must not be treated as a regression signal. No hardware-normalized claims are made.

---

## 3. Existing performance infrastructure

PERFORMANCE I0–I10 remain **RELEASE CERTIFIED / FROZEN**. This wave **consumed** them. It does **not** re-certify I0–I10, change contracts, rewrite validators, lower thresholds, or alter baseline semantics.

Authority: [`docs/PERFORMANCE/implementation/README.md`](../../PERFORMANCE/implementation/README.md) and [`PERFORMANCE-I10-Production-Certification-Pack.md`](../../PERFORMANCE/implementation/PERFORMANCE-I10-Production-Certification-Pack.md). Planning-index freeze language in [`docs/PERFORMANCE/official-records/README.md`](../../PERFORMANCE/official-records/README.md) was **not** rewritten.

### 3.1 I0–I10 capabilities reused

| ID | Capability reused | What it actually measures |
|---|---|---|
| I0 | Foundation / identity | Package identity and frozen layout (`validate:performance-foundation`) |
| I1 | Measurement core | Collect → aggregate of **supplied** numeric samples (`validate:performance-measurement-core`) |
| I2 | Instrumentation seams | Read-only ENGINE/DATA/UX **surface availability**. `observeEnginePublicSurface` confirms `createProject`, `openProject`, `closeProject`, `saveProject`, `importDataset`, `exportProject` (and related public labels) exist as functions; it **does not call** those APIs |
| I3 | Budgets / SLOs | Empty product budget registry (`createBudgetRegistry` starts empty; no invented product SLOs) (`validate:performance-budgets`) |
| I4 | Workloads / baselines | `runWorkloadHarness` feeds explicit `numericValues`; **no product workload catalog** (`validate:performance-workloads`) |
| I5 | Domain measurement waves | ENGINE/DATA/UX waves over I2 surfaces; AI/COLLAB/PLUGINS conditional (`validate:performance-domain-waves`) |
| I6 | Cross-domain | Fixture UX→ENGINE→DATA observation sequence (not product orchestration) (`validate:performance-cross-domain`) |
| I7 | Optimization waves | Evidence-gated fixture-only optimize path (not executed as product optimization) (`validate:performance-optimize`) |
| I8 | Regression / CI gates | Gate readiness (`validate:performance-gates`) + `ci:performance-gates` |
| I9 | Integrity | Aggregation / baseline / evidence integrity (`validate:performance-integrity`) |
| I10 | Certification pack | Consumed as frozen authority (`validate:performance-boundaries`); **not rewritten** |

Certified I4 record: fixture/generic workloads only; in-memory baselines; **no product-specific ENGINE/DATA/UX scenario catalogs**. Certified I3 policy: **no invented product budgets**. Certified I2 ENGINE adapter: emit `1` or `0` for `typeof fn === "function"`; **does not invoke workflows**.

Therefore I0–I10 **cannot** produce representative wall-clock for project save/open, scientific estimator runs, VGB approval, or browser PDF. That limitation is reported (classification D). The frozen layer was **not** modified to invent those benches.

### 3.2 Additional existing named scripts consumed (not I0–I10)

These already existed in `package.json`. They are **not** PERFORMANCE I0–I10 recertification and were not rewritten.

| Script | Role |
|---|---|
| `validate:prod2e-d26-heatmap-perf` | Documental heatmap preview timing (non-blocking) |
| `validate:prod2e-d27-bubble-perf` | Documental bubble preview timing (non-blocking) |
| `validate:prod2e-d28-pca-perf` | Documental PCA preview timing (non-blocking) |
| `validate:prod3-d39-scatter-perf` | Documental scatter preview timing (non-blocking) |
| `validate:export1-d42-2-testing` | EXPORT-1 path/timing harness (Node stub; existing `<15000ms` path check) |
| `validate:export2-d44-3-testing` | EXPORT-2 path + microtiming (Node; not full PDF bytes) |
| `validate:persistence-unit` | Persistence correctness (23 cases) |
| `validate:prod2b-indexeddb` | IndexedDB local-project correctness (25 cases) |
| `validate:prod2b-b2-serialize` | Serialize correctness (18 cases) |
| `validate:prod2b-b2-hydrate` | Hydrate/rebuild correctness (22 cases) |
| `validate:prod2b-b6-size` | Project **size-warning policy** (10 cases; not a timer) |
| `validate:prod2c-c8-regression-gate` | VGB persistence composite |
| `validate:pr4-figure-lifecycle-unit` | Figure lifecycle **semantics** (33 cases) |
| `validate:pr3-numeric-export-unit` | Numeric publication export **semantics** (26 cases) |
| `validate:methodology-unit` | Methodology **correctness** (388 cases) |

Product Face / navigation: **no existing UI benchmark** in `package.json`. None was created.

### 3.3 Realistic fixtures used (repository)

Preview/perf scripts use `scripts/fixtures/project-v2-dataset5-minimal.sgproj` (**6557 bytes**). Other repository `.sgproj` fixtures range **1861–7581 bytes**. There is **no large-project fixture**. Wave 2 did not invent one.

---

## 4. Measurements

Classification legend:

- **A** — PASS / NO REGRESSION (consistent with certified baseline / frozen gate still holds)
- **B** — OBSERVATION / NO ACTION
- **C** — INHERITED / KNOWN
- **D** — ENVIRONMENT / MEASUREMENT LIMITATION
- **E** — NEW PR6-A PERFORMANCE REGRESSION

### 4.1 PERFORMANCE I0–I10 validators (frozen layer consumed)

One run each, local Node, HEAD `e47f892`. These prove the frozen measurement/gate layer still executes. They are **not** product operation timings. This run is **not** I0–I10 recertification.

| Workload | Fixture/dataset | Operation | Repetitions | Method | Result | Variance/noise | Classification |
|---|---|---|---|---|---|---|---|
| I0 foundation | I0 layout/identity | `npm run validate:performance-foundation` | 1 | existing validator | **240 checks PASS**, exit 0, suite 5152 ms | suite clock includes tsx startup | **A** (layer still PASS) / **D** (suite ms ≠ product SLO) |
| I1 measurement core | I1 collect/aggregate | `validate:performance-measurement-core` | 1 | existing validator | **352 checks PASS**, exit 0, 3690 ms | same | **A** / **D** (suite ms) |
| I2 instrumentation | ENGINE/DATA/UX surface | `validate:performance-instrumentation` | 1 | existing validator | **169 checks PASS**, exit 0, 9249 ms | same | **A** / **D** |
| I3 budgets | empty registry policy | `validate:performance-budgets` | 1 | existing validator | **231 checks PASS**, exit 0, 3235 ms | same | **A** / **D** |
| I4 workloads | fixture `numericValues` | `validate:performance-workloads` | 1 | existing validator | **173 checks PASS**, exit 0, 2980 ms | same | **A** / **D** |
| I5 domain waves | I2 single-domain seams | `validate:performance-domain-waves` | 1 | existing validator | **182 checks PASS**, exit 0, 7315 ms | same | **A** / **D** |
| I6 cross-domain | fixture UX→ENGINE→DATA | `validate:performance-cross-domain` | 1 | existing validator | **182 checks PASS**, exit 0, 8226 ms | same | **A** / **D** |
| I7 optimize path | fixture-controlled only | `validate:performance-optimize` | 1 | existing validator | **180 checks PASS**, exit 0, 4128 ms | same | **A** / **D** |
| I8 gates | gate readiness | `validate:performance-gates` | 1 | existing validator | **183 checks PASS**, exit 0, 3230 ms | same | **A** / **D** |
| I9 integrity | integrity pack | `validate:performance-integrity` | 1 | existing validator | **490 checks PASS**, exit 0, 3127 ms | same | **A** / **D** |
| I10 boundaries | peer-boundary audit | `validate:performance-boundaries` | 1 | existing validator | **16 checks PASS**, exit 0, 5906 ms | same | **A** / **D** |
| I8 CI entry | `ci:performance-gates` | CI self-check | 1 | existing script | **PASS**, exit 0, 4276 ms; expected self-check `regression outcome=FAIL ciShouldFail=true` (integrity of fail path, not a product regression) | n/a | **A** |

### 4.2 Project persistence

I2 does not invoke `saveProject` / `openProject`. No dedicated persistence **timer** exists. Existing serialize/hydrate/IndexedDB **correctness** gates were executed.

| Workload | Fixture/dataset | Operation | Repetitions | Method | Result | Variance/noise | Classification |
|---|---|---|---|---|---|---|---|
| Persistence unit | persistence case suite | `validate:persistence-unit` | 1 suite | existing gate | **23/23 PASS**, exit 0, suite 6092 ms | suite clock | **A** functional vs Wave 1; **D** as save/open SLO |
| IndexedDB local project | IndexedDB case suite | `validate:prod2b-indexeddb` | 1 suite | existing gate | **25/25 PASS**, exit 0, 6044 ms | Node unit, not browser IDB profiling | **A** functional; **D** browser IDB wall-clock |
| Serialize | B2 serialize cases | `validate:prod2b-b2-serialize` | 1 suite | existing gate | **18 cases PASS**, exit 0, 5886 ms | suite clock | **A** functional; **D** serialize SLO |
| Hydrate / rebuild | B2 hydrate cases | `validate:prod2b-b2-hydrate` | 1 suite | existing gate | **22 cases PASS**, exit 0, 6448 ms | suite clock | **A** functional; **D** hydrate SLO |
| Size policy | B6 size cases | `validate:prod2b-b6-size` | 1 suite | existing gate | **10/10 PASS**, exit 0, 3036 ms | measures **size-warning policy**, not elapsed time | **C** (known size policy) / **D** (not a timer) |
| Project save/open wall-clock | realistic large project | ENGINE `saveProject` / `openProject` | — | **no existing command** | **not measured** | I2 explicitly does not call ENGINE APIs; fixtures ≤ 8 KB | **D** |

### 4.3 Scientific computation

Existing documental preview timers time `buildVisualGraphPreview` on `scripts/fixtures/project-v2-dataset5-minimal.sgproj` (**6557 bytes**), 100 iterations, `performance.now()`. Scripts set `blocking: false`. They do **not** time methodology estimators as a certified SLO.

Two runs of each preview script (run-to-run variance):

| Workload | Fixture/dataset | Operation | Repetitions | Method | Result | Variance/noise | Classification |
|---|---|---|---|---|---|---|---|
| Heatmap preview | `project-v2-dataset5-minimal.sgproj` (6557 B) | `buildVisualGraphPreview` heatmap | 100 + 100 | `validate:prod2e-d26-heatmap-perf` | run1 median **0.066 ms** p95 **0.1607 ms**; run2 median **0.065 ms** p95 **0.1509 ms** | low run-to-run delta; tiny fixture | **B** / **C** (D26.5 documental; no certified SLO) |
| Bubble preview | same | bubble preview | 100 + 100 | `validate:prod2e-d27-bubble-perf` | run1 median **0.0356 ms** p95 **0.1048 ms**; run2 median **0.0294 ms** p95 **0.0853 ms** | low | **B** / **C** (D27.5 documental) |
| PCA preview | same | PCA preview (`pcaStandardize: true`, `pcaVariables`: `d5-control1`, `d5-tratamiento1`, `d5-control2`) | 100 + 100 | `validate:prod2e-d28-pca-perf` | run1 mean **0.9909** median **0.83** p95 **1.603** ms; run2 mean **1.0117** median **0.843** p95 **1.5787** ms | ~0.02 ms mean delta | **B** / **C** (D28.5 documental). **Not** a methodology-estimator SLO; algorithms not altered |
| Methodology correctness | F5A–F5E unit pack | `validate:methodology-unit` | 1 suite | existing gate | **388 PASS** (`methodology-f5a-unit` 214 + `f5b` 67 + `f5c` 38 + `f5d` 28 + `f5e` 41), exit 0, suite **19776 ms** | suite clock on constrained RAM | **A** functional vs Wave 1; **D** as compute SLO (duration ≠ estimator benchmark) |
| Data import wall-clock | large import | `importDataset` | — | **no existing perf command** | **not measured** | I2 does not call `importDataset` | **D** |

### 4.4 VGB / figure lifecycle

Preview timings above are **working-figure preview**, not review/approval/publication semantics.

| Workload | Fixture/dataset | Operation | Repetitions | Method | Result | Variance/noise | Classification |
|---|---|---|---|---|---|---|---|
| Scatter preview | dataset5-minimal (6557 B) | scatter `buildVisualGraphPreview` | 100 + 100 | `validate:prod3-d39-scatter-perf` | run1 median **0.0344 ms** p95 **0.1019 ms**; run2 median **0.0252 ms** p95 **0.0745 ms** | low | **B** / **C** (D39 documental) |
| Figure lifecycle semantics | PR4 unit cases | create / review / approve / publish contracts | 1 suite | `validate:pr4-figure-lifecycle-unit` | **33/33 PASS**, exit 0, suite 5280 ms | suite clock | **A** functional vs Wave 1; **D** as lifecycle wall-clock |
| VGB persist composite | C8 nested gates | mapper/collect/hydrate/UI/fixtures | 1 composite | `validate:prod2c-c8-regression-gate` | **PASS** (5 nested gates), exit 0, suite **32375 ms** | composite + low RAM; not a lifecycle SLO | **A** functional; **D** as timer |
| Review / approval / publication wall-clock | realistic figure set | lifecycle transitions timed | — | **no existing timer** | **not measured** | would require new harness or browser | **D** |

### 4.5 Export / reporting

CTR-08/09/10 were **not** reopened. Export **behavior** was not changed.

| Workload | Fixture/dataset | Operation | Repetitions | Method | Result | Variance/noise | Classification |
|---|---|---|---|---|---|---|---|
| EXPORT-1 Node capture path | fake 0×0 DIV | `captureChartAsPngDataUrl` / `captureChartAsSvgDataUrl`; existing `<15000 ms` check | 1 | `validate:export1-d42-2-testing` | **21 PASS / 0 FAIL**; png **22.4 ms**, svg **19.0 ms**; `pngOk=false` / `svgOk=false` because **zero-size skip** (controlled); threshold PASS | Node stub, not browser chart capture | **D** for real PNG/SVG/PDF; **A** vs existing path check |
| EXPORT-2 PDF section path | visibility fixtures in harness | `resolvePdfSectionsForState` + zero-size png | 1 | `validate:export2-d44-3-testing` | **27 PASS / 0 FAIL**; `resolvePdfSectionsForState.default` **0.459 ms**, `filterScientificReportSectionsForPdf.default` **0.146 ms**, visible **0.091 ms**, `captureChartAsPngDataUrl.zeroSize` **8.96 ms** | Node; not assembled PDF bytes | **B** microtiming; **D** for real PDF export |
| Numeric publication export | PR3 numeric-export cases | `validate:pr3-numeric-export-unit` | 1 suite | existing gate | **26/26 PASS**, exit 0, 2963 ms | suite clock | **A** functional vs Wave 1; **D** as export SLO |
| Browser PDF / full chart capture | real chart DOM | Playwright/browser export | — | **not run** (no Wave 2 browser command required; none invented) | **not measured** | environment + missing Wave 2 browser pass | **D** |

### 4.6 Product Face / navigation

No existing UI benchmark. Wave 2 is not a visual optimization pass. **Not measured.** Classification **D** (by instruction: do not create a generic UI benchmark).

---

## 5. Performance matrix

Only rows that can be stated from executed commands or an explicit infrastructure gap.

| Workload | Measurement | Baseline | Observed | Classification | Evidence |
|---|---|---|---|---|---|
| PERFORMANCE I0–I10 layer | frozen validators + `ci:performance-gates` | I0–I10 RELEASE CERTIFIED / FROZEN (contracts unchanged) | all listed validators exit 0; check counts in §4.1 | **A** (layer still PASS; **not** recertified) | this record §4.1 |
| Project persistence | serialize/hydrate/IDB/size **correctness** | Wave 1 same gates PASS at `c0a3599` | still PASS at `e47f892` | **A** functional | §4.2 |
| Project persistence | save/open/IndexedDB **wall-clock** | none in I0–I10 (I2 does not invoke ENGINE; no product catalog) | **not measured** | **D** | I2 `observeEnginePublicSurface`; I4 “no product catalogs” |
| Scientific computation | PCA/heatmap/bubble preview ms | documental D26.5/D27.5/D28.5 (non-blocking; no numeric SLO) | PCA p95 ≈ **1.58–1.60 ms** on 6557 B fixture; others ≪ 1 ms | **B** / **C** | §4.3 two-run JSON |
| Scientific computation | methodology estimator wall-clock | none (unit pack is correctness) | 388 PASS in 19776 ms suite clock | **A** functional; **D** as SLO | `validate:methodology-unit` |
| VGB lifecycle | preview ms (scatter) | documental D39 (non-blocking) | median **0.025–0.034 ms**, p95 **0.075–0.102 ms** | **B** / **C** | §4.4 |
| VGB lifecycle | create/review/approve/publish **wall-clock** | none | PR4 33/33 PASS; no timer | **A** functional; **D** as SLO | `validate:pr4-figure-lifecycle-unit` |
| Report/export | Node path + section resolve | EXPORT-1 `<15000 ms` path check; no browser SLO here | path ≪ 15 s; real capture/PDF **not** timed | **A** path check; **D** real export | §4.5 |
| Product Face / navigation | UI benchmark | none | **not measured** | **D** | no existing command |

---

## 6. Regression determination

**Was a NEW PR6-A performance regression demonstrated?**  
**NO.**

**Is there sufficient evidence for optimization?**  
**NO.** Category E was not met. Preview measurements on repository fixtures are sub-2 ms at p95. Frozen I0–I10 validators PASS. No product SLO in I3 was breached because **no product budgets exist** (certified I3 empty-registry policy).

**Is any workload blocked by measurement limitations?**  
**YES — for wall-clock of representative large-project save/open, browser IndexedDB, real PDF/chart capture, figure-approval timing, and UI navigation.** Those gaps are **D**, inherited from certified I2/I3/I4 design and from the absence of a large fixture / browser perf command. They were **not** filled by inventing benches or by modifying frozen PERFORMANCE infrastructure.

A single noisy suite duration (for example `validate:prod2c-c8-regression-gate` at 32 s on a 4 GB machine) is **not** treated as a regression.

---

## 7. Performance debt

| Kind | Item |
|---|---|
| Inherited | I2 read-only (no ENGINE invoke); I3 empty product budgets; I4 no product workload catalog; I5/I6 fixture observation not product orchestration; D26.5/D27.5/D28.5/D39 documental non-blocking preview timers |
| Known | Wave 1 inherited VGB `scatter.amend.api-freeze-prerequisite` (correctness/docs, not a perf SLO); FINAL-PG-018 workspace-architecture debt (not perf) |
| Environmental | 2-core ~2012 CPU; ~4 GB RAM; Node-only; no production build; no browser |
| Newly observed | Repository `.sgproj` fixtures are **2–8 KB**; preview timings therefore do **not** represent large-project load. This is an observation, not a regression. |
| Actionable | **None** without a separate Owner authorization to **extend** measurement capability (new product timing harness or large fixture). That extension is **out of this wave**. Category E was not proven, so **no bounded optimization** is proposed for implementation. |

---

## 8. Scientific safety

Performance work **observed** existing scientific behavior only.

Confirmed:

- no estimators, formulas, p-values, PCA algorithms, methodology, thresholds, uncertainty, units, provenance, snapshots, or result semantics were changed
- `validate:methodology-unit` was executed as a **correctness** pack (388 PASS); it was not used to alter science
- PCA preview timing calls existing `buildVisualGraphPreview` only
- no performance instrumentation was added to scientific modules
- CTR-08/09/10 were not reopened

---

## 9. Scope boundary

Confirmed:

- I0–I10 **certification was not reopened**; I0–I10 implementation, validators, and official records were **not rewritten**
- PR1–PR5 implementation was **not** modified
- PR5 browser corrections were **not** re-run and **not** reopened
- Wave 3 was **not** started (no CP-7, no product-gap/journey/governance certification proposal)
- no Product Face / navigation / PWA / five-tab reorganization
- no Session restore, undo/redo, AI/COLLAB/PLUGINS runtime, EXPORT-3, Cloud/Auth/RLS
- no optimization, caching, library introduction, or threshold lowering
- documentation only (this record + living index pointers)

---

## 10. Files changed by this wave

Documentation only:

- this record
- live index notes in [`README.md`](./README.md)
- living next pointer in [`docs/roadmaps/ROADMAP.md`](../../roadmaps/ROADMAP.md)
