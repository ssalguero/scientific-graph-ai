/**
 * PROD-2A F5 — E2E project persistence gate (Playwright).
 *
 * Validates: save → close state → open → restore for Dataset5/6,
 * SCI-58/59, graph context, new project reset, baseline after reload, RW-Suite.
 */
import { chromium } from "playwright";
import fs from "fs";
import os from "os";
import path from "path";
import { spawn, spawnSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const BASE_URL = process.env.VALIDATION_BASE_URL ?? "http://localhost:3000";
const DATASET5 =
  process.env.DATASET5_PATH ??
  "C:\\Users\\Santiago Salseguero\\Desktop\\IA CIENTIFICA\\Dataset5.csv";
const DATASET6 =
  process.env.DATASET6_PATH ??
  "C:\\Users\\Santiago Salseguero\\Desktop\\IA CIENTIFICA\\Dataset6.csv";

const BASELINE = {
  dataset5: { evidence: "82.7", readiness: "77.0", overall: "77.0" },
  dataset6: { evidence: "73.3", readiness: "67.5", overall: "67.5" },
};

const GRAPH_TITLE = "PROD2A E2E Graph";
const GRAPH_EXPRESSION = "x^2";

const cases = [];
let serverProcess = null;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const record = (id, pass, detail = {}) => {
  cases.push({ id, pass, ...detail });
};

const assertDatasetExists = (filePath, label) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} not found: ${filePath}`);
  }
};

async function waitForServer(url, attempts = 30, intervalMs = 2000) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (response.ok) return true;
    } catch {
      // retry
    }
    await sleep(intervalMs);
  }
  return false;
}

async function ensureServer() {
  if (await waitForServer(BASE_URL, 3, 1000)) {
    return;
  }

  console.error(`Starting server for E2E at ${BASE_URL} ...`);
  serverProcess = spawn("npm", ["run", "start"], {
    cwd: ROOT,
    stdio: "ignore",
    detached: true,
    shell: true,
  });
  serverProcess.unref();

  const ready = await waitForServer(BASE_URL, 45, 2000);
  if (!ready) {
    throw new Error(
      `Server not reachable at ${BASE_URL}. Run "npm run build && npm run start" first.`
    );
  }
}

async function saveProject(page, savePath, projectName) {
  await page.getByLabel("Nombre del proyecto").fill(projectName);
  const downloadPromise = page.waitForEvent("download", { timeout: 15000 });
  await page.getByRole("button", { name: "Guardar proyecto" }).click();
  const download = await downloadPromise;
  await download.saveAs(savePath);
  await page.getByText(/Proyecto guardado como/i).waitFor({ state: "visible", timeout: 10000 });
}

async function openProject(page, sgprojPath) {
  await page.locator('input[type="file"][accept*=".sgproj"]').setInputFiles(sgprojPath);
  await page.getByText(/Proyecto ".+" abierto/i).waitFor({ state: "visible", timeout: 15000 });
  await sleep(2000);
}

async function importDataset(page, datasetPath) {
  await page.getByRole("tab", { name: "Datos" }).click();
  const preserve = page.getByLabel("Mantener configuración de análisis al importar");
  if (await preserve.isChecked()) {
    await preserve.uncheck();
  }
  await page.locator('input[type="file"][accept*=".csv"]').setInputFiles(datasetPath);
  await page.getByText(`Nombre: ${path.basename(datasetPath)}`).waitFor({
    state: "visible",
    timeout: 20000,
  });
  await sleep(1500);
}

async function enableAnalysisToggles(page) {
  await page.getByRole("tab", { name: "Análisis" }).click();
  await page.getByRole("tab", { name: "Estadística", exact: true }).click();
  for (const label of [
    "Mostrar normalidad",
    "Mostrar Evidence Strength Engine",
    "Mostrar Publication Readiness Analyzer",
    "Mostrar Methodological Summary Dashboard",
    "Mostrar Executive Publication Dashboard",
  ]) {
    const toggleLabel = page
      .locator('div[aria-hidden="false"] label')
      .filter({ hasText: label })
      .first();
    if ((await toggleLabel.count()) === 0) continue;
    const checkbox = toggleLabel.locator('input[type="checkbox"]');
    if (await checkbox.isDisabled()) continue;
    if (!(await checkbox.isChecked())) await toggleLabel.click();
  }
  await sleep(2500);
}

async function configureGraphContext(page) {
  await page.getByRole("tab", { name: "Datos" }).click();
  await page.getByPlaceholder("Ej: Parábola cuadrática").fill(GRAPH_TITLE);
  await page.getByPlaceholder("Ej: x^2 + 3*x + 1").fill(GRAPH_EXPRESSION);
  await page.getByRole("button", { name: "Graficar" }).click();
  await sleep(2000);
}

async function startGuidedWorkflow(page) {
  await page.getByRole("tab", { name: "Datos" }).click();
  await page.getByRole("button", { name: /Comparar grupos/i }).click();
  await page.getByRole("button", { name: "Cancelar workflow" }).first().waitFor({
    state: "visible",
    timeout: 10000,
  });
}

async function captureSci58SlotA(page) {
  await page.getByRole("tab", { name: "Datos" }).click();
  const sectionToggle = page.getByRole("button", { name: /Multi-Dataset Comparison/i });
  await sectionToggle.click();
  await page.getByRole("button", { name: "Capturar Slot A" }).click();
  await sleep(1000);
}

async function closeEditorState(page) {
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await sleep(1000);
}

function extractScores(text) {
  const first = (patterns) => {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match?.[1]) return match[1];
    }
    return null;
  };
  return {
    evidence: first([
      /Evidence Score[\s\S]{0,60}?(\d+\.\d)/,
      /🧪 Evidence[\s\S]{0,60}?(\d+\.\d)/,
    ]),
    readiness: first([
      /Readiness Score[\s\S]{0,60}?(\d+\.\d)/,
      /Readiness[\s\S]{0,40}?(\d+\.\d)/,
    ]),
    overall: first([/Overall Health Score[\s\S]{0,60}?(\d+\.\d)/]),
  };
}

async function readBaselineScores(page) {
  await page.getByRole("tab", { name: "Resultados" }).click();
  const mathBtn = page.getByRole("button", { name: /Resultados matemáticos/i });
  if ((await mathBtn.count()) > 0) {
    const expanded = await mathBtn.first().getAttribute("aria-expanded");
    if (expanded === "false") await mathBtn.first().click();
  }
  await sleep(2500);
  return extractScores(await page.locator("body").innerText());
}

async function verifyDataset(page, fileName) {
  await page.getByRole("tab", { name: "Datos" }).click();
  await page.getByText(`Nombre: ${fileName}`).waitFor({ state: "visible", timeout: 10000 });
  const body = await page.locator("body").innerText();
  return !body.includes("No hay series experimentales importadas.");
}

async function verifySci58(page, fileName) {
  await page.getByRole("tab", { name: "Datos" }).click();
  const sectionToggle = page.getByRole("button", { name: /Multi-Dataset Comparison/i });
  await sectionToggle.click();
  const body = await page.locator("body").innerText();
  return (
    body.includes("Slot A") &&
    (body.includes("Perfil completo") || body.includes("Perfil parcial")) &&
    body.includes(fileName)
  );
}

async function verifySci59(page) {
  const cancelButtons = page.getByRole("button", { name: "Cancelar workflow" });
  if ((await cancelButtons.count()) === 0) return false;
  const body = await page.locator("body").innerText();
  return body.includes("Comparar grupos") && body.includes("Paso 1/");
}

async function verifyGraphContext(page) {
  await page.getByRole("tab", { name: "Datos" }).click();
  const title = await page.getByPlaceholder("Ej: Parábola cuadrática").inputValue();
  const expression = await page.getByPlaceholder("Ej: x^2 + 3*x + 1").inputValue();
  const inputsOk = title === GRAPH_TITLE && expression === GRAPH_EXPRESSION;

  if (!inputsOk) {
    return { pass: false, title, expression, reason: "inputs-mismatch" };
  }

  await page.getByRole("tab", { name: "Análisis" }).click();
  await sleep(1000);
  let hasChart = (await page.locator(".recharts-surface").count()) > 0;
  let body = await page.locator("body").innerText();
  let hasCurveLabel = body.includes(GRAPH_EXPRESSION);

  if (!hasChart && !hasCurveLabel) {
    await page.getByRole("tab", { name: "Datos" }).click();
    await page.getByRole("button", { name: "Graficar" }).click();
    await sleep(1500);
    await page.getByRole("tab", { name: "Análisis" }).click();
    await sleep(1000);
    hasChart = (await page.locator(".recharts-surface").count()) > 0;
    body = await page.locator("body").innerText();
    hasCurveLabel = body.includes(GRAPH_EXPRESSION);
  }

  return {
    pass: inputsOk,
    title,
    expression,
    hasChart,
    hasCurveLabel,
  };
}

async function verifyNewProjectClean(page) {
  await page.getByRole("button", { name: "Nuevo proyecto" }).click();
  const discard = page.getByRole("button", { name: "Descartar cambios y continuar" });
  if ((await discard.count()) > 0) {
    await discard.click();
  }
  await page.getByText(/Nuevo proyecto científico creado/i).waitFor({
    state: "visible",
    timeout: 10000,
  });
  await page.getByRole("tab", { name: "Datos" }).click();
  const body = await page.locator("body").innerText();
  const title = await page.getByPlaceholder("Ej: Parábola cuadrática").inputValue();
  const projectName = await page.getByLabel("Nombre del proyecto").inputValue();
  return (
    body.includes("No hay dataset experimental cargado") &&
    body.includes("No hay series experimentales importadas") &&
    title === "" &&
    projectName === "Proyecto sin título"
  );
}

async function runDatasetPersistenceCycle(page, {
  idPrefix,
  datasetPath,
  projectName,
  tmpDir,
}) {
  const fileName = path.basename(datasetPath);
  const sgprojPath = path.join(tmpDir, `${idPrefix}.sgproj`);

  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await importDataset(page, datasetPath);
  await enableAnalysisToggles(page);
  await configureGraphContext(page);
  await startGuidedWorkflow(page);
  await captureSci58SlotA(page);
  await saveProject(page, sgprojPath, projectName);

  if (!fs.existsSync(sgprojPath)) {
    record(`${idPrefix}.save`, false, { error: "Download file missing" });
    return;
  }

  const savedEnvelope = JSON.parse(fs.readFileSync(sgprojPath, "utf8"));
  const savedExpression =
    savedEnvelope.project?.graphContext?.curves?.[0]?.expression ?? "";
  record(`${idPrefix}.save`, true, {
    file: sgprojPath,
    graphContext: savedEnvelope.project?.graphContext ?? null,
  });
  record(`${idPrefix}.save.graphContext`, savedExpression === GRAPH_EXPRESSION, {
    savedExpression,
  });

  if (savedExpression !== GRAPH_EXPRESSION) {
    return;
  }

  await closeEditorState(page);
  await openProject(page, sgprojPath);

  const datasetOk = await verifyDataset(page, fileName);
  record(`${idPrefix}.reload.dataset`, datasetOk, { fileName });

  const sci58Ok = await verifySci58(page, fileName);
  record(`${idPrefix}.reload.sci58`, sci58Ok);

  const sci59Ok = await verifySci59(page);
  record(`${idPrefix}.reload.sci59`, sci59Ok);

  const graphResult = await verifyGraphContext(page);
  record(`${idPrefix}.reload.graph`, graphResult.pass, graphResult);

  const scores = await readBaselineScores(page);
  const baseline = BASELINE[idPrefix];
  const baselineOk =
    scores.evidence === baseline.evidence &&
    scores.readiness === baseline.readiness &&
    scores.overall === baseline.overall;
  record(`${idPrefix}.reload.baseline`, baselineOk, { scores, expected: baseline });
}

function runRwSuiteGate() {
  if (process.env.SKIP_EMBEDDED_RW === "1") {
    record("rw-suite", true, {
      skipped: true,
      reason: "SKIP_EMBEDDED_RW — executed by outer gate",
    });
    return true;
  }

  const result = spawnSync("node", ["scripts/validate-prod1-rw-suite.mjs"], {
    cwd: ROOT,
    encoding: "utf8",
    shell: true,
  });
  let parsed = null;
  try {
    parsed = JSON.parse(result.stdout.trim());
  } catch {
    parsed = { pass: false, parseError: true, stdout: result.stdout, stderr: result.stderr };
  }
  record("rw-suite", parsed?.pass === true, { results: parsed?.results ?? [] });
  return parsed?.pass === true;
}

async function main() {
  assertDatasetExists(DATASET5, "Dataset5");
  assertDatasetExists(DATASET6, "Dataset6");

  await ensureServer();

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "prod2a-f5-"));
  const browser = await chromium.launch({
    headless: true,
    channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge",
  });
  const page = await browser.newPage();

  try {
    await runDatasetPersistenceCycle(page, {
      idPrefix: "dataset5",
      datasetPath: DATASET5,
      projectName: "E2E Dataset5",
      tmpDir,
    });

    await runDatasetPersistenceCycle(page, {
      idPrefix: "dataset6",
      datasetPath: DATASET6,
      projectName: "E2E Dataset6",
      tmpDir,
    });

    const cleanOk = await verifyNewProjectClean(page);
    record("new-project.clean", cleanOk);
  } finally {
    await browser.close();
  }

  runRwSuiteGate();

  const pass = cases.every((item) => item.pass);
  const requirements = {
    "save-reload-dataset5":
      cases.find((item) => item.id === "dataset5.reload.dataset")?.pass === true,
    "save-reload-dataset6":
      cases.find((item) => item.id === "dataset6.reload.dataset")?.pass === true,
    "restore-sci58":
      cases.find((item) => item.id === "dataset5.reload.sci58")?.pass === true &&
      cases.find((item) => item.id === "dataset6.reload.sci58")?.pass === true,
    "restore-sci59":
      cases.find((item) => item.id === "dataset5.reload.sci59")?.pass === true &&
      cases.find((item) => item.id === "dataset6.reload.sci59")?.pass === true,
    "restore-graph-context":
      cases.find((item) => item.id === "dataset5.reload.graph")?.pass === true &&
      cases.find((item) => item.id === "dataset6.reload.graph")?.pass === true,
    "new-project-clean":
      cases.find((item) => item.id === "new-project.clean")?.pass === true,
    "baseline-dataset5-reload":
      cases.find((item) => item.id === "dataset5.reload.baseline")?.pass === true,
    "baseline-dataset6-reload":
      cases.find((item) => item.id === "dataset6.reload.baseline")?.pass === true,
    "rw-suite": cases.find((item) => item.id === "rw-suite")?.pass === true,
  };
  const summary = {
    phase: "F5",
    pass,
    requirements,
    cases,
    tmpDir,
  };

  console.log(JSON.stringify(summary, null, 2));
  process.exit(pass ? 0 : 1);
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        phase: "F5",
        pass: false,
        fatal: error.message,
        cases,
      },
      null,
      2
    )
  );
  process.exit(1);
});
