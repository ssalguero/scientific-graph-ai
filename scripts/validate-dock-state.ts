/**
 * D52.3 — Dock state / model integrity structural gate.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const dockingDir = join(repoRoot, "src/components/docking");

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const read = (file: string): string => {
  const full = join(dockingDir, file);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
};

const extractTypeBody = (source: string, typeName: string): string => {
  const re = new RegExp(
    `export\\s+type\\s+${typeName}\\s*=\\s*\\{([\\s\\S]*?)\\n\\};`
  );
  return source.match(re)?.[1] ?? "";
};

const typesSource = read("types.ts");
const slotsSource = read("dockSlots.ts");
const stateBody = extractTypeBody(typesSource, "DockState");
const layoutBody = extractTypeBody(typesSource, "DockLayoutDefinition");
const slotBody = extractTypeBody(typesSource, "DockSlotDefinition");

const stateKeys = [...stateBody.matchAll(/^\s*(\w+)\s*:/gm)].map((m) => m[1]);
assertCase(
  "dock.state.v1Freeze",
  stateKeys.length === 2 &&
    stateKeys.includes("activePanelIds") &&
    stateKeys.includes("sizes"),
  `DockState keys=[${stateKeys.join(", ")}]`
);

const modelSurfaces = [stateBody, layoutBody, slotBody].join("\n");
const forbiddenModelTypes = [
  "HTMLElement",
  "ReactNode",
  "RefObject",
  "DOMRect",
  "Element",
].filter((token) => new RegExp(`\\b${token}\\b`).test(modelSurfaces));

assertCase(
  "dock.state.modelOnly",
  forbiddenModelTypes.length === 0,
  forbiddenModelTypes.length ? forbiddenModelTypes.join(",") : "model-only"
);

assertCase(
  "dock.state.validDockSide",
  /export\s+type\s+DockSide\s*=\s*"left"\s*\|\s*"center"\s*\|\s*"right"\s*\|\s*"bottom"\s*\|\s*"floating"/.test(
    typesSource
  ),
  "DockSide union intact"
);

const validSides = new Set(["left", "center", "right", "bottom", "floating"]);
const slotSides = [
  ...slotsSource.matchAll(/side:\s*["'](\w+)["']/g),
].map((m) => m[1]);
assertCase(
  "dock.state.defaultSlotsValid",
  slotSides.length > 0 && slotSides.every((side) => validSides.has(side)),
  `slot sides=[${slotSides.join(", ")}]`
);

const panelIdRefs = [
  ...slotsSource.matchAll(/panelIds:\s*Object\.freeze\(\[([^\]]*)\]/g),
].map((m) => m[1].trim());
const nonEmptyPanelRefs = panelIdRefs.filter((ids) => ids.length > 0);
assertCase(
  "dock.state.defaultPanelsInSeed",
  nonEmptyPanelRefs.length > 0 &&
    nonEmptyPanelRefs.every(
      (ids) =>
        /DOCK_PANEL_IDS\.inspector/.test(ids) || /["']inspector["']/.test(ids)
    ),
  `non-empty panelIds=[${nonEmptyPanelRefs.join(" | ")}]`
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "dock-state",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — dock-state"
    : `\nFAIL — dock-state (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
