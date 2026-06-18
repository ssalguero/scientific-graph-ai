import { createRequire } from "module";
import fs from "fs";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

const cellToNumber = (cell) => {
  if (typeof cell === "number" && Number.isFinite(cell)) return cell;
  if (typeof cell === "string") {
    const trimmed = cell.trim();
    if (!trimmed) return null;
    const value = Number(trimmed.replace(",", "."));
    return Number.isFinite(value) ? value : null;
  }
  return null;
};

const cellToText = (cell) => String(cell ?? "").trim();

const normalizeLabel = (value) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");

const INDEPENDENT_HINTS = [
  "x",
  "time",
  "tiempo",
  "min",
  "concentration",
  "concentracion",
  "conc",
  "cpromedio",
  "c mmol",
  "c mg",
  "cf",
  "ceq",
];

const DEPENDENT_HINTS = ["y", "q ", "q(", "q mmol", "q mg", "q/g", " adsor", "sorb"];

const scoreIndependentLabel = (label) => {
  const normalized = normalizeLabel(label);
  return INDEPENDENT_HINTS.reduce(
    (score, hint) => (normalized.includes(hint) ? score + 1 : score),
    0
  );
};

const scoreDependentLabel = (label) => {
  const normalized = normalizeLabel(label);
  return DEPENDENT_HINTS.reduce(
    (score, hint) => (normalized.includes(hint) ? score + 1 : score),
    0
  );
};

const getMatrixBounds = (matrix) => {
  let maxRow = 0;
  let maxCol = 0;
  matrix.forEach((row, rowIndex) => {
    if (!Array.isArray(row)) return;
    row.forEach((cell, colIndex) => {
      if (cellToText(cell) === "") return;
      maxRow = Math.max(maxRow, rowIndex);
      maxCol = Math.max(maxCol, colIndex);
    });
  });
  return { maxRow, maxCol };
};

const isHeaderCandidate = (row) => {
  const labels = row.map((cell) => cellToText(cell)).filter(Boolean);
  if (labels.length < 2) return false;
  const textLabels = labels.filter((label) => cellToNumber(label) === null);
  return textLabels.length >= Math.max(2, Math.ceil(labels.length * 0.4));
};

const detectTableRegion = (matrix) => {
  const { maxRow, maxCol } = getMatrixBounds(matrix);
  let headerRowIndex = 0;
  let bestScore = -1;
  for (let rowIndex = 0; rowIndex <= Math.min(maxRow, 25); rowIndex += 1) {
    const row = matrix[rowIndex];
    if (!Array.isArray(row) || !isHeaderCandidate(row)) continue;
    const labelCount = row.filter(
      (cell) => cellToText(cell) !== "" && cellToNumber(cell) === null
    ).length;
    const score = labelCount * 10 - rowIndex;
    if (score > bestScore) {
      bestScore = score;
      headerRowIndex = rowIndex;
    }
  }
  return { headerRowIndex, startCol: 0, endCol: maxCol, endRow: maxRow };
};

const buildColumnDescriptors = (matrix, region) => {
  const headerRow = matrix[region.headerRowIndex] ?? [];
  const descriptors = [];
  for (let col = region.startCol; col <= region.endCol; col += 1) {
    let populated = 0;
    let numeric = 0;
    for (
      let rowIndex = region.headerRowIndex + 1;
      rowIndex <= region.endRow;
      rowIndex += 1
    ) {
      const row = matrix[rowIndex];
      if (!Array.isArray(row)) continue;
      if (cellToText(row[col]) === "") continue;
      populated += 1;
      if (cellToNumber(row[col]) !== null) numeric += 1;
    }
    descriptors.push({
      index: col,
      label: cellToText(headerRow[col]) || `Columna ${col + 1}`,
      numericRatio: populated === 0 ? 0 : numeric / populated,
    });
  }
  return descriptors;
};

const suggestAxisMapping = (matrix, region, descriptors) => {
  const candidates = [];
  for (const xDescriptor of descriptors) {
    for (const yDescriptor of descriptors) {
      if (xDescriptor.index === yDescriptor.index) continue;
      if (xDescriptor.numericRatio < 0.15 || yDescriptor.numericRatio < 0.15) {
        continue;
      }
      let count = 0;
      for (
        let rowIndex = region.headerRowIndex + 1;
        rowIndex <= region.endRow;
        rowIndex += 1
      ) {
        const row = matrix[rowIndex];
        if (!Array.isArray(row)) continue;
        const x = cellToNumber(row[xDescriptor.index]);
        const y = cellToNumber(row[yDescriptor.index]);
        if (x !== null && y !== null) count += 1;
      }
      const independentScore = scoreIndependentLabel(xDescriptor.label);
      const dependentScore = scoreDependentLabel(yDescriptor.label);
      const cappedCount = Math.min(count, 12);
      const bothLabeled = independentScore > 0 && dependentScore > 0;
      const score =
        cappedCount * 2 +
        independentScore * 30 +
        dependentScore * 30 +
        (bothLabeled ? 40 : 0) +
        (normalizeLabel(xDescriptor.label).includes("mmol") ? 8 : 0) +
        (normalizeLabel(yDescriptor.label).includes("mmol") ? 10 : 0);
      candidates.push({ ...xDescriptor, yDescriptor, count, score, bothLabeled });
    }
  }
  const labeledCandidates = candidates.filter((item) => item.bothLabeled);
  const pool = labeledCandidates.length > 0 ? labeledCandidates : candidates;
  pool.sort((a, b) => b.score - a.score || b.count - a.count);
  const best = pool[0];
  if (!best || best.count < 2) return null;
  return {
    xColumnIndex: best.index,
    yColumnIndex: best.yDescriptor.index,
    xLabel: best.label,
    yLabel: best.yDescriptor.label,
  };
};

const buildImportPreview = (matrix, region, mapping) => {
  const points = [];
  const skippedRows = [];
  let evaluatedRowCount = 0;

  for (
    let rowIndex = region.headerRowIndex + 1;
    rowIndex <= region.endRow;
    rowIndex += 1
  ) {
    const row = matrix[rowIndex];
    if (!Array.isArray(row)) continue;
    const hasAny = row.some((cell) => cellToText(cell) !== "");
    if (!hasAny) continue;
    evaluatedRowCount += 1;
    const x = cellToNumber(row[mapping.xColumnIndex]);
    const y = cellToNumber(row[mapping.yColumnIndex]);
    if (x !== null && y !== null) {
      points.push({ x, y, sourceRowIndex: rowIndex });
      continue;
    }
    skippedRows.push({
      rowIndex,
      reason: "Fila sin par numérico completo en columnas seleccionadas",
    });
  }

  const coverageRatio =
    evaluatedRowCount === 0 ? 0 : points.length / evaluatedRowCount;

  return { points, skippedRows, evaluatedRowCount, coverageRatio };
};

const validateImport = (preview, mapping, descriptors) => {
  const errors = [];
  const warnings = [];

  if (preview.points.length < 2) {
    errors.push({
      code: "Q-01",
      severity: "error",
      message: "Q-01: se requieren al menos 2 puntos importables",
    });
  }

  if (preview.skippedRows.length > 0 && preview.coverageRatio < 0.7) {
    warnings.push({
      code: "Q-02",
      severity: "warning",
      message: `Q-02: cobertura baja (${Math.round(preview.coverageRatio * 100)}%)`,
    });
  }

  if (
    preview.skippedRows.length > 0 &&
    preview.skippedRows.length / Math.max(preview.evaluatedRowCount, 1) > 0.3
  ) {
    warnings.push({
      code: "Q-03",
      severity: "warning",
      message: `Q-03: más del 30% de filas descartadas (${preview.skippedRows.length}/${preview.evaluatedRowCount})`,
    });
  }

  const xDescriptor = descriptors.find((item) => item.index === mapping.xColumnIndex);
  const yDescriptor = descriptors.find((item) => item.index === mapping.yColumnIndex);
  if (xDescriptor?.numericRatio > 0 && xDescriptor.numericRatio < 0.5) {
    warnings.push({ code: "PARTIAL_NUMERIC_X", severity: "warning", message: "Columna X parcialmente numérica" });
  }
  if (yDescriptor?.numericRatio > 0 && yDescriptor.numericRatio < 0.5) {
    warnings.push({ code: "PARTIAL_NUMERIC_Y", severity: "warning", message: "Columna Y parcialmente numérica" });
  }

  return { ok: errors.length === 0, errors, warnings };
};

const CASES = [
  {
    id: "RW-01",
    path:
      process.env.RW01_PATH ??
      "C:/Users/Santiago Salseguero/Desktop/JOSEFINA/JOSEFINA ARCHIVOS ESCRITORIO/Backup Josefina/Documents/Paper Pb/Biocomponente PbZn Up 26 octubre 2021.xlsx",
    sheet: "Pb",
    minPoints: 8,
  },
  {
    id: "RW-02",
    path:
      process.env.RW02_PATH ??
      "C:/Users/Santiago Salseguero/Desktop/JOSEFINA/JOSEFINA ARCHIVOS ESCRITORIO/Backup Josefina/Documents/Paper Pb/Pb Ca 1.25.xlsx",
    sheet: "Lang_Up",
    minPoints: 8,
  },
  {
    id: "RW-03",
    path:
      process.env.RW03_PATH ??
      "C:/Users/Santiago Salseguero/Desktop/JOSEFINA/JOSEFINA ARCHIVOS ESCRITORIO/Backup Josefina/Documents/Paper Pb/Sistema Pb-Ca.xlsx",
    sheet: "resultados_Up",
    minPoints: 8,
  },
  {
    id: "RW-04",
    path:
      process.env.RW04_PATH ??
      "C:/Users/Santiago Salseguero/Desktop/JOSEFINA/JOSEFINA ARCHIVOS ESCRITORIO/Backup Josefina/Documents/Paper Pb/Copia de resultado cinetica 3 Mp Up.xls",
    sheet: "Up_PH3",
    minPoints: 10,
  },
];

const results = CASES.map((testCase) => {
  if (!fs.existsSync(testCase.path)) {
    return { id: testCase.id, pass: false, status: "FAIL", reason: "File not found" };
  }
  const workbook = XLSX.readFile(testCase.path);
  const sheet = workbook.Sheets[testCase.sheet];
  if (!sheet) {
    return { id: testCase.id, pass: false, status: "FAIL", reason: "Sheet not found" };
  }
  const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  const region = detectTableRegion(matrix);
  const descriptors = buildColumnDescriptors(matrix, region);
  const mapping = suggestAxisMapping(matrix, region, descriptors);
  if (!mapping) {
    return { id: testCase.id, pass: false, status: "FAIL", reason: "Mapping not found" };
  }
  const preview = buildImportPreview(matrix, region, mapping);
  const validation = validateImport(preview, mapping, descriptors);
  const pass =
    validation.ok &&
    preview.points.length >= testCase.minPoints &&
    validation.errors.length === 0;

  return {
    id: testCase.id,
    pass,
    status: pass ? "PASS" : "FAIL",
    points: preview.points.length,
    coverage: Math.round(preview.coverageRatio * 100),
    warnings: validation.warnings.map((item) => item.code),
    mapping,
    headerRow: region.headerRowIndex,
  };
});

const summary = {
  pass: results.every((item) => item.pass),
  results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
