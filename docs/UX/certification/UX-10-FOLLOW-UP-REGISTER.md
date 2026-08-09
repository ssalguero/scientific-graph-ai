# UX-10 — Follow-Up Register

**Assessment date:** 2026-08-08  
**Rule:** Follow-ups are recorded, not implemented, as part of UX-10 certification.

---

| # | Item | Source | Evidence | Impact | Classification | Blocking | Required future authority | Recommended future phase |
|---|------|--------|----------|--------|----------------|----------|---------------------------|--------------------------|
| 1 | SessionRestoreEngine dedicated user-facing UI | P0.2 | Engine exists; no dedicated restore chrome; local draft recovery presentation improved instead | Recovery discoverability incomplete at Session layer | **NON-BLOCKING FOLLOW-UP** / **OUT OF SCOPE** to invent Session UI in UX-10 | No | Session + UX presentation | Session presentation / recovery UX |
| 2 | Session dirty/autosave presentation | P0.2 | Session dirty/autosave private by contract (`HR-context-no-persistence` / `HR-context-no-autosave`) | Cannot surface Session autosave without architecture change | **ARCHITECTURAL DECISION REQUIRED** | No | Session architecture decision | Post-decision Session UI |
| 3 | Recharts / MainComposedChart deeper plot chrome | P0.4 | `MainComposedChart` not modified; P0.4 stayed at legend/preview/builder chrome | Plot interior polish incomplete | **OUT OF SCOPE** / **ARCHITECTURAL DECISION REQUIRED** if Recharts contract touched | No | Chart / GRAPH UI authority | Chart presentation microphase |
| 4 | “Error Bars” English label in ES UI | P0.4 | `VisualGraphBuilder.tsx` still contains `<label>Error Bars</label>` | Copy inconsistency | **NON-BLOCKING FOLLOW-UP** | No | UX copy / localization | Terminology polish |
| 5 | WorkspaceContent live identity / D47 API | P0.5 | D47-frozen API; static “Current Project / Ready”; page toolbar used instead | Workspace header identity not live | **ARCHITECTURAL DECISION REQUIRED** | No | D47 API unfreeze decision | Do **not** absorb into UX-10 |
| 6 | Post–UX-I5 product UI screenshots | UX-10.3 / 10.4 / P0.1 | No screenshot corpus found; only `src/app/icon.png` among product assets searched | Blocks Lovable execution, not UX-10 seal | **NON-BLOCKING FOLLOW-UP** (for UX-10); blocks Lovable | No for UX-10 | Screenshot capture track | Pre-Lovable capture |
| 7 | Pre-existing validator debt | P0.1–P0.6 | `ui-architecture` lucide; `workspace-architecture` drift; `data3b` governance/doc prerequisite | Noise in gates; not P0 regression | **NON-BLOCKING FOLLOW-UP** | No | Validator hygiene authority | Validator debt series |
| 8 | Unrelated TypeScript debt | P0.6 `tsc` | Errors in performance-gates script, data registry, ui visibility/visual-integration | Typecheck fails outside P0 files | **NON-BLOCKING FOLLOW-UP** | No | TS debt triage | Engineering hygiene |
| 9 | Optional EmptyState kit for data empties | P0.3 | Workspace empty composers unused by data surfaces | Consistency opportunity | **NON-BLOCKING FOLLOW-UP** | No | UX presentation | Polish microphase |

**Blocking count:** 0
