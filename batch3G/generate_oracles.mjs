/**
 * Batch 3G independent scientific reference generator.
 * T3-020 — Graph Editor IQR outlier detector (calculateIQROutliers).
 *
 * Node-only. Does not import src/, page.tsx, Production helpers,
 * SciPy, sklearn, pingouin, or network services.
 *
 * T3-019 Box Plot is CLOSED and is not revalidated here.
 * Z-score detector is out of scope for this package.
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

function tryCopyLocked(name) {
  const candidates = [
    join(REPO, "batch3F", "datasets", name),
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

function calculateIQROutliers(seriesName, points) {
  const eligible = points.filter(
    (point) => Number.isFinite(point.x) && Number.isFinite(point.y)
  );

  if (eligible.length === 0) {
    return {
      seriesName,
      method: "IQR",
      flagged: [],
      count: 0,
      internalNonContract: {
        nEligible: 0,
        q1: 0,
        q3: 0,
        iqr: 0,
        lowerFence: 0,
        upperFence: 0,
        note: "no eligible finite X∧Y points",
      },
    };
  }

  const sortedY = [...eligible.map((point) => point.y)].sort(
    (left, right) => left - right
  );
  const q1 = getQuantile(sortedY, 0.25);
  const q3 = getQuantile(sortedY, 0.75);
  const iqr = q3 - q1;

  if (iqr === 0) {
    return {
      seriesName,
      method: "IQR",
      flagged: [],
      count: 0,
      internalNonContract: {
        nEligible: eligible.length,
        q1,
        q3,
        iqr: 0,
        lowerFence: q1,
        upperFence: q3,
        note: "IQR=0 → empty outlier set",
      },
    };
  }

  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;

  const flagged = [];
  for (const point of eligible) {
    if (point.y >= lowerFence && point.y <= upperFence) continue;
    const score =
      point.y > upperFence
        ? (point.y - upperFence) / iqr
        : (lowerFence - point.y) / iqr;
    flagged.push({ x: point.x, y: point.y, score });
  }

  return {
    seriesName,
    method: "IQR",
    flagged,
    count: flagged.length,
    internalNonContract: {
      nEligible: eligible.length,
      q1,
      q3,
      iqr,
      lowerFence,
      upperFence,
      note: "Q1/Q3/IQR/fences are INTERNAL / NON-CONTRACT for T3-020",
    },
  };
}

function displayPoint(point) {
  return {
    x: point.x.toFixed(4),
    y: point.y.toFixed(4),
    score: point.score.toFixed(4),
  };
}

function assertDetectorInvariants(result, points) {
  const eligible = points.filter(
    (p) => Number.isFinite(p.x) && Number.isFinite(p.y)
  );
  const internal = result.internalNonContract;
  assert(internal.iqr >= 0, `${result.seriesName} IQR < 0`);
  assert(result.count === result.flagged.length, `${result.seriesName} count`);
  if (internal.iqr === 0) {
    assert(result.flagged.length === 0, `${result.seriesName} IQR=0 must be empty`);
  }

  const flaggedKeys = new Set(
    result.flagged.map((p) => `${p.x}\0${p.y}`)
  );
  for (const point of result.flagged) {
    assert(
      eligible.some((e) => e.x === point.x && e.y === point.y),
      `${result.seriesName} flagged not in eligible set`
    );
    assert(Number.isFinite(point.x) && Number.isFinite(point.y) && Number.isFinite(point.score), `${result.seriesName} NaN/Inf`);
    assert(point.score > 0, `${result.seriesName} score must be > 0`);
    if (internal.iqr > 0) {
      assert(
        point.y < internal.lowerFence || point.y > internal.upperFence,
        `${result.seriesName} flagged not strictly outside`
      );
      const expected =
        point.y > internal.upperFence
          ? (point.y - internal.upperFence) / internal.iqr
          : (internal.lowerFence - point.y) / internal.iqr;
      assert(Math.abs(point.score - expected) < 1e-15, `${result.seriesName} score formula`);
    }
  }

  if (internal.iqr > 0) {
    for (const point of eligible) {
      const isFlagged = flaggedKeys.has(`${point.x}\0${point.y}`);
      const inside =
        point.y >= internal.lowerFence && point.y <= internal.upperFence;
      assert(isFlagged !== inside, `${result.seriesName} fence membership mismatch`);
    }
  } else {
    for (const point of eligible) {
      assert(
        !flaggedKeys.has(`${point.x}\0${point.y}`),
        `${result.seriesName} IQR=0 flagged inlier`
      );
    }
  }
}

function main() {
  const datasetNotes = ensureDataset();
  const profilesBuf = readFileSync(join(DATASETS, PROFILES_NAME));
  const destSha = sha256Hex(profilesBuf);
  const sourceSha = datasetNotes.sha ?? destSha;
  assert(destSha === LOCKED_PROFILES_SHA256, `SHA mismatch ${destSha}`);

  const profiles = parseCsv(profilesBuf.toString("utf8"));
  assert(profiles.header.join(",") === "obs,A,B,C,D", "header");
  assert(profiles.rows.length === 4, "n rows");

  const xs = profiles.rows.map((row) => Number(row[0]));
  const seriesPoints = {
    A: xs.map((x, i) => ({ x, y: Number(profiles.rows[i][1]) })),
    B: xs.map((x, i) => ({ x, y: Number(profiles.rows[i][2]) })),
    C: xs.map((x, i) => ({ x, y: Number(profiles.rows[i][3]) })),
    D: xs.map((x, i) => ({ x, y: Number(profiles.rows[i][4]) })),
  };

  const results = {
    A: calculateIQROutliers("A", seriesPoints.A),
    B: calculateIQROutliers("B", seriesPoints.B),
    C: calculateIQROutliers("C", seriesPoints.C),
    D: calculateIQROutliers("D", seriesPoints.D),
  };

  assertDetectorInvariants(results.A, seriesPoints.A);
  assertDetectorInvariants(results.B, seriesPoints.B);
  assertDetectorInvariants(results.C, seriesPoints.C);
  assertDetectorInvariants(results.D, seriesPoints.D);
  assert(results.A.count === 0, "A expected 0 outliers");
  assert(results.B.count >= 1, "B expected IQR outlier path");
  assert(results.C.count >= 1, "C expected IQR outlier path");
  assert(results.D.count === 0, "D expected 0 outliers");

  const totalCount =
    results.A.count + results.B.count + results.C.count + results.D.count;
  assert(
    totalCount ===
      results.A.flagged.length +
        results.B.flagged.length +
        results.C.flagged.length +
        results.D.flagged.length,
    "total count"
  );

  const contractOf = (r) => ({
    seriesName: r.seriesName,
    method: r.method,
    count: r.count,
    flagged: r.flagged,
  });
  const displayOf = (r) => ({
    seriesName: r.seriesName,
    method: r.method,
    count: r.count,
    flagged: r.flagged.map(displayPoint),
  });

  const payload = {
    batchId: "batch3G",
    generatedAt: "independent-oracle-freeze",
    independence:
      "Node-only oracle. No src imports, no Production helpers, no SciPy/sklearn/pingouin, no network. IQR detector recomputed from raw {x,y} cells.",
    provenance: {
      dataset: datasetNotes,
      scientificId: "T3-020",
      graphEditorPath: "Graph Editor → Mostrar outliers → Método IQR",
      note: "Independent reference freeze. NOT Production validation. Not T3-019 Box Plot. Not z-score detector.",
    },
    formulas: {
      eligibility: "Number.isFinite(x) AND Number.isFinite(y); series-wise; no pooling",
      quantile:
        "position=(n-1)*q; linear interpolate floor/ceil (R-7 / Excel PERCENTILE-style)",
      iqr: "IQR = Q3 − Q1; IQR===0 → []",
      fences: "lower=Q1−1.5*IQR; upper=Q3+1.5*IQR; inliers inclusive",
      scoreUpper: "(y − upperFence) / IQR",
      scoreLower: "(lowerFence − y) / IQR",
      scoreAlwaysPositive: true,
    },
    dataset: {
      file: PROFILES_NAME,
      header: "obs,A,B,C,D",
      nObservations: 4,
      nColumns: 5,
      xColumn: "obs",
      sha256Source: sourceSha,
      sha256Destination: destSha,
      sha256Locked: LOCKED_PROFILES_SHA256,
      shaMatchLocked: destSha === LOCKED_PROFILES_SHA256,
    },
    cases: [
      {
        id: "T3-020",
        method: "Graph Editor IQR Outlier Detector",
        dataset: PROFILES_NAME,
        independentOracle: true,
        productionStatus: "NOT VALIDATED",
        exposedContract: {
          method: "IQR",
          perSeries: {
            A: contractOf(results.A),
            B: contractOf(results.B),
            C: contractOf(results.C),
            D: contractOf(results.D),
          },
          perSeriesCounts: {
            A: results.A.count,
            B: results.B.count,
            C: results.C.count,
            D: results.D.count,
          },
          totalCount,
        },
        display: {
          precision: 4,
          counts: "integer",
          perSeries: {
            A: displayOf(results.A),
            B: displayOf(results.B),
            C: displayOf(results.C),
            D: displayOf(results.D),
          },
        },
        internalNonContract: {
          note: "Q1/Q3/IQR/fences are NOT T3-020 Browser observables.",
          A: results.A.internalNonContract,
          B: results.B.internalNonContract,
          C: results.C.internalNonContract,
          D: results.D.internalNonContract,
        },
      },
    ],
    invariants: {
      shaMatch: true,
      finiteEligibleXY: true,
      flaggedFromEligible: true,
      flaggedStrictlyOutside: true,
      nonFlaggedInclusiveInside: true,
      iqrNonNegative: true,
      iqrZeroNoOutliers: true,
      scorePositive: true,
      scoreFormula: true,
      countsMatch: true,
      totalEqualsSum: true,
      noNaN: true,
      noInfinity: true,
      status: "PASS",
    },
  };

  writeFileSync(
    join(ROOT, "batch3G_reference_results.json"),
    `${JSON.stringify(payload, null, 2)}\n`,
    "utf8"
  );

  const b = displayOf(results.B);
  const c = displayOf(results.C);
  writeCsv(
    join(ROOT, "SCI_REFERENCE_MATRIX_BATCH3G.csv"),
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
        "T3-020",
        "Graph Editor IQR Outlier Detector",
        "profiles_four.csv",
        "yes",
        "R-7 quantile; Tukey 1.5 IQR; inclusive fences; score=(y-fence)/IQR beyond fence",
        `A count=0; B count=${results.B.count} ${JSON.stringify(b.flagged)}; C count=${results.C.count} ${JSON.stringify(c.flagged)}; D count=0; total=${totalCount}`,
        "5e-4 vs 4 decimal X/Y/score; counts exact; membership exact",
        "visible series; finite X AND Y; no pooling; not T3-019 box; not z-score",
        "Independent calculateIQROutliers; Node-only",
        "NOT VALIDATED",
      ],
    ]
  );

  console.log("BATCH 3G T3-020 oracle generated");
  console.log("sha source", sourceSha);
  console.log("sha destination", destSha);
  for (const name of ["A", "B", "C", "D"]) {
    const r = results[name];
    console.log(name, "count", r.count, "flagged", JSON.stringify(r.flagged));
  }
  console.log("totalCount", totalCount);
  console.log("invariants PASS");
}

main();
