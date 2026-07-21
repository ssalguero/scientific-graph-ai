/**
 * D52.3 — Dock layout structural gate.
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
const layoutSource = read("dockLayout.ts");
const slotsSource = read("dockSlots.ts");
const contextSource = read("DockContext.tsx");
const barrelSource = read("index.ts");

assertCase(
  "dock.layout.defaultExport",
  /export const DEFAULT_DOCK_LAYOUT\b/.test(layoutSource) &&
    /export\s*\{\s*DEFAULT_DOCK_LAYOUT\s*\}\s*from\s*["']\.\/dockLayout["']/.test(
      barrelSource
    ),
  "DEFAULT_DOCK_LAYOUT exported from module + barrel"
);

const layoutTypeBody = extractTypeBody(typesSource, "DockLayoutDefinition");
const slotTypeBody = extractTypeBody(typesSource, "DockSlotDefinition");
assertCase(
  "dock.layout.typeShape",
  /slots:\s*readonly\s+DockSlotDefinition\[\]/.test(layoutTypeBody) &&
    /side:\s*DockSide/.test(slotTypeBody) &&
    /panelIds:\s*readonly\s+string\[\]/.test(slotTypeBody),
  "DockLayoutDefinition / DockSlotDefinition shapes"
);

const requiredSides = ["left", "right", "bottom", "floating"] as const;
const sidesPresent = requiredSides.filter((side) =>
  new RegExp(`side:\\s*["']${side}["']`).test(slotsSource)
);
assertCase(
  "dock.layout.zonesPresent",
  sidesPresent.length === requiredSides.length,
  `sides=[${sidesPresent.join(", ")}]`
);

const floatingBlock = slotsSource.match(
  /side:\s*["']floating["'][\s\S]*?panelIds:\s*Object\.freeze\(\[([^\]]*)\]/
);
const floatingIds = (floatingBlock?.[1] ?? "MISSING").trim();
assertCase(
  "dock.layout.floatingEmpty",
  floatingBlock !== null && floatingIds.length === 0,
  `floating.panelIds=[${floatingIds}]`
);

assertCase(
  "dock.layout.frozenOrReadonly",
  /Object\.freeze\s*\(/.test(layoutSource) &&
    /Object\.freeze\s*\(/.test(slotsSource),
  "DEFAULT_DOCK_LAYOUT / slots frozen"
);

const contextWithoutComments = contextSource
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\/\/.*$/gm, "");
assertCase(
  "dock.layout.contextReference",
  /layout:\s*DEFAULT_DOCK_LAYOUT/.test(contextWithoutComments) &&
    !/useState\s*[<(].*layout/i.test(contextWithoutComments) &&
    !/useState\s*<\s*DockLayoutDefinition/.test(contextWithoutComments),
  "context.layout references DEFAULT_DOCK_LAYOUT"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "dock-layout",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — dock-layout"
    : `\nFAIL — dock-layout (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
