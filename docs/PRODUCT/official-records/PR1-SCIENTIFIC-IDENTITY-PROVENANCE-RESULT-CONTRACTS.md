# Official Record

# PR1 — Scientific Identity, Provenance & Result Contracts

**Product:** Scientific Graph AI
**Record Date:** 2026-08-21
**Implementation Series:** Product Reorganization
**Phase:** PR1
**Phase Status:** **IMPLEMENTED — READY FOR CERTIFICATION**
**Decision Authority:** PROJECT OWNER / PRODUCT GOVERNANCE AUTHORITY
**Implementation Authority:** Frozen PD-01–PD-07 and certified PR0-A baseline

---

## 1. Executive Summary

PR1 establishes a federated scientific identity, provenance and result-contract foundation without adding estimators, replacing scientific engines, or introducing a monolithic result model.

The implementation:

- gives nine historically overstated Explorer capabilities functionally accurate primary identities while retaining historical names as aliases;
- classifies SCI-50–SCI-56 and SCI-60 as composite decision-support outputs and discloses factors, coverage, defaults, fallbacks, provenance and limitations;
- creates an authoritative inventory of 18 federated result contracts;
- establishes explicit `scientific-provenance/v1` vocabulary;
- establishes the ephemeral, non-citable Live Derived Result identity;
- distinguishes GE PCA from VGB PCA instead of asserting false parity;
- discloses approximate p-values without changing inference calculations;
- corrects VGB rendering claims for uncertainty, box summaries and the historical “Violin Plot” surface;
- preserves the PR0-A authority model: scientific builders own calculations; Results, Report, PDF, Comparison and VGB views are consumers or projections.

No PR1 ownership blocker was found. No Product Decision or Tier 3 reopening was required.

---

## 2. Product Decisions Implemented

| Decision | PR1 disposition |
|---|---|
| **PD-01 — Explorer identity** | **IMPLEMENTED.** Primary labels now describe the actual heuristic or MDS-derived behavior. Historical method names remain aliases. |
| **PD-02 — SCI-50–60 semantics** | **IMPLEMENTED for result-producing composite indicators.** SCI-50–SCI-56 and SCI-60 expose a common disclosure contract. SCI-57/58 retain their specific result contracts. SCI-59 is explicitly workflow state, not a scientific estimator. |
| **PD-03 — VGB publication role** | **BOUNDARY PRESERVED.** PR1 corrects scientific truthfulness only; publication lifecycle remains deferred. |
| **PD-04 — Semantic parity** | **FOUNDATION IMPLEMENTED.** Result identities and owners are cataloged; full cross-output parity remains deferred. |
| **PD-05 — Numeric scientific export** | **FOUNDATION ONLY.** Contracts identify values, units, uncertainty and provenance needs. Numeric export remains deferred. |
| **PD-06 — Artifact identity** | **FOUNDATION IMPLEMENTED.** Live Derived Result is runtime-scoped, ephemeral, non-citable and non-persistable as a scientific record. Snapshot lifecycle remains deferred. |
| **PD-07 — Generated text authority** | **BOUNDARY PRESERVED.** Added text is deterministic factual disclosure. No AI runtime or automatic scientific interpretation was added. |

---

## 3. Files Created

### 3.1 Contract foundation

- `src/lib/scientific/contracts/capability-identity.ts`
- `src/lib/scientific/contracts/artifacts.ts`
- `src/lib/scientific/contracts/provenance.ts`
- `src/lib/scientific/contracts/result-inventory.ts`
- `src/lib/scientific/contracts/pca-semantics.ts`
- `src/lib/scientific/contracts/index.ts`

### 3.2 Contract tests

- `src/lib/scientific/contracts/__tests__/identity.cases.ts`
- `src/lib/scientific/contracts/__tests__/inventory.cases.ts`
- `src/lib/scientific/contracts/__tests__/provenance.cases.ts`
- `src/lib/scientific/contracts/__tests__/pca-semantics.cases.ts`
- `src/lib/scientific/contracts/__tests__/run-assertions.ts`

### 3.3 Scientific disclosure and regression tests

- `src/lib/scientific/methodology/disclosure.ts`
- `src/lib/scientific/inference/p-value-disclosure.ts`
- `src/lib/scientific/inference/__tests__/p-value-disclosure.cases.ts`
- `src/lib/visualGraphBuilder/__tests__/truthfulness.cases.ts`
- `scripts/validate-pr1-contract-foundation-unit.ts`
- `scripts/validate-pr1-scientific-honesty-unit.ts`

### 3.4 Official record

- `docs/PRODUCT/official-records/PR1-SCIENTIFIC-IDENTITY-PROVENANCE-RESULT-CONTRACTS.md`

---

## 4. Files Modified

### 4.1 Product orchestration and presentation

- `src/app/page.tsx`
- `src/components/graph-builder/GraphPreview.tsx`
- `src/components/reports/ScientificPublicationDashboard.tsx`
- `src/lib/visualGraphBuilder.ts`

### 4.2 Inference, comparison, report and workflow

- `src/lib/scientific/inference/index.ts`
- `src/lib/scientific/comparison/input-types.ts`
- `src/lib/scientific/comparison/types.ts`
- `src/lib/scientific/comparison/profile.ts`
- `src/lib/scientific/comparison/analysis.ts`
- `src/lib/scientific/comparison/interpretation.ts`
- `src/lib/scientific/comparison/__tests__/profile.cases.ts`
- `src/lib/scientific/comparison/__tests__/interpretation.cases.ts`
- `src/lib/scientific/report/pdf-section-filter.ts`
- `src/lib/scientific/report/__tests__/pdf-section-filter.cases.ts`
- `src/lib/scientific/workflow/catalog.ts`
- `src/lib/scientific/workflow/templates.ts`

### 4.3 Composite methodology

The `types.ts`, `build.ts` and `reporting.ts` owners were updated in:

- `src/lib/scientific/methodology/consistency/`
- `src/lib/scientific/methodology/report-quality/`
- `src/lib/scientific/methodology/reproducibility/`
- `src/lib/scientific/methodology/evidence/`
- `src/lib/scientific/methodology/assumptions/`
- `src/lib/scientific/methodology/readiness/`
- `src/lib/scientific/methodology/summary/`
- `src/lib/scientific/methodology/publication/`

Relevant `labels.ts` owners were also updated in consistency, evidence and readiness.

### 4.4 Validation integration

- `package.json`
- `scripts/validate-export2-d44-3-testing.ts`
- `scripts/validate-hotfix-sci-normality-2.mjs`
- `scripts/validate-methodology-f5a-unit.ts`
- `scripts/validate-methodology-f5b-unit.ts`
- `scripts/validate-methodology-f5c-unit.ts`
- `scripts/validate-methodology-f5d-unit.ts`
- `scripts/validate-methodology-f5e-unit.ts`
- `scripts/validate-visual-graph-builder-unit.ts`

Validator expectations were changed only where the authoritative product label changed. Test conditions and scientific assertions were not weakened.

---

## 5. Capability Identity Changes

| Historical alias | PR1 primary identity | Actual computation boundary |
|---|---|---|
| MANOVA Explorer | **Indicador heurístico de separación multivariada** | PCA variance plus bounded distance ratio and existing clustering/network summaries; no MANOVA statistic or p-value |
| LDA Explorer | **Indicador heurístico de estructura discriminante** | PCA and separation/importance summaries; no discriminant functions or classifier |
| Canonical Correlation Explorer | **Indicador heurístico de asociación entre variables** | Correlation-network density and mean similarity; no two-block canonical variates |
| PCR Explorer | **Indicador heurístico de potencial predictivo** | PCA variance and leading-variable importance; no response model or regression |
| PLS Explorer | **Indicador heurístico de capacidad explicativa** | Composite PCA, predictive and network indicators; no latent PLS response model |
| Bootstrap Explorer | **Indicador heurístico de estabilidad de evidencia** | Composite sample-size, normality, PCA and predictive scores; no resampling |
| Sensitivity Analysis Explorer | **Indicador heurístico de robustez compuesta** | Composite stability, PCA, explanatory and importance-balance scores; no input perturbation |
| t-SNE Explorer | **Vista MDS con indicador de vecindad** | Reuses MDS coordinates and a neighborhood indicator; no t-SNE optimization |
| UMAP Explorer | **Vista MDS con indicador de conectividad** | Transforms MDS coordinates and network connectivity; no UMAP fuzzy graph |

Primary UI, report and PDF identity mappings use these identities. Historical aliases remain available through the capability contract for migration/search semantics.

---

## 6. SCI-50–60 Semantic Changes

The following outputs now carry `CompositeMethodologyDisclosure`:

- SCI-50 — **Indicador compuesto de consistencia**
- SCI-51 — **Indicador compuesto de calidad metodológica**
- SCI-52 — **Indicador compuesto de reproducibilidad potencial**
- SCI-53 — **Indicador compuesto de soporte evidenciario**
- SCI-54 — **Indicador compuesto de cobertura de supuestos**
- SCI-55 — **Indicador compuesto de preparación para revisión**
- SCI-56 — **Resumen compuesto metodológico**
- SCI-60 — **Resumen compuesto de preparación científica**

Each disclosure records:

- contributing factor identity and role;
- whether each factor was evaluated, defaulted or not evaluated;
- direct-input, upstream-composite or neutral-fallback provenance;
- fallback text;
- explicit limitations.

The common limitations state that the output:

- is not an independent validation;
- does not demonstrate reproducibility;
- does not establish suitability for a journal;
- does not attest execution of upstream methods merely because an upstream-shaped input was supplied.

SCI-57 remains an effect-size and power result. SCI-58 remains comparison. SCI-59 remains guided workflow state. They are inventoried but are not falsely recast as SCI-50–56-style composite estimators.

---

## 7. Result Contract Inventory

`SCIENTIFIC_RESULT_CONTRACT_INVENTORY` is the authoritative PR1 catalog. It contains 18 descriptors:

| Family | Contract identities |
|---|---|
| Descriptive / distribution | `descriptive.series-statistics`, `distribution.exploration` |
| Inference | `inference.parametric`, `inference.nonparametric` |
| Effect size / power | `sci-57.effect-size-power` |
| PCA | `ge.pca`, `vgb.pca` |
| Comparison | `sci-58.comparison` |
| Composite methodology | `sci-50.consistency` through `sci-56.methodological-dashboard`, plus `sci-60.publication-dashboard` |
| Workflow | `sci-59.guided-workflow` |
| VGB-derived preview values | `vgb.preview-values` |

Every descriptor names:

- family, role and artifact kind;
- authoritative owner paths and owner types;
- semantically meaningful fields and units where known;
- approximation policy;
- persistence policy.

The inventory is metadata over federated owners. It does not replace their payload types and is not a `ResultModel`.

---

## 8. Ownership / SSOT Changes

PR1 records, rather than obscures, the existing ownership boundaries:

1. Scientific builders and their domain types own calculations.
2. `page.tsx` remains an orchestration and projection hub, not the scientific SSOT.
3. Results, Report and PDF consume scientific results; they do not become calculation owners.
4. Project persistence owns serialization, not scientific calculation.
5. Comparison owns captured KPI profiles and comparison rules, not source-engine calculations.
6. VGB owns worksheet-driven preview calculations and specification behavior.
7. GE PCA and VGB PCA are separate authoritative contracts.

Duplicate computation was not automatically refactored. No case required guessing an owner, so no `PR1 OWNERSHIP BLOCKER` applies.

VGB creation no longer mutates the Graph Editor title, removing a cross-surface state coupling without merging GE and VGB.

---

## 9. Provenance Implementation

`ScientificProvenanceDescriptor` establishes `scientific-provenance/v1` with:

- dataset identity, optional label and checksum;
- source kind, identity and label;
- series identities and roles;
- analysis/configuration identity and values;
- method/index identity, label, version and parameters;
- approximation kind and details;
- structured warnings with severity.

`composeScientificProvenance` is pure and deterministic. It generates no timestamps or IDs, performs no storage reads and does not mutate caller-owned values.

Comparison profile capture metadata now accepts and retains this provenance descriptor. The app composes it from the current dataset, worksheet/series context, capture configuration, method identity, approximation status and warnings.

This is the minimum transport foundation for downstream consumers. PR1 does not persist every intermediate value and does not create an immutable scientific snapshot.

---

## 10. Live Derived Result Identity

`LIVE_DERIVED_RESULT_IDENTITY` defines a live result as:

- kind: `live-derived-result`;
- identity scope: `runtime-session`;
- lifecycle: `ephemeral`;
- citable: `false`;
- persistence policy: `forbidden`;
- provenance required: `true`.

`describeLiveDerivedResult` binds a federated result contract ID to its current provenance. It does not allocate a durable identifier, fingerprint a result or materialize a snapshot.

---

## 11. VGB Scientific Truthfulness

PR1 corrects three user-facing truthfulness defects:

1. **Error bars:** computed SD/SEM/CI uncertainty is now rendered, and the Y domain includes uncertainty extents.
2. **Box plots:** geometry now uses the authoritative five-number summary rather than visually implying an unrelated bar value.
3. **Historical violin surface:** the builder generated raw-value strip points, not a density violin. Its primary label is now **Raw-value Strip**, with visible explanatory copy.

VGB PCA remains semantically distinct. No publication lifecycle, automatic VGB→Analysis path, or GE/VGB merge was introduced.

---

## 12. Approximation Disclosure

Inference p-values were already produced by numerical or asymptotic approximation helpers. PR1 preserves those calculations and changes disclosure only:

- values render with `(aprox.)`;
- very small values retain the `< 0.0001` display rule;
- the result surface states that the p-value is approximate and should be interpreted with test assumptions.

The disclosure is used in Results and generated report lines. No exactness claim and no estimator change was introduced.

---

## 13. PCA Semantic Identity

GE PCA and VGB PCA are related but not interchangeable:

| Semantic dimension | GE PCA | VGB PCA |
|---|---|---|
| Observation model | Shared point index across Experimental Series | Complete Worksheet rows |
| Missing values | Any unequal length or non-finite selected value prevents a result | Rows with a non-finite selected value are omitted |
| Standardization | Always z-score standardized | Configurable: z-score or center-only |
| Minimum data | At least 2 series, 3 aligned observations, 2 non-constant variables | At least 2 complete rows and 2 non-constant variables |
| Sign convention | Deterministic iteration seed, no post-canonicalization | First non-zero loading forced positive |
| Outputs | Variance, scores, loadings, contributions and interpretation | Variance and scores; no exposed loadings |

The authoritative cross-implementation policy is `forceEquality: false`. Explained variance is comparable only when the effective matrix and scaling policy coincide; opposite score signs can represent the same principal axis.

---

## 14. Warnings / Limitations

PR1 preserves or adds:

- invalid-input behavior in existing builders;
- normality and assumption warnings;
- SCI-50–60 fallback and non-evaluation disclosure;
- effect-size/power disclaimers and insufficient-sample warnings;
- comparison comparability warnings;
- provenance warnings;
- p-value approximation status;
- explicit non-validation and non-journal-suitability limitations.

No warning owner was ambiguous enough to require an unsafe architectural change.

---

## 15. Validation Results

Recorded PR1 validation:

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **PASS** |
| `validate:pr1-contract-foundation-unit` | **PASS — 39/39** |
| `validate:pr1-scientific-honesty-unit` | **PASS — 30/30** |
| `validate:methodology-unit` | **PASS — 388/388** |
| `validate:comparison-unit` | **PASS — 101/101** |
| `validate:workflow-unit` | **PASS** |
| `validate:visibility-unit` | **PASS** |
| `validate:visual-graph-builder-render-unit` | **PASS** |
| `validate:export2-d44-3-testing` | **PASS — 27/27** |
| `validate:spe-1v-umbrella` | **PASS — all 13 steps** |
| `validate:prod2b-b2-gate` | **PASS — all 17 persistence/type gates** |
| `validate:prod2c-c8-regression-gate` | **PASS — all 5 persistence/VGB gates** |
| `git diff --check` | **PASS**; only repository line-ending notices |
| `validate:visual-graph-builder-unit` | **87/88; expected inherited failure only** |

The inherited VGB failure is:

```text
scatter.amend.api-freeze-prerequisite
```

This is the existing `FINAL-PG-008` / PR4-A.3 API-freeze prerequisite. All nine PR1 truthfulness cases pass. The failure was not suppressed or reclassified as a pass.

An initial umbrella run exposed a stale PDF test fixture that still used `Consistency Engine`. The fixture was changed to consume the canonical SCI-50 label; the PDF gate then passed 27/27. This was an identity-contract correction, not a relaxed validator.

---

## 16. Regression Results

No certified scientific numeric calculation was changed.

Regression evidence confirms:

- methodology outputs retain their score calculations while labels and disclosures change;
- inference values remain unchanged while approximation status becomes visible;
- comparison calculations and 101 existing cases pass with provenance transport added;
- VGB computed uncertainty, five-number summaries and raw points remain builder-owned;
- VGB project collect/serialize/hydrate and multi-dataset fixtures pass;
- GE and VGB PCA retain their existing numerical implementations and explicit semantic distinction;
- Results/Report/PDF section filtering remains deterministic under the new identities.

No unexpected scientific value change was observed.

---

## 17. Out-of-Scope Changes Explicitly Avoided

PR1 does not implement:

- immutable citable snapshots or final fingerprinting;
- full Results/Report/PDF/Export semantic parity;
- numeric scientific export;
- reviewed Report/PDF authority workflow;
- VGB Working Figure → Researcher Review → Publication Figure lifecycle;
- automatic VGB→Analysis;
- Session UI or Project/Session redesign;
- AI runtime or automatic scientific interpretation;
- COLLAB or PLUGINS;
- broad UX redesign;
- broad `page.tsx` refactor;
- performance optimization without evidence;
- new scientific estimators.

Tier 3 remains closed.

---

## 18. Remaining Technical Debt

1. `page.tsx` remains a large orchestration hub with local scientific builders. PR1 deliberately did not rewrite it.
2. Live-result descriptors are a domain foundation, not yet a universal runtime envelope around every result.
3. Provenance is transported into comparison capture; full downstream projection and durable snapshot binding remain future work.
4. Historical internal toggle/type names such as `showConsistencyEngine` remain for compatibility even where primary labels changed.
5. GE and VGB retain duplicate or related low-level operations where behavior is intentionally distinct or authority requires later consolidation.
6. Full warning and provenance parity across Report, PDF and future numeric export is not implemented.
7. `scatter.amend.api-freeze-prerequisite` remains an acknowledged VGB baseline debt assigned outside PR1.

---

## 19. PR2 Blockers

There is no blocking ambiguity preventing PR1 certification.

The following are explicit PR2 entry dependencies, not PR1 defects:

1. PR2 must materialize an immutable identity distinct from `live-derived-result`.
2. Snapshot capture must bind a federated result contract, source/configuration provenance and captured values without converting the inventory into a monolithic payload.
3. PR2 must define and validate freshness transitions for comparison/citable snapshots.
4. PR2 parity work must consume canonical identities and disclosures rather than reproduce historical strings.
5. Durable provenance storage must preserve Project/Session boundaries and existing project migration guarantees.

Unknowns intentionally left for the owning phase:

- final snapshot identifier/fingerprint format;
- exact durable snapshot envelope;
- complete cross-output warning/provenance projection policy;
- future publication-review state and numeric export schemas.

These unknowns do not require a new Product Decision in PR1.

---

## 20. Acceptance Criteria

| Criterion | Status |
|---|---|
| PD-01 implemented for affected Explorer identities | **MET** |
| PD-02 implemented for SCI-50–60 semantics | **MET** |
| CTR-04 authoritative result inventory | **MET** |
| CTR-01 capability identity | **MET** |
| CTR-02 live identity foundation | **MET** |
| CTR-03 provenance foundation | **MET** |
| CTR-05 composite disclosure | **MET** |
| PR1 VGB truthfulness issues resolved | **MET** |
| Approximation disclosure explicit | **MET** |
| PCA semantic identity/ownership established | **MET** |
| Warnings and limitations preserved | **MET** |
| Stable downstream semantic foundation | **MET** |
| No monolithic `ResultModel` | **MET** |
| Tier 3 not reopened | **MET** |
| No downstream phase implemented prematurely | **MET** |
| Certified calculations regression-safe | **MET** |
| Validation evidence recorded | **MET** |
| PR2 dependencies/unknowns explicit | **MET** |

---

## 21. Current / Implemented / Deferred / Unknown

### CURRENT

- Federated scientific result owners remain authoritative.
- Live results are calculated from current session inputs.
- Comparison persists a limited KPI profile, not a general citable result.
- VGB persists authorized specification state and rebuilds preview values.

### IMPLEMENTED IN PR1

- CTR-01 capability identities and aliases.
- CTR-02 live artifact/result identity foundation.
- CTR-03 provenance vocabulary and comparison capture transport.
- CTR-04 result contract inventory.
- CTR-05 composite methodology disclosure.
- CTR-09 truthfulness corrections required by PR1.
- CTR-12 GE/VGB PCA semantic descriptors.
- Explicit p-value approximation disclosure.

### DEFERRED

- PR2: immutable snapshots, freshness and semantic parity consumption.
- PR3: reviewed generated-text state and numeric scientific export.
- PR4: complete VGB publication lifecycle.
- PR5+: Session UI and other frozen downstream work.

### UNKNOWN

Only downstream implementation details listed in §19 remain unknown. No scientific owner, estimator identity or PR1 acceptance item is unknown.

---

## 22. Git Checkpoint Recommendation

Do not create a checkpoint before certification.

Recommended governance sequence:

```text
PR1 implementation
→ validation evidence review
→ PR1 certification
→ one Git checkpoint
```

Recommended checkpoint scope: all PR1 contract, identity, disclosure, provenance, VGB truthfulness, validation and official-record changes as one coherent commit.

**PR1 COMPLETE — READY FOR CERTIFICATION**
