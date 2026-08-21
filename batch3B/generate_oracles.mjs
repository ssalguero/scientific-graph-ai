/**
 * Batch 3B independent scientific reference generator.
 * T3-002 Quadratic, T3-003 Exponential, T3-004 Logarithmic, T3-005 Power.
 *
 * Node-only. Does not import src/, page.tsx, Production regression functions,
 * sklearn, or SciPy.
 *
 * Validates the CURRENT Production curve-fitting contract:
 * closed-form OLS (polynomial or log-transformed), R² on original y.
 * This is not iterative nonlinear least squares.
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const DATASETS = join(ROOT, "datasets");
const CSV_NAME = "kde_x_y_compatible.csv";
const LOCKED_SOURCE_SHA256 =
  "A00BE9DCC8E21C90F3D20E6014FC525F9AEDAEB9D6FD6176C5B9C659EE4F75C7";

function fail(message) {
  console.error("INVARIANT VIOLATED:", message);
  process.exit(1);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function nearlyEqual(a, b, eps = 1e-12) {
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= eps;
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

/** Independent two-variable OLS: y ~ intercept + slope * x. Not Production. */
function independentOls(x, y) {
  const n = x.length;
  assert(n === y.length && n >= 2, "OLS n");
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (let i = 0; i < n; i += 1) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumXX += x[i] * x[i];
  }
  const denom = n * sumXX - sumX * sumX;
  assert(denom !== 0, "OLS denominator zero");
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { intercept, slope, denom };
}

function originalScaleR2(y, predicted) {
  const n = y.length;
  const yBar = y.reduce((s, v) => s + v, 0) / n;
  let ssRes = 0;
  let ssTot = 0;
  for (let i = 0; i < n; i += 1) {
    assert(Number.isFinite(predicted[i]), "fitted value not finite");
    ssRes += (y[i] - predicted[i]) ** 2;
    ssTot += (y[i] - yBar) ** 2;
  }
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
  assert(Number.isFinite(r2), "R² not finite");
  assert(r2 >= -1e-12 && r2 <= 1 + 1e-12, `R² out of range ${r2}`);
  return { r2, ssRes, ssTot, yBar };
}

/**
 * Independent Gaussian elimination with partial pivoting for a 3×3
 * augmented system. Not Production solveLinearSystem3x3.
 */
function independentSolve3x3(matrix, vector) {
  const a = matrix.map((row, i) => [...row, vector[i]]);
  const n = 3;
  for (let col = 0; col < n; col += 1) {
    let pivot = col;
    for (let row = col + 1; row < n; row += 1) {
      if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) pivot = row;
    }
    if (nearlyEqual(a[pivot][col], 0, 1e-15)) return null;
    if (pivot !== col) {
      const tmp = a[col];
      a[col] = a[pivot];
      a[pivot] = tmp;
    }
    const diag = a[col][col];
    for (let j = col; j <= n; j += 1) a[col][j] /= diag;
    for (let row = 0; row < n; row += 1) {
      if (row === col) continue;
      const factor = a[row][col];
      for (let j = col; j <= n; j += 1) a[row][j] -= factor * a[col][j];
    }
  }
  return [a[0][3], a[1][3], a[2][3]];
}

function productionStyleBestModel(candidates) {
  const ranked = candidates.filter((c) => c.r2 != null);
  if (ranked.length === 0) return null;
  let best = ranked[0];
  for (const candidate of ranked.slice(1)) {
    if (candidate.r2 > best.r2 + 0.001) {
      best = candidate;
      continue;
    }
    if (Math.abs(candidate.r2 - best.r2) < 0.001 && candidate.complexity < best.complexity) {
      best = candidate;
    }
  }
  return best;
}

const csvPath = join(DATASETS, CSV_NAME);
const csvBytes = readFileSync(csvPath);
const destSha = createHash("sha256").update(csvBytes).digest("hex").toUpperCase();

const text = csvBytes.toString("utf8").replace(/^\uFEFF/, "");
const lines = text
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);
assert(lines[0] === "x,y", "header must be exactly x,y");
const data = lines.slice(1).map((line) => line.split(",").map((p) => p.trim()));
assert(data.length === 12, "n must be 12");
assert(data.every((row) => row.length === 2), "two columns");
assert(
  lines.some((line) => line === "6,5.0" || line.startsWith("6,5.0")),
  "explicit 5.0 must be preserved"
);

const xs = data.map((row) => {
  const v = Number(row[0]);
  assert(Number.isFinite(v), "x not finite");
  return v;
});
const ys = data.map((row) => {
  const v = Number(row[1]);
  assert(Number.isFinite(v), "y not finite");
  return v;
});
const n = xs.length;
assert(n === 12, "n=12");
assert(xs.every((x) => x > 0), "x > 0");
assert(ys.every((y) => y > 0), "y > 0");
assert(
  ![...xs, ...ys].some((v) => Number.isNaN(v) || !Number.isFinite(v)),
  "NaN/Inf in data"
);

// T3-002 quadratic
{
  let sumX = 0;
  let sumX2 = 0;
  let sumX3 = 0;
  let sumX4 = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2Y = 0;
  for (let i = 0; i < n; i += 1) {
    const x = xs[i];
    const y = ys[i];
    const x2 = x * x;
    sumX += x;
    sumX2 += x2;
    sumX3 += x2 * x;
    sumX4 += x2 * x2;
    sumY += y;
    sumXY += x * y;
    sumX2Y += x2 * y;
  }
  const quadSolve = independentSolve3x3(
    [
      [sumX4, sumX3, sumX2],
      [sumX3, sumX2, sumX],
      [sumX2, sumX, n],
    ],
    [sumX2Y, sumXY, sumY]
  );
  assert(quadSolve !== null, "quadratic design matrix not solvable");
  var quadraticA = quadSolve[0];
  var quadraticB = quadSolve[1];
  var quadraticC = quadSolve[2];
  assert(
    [quadraticA, quadraticB, quadraticC].every(Number.isFinite),
    "quadratic params not finite"
  );
  var quadraticFitted = xs.map((x) => quadraticA * x * x + quadraticB * x + quadraticC);
  var quadraticR2pack = originalScaleR2(ys, quadraticFitted);
}

// T3-003 exponential
{
  const lnY = ys.map((y) => Math.log(y));
  const expOls = independentOls(xs, lnY);
  var expA = Math.exp(expOls.intercept);
  var expB = expOls.slope;
  assert(Number.isFinite(expA) && Number.isFinite(expB), "exponential params");
  var expFitted = xs.map((x) => expA * Math.exp(expB * x));
  var expR2pack = originalScaleR2(ys, expFitted);
  var expAlpha = expOls.intercept;
}

// T3-004 logarithmic
{
  const lnX = xs.map((x) => Math.log(x));
  const logOls = independentOls(lnX, ys);
  var logAlpha = logOls.intercept;
  var logBeta = logOls.slope;
  assert(Number.isFinite(logAlpha) && Number.isFinite(logBeta), "log params");
  var logFitted = xs.map((x) => logAlpha + logBeta * Math.log(x));
  var logR2pack = originalScaleR2(ys, logFitted);
}

// T3-005 power
{
  const lnX = xs.map((x) => Math.log(x));
  const lnY = ys.map((y) => Math.log(y));
  const powOls = independentOls(lnX, lnY);
  var powA = Math.exp(powOls.intercept);
  var powB = powOls.slope;
  assert(Number.isFinite(powA) && Number.isFinite(powB), "power params");
  var powFitted = xs.map((x) => powA * Math.pow(x, powB));
  var powR2pack = originalScaleR2(ys, powFitted);
  var powAlpha = powOls.intercept;
}

const linearOls = independentOls(xs, ys);
const linearFitted = xs.map((x) => linearOls.intercept + linearOls.slope * x);
const linearR2 = originalScaleR2(ys, linearFitted).r2;

const informationalBest = productionStyleBestModel([
  { model: "linear", r2: linearR2, complexity: 1 },
  { model: "logarithmic", r2: logR2pack.r2, complexity: 2 },
  { model: "exponential", r2: expR2pack.r2, complexity: 3 },
  { model: "power", r2: powR2pack.r2, complexity: 4 },
  { model: "quadratic", r2: quadraticR2pack.r2, complexity: 5 },
]);

const allParams = [
  quadraticA,
  quadraticB,
  quadraticC,
  quadraticR2pack.r2,
  expA,
  expB,
  expR2pack.r2,
  logAlpha,
  logBeta,
  logR2pack.r2,
  powA,
  powB,
  powR2pack.r2,
];
assert(allParams.every((v) => Number.isFinite(v) && !Number.isNaN(v)), "NaN/Inf in results");
assert(
  [...quadraticFitted, ...expFitted, ...logFitted, ...powFitted].every(Number.isFinite),
  "fitted values not finite"
);

const json = {
  batch: "3B",
  package: "T3 curve-fit regression (quadratic / exponential / logarithmic / power)",
  generator: "batch3B/generate_oracles.mjs",
  oracleIndependence:
    "No src/ imports. No calculateQuadraticRegression / Exponential / Logarithmic / Power / Linear. No solveLinearSystem3x3. No page.tsx. No sklearn. No SciPy. No network. Independent OLS and independent 3×3 Gaussian elimination.",
  methodology:
    "This package validates the current Production curve-fitting contract. It is not a textbook nonlinear least-squares oracle. Fitting for exponential and power is OLS in log-transformed estimation space. R² is calculated on original y scale for every model.",
  r2Scale: "original y",
  notIterativeNLS: true,
  dataset: {
    file: CSV_NAME,
    intendedSource: "batch2A_closure/datasets/kde_x_y_compatible.csv",
    lockedSourceSha256: LOCKED_SOURCE_SHA256,
    destinationSha256: destSha,
    sha256MatchLockedSource: destSha === LOCKED_SOURCE_SHA256,
    header: "x,y",
    n,
    xPositive: true,
    yPositive: true,
    explicitFivePointZeroPreserved: true,
  },
  tolerance: { parametersAndR2Abs: 5e-4, displayDecimals: 4 },
  methods: {
    "T3-002": {
      method: "Quadratic polynomial OLS",
      mathematicalModel: "y = a*x^2 + b*x + c",
      estimationSpace: "original (linear in a,b,c)",
      r2OnOriginalY: true,
      domain: { nMin: 3 },
      values: {
        a: quadraticA,
        b: quadraticB,
        c: quadraticC,
        r2: quadraticR2pack.r2,
        ssRes: quadraticR2pack.ssRes,
        ssTot: quadraticR2pack.ssTot,
      },
      display: {
        a: quadraticA.toFixed(4),
        b: quadraticB.toFixed(4),
        c: quadraticC.toFixed(4),
        r2: quadraticR2pack.r2.toFixed(4),
        equation: `y = ${quadraticA.toFixed(4)}x² ${quadraticB >= 0 ? "+" : "-"} ${Math.abs(quadraticB).toFixed(4)}x ${quadraticC >= 0 ? "+" : "-"} ${Math.abs(quadraticC).toFixed(4)}`,
      },
      fittedValues: quadraticFitted,
    },
    "T3-003": {
      method: "Exponential transformed OLS",
      mathematicalModel: "y = a * exp(b*x)",
      estimationSpace: "ln(y) = alpha + beta*x; a=exp(alpha); b=beta",
      r2OnOriginalY: true,
      domain: { yGreaterThanZero: true, nMin: 2 },
      values: {
        a: expA,
        b: expB,
        alpha: expAlpha,
        r2: expR2pack.r2,
        ssRes: expR2pack.ssRes,
        ssTot: expR2pack.ssTot,
      },
      display: {
        a: expA.toFixed(4),
        b: expB.toFixed(4),
        r2: expR2pack.r2.toFixed(4),
        equation: `${expA.toFixed(4)} · e^(${expB.toFixed(4)}x)`,
      },
      fittedValues: expFitted,
    },
    "T3-004": {
      method: "Logarithmic transformed OLS",
      mathematicalModel: "y = alpha + beta*ln(x)",
      estimationSpace: "y on ln(x)",
      r2OnOriginalY: true,
      domain: { xGreaterThanZero: true, nMin: 2 },
      values: {
        intercept: logAlpha,
        slope: logBeta,
        r2: logR2pack.r2,
        ssRes: logR2pack.ssRes,
        ssTot: logR2pack.ssTot,
      },
      display: {
        intercept: logAlpha.toFixed(4),
        slope: logBeta.toFixed(4),
        r2: logR2pack.r2.toFixed(4),
        equation: `${logAlpha.toFixed(4)} ${logBeta >= 0 ? "+" : "-"} ${Math.abs(logBeta).toFixed(4)}·ln(x)`,
      },
      fittedValues: logFitted,
    },
    "T3-005": {
      method: "Power transformed OLS",
      mathematicalModel: "y = a * x^b",
      estimationSpace: "ln(y) = alpha + beta*ln(x); a=exp(alpha); b=beta",
      r2OnOriginalY: true,
      domain: { xGreaterThanZero: true, yGreaterThanZero: true, nMin: 2 },
      values: {
        a: powA,
        b: powB,
        alpha: powAlpha,
        r2: powR2pack.r2,
        ssRes: powR2pack.ssRes,
        ssTot: powR2pack.ssTot,
      },
      display: {
        a: powA.toFixed(4),
        b: powB.toFixed(4),
        r2: powR2pack.r2.toFixed(4),
        equation: `${powA.toFixed(4)} · x^${powB.toFixed(4)}`,
      },
      fittedValues: powFitted,
    },
  },
  informationalOnly: {
    linearOlsAlreadyClosedAsB2C002: {
      slope: linearOls.slope,
      intercept: linearOls.intercept,
      r2: linearR2,
      note: "NOT a T3-002..005 closure case. B2C-002 CLOSED.",
    },
    productionStyleBestModel: informationalBest
      ? {
          model: informationalBest.model,
          r2: informationalBest.r2,
          note: "chooseBestRegressionModel analogue. Informational only. NOT a T3 closure case.",
        }
      : null,
  },
  caveats:
    "Do not compare these oracles to SciPy curve_fit / iterative NLS. Exponential and power use log-space OLS. Linear OLS must not be reopened.",
};

writeFileSync(
  join(ROOT, "batch3B_reference_results.json"),
  `${JSON.stringify(json, null, 2)}\n`,
  "utf8"
);

const matrixHeader = [
  "ID",
  "Method",
  "Dataset",
  "MathematicalModel",
  "PrimaryObservables",
  "AcceptanceTolerance",
  "DomainRequirements",
  "OracleMethod",
  "Status",
];

const matrixRows = [
  [
    "T3-002",
    "Quadratic polynomial OLS",
    CSV_NAME,
    "y = a*x^2 + b*x + c",
    `a=${quadraticA}; b=${quadraticB}; c=${quadraticC}; r2=${quadraticR2pack.r2}`,
    "5e-4 vs 4 decimal display",
    "n>=3; no sign restriction",
    "Independent 3x3 OLS; R² on original y",
    "NOT VALIDATED",
  ],
  [
    "T3-003",
    "Exponential transformed OLS",
    CSV_NAME,
    "y = a*exp(b*x)",
    `a=${expA}; b=${expB}; r2=${expR2pack.r2}`,
    "5e-4 vs 4 decimal display",
    "n>=2; y>0",
    "OLS of ln(y) on x; a=exp(alpha); R² on original y",
    "NOT VALIDATED",
  ],
  [
    "T3-004",
    "Logarithmic transformed OLS",
    CSV_NAME,
    "y = alpha + beta*ln(x)",
    `intercept=${logAlpha}; slope=${logBeta}; r2=${logR2pack.r2}`,
    "5e-4 vs 4 decimal display",
    "n>=2; x>0",
    "OLS of y on ln(x); R² on original y",
    "NOT VALIDATED",
  ],
  [
    "T3-005",
    "Power transformed OLS",
    CSV_NAME,
    "y = a*x^b",
    `a=${powA}; b=${powB}; r2=${powR2pack.r2}`,
    "5e-4 vs 4 decimal display",
    "n>=2; x>0; y>0",
    "OLS of ln(y) on ln(x); a=exp(alpha); R² on original y",
    "NOT VALIDATED",
  ],
];

writeCsv(join(ROOT, "SCI_REFERENCE_MATRIX_BATCH3B.csv"), matrixHeader, matrixRows);

const checks = {
  headerXY: true,
  n12: n === 12,
  xPositive: xs.every((x) => x > 0),
  yPositive: ys.every((y) => y > 0),
  allFinite: true,
  quadraticSolved: true,
  fourMethodsFinite: allParams.every(Number.isFinite),
  r2InRange: [quadraticR2pack.r2, expR2pack.r2, logR2pack.r2, powR2pack.r2].every(
    (r) => r >= -1e-12 && r <= 1 + 1e-12
  ),
  destShaEqualsLocked: destSha === LOCKED_SOURCE_SHA256,
};

console.log(
  JSON.stringify(
    {
      checks,
      destSha,
      lockedSourceSha: LOCKED_SOURCE_SHA256,
      T3_002: { a: quadraticA, b: quadraticB, c: quadraticC, r2: quadraticR2pack.r2 },
      T3_003: { a: expA, b: expB, r2: expR2pack.r2 },
      T3_004: { intercept: logAlpha, slope: logBeta, r2: logR2pack.r2 },
      T3_005: { a: powA, b: powB, r2: powR2pack.r2 },
      informationalBest,
    },
    null,
    2
  )
);

if (!Object.values(checks).every(Boolean)) {
  console.error("PACKAGE CHECKS FAILED", checks);
  process.exit(1);
}
