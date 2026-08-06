# Integration Runtime Guarantees

**Authority:** DATA-P2 · DATA-P3 · DATA-I7  
**Scope:** Integration Layer + ENGINE consumption via `@/data` — not Boundary Enforcement (DATA-I8).

## Guarantees

1. **Integration never owns scientific meaning.**
2. **Integration never bypasses public contracts.**
3. **Integration never accesses DATA internals directly** (from ENGINE/consumers — consumers use `@/data` only).
4. **Integration never creates identity.**
5. **Integration never changes lifecycle.**
6. **Integration never replaces ENGINE orchestration.**
7. **Integration coordinates only.**

## Notes for DATA-I8…I10

- Boundary Enforcement (DATA-I8) audits imports and dual-path leftovers — it does not redefine Integration.
- Hardening / Quality Gates (DATA-I9) and Domain Certification (DATA-I10) verify these guarantees remain intact.

Violations → **STOP**.
