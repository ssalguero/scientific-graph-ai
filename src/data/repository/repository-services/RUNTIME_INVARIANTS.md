# Repository Runtime Invariants

**Authority:** DATA-P2 · DATA-P4 · DATA-P5 · DATA-P6 · DATA-I6  
**Scope:** Repository Services / Publication / Discovery — not Integration or persistence.

## Invariants

1. Repository never creates identity.
2. Repository never modifies Lifecycle.
3. Repository never modifies Ownership.
4. Repository never replaces Authoritative Registry.
5. Publish only eligible entities (Available + Validation Gate + Registry).
6. Discovery returns only published entities that remain Available.
7. Publication never bypasses Validation Gate.
8. Repository never bypasses Authoritative Registry.
9. Repository queries; Registry owns.
10. No persistence engines (IndexedDB / session / files).

## Deferred

- Integration / ENGINE adapters → DATA-I7  
- Persistence technology → Platform  

Violations → **STOP**.
