# Theme Validation

> How theme validation is organized after UX-3.1.4.
> Technical reference: `src/ui/docs/THEME.md`.

## Architectural intent

**ThemeValidator acts as a pure orchestrator. All validation rules remain in the existing validators; UX-3.1.4 does not duplicate or migrate those rules.**

```text
ThemeValidator
      ↓
runtime/adapters/
      ↓
theme/validators + foundation token validators
```

`ThemeValidator` must not import `validators/` directly.

## Serializable result

```ts
interface ThemeErrorInfo {
  code: string;
  message: string;
}

interface ThemeValidationResult {
  valid: boolean;
  warnings: ThemeWarning[];
  errors: ThemeErrorInfo[];
}
```

- Validator **never** throws and **never** returns `Error` instances.
- Exceptions are exclusive to `ThemeAssertions`.

## What is validated on ThemeMap

Only themeable domains: `color`, `focus`, `elevation`.

Spacing, typography, radius, and motion are Foundation invariants and are **not** ThemeMap fields.

## validators/ vs ThemeValidator

| Artefact | Responsibility |
|----------|----------------|
| `validators/validateThemeMap` | Rule: refs / hex / missing primitives on a map |
| `validators/validateAllThemes` | Rule: all four maps + light↔semantic match |
| foundation `validateSemanticReferences` | Rule: semantic → primitive integrity |
| `runtime/adapters` | Delegate only (UX-3.2 seam) |
| `runtime/ThemeValidator` | Orchestrate adapters → `ThemeValidationResult` |

## ThemeAssertions

Internal helpers: `assertTheme`, `assertToken`, `assertSemantic`, `assertColor`, `assertTypography`.

They use ThemeValidator (and related checks) and throw only `ThemeErrors` subclasses. Not exported from `@/ui`.

`assertTypography` targets Foundation semantic typography (invariant), not a ThemeMap field.

## UX-3.2 forward pointer

When Design Tokens Integration introduces new consumers or alternate theme sources, extend **`runtime/adapters/`** — keep the orchestrator free of source-specific rule logic.

## Gate

```text
npm run validate:theme-runtime
```

Includes API Freeze (`@/ui` does not export runtime/validators) and Theme Freeze (`THEME_CONTRACT_VERSION === "3.1.3"`).
