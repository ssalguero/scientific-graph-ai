# Batch 3F — T3-019 Graph Editor Box Plot (independent reference)

This package is an **independent reference oracle** for the Graph Editor Box Plot engine.

It is **NOT** a Production validation.
It does **NOT** certify Production.
Production black-box execution must be performed separately.

Scientific ID: **T3-019**. Package directory: `batch3F/`.

Status in the matrix: **NOT VALIDATED**.

## Scope

**Graph Editor only.**

Do not use this package to validate:

- VGB Box Plot
- Violin Plot as a separate engine
- Graph Editor error bars
- Forest Plot
- Tukey post-hoc
- ANOVA
- T3-015

No Production Box Plot UI is implemented or changed by this package. No `src/` imports.

## Production contract (exposed)

Per visible series, finite **Y** only:

- N
- min
- Q1
- median
- Q3
- max
- IQR = Q3 − Q1
- outlierCount (integer)

Display: numeric values **4 decimal places** (`toFixed(4)`). outlierCount is an integer.

## Quantile convention

Independent reimplementation of Graph Editor `getQuantile`:

- sort finite Y
- `position = (n − 1) * q`
- `lowerIndex = floor(position)`, `upperIndex = ceil(position)`
- `weight = position − lowerIndex`
- `q = (1 − weight) * y[lowerIndex] + weight * y[upperIndex]`

This is linear interpolation on order statistics (R-7 / Excel PERCENTILE-style).

## Tukey 1.5 IQR rule (for outlierCount)

- lowerFence = Q1 − 1.5 × IQR
- upperFence = Q3 + 1.5 × IQR
- inlier iff `value >= lowerFence` AND `value <= upperFence` (fence-inclusive)
- outlierCount = number of Y **strictly** outside the fences
- if IQR = 0: outlierCount = 0; whiskers = min/max (whiskers are internal)
- empty finite-Y input: all numeric outputs = 0 (sentinel)

## Internal / non-contract (T3-019)

The following are **NOT** required Browser observables:

- fence numeric values
- whisker numeric values
- outlier Y arrays
- SVG geometry

They may appear in JSON under `internalNonContract` for oracle transparency only.

## Dataset

`datasets/profiles_four.csv`

- Header exactly `obs,A,B,C,D`
- 4 rows, 5 columns
- Unix LF
- SHA-256: `F93DB5349399B525ECA77232A783ED0E4A0A4D192B942628D8B8C085894430D9`

Copied byte-identically from a prior locked Tier 3 package when present.

Coverage: constant A (IQR = 0); non-constant B/C/D; n = 4 interpolation; IQR; outlier-count path on B and C. No extra extreme-outlier dataset.

## Independence

- Node.js only: `node batch3F/generate_oracles.mjs`
- no `src/` imports
- no Production helpers
- no SciPy / sklearn / pingouin
- no network

## Validation boundary

This package generates reference numbers only. Do not treat `NOT VALIDATED` as PASS or CLOSED.

## Files

- `generate_oracles.mjs`
- `batch3F_reference_results.json`
- `SCI_REFERENCE_MATRIX_BATCH3F.csv`
- `README.md`
- `datasets/profiles_four.csv`
