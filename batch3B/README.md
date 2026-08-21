# Batch 3B — Independent curve-fit regression reference package

## Purpose

Independent numeric oracles for later Browser Cloud validation of four Graph Editor curve-fit engines:

| ID | Model |
|---|---|
| T3-002 | Quadratic \(y = ax^2+bx+c\) |
| T3-003 | Exponential \(y = a e^{bx}\) |
| T3-004 | Logarithmic \(y = \alpha + \beta\ln x\) |
| T3-005 | Power \(y = a x^{b}\) |

**This package validates the current Production curve-fitting contract. It is not a textbook nonlinear least-squares oracle.**

It is **not** a Production PASS. Linear OLS is **CLOSED as B2C-002** and is not a T3-002–005 case.

There is **no** Gauss–Newton / Levenberg–Marquardt engine in Production. Exponential and power are **OLS in log-transformed estimation space**. **R² is calculated on original y scale** for every model.

## Tier 3 context

- T3-001 VGB PCA (Batch 3A) is CLOSED.
- T3-002 micro-mapping classified these four as genuine closed-form fitters, not iterative NLS.

## Production contract

Implemented in `src/app/page.tsx` (`calculateQuadraticRegression`, `calculateExponentialRegression`, `calculateLogarithmicRegression`, `calculatePowerRegression`). This generator **does not import or call** those functions.

UI: Análisis → Mostrar regresión. Compare mode shows R² 4 d.p.; single-model mode shows equation 4 d.p. + R².

## Dataset provenance

Intended source: `batch2A_closure/datasets/kde_x_y_compatible.csv`.

That folder was **not present on disk** at generation time. The CSV was reconstructed from the **locked 12-row contract** used in Batch 2A closure / Batch 2C (header `x,y`, explicit `6,5.0`, Unix LF). Destination bytes are asserted against the previously recorded SHA-256:

`A00BE9DCC8E21C90F3D20E6014FC525F9AEDAEB9D6FD6176C5B9C659EE4F75C7`

Do not edit values after generation.

## Independent oracle methodology

`node batch3B/generate_oracles.mjs`

- Node-only.
- Independent two-variable OLS (not `calculateLinearRegression`).
- Independent 3×3 Gaussian elimination with partial pivoting (not `solveLinearSystem3x3`).
- No sklearn, SciPy, network, or `src/` imports.

## Models

**T3-002 Quadratic.** OLS on \([x^2, x, 1]\). R² on original y. n ≥ 3.

**T3-003 Exponential.** OLS \(\ln y = \alpha + \beta x\), then \(a=e^\alpha\), \(b=\beta\). Predictions \(a e^{bx}\). R² on original y. Requires y > 0.

**T3-004 Logarithmic.** OLS \(y = \alpha + \beta \ln x\). R² on original y. Requires x > 0.

**T3-005 Power.** OLS \(\ln y = \alpha + \beta \ln x\), then \(a=e^\alpha\), \(b=\beta\). Predictions \(a x^b\). R² on original y. Requires x > 0 and y > 0.

## Transformed fitting vs original-scale R²

Fitting space ≠ R² space for exponential and power. Primary reference R² is **never** transformed-space R².

## Tolerance

Parameters and R²: **5e-4** vs Production 4 decimal places.

## Invariants

Header `x,y`; n=12; all finite; x>0; y>0; quadratic solvable; OLS denominators ≠ 0; finite params/fits/R²; 0 ≤ R² ≤ 1; all four methods succeed.

## Independence

No application engines. No `page.tsx`. No SciPy/sklearn. No network.

## Intentionally NOT validated

- Linear OLS (B2C-002 CLOSED).
- Iterative NLS / SciPy `curve_fit`.
- Residuals tables, SE, CI, df, SSE/MSE as UI fields.
- `chooseBestRegressionModel` (informational only in JSON).
- `standardize=false` PCA, SCI-57 remainder, observed power.

## Distinction from B2C-002

B2C-002 closed **linear** \(y=\beta_0+\beta_1 x\) on this same Y family. Batch 3B does not re-score that model.

## Distinction from iterative NLS

Production does not iterate. Oracle does not iterate. A mismatch vs NLS is an expected methodological difference, not a T3 fail.

Reproduce:

```text
node batch3B/generate_oracles.mjs
```
