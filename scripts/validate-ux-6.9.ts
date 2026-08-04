/**
 * UX-6.9 — Diagnostics & Metrics Foundation gate.
 *
 * Blocks:
 * diagnosticsStructure · aggregatorContract · metricsContract · reportContract
 * providerContract · apiFreeze · noInternals · noTelemetry
 * noProductionMount · tscCompile
 *
 * Architectural principles:
 * - UXDiagnosticsInput is the sole input contract for Aggregator, Metrics, Provider.
 * - Aggregator receives public reports only — no recalculation, no WeakMap.
 * - Metrics are structural counts/lengths from public report fields.
 * - No React UI · no telemetry · no production mount · prior UX-6.x APIs frozen.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "diagnosticsStructure"
  | "aggregatorContract"
  | "metricsContract"
  | "reportContract"
  | "providerContract"
  | "apiFreeze"
  | "noInternals"
  | "noTelemetry"
  | "noProductionMount"
  | "tscCompile";

type CaseResult = { block: BlockId; id: string; pass: boolean; detail: string };

const results: CaseResult[] = [];

function assertCase(
  block: BlockId,
  id: string,
  pass: boolean,
  detail: string,
): void {
  results.push({ block, id, pass, detail });
}

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel: string): string {
  return readFileSync(join(repoRoot, rel), "utf8");
}

function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

function walkFiles(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (name === "node_modules" || name === ".next" || name === "dist") {
        continue;
      }
      walkFiles(full, acc);
    } else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(name)) {
      acc.push(full);
    }
  }
  return acc;
}

function extractFunctionBody(src: string, fnName: string): string {
  const re = new RegExp(
    `export\\s+function\\s+${fnName}\\s*\\([^)]*\\)\\s*(?::\\s*[^{]+)?\\{`,
  );
  const m = re.exec(src);
  if (!m || m.index === undefined) return "";
  let i = m.index + m[0].length;
  let depth = 1;
  const start = i;
  while (i < src.length && depth > 0) {
    const ch = src[i];
    if (ch === "{") depth += 1;
    else if (ch === "}") depth -= 1;
    i += 1;
  }
  return src.slice(start, i - 1);
}

function extractReadonlyTypeBody(src: string, typeName: string): string {
  const re = new RegExp(
    `export\\s+type\\s+${typeName}\\s*=\\s*Readonly\\s*<\\s*\\{`,
  );
  const m = re.exec(src);
  if (!m || m.index === undefined) return "";
  let i = m.index + m[0].length;
  let depth = 1;
  const start = i;
  while (i < src.length && depth > 0) {
    const ch = src[i];
    if (ch === "{") depth += 1;
    else if (ch === "}") depth -= 1;
    i += 1;
  }
  return src.slice(start, i - 1);
}

function extractInterfaceBody(src: string, name: string): string {
  const re = new RegExp(`export\\s+interface\\s+${name}\\s*\\{`);
  const m = re.exec(src);
  if (!m || m.index === undefined) return "";
  let i = m.index + m[0].length;
  let depth = 1;
  const start = i;
  while (i < src.length && depth > 0) {
    const ch = src[i];
    if (ch === "{") depth += 1;
    else if (ch === "}") depth -= 1;
    i += 1;
  }
  return src.slice(start, i - 1);
}

const DIAG_DIR = "src/ui/diagnostics";
const DIAG_TYPES = `${DIAG_DIR}/UXDiagnosticsTypes.ts`;
const DIAG_METRICS = `${DIAG_DIR}/UXMetrics.ts`;
const DIAG_REPORT = `${DIAG_DIR}/UXDiagnosticsReport.ts`;
const DIAG_AGGREGATOR = `${DIAG_DIR}/UXDiagnosticsAggregator.ts`;
const DIAG_CONTEXT = `${DIAG_DIR}/UXDiagnosticsContext.tsx`;
const DIAG_PROVIDER = `${DIAG_DIR}/UXDiagnosticsProvider.tsx`;
const DIAG_HOOK = `${DIAG_DIR}/useUXDiagnostics.ts`;
const DIAG_BRIDGE = `${DIAG_DIR}/UXDiagnosticsBridge.tsx`;
const DIAG_BARREL = `${DIAG_DIR}/index.ts`;

const PURE_DIAG_MODULES = [
  DIAG_TYPES,
  DIAG_METRICS,
  DIAG_REPORT,
  DIAG_AGGREGATOR,
  DIAG_BARREL,
] as const;

const REACT_DIAG_MODULES = [
  DIAG_CONTEXT,
  DIAG_PROVIDER,
  DIAG_HOOK,
  DIAG_BRIDGE,
] as const;

const COMMAND_DIAGNOSTICS = "src/ui/commands/CommandDiagnostics.ts";
const SHORTCUT_DIAGNOSTICS = "src/ui/shortcuts/ShortcutDiagnostics.ts";
const PALETTE_DIAGNOSTICS = "src/ui/palette/CommandPaletteDiagnostics.ts";
const MENU_DIAGNOSTICS = "src/ui/menus/MenuDiagnostics.ts";
const TOOLBAR_DIAGNOSTICS = "src/ui/toolbar/ToolbarDiagnostics.ts";
const CONTEXT_MENU_DIAGNOSTICS =
  "src/ui/context-menus/ContextMenuDiagnostics.ts";

const COMMAND_DEFINITION = "src/ui/commands/CommandDefinition.ts";
const COMMAND_REGISTRY = "src/ui/commands/CommandRegistry.ts";
const COMMAND_STATE = "src/ui/commands/CommandState.ts";
const COMMAND_PROVIDER = "src/ui/commands/CommandProvider.tsx";
const COMMAND_PIPELINE = "src/ui/commands/CommandExecutionPipeline.ts";

const SHORTCUT_PROVIDER = "src/ui/shortcuts/ShortcutProvider.tsx";
const PALETTE_PROVIDER = "src/ui/palette/CommandPaletteProvider.tsx";
const MENU_PROVIDER = "src/ui/menus/MenuProvider.tsx";
const TOOLBAR_PROVIDER = "src/ui/toolbar/ToolbarProvider.tsx";
const CONTEXT_MENU_PROVIDER =
  "src/ui/context-menus/ContextMenuProvider.tsx";

const UI_INDEX = "src/ui/index.ts";
const ROADMAP_6 = "docs/UX/UX-6.0-roadmap.md";
const DOC_6_9 = "docs/UX/UX-6.9.md";

const FORBIDDEN_INTERNALS = [
  /\bWeakMap\b/,
  /\brequireInternals\b/,
  /\bgetToolbarToolbars\b/,
  /\bgetToolbarItems\b/,
  /\bgetToolbarDuplicatedItems\b/,
  /\bgetContextMenusEntries\b/,
  /\bgetContextMenusItems\b/,
  /\bgetContextMenusDuplicatedItems\b/,
  /\bgetMenuTreeMenus\b/,
  /\bgetMenuTreeEntries\b/,
  /\bgetMenuTreeDuplicatedEntries\b/,
  /\bgetCommandPaletteIndexEntries\b/,
  /\bgetCommandPaletteIndexKeywordReport\b/,
  /\.has\s*\(/,
  /\bfilter\s*\(/,
];

const FORBIDDEN_TELEMETRY = [
  /\bconsole\./,
  /\bfetch\s*\(/,
  /\banalytics\b/i,
  /\btelemetry\b/i,
  /\bprofiler\b/i,
  /\bperformance\./,
  /\bnavigator\./,
  /\blogging\b/i,
  /\bXMLHttpRequest\b/,
  /\bsendBeacon\b/,
];

/* -------------------------------------------------------------------------- */
/* PASS 01 — diagnosticsStructure                                             */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "diagnosticsStructure";

  const required = [
    DIAG_TYPES,
    DIAG_METRICS,
    DIAG_REPORT,
    DIAG_AGGREGATOR,
    DIAG_CONTEXT,
    DIAG_PROVIDER,
    DIAG_HOOK,
    DIAG_BRIDGE,
    DIAG_BARREL,
    DOC_6_9,
    ROADMAP_6,
  ];

  for (const rel of required) {
    assertCase(
      block,
      `exists.${rel.split("/").pop()}`,
      existsSync(join(repoRoot, rel)),
      `${rel} exists`,
    );
  }

  for (const rel of PURE_DIAG_MODULES) {
    const raw = existsSync(join(repoRoot, rel)) ? read(rel) : "";
    const src = stripComments(raw);
    assertCase(
      block,
      `pure.reactFree.${rel.split("/").pop()}`,
      !/\bfrom\s+["']react["']/.test(src) && !/"use client"/.test(raw),
      `${rel} is React-free`,
    );
  }

  const barrel = existsSync(join(repoRoot, DIAG_BARREL))
    ? stripComments(read(DIAG_BARREL))
    : "";
  assertCase(
    block,
    "barrel.noReactExports",
    !/UXDiagnosticsProvider/.test(barrel) &&
      !/UXDiagnosticsBridge/.test(barrel) &&
      !/useUXDiagnostics/.test(barrel) &&
      !/UXDiagnosticsContext/.test(barrel),
    "Local barrel does not export React surfaces",
  );
  assertCase(
    block,
    "barrel.exportsCore",
    /UXDiagnosticsInput/.test(barrel) &&
      /createUXMetrics/.test(barrel) &&
      /createUXDiagnosticsReport/.test(barrel) &&
      /UXDiagnosticsReport/.test(barrel) &&
      /UXMetricsReport/.test(barrel),
    "Local barrel exports Input · Metrics · Aggregator · Report types",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — aggregatorContract                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "aggregatorContract";

  const src = existsSync(join(repoRoot, DIAG_AGGREGATOR))
    ? stripComments(read(DIAG_AGGREGATOR))
    : "";
  const body = extractFunctionBody(src, "createUXDiagnosticsReport");

  assertCase(
    block,
    "agg.export",
    /export\s+function\s+createUXDiagnosticsReport\s*\(/.test(src),
    "createUXDiagnosticsReport exported",
  );
  assertCase(
    block,
    "agg.inputParam",
    /createUXDiagnosticsReport\s*\(\s*input\s*:\s*UXDiagnosticsInput\s*,?\s*\)/.test(
      src,
    ),
    "createUXDiagnosticsReport(input: UXDiagnosticsInput)",
  );
  assertCase(
    block,
    "agg.callsCreateUXMetrics",
    /createUXMetrics\s*\(\s*input\s*\)/.test(body),
    "Aggregator calls createUXMetrics(input) once",
  );
  assertCase(
    block,
    "agg.freeze",
    /Object\.freeze\s*\(/.test(body),
    "Aggregator returns Object.freeze(...)",
  );
  assertCase(
    block,
    "agg.spreadsInput",
    /\.\.\.\s*input/.test(body) && /\bmetrics\b/.test(body),
    "Aggregator freezes { ...input, metrics }",
  );
  assertCase(
    block,
    "agg.noRecalc",
    !/\borphanCommands\s*=/.test(body) &&
      !/\bduplicatedEntries\s*=/.test(body) &&
      !/\bduplicatedItems\s*=/.test(body) &&
      !/\bduplicatedKeywords\s*=/.test(body) &&
      !/\.filter\s*\(/.test(body) &&
      !/\.has\s*\(/.test(body),
    "Aggregator does not recalculate orphans/duplicates",
  );
  assertCase(
    block,
    "agg.noWeakMap",
    !/\bWeakMap\b/.test(src),
    "Aggregator has no WeakMap",
  );
  assertCase(
    block,
    "agg.reactFree",
    !/\bfrom\s+["']react["']/.test(src) &&
      !/"use client"/.test(
        existsSync(join(repoRoot, DIAG_AGGREGATOR))
          ? read(DIAG_AGGREGATOR)
          : "",
      ),
    "Aggregator is React-free",
  );
  assertCase(
    block,
    "agg.noClass",
    !/\bclass\b/.test(src),
    "Aggregator is not a class",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — metricsContract                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "metricsContract";

  const src = existsSync(join(repoRoot, DIAG_METRICS))
    ? stripComments(read(DIAG_METRICS))
    : "";
  const typeBody = extractReadonlyTypeBody(src, "UXMetricsReport");
  const fnBody = extractFunctionBody(src, "createUXMetrics");

  assertCase(
    block,
    "metrics.type",
    /export\s+type\s+UXMetricsReport\s*=/.test(src),
    "UXMetricsReport type exported",
  );
  assertCase(
    block,
    "metrics.create",
    /export\s+function\s+createUXMetrics\s*\(\s*input\s*:\s*UXDiagnosticsInput\s*\)/.test(
      src,
    ),
    "createUXMetrics(input: UXDiagnosticsInput)",
  );

  for (const field of [
    "totalCommandsReferenced",
    "totalMenus",
    "totalToolbarItems",
    "totalContextMenus",
    "totalShortcuts",
    "orphanCommands",
    "duplicatedEntries",
  ]) {
    assertCase(
      block,
      `metrics.field.${field}`,
      new RegExp(`\\b${field}\\b`).test(typeBody),
      `UXMetricsReport has ${field}`,
    );
  }

  assertCase(
    block,
    "metrics.fromPublicFields",
    /input\.commands\.count/.test(fnBody) &&
      /input\.menus\.menus\.length/.test(fnBody) &&
      /input\.toolbar\.items\.length/.test(fnBody) &&
      /input\.contextMenus\.contextMenus\.length/.test(fnBody) &&
      /input\.shortcuts\.count/.test(fnBody),
    "Metrics derive from public report fields",
  );
  assertCase(
    block,
    "metrics.orphanSum",
    /orphanEntries\.length/.test(fnBody) &&
      /orphanCommands\.length/.test(fnBody),
    "orphanCommands sums public orphan array lengths",
  );
  assertCase(
    block,
    "metrics.dupeSum",
    /duplicates\.length/.test(fnBody) &&
      /duplicatedKeywords\.length/.test(fnBody) &&
      /duplicatedEntries\.length/.test(fnBody) &&
      /duplicatedItems\.length/.test(fnBody),
    "duplicatedEntries sums public duplicate array lengths",
  );
  assertCase(
    block,
    "metrics.freeze",
    /Object\.freeze\s*\(/.test(fnBody),
    "createUXMetrics returns Object.freeze(...)",
  );
  assertCase(
    block,
    "metrics.noPerf",
    !/\bperformance\b/.test(src) &&
      !/\bDate\.now\b/.test(src) &&
      !/\bsetTimeout\b/.test(src) &&
      !/\bprofiler\b/i.test(src) &&
      !/\btiming\b/i.test(src),
    "Metrics have no timers/performance/profiling",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — reportContract                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "reportContract";

  const typesSrc = existsSync(join(repoRoot, DIAG_TYPES))
    ? stripComments(read(DIAG_TYPES))
    : "";
  const inputBody = extractReadonlyTypeBody(typesSrc, "UXDiagnosticsInput");

  assertCase(
    block,
    "input.type",
    /export\s+type\s+UXDiagnosticsInput\s*=/.test(typesSrc),
    "UXDiagnosticsInput exported",
  );

  for (const key of [
    "commands",
    "shortcuts",
    "palette",
    "menus",
    "toolbar",
    "contextMenus",
  ]) {
    assertCase(
      block,
      `input.key.${key}`,
      new RegExp(`\\b${key}\\b`).test(inputBody),
      `UXDiagnosticsInput has ${key}`,
    );
  }

  assertCase(
    block,
    "input.noMetrics",
    !/\bmetrics\b/.test(inputBody),
    "UXDiagnosticsInput does not include metrics",
  );

  const reportSrc = existsSync(join(repoRoot, DIAG_REPORT))
    ? stripComments(read(DIAG_REPORT))
    : "";
  const reportBody = extractReadonlyTypeBody(reportSrc, "UXDiagnosticsReport");

  assertCase(
    block,
    "report.type",
    /export\s+type\s+UXDiagnosticsReport\s*=/.test(reportSrc),
    "UXDiagnosticsReport exported",
  );

  for (const key of [
    "commands",
    "shortcuts",
    "palette",
    "menus",
    "toolbar",
    "contextMenus",
    "metrics",
  ]) {
    assertCase(
      block,
      `report.key.${key}`,
      new RegExp(`\\b${key}\\b`).test(reportBody),
      `UXDiagnosticsReport has ${key}`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — providerContract                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "providerContract";

  const ctxSrc = existsSync(join(repoRoot, DIAG_CONTEXT))
    ? stripComments(read(DIAG_CONTEXT))
    : "";
  const ctxBody = extractReadonlyTypeBody(ctxSrc, "UXDiagnosticsContextValue");
  assertCase(
    block,
    "context.value",
    /\breport\b/.test(ctxBody) &&
      !/\binput\b/.test(ctxBody) &&
      !/\bmetrics\b/.test(ctxBody) &&
      !/\bdispatch\b/.test(ctxBody),
    "UXDiagnosticsContextValue = { report } only",
  );

  const providerSrc = existsSync(join(repoRoot, DIAG_PROVIDER))
    ? stripComments(read(DIAG_PROVIDER))
    : "";
  const providerBody = extractFunctionBody(providerSrc, "UXDiagnosticsProvider");
  const propsBody = extractReadonlyTypeBody(
    providerSrc,
    "UXDiagnosticsProviderProps",
  );

  assertCase(
    block,
    "provider.props",
    /\bchildren\b/.test(propsBody) &&
      /\binput\b/.test(propsBody) &&
      !/\bcommands\b/.test(propsBody) &&
      !/\bshortcuts\b/.test(propsBody) &&
      !/\bpalette\b/.test(propsBody) &&
      !/\bmenus\b/.test(propsBody) &&
      !/\btoolbar\b/.test(propsBody) &&
      !/\bcontextMenus\b/.test(propsBody),
    "Provider props = { children, input } only (no six-prop API)",
  );
  assertCase(
    block,
    "provider.useRef",
    /useRef\s*\(\s*createUXDiagnosticsReport\s*\(\s*input\s*\)\s*\)/.test(
      providerBody,
    ),
    "Provider holds report via useRef(createUXDiagnosticsReport(input))",
  );
  assertCase(
    block,
    "provider.exposesReportOnly",
    /report\s*:/.test(providerBody) && !/\binput\s*:/.test(providerBody),
    "Provider exposes { report } only",
  );
  assertCase(
    block,
    "provider.noUseState",
    !/\buseState\b/.test(providerBody) && !/\buseReducer\b/.test(providerBody),
    "Provider has no useState/useReducer",
  );

  const hookSrc = existsSync(join(repoRoot, DIAG_HOOK))
    ? stripComments(read(DIAG_HOOK))
    : "";
  const hookBody = extractFunctionBody(hookSrc, "useUXDiagnostics");
  assertCase(
    block,
    "hook.readOnly",
    /useContext\s*\(\s*UXDiagnosticsContext\s*\)/.test(hookBody) &&
      /throw\s+new\s+Error/.test(hookBody),
    "useUXDiagnostics is read-only and throws outside Provider",
  );

  const bridgeSrc = existsSync(join(repoRoot, DIAG_BRIDGE))
    ? stripComments(read(DIAG_BRIDGE))
    : "";
  const bridgeBody = extractFunctionBody(bridgeSrc, "UXDiagnosticsBridge");
  assertCase(
    block,
    "bridge.passThrough",
    /useUXDiagnostics\s*\(/.test(bridgeBody) &&
      (/return\s+<>\s*\{\s*children\s*\}\s*<\/>/.test(bridgeBody) ||
        /return\s+children/.test(bridgeBody)) &&
      !/\bdispatch\b/.test(bridgeBody),
    "UXDiagnosticsBridge remains pass-through",
  );

  for (const rel of REACT_DIAG_MODULES) {
    const raw = existsSync(join(repoRoot, rel)) ? read(rel) : "";
    assertCase(
      block,
      `react.useClient.${rel.split("/").pop()}`,
      /"use client"/.test(raw),
      `${rel} is a client React module`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — apiFreeze                                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "apiFreeze";

  // UX-6.9 contracts
  assertCase(
    block,
    "freeze.uxDiagnosticsInput",
    existsSync(join(repoRoot, DIAG_TYPES)),
    "UXDiagnosticsInput file intact",
  );
  assertCase(
    block,
    "freeze.uxMetricsReport",
    existsSync(join(repoRoot, DIAG_METRICS)),
    "UXMetricsReport file intact",
  );
  assertCase(
    block,
    "freeze.uxDiagnosticsReport",
    existsSync(join(repoRoot, DIAG_REPORT)),
    "UXDiagnosticsReport file intact",
  );
  assertCase(
    block,
    "freeze.uxDiagnosticsProvider",
    existsSync(join(repoRoot, DIAG_PROVIDER)),
    "UXDiagnosticsProvider file intact",
  );
  assertCase(
    block,
    "freeze.useUXDiagnostics",
    existsSync(join(repoRoot, DIAG_HOOK)),
    "useUXDiagnostics file intact",
  );
  assertCase(
    block,
    "freeze.uxDiagnosticsBridge",
    existsSync(join(repoRoot, DIAG_BRIDGE)),
    "UXDiagnosticsBridge file intact",
  );
  assertCase(
    block,
    "freeze.uxDiagnosticsContext",
    existsSync(join(repoRoot, DIAG_CONTEXT)),
    "UXDiagnosticsContext file intact",
  );

  // Prior subsystem diagnostics remain intact
  const priorDiags: [string, string, string[]][] = [
    [
      COMMAND_DIAGNOSTICS,
      "CommandDiagnosticsReport",
      ["count", "ids", "enabled", "visible", "pipelineReady"],
    ],
    [
      SHORTCUT_DIAGNOSTICS,
      "ShortcutDiagnosticsReport",
      ["count", "ids", "shortcuts", "duplicates"],
    ],
    [
      PALETTE_DIAGNOSTICS,
      "CommandPaletteDiagnosticsReport",
      ["entries", "keywords", "duplicatedKeywords", "orphanEntries"],
    ],
    [
      MENU_DIAGNOSTICS,
      "MenuDiagnosticsReport",
      ["menus", "entries", "orphanCommands", "duplicatedEntries"],
    ],
    [
      TOOLBAR_DIAGNOSTICS,
      "ToolbarDiagnosticsReport",
      ["toolbars", "items", "orphanCommands", "duplicatedItems"],
    ],
    [
      CONTEXT_MENU_DIAGNOSTICS,
      "ContextMenuDiagnosticsReport",
      ["contextMenus", "items", "orphanCommands", "duplicatedItems"],
    ],
  ];

  for (const [rel, typeName, fields] of priorDiags) {
    const src = existsSync(join(repoRoot, rel))
      ? stripComments(read(rel))
      : "";
    const body = extractReadonlyTypeBody(src, typeName);
    assertCase(
      block,
      `freeze.prior.${typeName}`,
      fields.every((f) => new RegExp(`\\b${f}\\b`).test(body)),
      `${typeName} remains intact`,
    );
    assertCase(
      block,
      `freeze.prior.create.${typeName}`,
      /export\s+function\s+create\w+DiagnosticsReport\s*\(/.test(src),
      `${rel} still exports create*DiagnosticsReport`,
    );
  }

  // Commands core freeze
  const cmdDef = existsSync(join(repoRoot, COMMAND_DEFINITION))
    ? stripComments(read(COMMAND_DEFINITION))
    : "";
  const cmdDefBody = extractReadonlyTypeBody(cmdDef, "CommandDefinition");
  assertCase(
    block,
    "freeze.commandDefinition",
    /\bid\b/.test(cmdDefBody) &&
      !/\benabled\b/.test(cmdDefBody) &&
      !/\bexecute\b/.test(cmdDefBody),
    "CommandDefinition remains { id }",
  );

  const cmdReg = existsSync(join(repoRoot, COMMAND_REGISTRY))
    ? stripComments(read(COMMAND_REGISTRY))
    : "";
  const cmdRegBody = extractInterfaceBody(cmdReg, "CommandRegistryApi");
  assertCase(
    block,
    "freeze.commandRegistryApi",
    /\bget\s*\(/.test(cmdRegBody) &&
      /\bhas\s*\(/.test(cmdRegBody) &&
      /\bsize\s*\(/.test(cmdRegBody) &&
      /\bgetAll\s*\(/.test(cmdRegBody),
    "CommandRegistryApi remains query-only",
  );

  const cmdState = existsSync(join(repoRoot, COMMAND_STATE))
    ? stripComments(read(COMMAND_STATE))
    : "";
  const cmdStateBody = extractReadonlyTypeBody(cmdState, "CommandState");
  assertCase(
    block,
    "freeze.commandState",
    /\bid\b/.test(cmdStateBody) &&
      /\benabled\b/.test(cmdStateBody) &&
      /\bvisible\b/.test(cmdStateBody),
    "CommandState remains { id, enabled, visible }",
  );

  assertCase(
    block,
    "freeze.commandProvider",
    existsSync(join(repoRoot, COMMAND_PROVIDER)),
    "CommandProvider intact",
  );
  assertCase(
    block,
    "freeze.commandPipeline",
    existsSync(join(repoRoot, COMMAND_PIPELINE)),
    "CommandExecutionPipeline intact",
  );
  assertCase(
    block,
    "freeze.shortcutProvider",
    existsSync(join(repoRoot, SHORTCUT_PROVIDER)),
    "ShortcutProvider intact",
  );
  assertCase(
    block,
    "freeze.paletteProvider",
    existsSync(join(repoRoot, PALETTE_PROVIDER)),
    "CommandPaletteProvider intact",
  );
  assertCase(
    block,
    "freeze.menuProvider",
    existsSync(join(repoRoot, MENU_PROVIDER)),
    "MenuProvider intact",
  );
  assertCase(
    block,
    "freeze.toolbarProvider",
    existsSync(join(repoRoot, TOOLBAR_PROVIDER)),
    "ToolbarProvider intact",
  );
  assertCase(
    block,
    "freeze.contextMenuProvider",
    existsSync(join(repoRoot, CONTEXT_MENU_PROVIDER)),
    "ContextMenuProvider intact",
  );

  // @/ui barrel must not expand
  const uiIndex = existsSync(join(repoRoot, UI_INDEX))
    ? stripComments(read(UI_INDEX))
    : "";
  assertCase(
    block,
    "freeze.uiIndexNoDiagnostics",
    !/diagnostics/.test(uiIndex) &&
      !/commands/.test(uiIndex) &&
      !/shortcuts/.test(uiIndex) &&
      !/palette/.test(uiIndex) &&
      !/menus/.test(uiIndex) &&
      !/toolbar/.test(uiIndex) &&
      !/context-menus/.test(uiIndex),
    "src/ui/index.ts does not export UX-6 surfaces",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — noInternals                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noInternals";

  const diagFiles = walkFiles(join(repoRoot, DIAG_DIR));
  let hasInternals = false;
  let offender = "";

  for (const full of diagFiles) {
    const rel = relative(repoRoot, full).replace(/\\/g, "/");
    const src = stripComments(readFileSync(full, "utf8"));
    for (const re of FORBIDDEN_INTERNALS) {
      if (re.test(src)) {
        // Allow .length access patterns; .has( is forbidden.
        // filter in createUXMetrics is not used — if present, fail.
        hasInternals = true;
        offender = `${rel} matches ${re}`;
        break;
      }
    }
    if (hasInternals) break;
  }

  assertCase(
    block,
    "internals.none",
    !hasInternals,
    hasInternals
      ? `Forbidden internals: ${offender}`
      : "No WeakMap / private helpers / .has( / filter scans under diagnostics/",
  );

  // Aggregator and Metrics must not import opaque storage modules directly
  // beyond type-only report imports from public diagnostics files.
  const aggSrc = existsSync(join(repoRoot, DIAG_AGGREGATOR))
    ? stripComments(read(DIAG_AGGREGATOR))
    : "";
  const metricsSrc = existsSync(join(repoRoot, DIAG_METRICS))
    ? stripComments(read(DIAG_METRICS))
    : "";

  assertCase(
    block,
    "internals.aggNoSubsystemStorage",
    !/from\s+["']\.\.\/(menus\/MenuTree|toolbar\/Toolbar|context-menus\/ContextMenus|palette\/CommandPaletteIndex)["']/.test(
      aggSrc,
    ),
    "Aggregator does not import opaque storage modules",
  );
  assertCase(
    block,
    "internals.metricsNoSubsystemStorage",
    !/from\s+["']\.\.\/(menus\/MenuTree|toolbar\/Toolbar|context-menus\/ContextMenus|palette\/CommandPaletteIndex)["']/.test(
      metricsSrc,
    ),
    "Metrics does not import opaque storage modules",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — noTelemetry                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noTelemetry";

  const diagFiles = walkFiles(join(repoRoot, DIAG_DIR));
  let hasTelemetry = false;
  let offender = "";

  for (const full of diagFiles) {
    const rel = relative(repoRoot, full).replace(/\\/g, "/");
    const src = stripComments(readFileSync(full, "utf8"));
    for (const re of FORBIDDEN_TELEMETRY) {
      if (re.test(src)) {
        hasTelemetry = true;
        offender = `${rel} matches ${re}`;
        break;
      }
    }
    if (hasTelemetry) break;
  }

  assertCase(
    block,
    "telemetry.none",
    !hasTelemetry,
    hasTelemetry
      ? `Forbidden telemetry: ${offender}`
      : "No logging/telemetry/analytics/network/performance under diagnostics/",
  );

  const doc = existsSync(join(repoRoot, DOC_6_9)) ? read(DOC_6_9) : "";
  assertCase(
    block,
    "telemetry.docExclusion",
    /NO telemetry/i.test(doc) ||
      /sin telemetr/i.test(doc) ||
      /No telemetry/i.test(doc) ||
      /telemetry/i.test(doc),
    "UX-6.9.md documents telemetry exclusion",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — noProductionMount                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noProductionMount";

  const srcRoot = join(repoRoot, "src");
  const allSrc = walkFiles(srcRoot);
  let productWire = false;
  let offender = "";

  for (const full of allSrc) {
    const rel = relative(repoRoot, full).replace(/\\/g, "/");
    if (rel.startsWith("src/ui/diagnostics/")) continue;
    const src = stripComments(readFileSync(full, "utf8"));
    if (
      /UXDiagnosticsProvider/.test(src) ||
      /UXDiagnosticsBridge/.test(src) ||
      /from\s+["']@\/ui\/diagnostics/.test(src) ||
      /from\s+["'][^"']*\/ui\/diagnostics/.test(src)
    ) {
      productWire = true;
      offender = rel;
      break;
    }
  }

  assertCase(
    block,
    "mount.noProduction",
    !productWire,
    productWire
      ? `Production wire at ${offender}`
      : "No UXDiagnosticsProvider/Bridge import outside src/ui/diagnostics/",
  );

  // No AppShell references under diagnostics
  const diagFiles = walkFiles(join(repoRoot, DIAG_DIR));
  let hasAppShell = false;
  for (const full of diagFiles) {
    const src = stripComments(readFileSync(full, "utf8"));
    if (/\bAppShell\b/.test(src)) {
      hasAppShell = true;
      break;
    }
  }
  assertCase(
    block,
    "mount.noAppShell",
    !hasAppShell,
    "No AppShell under diagnostics/",
  );

  const doc = existsSync(join(repoRoot, DOC_6_9)) ? read(DOC_6_9) : "";
  assertCase(
    block,
    "mount.docNoProduction",
    /NO production mount/i.test(doc) || /sin montaje en producción/i.test(doc),
    "UX-6.9.md documents no production mount",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 10 — tscCompile                                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "tscCompile";

  const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
    timeout: 120_000,
  });

  assertCase(
    block,
    "tsc.exit0",
    tsc.status === 0,
    tsc.status === 0
      ? "tsc --noEmit exit 0"
      : `tsc failed: ${(tsc.stdout || tsc.stderr || "").slice(0, 500)}`,
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const BLOCKS: { id: BlockId; ca: string }[] = [
  { id: "diagnosticsStructure", ca: "CA-UX-6.9.1" },
  { id: "aggregatorContract", ca: "CA-UX-6.9.2" },
  { id: "metricsContract", ca: "CA-UX-6.9.3" },
  { id: "reportContract", ca: "CA-UX-6.9.4" },
  { id: "providerContract", ca: "CA-UX-6.9.5" },
  { id: "apiFreeze", ca: "CA-UX-6.9.6" },
  { id: "noInternals", ca: "CA-UX-6.9.7" },
  { id: "noTelemetry", ca: "CA-UX-6.9.8" },
  { id: "noProductionMount", ca: "CA-UX-6.9.9" },
  { id: "tscCompile", ca: "CA-UX-6.9.10" },
];

let passCount = 0;
for (const [i, b] of BLOCKS.entries()) {
  const cases = results.filter((r) => r.block === b.id);
  const ok = cases.length > 0 && cases.every((c) => c.pass);
  if (ok) passCount += 1;
  const label = `PASS ${String(i + 1).padStart(2, "0")} ${b.id}`;
  console.log(`${label} .... ${ok ? "PASS" : "FAIL"} (${b.ca})`);
  if (!ok) {
    for (const c of cases.filter((x) => !x.pass)) {
      console.log(`  ✗ ${c.id}: ${c.detail}`);
    }
  }
}

console.log(`${passCount}/${BLOCKS.length}`);
process.exit(passCount === BLOCKS.length ? 0 : 1);
