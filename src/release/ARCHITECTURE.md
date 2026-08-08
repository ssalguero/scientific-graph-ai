# RELEASE Architecture — P1

## Position

RELEASE is the **last authority layer**. Peers build and certify; RELEASE consolidates evidence for global readiness.

```
ENGINE / DATA / AI / COLLAB / PLUGINS / PERFORMANCE / UX  →  RELEASE
```

**No circular imports:** RELEASE never imports `@/engine`, `@/data`, `@/ai`, `@/ui`, `@/plugins`, `@/performance`, or `@/collab`. Baseline paths are string facts.

## Package layout

```
src/release/
  foundation/     identity + P1/P2 status markers
  types/          vocabulary + evidence record contract
  baseline/       P0.8 cross-domain facts
  governance/     authority + certification boundary
  evidence/       P1 lifecycle, trust, intake, index, gaps, …
  readiness/      P2 readiness model, assessment, blocking, summary
  gates/          P2 gate catalog, dependencies, results, waivers
  public/         internal aggregate
  internal/       boundary-policy
  index.ts        @/release barrel
```

## Invariants

1. Evidence ≠ Certification ≠ Release  
2. Domain Certification ≠ Evidence Acceptance ≠ RELEASE Certification ≠ Production Release  
3. Missing evidence never silently becomes PASS  
4. WARNING never silently authorizes release  
5. Peer ownership immutable; RELEASE does not modify peers  
6. P1 does not claim global release certification or Production Release  
7. Evidence Index here is architecture-only (`definitiveArtifact: false`)  
8. Evidence lifecycle ≠ P0 release-state machine (PLANNED→RELEASED)

## Deferred

Promotion, deployment, CI release gates, RC orchestration, definitive artifacts, concrete gate criteria, decision recording execution, P1 certification claim.
