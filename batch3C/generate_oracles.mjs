/**
 * Batch 3C independent scientific reference generator.
 * T3-006 MW r, T3-007 Cliff Δ magnitude, T3-008 KW ε²,
 * T3-009 Cohen d z-CI, T3-010 mean-difference t-CI,
 * T3-011 Tukey pair CI (qCritical=3.314),
 * T3-012 observed power (t-path), T3-013 prospective n (g-path).
 *
 * Node-only. Does not import src/, page.tsx, Production helpers,
 * SciPy, sklearn, or network services.
 *
 * Closed engines (t-test, MW, KW, Tukey, Cohen d, Hedges g) are
 * recomputed independently here only as INPUTS to SCI-57 formulas.
 * Those point estimates are not Batch 3C validation outputs.
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

const Z_ALPHA_TWO_TAILED = 1.959964;
const Z_TARGET_POWER = 0.841621;
const TUKEY_Q_CRITICAL = 3.314;

/** Production T_CRITICAL_95_TABLE (α=0.05 two-sided). Copied independently; not imported. */
const T_CRITICAL_95_TABLE = [
  [1, 12.706],
  [2, 4.303],
  [3, 3.182],
  [4, 2.776],
  [5, 2.571],
  [6, 2.447],
  [7, 2.365],
  [8, 2.306],
  [9, 2.262],
  [10, 2.228],
  [11, 2.201],
  [12, 2.179],
  [13, 2.16],
  [14, 2.145],
  [15, 2.131],
  [16, 2.12],
  [17, 2.11],
  [18, 2.101],
  [19, 2.093],
  [20, 2.086],
  [25, 2.06],
  [30, 2.042],
  [40, 2.021],
  [60, 2.0],
  [120, 1.98],
  [Infinity, 1.96],
];

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

function mean(values) {
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function sampleSd(values) {
  const n = values.length;
  assert(n >= 2, "sampleSd n<2");
  const m = mean(values);
  const ss = values.reduce((s, v) => s + (v - m) ** 2, 0);
  return Math.sqrt(ss / (n - 1));
}

function interpolateCriticalTFromTable(degreesOfFreedom) {
  if (degreesOfFreedom <= 0) return Number.NaN;
  if (degreesOfFreedom <= T_CRITICAL_95_TABLE[0][0]) {
    return T_CRITICAL_95_TABLE[0][1];
  }
  for (let index = 1; index < T_CRITICAL_95_TABLE.length; index += 1) {
    const [upperDf, upperT] = T_CRITICAL_95_TABLE[index];
    const [lowerDf, lowerT] = T_CRITICAL_95_TABLE[index - 1];
    if (degreesOfFreedom <= upperDf) {
      if (!Number.isFinite(upperDf)) return upperT;
      const weight = (degreesOfFreedom - lowerDf) / (upperDf - lowerDf);
      return lowerT + weight * (upperT - lowerT);
    }
  }
  return T_CRITICAL_95_TABLE[T_CRITICAL_95_TABLE.length - 1][1];
}

function computeCriticalTValue(alpha, degreesOfFreedom) {
  if (degreesOfFreedom <= 0 || alpha <= 0 || alpha >= 1) return Number.NaN;
  if (Math.abs(alpha - 0.05) > 1e-12) return Number.NaN;
  return interpolateCriticalTFromTable(degreesOfFreedom);
}

/** Abramowitz–Stegun Φ; independent copy of Production approximateStandardNormalCdf. */
function approximateStandardNormalCdf(z) {
  const absoluteZ = Math.abs(z);
  const t = 1 / (1 + 0.2316419 * absoluteZ);
  const density = 0.3989423 * Math.exp((-absoluteZ * absoluteZ) / 2);
  const probability =
    density *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z >= 0 ? 1 - probability : probability;
}

function assignPooledRanks(entries) {
  const ranked = entries.map((entry) => ({ ...entry, rank: 0 }));
  ranked.sort((left, right) => left.value - right.value);
  let start = 0;
  while (start < ranked.length) {
    let end = start;
    while (
      end + 1 < ranked.length &&
      ranked[end + 1].value === ranked[start].value
    ) {
      end += 1;
    }
    const averageRank = (start + end + 2) / 2;
    for (let index = start; index <= end; index += 1) {
      ranked[index].rank = averageRank;
    }
    start = end + 1;
  }
  return ranked;
}

function mannWhitney(valuesA, valuesB) {
  const nA = valuesA.length;
  const nB = valuesB.length;
  assert(nA > 0 && nB > 0, "MW empty group");
  const ranked = assignPooledRanks([
    ...valuesA.map((value) => ({ value, group: 0 })),
    ...valuesB.map((value) => ({ value, group: 1 })),
  ]);
  const rankSumA = ranked
    .filter((entry) => entry.group === 0)
    .reduce((sum, entry) => sum + entry.rank, 0);
  const u1 = nA * nB + (nA * (nA + 1)) / 2 - rankSumA;
  const u2 = nA * nB - u1;
  const uStatistic = Math.min(u1, u2);
  const meanU = (nA * nB) / 2;
  const standardErrorU = Math.sqrt((nA * nB * (nA + nB + 1)) / 12);
  assert(standardErrorU !== 0, "MW SE zero");
  const zScore = (uStatistic - meanU) / standardErrorU;
  return { nA, nB, uStatistic, zScore };
}

function kruskalWallis(groups) {
  const nonempty = groups.filter((g) => g.values.length > 0);
  assert(nonempty.length >= 3, "KW needs >=3 groups");
  const ranked = assignPooledRanks(
    nonempty.flatMap((group, groupIndex) =>
      group.values.map((value) => ({ value, group: groupIndex }))
    )
  );
  const N = ranked.length;
  const rankSums = new Array(nonempty.length).fill(0);
  const sizes = new Array(nonempty.length).fill(0);
  ranked.forEach((entry) => {
    rankSums[entry.group] += entry.rank;
    sizes[entry.group] += 1;
  });
  let hStatistic = 0;
  for (let i = 0; i < nonempty.length; i += 1) {
    assert(sizes[i] > 0, "KW empty ranked group");
    hStatistic += rankSums[i] ** 2 / sizes[i];
  }
  hStatistic = (12 / (N * (N + 1))) * hStatistic - 3 * (N + 1);
  return { hStatistic, totalSampleSize: N, groupCount: nonempty.length };
}

function oneWayAnova(groups) {
  const stats = groups.map((g) => {
    const n = g.values.length;
    assert(n >= 1, "ANOVA empty group");
    const m = mean(g.values);
    const sd = n >= 2 ? sampleSd(g.values) : 0;
    return { name: g.name, values: g.values, n, mean: m, sd };
  });
  const k = stats.length;
  const N = stats.reduce((s, g) => s + g.n, 0);
  const dfw = N - k;
  assert(k >= 3 && dfw > 0, "ANOVA df");
  const all = stats.flatMap((g) => g.values);
  const grand = mean(all);
  const ssb = stats.reduce((s, g) => s + g.n * (g.mean - grand) ** 2, 0);
  const ssw = stats.reduce(
    (s, g) => s + g.values.reduce((inner, v) => inner + (v - g.mean) ** 2, 0),
    0
  );
  assert(ssw !== 0, "ANOVA SSW zero");
  const msw = ssw / dfw;
  return { groups: stats, meanSquareWithin: msw };
}

function tukeyPairs(anova) {
  const msw = anova.meanSquareWithin;
  const pairs = [];
  for (let i = 0; i < anova.groups.length; i += 1) {
    for (let j = i + 1; j < anova.groups.length; j += 1) {
      const a = anova.groups[i];
      const b = anova.groups[j];
      const delta = a.mean - b.mean;
      const se = Math.sqrt((msw / 2) * (1 / a.n + 1 / b.n));
      if (se === 0) continue;
      pairs.push({
        seriesA: a.name,
        seriesB: b.name,
        delta,
        se,
        lower: delta - TUKEY_Q_CRITICAL * se,
        upper: delta + TUKEY_Q_CRITICAL * se,
      });
    }
  }
  return pairs;
}

function tryCopyLocked(name) {
  const candidates = [
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

function ensureDatasets() {
  mkdirSync(DATASETS, { recursive: true });
  const notes = {};

  const copiedProfiles = tryCopyLocked(PROFILES_NAME);
  if (copiedProfiles) {
    notes.profiles_four = copiedProfiles;
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
    writeCsv(join(DATASETS, PROFILES_NAME), ["obs", "A", "B", "C", "D"], rows);
    notes.profiles_four = {
      provenance:
        "reconstructed from locked Batch 2A/2C/3A contract (A=[0,0,0,0]; B,C,D integer profiles; Unix LF). No live locked copy on disk.",
      sourcePath: null,
    };
  }

  const copiedCohen = tryCopyLocked(COHEN_NAME);
  if (copiedCohen) {
    notes.cohend_groups = copiedCohen;
  } else {
    const groupA = [12.0, 12.5, 13.0, 12.2, 13.5, 12.8];
    const groupB = [9.0, 9.5, 8.8, 10.0, 9.2, 9.6];
    const rows = groupA.map((a, i) => [i + 1, a, groupB[i]]);
    writeCsv(join(DATASETS, COHEN_NAME), ["obs", "Group_A", "Group_B"], rows);
    notes.cohend_groups = {
      provenance:
        "reconstructed from locked Batch 2A generate_oracles.mjs arrays (Group_A/Group_B n=6). No live locked copy on disk.",
      sourcePath: null,
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
    `profiles_four SHA mismatch: ${profilesSha}`
  );

  const profiles = parseCsv(profilesBuf.toString("utf8"));
  assert(
    profiles.header.join(",") === "obs,A,B,C,D",
    "profiles header"
  );
  assert(profiles.rows.length === 4, "profiles row count");
  assert(profiles.header.length === 5, "profiles columns");

  const cohen = parseCsv(cohenBuf.toString("utf8"));
  assert(
    cohen.header.join(",") === "obs,Group_A,Group_B",
    "cohend header"
  );
  assert(cohen.rows.length === 6, "cohend row count");
  assert(cohen.header.length === 3, "cohend columns");

  const groupA = column(cohen.rows, 1);
  const groupB = column(cohen.rows, 2);
  assert(groupA.every(Number.isFinite) && groupB.every(Number.isFinite), "cohen Y finite");
  assert(groupA.length === 6 && groupB.length === 6, "cohen n");

  const mw = mannWhitney(groupA, groupB);
  const mwR = Math.abs(mw.zScore) / Math.sqrt(mw.nA + mw.nB);
  const cliffMag = Math.max(
    0,
    Math.min(1, 1 - (2 * mw.uStatistic) / (mw.nA * mw.nB))
  );
  assert(mwR >= 0 && mwR <= 1, "MW r range");
  assert(cliffMag >= 0 && cliffMag <= 1, "Cliff mag range");

  const nA = groupA.length;
  const nB = groupB.length;
  const meanA = mean(groupA);
  const meanB = mean(groupB);
  const sdA = sampleSd(groupA);
  const sdB = sampleSd(groupB);
  const df = nA + nB - 2;
  assert(df > 0, "df");
  const pooledVariance =
    ((nA - 1) * sdA ** 2 + (nB - 1) * sdB ** 2) / df;
  assert(pooledVariance > 0, "pooled variance");
  const sp = Math.sqrt(pooledVariance);
  const seDiff = sp * Math.sqrt(1 / nA + 1 / nB);
  const tStatistic = (meanA - meanB) / seDiff;
  const cohensD = (meanA - meanB) / sp;
  const hedgesG = df > 1 ? cohensD * (1 - 3 / (4 * df - 1)) : cohensD;

  const seD = Math.sqrt(
    (nA + nB) / (nA * nB) + (cohensD * cohensD) / (2 * (nA + nB))
  );
  assert(seD > 0, "SE_d");
  const dLower = cohensD - Z_ALPHA_TWO_TAILED * seD;
  const dUpper = cohensD + Z_ALPHA_TWO_TAILED * seD;
  assert(dLower <= dUpper, "d CI order");

  const tCritical = computeCriticalTValue(0.05, df);
  assert(Number.isFinite(tCritical), "t critical");
  const meanDiff = meanA - meanB;
  const mdLower = meanDiff - tCritical * seDiff;
  const mdUpper = meanDiff + tCritical * seDiff;
  assert(mdLower <= mdUpper, "mean-diff CI order");

  const absT = Math.abs(tStatistic);
  let observedPower =
    1 -
    approximateStandardNormalCdf(Z_ALPHA_TWO_TAILED - absT) +
    approximateStandardNormalCdf(-Z_ALPHA_TWO_TAILED - absT);
  observedPower = Math.max(0, Math.min(1, observedPower));
  assert(observedPower >= 0 && observedPower <= 1, "power range");

  const es = Math.abs(hedgesG);
  assert(es > 0, "ES for prospective n");
  const prospectiveN = Math.ceil(
    2 * ((Z_ALPHA_TWO_TAILED + Z_TARGET_POWER) / es) ** 2
  );
  assert(Number.isInteger(prospectiveN) && prospectiveN >= 1, "prospective n");

  const profileGroups = [
    { name: "A", values: column(profiles.rows, 1) },
    { name: "B", values: column(profiles.rows, 2) },
    { name: "C", values: column(profiles.rows, 3) },
    { name: "D", values: column(profiles.rows, 4) },
  ];
  profileGroups.forEach((g) => {
    assert(g.values.length === 4, `profile ${g.name} n`);
    assert(g.values.every(Number.isFinite), `profile ${g.name} finite`);
  });

  const kw = kruskalWallis(profileGroups);
  const denom = (kw.totalSampleSize ** 2 - 1) / (kw.totalSampleSize + 1);
  assert(denom !== 0, "epsilon denom");
  const epsilon2 = Math.min(1, kw.hStatistic / denom);
  assert(epsilon2 >= 0 && epsilon2 <= 1, "epsilon range");

  const anova = oneWayAnova(profileGroups);
  const tukey = tukeyPairs(anova);
  assert(tukey.length === 6, `Tukey pair count ${tukey.length}`);
  tukey.forEach((p) => {
    assert(Number.isFinite(p.lower) && Number.isFinite(p.upper), "Tukey CI finite");
    assert(p.lower <= p.upper, "Tukey CI order");
  });

  const cases = {
    "T3-006": {
      metric: "MW r",
      value: mwR,
      display: mwR.toFixed(2),
      inputs: { zScore: mw.zScore, nA: mw.nA, nB: mw.nB, uStatistic: mw.uStatistic },
    },
    "T3-007": {
      metric: "Cliff Delta magnitude",
      value: cliffMag,
      display: cliffMag.toFixed(2),
      inputs: { uStatistic: mw.uStatistic, nA: mw.nA, nB: mw.nB },
    },
    "T3-008": {
      metric: "KW epsilon^2",
      value: epsilon2,
      display: epsilon2.toFixed(3),
      inputs: {
        hStatistic: kw.hStatistic,
        N: kw.totalSampleSize,
        groupCount: kw.groupCount,
      },
    },
    "T3-009": {
      metric: "Cohen d 95% z-CI",
      cohensD,
      seD,
      z: Z_ALPHA_TWO_TAILED,
      lower: dLower,
      upper: dUpper,
      display: `IC95% [${dLower.toFixed(2)}, ${dUpper.toFixed(2)}]`,
    },
    "T3-010": {
      metric: "Mean-difference 95% t-CI",
      meanDifference: meanDiff,
      se: seDiff,
      df,
      tCritical,
      lower: mdLower,
      upper: mdUpper,
      display: `IC95% [${mdLower.toFixed(2)}, ${mdUpper.toFixed(2)}]`,
    },
    "T3-011": {
      metric: "Tukey pair CI",
      qCritical: TUKEY_Q_CRITICAL,
      pairs: tukey.map((p) => ({
        ...p,
        display: `IC95% [${p.lower.toFixed(2)}, ${p.upper.toFixed(2)}]`,
        deltaDisplay: p.delta.toFixed(2),
      })),
    },
    "T3-012": {
      metric: "Observed power (t-path)",
      tStatistic,
      zAlpha: Z_ALPHA_TWO_TAILED,
      power: observedPower,
      displayPercent: (observedPower * 100).toFixed(1),
    },
    "T3-013": {
      metric: "Prospective n per group (g-path)",
      hedgesG,
      es,
      zAlpha: Z_ALPHA_TWO_TAILED,
      z80: Z_TARGET_POWER,
      n: prospectiveN,
      display: String(prospectiveN),
    },
  };

  const closedEngineInputsOnly = {
    note: "Not Batch 3C validation outputs. Independent recomputation of closed contracts used as inputs.",
    cohensD,
    hedgesG,
    tStatistic,
    mannWhitneyU: mw.uStatistic,
    mannWhitneyZ: mw.zScore,
    kruskalWallisH: kw.hStatistic,
  };

  const payload = {
    package: "batch3C",
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
        shaMatchLocked: profilesSha === LOCKED_PROFILES_SHA256,
        bytes: profilesBuf.length,
      },
      cohend_groups: {
        sha256: cohenSha,
        bytes: cohenBuf.length,
      },
    },
    closedEngineInputsOnly,
    cases,
  };

  writeFileSync(
    join(ROOT, "batch3C_reference_results.json"),
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
  const tukeyObs = tukey
    .map(
      (p) =>
        `${p.seriesA}-${p.seriesB}: Δ=${p.delta.toFixed(2)} CI=[${p.lower.toFixed(2)}, ${p.upper.toFixed(2)}]`
    )
    .join("; ");
  const matrixRows = [
    [
      "T3-006",
      "Mann-Whitney r",
      COHEN_NAME,
      "r = |z| / sqrt(nA+nB)",
      `r=${mwR}; display=${mwR.toFixed(2)}`,
      "5e-3 vs 2 decimal display",
      "nA,nB>=1; MW z from Production contract (no sigma tie correction)",
      "Independent MW z then r; Node-only",
      "NOT VALIDATED",
    ],
    [
      "T3-007",
      "Cliff Delta magnitude",
      COHEN_NAME,
      "clip(1 - 2U/(nA*nB), 0, 1)",
      `magnitude=${cliffMag}; display=${cliffMag.toFixed(2)}`,
      "5e-3 vs 2 decimal display",
      "magnitude only; not signed Cliff Delta",
      "Independent U=min(U1,U2) then magnitude clip",
      "NOT VALIDATED",
    ],
    [
      "T3-008",
      "Kruskal-Wallis epsilon^2",
      PROFILES_NAME,
      "min(1, H / ((N^2-1)/(N+1)))",
      `epsilon2=${epsilon2}; display=${epsilon2.toFixed(3)}`,
      "5e-4 vs 3 decimal display",
      "uncorrected H from B2C Production contract",
      "Independent KW H then epsilon^2; H not revalidated as a case",
      "NOT VALIDATED",
    ],
    [
      "T3-009",
      "Cohen d 95% z-CI",
      COHEN_NAME,
      "d ± 1.959964 * SE_d; SE_d=sqrt((nA+nB)/(nA*nB)+d^2/(2(nA+nB)))",
      `d=${cohensD}; lower=${dLower}; upper=${dUpper}; display=${cases["T3-009"].display}`,
      "5e-3 vs 2 decimal display",
      "validates CI only; d point estimate CLOSED B2A-004",
      "Independent z-CI; z=1.959964 not 1.96",
      "NOT VALIDATED",
    ],
    [
      "T3-010",
      "Mean-difference 95% t-CI",
      COHEN_NAME,
      "(meanA-meanB) ± t*_table(df,0.05) * SE_pooled",
      `diff=${meanDiff}; tCritical=${tCritical}; lower=${mdLower}; upper=${mdUpper}; display=${cases["T3-010"].display}`,
      "5e-3 vs 2 decimal display",
      "pooled equal-variance; alpha=0.05 only; interpolated T_CRITICAL_95_TABLE",
      "Independent table interpolation; not SciPy t.ppf",
      "NOT VALIDATED",
    ],
    [
      "T3-011",
      "Tukey pair CI",
      PROFILES_NAME,
      "Δ ± 3.314 * SE_Tukey",
      tukeyObs,
      "5e-3 vs 2 decimal display",
      "qCritical=3.314 EXACTLY; not studentized-range tables",
      "Independent ANOVA MSW + Tukey SE then 3.314 CI; Tukey test CLOSED B2C-005",
      "NOT VALIDATED",
    ],
    [
      "T3-012",
      "Observed power t-path",
      COHEN_NAME,
      "1-Phi(zα-|t|)+Phi(-zα-|t|); clamp [0,1]",
      `t=${tStatistic}; power=${observedPower}; displayPercent=${(observedPower * 100).toFixed(1)}`,
      "0.05 percentage points vs 1 decimal % display",
      "t-path only; MW z-path deferred; not noncentral t",
      "Independent Abramowitz–Stegun Φ; not G*Power",
      "NOT VALIDATED",
    ],
    [
      "T3-013",
      "Prospective n per group g-path",
      COHEN_NAME,
      "ceil(2*((zα+z80)/|g|)^2)",
      `g=${hedgesG}; n=${prospectiveN}`,
      "exact integer",
      "ES=|g|>0; planning not observed power; MW r→d path deferred",
      "Independent ceil formula; g used as input only (CLOSED B2A-004)",
      "NOT VALIDATED",
    ],
  ];

  const matrixLines = [
    matrixHeader.join(","),
    ...matrixRows.map((row) => row.map(csvEscape).join(",")),
    "",
  ];
  writeFileSync(
    join(ROOT, "SCI_REFERENCE_MATRIX_BATCH3C.csv"),
    matrixLines.join("\n"),
    "utf8"
  );

  const matrixText = readFileSync(
    join(ROOT, "SCI_REFERENCE_MATRIX_BATCH3C.csv"),
    "utf8"
  );
  const ids = matrixText
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.split(",")[0]);
  assert(
    ids.join("|") ===
      "T3-006|T3-007|T3-008|T3-009|T3-010|T3-011|T3-012|T3-013",
    `matrix IDs ${ids.join(",")}`
  );

  JSON.parse(
    readFileSync(join(ROOT, "batch3C_reference_results.json"), "utf8")
  );

  console.log("BATCH 3C ORACLES GENERATED");
  console.log("profiles_four SHA-256", profilesSha);
  console.log("cohend_groups SHA-256", cohenSha);
  console.log("T3-006 r", mwR.toFixed(2), mwR);
  console.log("T3-007 Cliff mag", cliffMag.toFixed(2), cliffMag);
  console.log("T3-008 epsilon2", epsilon2.toFixed(3), epsilon2);
  console.log("T3-009", cases["T3-009"].display);
  console.log("T3-010", cases["T3-010"].display);
  console.log("T3-011 pairs", tukey.length);
  console.log("T3-012 power%", (observedPower * 100).toFixed(1));
  console.log("T3-013 n", prospectiveN);
  console.log("ALL INVARIANTS PASS");
}

main();
