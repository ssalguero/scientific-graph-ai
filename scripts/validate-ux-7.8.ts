/**
 * UX-7.8 — Visual Integration gate.
 *
 * Blocks:
 * documentationExists · moduleExists · visualIntegrationFreeze
 * renderingRulesContract · consumptionRulesContract · representationOnly
 * barrelExport · priorFreezeIntact · freezeFences · dependencyFence
 *
 * Architectural principles:
 * - Visual Integration Freeze · Rendering Ownership Freeze
 * - Component Purity Freeze · Snapshot Lifetime Freeze
 * - Rendering Rules · Consumption Rules · Dependency Rules
 * - Pipeline → Snapshot → render ONLY (fence-safe bindings)
 * - No product wire · no @/ui expansion · UX-7.1–7.7 intact
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "documentationExists"
  | "moduleExists"
  | "visualIntegrationFreeze"
  | "renderingRulesContract"
  | "consumptionRulesContract"
  | "representationOnly"
  | "barrelExport"
  | "priorFreezeIntact"
  | "freezeFences"
  | "dependencyFence";

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

const VI_DIR = "src/ui/visual-integration";
const VI_TYPES = `${VI_DIR}/VisualIntegrationTypes.ts`;
const VI_QUERY = `${VI_DIR}/queryDiscSnapshot.ts`;
const VI_TOOLTIP = `${VI_DIR}/TooltipContentView.tsx`;
const VI_HINT = `${VI_DIR}/ShortcutHintView.tsx`;
const VI_HELP = `${VI_DIR}/ContextHelpView.tsx`;
const VI_DESC = `${VI_DIR}/CommandDescriptionView.tsx`;
const VI_COMPOSITE = `${VI_DIR}/DiscoverabilityView.tsx`;
const VI_INDEX = `${VI_DIR}/index.ts`;

const VISIBILITY_DIR = "src/ui/visibility";
const VISIBILITY_DEFINITION = `${VISIBILITY_DIR}/VisibilityDefinition.ts`;
const VISIBILITY_REGISTRY = `${VISIBILITY_DIR}/VisibilityRegistry.ts`;

const TOOLTIPS_DIR = "src/ui/tooltips";
const TOOLTIP_CONTENT = `${TOOLTIPS_DIR}/TooltipContent.ts`;

const HINTS_DIR = "src/ui/shortcut-hints";
const HINT_CONTENT = `${HINTS_DIR}/ShortcutHint.ts`;

const DESC_DIR = "src/ui/command-descriptions";
const DESC_CONTENT = `${DESC_DIR}/CommandDescription.ts`;

const HELP_DIR = "src/ui/context-help";
const HELP_CONTENT = `${HELP_DIR}/ContextHelp.ts`;

const DISC_DIR = "src/ui/discoverability";
const DISC_SNAPSHOT = `${DISC_DIR}/DiscoverabilitySnapshot.ts`;
const DISC_PIPELINE = `${DISC_DIR}/DiscoverabilityPipeline.ts`;

const DIAG_DIR = "src/ui/visibility-diagnostics";
const SHORTCUTS_DIR = "src/ui/shortcuts";
const COMMANDS_DIR = "src/ui/commands";
const UX_DIAGNOSTICS_DIR = "src/ui/diagnostics";

const UI_INDEX = "src/ui/index.ts";
const ROADMAP_7 = "docs/UX/UX-7.0-roadmap.md";
const DOC_7_8 = "docs/UX/UX-7.8.md";
const PACKAGE_JSON = "package.json";

const MODULE_FILES = [
  VI_TYPES,
  VI_QUERY,
  VI_TOOLTIP,
  VI_HINT,
  VI_HELP,
  VI_DESC,
  VI_COMPOSITE,
  VI_INDEX,
] as const;

const FORBIDDEN_EXTRA_METHODS = [
  /\bfindByCategory\s*\(/,
  /\bfindByShortcut\s*\(/,
  /\bfindBy\w*\s*\(/,
  /\bcontains\s*\(/,
  /\bsize\s*\(/,
  /\bhas\s*\(/,
  /\bremove\s*\(/,
  /\breplace\s*\(/,
];

const FORBIDDEN_HISTORICAL = [
  /resolveTooltipContent/,
  /resolveShortcutHint/,
  /resolveCommandDescription/,
  /resolveContextHelp/,
  /createTooltipContent/,
  /createShortcutHint/,
  /createCommandDescription/,
  /createContextHelp/,
  /createVisibilityDefinition/,
  /createVisibilityRegistry/,
  /visibilityRegistry/,
  /VisibilityRegistryApi/,
  /createVisibilityDiagnosticsReport/,
  /VisibilityDiagnosticsReport/,
  /createDiscoverabilityPipeline/,
  /DiscoverabilitySnapshot/,
  /DiscoverabilityPipeline/,
];

/* -------------------------------------------------------------------------- */
/* PASS 01 — documentationExists                                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "documentationExists";

  assertCase(
    block,
    "exists.roadmap",
    existsSync(join(repoRoot, ROADMAP_7)),
    `${ROADMAP_7} exists`,
  );

  assertCase(
    block,
    "exists.doc",
    existsSync(join(repoRoot, DOC_7_8)),
    `${DOC_7_8} exists`,
  );

  const pkg = existsSync(join(repoRoot, PACKAGE_JSON))
    ? read(PACKAGE_JSON)
    : "";
  assertCase(
    block,
    "exists.npmScript",
    /"validate:ux-7\.8"\s*:/.test(pkg),
    "package.json has validate:ux-7.8",
  );

  const doc = existsSync(join(repoRoot, DOC_7_8)) ? read(DOC_7_8) : "";

  assertCase(
    block,
    "doc.visualIntegrationFreeze",
    /Visual Integration Freeze/i.test(doc) &&
      /UI = representación/i.test(doc) &&
      /Infrastructure = verdad/i.test(doc),
    "UX-7.8.md documents Visual Integration Freeze",
  );

  assertCase(
    block,
    "doc.renderingOwnershipFreeze",
    /Rendering Ownership Freeze/i.test(doc) &&
      /DiscoverabilityPipeline/i.test(doc) &&
      /DiscoverabilitySnapshot/i.test(doc) &&
      /resolveTooltipContent/i.test(doc),
    "UX-7.8.md documents Rendering Ownership Freeze",
  );

  assertCase(
    block,
    "doc.componentPurityFreeze",
    /Component Purity Freeze/i.test(doc) &&
      /funciones puras/i.test(doc) &&
      /No mantienen estado propio/i.test(doc) &&
      /No memorizan snapshots/i.test(doc) &&
      /No producen efectos secundarios/i.test(doc),
    "UX-7.8.md documents Component Purity Freeze",
  );

  assertCase(
    block,
    "doc.snapshotLifetimeFreeze",
    /Snapshot Lifetime Freeze/i.test(doc) &&
      /único DiscoverabilitySnapshot/i.test(doc) &&
      /No se actualiza parcialmente/i.test(doc) &&
      /nuevo Snapshot completo/i.test(doc),
    "UX-7.8.md documents Snapshot Lifetime Freeze",
  );

  assertCase(
    block,
    "doc.renderingRules",
    /Rendering Rules/i.test(doc) &&
      /No transformación/i.test(doc) &&
      /No fallbacks cruzados/i.test(doc),
    "UX-7.8.md documents Rendering Rules",
  );

  assertCase(
    block,
    "doc.consumptionRules",
    /Consumption Rules/i.test(doc) &&
      /resolveByCommandId/i.test(doc) &&
      /No consultar registries/i.test(doc),
    "UX-7.8.md documents Consumption Rules",
  );

  assertCase(
    block,
    "doc.dependencyRules",
    /Dependency Rules/i.test(doc) &&
      /visual-integration → discoverability/i.test(doc),
    "UX-7.8.md documents Dependency Rules",
  );

  assertCase(
    block,
    "doc.noResponsibilities",
    /No responsabilidades/i.test(doc) || /## 6\. No responsabilidades/.test(doc),
    "UX-7.8.md documents No responsabilidades",
  );

  assertCase(
    block,
    "doc.extensionPoints",
    /Extension Points/i.test(doc) && /UX-7\.9/i.test(doc),
    "UX-7.8.md documents Extension Points",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — moduleExists                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "moduleExists";

  assertCase(
    block,
    "dir.exists",
    existsSync(join(repoRoot, VI_DIR)),
    `${VI_DIR}/ exists`,
  );

  for (const rel of MODULE_FILES) {
    assertCase(
      block,
      `file.${rel.split("/").pop()}`,
      existsSync(join(repoRoot, rel)),
      `${rel} exists`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — visualIntegrationFreeze                                          */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "visualIntegrationFreeze";

  const querySrc = existsSync(join(repoRoot, VI_QUERY))
    ? stripComments(read(VI_QUERY))
    : "";
  const typesSrc = existsSync(join(repoRoot, VI_TYPES))
    ? stripComments(read(VI_TYPES))
    : "";

  assertCase(
    block,
    "ownership.pipelineInject",
    /PipelineInject/.test(typesSrc) &&
      /\$\{\s*["']Discoverability["']\s*\}Pipeline/.test(typesSrc),
    "Fence-safe PipelineInject type present",
  );

  assertCase(
    block,
    "ownership.snapshotInject",
    /SnapshotInject/.test(typesSrc) &&
      /\$\{\s*["']Discoverability["']\s*\}Snapshot/.test(typesSrc),
    "Fence-safe SnapshotInject type present",
  );

  assertCase(
    block,
    "ownership.queryResolve",
    /pipeline\.resolve\s*\(/.test(querySrc) &&
      /export\s+function\s+queryDiscSnapshot\s*\(/.test(querySrc),
    "queryDiscSnapshot calls pipeline.resolve",
  );

  assertCase(
    block,
    "ownership.queryResolveByCommandId",
    /pipeline\.resolveByCommandId\s*\(/.test(querySrc) &&
      /export\s+function\s+queryDiscSnapshotByCommandId\s*\(/.test(querySrc),
    "queryDiscSnapshotByCommandId calls pipeline.resolveByCommandId",
  );

  const viFiles = walkFiles(join(repoRoot, VI_DIR));
  let hasForbiddenHistorical = false;
  let hasPurityViolation = false;
  for (const full of viFiles) {
    const src = stripComments(readFileSync(full, "utf8"));
    for (const re of FORBIDDEN_HISTORICAL) {
      if (re.test(src)) {
        hasForbiddenHistorical = true;
        break;
      }
    }
    if (
      /\buseState\s*\(/.test(src) ||
      /\buseEffect\s*\(/.test(src) ||
      /\buseMemo\s*\(/.test(src) ||
      /\buseCallback\s*\(/.test(src) ||
      /\buseReducer\s*\(/.test(src) ||
      /\buseRef\s*\(/.test(src)
    ) {
      hasPurityViolation = true;
    }
  }

  assertCase(
    block,
    "ownership.noHistoricalResolve",
    !hasForbiddenHistorical,
    "No contiguous historical fence / forbidden APIs in visual-integration",
  );

  assertCase(
    block,
    "purity.noHooksState",
    !hasPurityViolation,
    "Component Purity Freeze: no useState/useEffect/useMemo/useCallback/useReducer/useRef",
  );

  const compositeSrc = existsSync(join(repoRoot, VI_COMPOSITE))
    ? stripComments(read(VI_COMPOSITE))
    : "";
  assertCase(
    block,
    "lifetime.compositeUsesSnapshot",
    /props\.snapshot/.test(compositeSrc) || /snapshot\.tooltip/.test(compositeSrc),
    "DiscoverabilityView consumes one Snapshot prop",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — renderingRulesContract                                           */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "renderingRulesContract";

  const viewFiles = [VI_TOOLTIP, VI_HINT, VI_HELP, VI_DESC, VI_COMPOSITE];
  let allOmitUndefined = true;
  let hasCrossFallback = false;
  let hasEnrichment = false;

  for (const rel of [VI_TOOLTIP, VI_HINT, VI_HELP, VI_DESC]) {
    const src = existsSync(join(repoRoot, rel))
      ? stripComments(read(rel))
      : "";
    if (!/===\s*undefined/.test(src) && !/==\s*undefined/.test(src)) {
      allOmitUndefined = false;
    }
    if (/return\s+null/.test(src) === false) {
      allOmitUndefined = false;
    }
  }

  for (const rel of viewFiles) {
    const src = existsSync(join(repoRoot, rel))
      ? stripComments(read(rel))
      : "";
    if (
      /fallback/i.test(src) ||
      /defaultTitle/i.test(src) ||
      /placeholder/i.test(src)
    ) {
      hasCrossFallback = true;
    }
    if (
      /\.trim\s*\(/.test(src) ||
      /\.toUpperCase\s*\(/.test(src) ||
      /\.toLowerCase\s*\(/.test(src) ||
      /\+\s*["']/.test(src)
    ) {
      hasEnrichment = true;
    }
  }

  assertCase(
    block,
    "render.omitUndefined",
    allOmitUndefined,
    "Slot views return null when content is undefined",
  );

  assertCase(
    block,
    "render.noCrossFallback",
    !hasCrossFallback,
    "No cross-slot fallback / placeholder enrichment in views",
  );

  assertCase(
    block,
    "render.noFieldTransform",
    !hasEnrichment,
    "No field transform/enrichment in presentational views",
  );

  const tooltipSrc = existsSync(join(repoRoot, VI_TOOLTIP))
    ? stripComments(read(VI_TOOLTIP))
    : "";
  assertCase(
    block,
    "render.tooltipFieldsAsIs",
    /content\.title/.test(tooltipSrc) &&
      /content\.description/.test(tooltipSrc) &&
      /content\.shortcut/.test(tooltipSrc),
    "TooltipContentView renders title/description/shortcut as-is",
  );

  const hintSrc = existsSync(join(repoRoot, VI_HINT))
    ? stripComments(read(VI_HINT))
    : "";
  assertCase(
    block,
    "render.hintFieldsAsIs",
    /content\.title/.test(hintSrc) && /content\.shortcut/.test(hintSrc),
    "ShortcutHintView renders title/shortcut as-is",
  );

  const helpSrc = existsSync(join(repoRoot, VI_HELP))
    ? stripComments(read(VI_HELP))
    : "";
  assertCase(
    block,
    "render.helpFieldsAsIs",
    /content\.title/.test(helpSrc) &&
      /content\.description/.test(helpSrc) &&
      /content\.category/.test(helpSrc),
    "ContextHelpView renders title/description/category as-is",
  );

  const descSrc = existsSync(join(repoRoot, VI_DESC))
    ? stripComments(read(VI_DESC))
    : "";
  assertCase(
    block,
    "render.descFieldsAsIs",
    /content\.title/.test(descSrc) &&
      /content\.description/.test(descSrc) &&
      /content\.shortcut/.test(descSrc) &&
      /content\.category/.test(descSrc),
    "CommandDescriptionView renders title/description/shortcut/category as-is",
  );

  const compositeSrc = existsSync(join(repoRoot, VI_COMPOSITE))
    ? stripComments(read(VI_COMPOSITE))
    : "";
  assertCase(
    block,
    "render.slotIndependence",
    /TooltipContentView/.test(compositeSrc) &&
      /ShortcutHintView/.test(compositeSrc) &&
      /CommandDescriptionView/.test(compositeSrc) &&
      /ContextHelpView/.test(compositeSrc) &&
      /snapshot\.tooltip/.test(compositeSrc) &&
      /snapshot\.shortcutHint/.test(compositeSrc) &&
      /snapshot\.commandDescription/.test(compositeSrc) &&
      /snapshot\.contextHelp/.test(compositeSrc),
    "Composite renders four independent Snapshot slots",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — consumptionRulesContract                                         */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "consumptionRulesContract";

  const viFiles = walkFiles(join(repoRoot, VI_DIR));
  let importsDiscoverability = false;
  let importsDiagnostics = false;
  let importsRegistryRuntime = false;
  let hasIndividualResolve = false;

  for (const full of viFiles) {
    const src = stripComments(readFileSync(full, "utf8"));
    if (
      /from\s+["']\.\.\/discoverability\b/.test(src) ||
      /from\s+["']\.\.\/discoverability\//.test(src) ||
      /import\s*\(\s*["']\.\.\/discoverability["']\s*\)/.test(src)
    ) {
      importsDiscoverability = true;
    }
    if (
      /visibility-diagnostics/.test(src) ||
      /createVisibilityDiagnosticsReport/.test(src)
    ) {
      importsDiagnostics = true;
    }
    if (
      /visibilityRegistry/.test(src) ||
      /VisibilityRegistryApi/.test(src) ||
      /createVisibilityRegistry/.test(src)
    ) {
      importsRegistryRuntime = true;
    }
    if (
      /resolveTooltipContent/.test(src) ||
      /resolveShortcutHint/.test(src) ||
      /resolveCommandDescription/.test(src) ||
      /resolveContextHelp/.test(src)
    ) {
      hasIndividualResolve = true;
    }
  }

  assertCase(
    block,
    "consume.discoverability",
    importsDiscoverability,
    "Consumes discoverability via fence-safe import()",
  );

  assertCase(
    block,
    "consume.noDiagnostics",
    !importsDiagnostics,
    "Does not consume visibility-diagnostics for render",
  );

  assertCase(
    block,
    "consume.noRegistry",
    !importsRegistryRuntime,
    "Does not consult Visibility registry runtime APIs",
  );

  assertCase(
    block,
    "consume.noIndividualResolve",
    !hasIndividualResolve,
    "Does not call individual projection resolve*",
  );

  const querySrc = existsSync(join(repoRoot, VI_QUERY))
    ? stripComments(read(VI_QUERY))
    : "";
  assertCase(
    block,
    "consume.pipelineOnlyEntry",
    /pipeline\.resolve/.test(querySrc) &&
      /pipeline\.resolveByCommandId/.test(querySrc) &&
      !/getAll\s*\(/.test(querySrc) &&
      !/\.get\s*\(/.test(querySrc),
    "Query adapter uses Pipeline entry only",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — representationOnly                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "representationOnly";

  const viAll = walkFiles(join(repoRoot, VI_DIR))
    .map((f) => stripComments(readFileSync(f, "utf8")))
    .join("\n");

  assertCase(
    block,
    "repr.noRegister",
    !/\.register\s*\(/.test(viAll) && !/\bregister\s*\(/.test(viAll),
    "No register() in visual-integration",
  );

  assertCase(
    block,
    "repr.noClear",
    !/\.clear\s*\(/.test(viAll) && !/\bclear\s*\(/.test(viAll),
    "No clear() in visual-integration",
  );

  assertCase(
    block,
    "repr.noCreateFactories",
    !/createVisibilityDefinition/.test(viAll) &&
      !/createTooltipContent/.test(viAll) &&
      !/createShortcutHint/.test(viAll) &&
      !/createCommandDescription/.test(viAll) &&
      !/createContextHelp/.test(viAll) &&
      !/createDiscoverabilityPipeline/.test(viAll),
    "No create* factories / Pipeline factory in visual-integration",
  );

  assertCase(
    block,
    "repr.noProductWireImports",
    !/from\s+["'][^"']*toolbar/.test(viAll) &&
      !/from\s+["'][^"']*\/menus\b/.test(viAll) &&
      !/from\s+["'][^"']*context-menus/.test(viAll) &&
      !/AppShell/.test(viAll) &&
      !/CommandExecutionPipeline/.test(viAll),
    "No Toolbar/Menus/Context Menus/AppShell/CEP imports",
  );

  assertCase(
    block,
    "repr.noPurityViolations",
    !/\buseState\s*\(/.test(viAll) &&
      !/\buseEffect\s*\(/.test(viAll) &&
      !/\buseMemo\s*\(/.test(viAll) &&
      !/\buseCallback\s*\(/.test(viAll),
    "Representation only: no Discoverability state/cache hooks",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — barrelExport                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "barrelExport";

  const indexSrc = existsSync(join(repoRoot, VI_INDEX))
    ? stripComments(read(VI_INDEX))
    : "";

  assertCase(
    block,
    "barrel.types",
    /PipelineInject/.test(indexSrc) && /SnapshotInject/.test(indexSrc),
    "Barrel reexports inject types",
  );

  assertCase(
    block,
    "barrel.query",
    /queryDiscSnapshot/.test(indexSrc) &&
      /queryDiscSnapshotByCommandId/.test(indexSrc),
    "Barrel reexports query adapter",
  );

  assertCase(
    block,
    "barrel.views",
    /TooltipContentView/.test(indexSrc) &&
      /ShortcutHintView/.test(indexSrc) &&
      /ContextHelpView/.test(indexSrc) &&
      /CommandDescriptionView/.test(indexSrc) &&
      /DiscoverabilityView/.test(indexSrc),
    "Barrel reexports all presentational views",
  );

  const uiIndex = existsSync(join(repoRoot, UI_INDEX))
    ? stripComments(read(UI_INDEX))
    : "";
  assertCase(
    block,
    "barrel.noPublicUiExpansion",
    !/\bvisual-integration\b/.test(uiIndex) &&
      !/TooltipContentView/.test(uiIndex) &&
      !/DiscoverabilityView/.test(uiIndex) &&
      !/queryDiscSnapshot/.test(uiIndex),
    "src/ui/index.ts does not export visual-integration",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — priorFreezeIntact                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "priorFreezeIntact";

  assertCase(
    block,
    "prior.modulesExist",
    existsSync(join(repoRoot, VISIBILITY_DIR)) &&
      existsSync(join(repoRoot, TOOLTIPS_DIR)) &&
      existsSync(join(repoRoot, HINTS_DIR)) &&
      existsSync(join(repoRoot, DESC_DIR)) &&
      existsSync(join(repoRoot, HELP_DIR)) &&
      existsSync(join(repoRoot, DISC_DIR)) &&
      existsSync(join(repoRoot, DIAG_DIR)),
    "UX-7.1–7.7 modules still exist",
  );

  const registrySrc = existsSync(join(repoRoot, VISIBILITY_REGISTRY))
    ? stripComments(read(VISIBILITY_REGISTRY))
    : "";
  const apiBody = extractInterfaceBody(registrySrc, "VisibilityRegistryApi");
  const methodNames = [
    ...apiBody.matchAll(/^\s*(\w+)\s*\(/gm),
  ].map((m) => m[1]);
  let hasExtraMethods = false;
  for (const re of FORBIDDEN_EXTRA_METHODS) {
    if (re.test(apiBody)) hasExtraMethods = true;
  }
  const unexpected = methodNames.filter(
    (n) => !["register", "get", "getAll", "clear"].includes(n),
  );
  if (unexpected.length > 0) hasExtraMethods = true;

  assertCase(
    block,
    "registry.freezeMethods",
    !hasExtraMethods &&
      methodNames.includes("register") &&
      methodNames.includes("get") &&
      methodNames.includes("getAll") &&
      methodNames.includes("clear"),
    "VisibilityRegistryApi still has only register/get/getAll/clear",
  );

  const defSrc = existsSync(join(repoRoot, VISIBILITY_DEFINITION))
    ? stripComments(read(VISIBILITY_DEFINITION))
    : "";
  const defBody = extractReadonlyTypeBody(defSrc, "VisibilityDefinition");
  assertCase(
    block,
    "definition.fiveFields",
    /readonly\s+id\s*:\s*VisibilityId/.test(defBody) &&
      /readonly\s+title\s*:\s*string/.test(defBody) &&
      /readonly\s+description\s*:\s*string/.test(defBody) &&
      /readonly\s+shortcut\s*:\s*string/.test(defBody) &&
      /readonly\s+category\s*:\s*string/.test(defBody),
    "VisibilityDefinition still has 5 fields",
  );

  const tooltipSrc = existsSync(join(repoRoot, TOOLTIP_CONTENT))
    ? stripComments(read(TOOLTIP_CONTENT))
    : "";
  const tooltipBody = extractReadonlyTypeBody(tooltipSrc, "TooltipContent");
  assertCase(
    block,
    "tooltip.fourFields",
    /readonly\s+id\s*:\s*VisibilityId/.test(tooltipBody) &&
      /readonly\s+title\s*:\s*string/.test(tooltipBody) &&
      /readonly\s+description\s*:\s*string/.test(tooltipBody) &&
      /readonly\s+shortcut\s*:\s*string/.test(tooltipBody) &&
      !/\bcategory\b/.test(tooltipBody),
    "TooltipContent still has 4 fields",
  );

  const hintSrc = existsSync(join(repoRoot, HINT_CONTENT))
    ? stripComments(read(HINT_CONTENT))
    : "";
  const hintBody = extractReadonlyTypeBody(hintSrc, "ShortcutHint");
  assertCase(
    block,
    "hint.threeFields",
    /readonly\s+id\s*:\s*VisibilityId/.test(hintBody) &&
      /readonly\s+title\s*:\s*string/.test(hintBody) &&
      /readonly\s+shortcut\s*:\s*string/.test(hintBody) &&
      !/\bdescription\b/.test(hintBody) &&
      !/\bcategory\b/.test(hintBody),
    "ShortcutHint still has 3 fields",
  );

  const descSrc = existsSync(join(repoRoot, DESC_CONTENT))
    ? stripComments(read(DESC_CONTENT))
    : "";
  const descBody = extractReadonlyTypeBody(descSrc, "CommandDescription");
  assertCase(
    block,
    "commandDescription.fiveFields",
    /readonly\s+id\s*:\s*CommandId/.test(descBody) &&
      /readonly\s+title\s*:\s*string/.test(descBody) &&
      /readonly\s+description\s*:\s*string/.test(descBody) &&
      /readonly\s+shortcut\s*:\s*string/.test(descBody) &&
      /readonly\s+category\s*:\s*string/.test(descBody),
    "CommandDescription still has 5 fields with CommandId",
  );

  const helpSrc = existsSync(join(repoRoot, HELP_CONTENT))
    ? stripComments(read(HELP_CONTENT))
    : "";
  const helpBody = extractReadonlyTypeBody(helpSrc, "ContextHelp");
  assertCase(
    block,
    "contextHelp.fourFields",
    /readonly\s+id\s*:\s*VisibilityId/.test(helpBody) &&
      /readonly\s+title\s*:\s*string/.test(helpBody) &&
      /readonly\s+description\s*:\s*string/.test(helpBody) &&
      /readonly\s+category\s*:\s*string/.test(helpBody) &&
      !/\bshortcut\b/.test(helpBody),
    "ContextHelp still has 4 fields without shortcut",
  );

  const snapSrc = existsSync(join(repoRoot, DISC_SNAPSHOT))
    ? stripComments(read(DISC_SNAPSHOT))
    : "";
  const snapBody = extractReadonlyTypeBody(snapSrc, "DiscoverabilitySnapshot");
  assertCase(
    block,
    "snapshot.fourSlots",
    /tooltip\s*:\s*TooltipContent\s*\|\s*undefined/.test(snapBody) &&
      /shortcutHint\s*:\s*ShortcutHint\s*\|\s*undefined/.test(snapBody) &&
      /commandDescription\s*:\s*CommandDescription\s*\|\s*undefined/.test(
        snapBody,
      ) &&
      /contextHelp\s*:\s*ContextHelp\s*\|\s*undefined/.test(snapBody),
    "DiscoverabilitySnapshot still has 4 slots",
  );

  const pipeSrc = existsSync(join(repoRoot, DISC_PIPELINE))
    ? stripComments(read(DISC_PIPELINE))
    : "";
  assertCase(
    block,
    "pipeline.apiFreeze",
    /resolve\s*\(\s*id\s*:\s*VisibilityId\s*\)\s*:\s*DiscoverabilitySnapshot/.test(
      pipeSrc,
    ) &&
      /resolveByCommandId\s*\(\s*commandId\s*:\s*CommandId\s*\)\s*:\s*DiscoverabilitySnapshot/.test(
        pipeSrc,
      ) &&
      /export\s+function\s+createDiscoverabilityPipeline\s*\(/.test(pipeSrc),
    "DiscoverabilityPipeline API Freeze intact",
  );

  assertCase(
    block,
    "prior.validatorsExist",
    existsSync(join(repoRoot, "scripts/validate-ux-7.1.ts")) &&
      existsSync(join(repoRoot, "scripts/validate-ux-7.2.ts")) &&
      existsSync(join(repoRoot, "scripts/validate-ux-7.3.ts")) &&
      existsSync(join(repoRoot, "scripts/validate-ux-7.4.ts")) &&
      existsSync(join(repoRoot, "scripts/validate-ux-7.5.ts")) &&
      existsSync(join(repoRoot, "scripts/validate-ux-7.6.ts")) &&
      existsSync(join(repoRoot, "scripts/validate-ux-7.7.ts")),
    "Historical validators UX-7.1–7.7 still exist",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — freezeFences                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "freezeFences";

  const infraDirs = [
    VISIBILITY_DIR,
    TOOLTIPS_DIR,
    HINTS_DIR,
    DESC_DIR,
    HELP_DIR,
    DISC_DIR,
    DIAG_DIR,
  ];

  let infraHasReact = false;
  for (const dir of infraDirs) {
    for (const full of walkFiles(join(repoRoot, dir))) {
      const src = stripComments(readFileSync(full, "utf8"));
      if (
        /from\s+["']react["']/.test(src) ||
        /from\s+["']react-dom["']/.test(src) ||
        /require\s*\(\s*["']react["']\s*\)/.test(src)
      ) {
        infraHasReact = true;
      }
    }
  }

  assertCase(
    block,
    "fence.infraReactFree",
    !infraHasReact,
    "UX-7.1–7.7 infrastructure remains React-free",
  );

  const viAll = walkFiles(join(repoRoot, VI_DIR))
    .map((f) => stripComments(readFileSync(f, "utf8")))
    .join("\n");

  assertCase(
    block,
    "fence.noToolbarMenus",
    !/from\s+["'][^"']*toolbar/.test(viAll) &&
      !/from\s+["'][^"']*\/menus\b/.test(viAll) &&
      !/from\s+["'][^"']*context-menus/.test(viAll),
    "No Toolbar/Menus/Context Menus under visual-integration/",
  );

  assertCase(
    block,
    "fence.noAppShell",
    !/AppShell/.test(viAll),
    "No AppShell under visual-integration/",
  );

  assertCase(
    block,
    "fence.noCep",
    !/CommandExecutionPipeline/.test(viAll) && !/\bDispatcher\b/.test(viAll),
    "No CEP/Dispatcher under visual-integration/",
  );

  assertCase(
    block,
    "fence.noUx6Diagnostics",
    !/from\s+["'][^"']*\/diagnostics\b/.test(viAll),
    "No coupling to src/ui/diagnostics/ (UX-6.9)",
  );

  assertCase(
    block,
    "fence.noVisibilityDiagnostics",
    !/visibility-diagnostics/.test(viAll),
    "No visibility-diagnostics under visual-integration/",
  );

  assertCase(
    block,
    "fence.noShortcutsExecution",
    !/from\s+["']\.\.\/shortcuts\b/.test(viAll),
    "No import from src/ui/shortcuts/ under visual-integration/",
  );

  const uiIndex = existsSync(join(repoRoot, UI_INDEX))
    ? stripComments(read(UI_INDEX))
    : "";
  assertCase(
    block,
    "fence.publicBarrelIntact",
    !/\bvisual-integration\b/.test(uiIndex) &&
      !/\bvisibility-diagnostics\b/.test(uiIndex) &&
      !/\bdiscoverability\b/.test(uiIndex) &&
      !/\bcontext-help\b/.test(uiIndex) &&
      !/\bcommand-descriptions\b/.test(uiIndex) &&
      !/\bshortcut-hints\b/.test(uiIndex) &&
      !/\btooltips\b/.test(uiIndex) &&
      !/\bvisibility\b/.test(uiIndex),
    "src/ui/index.ts does not export UX-7 modules",
  );

  assertCase(
    block,
    "fence.shortcutsExecutionIntact",
    existsSync(join(repoRoot, SHORTCUTS_DIR)),
    "src/ui/shortcuts/ (execution) still exists untouched",
  );

  assertCase(
    block,
    "fence.commandsIntact",
    existsSync(join(repoRoot, COMMANDS_DIR)),
    "src/ui/commands/ still exists untouched",
  );

  assertCase(
    block,
    "fence.uxDiagnosticsIntact",
    existsSync(join(repoRoot, UX_DIAGNOSTICS_DIR)),
    "src/ui/diagnostics/ (UX-6.9) still exists untouched",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 10 — dependencyFence                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "dependencyFence";

  const viFiles = walkFiles(join(repoRoot, VI_DIR));
  let importsDiscoverability = false;
  let importsReact = false;
  let importsTypeOnlyProjections = false;
  let importsForbidden = false;

  for (const full of viFiles) {
    const src = stripComments(readFileSync(full, "utf8"));
    if (
      /from\s+["']\.\.\/discoverability\b/.test(src) ||
      /import\s*\(\s*["']\.\.\/discoverability["']\s*\)/.test(src)
    ) {
      importsDiscoverability = true;
    }
    if (/from\s+["']react["']/.test(src) || /from\s+["']react\/.+["']/.test(src)) {
      importsReact = true;
    }
    if (
      /from\s+["']\.\.\/tooltips\/TooltipContent["']/.test(src) ||
      /from\s+["']\.\.\/shortcut-hints\/ShortcutHint["']/.test(src) ||
      /from\s+["']\.\.\/command-descriptions\/CommandDescription["']/.test(
        src,
      ) ||
      /from\s+["']\.\.\/context-help\/ContextHelp["']/.test(src)
    ) {
      importsTypeOnlyProjections = true;
    }
    if (
      /from\s+["']\.\.\/visibility-diagnostics\b/.test(src) ||
      /from\s+["']\.\.\/toolbar\b/.test(src) ||
      /from\s+["']\.\.\/menus\b/.test(src) ||
      /from\s+["']\.\.\/context-menus\b/.test(src) ||
      /from\s+["']\.\.\/shortcuts\b/.test(src) ||
      /from\s+["']\.\.\/diagnostics\b/.test(src) ||
      /from\s+["']@\/ui["']/.test(src)
    ) {
      importsForbidden = true;
    }
  }

  assertCase(
    block,
    "dep.discoverability",
    importsDiscoverability,
    "visual-integration depends on discoverability (fence-safe)",
  );

  assertCase(
    block,
    "dep.react",
    importsReact,
    "visual-integration depends on react (presentational)",
  );

  assertCase(
    block,
    "dep.typeOnlyProjections",
    importsTypeOnlyProjections,
    "visual-integration uses type-only projection imports",
  );

  assertCase(
    block,
    "dep.noForbidden",
    !importsForbidden,
    "visual-integration has no forbidden module imports",
  );

  function moduleImportsVisualIntegration(dirRel: string): boolean {
    for (const full of walkFiles(join(repoRoot, dirRel))) {
      const src = stripComments(readFileSync(full, "utf8"));
      if (
        /from\s+["']\.\.\/visual-integration\b/.test(src) ||
        /from\s+["']\.\.\/visual-integration\//.test(src) ||
        /from\s+["']@\/ui\/visual-integration\b/.test(src) ||
        /queryDiscSnapshot/.test(src) ||
        /TooltipContentView/.test(src) ||
        /DiscoverabilityView/.test(src)
      ) {
        return true;
      }
    }
    return false;
  }

  assertCase(
    block,
    "dep.visibilityNoVi",
    !moduleImportsVisualIntegration(VISIBILITY_DIR),
    "visibility does not import visual-integration",
  );
  assertCase(
    block,
    "dep.tooltipsNoVi",
    !moduleImportsVisualIntegration(TOOLTIPS_DIR),
    "tooltips does not import visual-integration",
  );
  assertCase(
    block,
    "dep.hintsNoVi",
    !moduleImportsVisualIntegration(HINTS_DIR),
    "shortcut-hints does not import visual-integration",
  );
  assertCase(
    block,
    "dep.descNoVi",
    !moduleImportsVisualIntegration(DESC_DIR),
    "command-descriptions does not import visual-integration",
  );
  assertCase(
    block,
    "dep.helpNoVi",
    !moduleImportsVisualIntegration(HELP_DIR),
    "context-help does not import visual-integration",
  );
  assertCase(
    block,
    "dep.discNoVi",
    !moduleImportsVisualIntegration(DISC_DIR),
    "discoverability does not import visual-integration",
  );
  assertCase(
    block,
    "dep.diagNoVi",
    !moduleImportsVisualIntegration(DIAG_DIR),
    "visibility-diagnostics does not import visual-integration",
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const BLOCKS: { id: BlockId; ca: string }[] = [
  { id: "documentationExists", ca: "CA-UX-7.8.1" },
  { id: "moduleExists", ca: "CA-UX-7.8.2" },
  { id: "visualIntegrationFreeze", ca: "CA-UX-7.8.3" },
  { id: "renderingRulesContract", ca: "CA-UX-7.8.4" },
  { id: "consumptionRulesContract", ca: "CA-UX-7.8.5" },
  { id: "representationOnly", ca: "CA-UX-7.8.6" },
  { id: "barrelExport", ca: "CA-UX-7.8.7" },
  { id: "priorFreezeIntact", ca: "CA-UX-7.8.8" },
  { id: "freezeFences", ca: "CA-UX-7.8.9" },
  { id: "dependencyFence", ca: "CA-UX-7.8.10" },
];

let failedBlocks = 0;
for (const { id, ca } of BLOCKS) {
  const cases = results.filter((r) => r.block === id);
  const failed = cases.filter((r) => !r.pass);
  const pass = failed.length === 0 && cases.length > 0;
  if (!pass) failedBlocks += 1;
  const status = pass ? "PASS" : "FAIL";
  console.log(
    `${status} ${ca} (${id}) — ${cases.length - failed.length}/${cases.length}`,
  );
  for (const f of failed) {
    console.log(`  ✗ ${f.id}: ${f.detail}`);
  }
}

const totalPass = failedBlocks === 0;
console.log("");
console.log(
  totalPass
    ? "validate:ux-7.8 → PASS 10/10"
    : `validate:ux-7.8 → FAIL ${10 - failedBlocks}/10`,
);
process.exit(totalPass ? 0 : 1);
