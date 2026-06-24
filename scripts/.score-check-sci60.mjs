import { chromium } from "playwright";

const BASE_URL = process.env.VALIDATION_BASE_URL ?? "http://localhost:3000";
const DATASET5 =
  process.env.DATASET5_PATH ??
  "C:\\Users\\Santiago Salseguero\\Desktop\\IA CIENTIFICA\\Dataset5.csv";
const DATASET6 =
  process.env.DATASET6_PATH ??
  "C:\\Users\\Santiago Salseguero\\Desktop\\IA CIENTIFICA\\Dataset6.csv";

async function openExperimentalDataView(page) {
  await page.getByRole("tab", { name: "Datos" }).click();
  const importButton = page.getByRole("button", {
    name: /Importar datos experimentales/i,
  });
  try {
    await importButton.waitFor({ state: "visible", timeout: 5000 });
    return;
  } catch {
    const experimentalTab = page.getByRole("tab", { name: /^Experimental$/i });
    await experimentalTab.waitFor({ state: "visible", timeout: 20000 });
    await experimentalTab.click();
    await importButton.waitFor({ state: "visible", timeout: 20000 });
  }
}

async function importDataset(page, datasetPath) {
  await openExperimentalDataView(page);
  const preserve = page.getByLabel(
    "Mantener configuración"
  );
  if (await preserve.isChecked()) {
    await preserve.uncheck();
  }
  await page
    .locator('input[type="file"][accept*=".csv"]')
    .setInputFiles(datasetPath);
  await page.waitForTimeout(1500);
}

async function expandStatisticsInspectorGroups(page) {
  for (const title of [
    "Multivariante",
    "Metodología y publicación",
    "Dashboards",
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

async function enableToggles(page) {
  await page.getByRole("tab", { name: "Análisis" }).click();
  await page.getByRole("tab", { name: "Estadística", exact: true }).click();
  await expandStatisticsInspectorGroups(page);
  for (const label of [
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
    publicationStatus: first([
      /Publication Status[\s\S]{0,60}?(Near Ready|Requires Review|Publication Ready|Not Ready)/,
    ]),
  };
}

async function scoresForDataset(page, datasetPath) {
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await importDataset(page, datasetPath);
  await enableToggles(page);
  await page.getByRole("tab", { name: "Resultados" }).click();
  const mathBtn = page.getByRole("button", { name: /Resultados matemáticos/i });
  if ((await mathBtn.count()) > 0) {
    const expanded = await mathBtn.first().getAttribute("aria-expanded");
    if (expanded === "false") await mathBtn.first().click();
  }
  await page.waitForTimeout(2500);
  return extractScores(await page.locator("body").innerText());
}

const browser = await chromium.launch({
  headless: true,
  channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge",
});
const page = await browser.newPage();
await page.addInitScript(() => {
  localStorage.setItem("scientific-graph-ai.lab-usage-profile", "standard");
});
const dataset5 = await scoresForDataset(page, DATASET5);
const dataset6 = await scoresForDataset(page, DATASET6);
await browser.close();

console.log(
  JSON.stringify(
    {
      dataset5,
      dataset6,
      baselineMatch: {
        dataset5:
          dataset5.evidence === "82.7" &&
          dataset5.readiness === "77.0" &&
          dataset5.overall === "77.0",
        dataset6:
          dataset6.evidence === "73.3" &&
          dataset6.readiness === "67.5" &&
          dataset6.overall === "67.5",
      },
    },
    null,
    2
  )
);
