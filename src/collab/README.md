# COLLAB Domain — Collaborative Layer

**Phase:** COLLAB-I0 — Foundation  
**Status:** **FOUNDATION COMPLETE** · I1…I10 **NOT AUTHORIZED**

## Import

```ts
import {
  COLLAB_FOUNDATION_STATUS,
  COLLAB_DOMAIN_MOTTO,
  COLLAB_OWNERSHIP_PRINCIPLE,
} from "@/collab";
```

Consumers import **only** from `@/collab`. Deep paths under `foundation/`, `public/`, and `internal/` are package-private.

## Validation

```bash
npm run validate:collab-foundation
```

## Scope (I0)

Package identity and boundary-enforcement skeleton only.  
No sharing, membership, permissions, annotations, discussions, reviews, presence, sessions, activity, notifications, realtime, CRDT, OT, or peer runtime integration.
