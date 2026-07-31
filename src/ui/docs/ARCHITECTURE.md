# Architecture — `src/ui`

Technical architecture for the Design System v3 package.

Functional SSOT: `ux/docs/*`. This file describes **code** structure and dependency rules.

## Package root

```text
src/ui/
├── index.ts                 # Public API (curated)
├── README.md
├── docs/                    # Technical docs (this folder)
└── foundation/              # Visual identity — no product JSX
    ├── tokens/              # UX-3.1.2 Foundation Tokens
    ├── colors/ …            # Domain facades → tokens
    └── …
```

UX-3.1.2 implements Foundation Tokens only. Higher layers (`primitives/`, `components/`, `patterns/`, `providers/`, `hooks/`, `utils/`, `internal/`, `test-utils/`) already exist as empty scaffolds from UX-3.1.1 (`export {}`); their functional implementation remains out of scope until later microfases.

## Dependency Rule (package ↔ application)

```text
App / Product modules  →  src/ui
src/ui                 ✗  App / Product modules
```

`src/ui` must never import application / domain modules (`src/app`, workspace, graph, session, project, …).

Until a later microfase authorizes wiring, **no** module outside `src/ui` may import `@/ui`.

## UI Dependency Layers (frozen since UX-3.1.1)

```text
Application
      │
      ▼
Patterns
      │
      ▼
Components
      │
      ▼
Primitives          ← UI atoms (React) — not token primitives
      │
      ▼
Foundation
```

| Layer | May import |
|-------|------------|
| Patterns | Components, Primitives, Foundation |
| Components | Primitives, Foundation |
| Primitives | Foundation only |
| Foundation | **no** higher layer |

### Freeze

This hierarchy is **frozen as of UX-3.1.1**. Changing it requires:

1. An update to `ux/UI_GOVERNANCE_V3.md`
2. An Architecture Decision Record (ADR)

## Foundation Tokens (UX-3.1.2)

```text
foundation/tokens/
  types/          # contracts (separated from data)
  primitive/      # raw scales
  semantic/       # TokenRef → primitive
  validators/     # pure functions
  version.ts
  index.ts
```

Token layer rules:

```text
semantic → primitive   ✓
primitive → semantic   ✗
```

**Naming collision:** `tokens/primitive` (token scales, no JSX) ≠ `src/ui/primitives` (React UI atoms; empty scaffold until later microfases).

Focus / theme / CSS variables / component tokens: see `TOKENS.md` evolution table.

## Forbidden imports

```text
src/ui
  ❌ never imports
    src/app
    src/components/windows
    src/components/workspace
    src/components/graph*
    src/components/toolbar
    src/components/inspector
    src/session / session modules
    src/project / project modules
    src/lib/project
    src/lib/session
    src/lib/ui          # UX-2 runtime — no bridge in 3.1.2
    (any product domain module)
```

## `utils/` vs `internal/`

Both folders exist as empty scaffolds. When filled: `utils/` may reach the public API; `internal/` never reexports from `src/ui/index.ts`.

## Docs split

| Location | Role |
|----------|------|
| `ux/docs/*` | Functional Design System SSOT |
| `src/ui/docs/*` | Technical package docs |
