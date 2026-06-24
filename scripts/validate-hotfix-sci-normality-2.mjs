import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE_URL = process.env.VALIDATION_BASE_URL ?? "http://localhost:3000";
const DATASET5 = process.env.DATASET5_PATH ??
  "C:\\Users\\Santiago Salseguero\\Desktop\\IA CIENTIFICA\\Dataset5.csv";
const DATASET6 = process.env.DATASET6_PATH ??
  "C:\\Users\\Santiago Salseguero\\Desktop\\IA CIENTIFICA\\Dataset6.csv";

const STATISTICS_TOGGLES = [
  "Mostrar correlación",
  "Mostrar normalidad",
  "Mostrar Methodological Summary Dashboard",
  "Mostrar Q-Q Plot",
  "Mostrar Violin Plot",
  "Mostrar Kernel Density Plot",
  "Mostrar PCA",
  "Mostrar Dashboard Multivariante",
  "Mostrar Cluster Heatmap",
  "Mostrar Clustered Distance Heatmap",
  "Mostrar Bootstrap Explorer",
  "Mostrar Sensitivity Explorer",
  "Mostrar Consistency Engine",
  "Mostrar Report Quality Engine",
  "Mostrar Reproducibility Explorer",
  "Mostrar Evidence Strength Engine",
  "Mostrar Assumption Tracker",
  "Mostrar Publication Readiness Analyzer",
  "Mostrar Executive Publication Dashboard",
];

const INFERENCE_TOGGLES = [
  "Mostrar clustering jerárquico",
  "Mostrar t-test",
  "Mostrar ANOVA",
  "Mostrar pruebas no paramétricas",
  "Mostrar Effect Size & Power",
];

const ADVISOR_TOGGLES = [
  "Mostrar reporte científico",
  "Mostrar interpretación científica",
  "Mostrar asistente científico",
];

const LEGACY_MARKERS = [
  "Consenso de normalidad",
  "Coherencia de normalidad",
  "Coherencia integrada",
];

async function selectInspectorCategory(page, label) {
  await page.getByRole("tab", { name: label, exact: true }).click();
}

async function enableToggle(page, label) {
  const toggleLabel = page
    .locator('div[aria-hidden="false"] label')
    .filter({ hasText: label })
    .first();
  if ((await toggleLabel.count()) === 0 || !(await toggleLabel.isVisible())) {
    return { enabled: false, label, reason: "not-visible" };
  }
  const checkbox = toggleLabel.locator('input[type="checkbox"]');
  if (await checkbox.isDisabled()) {
    return { enabled: false, label, reason: "disabled" };
  }
  if (!(await checkbox.isChecked())) {
    await toggleLabel.click();
  }
  await page.waitForTimeout(150);
  return { enabled: true, label };
}

async function importDataset(page, datasetPath) {
  if (!fs.existsSync(datasetPath)) {
    throw new Error(`Dataset not found: ${datasetPath}`);
  }

  await page.getByRole("tab", { name: "Datos" }).click();
  const preserve = page.getByLabel("Mantener configuración");
  if (await preserve.isChecked()) {
    await preserve.uncheck();
  }
  await page
    .locator('input[type="file"][accept*=".csv"]')
    .setInputFiles(datasetPath);
  await page.getByText(`Nombre: ${path.basename(datasetPath)}`).waitFor({
    state: "visible",
    timeout: 15000,
  });
  await page.waitForTimeout(1500);
}

async function expandStatisticsInspectorGroups(page) {
  for (const title of [
    "Multivariante",
    "Metodología y publicación",
    "Dashboards",
    "Inferencia",
  ]) {
    const buttons = page.getByRole("button", { name: new RegExp(title, "i") });
    const count = await buttons.count();
    for (let index = 0; index < count; index += 1) {
      const button = buttons.nth(index);
      if ((await button.getAttribute("aria-expanded")) === "false") {
        await button.click();
      }
    }
  }
}

async function enableModules(page) {
  await page.getByRole("tab", { name: "Análisis" }).click();
  await selectInspectorCategory(page, "Estadística");
  await expandStatisticsInspectorGroups(page);
  const disabledToggles = [];
  for (const toggle of STATISTICS_TOGGLES) {
    const state = await enableToggle(page, toggle);
    if (state.enabled === false) disabledToggles.push(toggle);
  }
  await selectInspectorCategory(page, "Inferencia");
  for (const toggle of INFERENCE_TOGGLES) {
    const state = await enableToggle(page, toggle);
    if (state.enabled === false) disabledToggles.push(toggle);
  }
  await selectInspectorCategory(page, "Advisor");
  for (const toggle of ADVISOR_TOGGLES) {
    const state = await enableToggle(page, toggle);
    if (state.enabled === false) disabledToggles.push(toggle);
  }
  return disabledToggles;
}

async function expandNotebook(page, title) {
  const button = page.getByRole("button", { name: new RegExp(title, "i") });
  if ((await button.count()) === 0) {
    return false;
  }
  const target = button.first();
  const expanded = await target.getAttribute("aria-expanded");
  if (expanded === "false") {
    await target.click();
  }
  return true;
}

async function applyAllGuidedWorkflowSteps(page, maxSteps = 15) {
  for (let index = 0; index < maxSteps; index += 1) {
    const applyButton = page.getByRole("button", { name: "Aplicar paso" });
    if ((await applyButton.count()) === 0) {
      break;
    }
    const target = applyButton.first();
    if (!(await target.isVisible())) {
      break;
    }
    await target.click();
    await page.waitForTimeout(250);
  }
  await page.waitForTimeout(500);
}

async function validateSci59Workflow(page, datasetPath, datasetName, templateLabel) {
  const result = {
    dataset: datasetName,
    template: templateLabel,
    pass: true,
    checks: {},
    issues: [],
  };

  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await importDataset(page, datasetPath);

  await page.getByRole("tab", { name: "Datos" }).click();
  result.checks.sci59EntryCard = await page
    .getByText("Guided Scientific Workflow")
    .first()
    .isVisible()
    .catch(() => false);
  if (!result.checks.sci59EntryCard) {
    result.issues.push("SCI-59: tarjeta de entrada no visible en Datos");
  }

  const templateButton = page.getByRole("button", {
    name: new RegExp(templateLabel, "i"),
  });
  if ((await templateButton.count()) === 0) {
    result.issues.push(`SCI-59: botón de template "${templateLabel}" no encontrado`);
    result.pass = false;
    return result;
  }
  await templateButton.first().click();
  await page.waitForTimeout(300);

  result.checks.sci59WorkflowStarted = await page
    .getByRole("button", { name: "Aplicar paso" })
    .first()
    .isVisible()
    .catch(() => false);
  if (!result.checks.sci59WorkflowStarted) {
    result.issues.push("SCI-59: panel de workflow no iniciado");
  }

  await applyAllGuidedWorkflowSteps(page);

  result.checks.sci59WorkflowCompleted =
    (await page.getByText(/Workflow .* completado/i).count()) > 0;
  if (!result.checks.sci59WorkflowCompleted) {
    result.issues.push("SCI-59: workflow no alcanzó estado completado");
  }

  if (/publicaci/i.test(templateLabel)) {
    await page.getByRole("tab", { name: "Resultados" }).click();
    await page.waitForTimeout(500);
    result.checks.sci59Sci56ViaWorkflow = await page
      .getByText("📋 Methodological Summary Dashboard")
      .first()
      .isVisible()
      .catch(() => false);
    result.checks.sci59Sci57ViaWorkflow = await page
      .getByText("📏 Effect Size & Power")
      .first()
      .isVisible()
      .catch(() => false);
    result.checks.sci59Sci60ViaWorkflow = await page
      .getByText("📰 Executive Publication Dashboard")
      .first()
      .isVisible()
      .catch(() => false);
    if (!result.checks.sci59Sci56ViaWorkflow) {
      result.issues.push("SCI-59/T3: SCI-56 no visible tras workflow");
    }
    if (!result.checks.sci59Sci57ViaWorkflow) {
      result.issues.push("SCI-59/T3: SCI-57 no visible tras workflow");
    }
    if (!result.checks.sci59Sci60ViaWorkflow) {
      result.issues.push("SCI-59/T3: SCI-60 no visible tras workflow");
    }
  }

  if (/estructura/i.test(templateLabel)) {
    await page.getByRole("tab", { name: "Resultados" }).click();
    await page.waitForTimeout(500);
    result.checks.sci59Sci40ViaWorkflow = await page
      .getByText("📊 Multivariate Summary Dashboard")
      .first()
      .isVisible()
      .catch(() => false);
    if (!result.checks.sci59Sci40ViaWorkflow) {
      result.issues.push("SCI-59/T2: SCI-40 no visible tras workflow");
    }
  }

  result.pass = result.issues.length === 0;
  return result;
}

async function expandNotebookIfNeeded(page, title) {
  const button = page.getByRole("button", { name: new RegExp(title, "i") });
  if ((await button.count()) === 0) {
    return false;
  }
  const target = button.first();
  const expanded = await target.getAttribute("aria-expanded");
  if (expanded === "false") {
    await target.click();
  }
  return true;
}

async function captureComparisonSlot(page, slotLabel) {
  await page.getByRole("tab", { name: "Datos" }).click();
  await expandNotebookIfNeeded(page, "Multi-Dataset Comparison");
  const captureButton = page.getByRole("button", {
    name: new RegExp(`(Capturar|Actualizar) Slot ${slotLabel}`, "i"),
  });
  if ((await captureButton.count()) === 0) {
    throw new Error(`SCI-58: botón capturar Slot ${slotLabel} no encontrado`);
  }
  await captureButton.first().click();
  await page.waitForTimeout(400);
}

async function validateSci58Comparison(page) {
  const result = {
    pass: true,
    checks: {},
    issues: [],
  };

  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await importDataset(page, DATASET5);
  await enableModules(page);
  await captureComparisonSlot(page, "A");

  await importDataset(page, DATASET6);
  await enableModules(page);
  await captureComparisonSlot(page, "B");

  await page.getByRole("tab", { name: "Análisis" }).click();
  await selectInspectorCategory(page, "Estadística");
  const toggleState = await enableToggle(
    page,
    "Mostrar Multi-Dataset Comparison Dashboard"
  );
  if (!toggleState.enabled) {
    result.issues.push("SCI-58: toggle comparación no disponible");
  }

  await page.getByRole("tab", { name: "Resultados" }).click();
  await page.waitForTimeout(800);

  result.checks.sci58ComparisonPanel = await page
    .getByText("📊 Multi-Dataset Comparison Dashboard")
    .first()
    .isVisible()
    .catch(() => false);
  if (!result.checks.sci58ComparisonPanel) {
    result.issues.push("SCI-58: panel comparativo no visible");
  }

  const bodyText = await page.locator("body").innerText();
  result.checks.sci58DeltaReadiness =
    bodyText.includes("-9.5") || bodyText.includes("−9.5");
  if (!result.checks.sci58DeltaReadiness) {
    result.issues.push("SCI-58: delta Readiness -9.5 no visible");
  }

  result.checks.sci58ReadinessSlotA = /77\.0/.test(bodyText);
  result.checks.sci58ReadinessSlotB = /67\.5/.test(bodyText);
  result.checks.sci58CrossDiagnosis =
    bodyText.includes("Diagnóstico cruzado") ||
    bodyText.includes("Publication Status diverge");

  if (!result.checks.sci58ReadinessSlotA || !result.checks.sci58ReadinessSlotB) {
    result.issues.push("SCI-58: KPIs Readiness esperados no visibles");
  }

  result.pass = result.issues.length === 0;
  return result;
}

async function validateDataset(page, datasetPath, datasetName) {
  const result = {
    dataset: datasetName,
    pass: true,
    checks: {},
    issues: [],
    reactWarnings: [],
  };

  const consoleMessages = [];
  page.on("console", (msg) => {
    const text = msg.text();
    if (
      text.includes("Encountered two children with the same key") ||
      text.includes("finding-Se observan bloques compactos")
    ) {
      result.reactWarnings.push(text);
    }
    if (msg.type() === "error" && !text.includes("width(0) and height(0)")) {
      consoleMessages.push(text);
    }
  });

  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await importDataset(page, datasetPath);
  const disabledToggles = await enableModules(page);
  const criticalToggles = [
    "Mostrar normalidad",
    "Mostrar Q-Q Plot",
    "Mostrar Bootstrap Explorer",
    "Mostrar reporte científico",
    "Mostrar interpretación científica",
  ];
  const disabledCritical = disabledToggles.filter((toggle) =>
    criticalToggles.includes(toggle)
  );
  if (disabledCritical.length > 0) {
    result.issues.push(
      `Toggles críticos no activados: ${disabledCritical.join(", ")}`
    );
  }

  await page.getByRole("tab", { name: "Resultados" }).click();
  await expandNotebook(page, "Resultados matemáticos");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2500);

  result.checks.integratedPanel = await page
    .getByText("🔬 Evaluación integrada de normalidad")
    .isVisible();
  result.checks.methodologicalDashboard = await page
    .getByText("📋 Methodological Summary Dashboard")
    .isVisible()
    .catch(() => false);
  if (!result.checks.methodologicalDashboard) {
    result.issues.push("Panel Methodological Summary Dashboard no visible");
  }
  if (!result.checks.integratedPanel) {
    result.issues.push("Panel integrado no visible en Resultados");
  }

  const bodyText = await page.locator("body").innerText();
  result.checks.noLegacyMarkers = !LEGACY_MARKERS.some((marker) =>
    bodyText.includes(marker)
  );
  if (!result.checks.noLegacyMarkers) {
    result.issues.push("Texto legacy Consenso/Coherencia detectado");
  }

  const engineTexts = [
    "Bootstrap Explorer",
    "Report Quality Engine",
    "Reproducibility Explorer",
    "Assumption Tracker",
    "Publication Readiness Analyzer",
    "Methodological Summary Dashboard",
  ];
  for (const engineText of engineTexts) {
    const locator = page.getByText(engineText, { exact: false }).first();
    if (await locator.count()) {
      await locator.scrollIntoViewIfNeeded().catch(() => {});
    }
  }
  await page.waitForTimeout(500);

  result.checks.bootstrapEngine = await page
    .getByText("Bootstrap Explorer", { exact: false })
    .first()
    .isVisible();
  result.checks.qualityEngine = await page
    .getByText("Report Quality Engine", { exact: false })
    .first()
    .isVisible();
  result.checks.reproducibilityEngine = await page
    .getByText("Reproducibility Explorer", { exact: false })
    .first()
    .isVisible();
  result.checks.assumptionTracker = await page
    .getByText("Assumption Tracker", { exact: false })
    .first()
    .isVisible();
  result.checks.publicationReadiness = await page
    .getByText("Publication Readiness Analyzer", { exact: false })
    .first()
    .isVisible();

  result.checks.sci56DashboardPanel = await page
    .getByText("📋 Methodological Summary Dashboard")
    .first()
    .isVisible()
    .catch(() => false);
  result.checks.sci56OverallHealthScore = await page
    .getByText("Overall Health Score", { exact: false })
    .first()
    .isVisible()
    .catch(() => false);
  const sci56Cards = await Promise.all(
    ["Consistency", "Quality", "Reproducibility", "Evidence", "Assumptions", "Publication"].map(
      (cardTitle) =>
        page
          .getByText(cardTitle, { exact: true })
          .first()
          .isVisible()
          .catch(() => false)
    )
  );
  result.checks.sci56EngineCards = sci56Cards.filter(Boolean).length;
  if (!result.checks.sci56DashboardPanel) {
    result.issues.push("SCI-56: panel del dashboard no visible");
  }
  if (!result.checks.sci56OverallHealthScore) {
    result.issues.push("SCI-56: Overall Health Score no visible");
  }
  if (result.checks.sci56EngineCards < 4) {
    result.issues.push(
      `SCI-56: solo ${result.checks.sci56EngineCards}/6 tarjetas de motores visibles`
    );
  }

  for (const [key, ok] of Object.entries({
    bootstrapEngine: result.checks.bootstrapEngine,
    qualityEngine: result.checks.qualityEngine,
    reproducibilityEngine: result.checks.reproducibilityEngine,
    assumptionTracker: result.checks.assumptionTracker,
    publicationReadiness: result.checks.publicationReadiness,
  })) {
    if (!ok) result.issues.push(`Motor no visible: ${key}`);
  }

  const engineEmptyStates = [
    "No hay datos suficientes para generar Bootstrap Explorer.",
    "No hay datos suficientes para generar Report Quality Engine.",
    "No hay datos suficientes para generar Reproducibility Explorer.",
    "No hay datos suficientes para generar Assumption Tracker.",
    "No hay datos suficientes para generar Publication Readiness",
    "No hay datos suficientes para generar Methodological",
  ];
  result.checks.enginesHaveOutput = !engineEmptyStates.some((text) =>
    bodyText.includes(text)
  );
  if (!result.checks.enginesHaveOutput) {
    result.issues.push("Uno o más motores metodológicos sin salida");
  }

  // SCI-57 — Effect Size & Power Engine
  result.checks.sci57Panel = await page
    .getByText("📏 Effect Size & Power")
    .first()
    .isVisible()
    .catch(() => false);
  if (!result.checks.sci57Panel) {
    result.issues.push("SCI-57: panel Effect Size & Power no visible");
  }
  result.checks.sci57DominantEffect = bodyText.includes("Efecto dominante");
  result.checks.sci57HasMetrics =
    bodyText.includes("Cohen's d") || bodyText.includes("Epsilon²");
  result.checks.sci57ProspectivePower = bodyText.includes(
    "Potencia prospectiva"
  );
  if (!result.checks.sci57DominantEffect || !result.checks.sci57HasMetrics) {
    result.issues.push("SCI-57: contenido del panel incompleto");
  }

  // SCI-60 — Executive Publication Dashboard
  result.checks.sci60Panel = await page
    .getByText("📰 Executive Publication Dashboard")
    .first()
    .isVisible()
    .catch(() => false);
  if (!result.checks.sci60Panel) {
    result.issues.push("SCI-60: panel Executive Publication Dashboard no visible");
  }
  result.checks.sci60PublicationStatusBanner =
    bodyText.includes("Publication Status") &&
    (bodyText.includes("Near Ready") ||
      bodyText.includes("Requires Review") ||
      bodyText.includes("Publication Ready"));
  if (!result.checks.sci60PublicationStatusBanner) {
    result.issues.push("SCI-60: banner Publication Status no visible");
  }
  result.checks.sci60CrossDomainDiagnosis = bodyText.includes(
    "Diagnóstico editorial"
  );
  if (!result.checks.sci60CrossDomainDiagnosis) {
    result.issues.push("SCI-60: diagnóstico editorial no visible");
  }

  result.checks.sci40Panel = await page
    .getByText("📊 Multivariate Summary Dashboard")
    .first()
    .isVisible()
    .catch(() => false);
  if (!result.checks.sci40Panel) {
    result.issues.push("SCI-40: panel Multivariate Summary Dashboard no visible");
  }

  result.checks.sci19PanelVisible = await page
    .getByText("Interpretación científica", { exact: false })
    .first()
    .isVisible()
    .catch(() => false);
  if (result.checks.sci19PanelVisible) {
    await expandNotebook(page, "Interpretación científica");
  }

  const hallazgosBlock = bodyText.split("Hallazgos principales")[1]?.split(
    "Recomendaciones"
  )[0];
  const compactBlockCountInSci19 =
    hallazgosBlock?.match(
      /Se observan bloques compactos de variables similares\./g
    )?.length ?? 0;
  result.checks.sci19NoDuplicateCompactBlocks = compactBlockCountInSci19 <= 1;
  if (!result.checks.sci19NoDuplicateCompactBlocks) {
    result.issues.push(
      `SCI-19: hallazgo duplicado de bloques compactos (${compactBlockCountInSci19})`
    );
  }
  const hallazgoLines =
    hallazgosBlock
      ?.split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 20) ?? [];
  const uniqueFindings = new Set(hallazgoLines);
  result.checks.sci19UniqueFindings =
    hallazgoLines.length === 0 ||
    uniqueFindings.size === hallazgoLines.length;
  if (!result.checks.sci19UniqueFindings) {
    result.issues.push("SCI-19: hallazgos duplicados en texto visible");
  }

  result.checks.sci20Visible = await page
    .getByText("Asistente científico", { exact: false })
    .first()
    .isVisible()
    .catch(() => false);
  if (result.checks.sci20Visible) {
    await expandNotebook(page, "Asistente científico");
  }

  await page.getByRole("tab", { name: "Reportes" }).click();
  await expandNotebook(page, "Reporte científico");
  await expandNotebook(page, "Evaluación integrada de normalidad");
  await page.waitForTimeout(1000);
  const reportsText = await page.locator("body").innerText();
  result.checks.sci17IntegratedSection = reportsText.includes(
    "Evaluación integrada de normalidad"
  );
  result.checks.sci56Sci17Section = reportsText.includes(
    "Methodological Summary Dashboard"
  );
  if (!result.checks.sci56Sci17Section) {
    result.issues.push("SCI-56: sección no encontrada en SCI-17");
  }
  if (!result.checks.sci17IntegratedSection) {
    result.issues.push("SCI-17: sección integrada no encontrada en reporte");
  }
  result.checks.sci57Sci17Section = reportsText.includes(
    "Effect Size & Power"
  );
  if (!result.checks.sci57Sci17Section) {
    result.issues.push("SCI-57: sección no encontrada en SCI-17");
  }
  result.checks.sci60Sci17Section = reportsText.includes(
    "Executive Publication Dashboard"
  );
  if (!result.checks.sci60Sci17Section) {
    result.issues.push("SCI-60: sección no encontrada en SCI-17");
  }

  const reportSections = await page
    .locator("button")
    .filter({ hasText: /normalidad/i })
    .allTextContents();
  const normalitySectionCount = reportSections.filter((title) =>
    /Evaluación integrada de normalidad|Consenso de normalidad|Coherencia de normalidad/i.test(
      title
    )
  ).length;
  result.checks.sci17SingleNormalitySection = normalitySectionCount <= 1;
  if (!result.checks.sci17SingleNormalitySection) {
    result.issues.push("SCI-17: múltiples secciones de normalidad");
  }

  if (datasetName === "Dataset6") {
    const mergedText = `${bodyText}\n${reportsText}`;
    result.checks.dataset6ContradictoryCase =
      mergedText.includes("Señales contradictorias") ||
      mergedText.includes("señales contradictorias");
  }

  result.checks.noReactDuplicateKeys = result.reactWarnings.length === 0;
  if (!result.checks.noReactDuplicateKeys) {
    result.issues.push(...result.reactWarnings);
  }

  result.pass = result.issues.length === 0;
  return result;
}

async function validatePdf(page, datasetPath) {
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await importDataset(page, datasetPath);
  await enableModules(page);
  await page.getByRole("tab", { name: "Reportes" }).click();
  await expandNotebook(page, "Exportaciones");

  const downloadPromise = page.waitForEvent("download", { timeout: 30000 });
  await page.getByRole("button", { name: /Exportar PDF/i }).click();
  const download = await downloadPromise;
  const downloadPath = path.join(
    process.cwd(),
    "scripts",
    `.validation-${path.basename(datasetPath, ".csv")}.pdf`
  );
  await download.saveAs(downloadPath);
  const stats = fs.statSync(downloadPath);
  const buffer = fs.readFileSync(downloadPath);
  const pdfText = buffer.toString("latin1");
  const hasIntegrated = pdfText.includes("Evaluación integrada de normalidad");
  const hasLegacy =
    pdfText.includes("Consenso de normalidad") ||
    pdfText.includes("Coherencia de normalidad");
  const hasSci56 = pdfText.includes("Methodological Summary Dashboard");
  const hasSci57 = pdfText.includes("Effect Size & Power");
  const hasSci60 = pdfText.includes("Executive Publication Dashboard");
  return {
    pass:
      stats.size > 5000 &&
      hasIntegrated &&
      !hasLegacy &&
      hasSci56 &&
      hasSci57 &&
      hasSci60,
    size: stats.size,
    hasIntegrated,
    hasLegacy,
    hasSci56,
    hasSci57,
    hasSci60,
    path: downloadPath,
  };
}

async function main() {
  for (const datasetPath of [DATASET5, DATASET6]) {
    if (!fs.existsSync(datasetPath)) {
      console.error(`Missing dataset: ${datasetPath}`);
      process.exit(1);
    }
  }

  const browser = await chromium.launch({
    headless: true,
    channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge",
  });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  const dataset5 = await validateDataset(page, DATASET5, "Dataset5");
  const dataset6 = await validateDataset(page, DATASET6, "Dataset6");
  const pdf5 = await validatePdf(page, DATASET5);
  const pdf6 = await validatePdf(page, DATASET6);

  const sci59T3Dataset5 = await validateSci59Workflow(
    page,
    DATASET5,
    "Dataset5",
    "Evaluar publicación"
  );
  const sci59T3Dataset6 = await validateSci59Workflow(
    page,
    DATASET6,
    "Dataset6",
    "Evaluar publicación"
  );
  const sci59T2Dataset5 = await validateSci59Workflow(
    page,
    DATASET5,
    "Dataset5",
    "Explorar estructura"
  );
  const sci59T1Dataset5 = await validateSci59Workflow(
    page,
    DATASET5,
    "Dataset5",
    "Comparar grupos"
  );
  const sci58Comparison = await validateSci58Comparison(page);

  await browser.close();

  const summary = {
    dataset5,
    dataset6,
    pdf: {
      pass: pdf5.pass && pdf6.pass,
      dataset5: pdf5,
      dataset6: pdf6,
    },
    sci17: {
      pass:
        dataset5.checks.sci17IntegratedSection &&
        dataset6.checks.sci17IntegratedSection &&
        dataset5.checks.sci17SingleNormalitySection &&
        dataset6.checks.sci17SingleNormalitySection,
    },
    sci19: {
      pass:
        dataset5.checks.sci19UniqueFindings &&
        dataset6.checks.sci19UniqueFindings &&
        dataset5.checks.sci19NoDuplicateCompactBlocks &&
        dataset6.checks.sci19NoDuplicateCompactBlocks &&
        dataset5.checks.noReactDuplicateKeys &&
        dataset6.checks.noReactDuplicateKeys,
    },
    sci20: {
      pass: dataset5.checks.sci20Visible && dataset6.checks.sci20Visible,
    },
    methodologicalEngines: {
      pass:
        dataset5.checks.enginesHaveOutput && dataset6.checks.enginesHaveOutput,
    },
    noRegressions: {
      pass:
        dataset5.checks.noLegacyMarkers &&
        dataset6.checks.noLegacyMarkers &&
        dataset5.checks.integratedPanel &&
        dataset6.checks.integratedPanel,
    },
    sci56: {
      pass:
        dataset5.checks.sci56DashboardPanel &&
        dataset6.checks.sci56DashboardPanel &&
        dataset5.checks.sci56OverallHealthScore &&
        dataset6.checks.sci56OverallHealthScore &&
        dataset5.checks.sci56Sci17Section &&
        dataset6.checks.sci56Sci17Section &&
        pdf5.hasSci56 &&
        pdf6.hasSci56,
      engineCardsDataset5: dataset5.checks.sci56EngineCards,
      engineCardsDataset6: dataset6.checks.sci56EngineCards,
    },
    sci57: {
      pass:
        dataset5.checks.sci57Panel &&
        dataset6.checks.sci57Panel &&
        dataset5.checks.sci57DominantEffect &&
        dataset6.checks.sci57DominantEffect &&
        dataset5.checks.sci57HasMetrics &&
        dataset6.checks.sci57HasMetrics &&
        dataset5.checks.sci57Sci17Section &&
        dataset6.checks.sci57Sci17Section &&
        pdf5.hasSci57 &&
        pdf6.hasSci57,
      prospectivePowerDataset5: dataset5.checks.sci57ProspectivePower,
      prospectivePowerDataset6: dataset6.checks.sci57ProspectivePower,
    },
    sci60: {
      pass:
        dataset5.checks.sci60Panel &&
        dataset6.checks.sci60Panel &&
        dataset5.checks.sci60PublicationStatusBanner &&
        dataset6.checks.sci60PublicationStatusBanner &&
        dataset5.checks.sci60CrossDomainDiagnosis &&
        dataset6.checks.sci60CrossDomainDiagnosis &&
        dataset5.checks.sci60Sci17Section &&
        dataset6.checks.sci60Sci17Section &&
        pdf5.hasSci60 &&
        pdf6.hasSci60,
    },
    sci40: {
      pass: dataset5.checks.sci40Panel && dataset6.checks.sci40Panel,
    },
    sci59: {
      pass:
        sci59T1Dataset5.pass &&
        sci59T2Dataset5.pass &&
        sci59T3Dataset5.pass &&
        sci59T3Dataset6.pass,
      t1Dataset5: sci59T1Dataset5,
      t2Dataset5: sci59T2Dataset5,
      t3Dataset5: sci59T3Dataset5,
      t3Dataset6: sci59T3Dataset6,
    },
    sci58: {
      pass: sci58Comparison.pass,
      comparison: sci58Comparison,
    },
  };

  const allPass =
    summary.sci17.pass &&
    summary.sci19.pass &&
    summary.sci20.pass &&
    summary.methodologicalEngines.pass &&
    summary.noRegressions.pass &&
    summary.sci56.pass &&
    summary.sci57.pass &&
    summary.sci60.pass &&
    summary.sci40.pass &&
    summary.sci59.pass &&
    summary.sci58.pass &&
    summary.pdf.pass;

  console.log(JSON.stringify(summary, null, 2));

  if (!allPass) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
