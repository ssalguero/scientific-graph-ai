# COLLAB Domain — Physical package (I0 Foundation)

**Status:** COLLAB-I0 **FOUNDATION COMPLETE**  
**Authority:** COLLAB-P0 · COLLAB-P1 · COLLAB-P6 I0 · COLLAB-DECISION-001

## Package entry

| Entry | State |
|-------|--------|
| `@/collab` | I0 public exports (identity only) |
| `foundation/` | I0 identity constants |
| `public/` | I0 public aggregate (non-consumer path) |
| `internal/` | I0 boundary-enforcement skeleton |

## Ownership (cite P0 / P1)

| Capability | Owner |
|------------|-------|
| Collaboration metadata | COLLAB |
| Workflow orchestration | ENGINE |
| Scientific truth | DATA |
| AI reasoning | AI |
| Presentation | UX |
| Persistence infrastructure | Platform |

## Dependencies (cite P1)

Architectural allowed deps: **UX, ENGINE, DATA**.  
AI is a certified peer — **not** a COLLAB dependency edge.  
I0 does **not** import peers; integration is deferred (I8).

## Explicit non-goals (I0)

- I1 public contract surface  
- Sharing · membership · permissions · annotations · discussions · reviews  
- Presence · sessions · activity · notifications  
- Realtime · CRDT · OT · live multiplayer · Collaborative AI  

## Traceability

| Artifact | Role |
|----------|------|
| `docs/COLLAB/implementation/COLLAB-I0-Foundation.md` | Implementation evidence |
| `scripts/validate-collab-foundation.ts` | Foundation readiness gate |
| COLLAB-P0…P11 · COLLAB-DECISION-001 | Planning / authorization authority |
