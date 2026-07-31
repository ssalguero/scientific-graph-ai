# Ownership — `src/ui`

| Artefact | Owner | Responsibility |
|----------|-------|----------------|
| `src/ui/` (root) | UX Architecture | DS v3 boundary; public API via `index.ts` |
| `docs/` | UX Architecture | Technical docs (≠ `ux/docs`) |
| `foundation/` | Design System | Visual identity; no product JSX |
| `foundation/tokens/types` | Design System | Typed contracts; no runtime values |
| `foundation/tokens/primitive` | Design System | Raw scales |
| `foundation/tokens/semantic` | Design System | Meaning via TokenRef (incl. focus) |
| `foundation/tokens/validators` | Design System | Pure contract checks; not app runtime |
| Domain facades (`colors`, `spacing`, …) | Design System | Reexport only; no local values |
| `foundation/icons` | Design System | Stub until later microfases |
| `foundation/accessibility` | Design System | Facade → semantic focus |
| `theme/**` | Design System | Theme Maps, CSS generators, theme validators |
| `theme/contracts` | Design System | Thin Theme Contract re-exports |
| `theme/runtime` | Design System | Package-internal runtime (orchestrator, registry, inspector, utils) |
| `theme/runtime/adapters` | Design System | UX-3.2 extension seam; delegates to existing validators |
| `providers/` (ThemeProvider) | Design System | Package-local theme host; not app-mounted |
| App layout wiring of ThemeProvider | Product UI | OUT until integration microfase |
| `src/lib/ui` | Product UI (UX-2) | Current runtime SSOT — do not modify from DS work |

## Forbidden imports

See `ARCHITECTURE.md`. Package code must not import product modules or `@/lib/ui`.

## Public API ownership

Only `src/ui/index.ts` defines the curated public surface. Deep paths under `foundation/tokens`, `theme/validators`, and `theme/runtime` are implementation detail (validators and runtime stay off the root API).
