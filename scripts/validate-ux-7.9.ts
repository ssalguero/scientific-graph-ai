/**
 * UX-7.9 — Final Audit gate.
 *
 * Blocks:
 * roadmapComplete · documentationSeries · architectureFreeze
 * apiFreeze · projectionFreeze · pipelineFreeze · diagnosticsFreeze
 * visualIntegrationFreeze · dependencyFreeze · historicalValidatorsIntact
 *
 * Architectural principles:
 * - Audit Freeze · Audit Independence Freeze
 * - Evidence Freeze · Audit Determinism Freeze
 * - Evidence Reuse Only — read artifacts; never execute UI/Pipeline/Diagnostics
 * - No nested validate:ux-7.* (Windows hang)
 * - Deterministic: same artifacts → same PASS/FAIL (no Date/env/runtime)
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "roadmapComplete"
  | "documentationSeries"
  | "architectureFreeze"
  | "apiFreeze"
  | "projectionFreeze"
  | "pipelineFreeze"
  | "diagnosticsFreeze"
  | "visualIntegrationFreeze"
  | "dependencyFreeze"
  | "historicalValidatorsIntact";

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

/* -------------------------------------------------------------------------- */
/* Paths                                                                      */
/* -------------------------------------------------------------------------- */

const ROADMAP_7 = "docs/UX/UX-7.0-roadmap.md";
const DOC_7_9 = "docs/UX/UX-7.9.md";
const PACKAGE_JSON = "package.json";
const UI_INDEX = "src/ui/index.ts";

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
const DIAG_FILE = `${DIAG_DIR}/VisibilityDiagnostics.ts`;
const DIAG_INDEX = `${DIAG_DIR}/index.ts`;

const VI_DIR = "src/ui/visual-integration";
const VI_TYPES = `${VI_DIR}/VisualIntegrationTypes.ts`;
const VI_QUERY = `${VI_DIR}/queryDiscSnapshot.ts`;
const VI_TOOLTIP = `${VI_DIR}/TooltipContentView.tsx`;
const VI_HINT = `${VI_DIR}/ShortcutHintView.tsx`;
const VI_HELP = `${VI_DIR}/ContextHelpView.tsx`;
const VI_DESC = `${VI_DIR}/CommandDescriptionView.tsx`;
const VI_COMPOSITE = `${VI_DIR}/DiscoverabilityView.tsx`;
const VI_INDEX = `${VI_DIR}/index.ts`;

const VI_MODULE_FILES = [
  VI_TYPES,
  VI_QUERY,
  VI_TOOLTIP,
  VI_HINT,
  VI_HELP,
  VI_DESC,
  VI_COMPOSITE,
  VI_INDEX,
] as const;

const SERIES_DOCS = [
  "docs/UX/UX-7.1.md",
  "docs/UX/UX-7.2.md",
  "docs/UX/UX-7.3.md",
  "docs/UX/UX-7.4.md",
  "docs/UX/UX-7.5.md",
  "docs/UX/UX-7.6.md",
  "docs/UX/UX-7.7.md",
  "docs/UX/UX-7.8.md",
] as const;

const HISTORICAL_VALIDATORS = [
  "scripts/validate-ux-7.1.ts",
  "scripts/validate-ux-7.2.ts",
  "scripts/validate-ux-7.3.ts",
  "scripts/validate-ux-7.4.ts",
  "scripts/validate-ux-7.5.ts",
  "scripts/validate-ux-7.6.ts",
  "scripts/validate-ux-7.7.ts",
  "scripts/validate-ux-7.8.ts",
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

/* -------------------------------------------------------------------------- */
/* PASS 01 — roadmapComplete                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "roadmapComplete";

  assertCase(
    block,
    "exists.roadmap",
    existsSync(join(repoRoot, ROADMAP_7)),
    `${ROADMAP_7} exists`,
  );

  const roadmap = existsSync(join(repoRoot, ROADMAP_7)) ? read(ROADMAP_7) : "";

  for (const n of [1, 2, 3, 4, 5, 6, 7, 8] as const) {
    assertCase(
      block,
      `roadmap.complete.7.${n}`,
      new RegExp(`UX-7\\.${n}\\s*=\\s*COMPLETE`).test(roadmap),
      `Roadmap declares UX-7.${n} = COMPLETE`,
    );
  }

  assertCase(
    block,
    "roadmap.ux79Present",
    /UX-7\.9/.test(roadmap) && /Final Audit/i.test(roadmap),
    "Roadmap documents UX-7.9 Final Audit",
  );

  assertCase(
    block,
    "roadmap.table.7.9",
    /UX-7\.9\s*\|\s*Final Audit/i.test(roadmap),
    "Roadmap microphase table includes UX-7.9 Final Audit",
  );

  assertCase(
    block,
    "roadmap.historicalGates",
    /validate:ux-7\.1/.test(roadmap) &&
      /validate:ux-7\.8/.test(roadmap) &&
      /Historical gates/i.test(roadmap),
    "Roadmap lists historical gates through UX-7.8",
  );

  const pkg = existsSync(join(repoRoot, PACKAGE_JSON))
    ? read(PACKAGE_JSON)
    : "";
  assertCase(
    block,
    "exists.npmScript",
    /"validate:ux-7\.9"\s*:/.test(pkg),
    "package.json has validate:ux-7.9",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — documentationSeries                                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "documentationSeries";

  for (const rel of SERIES_DOCS) {
    assertCase(
      block,
      `exists.${rel.split("/").pop()}`,
      existsSync(join(repoRoot, rel)),
      `${rel} exists`,
    );
  }

  assertCase(
    block,
    "exists.doc79",
    existsSync(join(repoRoot, DOC_7_9)),
    `${DOC_7_9} exists`,
  );

  const doc1 = existsSync(join(repoRoot, "docs/UX/UX-7.1.md"))
    ? read("docs/UX/UX-7.1.md")
    : "";
  assertCase(
    block,
    "doc.registryFreeze",
    /Registry Freeze/i.test(doc1),
    "UX-7.1.md documents Registry Freeze",
  );

  const doc2 = existsSync(join(repoRoot, "docs/UX/UX-7.2.md"))
    ? read("docs/UX/UX-7.2.md")
    : "";
  assertCase(
    block,
    "doc.projectionFreeze",
    /Projection Freeze/i.test(doc2),
    "UX-7.2.md documents Projection Freeze",
  );

  const doc6 = existsSync(join(repoRoot, "docs/UX/UX-7.6.md"))
    ? read("docs/UX/UX-7.6.md")
    : "";
  assertCase(
    block,
    "doc.pipelineFreeze",
    /Pipeline Freeze/i.test(doc6) && /Slot Independence/i.test(doc6),
    "UX-7.6.md documents Pipeline Freeze + Slot Independence",
  );

  const doc7 = existsSync(join(repoRoot, "docs/UX/UX-7.7.md"))
    ? read("docs/UX/UX-7.7.md")
    : "";
  assertCase(
    block,
    "doc.diagnosticsFreeze",
    /Diagnostics Freeze/i.test(doc7) && /Coverage Freeze/i.test(doc7),
    "UX-7.7.md documents Diagnostics Freeze",
  );

  const doc8 = existsSync(join(repoRoot, "docs/UX/UX-7.8.md"))
    ? read("docs/UX/UX-7.8.md")
    : "";
  assertCase(
    block,
    "doc.visualIntegrationFreeze",
    /Visual Integration Freeze/i.test(doc8),
    "UX-7.8.md documents Visual Integration Freeze",
  );

  const doc9 = existsSync(join(repoRoot, DOC_7_9)) ? read(DOC_7_9) : "";
  assertCase(
    block,
    "doc.auditFreeze",
    /Audit Freeze/i.test(doc9) && /Única responsabilidad = verificar/i.test(doc9),
    "UX-7.9.md documents Audit Freeze",
  );
  assertCase(
    block,
    "doc.auditIndependenceFreeze",
    /Audit Independence Freeze/i.test(doc9) &&
      /consume evidencia/i.test(doc9) &&
      /Nunca ejecuta/i.test(doc9),
    "UX-7.9.md documents Audit Independence Freeze",
  );
  assertCase(
    block,
    "doc.evidenceFreeze",
    /Evidence Freeze/i.test(doc9) &&
      /artefactos existentes/i.test(doc9) &&
      /no genera evidencia nueva/i.test(doc9) &&
      /No sintetiza contratos/i.test(doc9) &&
      /No produce snapshots/i.test(doc9),
    "UX-7.9.md documents Evidence Freeze",
  );
  assertCase(
    block,
    "doc.auditDeterminismFreeze",
    /Audit Determinism Freeze/i.test(doc9) &&
      /mismos artefactos/i.test(doc9) &&
      /PASS\/FAIL/i.test(doc9) &&
      /Sin dependencia de/i.test(doc9),
    "UX-7.9.md documents Audit Determinism Freeze",
  );
  assertCase(
    block,
    "doc.prep710",
    /UX-7\.10/i.test(doc9) && /Release Certification/i.test(doc9),
    "UX-7.9.md prepares for UX-7.10 Release Certification",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — architectureFreeze                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "architectureFreeze";

  const dirs = [
    VISIBILITY_DIR,
    TOOLTIPS_DIR,
    HINTS_DIR,
    DESC_DIR,
    HELP_DIR,
    DISC_DIR,
    DIAG_DIR,
    VI_DIR,
  ];
  for (const dir of dirs) {
    assertCase(
      block,
      `dir.${dir.split("/").pop()}`,
      existsSync(join(repoRoot, dir)),
      `${dir}/ exists`,
    );
  }

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
    "infra.reactFree",
    !infraHasReact,
    "UX-7.1–7.7 infrastructure remains React-free",
  );

  const uiIndex = existsSync(join(repoRoot, UI_INDEX))
    ? stripComments(read(UI_INDEX))
    : "";
  assertCase(
    block,
    "publicBarrelIntact",
    !/\bvisibility\b/.test(uiIndex) &&
      !/\btooltips\b/.test(uiIndex) &&
      !/\bshortcut-hints\b/.test(uiIndex) &&
      !/\bcommand-descriptions\b/.test(uiIndex) &&
      !/\bcontext-help\b/.test(uiIndex) &&
      !/\bdiscoverability\b/.test(uiIndex) &&
      !/\bvisibility-diagnostics\b/.test(uiIndex) &&
      !/\bvisual-integration\b/.test(uiIndex),
    "src/ui/index.ts does not export UX-7 modules",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — apiFreeze                                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "apiFreeze";

  const registrySrc = existsSync(join(repoRoot, VISIBILITY_REGISTRY))
    ? stripComments(read(VISIBILITY_REGISTRY))
    : "";
  const apiBody = extractInterfaceBody(registrySrc, "VisibilityRegistryApi");
  const methodNames = [...apiBody.matchAll(/^\s*(\w+)\s*\(/gm)].map(
    (m) => m[1],
  );
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
    "registry.fourMethods",
    !hasExtraMethods &&
      methodNames.includes("register") &&
      methodNames.includes("get") &&
      methodNames.includes("getAll") &&
      methodNames.includes("clear"),
    "VisibilityRegistryApi = register/get/getAll/clear ONLY",
  );

  const pipeSrc = existsSync(join(repoRoot, DISC_PIPELINE))
    ? stripComments(read(DISC_PIPELINE))
    : "";
  assertCase(
    block,
    "pipeline.twoMethods",
    /resolve\s*\(\s*id\s*:\s*VisibilityId\s*\)\s*:\s*DiscoverabilitySnapshot/.test(
      pipeSrc,
    ) &&
      /resolveByCommandId\s*\(\s*commandId\s*:\s*CommandId\s*\)\s*:\s*DiscoverabilitySnapshot/.test(
        pipeSrc,
      ) &&
      /export\s+function\s+createDiscoverabilityPipeline\s*\(/.test(pipeSrc),
    "DiscoverabilityPipeline API = resolve + resolveByCommandId",
  );

  const diagSrc = existsSync(join(repoRoot, DIAG_FILE))
    ? stripComments(read(DIAG_FILE))
    : "";
  assertCase(
    block,
    "diagnostics.factoryOnly",
    /export\s+function\s+createVisibilityDiagnosticsReport\s*\(/.test(diagSrc) &&
      !/export\s+function\s+createVisibilityDiagnostics(?!Report)/.test(
        diagSrc,
      ),
    "Diagnostics API = createVisibilityDiagnosticsReport ONLY",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — projectionFreeze                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "projectionFreeze";

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
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — pipelineFreeze                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "pipelineFreeze";

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
  const pipeTypeBody = extractReadonlyTypeBody(
    pipeSrc,
    "DiscoverabilityPipeline",
  );
  assertCase(
    block,
    "pipeline.apiSurface",
    /resolve\s*\(/.test(pipeTypeBody) &&
      /resolveByCommandId\s*\(/.test(pipeTypeBody) &&
      !/\bregister\s*\(/.test(pipeTypeBody) &&
      !/\bclear\s*\(/.test(pipeTypeBody),
    "Pipeline type surface = resolve + resolveByCommandId only",
  );

  const doc6 = existsSync(join(repoRoot, "docs/UX/UX-7.6.md"))
    ? read("docs/UX/UX-7.6.md")
    : "";
  assertCase(
    block,
    "doc.pipelineAndSlot",
    /Pipeline Freeze/i.test(doc6) && /Slot Independence/i.test(doc6),
    "UX-7.6.md retains Pipeline Freeze + Slot Independence markers",
  );

  assertCase(
    block,
    "pipeline.factoryPresent",
    /export\s+function\s+createDiscoverabilityPipeline\s*\(/.test(pipeSrc),
    "createDiscoverabilityPipeline factory present",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — diagnosticsFreeze                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "diagnosticsFreeze";

  assertCase(
    block,
    "diag.moduleExists",
    existsSync(join(repoRoot, DIAG_DIR)) &&
      existsSync(join(repoRoot, DIAG_FILE)) &&
      existsSync(join(repoRoot, DIAG_INDEX)),
    "visibility-diagnostics module files exist",
  );

  const diagSrc = existsSync(join(repoRoot, DIAG_FILE))
    ? stripComments(read(DIAG_FILE))
    : "";
  assertCase(
    block,
    "diag.reportType",
    /export\s+type\s+VisibilityDiagnosticsReport\s*=/.test(diagSrc) &&
      /pipelineReady\s*:\s*boolean/.test(diagSrc),
    "VisibilityDiagnosticsReport type present",
  );

  assertCase(
    block,
    "diag.factoryOnly",
    /export\s+function\s+createVisibilityDiagnosticsReport\s*\(/.test(diagSrc),
    "createVisibilityDiagnosticsReport factory present",
  );

  const doc7 = existsSync(join(repoRoot, "docs/UX/UX-7.7.md"))
    ? read("docs/UX/UX-7.7.md")
    : "";
  assertCase(
    block,
    "doc.coverageDeterminism",
    /Coverage Freeze/i.test(doc7) && /Determinism Freeze/i.test(doc7),
    "UX-7.7.md retains Coverage + Determinism Freeze markers",
  );

  assertCase(
    block,
    "diag.noUx6DiagnosticsImport",
    !/from\s+["'][^"']*\/diagnostics\b/.test(diagSrc),
    "visibility-diagnostics does not import UX-6.9 diagnostics",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — visualIntegrationFreeze                                          */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "visualIntegrationFreeze";

  assertCase(
    block,
    "vi.dirExists",
    existsSync(join(repoRoot, VI_DIR)),
    `${VI_DIR}/ exists`,
  );

  for (const rel of VI_MODULE_FILES) {
    assertCase(
      block,
      `vi.file.${rel.split("/").pop()}`,
      existsSync(join(repoRoot, rel)),
      `${rel} exists`,
    );
  }

  const doc8 = existsSync(join(repoRoot, "docs/UX/UX-7.8.md"))
    ? read("docs/UX/UX-7.8.md")
    : "";
  assertCase(
    block,
    "doc.viFreezes",
    /Visual Integration Freeze/i.test(doc8) &&
      /Rendering Ownership Freeze/i.test(doc8) &&
      /Component Purity Freeze/i.test(doc8) &&
      /Snapshot Lifetime Freeze/i.test(doc8),
    "UX-7.8.md documents VI freezes",
  );

  const querySrc = existsSync(join(repoRoot, VI_QUERY))
    ? stripComments(read(VI_QUERY))
    : "";
  assertCase(
    block,
    "vi.queryAdapter",
    /pipeline\.resolve\s*\(/.test(querySrc) &&
      /pipeline\.resolveByCommandId\s*\(/.test(querySrc),
    "queryDiscSnapshot uses Pipeline resolve APIs",
  );

  const indexSrc = existsSync(join(repoRoot, VI_INDEX))
    ? stripComments(read(VI_INDEX))
    : "";
  assertCase(
    block,
    "vi.localBarrel",
    /TooltipContentView/.test(indexSrc) &&
      /DiscoverabilityView/.test(indexSrc) &&
      /queryDiscSnapshot/.test(indexSrc),
    "visual-integration local barrel present",
  );

  const viAll = walkFiles(join(repoRoot, VI_DIR))
    .map((f) => stripComments(readFileSync(f, "utf8")))
    .join("\n");
  assertCase(
    block,
    "vi.noProductWire",
    !/from\s+["'][^"']*toolbar/.test(viAll) &&
      !/from\s+["'][^"']*\/menus\b/.test(viAll) &&
      !/from\s+["'][^"']*context-menus/.test(viAll) &&
      !/AppShell/.test(viAll) &&
      !/CommandExecutionPipeline/.test(viAll),
    "visual-integration has no product wire",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — dependencyFreeze                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "dependencyFreeze";

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
    if (
      /from\s+["']react["']/.test(src) ||
      /from\s+["']react\/.+["']/.test(src)
    ) {
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
    "dep.viDiscoverability",
    importsDiscoverability,
    "visual-integration depends on discoverability",
  );
  assertCase(
    block,
    "dep.viReact",
    importsReact,
    "visual-integration depends on react (presentational)",
  );
  assertCase(
    block,
    "dep.viTypeOnlyProjections",
    importsTypeOnlyProjections,
    "visual-integration uses type-only projection imports",
  );
  assertCase(
    block,
    "dep.viNoForbidden",
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
/* PASS 10 — historicalValidatorsIntact                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "historicalValidatorsIntact";

  const pkg = existsSync(join(repoRoot, PACKAGE_JSON))
    ? read(PACKAGE_JSON)
    : "";

  for (let n = 1; n <= 8; n += 1) {
    const rel = `scripts/validate-ux-7.${n}.ts`;
    assertCase(
      block,
      `exists.validator.7.${n}`,
      existsSync(join(repoRoot, rel)),
      `${rel} exists`,
    );

    const src = existsSync(join(repoRoot, rel)) ? read(rel) : "";
    // Historical gates print 10/10 either as literal "PASS 10/10" (7.7+)
    // or via passCount/BLOCKS.length with CA-UX-7.N.10 (7.1–7.6).
    const hasLiteralPass =
      new RegExp(`validate:ux-7\\.${n}\\s*→\\s*PASS 10/10`).test(src) ||
      /PASS 10\/10/.test(src);
    const hasHistoricalGateShape =
      new RegExp(`CA-UX-7\\.${n}\\.10`).test(src) &&
      (/BLOCKS\.length/.test(src) || /\/\*\s*PASS 10\b/.test(src));
    assertCase(
      block,
      `marker.pass.7.${n}`,
      hasLiteralPass || hasHistoricalGateShape,
      `${rel} contains gate PASS 10/10 fingerprint`,
    );

    assertCase(
      block,
      `npm.script.7.${n}`,
      new RegExp(`"validate:ux-7\\.${n}"\\s*:`).test(pkg),
      `package.json has validate:ux-7.${n}`,
    );
  }

  assertCase(
    block,
    "npm.script.7.9",
    /"validate:ux-7\.9"\s*:/.test(pkg),
    "package.json has validate:ux-7.9",
  );

  assertCase(
    block,
    "exists.validator.7.9",
    existsSync(join(repoRoot, "scripts/validate-ux-7.9.ts")),
    "scripts/validate-ux-7.9.ts exists",
  );

  // Evidence: this validator must not nest historical validates (static marker).
  const selfSrc = existsSync(join(repoRoot, "scripts/validate-ux-7.9.ts"))
    ? read("scripts/validate-ux-7.9.ts")
    : "";
  assertCase(
    block,
    "noNestedValidates",
    !/npm\s+run\s+validate:ux-7\./.test(selfSrc) &&
      !/spawnSync\s*\(/.test(selfSrc) &&
      !/spawn\s*\(/.test(selfSrc),
    "validate-ux-7.9 does not nest/spawn historical validators",
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const BLOCKS: { id: BlockId; ca: string }[] = [
  { id: "roadmapComplete", ca: "CA-UX-7.9.1" },
  { id: "documentationSeries", ca: "CA-UX-7.9.2" },
  { id: "architectureFreeze", ca: "CA-UX-7.9.3" },
  { id: "apiFreeze", ca: "CA-UX-7.9.4" },
  { id: "projectionFreeze", ca: "CA-UX-7.9.5" },
  { id: "pipelineFreeze", ca: "CA-UX-7.9.6" },
  { id: "diagnosticsFreeze", ca: "CA-UX-7.9.7" },
  { id: "visualIntegrationFreeze", ca: "CA-UX-7.9.8" },
  { id: "dependencyFreeze", ca: "CA-UX-7.9.9" },
  { id: "historicalValidatorsIntact", ca: "CA-UX-7.9.10" },
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
    ? "validate:ux-7.9 → PASS 10/10"
    : `validate:ux-7.9 → FAIL ${10 - failedBlocks}/10`,
);
process.exit(totalPass ? 0 : 1);
