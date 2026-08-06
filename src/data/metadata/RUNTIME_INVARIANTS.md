# Metadata Runtime Invariants

**Authority:** DATA-P2 · DATA-P5 · DATA-P6 · DATA-I4  
**Scope:** Metadata Manager + lineage/provenance — not transformation or repository.

## Invariants

1. Metadata never mints identities.
2. Metadata never replaces an Authoritative Registry.
3. Lineage preserves parent identity.
4. Provenance never modifies ownership.
5. Metadata accompanies the entity (Supporting only).
6. Structural validation ≠ scientific correctness.

## Notes for DATA-I5…I10

- Transformation (DATA-I5) may append opaque processing-history labels and lineage links; it does not own metadata SSOT.
- Repository / Publication (DATA-I6) may read metadata; they do not invent identity via metadata.
- Public contract surface remains consumer-facing; Metadata Manager stays DATA-internal.

Violations → **STOP**.
