# UX-2.21 — Final Visual Polish

**Épica:** UX-2 — Screen Migration Foundation  
**Microfase:** UX-2.21 — BUILD (Final Visual Polish)  
**Fase:** Token consistency + visual rhythm (no architecture)  
**Fecha:** 2026-07-30  
**Estado:** **UX-2.21 = COMPLETE (awaiting human review)**  
**Prerrequisitos:** [`docs/UX-2.0-roadmap.md`](UX-2.0-roadmap.md) · UX-2.20 COMPLETE · D48 SSOT  

**Declaración:**

```text
UX-2.21 = COMPLETE (final visual polish)
SCOPE = token consistency · visual rhythm · typography · icons · panel parity
       · EmptyState visual polish · divider consistency · a11y visual audit
NO NEW COMPONENTS · NO NEW PACKAGES · NO workspace/content/ · NO UX-2.22
NO NEW TOKENS · NO NEW TAILWIND LITERALS · NO FILE/DIRECTORY MOVES
NO PUBLIC API CHANGES · NO BEHAVIOR / STATE / Session / Window / WorkspaceLayout
TOKEN SSOTs = SURFACE · LAYOUT · SEMANTIC · ACTION · ICON
RULE = migrate existing literals → nearest existing token only
REACHABILITY = no orphans · no duplicated ownership
Next: UX-2.22 — Content Grammar Foundation
READY FOR HUMAN REVIEW
```

---

## 1. Purpose

Audit and refine Workspace visual consistency using **only** existing infrastructure. Behavior and public APIs stay identical.

---

## 2. Polish rules

### Rule 1 — No new Tailwind literals

```text
No Tailwind literals may be introduced during polish.
```

- Allowed: `gap-2` → token whose value is already `gap-2`
- Forbidden: introduce `gap-2.5`, `text-[11px]`, `rounded-[11px]`, or any utility outside the existing vocabulary

### Rule 2 — Token reachability

- No orphaned keys across SURFACE / LAYOUT / SEMANTIC / ACTION / ICON
- No duplicated responsibility (one owner; others may alias/compose)
- Removed orphan `SURFACE_TOKENS.identityRow` (unused after SemanticHeader)

### Rule 3 — No file or directory moves

Polish only. Structural reorganization belongs to an architectural phase.

---

## 3. In scope (completed)

| Area | Change |
|------|--------|
| **P0 Shell** | `PanelHeader` / `PanelBody` → `LAYOUT_TOKENS.regionPadding.md` + gaps; canvas → `SURFACE_TOKENS.radius.canvas` + `padding.md` |
| **P1 Dividers** | `ContextDivider` → `SURFACE_TOKENS.divider.*`; Inspector double divider removed (ContextDivider only) |
| **P2 Empty** | EmptyState / EmptyIcon / EmptyAction / EmptyDescription → SURFACE / ICON / SEMANTIC tokens |
| **P3 Type** | Micro-labels → `SURFACE_TOKENS.metadata.root`; status/hint badges off `text-[9px]` |
| **P4 Icons** | ActionButton / SemanticHeader leadings use `WorkspaceIcon size="lg"`; EmptyIcon → iconSlot.md |
| **P5 Sweep** | hints / status / disclosure / actions / LoadingSkeleton / OverflowMenu / WorkspaceContent |

---

## 4. Out of scope

- `workspace/content/` and all Content Grammar primitives (→ UX-2.22)
- New tokens, new public components, API/prop changes
- Session / Window / WorkspaceLayout / Runtime / hooks / state / logic
- File or directory moves

---

## 5. Validation

```bash
npm run validate:ux-2.21
```

Delegates: `validate:ux-2.20` (`UX_SKIP_DELEGATES=1`) · `tsc --noEmit` · eslint on touched paths.

---

## 6. Acceptance

| ID | Criterion | Status |
|----|-----------|--------|
| **CA-2.21.1** | Explorer / Inspector / Console / Canvas behavior unchanged | PASS |
| **CA-2.21.2** | No public API / prop / contract changes | PASS |
| **CA-2.21.3** | No new public components or packages | PASS |
| **CA-2.21.4** | No new tokens; no new Tailwind literals | PASS |
| **CA-2.21.5** | No file/directory moves | PASS |
| **CA-2.21.6** | Five SSOTs coherent; reachability cleaned | PASS |
| **CA-2.21.7** | UX-2.22 not started | PASS |
| **CA-2.21.8** | `npm run validate:ux-2.21` PASS | PASS |

---

## 7. STOP

```text
UX-2.21 = COMPLETE (awaiting human review)
NO NEW COMPONENTS · NO NEW TOKENS · NO NEW LITERALS · NO MOVES
Next: UX-2.22 — Content Grammar Foundation
Do NOT open UX-2.22 until human certification of UX-2.21
```
