# Design System v3 — `src/ui`

Parallel Design System package for UX-3. Coexists with UX-2 (`src/lib/ui`, `src/components/ui`).

## Current microfase

**UX-3.1.3 — Theme System** (`THEME_CONTRACT_VERSION = "3.1.3"`).

Foundation Tokens remain at `TOKEN_CONTRACT_VERSION = "3.1.2"` (contracts are decoupled). Theme Maps, pure CSS variable generators, and a package-local ThemeProvider live under `theme/` + `providers/`. No app wiring, no UI primitives.

See `docs/THEME.md`, `docs/TOKENS.md`, and `docs/ARCHITECTURE.md`.

## Public API

Import only from `@/ui` when a microfase authorizes consumption:

```ts
import {
  primitive,
  semantic,
  TOKEN_CONTRACT_VERSION,
  THEME_CONTRACT_VERSION,
  THEME_IDS,
  DEFAULT_THEME,
  themes,
  resolveTheme,
  getThemeCssVars,
  getThemeCssText,
  ThemeProvider,
  useTheme,
} from "@/ui";
import type { ThemeId, ThemeMap, SemanticFocusTokens } from "@/ui";
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

Theme → Foundation Tokens only (never the reverse).

Changes to frozen layers require `UI_GOVERNANCE_V3.md` update + ADR.

## Forbidden imports

`src/ui` must never import:

- `src/app`
- `src/components/windows`, `workspace`, `graph*`, `toolbar`, `inspector`
- session / project modules
- `src/lib/ui` (UX-2) — no bridges

## Coexistence UX-2 / UX-3

| Stack | Role |
|-------|------|
| `src/lib/ui` | Active runtime tokens/theme (UX-2) |
| `src/components/ui` | Product chrome (UX-2) |
| `src/ui` | DS v3 — tokens + theme infrastructure (not mounted) |

Double stack is intentional until certified deprecation of UX-2 equivalents.
