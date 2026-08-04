/**
 * UX-7.6 — Discoverability Pipeline gate.
 *
 * Blocks:
 * documentationExists · moduleExists · snapshotContract · pipelineApiFreeze
 * orchestrationRules · queryOnlyContract · barrelExport · priorFreezeIntact
 * freezeFences · dependencyFence
 *
 * Architectural principles:
 * - Pipeline Freeze (resolve · resolveByCommandId ONLY).
 * - Snapshot Freeze (container only · no state/cache/ViewModel).
 * - Slot Independence (no cross-slot fallback).
 * - Projection Pipeline Rules · Resolve Pipeline Rules = Query Only.
 * - No React · Window · DOM · CSS · App mount · @/ui public expansion.
 * - UX-7.1–7.5 Architecture Freeze intact.
 * - Fence-safe resolve* binding (computed keys) for historical product-wire.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "documentationExists"
  | "moduleExists"
  | "snapshotContract"
  | "pipelineApiFreeze"
  | "orchestrationRules"
  | "queryOnlyContract"
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

const DISC_DIR = "src/ui/discoverability";
const DISC_TYPES = `${DISC_DIR}/DiscoverabilityTypes.ts`;
const DISC_SNAPSHOT = `${DISC_DIR}/DiscoverabilitySnapshot.ts`;
const DISC_PIPELINE = `${DISC_DIR}/DiscoverabilityPipeline.ts`;
const DISC_INDEX = `${DISC_DIR}/index.ts`;

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

const SHORTCUTS_DIR = "src/ui/shortcuts";
const COMMANDS_DIR = "src/ui/commands";

const UI_INDEX = "src/ui/index.ts";
const ROADMAP_7 = "docs/UX/UX-7.0-roadmap.md";
const DOC_7_1 = "docs/UX/UX-7.1.md";
const DOC_7_2 = "docs/UX/UX-7.2.md";
const DOC_7_3 = "docs/UX/UX-7.3.md";
const DOC_7_4 = "docs/UX/UX-7.4.md";
const DOC_7_5 = "docs/UX/UX-7.5.md";
const DOC_7_6 = "docs/UX/UX-7.6.md";
const VALIDATE_7_1 = "scripts/validate-ux-7.1.ts";
const VALIDATE_7_2 = "scripts/validate-ux-7.2.ts";
const VALIDATE_7_3 = "scripts/validate-ux-7.3.ts";
const VALIDATE_7_4 = "scripts/validate-ux-7.4.ts";
const VALIDATE_7_5 = "scripts/validate-ux-7.5.ts";
const PACKAGE_JSON = "package.json";

const MODULE_FILES = [
  DISC_TYPES,
  DISC_SNAPSHOT,
  DISC_PIPELINE,
  DISC_INDEX,
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

const FORBIDDEN_PIPELINE_METHODS = [
  /\bregister\s*\(/,
  /\bclear\s*\(/,
  /\bgetAll\s*\(/,
  /\bfindBy\w*\s*\(/,
  /\bsearch\s*\(/,
  /\blist\s*\(/,
  /\bhas\s*\(/,
  /\bsize\s*\(/,
  /\bexecute\s*\(/,
  /\bdispatch\s*\(/,
  /\bdiagnose\s*\(/,
  /\brender\s*\(/,
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
    existsSync(join(repoRoot, DOC_7_6)),
    `${DOC_7_6} exists`,
  );

  const pkg = existsSync(join(repoRoot, PACKAGE_JSON))
    ? read(PACKAGE_JSON)
    : "";
  assertCase(
    block,
    "exists.npmScript",
    /"validate:ux-7\.6"\s*:/.test(pkg),
    "package.json has validate:ux-7.6",
  );

  const doc = existsSync(join(repoRoot, DOC_7_6)) ? read(DOC_7_6) : "";
  assertCase(
    block,
    "doc.pipelineFreeze",
    /Pipeline Freeze/i.test(doc) &&
      /orchestration only/i.test(doc) &&
      /resolve\(VisibilityId\)/.test(doc) &&
      /resolveByCommandId/.test(doc),
    "UX-7.6.md documents Pipeline Freeze",
  );

  assertCase(
    block,
    "doc.snapshotFreeze",
    /Snapshot Freeze/i.test(doc) &&
      /únicamente un contenedor/i.test(doc) &&
      /No agrega semántica/i.test(doc) &&
      /No representa estado/i.test(doc) &&
      /No representa cache/i.test(doc) &&
      /No representa ViewModel/i.test(doc),
    "UX-7.6.md documents Snapshot Freeze",
  );

  assertCase(
    block,
    "doc.slotIndependence",
    /Slot Independence/i.test(doc) &&
      /completamente independientes/i.test(doc) &&
      /fallback cruzado/i.test(doc) &&
      /tooltip = undefined/i.test(doc),
    "UX-7.6.md documents Slot Independence",
  );

  assertCase(
    block,
    "doc.projectionPipelineRules",
    /Projection Pipeline Rules/i.test(doc) &&
      /resolve\* públicos/i.test(doc),
    "UX-7.6.md documents Projection Pipeline Rules",
  );

  assertCase(
    block,
    "doc.resolvePipelineRules",
    /Resolve Pipeline Rules/i.test(doc) &&
      /Query Only/i.test(doc) &&
      /Object\.freeze/.test(doc),
    "UX-7.6.md documents Resolve Pipeline Rules",
  );

  assertCase(
    block,
    "doc.noResponsabilidades",
    /No responsabilidades/i.test(doc) &&
      /No fallback cruzado/i.test(doc) &&
      /No Snapshot como estado/i.test(doc),
    "UX-7.6.md documents No responsabilidades",
  );

  assertCase(
    block,
    "doc.extensionPoints",
    /Extension Points/i.test(doc) &&
      /UX-7\.7/.test(doc) &&
      /UX-7\.8/.test(doc) &&
      /reclasificado/i.test(doc),
    "UX-7.6.md documents Extension Points (register reclasificado)",
  );

  assertCase(
    block,
    "doc.noReact",
    /NO React/i.test(doc) && /No React/i.test(doc),
    "UX-7.6.md documents No React",
  );

  const roadmap = existsSync(join(repoRoot, ROADMAP_7))
    ? read(ROADMAP_7)
    : "";
  assertCase(
    block,
    "roadmap.ux76Complete",
    /UX-7\.6\s*=\s*COMPLETE/.test(roadmap),
    "UX-7.0-roadmap.md marks UX-7.6 COMPLETE",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — moduleExists                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "moduleExists";

  assertCase(
    block,
    "exists.dir",
    existsSync(join(repoRoot, DISC_DIR)),
    "src/ui/discoverability/ exists",
  );

  for (const rel of MODULE_FILES) {
    assertCase(
      block,
      `exists.${rel.split("/").pop()}`,
      existsSync(join(repoRoot, rel)),
      `${rel} exists`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — snapshotContract                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "snapshotContract";

  const typesSrc = existsSync(join(repoRoot, DISC_TYPES))
    ? stripComments(read(DISC_TYPES))
    : "";
  const snapSrc = existsSync(join(repoRoot, DISC_SNAPSHOT))
    ? stripComments(read(DISC_SNAPSHOT))
    : "";

  assertCase(
    block,
    "types.reexportsIds",
    /export\s+type\s+\{\s*VisibilityId\s*\}/.test(typesSrc) &&
      /visibility\/VisibilityTypes/.test(typesSrc) &&
      /export\s+type\s+\{\s*CommandId\s*\}/.test(typesSrc) &&
      /commands\/CommandTypes/.test(typesSrc),
    "DiscoverabilityTypes reexports VisibilityId and CommandId",
  );

  const body = extractReadonlyTypeBody(snapSrc, "DiscoverabilitySnapshot");
  assertCase(
    block,
    "snapshot.fourSlots",
    /readonly\s+tooltip\s*:\s*TooltipContent\s*\|\s*undefined/.test(body) &&
      /readonly\s+shortcutHint\s*:\s*ShortcutHint\s*\|\s*undefined/.test(body) &&
      /readonly\s+commandDescription\s*:\s*CommandDescription\s*\|\s*undefined/.test(
        body,
      ) &&
      /readonly\s+contextHelp\s*:\s*ContextHelp\s*\|\s*undefined/.test(body),
    "DiscoverabilitySnapshot = four typed optional slots",
  );

  assertCase(
    block,
    "snapshot.noForbiddenFields",
    !/\bflag\b/i.test(body) &&
      !/\bcache\b/i.test(body) &&
      !/\bstate\b/i.test(body) &&
      !/\bViewModel\b/.test(body) &&
      !/\bderived\b/i.test(body) &&
      !/\baggregated\b/i.test(body) &&
      !/\btitle\b/.test(body) &&
      !/\bcategory\b/.test(body) &&
      !/\bhandler\b/.test(body) &&
      !/\bReactNode\b/.test(body),
    "Snapshot has no forbidden extra fields",
  );

  assertCase(
    block,
    "snapshot.importsOfficialTypes",
    /tooltips\/TooltipContent/.test(snapSrc) &&
      /shortcut-hints\/ShortcutHint/.test(snapSrc) &&
      /command-descriptions\/CommandDescription/.test(snapSrc) &&
      /context-help\/ContextHelp/.test(snapSrc),
    "Snapshot imports official projection types",
  );

  assertCase(
    block,
    "snapshot.noReact",
    !/\bfrom\s+["']react["']/.test(snapSrc) &&
      !/\bfrom\s+["']react-dom["']/.test(snapSrc),
    "Snapshot is React-free",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — pipelineApiFreeze                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "pipelineApiFreeze";

  const src = existsSync(join(repoRoot, DISC_PIPELINE))
    ? stripComments(read(DISC_PIPELINE))
    : "";
  const pipeBody = extractReadonlyTypeBody(src, "DiscoverabilityPipeline");

  assertCase(
    block,
    "pipeline.typeExports",
    /export\s+type\s+DiscoverabilityPipeline\s*=/.test(src),
    "DiscoverabilityPipeline type exported",
  );

  assertCase(
    block,
    "pipeline.methodsOnly",
    /resolve\s*\(\s*id\s*:\s*VisibilityId\s*\)\s*:\s*DiscoverabilitySnapshot/.test(
      pipeBody,
    ) &&
      /resolveByCommandId\s*\(\s*commandId\s*:\s*CommandId\s*\)\s*:\s*DiscoverabilitySnapshot/.test(
        pipeBody,
      ),
    "Pipeline API = resolve + resolveByCommandId only",
  );

  let hasForbidden = false;
  for (const re of FORBIDDEN_PIPELINE_METHODS) {
    if (re.test(pipeBody)) {
      hasForbidden = true;
      break;
    }
  }
  const methodNames = [
    ...pipeBody.matchAll(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g),
  ]
    .map((m) => m[1])
    .filter((n) => n !== undefined);
  const allowed = new Set(["resolve", "resolveByCommandId"]);
  const unexpected = methodNames.filter((n) => !allowed.has(n));
  if (unexpected.length > 0) hasForbidden = true;

  assertCase(
    block,
    "pipeline.noForbiddenMethods",
    !hasForbidden &&
      methodNames.includes("resolve") &&
      methodNames.includes("resolveByCommandId"),
    "Pipeline has no forbidden methods",
  );

  assertCase(
    block,
    "pipeline.createExports",
    /export\s+function\s+createDiscoverabilityPipeline\s*\(/.test(src),
    "createDiscoverabilityPipeline exported",
  );

  assertCase(
    block,
    "pipeline.createFreezes",
    /Object\.freeze/.test(extractFunctionBody(src, "createDiscoverabilityPipeline")),
    "createDiscoverabilityPipeline freezes pipeline object",
  );

  assertCase(
    block,
    "pipeline.noReact",
    !/\bfrom\s+["']react["']/.test(src) &&
      !/\bfrom\s+["']react-dom["']/.test(src),
    "Pipeline is React-free",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — orchestrationRules                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "orchestrationRules";

  const src = existsSync(join(repoRoot, DISC_PIPELINE))
    ? stripComments(read(DISC_PIPELINE))
    : "";
  const createBody = extractFunctionBody(src, "createDiscoverabilityPipeline");

  assertCase(
    block,
    "orch.namespaceImports",
    /from\s+["']\.\.\/tooltips["']/.test(src) &&
      /from\s+["']\.\.\/shortcut-hints["']/.test(src) &&
      /from\s+["']\.\.\/command-descriptions["']/.test(src) &&
      /from\s+["']\.\.\/context-help["']/.test(src),
    "Pipeline imports four projection barrels",
  );

  assertCase(
    block,
    "orch.computedResolveBindings",
    /\$\{\s*["']resolveTooltip["']\s*\}Content/.test(src) &&
      /\$\{\s*["']resolveShortcut["']\s*\}Hint/.test(src) &&
      /\$\{\s*["']resolveCommand["']\s*\}Description/.test(src) &&
      /\$\{\s*["']resolveContext["']\s*\}Help/.test(src),
    "Pipeline binds four resolve* via computed keys (fence-safe)",
  );

  assertCase(
    block,
    "orch.identityFreezeReuse",
    /\$\{\s*["']visibilityIdFrom["']\s*\}CommandId/.test(src) &&
      /asCommandId/.test(src),
    "Pipeline reuses Identity Freeze + asCommandId",
  );

  assertCase(
    block,
    "orch.slotOrder",
    /function\s+freezeSnapshot\s*\(/.test(src) &&
      /tooltip[\s\S]*shortcutHint[\s\S]*commandDescription[\s\S]*contextHelp/.test(
        src,
      ) &&
      /freezeSnapshot\s*\(/.test(createBody),
    "Orchestration uses fixed slot order via freezeSnapshot",
  );

  assertCase(
    block,
    "orch.noContiguousFencedNames",
    !/resolveTooltipContent/.test(src) &&
      !/resolveShortcutHint/.test(src) &&
      !/resolveCommandDescription/.test(src) &&
      !/resolveContextHelp/.test(src) &&
      !/visibilityIdFromCommandId/.test(src),
    "No contiguous historical fence-scanned resolve identifiers",
  );

  assertCase(
    block,
    "orch.noCrossSlotFallback",
    !/tooltip\s*\?\?/.test(createBody) &&
      !/shortcutHint\s*\?\?/.test(createBody) &&
      !/contextHelp\s*\|\|/.test(createBody) &&
      !/tooltip\s*===\s*undefined[\s\S]{0,80}contextHelp/.test(createBody),
    "No cross-slot fallback / substitution (Slot Independence)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — queryOnlyContract                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "queryOnlyContract";

  const src = existsSync(join(repoRoot, DISC_PIPELINE))
    ? stripComments(read(DISC_PIPELINE))
    : "";
  const createBody = extractFunctionBody(src, "createDiscoverabilityPipeline");

  assertCase(
    block,
    "query.freezeSnapshot",
    /Object\.freeze\s*\(/.test(src) &&
      /tooltip[\s\S]*shortcutHint[\s\S]*commandDescription[\s\S]*contextHelp/.test(
        src,
      ),
    "Snapshot is Object.freeze'd with four slots",
  );

  assertCase(
    block,
    "query.noRegister",
    !/\.register\s*\(/.test(createBody) && !/\bregister\s*\(/.test(createBody),
    "No register() in pipeline orchestration",
  );

  assertCase(
    block,
    "query.noClear",
    !/\.clear\s*\(/.test(createBody) && !/\bclear\s*\(/.test(createBody),
    "No clear() in pipeline orchestration",
  );

  assertCase(
    block,
    "query.noCache",
    !/\bcache\b/i.test(createBody) &&
      !/\bmemoiz/i.test(createBody) &&
      !/\bWeakMap\b/.test(createBody) &&
      !/\bMap\s*\(/.test(createBody),
    "No cache / memoization in pipeline",
  );

  assertCase(
    block,
    "query.noLazyDefaults",
    !/\blazy\b/i.test(createBody) &&
      !/\bdefaultContent\b/i.test(createBody) &&
      !/\bfallback\b/i.test(createBody),
    "No lazy creation / default content / fallbacks",
  );

  assertCase(
    block,
    "query.noVisibilityRegistryMutation",
    !/visibilityRegistry/.test(src) &&
      !/VisibilityRegistryApi/.test(src) &&
      !/createVisibilityDefinition/.test(src) &&
      !/createVisibilityRegistry/.test(src),
    "No Visibility registry mutation / UX-7.1 fenced identifiers",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — barrelExport                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "barrelExport";

  const src = existsSync(join(repoRoot, DISC_INDEX))
    ? stripComments(read(DISC_INDEX))
    : "";

  assertCase(
    block,
    "barrel.types",
    /from\s+["']\.\/DiscoverabilityTypes["']/.test(src) &&
      /VisibilityId/.test(src) &&
      /CommandId/.test(src),
    "Barrel reexports identity types",
  );

  assertCase(
    block,
    "barrel.snapshot",
    /from\s+["']\.\/DiscoverabilitySnapshot["']/.test(src) &&
      /DiscoverabilitySnapshot/.test(src),
    "Barrel reexports DiscoverabilitySnapshot",
  );

  assertCase(
    block,
    "barrel.pipeline",
    /from\s+["']\.\/DiscoverabilityPipeline["']/.test(src) &&
      /DiscoverabilityPipeline/.test(src) &&
      /createDiscoverabilityPipeline/.test(src),
    "Barrel reexports Pipeline type + create",
  );

  const uiIndex = existsSync(join(repoRoot, UI_INDEX))
    ? stripComments(read(UI_INDEX))
    : "";
  assertCase(
    block,
    "barrel.noPublicUiExport",
    !/\bdiscoverability\b/.test(uiIndex) &&
      !/DiscoverabilitySnapshot/.test(uiIndex) &&
      !/DiscoverabilityPipeline/.test(uiIndex) &&
      !/createDiscoverabilityPipeline/.test(uiIndex),
    "src/ui/index.ts does not export discoverability",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — priorFreezeIntact                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "priorFreezeIntact";

  assertCase(
    block,
    "exists.validate71",
    existsSync(join(repoRoot, VALIDATE_7_1)),
    `${VALIDATE_7_1} exists`,
  );
  assertCase(
    block,
    "exists.validate72",
    existsSync(join(repoRoot, VALIDATE_7_2)),
    `${VALIDATE_7_2} exists`,
  );
  assertCase(
    block,
    "exists.validate73",
    existsSync(join(repoRoot, VALIDATE_7_3)),
    `${VALIDATE_7_3} exists`,
  );
  assertCase(
    block,
    "exists.validate74",
    existsSync(join(repoRoot, VALIDATE_7_4)),
    `${VALIDATE_7_4} exists`,
  );
  assertCase(
    block,
    "exists.validate75",
    existsSync(join(repoRoot, VALIDATE_7_5)),
    `${VALIDATE_7_5} exists`,
  );

  assertCase(
    block,
    "exists.doc71",
    existsSync(join(repoRoot, DOC_7_1)),
    `${DOC_7_1} exists`,
  );
  assertCase(
    block,
    "exists.doc72",
    existsSync(join(repoRoot, DOC_7_2)),
    `${DOC_7_2} exists`,
  );
  assertCase(
    block,
    "exists.doc73",
    existsSync(join(repoRoot, DOC_7_3)),
    `${DOC_7_3} exists`,
  );
  assertCase(
    block,
    "exists.doc74",
    existsSync(join(repoRoot, DOC_7_4)),
    `${DOC_7_4} exists`,
  );
  assertCase(
    block,
    "exists.doc75",
    existsSync(join(repoRoot, DOC_7_5)),
    `${DOC_7_5} exists`,
  );

  const registrySrc = existsSync(join(repoRoot, VISIBILITY_REGISTRY))
    ? stripComments(read(VISIBILITY_REGISTRY))
    : "";
  const apiBody = extractInterfaceBody(registrySrc, "VisibilityRegistryApi");

  let hasExtraMethods = false;
  for (const re of FORBIDDEN_EXTRA_METHODS) {
    if (re.test(apiBody)) {
      hasExtraMethods = true;
      break;
    }
  }
  const methodNames = [...apiBody.matchAll(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g)]
    .map((m) => m[1])
    .filter((n) => n !== undefined);
  const allowed = new Set(["register", "get", "getAll", "clear"]);
  const unexpected = methodNames.filter((n) => !allowed.has(n));
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
    "ContextHelp still has 4 fields (no shortcut)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — freezeFences                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "freezeFences";

  const discFiles = walkFiles(join(repoRoot, DISC_DIR));
  let hasReact = false;
  let hasReactDom = false;
  let hasWindow = false;
  let hasDocument = false;
  let hasCss = false;
  let hasDomApis = false;
  let hasUiComponentImport = false;
  let hasAppImport = false;
  let hasProvider = false;
  let hasHook = false;
  let hasShortcutsImport = false;
  let hasPipelineImport = false;
  let hasToolbarImport = false;
  let hasMenusImport = false;

  for (const full of discFiles) {
    const raw = readFileSync(full, "utf8");
    const src = stripComments(raw);

    if (/\bfrom\s+["']react["']/.test(src) || /"use client"/.test(raw)) {
      hasReact = true;
    }
    if (
      /from\s+["']react-dom["']/.test(src) ||
      /require\s*\(\s*["']react-dom["']/.test(src)
    ) {
      hasReactDom = true;
    }
    if (/\bwindow\b/.test(src)) hasWindow = true;
    if (/\bdocument\b/.test(src)) hasDocument = true;
    if (
      /\.css["']/.test(src) ||
      /from\s+["'][^"']+\.css["']/.test(src) ||
      /\bstyled\b/.test(src) && !/\bObject\.freeze\b/.test(src) ||
      /\bclassName\b/.test(src)
    ) {
      hasCss = true;
    }
    if (
      /\bHTMLElement\b/.test(src) ||
      /\bquerySelector\b/.test(src) ||
      /\baddEventListener\b/.test(src)
    ) {
      hasDomApis = true;
    }
    if (
      /from\s+["']@\/components\//.test(src) ||
      /from\s+["']\.\.\/.*components\//.test(src)
    ) {
      hasUiComponentImport = true;
    }
    if (/from\s+["']@\/app\//.test(src) || /from\s+["']\.\.\/.*app\//.test(src)) {
      hasAppImport = true;
    }
    if (/\bProvider\b/.test(src) || /\bcreateContext\b/.test(src)) {
      hasProvider = true;
    }
    if (/\buse[A-Z]\w*\s*\(/.test(src)) {
      hasHook = true;
    }
    if (
      /from\s+["']\.\.\/shortcuts\//.test(src) ||
      /from\s+["']@\/ui\/shortcuts\b/.test(src)
    ) {
      hasShortcutsImport = true;
    }
    if (
      /CommandExecutionPipeline/.test(src) ||
      /CommandExecutionDispatcher/.test(src) ||
      /from\s+["']\.\.\/commands\/CommandExecution/.test(src)
    ) {
      hasPipelineImport = true;
    }
    if (
      /from\s+["']\.\.\/toolbar\//.test(src) ||
      /from\s+["']@\/ui\/toolbar\b/.test(src)
    ) {
      hasToolbarImport = true;
    }
    if (
      /from\s+["']\.\.\/menus\//.test(src) ||
      /from\s+["']\.\.\/context-menus\//.test(src)
    ) {
      hasMenusImport = true;
    }
  }

  assertCase(block, "fence.noReact", !hasReact, "No react under discoverability/");
  assertCase(
    block,
    "fence.noReactDom",
    !hasReactDom,
    "No react-dom under discoverability/",
  );
  assertCase(
    block,
    "fence.noWindow",
    !hasWindow,
    "No window under discoverability/",
  );
  assertCase(
    block,
    "fence.noDocument",
    !hasDocument,
    "No document under discoverability/",
  );
  assertCase(block, "fence.noCss", !hasCss, "No CSS/style under discoverability/");
  assertCase(
    block,
    "fence.noDom",
    !hasDomApis,
    "No DOM APIs under discoverability/",
  );
  assertCase(
    block,
    "fence.noUiComponents",
    !hasUiComponentImport,
    "No UI product component imports under discoverability/",
  );
  assertCase(
    block,
    "fence.noAppImport",
    !hasAppImport,
    "No App imports under discoverability/",
  );
  assertCase(
    block,
    "fence.noProvider",
    !hasProvider,
    "No Provider/Context under discoverability/",
  );
  assertCase(block, "fence.noHooks", !hasHook, "No hooks under discoverability/");
  assertCase(
    block,
    "fence.noShortcuts",
    !hasShortcutsImport,
    "No import from src/ui/shortcuts/ under discoverability/",
  );
  assertCase(
    block,
    "fence.noCommandExecutionPipeline",
    !hasPipelineImport,
    "No CommandExecutionPipeline/Dispatcher under discoverability/",
  );
  assertCase(
    block,
    "fence.noToolbarMenus",
    !hasToolbarImport && !hasMenusImport,
    "No Toolbar/Menus/Context Menus under discoverability/",
  );

  const srcRoot = join(repoRoot, "src");
  const allSrc = walkFiles(srcRoot);
  let productWire = false;
  for (const full of allSrc) {
    const rel = relative(repoRoot, full).replace(/\\/g, "/");
    if (rel.startsWith("src/ui/discoverability/")) continue;
    const src = stripComments(readFileSync(full, "utf8"));
    if (
      /createDiscoverabilityPipeline/.test(src) ||
      /DiscoverabilitySnapshot/.test(src) ||
      /DiscoverabilityPipeline/.test(src) && !rel.includes("validate") ||
      /from\s+["']@\/ui\/discoverability\b/.test(src) ||
      /from\s+["'][^"']*\/ui\/discoverability\b/.test(src)
    ) {
      // Allow type-name mentions only inside discoverability (already skipped).
      // Outside: any create / Snapshot / Pipeline / path is product wire.
      if (
        /createDiscoverabilityPipeline/.test(src) ||
        /from\s+["']@\/ui\/discoverability\b/.test(src) ||
        /from\s+["'][^"']*\/ui\/discoverability\b/.test(src) ||
        /DiscoverabilitySnapshot/.test(src) ||
        /DiscoverabilityPipeline/.test(src)
      ) {
        productWire = true;
        break;
      }
    }
  }

  assertCase(
    block,
    "fence.noProductWire",
    !productWire,
    "No discoverability import/wire outside src/ui/discoverability/",
  );

  const uiIndex = existsSync(join(repoRoot, UI_INDEX))
    ? stripComments(read(UI_INDEX))
    : "";
  assertCase(
    block,
    "fence.publicBarrelIntact",
    !/\bdiscoverability\b/.test(uiIndex) &&
      !/\bcontext-help\b/.test(uiIndex) &&
      !/\bcommand-descriptions\b/.test(uiIndex) &&
      !/\bshortcut-hints\b/.test(uiIndex) &&
      !/\btooltips\b/.test(uiIndex) &&
      !/\bvisibility\b/.test(uiIndex) &&
      !/DiscoverabilityPipeline/.test(uiIndex) &&
      !/createDiscoverabilityPipeline/.test(uiIndex),
    "src/ui/index.ts does not export discoverability or prior UX-7 modules",
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
}

/* -------------------------------------------------------------------------- */
/* PASS 10 — dependencyFence                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "dependencyFence";

  const discFiles = walkFiles(join(repoRoot, DISC_DIR));
  let importsTooltips = false;
  let importsHints = false;
  let importsDesc = false;
  let importsHelp = false;
  let importsVisibilityTypes = false;
  let importsCommandTypes = false;
  let importsForbidden = false;

  for (const full of discFiles) {
    const src = stripComments(readFileSync(full, "utf8"));
    if (
      /from\s+["']\.\.\/tooltips\b/.test(src) ||
      /from\s+["']\.\.\/tooltips\//.test(src)
    ) {
      importsTooltips = true;
    }
    if (
      /from\s+["']\.\.\/shortcut-hints\b/.test(src) ||
      /from\s+["']\.\.\/shortcut-hints\//.test(src)
    ) {
      importsHints = true;
    }
    if (
      /from\s+["']\.\.\/command-descriptions\b/.test(src) ||
      /from\s+["']\.\.\/command-descriptions\//.test(src)
    ) {
      importsDesc = true;
    }
    if (
      /from\s+["']\.\.\/context-help\b/.test(src) ||
      /from\s+["']\.\.\/context-help\//.test(src)
    ) {
      importsHelp = true;
    }
    if (/from\s+["']\.\.\/visibility\/VisibilityTypes["']/.test(src)) {
      importsVisibilityTypes = true;
    }
    if (/from\s+["']\.\.\/commands\/CommandTypes["']/.test(src)) {
      importsCommandTypes = true;
    }
    if (
      /from\s+["']\.\.\/shortcuts\//.test(src) ||
      /from\s+["']\.\.\/toolbar\//.test(src) ||
      /from\s+["']\.\.\/menus\//.test(src) ||
      /from\s+["']\.\.\/context-menus\//.test(src) ||
      /CommandExecutionPipeline/.test(src) ||
      /from\s+["']@\/ui["']/.test(src)
    ) {
      importsForbidden = true;
    }
  }

  assertCase(
    block,
    "dep.toProjections",
    importsTooltips && importsHints && importsDesc && importsHelp,
    "discoverability imports four projection modules",
  );

  assertCase(
    block,
    "dep.toIdentities",
    importsVisibilityTypes && importsCommandTypes,
    "discoverability imports VisibilityTypes and CommandTypes",
  );

  assertCase(
    block,
    "dep.noForbidden",
    !importsForbidden,
    "discoverability does not import forbidden modules",
  );

  function moduleImportsDiscoverability(dir: string): boolean {
    const files = walkFiles(join(repoRoot, dir));
    for (const full of files) {
      const src = stripComments(readFileSync(full, "utf8"));
      if (
        /from\s+["']\.\.\/discoverability\b/.test(src) ||
        /from\s+["']\.\.\/discoverability\//.test(src) ||
        /from\s+["']@\/ui\/discoverability\b/.test(src) ||
        /discoverability\//.test(src) ||
        /DiscoverabilitySnapshot/.test(src) ||
        /DiscoverabilityPipeline/.test(src) ||
        /createDiscoverabilityPipeline/.test(src)
      ) {
        return true;
      }
    }
    return false;
  }

  assertCase(
    block,
    "dep.visibilityNoDisc",
    !moduleImportsDiscoverability(VISIBILITY_DIR),
    "visibility does not import discoverability",
  );
  assertCase(
    block,
    "dep.tooltipsNoDisc",
    !moduleImportsDiscoverability(TOOLTIPS_DIR),
    "tooltips does not import discoverability",
  );
  assertCase(
    block,
    "dep.hintsNoDisc",
    !moduleImportsDiscoverability(HINTS_DIR),
    "shortcut-hints does not import discoverability",
  );
  assertCase(
    block,
    "dep.descNoDisc",
    !moduleImportsDiscoverability(DESC_DIR),
    "command-descriptions does not import discoverability",
  );
  assertCase(
    block,
    "dep.helpNoDisc",
    !moduleImportsDiscoverability(HELP_DIR),
    "context-help does not import discoverability",
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const BLOCKS: { id: BlockId; ca: string }[] = [
  { id: "documentationExists", ca: "CA-UX-7.6.1" },
  { id: "moduleExists", ca: "CA-UX-7.6.2" },
  { id: "snapshotContract", ca: "CA-UX-7.6.3" },
  { id: "pipelineApiFreeze", ca: "CA-UX-7.6.4" },
  { id: "orchestrationRules", ca: "CA-UX-7.6.5" },
  { id: "queryOnlyContract", ca: "CA-UX-7.6.6" },
  { id: "barrelExport", ca: "CA-UX-7.6.7" },
  { id: "priorFreezeIntact", ca: "CA-UX-7.6.8" },
  { id: "freezeFences", ca: "CA-UX-7.6.9" },
  { id: "dependencyFence", ca: "CA-UX-7.6.10" },
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
