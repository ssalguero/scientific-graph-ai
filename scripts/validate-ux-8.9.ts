/**
 * UX-8.9 — Documentation Freeze gate.
 *
 * Blocks:
 * documentationExists · seriesDocumentation · frozenApisDocumented
 * frozenContractsDocumented · frozenReactSurfaceDocumented
 * authoritiesDocumented · dependencyRulesDocumented · folderLayoutDocumented
 * noFunctionalChangesDeclared · historicalFreeze · architectureConsistencyFreeze
 * validationScopeFreeze · releaseReadinessFreeze · intactSurfaces
 * ssotUntouched · roadmapUpdated · packageScript · historicalValidatorsIntact
 *
 * Architectural principles:
 * - Documentation Freeze only · No Functional Changes
 * - Validation Scope Freeze — certify docs / roadmap / package.json / evidence reuse
 *   · NEVER re-audit src/ui · contracts · registries · dispatcher · diagnostics
 * - Evidence Reuse Only · no nested validate:ux-8.* (Windows hang)
 * - Architecture Consistency Freeze — UX-8-architecture.md remains sole SSOT
 * - Release Readiness Freeze — UX-8.10 = docs + certification + roadmap close only
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "documentationExists"
  | "seriesDocumentation"
  | "frozenApisDocumented"
  | "frozenContractsDocumented"
  | "frozenReactSurfaceDocumented"
  | "authoritiesDocumented"
  | "dependencyRulesDocumented"
  | "folderLayoutDocumented"
  | "noFunctionalChangesDeclared"
  | "historicalFreeze"
  | "architectureConsistencyFreeze"
  | "validationScopeFreeze"
  | "releaseReadinessFreeze"
  | "intactSurfaces"
  | "ssotUntouched"
  | "roadmapUpdated"
  | "packageScript"
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

function hasHeading(doc: string, title: string): boolean {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^#{1,3}\\s+${escaped}\\s*$`, "m").test(doc);
}

const ARCH = "docs/UX/UX-8-architecture.md";
const ROADMAP = "docs/UX/UX-8.0-roadmap.md";
const DOC_8_9 = "docs/UX/UX-8.9.md";
const PACKAGE_JSON = "package.json";
const VALIDATOR_SELF = "scripts/validate-ux-8.9.ts";
const UI_INDEX = "src/ui/index.ts";
const WINDOW_REGISTRY = "src/components/windows/WindowRegistry.ts";
const PAGE_TSX = "src/app/page.tsx";
const APP_SHELL = "src/components/app-shell/AppShell.tsx";

const SERIES_DOCS = [
  ["UX-8.1", "docs/UX/UX-8.1.md"],
  ["UX-8.2", "docs/UX/UX-8.2.md"],
  ["UX-8.3", "docs/UX/UX-8.3.md"],
  ["UX-8.4", "docs/UX/UX-8.4.md"],
  ["UX-8.5", "docs/UX/UX-8.5.md"],
  ["UX-8.6", "docs/UX/UX-8.6.md"],
  ["UX-8.7", "docs/UX/UX-8.7.md"],
  ["UX-8.8", "docs/UX/UX-8.8.md"],
] as const;

const FROZEN_MODULES = [
  "Focus",
  "Selection",
  "Multi Selection",
  "Hover",
  "Keyboard Navigation",
  "Clipboard",
  "Interaction Commands",
  "Interaction Diagnostics",
] as const;

const FROZEN_APIS = [
  "FocusRegistryApi",
  "SelectionRegistryApi",
  "HoverRegistryApi",
  "KeyboardNavigationRegistryApi",
  "ClipboardRegistryApi",
  "InteractionCommandDispatcherApi",
  "InteractionDiagnosticsReport",
  "createInteractionDiagnosticsReport",
] as const;

const FROZEN_CONTRACTS = [
  "FocusState",
  "SelectionState",
  "HoverState",
  "KeyboardNavigationState",
  "ClipboardState",
  "InteractionCommand",
  "InteractionCommandResult",
  "InteractionCommandDispatcherState",
  "InteractionDiagnosticsReport",
] as const;

const FROZEN_PROVIDERS = [
  "FocusProvider",
  "SelectionProvider",
  "HoverProvider",
  "KeyboardNavigationProvider",
  "ClipboardProvider",
  "InteractionCommandProvider",
] as const;

const FROZEN_HOOKS = [
  "useFocus",
  "useSelection",
  "useHover",
  "useKeyboardNavigation",
  "useClipboard",
  "useInteractionCommands",
] as const;

const FROZEN_DIRS = [
  "src/ui/focus",
  "src/ui/selection",
  "src/ui/hover",
  "src/ui/keyboard-nav",
  "src/ui/clipboard",
  "src/ui/interaction-commands",
  "src/ui/interaction-diagnostics",
] as const;

const REQUIRED_SECTIONS = [
  "Executive Summary",
  "Architecture Freeze",
  "Frozen Modules",
  "Frozen Contracts",
  "Frozen Public APIs",
  "Frozen React Surface",
  "Frozen Authorities",
  "Frozen Dependency Rules",
  "Frozen Folder Layout",
  "No Functional Changes Freeze",
  "Historical Freeze",
  "Architecture Consistency Freeze",
  "Validation Scope Freeze",
  "Release Readiness Freeze",
  "Acceptance Criteria",
  "Gate",
  "Next UX-8.10",
  "In Scope",
  "Out of Scope",
  "Protected Files",
] as const;

const HISTORICAL_VALIDATORS = [
  "scripts/validate-ux-8.1.ts",
  "scripts/validate-ux-8.2.ts",
  "scripts/validate-ux-8.3.ts",
  "scripts/validate-ux-8.4.ts",
  "scripts/validate-ux-8.5.ts",
  "scripts/validate-ux-8.6.ts",
  "scripts/validate-ux-8.7.ts",
  "scripts/validate-ux-8.8.ts",
] as const;

const PRODUCT_MOUNT_TOKENS = [
  /from\s+["']@\/ui\/focus/,
  /from\s+["']@\/ui\/selection/,
  /from\s+["']@\/ui\/hover/,
  /from\s+["']@\/ui\/keyboard-nav/,
  /from\s+["']@\/ui\/clipboard/,
  /from\s+["']@\/ui\/interaction-commands/,
  /from\s+["']@\/ui\/interaction-diagnostics/,
  /FocusProvider/,
  /SelectionProvider/,
  /HoverProvider/,
  /KeyboardNavigationProvider/,
  /ClipboardProvider/,
  /InteractionCommandProvider/,
  /createInteractionDiagnosticsReport/,
];

function hasProductMount(src: string): boolean {
  return PRODUCT_MOUNT_TOKENS.some((re) => re.test(src));
}

/* -------------------------------------------------------------------------- */
/* PASS 01 — documentationExists                                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "documentationExists";
  const exists = existsSync(join(repoRoot, DOC_8_9));
  assertCase(block, "doc.exists", exists, `${DOC_8_9} exists`);

  const doc = exists ? read(DOC_8_9) : "";

  assertCase(
    block,
    "doc.declaration",
    /UX-8\.9\s*=\s*Documentation Freeze/i.test(doc),
    "Declaration states UX-8.9 = Documentation Freeze",
  );

  assertCase(
    block,
    "doc.ssotRef",
    /UX-8-architecture\.md/.test(doc),
    "Doc references UX-8-architecture.md",
  );

  assertCase(
    block,
    "doc.roadmapRef",
    /UX-8\.0-roadmap\.md/.test(doc),
    "Doc references UX-8.0-roadmap.md",
  );

  assertCase(
    block,
    "doc.next810",
    /UX-8\.10/.test(doc) && /Release Certification/i.test(doc),
    "Doc points Next to UX-8.10 Release Certification",
  );

  for (const section of REQUIRED_SECTIONS) {
    assertCase(
      block,
      `doc.section.${section.replace(/\s+/g, "_")}`,
      hasHeading(doc, section),
      `Required section: ${section}`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — seriesDocumentation                                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "seriesDocumentation";
  const doc = existsSync(join(repoRoot, DOC_8_9)) ? read(DOC_8_9) : "";

  for (const [label, path] of SERIES_DOCS) {
    assertCase(
      block,
      `series.doc.${label}`,
      existsSync(join(repoRoot, path)),
      `${path} exists`,
    );
    assertCase(
      block,
      `series.mentioned.${label}`,
      new RegExp(label.replace(".", "\\.")).test(doc),
      `UX-8.9.md documents ${label}`,
    );
  }

  for (const mod of FROZEN_MODULES) {
    assertCase(
      block,
      `series.module.${mod.replace(/\s+/g, "_")}`,
      doc.includes(mod),
      `Frozen module documented: ${mod}`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — frozenApisDocumented                                             */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "frozenApisDocumented";
  const doc = existsSync(join(repoRoot, DOC_8_9)) ? read(DOC_8_9) : "";

  for (const api of FROZEN_APIS) {
    assertCase(
      block,
      `api.${api}`,
      doc.includes(api),
      `Public API documented: ${api}`,
    );
  }

  assertCase(
    block,
    "api.noRename",
    /No rename/i.test(doc),
    "Declares No rename for Frozen Public APIs",
  );
  assertCase(
    block,
    "api.noAdd",
    /No add/i.test(doc),
    "Declares No add for Frozen Public APIs",
  );
  assertCase(
    block,
    "api.noRemove",
    /No remove/i.test(doc),
    "Declares No remove for Frozen Public APIs",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — frozenContractsDocumented                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "frozenContractsDocumented";
  const doc = existsSync(join(repoRoot, DOC_8_9)) ? read(DOC_8_9) : "";

  for (const contract of FROZEN_CONTRACTS) {
    assertCase(
      block,
      `contract.${contract}`,
      doc.includes(contract),
      `Contract documented: ${contract}`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — frozenReactSurfaceDocumented                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "frozenReactSurfaceDocumented";
  const doc = existsSync(join(repoRoot, DOC_8_9)) ? read(DOC_8_9) : "";

  for (const provider of FROZEN_PROVIDERS) {
    assertCase(
      block,
      `react.provider.${provider}`,
      doc.includes(provider),
      `Provider documented: ${provider}`,
    );
  }

  for (const hook of FROZEN_HOOKS) {
    assertCase(
      block,
      `react.hook.${hook}`,
      doc.includes(hook),
      `Hook documented: ${hook}`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — authoritiesDocumented                                            */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "authoritiesDocumented";
  const doc = existsSync(join(repoRoot, DOC_8_9)) ? read(DOC_8_9) : "";

  assertCase(
    block,
    "authorities.matrix",
    /Authorities Matrix/i.test(doc),
    "Authorities Matrix documented",
  );
  assertCase(
    block,
    "authorities.queryOnly",
    /query-only/i.test(doc),
    "Diagnostics remains query-only",
  );
  assertCase(
    block,
    "authorities.noChanges",
    /No authority changes/i.test(doc),
    "Declares no authority changes",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — dependencyRulesDocumented                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "dependencyRulesDocumented";
  const doc = existsSync(join(repoRoot, DOC_8_9)) ? read(DOC_8_9) : "";

  assertCase(
    block,
    "deps.rules",
    /Dependency Rules?/i.test(doc),
    "Dependency Rules documented",
  );
  assertCase(
    block,
    "deps.noNew",
    /No new dependencies/i.test(doc),
    "Declares no new dependencies",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — folderLayoutDocumented                                           */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "folderLayoutDocumented";
  const doc = existsSync(join(repoRoot, DOC_8_9)) ? read(DOC_8_9) : "";

  for (const dir of FROZEN_DIRS) {
    assertCase(
      block,
      `folder.${dir.replace(/\//g, "_")}`,
      doc.includes(dir),
      `Folder layout documents ${dir}`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — noFunctionalChangesDeclared                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noFunctionalChangesDeclared";
  const doc = existsSync(join(repoRoot, DOC_8_9)) ? read(DOC_8_9) : "";

  assertCase(
    block,
    "nfc.section",
    hasHeading(doc, "No Functional Changes Freeze"),
    "No Functional Changes Freeze section present",
  );
  assertCase(
    block,
    "nfc.documentationOnly",
    /Documentation only/i.test(doc),
    "Declares Documentation only",
  );
  assertCase(
    block,
    "nfc.noRuntime",
    /No Runtime/i.test(doc),
    "Declares No Runtime",
  );
  assertCase(
    block,
    "nfc.noReact",
    /No React/i.test(doc),
    "Declares No React",
  );
  assertCase(
    block,
    "nfc.noRegistry",
    /No Registry/i.test(doc),
    "Declares No Registry",
  );
  assertCase(
    block,
    "nfc.noDispatcher",
    /No Dispatcher/i.test(doc),
    "Declares No Dispatcher",
  );
  assertCase(
    block,
    "nfc.noDiagnostics",
    /No Diagnostics changes/i.test(doc),
    "Declares No Diagnostics changes",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 10 — historicalFreeze                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "historicalFreeze";
  const doc = existsSync(join(repoRoot, DOC_8_9)) ? read(DOC_8_9) : "";

  assertCase(
    block,
    "hist.section",
    hasHeading(doc, "Historical Freeze"),
    "Historical Freeze section present",
  );
  assertCase(
    block,
    "hist.range",
    /UX-8\.1\s*→\s*UX-8\.8|UX-8\.1\s*-\s*UX-8\.8|UX-8\.1.*UX-8\.8/i.test(doc),
    "Declares UX-8.1 → UX-8.8 construction history",
  );
  assertCase(
    block,
    "hist.neverRewritten",
    /never be rewritten|Must never be rewritten|never rewritten/i.test(doc),
    "Declares history must never be rewritten",
  );
  assertCase(
    block,
    "hist.consolidates",
    /only consolidates|consolidates that history/i.test(doc),
    "Declares UX-8.9 only consolidates",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 11 — architectureConsistencyFreeze                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "architectureConsistencyFreeze";
  const doc = existsSync(join(repoRoot, DOC_8_9)) ? read(DOC_8_9) : "";

  assertCase(
    block,
    "acf.section",
    hasHeading(doc, "Architecture Consistency Freeze"),
    "Architecture Consistency Freeze section present",
  );
  assertCase(
    block,
    "acf.onlySsot",
    /ONLY architecture SSOT|ONLY SSOT|sole SSOT|único SSOT/i.test(doc),
    "Declares UX-8-architecture.md is the only SSOT",
  );
  assertCase(
    block,
    "acf.noReplace",
    /does NOT replace|does not replace|not replaced/i.test(doc),
    "Declares UX-8.9 does not replace the SSOT",
  );
  assertCase(
    block,
    "acf.noNewArch",
    /NO new architecture|No new architectural rules|introduces\s*\n?\s*NO/i.test(
      doc,
    ) || /introduces NO/i.test(doc),
    "Declares UX-8.9 introduces no new architecture",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 12 — validationScopeFreeze                                            */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "validationScopeFreeze";
  const doc = existsSync(join(repoRoot, DOC_8_9)) ? read(DOC_8_9) : "";
  const self = existsSync(join(repoRoot, VALIDATOR_SELF))
    ? read(VALIDATOR_SELF)
    : "";

  assertCase(
    block,
    "vsf.section",
    hasHeading(doc, "Validation Scope Freeze"),
    "Validation Scope Freeze section present",
  );
  assertCase(
    block,
    "vsf.docsOnly",
    /certifies ONLY/i.test(doc) &&
      /documentation/i.test(doc) &&
      /roadmap/i.test(doc) &&
      /package\.json/i.test(doc),
    "Declares gate certifies only documentation / roadmap / package.json",
  );
  assertCase(
    block,
    "vsf.evidenceReuse",
    /reused evidence|evidence reuse/i.test(doc),
    "Declares reused evidence / evidence reuse",
  );
  assertCase(
    block,
    "vsf.neverReaudit",
    /NEVER re-audits|never re-audit/i.test(doc),
    "Declares never re-audits functional surfaces",
  );
  assertCase(
    block,
    "vsf.surfaces",
    /src\/ui\/\*\*/.test(doc) &&
      /contracts/i.test(doc) &&
      /registries/i.test(doc) &&
      /dispatcher/i.test(doc) &&
      /diagnostics/i.test(doc),
    "Lists surfaces never re-audited",
  );

  // Token fragments avoid self-matching this file's own assertion source.
  const spawnTok = ["spawn", "Sync"].join("");
  const execTok = ["exec", "Sync"].join("");
  const execFileTok = ["execFile", "Sync"].join("");
  const childTok = ["child", "_process"].join("");
  const nestedNpm = ["npm run ", "validate:", "ux-8."].join("");
  const deepA = ["extractReadonly", "TypeBody"].join("");
  const deepB = ["extractInterface", "Body"].join("");
  const deepC = ["extractFunction", "Body"].join("");

  assertCase(
    block,
    "vsf.noNestedValidate",
    !self.includes(nestedNpm) &&
      !self.includes(spawnTok) &&
      !self.includes(execTok) &&
      !self.includes(execFileTok) &&
      !self.includes(childTok),
    "Validator does not nest or spawn historical validates",
  );

  assertCase(
    block,
    "vsf.noDeepContractAudit",
    !self.includes(deepA) && !self.includes(deepB) && !self.includes(deepC),
    "Validator does not deep-fingerprint contracts/registries/dispatcher",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 13 — releaseReadinessFreeze                                           */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "releaseReadinessFreeze";
  const doc = existsSync(join(repoRoot, DOC_8_9)) ? read(DOC_8_9) : "";
  const roadmap = existsSync(join(repoRoot, ROADMAP)) ? read(ROADMAP) : "";

  assertCase(
    block,
    "rrf.section",
    hasHeading(doc, "Release Readiness Freeze"),
    "Release Readiness Freeze section present",
  );
  assertCase(
    block,
    "rrf.infraFrozen",
    /infrastructure UX-8 está congelada|infrastructure FROZEN|UX-8 infrastructure/i.test(
      doc,
    ),
    "Declares UX-8 infrastructure frozen",
  );
  assertCase(
    block,
    "rrf.noFunctionalPending",
    /no quedan microfases funcionales|no functional microphases|no functional work remains/i.test(
      doc,
    ),
    "Declares no functional microphases pending",
  );
  assertCase(
    block,
    "rrf.ux810Only",
    /NO new code/i.test(doc) &&
      /Release Certification|release certification/i.test(doc) &&
      (/roadmap close/i.test(doc) || /cierre del roadmap/i.test(doc)),
    "Declares UX-8.10 = docs + certification + roadmap close · NO new code",
  );
  assertCase(
    block,
    "rrf.roadmap810Pending",
    /UX-8\.10\s*=\s*PENDING\s*\(Release Certification\)/i.test(roadmap) ||
      /UX-8\.10\s*\|\s*Release Certification\s*\|\s*PENDING/i.test(roadmap),
    "Roadmap keeps UX-8.10 Release Certification PENDING",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 14 — intactSurfaces                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "intactSurfaces";

  const page = existsSync(join(repoRoot, PAGE_TSX)) ? read(PAGE_TSX) : "";
  const shell = existsSync(join(repoRoot, APP_SHELL)) ? read(APP_SHELL) : "";
  const uiIndex = existsSync(join(repoRoot, UI_INDEX)) ? read(UI_INDEX) : "";
  const wr = existsSync(join(repoRoot, WINDOW_REGISTRY))
    ? read(WINDOW_REGISTRY)
    : "";

  assertCase(
    block,
    "intact.page",
    existsSync(join(repoRoot, PAGE_TSX)) && !hasProductMount(page),
    "page.tsx has no UX-8 product mount",
  );
  assertCase(
    block,
    "intact.appShell",
    existsSync(join(repoRoot, APP_SHELL)) && !hasProductMount(shell),
    "AppShell has no UX-8 product mount",
  );
  assertCase(
    block,
    "intact.uiIndex",
    existsSync(join(repoRoot, UI_INDEX)) && !hasProductMount(uiIndex),
    "src/ui/index.ts has no UX-8 product mount exports",
  );
  assertCase(
    block,
    "intact.windowRegistry",
    existsSync(join(repoRoot, WINDOW_REGISTRY)) && !hasProductMount(wr),
    "WindowRegistry untouched by UX-8 product mount",
  );

  for (const dir of FROZEN_DIRS) {
    assertCase(
      block,
      `intact.evidence.${dir.replace(/\//g, "_")}`,
      existsSync(join(repoRoot, dir)),
      `Evidence reuse: ${dir} exists (prior construction)`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 15 — ssotUntouched                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "ssotUntouched";
  const archExists = existsSync(join(repoRoot, ARCH));
  const arch = archExists ? read(ARCH) : "";
  const doc = existsSync(join(repoRoot, DOC_8_9)) ? read(DOC_8_9) : "";

  assertCase(block, "ssot.exists", archExists, `${ARCH} exists`);
  assertCase(
    block,
    "ssot.authorities",
    /Authorities Matrix/i.test(arch),
    "SSOT still contains Authorities Matrix",
  );
  assertCase(
    block,
    "ssot.dependencyRule",
    /Dependency Rule/i.test(arch),
    "SSOT still contains Dependency Rule",
  );
  assertCase(
    block,
    "ssot.cited",
    /UX-8-architecture\.md/.test(doc),
    "UX-8.9 cites architecture SSOT",
  );
  assertCase(
    block,
    "ssot.notReplaced",
    /does NOT replace|does not replace|not replaced/i.test(doc),
    "UX-8.9 declares it does not replace SSOT",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 16 — roadmapUpdated                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "roadmapUpdated";
  const roadmap = existsSync(join(repoRoot, ROADMAP)) ? read(ROADMAP) : "";

  assertCase(
    block,
    "roadmap.exists",
    existsSync(join(repoRoot, ROADMAP)),
    `${ROADMAP} exists`,
  );
  assertCase(
    block,
    "roadmap.architectureRef",
    /UX-8-architecture\.md/.test(roadmap),
    "Roadmap references UX-8-architecture.md",
  );
  assertCase(
    block,
    "roadmap.ux89Complete",
    /UX-8\.9\s*=\s*COMPLETE/i.test(roadmap),
    "Roadmap marks UX-8.9 COMPLETE",
  );
  assertCase(
    block,
    "roadmap.tableComplete",
    /UX-8\.9\s*\|\s*Documentation Freeze\s*\|\s*COMPLETE/i.test(roadmap),
    "Roadmap phase table marks UX-8.9 COMPLETE",
  );
  assertCase(
    block,
    "roadmap.historicalGate",
    /validate:ux-8\.9/.test(roadmap) && /UX-8\.9\.md/.test(roadmap),
    "Roadmap lists historical gate validate:ux-8.9",
  );
  assertCase(
    block,
    "roadmap.next810",
    /UX-8\.10/.test(roadmap) && /Release Certification/i.test(roadmap),
    "Roadmap lists UX-8.10 Release Certification",
  );
  assertCase(
    block,
    "roadmap.ux88Complete",
    /UX-8\.8\s*=\s*COMPLETE/i.test(roadmap),
    "Roadmap keeps UX-8.8 COMPLETE",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 17 — packageScript                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "packageScript";
  const pkg = existsSync(join(repoRoot, PACKAGE_JSON))
    ? read(PACKAGE_JSON)
    : "";

  assertCase(
    block,
    "pkg.validate89",
    /"validate:ux-8\.9"\s*:\s*"npx tsx scripts\/validate-ux-8\.9\.ts"/.test(
      pkg,
    ),
    'package.json has "validate:ux-8.9": "npx tsx scripts/validate-ux-8.9.ts"',
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 18 — historicalValidatorsIntact                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "historicalValidatorsIntact";

  for (const path of HISTORICAL_VALIDATORS) {
    assertCase(
      block,
      `histVal.${path.replace(/[\\/.]/g, "_")}`,
      existsSync(join(repoRoot, path)),
      `${path} exists`,
    );
  }

  const self = existsSync(join(repoRoot, VALIDATOR_SELF))
    ? read(VALIDATOR_SELF)
    : "";

  const nestedHist = ["npm run ", "validate:", "ux-8."].join("");
  assertCase(
    block,
    "histVal.noNest",
    !self.includes(nestedHist),
    "Does not nest historical ux-8 validate scripts",
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const failed = results.filter((r) => !r.pass);
const passed = results.filter((r) => r.pass);

const blocks: BlockId[] = [
  "documentationExists",
  "seriesDocumentation",
  "frozenApisDocumented",
  "frozenContractsDocumented",
  "frozenReactSurfaceDocumented",
  "authoritiesDocumented",
  "dependencyRulesDocumented",
  "folderLayoutDocumented",
  "noFunctionalChangesDeclared",
  "historicalFreeze",
  "architectureConsistencyFreeze",
  "validationScopeFreeze",
  "releaseReadinessFreeze",
  "intactSurfaces",
  "ssotUntouched",
  "roadmapUpdated",
  "packageScript",
  "historicalValidatorsIntact",
];

console.log("UX-8.9 — Documentation Freeze");
console.log("==============================");

for (const block of blocks) {
  const cases = results.filter((r) => r.block === block);
  const ok = cases.every((c) => c.pass);
  const mark = ok ? "PASS" : "FAIL";
  console.log(
    `${mark}  ${block}  (${cases.filter((c) => c.pass).length}/${cases.length})`,
  );
  if (!ok) {
    for (const c of cases.filter((x) => !x.pass)) {
      console.log(`      ✗ ${c.id}: ${c.detail}`);
    }
  }
}

console.log("------------------------------");
console.log(`Cases: ${passed.length}/${results.length} passed`);

if (failed.length > 0) {
  console.log("RESULT: FAIL");
  process.exit(1);
}

console.log("RESULT: PASS");
