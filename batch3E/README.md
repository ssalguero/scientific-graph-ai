# Batch 3E — T3-018 ANOVA η² and ω² (independent reference)

This package is an **independent reference oracle** for Graph Editor ANOVA effect sizes.

It is **NOT** a Production validation.
It does **NOT** certify Production.
Production black-box execution must be performed separately.

Scientific ID: **T3-018** (do not renumber). Package directory: `batch3E/`.

Status in the matrix: **NOT VALIDATED**.

## Purpose

Freeze full-precision and 3-decimal display values for the two metrics exposed under:

**Inferencia → Mostrar ANOVA → Effect Size & Power**

- η² (eta squared)
- ω² (omega squared, Production floor)

Do not reopen ANOVA F, Tukey HSD, or Kruskal–Wallis ε².

## Production contract (do not substitute)

### Eta squared

η² = SSB / SST when SST > 0; otherwise η² = 0.

Not partial η². Not generalized η². Not software-specific corrected variants.

### Omega squared

ω²_raw = (SSB − dfB × MSW) / (SST + MSW)

ω²_Production = max(0, ω²_raw)

On the locked `profiles_four.csv` dataset, **ω²_raw is negative**. Production applies floor 0. The raw value is frozen in JSON and must not be hidden.

Display precision in Production: **three decimal places** (`toFixed(3)`).

## Dataset

Locked contract file: `datasets/profiles_four.csv`

- Header exactly `obs,A,B,C,D`
- 4 observations, 5 columns
- Unix LF
- SHA-256: `F93DB5349399B525ECA77232A783ED0E4A0A4D192B942628D8B8C085894430D9`

Series as ANOVA groups (columns):

- A = `[0,0,0,0]` (constant)
- B = `[1,0,0,0]` (non-constant)
- C = `[0,2,0,0]` (non-constant)
- D = `[0,0,3,1]` (non-constant)

The generator copies byte-identical bytes from a prior Tier 3 package when present; otherwise it reconstructs the locked contract and still requires the SHA-256 match.

## Expected oracle values

| Quantity | Full precision (this dataset) | Display |
| --- | --- | --- |
| Grand mean | 0.4375 | — |
| SSB | 2.1875 | — |
| SSW | 9.75 | — |
| SST | 11.9375 | — |
| dfB | 3 | — |
| dfW | 12 | — |
| MSW | 0.8125 | — |
| η² | ≈ 0.18324607329842932 | `0.183` |
| ω² raw | ≈ −0.0196078431372549 | (not displayed; negative) |
| ω² Production | 0 | `0.000` |

Identity: SSB + SSW = SST (strict numerical tolerance in the generator).

## Invariants (generator fails non-zero if any fail)

- header `obs,A,B,C,D`
- n = 4
- A constant; B/C/D non-constant
- all values finite; SSB, SSW, SST, MSW finite; SST ≥ 0
- dfB = 3; dfW = 12
- 0 ≤ η² ≤ 1
- raw ω² finite; Production ω² after floor ≥ 0
- display strings exactly 3 decimal places
- no NaN; no Infinity
- SSB + SSW = SST

## Independence

- Node.js only (`node batch3E/generate_oracles.mjs`)
- no `src/` imports
- no Production helpers
- no SciPy / sklearn / pingouin
- no network

## Validation boundary

This package generates reference numbers only.

- Do not treat `NOT VALIDATED` as PASS or CLOSED.
- Do not implement η² / ω² in the application from this package.
- Do not modify Production, tests, UI, or prior batches as part of this generation.

## Files

- `generate_oracles.mjs`
- `batch3E_reference_results.json`
- `SCI_REFERENCE_MATRIX_BATCH3E.csv`
- `README.md`
- `datasets/profiles_four.csv`
