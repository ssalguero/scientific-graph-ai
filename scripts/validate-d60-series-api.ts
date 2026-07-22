/**
 * D60.5 — Series Alignment Foundation · Series API Freeze gate.
 * Authority: docs/D60.0-series-discovery.md · D60.1–D60.4 builds.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const windowsDir = join(repoRoot, "src/components/windows");
const seriesDir = join(windowsDir, "series");

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const readWindows = (file: string): string => {
  const full = join(windowsDir, file);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
};

const readSeries = (file: string): string => {
  const full = join(seriesDir, file);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
};

const REQUIRED_FILES = [
  "SeriesId.ts",
  "SeriesTypes.ts",
  "SeriesMetadata.ts",
  "SeriesRegistry.ts",
  "SeriesRegistryTypes.ts",
  "SeriesSelectionTypes.ts",
  "SeriesSelectionState.ts",
  "SeriesSelectionBridge.ts",
  "WindowSeriesBridge.ts",
  "index.ts",
] as const;

for (const file of REQUIRED_FILES) {
  const exists = existsSync(join(seriesDir, file));
  assertCase(`d60.api.file.${file}`, exists, exists ? "exists" : "missing");
}

const seriesId = readSeries("SeriesId.ts");
const seriesTypes = readSeries("SeriesTypes.ts");
const seriesMetadata = readSeries("SeriesMetadata.ts");
const registryTypes = readSeries("SeriesRegistryTypes.ts");
const registry = readSeries("SeriesRegistry.ts");
const selectionTypes = readSeries("SeriesSelectionTypes.ts");
const selectionState = readSeries("SeriesSelectionState.ts");
const selectionBridge = readSeries("SeriesSelectionBridge.ts");
const windowBridge = readSeries("WindowSeriesBridge.ts");
const seriesBarrel = readSeries("index.ts");
const windowsBarrel = readWindows("index.ts");
const windowTypes = readWindows("WindowTypes.ts");

assertCase(
  "d60.api.seriesId",
  /export type SeriesId\s*=/.test(seriesId),
  "SeriesId exported"
);

assertCase(
  "d60.api.seriesTypes",
  /export type SeriesKind\s*=/.test(seriesTypes) &&
    /export type SeriesState\s*=/.test(seriesTypes),
  "SeriesKind + SeriesState exported"
);

assertCase(
  "d60.api.seriesMetadata",
  /export type SeriesMetadata\s*=/.test(seriesMetadata),
  "SeriesMetadata exported"
);

assertCase(
  "d60.api.seriesRegistry",
  /export type SeriesRegistry\s*=/.test(registryTypes) &&
    /register\s*\(/.test(registryTypes) &&
    /unregister\s*\(/.test(registryTypes) &&
    /has\s*\(/.test(registryTypes) &&
    /get\s*\(/.test(registryTypes) &&
    /getAll\s*\(/.test(registryTypes) &&
    /export function createSeriesRegistry\s*\(/.test(registry),
  "SeriesRegistry surface + createSeriesRegistry"
);

assertCase(
  "d60.api.seriesSelection",
  /selectedSeries/.test(selectionTypes) &&
    /activeSeries/.test(selectionTypes) &&
    /focusedSeries/.test(selectionTypes) &&
    /export type SeriesSelectionState\s*=/.test(selectionTypes) &&
    /export type SeriesSelectionBridge\s*=/.test(selectionTypes) &&
    /export function createSeriesSelectionState\s*\(/.test(selectionState) &&
    /export function createSeriesSelectionBridge\s*\(/.test(selectionBridge),
  "Selection contracts + factories"
);

assertCase(
  "d60.api.windowSeriesBridge",
  /export type WindowSeriesBridge\s*=/.test(windowBridge) &&
    /bind\s*\(/.test(windowBridge) &&
    /unbind\s*\(/.test(windowBridge) &&
    /hasWindow\s*\(/.test(windowBridge) &&
    /hasSeries\s*\(/.test(windowBridge) &&
    /getSeriesForWindow\s*\(/.test(windowBridge) &&
    /getWindowForSeries\s*\(/.test(windowBridge) &&
    /clear\s*\(/.test(windowBridge) &&
    /export function createWindowSeriesBridge\s*\(/.test(windowBridge),
  "WindowSeriesBridge surface + factory"
);

assertCase(
  "d60.api.seriesBarrelExports",
  /export type \{ SeriesId \}/.test(seriesBarrel) &&
    /SeriesRegistry/.test(seriesBarrel) &&
    /createSeriesRegistry/.test(seriesBarrel) &&
    /SeriesSelectionState/.test(seriesBarrel) &&
    /createSeriesSelectionState/.test(seriesBarrel) &&
    /createSeriesSelectionBridge/.test(seriesBarrel) &&
    /WindowSeriesBridge/.test(seriesBarrel) &&
    /createWindowSeriesBridge/.test(seriesBarrel),
  "series/index.ts exports Freeze surface"
);

const SERIES_LEAKS = [
  "SeriesId",
  "SeriesKind",
  "SeriesState",
  "SeriesMetadata",
  "SeriesRegistry",
  "SeriesDefinition",
  "createSeriesRegistry",
  "SeriesSelectionState",
  "SeriesSelectionBridge",
  "createSeriesSelectionState",
  "createSeriesSelectionBridge",
  "WindowSeriesBridge",
  "createWindowSeriesBridge",
  "SeriesIdentity",
] as const;

const windowsBarrelExportLines = windowsBarrel
  .split("\n")
  .filter((l) => /^\s*export\s/.test(l))
  .join("\n");

const leaked = SERIES_LEAKS.filter((name) =>
  new RegExp(`\\b${name}\\b`).test(windowsBarrelExportLines)
);

assertCase(
  "d60.api.noSeriesWindowsBarrelLeak",
  leaked.length === 0 && !/from\s+["']\.\/series/.test(windowsBarrel),
  leaked.length
    ? `leaked: ${leaked.join(",")}`
    : "Series* not exported from windows/index.ts"
);

assertCase(
  "d60.api.windowApiIntact",
  /export interface WindowAPI\b/.test(windowTypes) &&
    !/\bSeriesId\b/.test(windowTypes) &&
    !/\bseriesId\b/.test(windowTypes) &&
    !/\bbindSeries\b/.test(windowTypes),
  "WindowAPI D55 intact — no Series methods/fields"
);

assertCase(
  "d60.api.noSeriesOnWindowDefinition",
  /export interface WindowDefinition\b/.test(windowTypes) &&
    !/\bseriesId\b/.test(windowTypes) &&
    !/\bSeriesId\b/.test(windowTypes),
  "Hard Rule: no Series fields on WindowDefinition/WindowState types file"
);

assertCase(
  "d60.api.noStoreNaming",
  !/Store/.test(seriesId + seriesTypes + seriesMetadata + registryTypes + registry) &&
    !/Store/.test(selectionTypes + selectionState + selectionBridge + windowBridge) &&
    !/Store/.test(seriesBarrel),
  "No *Store naming in series/**"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d60-series-api",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — d60-series-api"
    : `\nFAIL — d60-series-api (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
