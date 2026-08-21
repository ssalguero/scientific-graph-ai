# Batch 3G — T3-020 Graph Editor IQR Outlier Detector (independent reference)

This package is an **independent reference oracle** for the Graph Editor IQR outlier detector (`calculateIQROutliers`).

It is **NOT** a Production validation.
It does **NOT** certify Production.
Production black-box execution must be performed separately.

Scientific ID: **T3-020**. Package directory: `batch3G/`.

Status in the matrix: **NOT VALIDATED**.

## Identity

Graph Editor path: **Mostrar outliers → Método IQR**.

Each **visible experimental series** is processed independently. No pooling. No grouping variable. Not VGB. Not worksheet z-score. Not ANOVA / Tukey post-hoc / MW / Forest / QQ.

## Distinction from T3-019 (CLOSED)

T3-019 validated Graph Editor **Box Plot** numeric Results (N, min, Q1, median, Q3, max, IQR, outlierCount) on finite **Y only**.

T3-020 validates the **separate detector** output: flagged **{x, y, score}** sets, per-series counts, total count, series name, method = IQR.

Do **not** treat T3-019 `outlierCount` as the T3-020 result. Do not reopen T3-019 quartiles.

Shared helper only: the same R-7 `getQuantile` convention. T3-020 additionally requires **finite X AND Y**.

## Input contract

Points `{x, y}`. Eligible iff `Number.isFinite(x) && Number.isFinite(y)`. Non-finite X or Y discarded.

On this dataset, X is the `obs` column; Y is each of A, B, C, D.

## Quantile and fences

- `position = (n − 1) * q`
- linear interpolation between `floor` and `ceil` indices (R-7 / Excel PERCENTILE-style)
- Q1, Q3 from sorted eligible Y; IQR = Q3 − Q1
- **IQR === 0 → `[]`**
- lowerFence = Q1 − 1.5 × IQR; upperFence = Q3 + 1.5 × IQR
- inlier: `y >= lowerFence && y <= upperFence` (inclusive)
- outlier: strictly outside

## Score (not z-score)

- upper: `(y − upperFence) / IQR`
- lower: `(lowerFence − y) / IQR`
- always **positive**
- Production display: `toFixed(4)` (`formatOutlierScore`); X/Y also 4 decimal places

## Exposed contract (T3-020)

- per-series flagged set `{x, y, score}` in original eligible-point order
- per-series count
- total count
- series name
- method = IQR

## Internal / non-contract

Q1, Q3, IQR, fences, whiskers are **not** T3-020 Browser observables. They may appear in JSON under `internalNonContract` only.

## Dataset

`datasets/profiles_four.csv`

- Header `obs,A,B,C,D`
- 4 data rows, 5 columns
- SHA-256: `F93DB5349399B525ECA77232A783ED0E4A0A4D192B942628D8B8C085894430D9`

Coverage: A constant → no outliers; B and C IQR outlier path; D no outliers.

## Independence

`node batch3G/generate_oracles.mjs`

- no `src/` imports
- no Production helpers
- no SciPy / sklearn / pingouin
- no network

## Validation boundary

Do not treat `NOT VALIDATED` as PASS or CLOSED. ZIP is not part of this generation step.

## Files

- `generate_oracles.mjs`
- `batch3G_reference_results.json`
- `SCI_REFERENCE_MATRIX_BATCH3G.csv`
- `README.md`
- `datasets/profiles_four.csv`
