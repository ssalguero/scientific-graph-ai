# Batch 3H — T3-021 Graph Editor Z-score Outlier Detector (independent reference)

This package is an **independent reference oracle** for the Graph Editor Z-score outlier detector (`calculateZScoreOutliers`).

**NOT VALIDATED — this package is an independent reference/oracle package and is not a Production PASS.**

Human scientific authorship and scientific judgment remain outside the engine validation. T3-021 does not automate scientific authorship or paper production.

Scientific ID: **T3-021**. Package directory: `batch3H/`.

## 1. Purpose

Freeze the Production Z-score detector contract (finite X∧Y, sample SD, `|z| > 3`, signed score) on a dedicated dataset that actually crosses the threshold.

## 2. T3-021 identity

Graph Editor → Mostrar outliers → **Método Z-Score**.

Not T3-019 Box Plot. Not T3-020 IQR detector. Not VGB. Not worksheet `zscore` transform.

## 3. Production contract being validated

Per visible experimental series:

- per-series outlier count
- series name
- X, Y
- method = Z-Score
- signed z as score

Results / report / chart / tooltip where Production already exposes these.

## 4–7. Mathematical definition

1. Keep points with finite X **and** Y.
2. Independent per series. No pooling. No grouping.
3. n < 2 → `[]`.
4. Mean = arithmetic mean of eligible Y.
5. **Sample SD:** \(s = \sqrt{\sum(y-\bar y)^2/(n-1)}\) (denominator **n − 1**, not n).
6. SD === 0 → `[]`.
7. \(z = (y - \bar y) / s\) (**signed**).
8. Outlier iff `Math.abs(z) > 3`. **|z| = 3 is an inlier.**

On Spike: variance = 1/11; **sample SD = \(1/\sqrt{11}\)** (not 1/11).

## 8. Dataset

`datasets/zscore_spike.csv`

- Header exactly `obs,Spike,Zeros`
- 11 data rows as specified (Spike: 1 then ten 0s; Zeros: all 0)
- UTF-8, Unix LF
- SHA-256: `73CD060B1CBB2E19918627C4402DECBF1F5205048AE263F79AF23A80D699E3B9`

## 9. Expected results

| Series | Count | Flagged |
| --- | --- | --- |
| Spike | 1 | `{x: 1, y: 1, score ≈ 3.0151134457776365}` display **`3.0151`** |
| Zeros | 0 | `[]` (SD = 0) |

Derived total 1 is **auxiliary JSON only**, not a required Results field.

Remaining Spike points: \(z \approx -0.3015113446\), inliers.

## 10. Oracle independence

`node batch3H/generate_oracles.mjs`

- Node-only
- no `src/` imports
- no Production helpers
- no SciPy / sklearn / pingouin
- no network

## 11. SHA-256

Frozen in JSON, matrix, and this README after generator write of the locked LF bytes.

## 12. Invariants

Header, 11 rows, finite X/Y, Spike n=11 and SD>0, exactly one Spike outlier at (1,1) with score > 3, remaining Spike inliers, Zeros SD=0 and count 0, flagged ⊆ eligible, `|z|>3` rule, 4 d.p. display, no NaN/Inf. Generator exits non-zero on failure.

## 13. Tolerance

±0.0005 vs displayed 4 d.p. score. Membership and counts **exact**.

## 14. Exposed vs internal / non-contract

**Exposed:** counts, series, X, Y, method, signed z.

**Non-contract:** mean, SD, threshold, inlier z-scores, explicit Results total count. Missing internals are not OUTPUT INCOMPLETE.

## 15. Relationship to T3-020

T3-020 = IQR / Tukey fences / IQR-unit score. T3-021 = sample z / `|z|>3` / signed z. Shared UI shell only. Do not revalidate IQR.

## 16. Worksheet z-score

`experimentalWorksheet.ts` `zscore` is a column **transform**, not this detector.

## 17. Scientific boundaries

Does not certify IQR, box plot, MAD/modified z, Grubbs, ESD, standalone mean/SD Results, or automatic papers.

## 18. Status

**NOT VALIDATED**

## Files

- `generate_oracles.mjs`
- `batch3H_reference_results.json`
- `SCI_REFERENCE_MATRIX_BATCH3H.csv`
- `README.md`
- `datasets/zscore_spike.csv`
