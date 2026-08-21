/**
 * Batch 3D independent scientific reference generator.
 * T3-014 Forest Plot mean IC95 (z=1.96)
 * T3-015 VGB bar CI half-width (ci95)
 * T3-016 QQ Plot Pearson r (Acklam Φ⁻¹)
 * T3-017 Skewness + excess kurtosis (moments /n)
 *
 * Node-only. Does not import src/, page.tsx, Production helpers,
 * SciPy, sklearn, or network services.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const DATASETS = join(ROOT, "datasets");
const REPO = dirname(ROOT);

const PROFILES_NAME = "profiles_four.csv";
const COHEN_NAME = "cohend_groups.csv";
const LOCKED_PROFILES_SHA256 =
  "F93DB5349399B525ECA77232A783ED0E4A0A4D192B942628D8B8C085894430D9";
const LOCKED_COHEN_SHA256 =
  "E9D0004AE3C21C8063A1CDDC9B001AA394E77B5FD86DFB44698E9B1A3918188B";

const Z_LITERAL_196 = 1.96;

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

function mean(values) {
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function sampleSd(values) {
  const n = values.length;
  if (n <= 1) return 0;
  const m = mean(values);
  const ss = values.reduce((s, v) => s + (v - m) ** 2, 0);
  return Math.sqrt(ss / (n - 1));
}

function forestEntry(name, values) {
  const finite = values.filter(Number.isFinite);
  const n = finite.length;
  assert(n > 0, `Forest empty ${name}`);
  const m = mean(finite);
  const sd = sampleSd(finite);
  const se = n > 0 ? sd / Math.sqrt(n) : 0;
  const margin = Z_LITERAL_196 * se;
  const lower = m - margin;
  const upper = m + margin;
  return {
    seriesName: name,
    n,
    mean: m,
    sd,
    se,
    lower,
    upper,
    degenerate: sd === 0,
    display: {
      mean: m.toFixed(4),
      sd: sd.toFixed(4),
      se: se.toFixed(4),
      lower: lower.toFixed(4),
      upper: upper.toFixed(4),
    },
  };
}

/** Independent Acklam inverse normal CDF. Not Production import. */
function inverseNormalCdfAcklam(probability) {
  if (!Number.isFinite(probability) || probability <= 0 || probability >= 1) {
    return Number.NaN;
  }
  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469138e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239e0,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368152409e2, -1.556989798850864e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580040421e-1, -2.400758277161838e0,
    -2.549507540030974e0, 4.374664141464968e0, 2.938163982698053e0,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996e0,
    3.754408661907416e0,
  ];
  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  if (probability < pLow) {
    const q = Math.sqrt(-2 * Math.log(probability));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
  if (probability <= pHigh) {
    const q = probability - 0.5;
    const r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) *
        q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  }
  const q = Math.sqrt(-2 * Math.log(1 - probability));
  return (
    -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  );
}

function pearson(x, y) {
  const n = x.length;
  assert(n === y.length && n >= 2, "Pearson n");
  const mx = mean(x);
  const my = mean(y);
  let cov = 0;
  let vx = 0;
  let vy = 0;
  for (let i = 0; i < n; i += 1) {
    const dx = x[i] - mx;
    const dy = y[i] - my;
    cov += dx * dy;
    vx += dx * dx;
    vy += dy * dy;
  }
  assert(vx !== 0 && vy !== 0, "Pearson zero variance");
  return cov / Math.sqrt(vx * vy);
}

function qqR(values) {
  const finite = values.filter(Number.isFinite);
  const n = finite.length;
  assert(n >= 2, "QQ n<2");
  const sorted = [...finite].sort((a, b) => a - b);
  const theoretical = [];
  for (let i = 0; i < n; i += 1) {
    const p = (i + 0.5) / n;
    const z = inverseNormalCdfAcklam(p);
    assert(Number.isFinite(z), `Acklam failed p=${p}`);
    theoretical.push(z);
  }
  const r = pearson(theoretical, sorted);
  return { n, r, display: r.toFixed(4) };
}

function momentsSkewKurt(values) {
  const finite = values.filter(Number.isFinite);
  const n = finite.length;
  assert(n >= 2, "moments n");
  const m = mean(finite);
  let m2 = 0;
  let m3 = 0;
  let m4 = 0;
  for (const v of finite) {
    const d = v - m;
    m2 += d ** 2;
    m3 += d ** 3;
    m4 += d ** 4;
  }
  m2 /= n;
  m3 /= n;
  m4 /= n;
  assert(m2 > 0, "m2=0 constant series");
  const skewness = m3 / m2 ** 1.5;
  const excessKurtosis = m4 / (m2 * m2) - 3;
  return {
    n,
    mean: m,
    m2,
    m3,
    m4,
    skewness,
    excessKurtosis,
    display: {
      skewness: skewness.toFixed(4),
      excessKurtosis: excessKurtosis.toFixed(4),
    },
  };
}

function tryCopyLocked(name) {
  const candidates = [
    join(REPO, "batch3C", "datasets", name),
    join(REPO, "batch2C", "datasets", name),
    join(REPO, "batch2A", "datasets", name),
    join(REPO, "batch3A", "datasets", name),
  ];
  for (const src of candidates) {
    if (existsSync(src)) {
      const buf = readFileSync(src);
      writeFileSync(join(DATASETS, name), buf);
      return { provenance: `copied from ${src}`, sha: sha256Hex(buf) };
    }
  }
  return null;
}

function ensureDatasets() {
  mkdirSync(DATASETS, { recursive: true });
  const notes = {};

  const copiedP = tryCopyLocked(PROFILES_NAME);
  if (copiedP) {
    notes.profiles_four = copiedP;
  } else {
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
    const lines = [
      "obs,A,B,C,D",
      ...rows.map((row) => row.join(",")),
    ];
    writeFileSync(join(DATASETS, PROFILES_NAME), `${lines.join("\n")}\n`, "utf8");
    notes.profiles_four = {
      provenance: "reconstructed from locked Batch 2A/3A/3C contract",
    };
  }

  const copiedC = tryCopyLocked(COHEN_NAME);
  if (copiedC) {
    notes.cohend_groups = copiedC;
  } else {
    const groupA = [12.0, 12.5, 13.0, 12.2, 13.5, 12.8];
    const groupB = [9.0, 9.5, 8.8, 10.0, 9.2, 9.6];
    const rows = groupA.map((a, i) => [i + 1, a, groupB[i]]);
    const lines = [
      "obs,Group_A,Group_B",
      ...rows.map((row) => row.join(",")),
    ];
    writeFileSync(join(DATASETS, COHEN_NAME), `${lines.join("\n")}\n`, "utf8");
    notes.cohend_groups = {
      provenance: "reconstructed from locked Batch 2A generator arrays",
    };
  }

  return notes;
}

function main() {
  const provenance = ensureDatasets();

  const profilesBuf = readFileSync(join(DATASETS, PROFILES_NAME));
  const cohenBuf = readFileSync(join(DATASETS, COHEN_NAME));
  const profilesSha = sha256Hex(profilesBuf);
  const cohenSha = sha256Hex(cohenBuf);

  assert(
    profilesSha === LOCKED_PROFILES_SHA256,
    `profiles_four SHA mismatch ${profilesSha}`
  );
  assert(
    cohenSha === LOCKED_COHEN_SHA256,
    `cohend_groups SHA mismatch ${cohenSha}`
  );

  const profiles = parseCsv(profilesBuf.toString("utf8"));
  assert(profiles.header.join(",") === "obs,A,B,C,D", "profiles header");
  assert(profiles.rows.length === 4, "profiles rows");

  const cohen = parseCsv(cohenBuf.toString("utf8"));
  assert(cohen.header.join(",") === "obs,Group_A,Group_B", "cohen header");
  assert(cohen.rows.length === 6, "cohen rows");

  const seriesA = column(profiles.rows, 1);
  const seriesB = column(profiles.rows, 2);
  const seriesC = column(profiles.rows, 3);
  const seriesD = column(profiles.rows, 4);
  assert(seriesA.every((v) => v === 0), "A must be constant zero");

  const forest = {
    A: forestEntry("A", seriesA),
    B: forestEntry("B", seriesB),
    C: forestEntry("C", seriesC),
    D: forestEntry("D", seriesD),
  };
  assert(forest.A.degenerate, "A should be zero-width CI");
  assert(!forest.B.degenerate, "B non-degenerate");
  assert(!forest.C.degenerate, "C non-degenerate");
  assert(!forest.D.degenerate, "D non-degenerate");
  for (const key of ["A", "B", "C", "D"]) {
    const e = forest[key];
    assert(e.lower <= e.upper, `${key} CI order`);
    assert(Math.abs(e.lower + e.upper - 2 * e.mean) < 1e-12, `${key} symmetry`);
  }

  const groupA = column(cohen.rows, 1);
  const groupB = column(cohen.rows, 2);
  assert(groupA.length === 6 && groupB.every(Number.isFinite), "Group_A");
  const vgbN = groupA.length;
  const vgbMean = mean(groupA);
  const vgbSd = sampleSd(groupA);
  const vgbError = Z_LITERAL_196 * (vgbSd / Math.sqrt(vgbN));
  assert(vgbError > 0, "VGB error should be positive");
  assert(vgbN === 6, "VGB n");

  const qqA = qqR(groupA);
  const qqB = qqR(groupB);
  assert(Math.abs(qqA.r) <= 1 && Math.abs(qqB.r) <= 1, "QQ |r|<=1");

  const momA = momentsSkewKurt(groupA);
  const momB = momentsSkewKurt(groupB);

  const cases = {
    "T3-014": {
      dataset: PROFILES_NAME,
      z: Z_LITERAL_196,
      note: "Series A is documented zero-width CI (SD=0). B/C/D are non-degenerate.",
      entries: forest,
    },
    "T3-015": {
      dataset: COHEN_NAME,
      graphType: "bar",
      yVariable: "Group_A",
      groupVariable: null,
      category: "Todos",
      n: vgbN,
      value: vgbMean,
      error: vgbError,
      display: {
        value: vgbMean.toFixed(4),
        error: vgbError.toFixed(4),
      },
      note: "Half-width only. Not [lower, upper].",
    },
    "T3-016": {
      dataset: COHEN_NAME,
      Group_A: qqA,
      Group_B: qqB,
    },
    "T3-017": {
      dataset: COHEN_NAME,
      Group_A: momA,
      Group_B: momB,
    },
  };

  const payload = {
    package: "batch3D",
    status: "NOT VALIDATED",
    independence: {
      nodeOnly: true,
      srcImports: false,
      scipy: false,
      sklearn: false,
      network: false,
    },
    provenance,
    datasets: {
      profiles_four: {
        sha256: profilesSha,
        lockedSha256: LOCKED_PROFILES_SHA256,
        shaMatchLocked: true,
        bytes: profilesBuf.length,
      },
      cohend_groups: {
        sha256: cohenSha,
        lockedSha256: LOCKED_COHEN_SHA256,
        shaMatchLocked: true,
        bytes: cohenBuf.length,
      },
    },
    cases,
  };

  writeFileSync(
    join(ROOT, "batch3D_reference_results.json"),
    `${JSON.stringify(payload, null, 2)}\n`,
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
  const forestObs = ["A", "B", "C", "D"]
    .map((k) => {
      const e = forest[k];
      return `${k}: mean=${e.display.mean} SD=${e.display.sd} SE=${e.display.se} IC95=[${e.display.lower}, ${e.display.upper}]`;
    })
    .join("; ");
  const matrixRows = [
    [
      "T3-014",
      "Forest Plot mean IC95",
      PROFILES_NAME,
      "mean ± 1.96 * (s/sqrt(n)); s sample SD n-1",
      forestObs,
      "5e-4 vs 4 decimal display",
      "finite Y; n>=1; A is SD=0 degenerate CI",
      "Independent sample mean/SD; literal 1.96; not t; not 1.959964",
      "NOT VALIDATED",
    ],
    [
      "T3-015",
      "VGB bar CI half-width",
      COHEN_NAME,
      "error = 1.96 * s / sqrt(n); value = mean; category Todos",
      `value=${vgbMean}; error=${vgbError}; display value=${vgbMean.toFixed(4)} error=${vgbError.toFixed(4)}`,
      "5e-4 vs displayed digits",
      "bar graph; Group_A; no grouping; n=6; half-width not [L,U]",
      "Independent sample SD; literal 1.96; VGB contract only",
      "NOT VALIDATED",
    ],
    [
      "T3-016",
      "QQ Plot Pearson r",
      COHEN_NAME,
      "p=(i+0.5)/n; Acklam invNorm; Pearson(theoretical, sorted Y)",
      `Group_A r=${qqA.r} display=${qqA.display}; Group_B r=${qqB.r} display=${qqB.display}`,
      "5e-4 vs 4 decimal display",
      "n>=2; non-constant Y; numeric r only; no interpretation labels",
      "Independent Acklam + Pearson; not SciPy norm.ppf",
      "NOT VALIDATED",
    ],
    [
      "T3-017",
      "Skewness and excess kurtosis",
      COHEN_NAME,
      "mk = n^-1 sum (y-mean)^k; skew=m3/m2^1.5; kurt=m4/m2^2-3",
      `Group_A skew=${momA.display.skewness} kurt=${momA.display.excessKurtosis}; Group_B skew=${momB.display.skewness} kurt=${momB.display.excessKurtosis}`,
      "5e-4 vs 4 decimal display",
      "non-constant series; moments /n; no Fisher G1/G2; no classification labels",
      "Independent central moments; Node-only",
      "NOT VALIDATED",
    ],
  ];

  const matrixLines = [
    matrixHeader.join(","),
    ...matrixRows.map((row) => row.map(csvEscape).join(",")),
    "",
  ];
  writeFileSync(
    join(ROOT, "SCI_REFERENCE_MATRIX_BATCH3D.csv"),
    matrixLines.join("\n"),
    "utf8"
  );

  const ids = readFileSync(join(ROOT, "SCI_REFERENCE_MATRIX_BATCH3D.csv"), "utf8")
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.split(",")[0]);
  assert(
    ids.join("|") === "T3-014|T3-015|T3-016|T3-017",
    `matrix IDs ${ids.join(",")}`
  );

  JSON.parse(readFileSync(join(ROOT, "batch3D_reference_results.json"), "utf8"));

  console.log("BATCH 3D ORACLES GENERATED");
  console.log("profiles_four SHA-256", profilesSha);
  console.log("cohend_groups SHA-256", cohenSha);
  console.log("T3-014 A", forest.A.display);
  console.log("T3-014 B", forest.B.display);
  console.log("T3-014 C", forest.C.display);
  console.log("T3-014 D", forest.D.display);
  console.log("T3-015 value", vgbMean, "error", vgbError);
  console.log("T3-016 Group_A r", qqA.display, "Group_B r", qqB.display);
  console.log(
    "T3-017 Group_A",
    momA.display,
    "Group_B",
    momB.display
  );
  console.log("ALL INVARIANTS PASS");
}

main();
