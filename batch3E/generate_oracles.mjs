/**
 * Batch 3E independent scientific reference generator.
 * T3-018 — ANOVA η² and Production-floor ω² (Graph Editor Effect Size & Power).
 *
 * Node-only. Does not import src/, page.tsx, Production helpers,
 * SciPy, sklearn, pingouin, or network services.
 *
 * ANOVA F, Tukey, and Kruskal–Wallis ε² are NOT recomputed as
 * validation outputs. This package freezes only η² and ω².
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

const SST_IDENTITY_TOL = 1e-12;

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

function isConstant(values) {
  return values.every((v) => v === values[0]);
}

function tryCopyLocked(name) {
  const candidates = [
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

/**
 * One-way ANOVA SS from wide columns as groups (Production Graph Editor:
 * each Y series is a group). Independent of src/.
 */
function oneWayAnovaFromGroups(groups) {
  const k = groups.length;
  const nPer = groups.map((g) => g.length);
  const N = nPer.reduce((s, n) => s + n, 0);
  const all = groups.flat();
  const grandMean = mean(all);
  const groupMeans = groups.map((g) => mean(g));

  let ssb = 0;
  for (let i = 0; i < k; i += 1) {
    ssb += nPer[i] * (groupMeans[i] - grandMean) ** 2;
  }

  let ssw = 0;
  for (let i = 0; i < k; i += 1) {
    const m = groupMeans[i];
    for (const v of groups[i]) {
      ssw += (v - m) ** 2;
    }
  }

  const sst = all.reduce((s, v) => s + (v - grandMean) ** 2, 0);
  const dfB = k - 1;
  const dfW = N - k;
  const msw = dfW > 0 ? ssw / dfW : Number.NaN;
  const etaSquared = sst > 0 ? ssb / sst : 0;
  const omegaSquaredRaw = (ssb - dfB * msw) / (sst + msw);
  const omegaSquaredProduction = Math.max(0, omegaSquaredRaw);

  return {
    k,
    N,
    nPer,
    groupMeans,
    grandMean,
    ssb,
    ssw,
    sst,
    dfB,
    dfW,
    msw,
    etaSquared,
    omegaSquaredRaw,
    omegaSquaredProduction,
  };
}

function main() {
  const datasetNotes = ensureDataset();

  const profilesBuf = readFileSync(join(DATASETS, PROFILES_NAME));
  const profilesSha = sha256Hex(profilesBuf);
  assert(
    profilesSha === LOCKED_PROFILES_SHA256,
    `profiles_four SHA mismatch: ${profilesSha}`
  );

  const profiles = parseCsv(profilesBuf.toString("utf8"));
  assert(
    profiles.header.join(",") === "obs,A,B,C,D",
    `header ${profiles.header.join(",")}`
  );
  assert(profiles.rows.length === 4, `n observations ${profiles.rows.length}`);

  const A = column(profiles.rows, 1);
  const B = column(profiles.rows, 2);
  const C = column(profiles.rows, 3);
  const D = column(profiles.rows, 4);
  for (const v of [...A, ...B, ...C, ...D]) {
    assert(Number.isFinite(v), "non-finite cell");
  }
  assert(isConstant(A), "A must be constant");
  assert(!isConstant(B), "B must be non-constant");
  assert(!isConstant(C), "C must be non-constant");
  assert(!isConstant(D), "D must be non-constant");

  const anova = oneWayAnovaFromGroups([A, B, C, D]);

  assert(Number.isFinite(anova.ssb), "SSB not finite");
  assert(Number.isFinite(anova.ssw), "SSW not finite");
  assert(Number.isFinite(anova.sst), "SST not finite");
  assert(anova.sst >= 0, "SST < 0");
  assert(anova.dfB === 3, `dfB ${anova.dfB}`);
  assert(anova.dfW === 12, `dfW ${anova.dfW}`);
  assert(Number.isFinite(anova.msw), "MSW not finite");
  assert(
    Math.abs(anova.ssb + anova.ssw - anova.sst) < SST_IDENTITY_TOL,
    `SSB+SSW != SST: ${anova.ssb}+${anova.ssw} vs ${anova.sst}`
  );
  assert(anova.etaSquared >= 0 && anova.etaSquared <= 1, `eta² ${anova.etaSquared}`);
  assert(Number.isFinite(anova.omegaSquaredRaw), "raw ω² not finite");
  assert(anova.omegaSquaredProduction >= 0, "floored ω² < 0");
  assert(anova.omegaSquaredRaw < 0, "expected raw ω² negative on this dataset");

  const etaDisplay = anova.etaSquared.toFixed(3);
  const omegaDisplay = anova.omegaSquaredProduction.toFixed(3);
  assert(/^\d\.\d{3}$/.test(etaDisplay), `eta display ${etaDisplay}`);
  assert(/^\d\.\d{3}$/.test(omegaDisplay), `omega display ${omegaDisplay}`);
  assert(etaDisplay === "0.183", `eta display expected 0.183 got ${etaDisplay}`);
  assert(omegaDisplay === "0.000", `omega display expected 0.000 got ${omegaDisplay}`);

  for (const v of [
    anova.grandMean,
    anova.ssb,
    anova.ssw,
    anova.sst,
    anova.msw,
    anova.etaSquared,
    anova.omegaSquaredRaw,
    anova.omegaSquaredProduction,
  ]) {
    assert(Number.isFinite(v), "NaN or Infinity in oracle");
  }

  const payload = {
    batchId: "batch3E",
    generatedAt: "independent-oracle-freeze",
    independence:
      "Node-only oracle. No src imports, no Production helpers, no SciPy/sklearn/pingouin, no network. ANOVA SS recomputed from raw CSV cells.",
    provenance: {
      dataset: datasetNotes,
      scientificId: "T3-018",
      graphEditorPath: "Inferencia → Mostrar ANOVA → Effect Size & Power",
      note: "This JSON is a reference oracle freeze. It is NOT Production validation and does NOT certify Production.",
    },
    formulas: {
      etaSquared: "η² = SSB / SST when SST > 0; else 0. Not partial η². Not generalized η².",
      omegaSquaredRaw: "ω²_raw = (SSB − dfB × MSW) / (SST + MSW)",
      omegaSquaredProduction:
        "ω²_Production = max(0, ω²_raw). omegaSquaredRaw is negative on this dataset; Production applies floor 0.",
      ssb: "SSB = Σ n_g (mean_g − grandMean)²",
      ssw: "SSW = Σ_g Σ_i (y_gi − mean_g)²",
      sst: "SST = Σ (y − grandMean)²",
      dfB: "dfB = k − 1",
      dfW: "dfW = N − k",
      msw: "MSW = SSW / dfW",
    },
    dataset: {
      file: PROFILES_NAME,
      header: "obs,A,B,C,D",
      nObservations: 4,
      nColumns: 5,
      sha256: profilesSha,
      sha256Locked: LOCKED_PROFILES_SHA256,
      shaMatchLocked: profilesSha === LOCKED_PROFILES_SHA256,
      seriesAsGroups: {
        A: A,
        B: B,
        C: C,
        D: D,
      },
    },
    cases: [
      {
        id: "T3-018",
        method: "ANOVA Eta² / Omega²",
        dataset: PROFILES_NAME,
        independentOracle: true,
        productionStatus: "NOT VALIDATED",
        fullPrecision: {
          groupMeans: {
            A: anova.groupMeans[0],
            B: anova.groupMeans[1],
            C: anova.groupMeans[2],
            D: anova.groupMeans[3],
          },
          grandMean: anova.grandMean,
          ssb: anova.ssb,
          ssw: anova.ssw,
          sst: anova.sst,
          dfB: anova.dfB,
          dfW: anova.dfW,
          msw: anova.msw,
          etaSquared: anova.etaSquared,
          omegaSquaredRaw: anova.omegaSquaredRaw,
          omegaSquaredProduction: anova.omegaSquaredProduction,
        },
        display: {
          precision: 3,
          etaSquared: etaDisplay,
          omegaSquaredProduction: omegaDisplay,
        },
        notes: {
          omegaSquaredRawIsNegative: true,
          productionAppliesFloorZero: true,
        },
      },
    ],
    invariants: {
      header: "obs,A,B,C,D",
      nObservations: 4,
      A_constant: true,
      BCD_nonConstant: true,
      allFinite: true,
      ssbFinite: true,
      sswFinite: true,
      sstFinite: true,
      sstNonNegative: true,
      dfB: 3,
      dfW: 12,
      mswFinite: true,
      etaInUnitInterval: true,
      omegaRawFinite: true,
      omegaProductionNonNegative: true,
      displayThreeDecimals: true,
      noNaN: true,
      noInfinity: true,
      ssbPlusSswEqualsSst: true,
      status: "PASS",
    },
  };

  writeFileSync(
    join(ROOT, "batch3E_reference_results.json"),
    `${JSON.stringify(payload, null, 2)}\n`,
    "utf8"
  );

  writeCsv(
    join(ROOT, "SCI_REFERENCE_MATRIX_BATCH3E.csv"),
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
        "T3-018",
        "ANOVA Eta² / Omega²",
        "profiles_four.csv",
        "yes",
        "η²=SSB/SST (SST>0 else 0); ω²=max(0,(SSB−dfB×MSW)/(SST+MSW))",
        `η²=${anova.etaSquared} display=${etaDisplay}; ω²_raw=${anova.omegaSquaredRaw} (negative); ω²_Production=${anova.omegaSquaredProduction} display=${omegaDisplay}`,
        "5e-4 vs 3 decimal display",
        "one-way ANOVA; k=4 groups as Y series; N=16; A constant; SST>0; not partial η²",
        "Independent one-way SS; Node-only; Production floor on ω²",
        "NOT VALIDATED",
      ],
    ]
  );

  console.log("BATCH 3E T3-018 oracle generated");
  console.log("profiles_four SHA-256", profilesSha);
  console.log("grandMean", anova.grandMean);
  console.log("SSB", anova.ssb);
  console.log("SSW", anova.ssw);
  console.log("SST", anova.sst);
  console.log("dfB", anova.dfB, "dfW", anova.dfW, "MSW", anova.msw);
  console.log("eta²", anova.etaSquared, "display", etaDisplay);
  console.log("ω² raw", anova.omegaSquaredRaw);
  console.log("ω² Production floor", anova.omegaSquaredProduction, "display", omegaDisplay);
  console.log("invariants PASS");
}

main();
