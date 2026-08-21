# Batch 3D — Independent Forest / VGB CI / QQ r / moments reference package

## Purpose

Independent numeric oracles for later Browser Cloud validation of:

| ID | Engine |
|---|---|
| T3-014 | Graph Editor Forest Plot mean IC95 (literal **1.96**) |
| T3-015 | VGB **bar** CI **half-width** (`errorBars: ci95`) |
| T3-016 | Graph Editor QQ Plot Pearson **r** |
| T3-017 | Graph Editor skewness + **excess** kurtosis |

This package is **REFERENCE GENERATION ONLY**. Matrix status is **NOT VALIDATED**. It is **not** a Production PASS.

It validates the **locked Production contracts**, not textbook t-based mean CIs, SciPy `norm.ppf`, or Fisher G1/G2.

## Closed work (do not reopen)

Batches 1B–3C, including SCI-57 CIs (T3-009–011) and observed power t-path (T3-012). T3-014 uses **1.96**, not `1.959964`.

## Independence

- Node-only: `node batch3D/generate_oracles.mjs`
- **No** `src/` imports
- **No** SciPy / sklearn / network

## Datasets

| File | SHA-256 (locked) | Use |
|---|---|---|
| `datasets/profiles_four.csv` | `F93DB5349399B525ECA77232A783ED0E4A0A4D192B942628D8B8C085894430D9` | T3-014 |
| `datasets/cohend_groups.csv` | `E9D0004AE3C21C8063A1CDDC9B001AA394E77B5FD86DFB44698E9B1A3918188B` | T3-015, T3-016, T3-017 |

Copied from an existing locked `batch3C/datasets/` copy when present; otherwise reconstructed from the same locked contracts. Generator asserts SHA-256 match.

**T3-014 series A** = `[0,0,0,0]` is the documented **zero-width** CI (SD=0). Numeric non-degenerate checks are **B, C, D**.

**T3-015:** VGB bar, Y=`Group_A`, no grouping → category `Todos`, n=6. Output is **mean (`value`) + half-width (`error`)**, not [L, U]. GraphPreview may not draw whiskers; that is an observability note, not a formula change.

**T3-016 / T3-017:** use **Group_A** and **Group_B** (non-constant). Interpretation / normality **labels are not** scientific observables.

## Contracts (summary)

**T3-014.** Sample SD \(n-1\); SEM \(s/\sqrt n\); \(\bar y \pm 1.96\cdot\mathrm{SEM}\). Display 4 d.p.

**T3-015.** Same 1.96·SEM as half-width on the grouped bar mean.

**T3-016.** Sort Y; \(p=(i+0.5)/n\); independent Acklam \(\Phi^{-1}\); Pearson of (theoretical, sorted sample). r 4 d.p.

**T3-017.** \(m_k=n^{-1}\sum(y-\bar y)^k\); skew \(m_3/m_2^{3/2}\); excess kurtosis \(m_4/m_2^2-3\). 4 d.p. No G1/G2.

## Tolerance

**5e-4** vs Production 4 decimal places (T3-015: vs displayed tooltip digits if present).

## Governance

No application code changes. No git commit/push/deploy as part of generation.
