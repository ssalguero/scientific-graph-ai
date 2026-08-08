# PLUGINS Domain — Physical package

**Status:** I0–I10 **COMPLETE** · Domain **RELEASE CERTIFIED** · Planning P0…P11 **CLOSED**  
**Certification:** PLUGINS-I10 — **PRODUCTION CERTIFIED** · evidence in `certification/`

**Principle:** Integration orchestrates. Peer domains own. PLUGINS extends. Certification verifies.

No plugin execution or runtime loading through I10 (deferred by design).

---

## Hierarchy (I10)

```
src/plugins/
├── foundation/
├── framework/
├── registry/
├── discovery/
├── registration/
├── capabilities/
├── permissions/
├── contracts/
├── lifecycle/
├── compatibility/
├── validation/
├── diagnostics/
├── observability/
├── integration/
├── certification/    # I10 evidence pack (no runtime)
├── abstractions/
├── public/
└── internal/
```

## Validators

```bash
npm run validate:plugins-foundation
npm run validate:plugins-framework
npm run validate:plugins-registry
npm run validate:plugins-admission
npm run validate:plugins-capability
npm run validate:plugins-contracts
npm run validate:plugins-lifecycle
npm run validate:plugins-validation
npm run validate:plugins-diagnostics
npm run validate:plugins-integration
npm run validate:plugins-certification
```
