# Design System v3 — `src/ui`

Parallel Design System package for UX-3. Coexists with UX-2 (`src/lib/ui`, `src/components/ui`).

## Current microfase

**UX-4.1 — Theme Runtime Host Integration** (COMPLETE).

`ThemeProvider` is mounted via app-owned [`src/app/theme-runtime-host.tsx`](../app/theme-runtime-host.tsx). The certified Provider source is **unchanged** (adapt the host, not the Provider). Product UI still paints with UX-2 `--app-*`; UX-3 `--color-*` coexist on the host without chrome consumers.

Theme contract remains `THEME_CONTRACT_VERSION = "3.1.3"`. Foundation Tokens remain at `TOKEN_CONTRACT_VERSION = "3.1.2"`.

See `docs/THEME.md`, `docs/TOKENS.md`, `docs/ARCHITECTURE.md`, and [`docs/UX/UX-4.1.md`](../../docs/UX/UX-4.1.md).

## Public API

Import from `@/ui`. In UX-4.1 the **only** authorized application import site is `src/app/theme-runtime-host.tsx`:

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

Chrome / component consumption of `useTheme()` is deferred to UX-4.9. Do not import `src/ui/theme/runtime/**` from the application.

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
| `src/ui` | DS v3 — tokens + theme; ThemeProvider mounted via ThemeRuntimeHost (UX-4.1) |

Double stack is intentional until certified deprecation of UX-2 equivalents.
