# Shared UI (`src/components/ui`)

**UX-I2 — Shared Components Modernization.**

This package is a **Design System consumer**. Visual authority remains in `src/ui` / `ux/docs`. Components compose styles via `@/lib/ui` (`UI_TOKENS`, theme helpers) that resolve to certified CSS variables:

- `--color-*`
- `--spacing-*`
- `--radius-*`
- `--elevation-*`
- `--typography-*`
- `--motion-*`

Do not introduce local token SSOTs, hex palettes, or forked theme maps here.
