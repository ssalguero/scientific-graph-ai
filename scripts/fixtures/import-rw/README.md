# Import RW Fixtures

These fixtures are sanitized, versioned workbooks for the PROD-1 RW import gate.
They replace local developer-only default paths while preserving the table shapes
and sheet names exercised by the existing RW Suite.

The values are synthetic and contain no personal, project, or publication-sensitive
data. The fixtures intentionally stay small, but keep metadata rows, scientific
column labels, numeric tables, and side-by-side layouts that are relevant to table
detection and axis mapping.

## Cases

| Case | File | Sheet | Origin | Scenario | Validates |
| --- | --- | --- | --- | --- | --- |
| RW-01 | `rw-01-pb.xlsx` | `Pb` | Sanitized reconstruction of the original Pb workbook case used by `RW01_PATH`. | Equilibrium table with metadata before the detected header. | Header-row detection after leading metadata, `Cpromedio` as X, `q` as Y, and at least 8 importable points. |
| RW-02 | `rw-02-lang-up.xlsx` | `Lang_Up` | Sanitized reconstruction of the original Langmuir Up workbook case used by `RW02_PATH`. | Langmuir-style table with concentration, adsorbed quantity, and diagnostic column. | Label-driven X/Y suggestion on `Ceq` and `q adsor`, numeric coverage, and at least 8 importable points. |
| RW-03 | `rw-03-resultados-up.xlsx` | `resultados_Up` | Sanitized reconstruction of the original results workbook case used by `RW03_PATH`. | Results sheet with leading metadata and adsorption/removal columns. | Header-row detection, `Cf` independent-axis hint, `q adsorcion` dependent-axis hint, and at least 8 importable points. |
| RW-04 | `rw-04-up-ph3.xls` | `Up_PH3` | Sanitized reconstruction of the original `.xls` kinetic workbook case used by `RW04_PATH`. | Legacy `.xls` side-by-side kinetic table with duplicated time/quantity pairs. | Legacy workbook read path, multi-column table detection, time-to-quantity mapping, and at least 10 importable points. |

## Overrides

`scripts/validate-prod1-rw-suite.mjs` uses these files by default. To compare
against external workbooks, set `RW01_PATH`, `RW02_PATH`, `RW03_PATH`, or
`RW04_PATH`; those environment variables retain precedence over repository
fixtures.
