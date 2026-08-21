# Batch 3C — Independent SCI-57 / Observed Power reference package

## Purpose

Independent numeric oracles for later Browser Cloud validation of the SCI-57 **Effect Size & Power** panel:

| ID | Engine |
|---|---|
| T3-006 | Mann-Whitney r |
| T3-007 | Cliff’s Δ **magnitude** (not signed) |
| T3-008 | Kruskal-Wallis ε² |
| T3-009 | Cohen’s d 95% **z**-CI |
| T3-010 | Mean-difference 95% **t**-CI (interpolated table) |
| T3-011 | Tukey pair CI with Production **qCritical = 3.314** |
| T3-012 | Observed power (**t-statistic path only**) |
| T3-013 | Prospective n per group (**Hedges g path**) |

This package is **REFERENCE GENERATION ONLY**. Matrix status is **NOT VALIDATED**. It is **not** a Production PASS and **not** a global scientific certification of Production.

It validates the **current Production SCI-57 contract**, not textbook alternatives (noncentral t, G*Power, studentized-range tables, signed Cliff’s Δ).

## Closed engines (do not reopen)

Used only as **inputs / dependencies**:

- Batch 1B pooled t-test and ANOVA F
- Batch 2A Cohen d / Hedges g **point estimates**
- Batch 2C Mann-Whitney U/z, Kruskal-Wallis **uncorrected H**, Tukey test, η² / ω²
- Batch 3A VGB PCA, Batch 3B curve fits, linear OLS

T3-009 does **not** revalidate d. T3-013 does **not** revalidate g. T3-008 does **not** revalidate H. T3-011 does **not** revalidate Tukey q significance.

## Independence

- Node-only (`node batch3C/generate_oracles.mjs`)
- **No** `src/` imports
- **No** SciPy / sklearn
- **No** network
- Formulas implemented independently in this generator

## Datasets

| File | Header | Use |
|---|---|---|
| `datasets/cohend_groups.csv` | `obs,Group_A,Group_B` | T3-006, 007, 009, 010, 012, 013 |
| `datasets/profiles_four.csv` | `obs,A,B,C,D` | T3-008, 011 |

**Provenance:** prefer a byte-identical copy from `batch2C/` or `batch2A/` if present. If those packages are absent from the working tree, CSVs are **reconstructed from the previously locked contracts** (Batch 2A generator arrays for Cohen groups; Batch 2A/3A integer profiles with A = `[0,0,0,0]`). `profiles_four.csv` is asserted against SHA-256:

`F93DB5349399B525ECA77232A783ED0E4A0A4D192B942628D8B8C085894430D9`

Do not edit dataset values after generation.

## Mathematical contracts

**T3-006** \(r = |z|/\sqrt{n_A+n_B}\). Display 2 d.p. Production MW z **without** σ tie correction.

**T3-007** \(\mathrm{clip}(1-2U/(n_A n_B),0,1)\). Magnitude only. Display 2 d.p.

**T3-008** \(\varepsilon^2=\min(1, H/((N^2-1)/(N+1)))\). Uncorrected H. Display 3 d.p.

**T3-009** \(d\pm 1.959964\cdot SE_d\) with \(SE_d=\sqrt{(n_A+n_B)/(n_A n_B)+d^2/(2(n_A+n_B))}\). Display 2 d.p.

**T3-010** pooled equal-variance SE; \(t^*\) from Production `T_CRITICAL_95_TABLE` **linear interpolation** at α=0.05. Display 2 d.p. Not an external t quantile.

**T3-011** \(\Delta\pm 3.314\cdot SE_{\mathrm{Tukey}}\). Display 2 d.p. Do not substitute tabulated studentized-range critical values.

**T3-012** \(1-\Phi(z_\alpha-|t|)+\Phi(-z_\alpha-|t|)\), clamp [0,1], \(z_\alpha=1.959964\). Φ is an independent Abramowitz–Stegun approximation matching Production’s `approximateStandardNormalCdf`. Display: power×100, **1 decimal** percent. **Not** noncentral t / G*Power. **MW z-path deferred.**

**T3-013** \(n=\lceil 2((z_\alpha+z_{0.8})/|g|)^2\rceil\), \(z_{0.8}=0.841621\). Integer n per group. Planning, not observed power. MW r→d path deferred.

## Deferred (out of this package)

- MW-only observed-power path
- Forest / error-bar IC95 (z = 1.96)
- MW ties
- Forest/VGB error bars
- UI expansion or remediation

## Browser (later)

Graph Editor → import CSV → enable inferential tests as needed → enable **Effect Size & Power** (SCI-57; default hidden). Compare printed strings to `display` fields. This package does **not** run Browser.

## Governance

No application code changes. No git commit/push/deploy as part of generation.
