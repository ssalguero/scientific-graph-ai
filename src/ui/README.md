# Design System v3 — `src/ui`

Parallel Design System package for UX-3. Coexists with UX-2 (`src/lib/ui`, `src/components/ui`).

## Current microfase

**UX-3.1.2 — Foundation Tokens** (`TOKEN_CONTRACT_VERSION = "3.1.2"`).

Typed primitive + semantic tokens under `foundation/tokens/`. No CSS variables, ThemeProvider, UI primitives, or app wiring.

See `docs/TOKENS.md` and `docs/ARCHITECTURE.md`.

## Public API

Import only from `@/ui` when a microfase authorizes consumption:

```ts
import { primitive, semantic, TOKEN_CONTRACT_VERSION } from "@/ui";
import type { PrimitiveTokens, SemanticTokens, TokenRef } from "@/ui";
```

Until then: **no application imports of `@/ui`**.

## Dependency Rule

```text
App / Product modules  →  src/ui
src/ui                 ✗  App / Product modules
```

## UI Dependency Layers (frozen since UX-3.1.1)

```text
Application → Patterns → Components → Primitives → Foundation
```

Changes require `UI_GOVERNANCE_V3.md` update + ADR.

## Forbidden imports

`src/ui` must never import:

- `src/app`
- `src/components/windows`, `workspace`, `graph*`, `toolbar`, `inspector`
- session / project modules
- `src/lib/ui` (UX-2) — no bridges in 3.1.2

## Coexistence UX-2 / UX-3

| Stack | Role |
|-------|------|
| `src/lib/ui` | Active runtime tokens/theme (UX-2) |
| `src/components/ui` | Product chrome (UX-2) |
| `src/ui` | Future DS v3 — tokens contract only for now |

Double stack is intentional until certified deprecation of UX-2 equivalents.
