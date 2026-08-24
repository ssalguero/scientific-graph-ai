# Official Record

# PR4 — VGB Figure Lifecycle

**Product:** Scientific Graph AI  
**Record Date:** 2026-08-24  
**Implementation Series:** Product Reorganization  
**Phase:** PR4  
**Phase Status:** **IMPLEMENTED — READY FOR READ-ONLY AUDIT / CERTIFICATION**  
**Decision Authority:** PROJECT OWNER / PRODUCT GOVERNANCE AUTHORITY  
**Implementation Authority:** Frozen PD-01–PD-07, certified PR0-A, PR1, PR2 and PR3

---

## 1. Executive Summary

PR4 implements CTR-09: an explicit federated VGB figure lifecycle.

Authoritative mapping:

- CTR-09 → PR4-A → VGB Figure Lifecycle;
- CTR-08 → PR3, reused for figure review (no second review system);
- CTR-06 → PR2 semantic projection, consumed (not recalculated);
- CTR-10 → PR3 numeric export, consumed for Publication Figures only.

Lifecycle:

```text
WORKING FIGURE → RESEARCHER REVIEW → PUBLICATION FIGURE
```

A generated or displayed Working Figure is never automatically a Publication Figure. The researcher remains the final scientific authority.

---

## 2. Figure Lifecycle Architecture

Minimum states (roadmap-authoritative):

| State | Artifact | Meaning |
| --- | --- | --- |
| `WORKING` | `scientific-vgb-working-figure/v1` | Editable researcher-facing figure. Not publication-ready. |
| `RESEARCHER_REVIEW` | Working record + CTR-08 review | Review is bound to identifiable scientific content. Not equivalent to `RESEARCHER_APPROVED`. |
| `PUBLICATION` | `scientific-vgb-publication-figure/v1` | Immutable researcher-approved figure artifact with citable snapshot. |

`PUBLICATION` is a separate frozen artifact, not a status flag on the mutable Working Figure. Lifecycle state is not collapsed with freshness or CTR-08 validity.

---

## 3. Working Figure

Working identity is the VGB graph entry id (`figureId`), independent of React keys, array position or chart index.

Working records track scientific and cosmetic fingerprints. Scientific binding includes graph type, variables, error bars, bins, PCA configuration and axis/group labels. Cosmetic binding includes color, marker, line style, marker size, publication preset and title.

Editing a Working Figure after review:

- scientific/content change → lifecycle returns to `WORKING` and drops the previous review binding;
- cosmetic-only change → `RESEARCHER_REVIEW` may remain.

---

## 4. Researcher Review

PR4 reuses CTR-08 (`scientific-generated-text-review/v1`) with producer `vgb-figure-lifecycle`.

Review content is the scientific binding. Review evidence includes scientific configuration, projected `values.*` / `units.*` fields and provenance.

CTR-08 validity remains independent of lifecycle phase:

- scientific content change → `INVALID` (`CONTENT_CHANGED`);
- live evidence/provenance change with unchanged scientific content → `STALE`;
- cosmetic-only change → `CURRENT` when evidence matches.

Promotion to Publication requires `RESEARCHER_APPROVED` and `CURRENT`, plus visual-truth eligibility consumed from the existing VGB semantic projection.

---

## 5. Publication Figure

Publication Figure is created only from a `RESEARCHER_REVIEW` working record with a current researcher approval. It stores:

- unique `publicationId` (stable across save/reopen);
- frozen `graphSpec`;
- citable scientific snapshot of the reviewed projection;
- bound CTR-08 `reviewRecordId`;
- publication preset id;
- explicit `displaySeries` disposition (not persisted, not Analysis feed, not publication authority).

Changing the Working Figure after publication does not mutate the Publication Figure.

---

## 6. Identity / Provenance / Semantic Binding

Figure identity distinguishes:

- figure artifact (`figureId` / `publicationId`);
- source scientific artifact (existing VGB preview / PCA projection);
- configuration (scientific vs cosmetic fingerprints);
- PR1 provenance via `composeVgbFigureProvenance`;
- semantic content (`figure.scientificConfiguration`, `values.*`, units, uncertainty);
- lifecycle state;
- CTR-08 review authority.

PR4 does not recalculate estimators, error bars, box geometry, violin strips, PCA or p-values. Missing evidence is preserved as ineligibility or limitation.

---

## 7. Persistence

Store: Project v2 extension `scientific-graph-ai.vgb-figure-lifecycle/v1` (`scientific-vgb-figure-lifecycle-store/v1`).

No new IndexedDB store, Session store, or localStorage path. Session remains transient UI/window continuity. Malformed working or publication artifacts fail revival conservatively (`null` / empty store). Publication identity is preserved on save/reopen.

`displaySeries` remains runtime reconstruction only (FINAL-PG-008 / PD-03).

---

## 8. Report / PDF Integration

Report/PDF consume Publication Figures only, via section title `Figuras de publicación (VGB)`. Production PDF replaces the live listing with the PDF projection (`replaceVgbPublicationFiguresWithPdfProjection`). Working Figures are not auto-promoted into Report/PDF.

The listing is classified factual (`vgb.preview-values`) because it reports researcher-approved publication identity; figure approval itself remains CTR-08.

Numeric export of a Publication Figure uses CTR-10 surface `numeric-export-foundation`.

Results gallery applies publication-preset tokens (`resolveGraphRenderStyle`) so Working Figure display is token-consistent (FINAL-PG-014) without treating the Working Figure as published.

---

## 9. UI Integration

Localized Results gallery panel: Working Figure → Revisar → Aprobar → Publicar figura.

No PR5 Product Face / researcher-journey redesign. No Session UI. `page.tsx` wiring is localized (create, reconcile, review/publish, report/PDF, gallery).

---

## 10. Validation

Dedicated gate: `validate:pr4-figure-lifecycle-unit` / `validate:pr4-gate`.

Behavioral coverage includes working creation, stable identity, editing, review binding and invalidation, publication eligibility and immutability, provenance/semantic/unit/approximation/warning/limitation/freshness preservation, persistence and malformed rejection, Report/PDF publication consumption, and no automatic Working→Publication promotion.

---

## 11. Scope Boundary

PR4 does not implement PR5 Product Face, PR6 performance, AI runtime, collaboration, cloud sharing, new estimators, Session UI, new persistence architecture, or speculative export formats.
