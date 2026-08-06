# Transformation Runtime Guarantees

**Authority:** DATA-P2 · DATA-P5 · DATA-I5  
**Scope:** Transformation Engine infrastructure — not repository, publication, discovery, or integration.

## Guarantees

1. **Every transformation is explicit.**
2. **Every transformation is deterministic.**
3. **Every successful transformation produces a new derived entity.**
4. **Source identity never changes.**
5. **Metadata propagation is mandatory.**
6. **Lineage propagation is mandatory.**
7. **Transformation never publishes results.**
8. **Transformation never bypasses lifecycle validation.**

## Notes for DATA-I6…I10

- Repository / Publication / Discovery (DATA-I6) may expose Available meaning — they do not execute transforms.
- Integration / ENGINE adapters (DATA-I7) consume certified contracts — they do not own Transformation Engine internals.
- Discipline-specific scientific algorithms may specialize under this Engine later without weakening these guarantees.

See also `RUNTIME_INVARIANTS.md`.

Violations → **STOP**.
