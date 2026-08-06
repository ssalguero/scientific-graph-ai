# Repository Runtime Guarantees

**Authority:** DATA-P2 · DATA-P4 · DATA-P6 · DATA-I6  
**Scope:** Repository Services / Publication / Discovery — not Integration or persistence.

## Guarantees

1. **Repository never owns identity.**
2. **Repository never bypasses Authoritative Registry.**
3. **Publication never changes lifecycle.**
4. **Discovery only exposes eligible published entities.**
5. **Repository is fail-closed.**
6. **Unavailable entities are never discoverable.**
7. **Integration is outside Repository responsibilities.**

## Notes for DATA-I7…I10

- Integration / ENGINE adapter retarget (DATA-I7) consumes Repository through certified contracts — it does not absorb Repository ownership.
- Persistence remains Platform technology; Repository access catalogs are not storage engines.
- Boundary enforcement and hardening (DATA-I8+) verify these guarantees remain intact.

See also `RUNTIME_INVARIANTS.md`.

Violations → **STOP**.
