# Transformation Runtime Invariants

**Authority:** DATA-P2 · DATA-P5 · DATA-P6 · DATA-I5  
**Scope:** Transformation Engine infrastructure — not repository, publication, or discipline-specific science.

## Invariants

1. Never modify the source Authoritative identity in place.
2. Always create a new Derived entity.
3. Lineage must be preserved (derived-from parent).
4. Metadata must propagate to the derived entity (DATA-I4 model).
5. Execution must be deterministic (same inputs ⇒ same fingerprints).
6. No implicit transformations — explicit request required.
7. No silent mutation of Available entities.

## Deferred

- Repository / Publication / Discovery → DATA-I6  
- Integration / ENGINE adapters → DATA-I7  
- Discipline-specific scientific algorithms → later specialization under same Engine  

Violations → **STOP**.
