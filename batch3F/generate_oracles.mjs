/**
 * Batch 3F independent scientific reference generator.
 * T3-019 — Graph Editor Box Plot (Tukey IQR quartiles).
 *
 * Node-only. Does not import src/, page.tsx, Production helpers,
 * SciPy, sklearn, pingouin, or network services.
 *
 * VGB box plot, violin (as a separate engine), error bars, Forest,
 * Tukey HSD, and ANOVA are NOT validation outputs of this package.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const DATASETS = join(ROOT, "datasets");
const REPO = dirname(ROOT);

const PROFILES_NAME = "profiles_four.csv";
const LOCKED_PROFILES_SHA256 =
  "F93DB5349399B525ECA77232A783ED0E4A0A4D192B942628D8B8C085894430D9";

function fail(message) {
  console.error("INVARIANT VIOLATED:", message);
  process.exit(1);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function sha256Hex(buffer) {
  return createHash("sha256").update(buffer).digest("hex").toUpperCase();
}

function csvEscape(value) {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

function writeCsv(path, header, rows) {
  const lines = [
    header.join(","),
    ...rows.map((row) => row.map(csvEscape).join(",")),
  ];
  writeFileSync(path, `${lines.join("\n")}\n`, "utf8");
}

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, "").trimEnd().split(/\r?\n/);
  assert(lines.length >= 2, "CSV too short");
  const header = lines[0].split(",");
  const rows = lines.slice(1).map((line) => line.split(","));
  return { header, rows };
}

function column(rows, index) {
  return rows.map((row) => Number(row[index]));
}

function isConstant(values) {
  return values.every((v) => v === values[0]);
}

function tryCopyLocked(name) {
  const candidates = [
    join(REPO, "batch3E", "datasets", name),
    join(REPO, "batch3D", "datasets", name),
    join(REPO, "batch3C", "datasets", name),
    join(REPO, "batch2C", "datasets", name),
    join(REPO, "batch2A", "datasets", name),
    join(REPO, "batch3A", "datasets", name),
  ];
  for (const src of candidates) {
    if (existsSync(src)) {
      const buf = readFileSync(src);
      writeFileSync(join(DATASETS, name), buf);
      return { provenance: `copied from ${src}`, sourcePath: src, sha: sha256Hex(buf) };
    }
  }
  return null;
}

function ensureDataset() {
  mkdirSync(DATASETS, { recursive: true });
  const copied = tryCopyLocked(PROFILES_NAME);
  if (copied) return copied;

  const profiles = {
    A: [0, 0, 0, 0],
    B: [1, 0, 0, 0],
    C: [0, 2, 0, 0],
    D: [0, 0, 3, 1],
  };
  const rows = [0, 1, 2, 3].map((i) => [
    i + 1,
    profiles.A[i],
    profiles.B[i],
    profiles.C[i],
    profiles.D[i],
  ]);
  writeCsv(join(DATASETS, PROFILES_NAME), ["obs", "A", "B", "C", "D"], rows);
  return {
    provenance:
      "reconstructed from locked Tier 3 contract (A=[0,0,0,0]; B=[1,0,0,0]; C=[0,2,0,0]; D=[0,0,3,1]; Unix LF). No live locked copy on disk.",
    sourcePath: null,
  };
}

/** Independent R-7 / Excel PERCENTILE-style quantile. Not imported from src/. */
function getQuantile(sortedValues, quantile) {
  if (sortedValues.length === 0) return 0;
  const position = (sortedValues.length - 1) * quantile;
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.ceil(position);
  if (lowerIndex === upperIndex) return sortedValues[lowerIndex];
  const weight = position - lowerIndex;
  return (
    sortedValues[lowerIndex] * (1 - weight) +
    sortedValues[upperIndex] * weight
  );
}

function calculateBoxPlotStatistics(seriesName, valuesRaw) {
  const values = valuesRaw.filter((value) => Number.isFinite(value));
  const sampleSize = values.length;

  if (sampleSize === 0) {
    return {
      seriesName,
      N: 0,
      min: 0,
      q1: 0,
      median: 0,
      q3: 0,
      max: 0,
      iqr: 0,
      outlierCount: 0,
      internalNonContract: {
        lowerFence: 0,
        upperFence: 0,
        lowerWhisker: 0,
        upperWhisker: 0,
        outliersY: [],
        note: "empty finite-Y sentinel; all numeric outputs 0",
      },
    };
  }

  const sorted = [...values].sort((left, right) => left - right);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const q1 = getQuantile(sorted, 0.25);
  const median = getQuantile(sorted, 0.5);
  const q3 = getQuantile(sorted, 0.75);
  const iqr = q3 - q1;

  if (iqr === 0) {
    return {
      seriesName,
      N: sampleSize,
      min,
      q1,
      median,
      q3,
      max,
      iqr: 0,
      outlierCount: 0,
      internalNonContract: {
        lowerFence: q1,
        upperFence: q3,
        lowerWhisker: min,
        upperWhisker: max,
        outliersY: [],
        note: "IQR=0: no outliers; whiskers=min/max (internal)",
      },
    };
  }

  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;
  const inlierValues = sorted.filter(
    (value) => value >= lowerFence && value <= upperFence
  );
  const outliersY = sorted.filter(
    (value) => value < lowerFence || value > upperFence
  );
  const lowerWhisker =
    inlierValues.length > 0 ? Math.min(...inlierValues) : min;
  const upperWhisker =
    inlierValues.length > 0 ? Math.max(...inlierValues) : max;

  return {
    seriesName,
    N: sampleSize,
    min,
    q1,
    median,
    q3,
    max,
    iqr,
    outlierCount: outliersY.length,
    internalNonContract: {
      lowerFence,
      upperFence,
      lowerWhisker,
      upperWhisker,
      outliersY,
      note: "fences, whiskers, outlier Y list are INTERNAL / NON-CONTRACT for T3-019",
    },
  };
}

function assertSeriesInvariants(analysis, rawY, { expectConstant, expectIqrZero }) {
  assert(analysis.N === rawY.filter(Number.isFinite).length, `${analysis.seriesName} N`);
  assert(rawY.every(Number.isFinite), `${analysis.seriesName} non-finite Y`);
  assert(analysis.iqr >= 0, `${analysis.seriesName} IQR < 0`);
  assert(analysis.outlierCount >= 0, `${analysis.seriesName} outlierCount`);
  assert(
    analysis.q1 <= analysis.median && analysis.median <= analysis.q3,
    `${analysis.seriesName} Q1<=median<=Q3`
  );
  assert(
    analysis.min <= analysis.q1 && analysis.q3 <= analysis.max,
    `${analysis.seriesName} min<=Q1 and Q3<=max`
  );
  if (expectConstant) {
    assert(isConstant(rawY), `${analysis.seriesName} must be constant`);
  } else {
    assert(!isConstant(rawY), `${analysis.seriesName} must be non-constant`);
  }
  if (expectIqrZero) {
    assert(analysis.iqr === 0, `${analysis.seriesName} expected IQR=0`);
    assert(analysis.outlierCount === 0, `${analysis.seriesName} IQR=0 must have 0 outliers`);
  }
  const disp = ["min", "q1", "median", "q3", "max", "iqr"];
  for (const key of disp) {
    const s = analysis[key].toFixed(4);
    assert(/^-?\d+\.\d{4}$/.test(s), `${analysis.seriesName} ${key} display ${s}`);
  }
  for (const v of [analysis.min, analysis.q1, analysis.median, analysis.q3, analysis.max, analysis.iqr]) {
    assert(Number.isFinite(v), `${analysis.seriesName} NaN/Inf`);
  }
}

function main() {
  const datasetNotes = ensureDataset();
  const profilesBuf = readFileSync(join(DATASETS, PROFILES_NAME));
  const destSha = sha256Hex(profilesBuf);
  const sourceSha = datasetNotes.sha ?? destSha;
  assert(
    destSha === LOCKED_PROFILES_SHA256,
    `profiles_four SHA mismatch: ${destSha}`
  );

  const profiles = parseCsv(profilesBuf.toString("utf8"));
  assert(profiles.header.join(",") === "obs,A,B,C,D", "header");
  assert(profiles.rows.length === 4, "n observations");

  const series = {
    A: column(profiles.rows, 1),
    B: column(profiles.rows, 2),
    C: column(profiles.rows, 3),
    D: column(profiles.rows, 4),
  };

  const analyses = {
    A: calculateBoxPlotStatistics("A", series.A),
    B: calculateBoxPlotStatistics("B", series.B),
    C: calculateBoxPlotStatistics("C", series.C),
    D: calculateBoxPlotStatistics("D", series.D),
  };

  assertSeriesInvariants(analyses.A, series.A, { expectConstant: true, expectIqrZero: true });
  assertSeriesInvariants(analyses.B, series.B, { expectConstant: false, expectIqrZero: false });
  assertSeriesInvariants(analyses.C, series.C, { expectConstant: false, expectIqrZero: false });
  assertSeriesInvariants(analyses.D, series.D, { expectConstant: false, expectIqrZero: false });
  assert(analyses.B.outlierCount >= 1 || analyses.C.outlierCount >= 1, "outlier-count path not exercised");

  const displayOf = (a) => ({
    N: a.N,
    min: a.min.toFixed(4),
    q1: a.q1.toFixed(4),
    median: a.median.toFixed(4),
    q3: a.q3.toFixed(4),
    max: a.max.toFixed(4),
    iqr: a.iqr.toFixed(4),
    outlierCount: a.outlierCount,
  });

  const contractOf = (a) => ({
    N: a.N,
    min: a.min,
    q1: a.q1,
    median: a.median,
    q3: a.q3,
    max: a.max,
    iqr: a.iqr,
    outlierCount: a.outlierCount,
  });

  const payload = {
    batchId: "batch3F",
    generatedAt: "independent-oracle-freeze",
    independence:
      "Node-only oracle. No src imports, no Production helpers, no SciPy/sklearn/pingouin, no network. Quantiles recomputed from raw Y cells.",
    provenance: {
      dataset: datasetNotes,
      scientificId: "T3-019",
      graphEditorPath: "Graph Editor → Mostrar Box Plot",
      note: "This JSON is a reference oracle freeze. It is NOT Production validation and does NOT certify Production. Graph Editor only; not VGB box plot.",
    },
    formulas: {
      quantile:
        "position=(n-1)*q; linear interpolate floor/ceil indices (R-7 / Excel PERCENTILE-style). Finite Y only.",
      iqr: "IQR = Q3 − Q1",
      fences: "lower=Q1−1.5*IQR; upper=Q3+1.5*IQR (INTERNAL / NON-CONTRACT)",
      outlierRule:
        "inlier iff value>=lowerFence AND value<=upperFence; outlierCount = Y strictly outside. IQR=0 → outlierCount=0.",
      emptySentinel: "sampleSize=0 → all numeric outputs 0",
    },
    dataset: {
      file: PROFILES_NAME,
      header: "obs,A,B,C,D",
      nObservations: 4,
      nColumns: 5,
      sha256Source: sourceSha,
      sha256Destination: destSha,
      sha256Locked: LOCKED_PROFILES_SHA256,
      shaMatchLocked: destSha === LOCKED_PROFILES_SHA256,
      seriesY: series,
    },
    cases: [
      {
        id: "T3-019",
        method: "Graph Editor Box Plot / Tukey IQR",
        dataset: PROFILES_NAME,
        independentOracle: true,
        productionStatus: "NOT VALIDATED",
        exposedContract: {
          A: contractOf(analyses.A),
          B: contractOf(analyses.B),
          C: contractOf(analyses.C),
          D: contractOf(analyses.D),
        },
        display: {
          precision: 4,
          outlierCount: "integer",
          A: displayOf(analyses.A),
          B: displayOf(analyses.B),
          C: displayOf(analyses.C),
          D: displayOf(analyses.D),
        },
        internalNonContract: {
          note: "Not Browser observables for T3-019.",
          A: analyses.A.internalNonContract,
          B: analyses.B.internalNonContract,
          C: analyses.C.internalNonContract,
          D: analyses.D.internalNonContract,
        },
      },
    ],
    invariants: {
      header: "obs,A,B,C,D",
      nObservations: 4,
      A_constant: true,
      BCD_nonConstant: true,
      finiteY: true,
      q1_le_median_le_q3: true,
      iqrNonNegative: true,
      min_le_quartiles_le_max: true,
      outlierCountNonNegative: true,
      iqrZero_A_noOutliers: true,
      fenceInclusivity: "inlier includes fence",
      shaMatch: true,
      displayFourDecimals: true,
      status: "PASS",
    },
  };

  writeFileSync(
    join(ROOT, "batch3F_reference_results.json"),
    `${JSON.stringify(payload, null, 2)}\n`,
    "utf8"
  );

  const obs = payload.cases[0].display;
  writeCsv(
    join(ROOT, "SCI_REFERENCE_MATRIX_BATCH3F.csv"),
    [
      "ID",
      "Method",
      "Dataset",
      "IndependentOracle",
      "MathematicalModel",
      "PrimaryObservables",
      "AcceptanceTolerance",
      "DomainRequirements",
      "OracleMethod",
      "Status",
    ],
    [
      [
        "T3-019",
        "Graph Editor Box Plot / Tukey IQR",
        "profiles_four.csv",
        "yes",
        "R-7 quantile; IQR=Q3-Q1; outlierCount=Y strictly outside Q1±1.5 IQR inclusive fences",
        `A N=${obs.A.N} min=${obs.A.min} Q1=${obs.A.q1} med=${obs.A.median} Q3=${obs.A.q3} max=${obs.A.max} IQR=${obs.A.iqr} outliers=${obs.A.outlierCount}; B IQR=${obs.B.iqr} outliers=${obs.B.outlierCount}; C IQR=${obs.C.iqr} outliers=${obs.C.outlierCount}; D IQR=${obs.D.iqr} outliers=${obs.D.outlierCount}`,
        "5e-4 vs 4 decimal display; outlierCount exact integer",
        "Graph Editor only; finite Y; n=4; A constant IQR=0; not VGB box; fences/whiskers non-contract",
        "Independent getQuantile + Tukey IQR; Node-only",
        "NOT VALIDATED",
      ],
    ]
  );

  console.log("BATCH 3F T3-019 oracle generated");
  console.log("sha source", sourceSha);
  console.log("sha destination", destSha);
  for (const name of ["A", "B", "C", "D"]) {
    const a = analyses[name];
    console.log(
      name,
      "N",
      a.N,
      "min",
      a.min,
      "Q1",
      a.q1,
      "med",
      a.median,
      "Q3",
      a.q3,
      "max",
      a.max,
      "IQR",
      a.iqr,
      "outlierCount",
      a.outlierCount
    );
  }
  console.log("invariants PASS");
}

main();
