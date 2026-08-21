/**
 * Batch 3H independent scientific reference generator.
 * T3-021 — Graph Editor Z-score outlier detector (calculateZScoreOutliers).
 *
 * Node-only. Does not import src/, page.tsx, Production helpers,
 * SciPy, sklearn, pingouin, or network services.
 *
 * T3-019 Box Plot and T3-020 IQR detector are CLOSED and not revalidated.
 * Worksheet z-score transform is out of scope.
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const DATASETS = join(ROOT, "datasets");
const DATASET_NAME = "zscore_spike.csv";

/** Exact locked bytes: UTF-8, Unix LF, trailing newline. */
const LOCKED_CSV =
  "obs,Spike,Zeros\n" +
  "1,1,0\n" +
  "2,0,0\n" +
  "3,0,0\n" +
  "4,0,0\n" +
  "5,0,0\n" +
  "6,0,0\n" +
  "7,0,0\n" +
  "8,0,0\n" +
  "9,0,0\n" +
  "10,0,0\n" +
  "11,0,0\n";

const THRESHOLD = 3;

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
  const lines = text.replace(/^\uFEFF/, "").trimEnd().split(/\n/);
  assert(lines.length >= 2, "CSV too short");
  const header = lines[0].split(",");
  const rows = lines.slice(1).map((line) => line.split(","));
  return { header, rows };
}

function calculateZScoreOutliers(seriesName, points) {
  const eligible = points.filter(
    (point) => Number.isFinite(point.x) && Number.isFinite(point.y)
  );
  const values = eligible.map((point) => point.y);
  const n = values.length;

  if (n < 2) {
    return {
      seriesName,
      method: "Z-Score",
      flagged: [],
      count: 0,
      internalNonContract: {
        nEligible: n,
        mean: n === 0 ? 0 : values[0],
        sampleSd: 0,
        threshold: THRESHOLD,
        note: "n < 2 → []",
      },
    };
  }

  const mean = values.reduce((sum, value) => sum + value, 0) / n;
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (n - 1);
  const sampleSd = Math.sqrt(variance);

  if (sampleSd === 0) {
    return {
      seriesName,
      method: "Z-Score",
      flagged: [],
      count: 0,
      internalNonContract: {
        nEligible: n,
        mean,
        sampleSd: 0,
        variance,
        threshold: THRESHOLD,
        note: "SD === 0 → []",
      },
    };
  }

  const flagged = [];
  for (const point of eligible) {
    const zScore = (point.y - mean) / sampleSd;
    if (Math.abs(zScore) <= THRESHOLD) continue;
    flagged.push({ x: point.x, y: point.y, score: zScore });
  }

  return {
    seriesName,
    method: "Z-Score",
    flagged,
    count: flagged.length,
    internalNonContract: {
      nEligible: n,
      mean,
      sampleSd,
      variance,
      threshold: THRESHOLD,
      note: "mean/SD/threshold are INTERNAL / NON-CONTRACT for T3-021",
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

function main() {
  mkdirSync(DATASETS, { recursive: true });
  const datasetPath = join(DATASETS, DATASET_NAME);
  writeFileSync(datasetPath, LOCKED_CSV, "utf8");

  const buf = readFileSync(datasetPath);
  assert(buf.toString("utf8") === LOCKED_CSV, "dataset bytes != locked LF contract");
  const sha = sha256Hex(buf);

  const parsed = parseCsv(buf.toString("utf8"));
  assert(parsed.header.join(",") === "obs,Spike,Zeros", `header ${parsed.header.join(",")}`);
  assert(parsed.rows.length === 11, `rows ${parsed.rows.length}`);

  const xs = parsed.rows.map((row) => Number(row[0]));
  const spikePoints = xs.map((x, i) => ({ x, y: Number(parsed.rows[i][1]) }));
  const zerosPoints = xs.map((x, i) => ({ x, y: Number(parsed.rows[i][2]) }));

  for (const p of [...spikePoints, ...zerosPoints]) {
    assert(Number.isFinite(p.x) && Number.isFinite(p.y), "non-finite X/Y");
  }

  const spike = calculateZScoreOutliers("Spike", spikePoints);
  const zeros = calculateZScoreOutliers("Zeros", zerosPoints);

  assert(spike.internalNonContract.nEligible === 11, "Spike n");
  assert(spike.internalNonContract.sampleSd > 0, "Spike SD > 0");
  assert(spike.count === 1, `Spike count ${spike.count}`);
  assert(spike.flagged.length === 1, "Spike flagged length");
  assert(spike.flagged[0].x === 1 && spike.flagged[0].y === 1, "Spike outlier identity");
  assert(spike.flagged[0].score > 3, "Spike score > 3");
  assert(spike.flagged[0].score > 0, "Spike score positive");
  assert(Number.isFinite(spike.flagged[0].score), "Spike score finite");
  assert(spike.flagged[0].score.toFixed(4) === "3.0151", `display ${spike.flagged[0].score.toFixed(4)}`);

  const eligibleSpike = new Set(spikePoints.map((p) => `${p.x}\0${p.y}`));
  for (const f of spike.flagged) {
    assert(eligibleSpike.has(`${f.x}\0${f.y}`), "flagged not eligible");
  }

  const mean = spike.internalNonContract.mean;
  const sd = spike.internalNonContract.sampleSd;
  for (const point of spikePoints) {
    const z = (point.y - mean) / sd;
    const isOutlier = Math.abs(z) > THRESHOLD;
    const flagged = spike.flagged.some((f) => f.x === point.x && f.y === point.y);
    assert(flagged === isOutlier, `membership mismatch x=${point.x}`);
    if (!isOutlier) {
      assert(Math.abs(z) <= THRESHOLD, "inlier |z|");
    }
  }

  assert(zeros.internalNonContract.sampleSd === 0, "Zeros SD");
  assert(zeros.count === 0, "Zeros count");
  assert(zeros.flagged.length === 0, "Zeros flagged");

  const derivedTotal = spike.count + zeros.count;
  assert(derivedTotal === 1, "derived total");

  const payload = {
    batchId: "batch3H",
    generatedAt: "independent-oracle-freeze",
    independence:
      "Node-only oracle. No src imports, no Production helpers, no SciPy/sklearn/pingouin, no network. Sample mean/SD and signed z recomputed from raw {x,y} cells.",
    provenance: {
      scientificId: "T3-021",
      engine: "Graph Editor Z-score Outlier Detector",
      productionFunction: "calculateZScoreOutliers",
      graphEditorPath: "Graph Editor → Mostrar outliers → Método Z-Score",
      note: "Independent reference freeze. NOT Production validation. Not T3-019. Not T3-020 IQR. Not worksheet zscore transform.",
    },
    formulas: {
      eligibility: "Number.isFinite(x) AND Number.isFinite(y); series-wise; no pooling; no grouping",
      mean: "mean = (1/n) Σ y",
      sampleSd: "s = sqrt( Σ(y-mean)² / (n-1) ). Variance on this Spike series is 1/11; s = 1/sqrt(11).",
      z: "z = (y - mean) / s  (signed)",
      outlierRule: "outlier iff Math.abs(z) > 3; |z| = 3 is an inlier",
      nLessThan2: "[]",
      sdZero: "[]",
    },
    dataset: {
      file: DATASET_NAME,
      header: "obs,Spike,Zeros",
      nDataRows: 11,
      sha256: sha,
      lineEndings: "LF",
      encoding: "UTF-8",
    },
    cases: [
      {
        id: "T3-021",
        method: "Graph Editor Z-score Outlier Detector",
        dataset: DATASET_NAME,
        independentOracle: true,
        productionStatus: "NOT VALIDATED",
        exposedContract: {
          method: "Z-Score",
          perSeries: {
            Spike: {
              seriesName: "Spike",
              method: "Z-Score",
              count: spike.count,
              flagged: spike.flagged,
            },
            Zeros: {
              seriesName: "Zeros",
              method: "Z-Score",
              count: zeros.count,
              flagged: zeros.flagged,
            },
          },
          perSeriesCounts: { Spike: spike.count, Zeros: zeros.count },
          derivedTotalAuxiliaryOnly: derivedTotal,
        },
        display: {
          precision: 4,
          Spike: {
            seriesName: "Spike",
            method: "Z-Score",
            count: spike.count,
            flagged: spike.flagged.map(displayPoint),
          },
          Zeros: {
            seriesName: "Zeros",
            method: "Z-Score",
            count: zeros.count,
            flagged: [],
          },
        },
        internalNonContract: {
          note: "mean, SD, threshold, inlier z, Results total count are NOT required T3-021 Results observables.",
          threshold: THRESHOLD,
          Spike: spike.internalNonContract,
          Zeros: zeros.internalNonContract,
        },
      },
    ],
    invariants: {
      header: "obs,Spike,Zeros",
      nDataRows: 11,
      allFiniteXY: true,
      spikeN: 11,
      spikeSdPositive: true,
      spikeExactlyOneOutlier: true,
      spikeOutlierIdentity: "x=1,y=1",
      spikeScorePositive: true,
      spikeScoreGt3: true,
      zerosSdZero: true,
      zerosCountZero: true,
      flaggedFromEligible: true,
      thresholdAbsZGt3: true,
      displayFourDecimals: true,
      noNaN: true,
      status: "PASS",
    },
  };

  writeFileSync(
    join(ROOT, "batch3H_reference_results.json"),
    `${JSON.stringify(payload, null, 2)}\n`,
    "utf8"
  );

  writeCsv(
    join(ROOT, "SCI_REFERENCE_MATRIX_BATCH3H.csv"),
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
      "DatasetSHA256",
    ],
    [
      [
        "T3-021",
        "Graph Editor Z-score Outlier Detector",
        "zscore_spike.csv",
        "YES",
        "z=(y-mean)/sampleSD(n-1); outlier iff |z|>3; score=signed z",
        `Spike count=1 flagged x=1 y=1 score=${spike.flagged[0].score} display=${spike.flagged[0].score.toFixed(4)}; Zeros count=0; derivedTotal auxiliary=${derivedTotal}`,
        "±0.0005 vs 4 d.p. score; membership/count EXACT",
        "visible series; finite X AND Y; n=11 Spike; Zeros SD=0; not IQR; not worksheet zscore",
        "Independent sample mean/SD z; Node-only",
        "NOT VALIDATED",
        sha,
      ],
    ]
  );

  console.log("BATCH 3H T3-021 oracle generated");
  console.log("dataset SHA-256", sha);
  console.log("Spike count", spike.count, "flagged", JSON.stringify(spike.flagged));
  console.log("Spike display score", spike.flagged[0].score.toFixed(4));
  console.log("Zeros count", zeros.count);
  console.log("derivedTotal auxiliary", derivedTotal);
  console.log("invariants PASS");
}

main();
