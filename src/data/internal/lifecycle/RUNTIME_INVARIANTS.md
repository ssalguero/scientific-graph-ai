# Lifecycle Runtime Invariants

**Authority:** DATA-P5 (State Model) · DATA-I3  
**Scope:** Lifecycle + Validation Gate only — not metadata, transformation algorithms, or repository behavior.

## Invariants

1. Every scientific entity has exactly one current lifecycle state.
2. Only allowed transitions may execute — no implicit transitions.
3. Validation precedes Available (Validation Gate).
4. ENGINE may request; only DATA determines transition validity (Transition Authority).
5. Infrastructure and Consumers never authorize lifecycle changes.
6. Available meaning is never silently mutated (explicit withdrawAndRedescribe required).
7. Derived entities are new identities with lineage — they never replace the parent.
8. Lifecycle state attaches to Authoritative Registry identity (SSOT unchanged).

## Deferred (not DATA-I3)

- Metadata field behavior → DATA-I4  
- Transformation algorithms → DATA-I5  
- Repository / Publication / Discovery → DATA-I6  
- Integration / ENGINE adapter retarget → DATA-I7  

Violations → **STOP**. Do not weaken gates via code.
