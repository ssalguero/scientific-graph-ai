# Lifecycle Runtime Guarantees

**Authority:** DATA-P5 (State Model) · DATA-I3  
**Scope:** Lifecycle + Validation Gate runtime only — not metadata, transformation algorithms, or repository behavior.

## Guarantees

1. **Every entity has exactly one current lifecycle state.**
2. **Illegal transitions are rejected.**
3. **Validation is mandatory before Available.**
4. **Derived entities preserve parent identity.**
5. **Transition Authority is always enforced.**
6. **Lifecycle never changes ownership.**

## Notes for DATA-I4…I10

- Metadata / lineage field behavior (DATA-I4) attaches to authoritative identity + lifecycle — it does not invent states or ownership.
- Transformation algorithms (DATA-I5) may request Transformed / Derived paths; they do not bypass the Validation Gate.
- Repository / Publication / Discovery (DATA-I6) observe Availability — they do not own lifecycle transitions.
- Public contract surface remains the only consumer-facing API; lifecycle runtime stays internal.

See also `RUNTIME_INVARIANTS.md`.

Violations → **STOP**. Do not weaken gates via code.
