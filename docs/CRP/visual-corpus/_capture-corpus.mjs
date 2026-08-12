/**
 * CRP-5.2 temporary capture helper — docs-only; does not modify src/**.
 * Run: node docs/CRP/visual-corpus/_capture-corpus.mjs
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../..");
const BASE = path.join(ROOT, "docs/CRP/visual-corpus");
const URL = process.env.CRP_CAPTURE_URL || "http://localhost:3000";
const TS = new Date().toISOString();

const shots = [
  { id: "VC-01", file: "cold-start/VC-01-cold-start-inicio.png", tab: "Inicio", w: 1440, h: 900 },
  { id: "VC-02", file: "cold-start/VC-02-smart-start-detail.png", tab: "Inicio", w: 1440, h: 900 },
  { id: "VC-03", file: "navigation/VC-03-toolbar-tabs.png", tab: "Inicio", w: 1440, h: 900, clip: { x: 0, y: 0, width: 1440, height: 160 } },
  { id: "VC-04", file: "navigation/VC-04-sidebar-expanded.png", tab: "Inicio", w: 1440, h: 900 },
  { id: "VC-05", file: "scaffold/VC-05-explorer-inspector-console.png", tab: "Inicio", w: 1440, h: 1100 },
  { id: "VC-06", file: "seeds/VC-06-seed-windows.png", tab: "Inicio", w: 1440, h: 900 },
  { id: "VC-07", file: "journey/VC-07-datos-empty.png", tab: "Datos", w: 1440, h: 900 },
  { id: "VC-08", file: "journey/VC-08-analisis.png", tab: "Análisis", w: 1440, h: 900 },
  { id: "VC-09", file: "journey/VC-09-resultados-empty.png", tab: "Resultados", w: 1440, h: 900 },
  { id: "VC-10", file: "journey/VC-10-reportes-pack.png", tab: "Reportes", w: 1440, h: 900 },
  { id: "VC-11", file: "chrome/VC-11-statusbar-region.png", tab: "Inicio", w: 1440, h: 1100 },
  { id: "VC-12a", file: "responsive/VC-12a-width-1440.png", tab: "Inicio", w: 1440, h: 900 },
  { id: "VC-12b", file: "responsive/VC-12b-width-1280.png", tab: "Inicio", w: 1280, h: 800 },
  { id: "VC-13", file: "chrome/VC-13-dual-header.png", tab: "Inicio", w: 1440, h: 900, clip: { x: 220, y: 0, width: 1000, height: 220 } },
  { id: "VC-14", file: "seeds/VC-14-floating-window-chrome.png", tab: "Inicio", w: 1440, h: 900 },
  { id: "VC-15", file: "false-affordances/VC-15-false-affordances.png", tab: "Inicio", w: 1440, h: 900 },
  { id: "VC-16", file: "responsive/VC-16-sidebar-collapsed.png", tab: "Inicio", w: 1440, h: 900, collapseSidebar: true },
  { id: "VC-17", file: "navigation/VC-17-sidebar-menu-groups.png", tab: "Datos", w: 1440, h: 900 },
  { id: "VC-18", file: "scaffold/VC-18-planningmode-panels.png", tab: "Datos", w: 1440, h: 1100 },
];

async function dismissDevNoise(page) {
  await page.evaluate(() => {
    document.querySelectorAll("nextjs-portal").forEach((el) => el.remove());
    document.querySelectorAll("[data-nextjs-toast], [data-next-badge-root]").forEach((el) => el.remove());
  }).catch(() => {});
}

async function selectTab(page, name) {
  const tab = page.getByRole("tab", { name, exact: true }).first();
  await tab.click({ timeout: 15000 });
  await page.waitForTimeout(600);
}

async function main() {
  for (const dir of [
    "cold-start", "journey", "scaffold", "seeds", "navigation",
    "chrome", "false-affordances", "responsive", "lovable-package",
  ]) {
    fs.mkdirSync(path.join(BASE, dir), { recursive: true });
  }

  // Prefer installed Edge/Chrome to avoid downloading Playwright Chromium.
  let browser;
  for (const channel of ["msedge", "chrome", undefined]) {
    try {
      browser = await chromium.launch(channel ? { channel, headless: true } : { headless: true });
      break;
    } catch (e) {
      console.warn("launch failed", channel || "bundled", e.message);
    }
  }
  if (!browser) throw new Error("No browser available for corpus capture");
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForTimeout(3500);
  await dismissDevNoise(page);

  const manifest = [];

  for (const shot of shots) {
    await page.setViewportSize({ width: shot.w, height: shot.h });
    await selectTab(page, shot.tab);
    await dismissDevNoise(page);

    if (shot.collapseSidebar) {
      const btn = page.getByRole("button", { name: /Colapsar barra lateral/i });
      if (await btn.count()) {
        const pressed = await btn.getAttribute("aria-pressed");
        // released = expanded; click to collapse
        if (pressed !== "true") await btn.click();
        await page.waitForTimeout(500);
      }
    } else {
      const btn = page.getByRole("button", { name: /Colapsar barra lateral|Expandir barra lateral/i });
      if (await btn.count()) {
        const nameAttr = await btn.getAttribute("aria-label");
        if (nameAttr && /Expandir/i.test(nameAttr)) {
          await btn.click();
          await page.waitForTimeout(400);
        }
      }
    }

    if (shot.id === "VC-05" || shot.id === "VC-11" || shot.id === "VC-18") {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(400);
    }

    const out = path.join(BASE, shot.file);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const opts = { path: out, type: "png" };
    if (shot.clip) opts.clip = shot.clip;
    await page.screenshot(opts);

    manifest.push({
      id: shot.id,
      file: shot.file.replace(/\\/g, "/"),
      tab: shot.tab,
      viewport: `${shot.w}x${shot.h}`,
      capturedAt: TS,
      url: URL,
    });
    console.log("OK", shot.id, shot.file);
  }

  fs.writeFileSync(
    path.join(BASE, "CAPTURE-MANIFEST.json"),
    JSON.stringify({ capturedAt: TS, url: URL, shots: manifest }, null, 2),
  );
  await browser.close();
  console.log("DONE", manifest.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
