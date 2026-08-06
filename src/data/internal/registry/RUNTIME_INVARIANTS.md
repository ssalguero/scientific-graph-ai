# Registry Runtime Invariants

**Authority:** DATA-P6 (Registry Strategy & Ownership) · DATA-I2  
**Scope:** Runtime identity / ownership kernel only — not lifecycle, validation, or public API.

## Invariants

1. **Every runtime identity belongs to exactly one Authoritative Registry.**
2. **Supporting registries never mint identities.**
3. **Transient views never become authoritative.**
4. **Ownership changes are impossible without escalation.**
5. **Registry composition never creates new ownership.**

## Notes for DATA-I3…I10

- Lifecycle state (DATA-I3) attaches to authoritative identity — it does not invent a second SSOT.
- Validation outcomes (DATA-I3+) reference identities; they never mint them.
- Metadata behavior (DATA-I4) extends Supporting associations; it never becomes identity authority.
- Transformation (DATA-I5) proposes Derived meaning that must register through Authoritative paths with lineage.
- Repository / Publication / Discovery (DATA-I6) mediate access to authoritative identities; they never create parallel authority.
- Public contract surface (DATA-I1) remains the only consumer-facing API; registries stay internal.

Violations → **STOP** (Ownership Escalation Rule). Do not “fix” via code.
