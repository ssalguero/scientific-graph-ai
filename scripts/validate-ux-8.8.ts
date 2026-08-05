/**
 * UX-8.8 — Interaction Diagnostics gate.
 *
 * Blocks:
 * documentationExists · moduleExists · reportContract · factorySignature
 * reportFreeze · queryOnlyFreeze · snapshotFreeze · snapshotIdentityFreeze
 * statelessDiagnosticsFreeze · registryIndependenceFreeze
 * reportCompositionFreeze · reportOrderingFreeze · failureTransparencyFreeze
 * apiFreeze · dependencyRule · authorities · intactSurfaces · roadmapUpdated
 *
 * Architectural principles:
 * - Diagnostics = query-only composition of getState() snapshots.
 * - No Registry / Provider / Context / Hook / singleton / React.
 * - Report Ordering Freeze · Report Composition Freeze · Report Freeze.
 * - Snapshot Identity Freeze · Failure Transparency Freeze.
 * - API Freeze = InteractionDiagnosticsReport + createInteractionDiagnosticsReport.
 * - Diagnostics owns no authority · Dependency Rule · no product mount.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "documentationExists"
  | "moduleExists"
  | "reportContract"
  | "factorySignature"
  | "reportFreeze"
  | "queryOnlyFreeze"
  | "snapshotFreeze"
  | "snapshotIdentityFreeze"
  | "statelessDiagnosticsFreeze"
  | "registryIndependenceFreeze"
  | "reportCompositionFreeze"
  | "reportOrderingFreeze"
  | "failureTransparencyFreeze"
  | "apiFreeze"
  | "dependencyRule"
  | "authorities"
  | "intactSurfaces"
  | "roadmapUpdated";

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

function extractFunctionBody(src: string, fnName: string): string {
  const re = new RegExp(
    `export\\s+function\\s+${fnName}\\s*\\([\\s\\S]*?\\)\\s*:\\s*[\\w.<|,\\s>]+\\s*\\{`,
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

function extractFunctionSignature(src: string, fnName: string): string {
  const re = new RegExp(
    `export\\s+function\\s+${fnName}\\s*\\(([\\s\\S]*?)\\)\\s*:`,
  );
  const m = re.exec(src);
  return m?.[1] ?? "";
}

const ID_DIR = "src/ui/interaction-diagnostics";
const ID_REPORT = `${ID_DIR}/InteractionDiagnosticsReport.ts`;
const ID_FACTORY = `${ID_DIR}/createInteractionDiagnosticsReport.ts`;
const ID_INDEX = `${ID_DIR}/index.ts`;
const UI_INDEX = "src/ui/index.ts";
const WINDOW_REGISTRY = "src/components/windows/WindowRegistry.ts";
const PAGE_TSX = "src/app/page.tsx";
const APP_SHELL = "src/components/app-shell/AppShell.tsx";
const ARCH = "docs/UX/UX-8-architecture.md";
const ROADMAP = "docs/UX/UX-8.0-roadmap.md";
const DOC_8_8 = "docs/UX/UX-8.8.md";
const PACKAGE_JSON = "package.json";

const MODULE_FILES = [ID_REPORT, ID_FACTORY, ID_INDEX] as const;

const ORDERED_KEYS = [
  "focus",
  "selection",
  "hover",
  "keyboardNavigation",
  "clipboard",
  "interactionCommands",
] as const;

const PRIOR_DIRS = [
  ["focus", "src/ui/focus"],
  ["selection", "src/ui/selection"],
  ["hover", "src/ui/hover"],
  ["keyboard-nav", "src/ui/keyboard-nav"],
  ["clipboard", "src/ui/clipboard"],
  ["interaction-commands", "src/ui/interaction-commands"],
] as const;

const MUTATION_TOKENS = [
  /\.focus\s*\(/,
  /\.blur\s*\(/,
  /\.hover\w*\s*\(/,
  /\.select\w*\s*\(/,
  /\.toggle\w*\s*\(/,
  /\.dispatch\s*\(/,
  /\.clear\w*\s*\(/,
  /\.move\s*\(/,
  /\.set\s*\(/,
  /\.next\s*\(/,
  /\.previous\s*\(/,
  /\.escape\s*\(/,
  /\.range\w*\s*\(/,
];

/* -------------------------------------------------------------------------- */
/* PASS 01 — documentationExists                                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "documentationExists";

  assertCase(
    block,
    "exists.architecture",
    existsSync(join(repoRoot, ARCH)),
    `${ARCH} exists`,
  );

  assertCase(
    block,
    "exists.roadmap",
    existsSync(join(repoRoot, ROADMAP)),
    `${ROADMAP} exists`,
  );

  assertCase(
    block,
    "exists.doc",
    existsSync(join(repoRoot, DOC_8_8)),
    `${DOC_8_8} exists`,
  );

  const pkg = existsSync(join(repoRoot, PACKAGE_JSON))
    ? read(PACKAGE_JSON)
    : "";
  assertCase(
    block,
    "exists.npmScript",
    /"validate:ux-8\.8"\s*:/.test(pkg),
    "package.json has validate:ux-8.8",
  );

  const doc = existsSync(join(repoRoot, DOC_8_8)) ? read(DOC_8_8) : "";

  assertCase(
    block,
    "doc.ssotRef",
    /UX-8-architecture\.md/.test(doc),
    "UX-8.8.md references architecture SSOT",
  );

  const freezes: Array<[string, RegExp]> = [
    ["Report Freeze", /Report Freeze/i],
    ["Query-only Freeze", /Query-only Freeze/i],
    ["Snapshot Freeze", /Snapshot Freeze/i],
    ["Snapshot Identity Freeze", /Snapshot Identity Freeze/i],
    ["Stateless Diagnostics Freeze", /Stateless Diagnostics Freeze/i],
    ["Registry Independence Freeze", /Registry Independence Freeze/i],
    ["Report Composition Freeze", /Report Composition Freeze/i],
    ["Report Ordering Freeze", /Report Ordering Freeze/i],
    ["Failure Transparency Freeze", /Failure Transparency Freeze/i],
    ["API Freeze", /API Freeze/i],
  ];

  for (const [label, re] of freezes) {
    assertCase(
      block,
      `doc.${label.replace(/\s+/g, "")}`,
      re.test(doc),
      `UX-8.8.md documents ${label}`,
    );
  }

  assertCase(
    block,
    "doc.authorities",
    /Authorities/i.test(doc) &&
      (/no authority|no posee autoridad|owns NO authority/i.test(doc) ||
        /sin autoridad/i.test(doc)),
    "UX-8.8.md documents Authorities (no authority)",
  );

  assertCase(
    block,
    "doc.dependencyRule",
    /Dependency Rule/i.test(doc) && /getState\(\)/.test(doc),
    "UX-8.8.md documents Dependency Rule",
  );

  assertCase(
    block,
    "doc.outOfScope",
    /Out of Scope/i.test(doc),
    "UX-8.8.md documents Out of Scope",
  );

  assertCase(
    block,
    "doc.integrationFence",
    /Integration Fence/i.test(doc),
    "UX-8.8.md documents Integration Fence",
  );

  assertCase(
    block,
    "doc.acceptance",
    /Acceptance Criteria/i.test(doc),
    "UX-8.8.md documents Acceptance Criteria",
  );

  assertCase(
    block,
    "doc.gate",
    /Gate/i.test(doc) && /validate:ux-8\.8/.test(doc),
    "UX-8.8.md documents Gate validate:ux-8.8",
  );

  assertCase(
    block,
    "doc.next89",
    /Next.*UX-8\.9/i.test(doc) && /Documentation Freeze/i.test(doc),
    "UX-8.8.md documents Next UX-8.9 Documentation Freeze",
  );

  assertCase(
    block,
    "doc.snapshotIdentitySemantics",
    /report.?1?\s*!==\s*report.?2?|report₁\s*!==\s*report₂/i.test(doc) ||
      (/nuevo objeto|new report|NEW report/i.test(doc) &&
        /memoiz/i.test(doc)),
    "UX-8.8.md documents report₁ !== report₂ / no memoization",
  );

  assertCase(
    block,
    "doc.failurePropagates",
    (/propaga|propagat/i.test(doc) &&
      (/try/i.test(doc) || /catch/i.test(doc) || /exception/i.test(doc))) ||
      (/Failure Transparency/i.test(doc) && /propaga|propagat/i.test(doc)),
    "UX-8.8.md documents failure propagation",
  );

  assertCase(
    block,
    "doc.onlyGetState",
    /getState\(\)/.test(doc) && /Query-only/i.test(doc),
    "UX-8.8.md documents only getState() allowed",
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
    existsSync(join(repoRoot, ID_DIR)),
    `${ID_DIR} exists`,
  );

  for (const f of MODULE_FILES) {
    assertCase(block, `file.${f}`, existsSync(join(repoRoot, f)), `${f} exists`);
  }

  const entries = existsSync(join(repoRoot, ID_DIR))
    ? readdirSync(join(repoRoot, ID_DIR)).filter((n) =>
        /\.(ts|tsx)$/.test(n),
      )
    : [];

  assertCase(
    block,
    "exactlyThreeFiles",
    entries.length === 3 &&
      entries.includes("InteractionDiagnosticsReport.ts") &&
      entries.includes("createInteractionDiagnosticsReport.ts") &&
      entries.includes("index.ts"),
    "Module has exactly 3 TypeScript files",
  );

  const allSrc = MODULE_FILES.map((f) =>
    existsSync(join(repoRoot, f)) ? read(f) : "",
  ).join("\n");

  assertCase(
    block,
    "noReact",
    !/from\s+["']react["']/.test(allSrc) &&
      !/\bReact\b/.test(stripComments(allSrc)) &&
      !/\.tsx\b/.test(entries.join(" ")),
    "Module is React-free (no react imports / .tsx)",
  );

  assertCase(
    block,
    "noProvider",
    !/\bProvider\b/.test(stripComments(allSrc)),
    "No Provider in module",
  );

  assertCase(
    block,
    "noContext",
    !/\bcreateContext\b/.test(allSrc) &&
      !/\bContext\b/.test(stripComments(allSrc).replace(/InteractionDiagnosticsReport/g, "")),
    "No Context in module",
  );

  assertCase(
    block,
    "noHook",
    !/\buse[A-Z]\w*\b/.test(stripComments(allSrc)) &&
      !/useInteractionDiagnostics/.test(allSrc),
    "No Hook in module",
  );

  assertCase(
    block,
    "noRegistry",
    !/create\w*Registry/.test(allSrc) &&
      !/\bRegistryApi\b/.test(
        stripComments(allSrc).replace(
          /FocusRegistryApi|SelectionRegistryApi|HoverRegistryApi|KeyboardNavigationRegistryApi|ClipboardRegistryApi/g,
          "",
        ),
      ),
    "No local Registry created",
  );

  assertCase(
    block,
    "noSingleton",
    !/export\s+const\s+\w+Diagnostics/.test(allSrc) &&
      !/export\s+const\s+interactionDiagnostics/.test(allSrc),
    "No diagnostics singleton",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — reportContract                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "reportContract";
  const src = existsSync(join(repoRoot, ID_REPORT)) ? read(ID_REPORT) : "";
  const body = extractReadonlyTypeBody(src, "InteractionDiagnosticsReport");
  const stripped = stripComments(body);

  assertCase(
    block,
    "type.exported",
    /export\s+type\s+InteractionDiagnosticsReport\s*=\s*Readonly\s*</.test(src),
    "InteractionDiagnosticsReport exported as Readonly",
  );

  const expectedTypes: Record<(typeof ORDERED_KEYS)[number], string> = {
    focus: "FocusState",
    selection: "SelectionState",
    hover: "HoverState",
    keyboardNavigation: "KeyboardNavigationState",
    clipboard: "ClipboardState",
    interactionCommands: "InteractionCommandDispatcherState",
  };

  for (const key of ORDERED_KEYS) {
    const re = new RegExp(`${key}\\s*:\\s*${expectedTypes[key]}`);
    assertCase(
      block,
      `field.${key}`,
      re.test(stripped),
      `Report has ${key}: ${expectedTypes[key]}`,
    );
  }

  assertCase(
    block,
    "noExtraFields",
    !/\b(timestamp|timestamps|id|ids|metadata|counter|counters|runtime)\b/i.test(
      stripped,
    ),
    "Report has no timestamps / ids / metadata / counters / runtime",
  );

  assertCase(
    block,
    "imports.stateTypes",
    /from\s+["']\.\.\/focus["']/.test(src) &&
      /from\s+["']\.\.\/selection["']/.test(src) &&
      /from\s+["']\.\.\/hover["']/.test(src) &&
      /from\s+["']\.\.\/keyboard-nav["']/.test(src) &&
      /from\s+["']\.\.\/clipboard["']/.test(src) &&
      /from\s+["']\.\.\/interaction-commands["']/.test(src),
    "Report imports state types from sibling barrels",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — factorySignature                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "factorySignature";
  const src = existsSync(join(repoRoot, ID_FACTORY)) ? read(ID_FACTORY) : "";
  const sig = extractFunctionSignature(src, "createInteractionDiagnosticsReport");

  assertCase(
    block,
    "factory.exported",
    /export\s+function\s+createInteractionDiagnosticsReport\s*\(/.test(src),
    "createInteractionDiagnosticsReport exported",
  );

  assertCase(
    block,
    "factory.returns",
    /createInteractionDiagnosticsReport\s*\([\s\S]*?\)\s*:\s*InteractionDiagnosticsReport/.test(
      src,
    ),
    "Factory returns InteractionDiagnosticsReport",
  );

  const params = [
    "focusRegistry",
    "selectionRegistry",
    "hoverRegistry",
    "keyboardNavigationRegistry",
    "clipboardRegistry",
    "interactionCommandDispatcher",
  ];

  for (const p of params) {
    assertCase(
      block,
      `param.${p}`,
      new RegExp(`\\b${p}\\b`).test(sig),
      `Factory param ${p} present`,
    );
  }

  assertCase(
    block,
    "param.count",
    (sig.match(/:/g) ?? []).length === 6,
    "Factory has exactly six typed parameters",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — reportFreeze                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "reportFreeze";
  const src = existsSync(join(repoRoot, ID_FACTORY)) ? read(ID_FACTORY) : "";
  const body = stripComments(
    extractFunctionBody(src, "createInteractionDiagnosticsReport"),
  );

  assertCase(
    block,
    "object.freeze",
    /return\s+Object\.freeze\s*\(/.test(body),
    "Factory returns Object.freeze(report)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — queryOnlyFreeze                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "queryOnlyFreeze";
  const src = existsSync(join(repoRoot, ID_FACTORY)) ? read(ID_FACTORY) : "";
  const body = stripComments(
    extractFunctionBody(src, "createInteractionDiagnosticsReport"),
  );

  const getStateCalls = (body.match(/\.getState\s*\(\s*\)/g) ?? []).length;
  assertCase(
    block,
    "getState.six",
    getStateCalls === 6,
    `Factory calls getState() exactly six times (found ${getStateCalls})`,
  );

  for (const token of MUTATION_TOKENS) {
    assertCase(
      block,
      `noMutation.${token.source}`,
      !token.test(body),
      `Factory does not call mutation ${token.source}`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — snapshotFreeze                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "snapshotFreeze";
  const src = existsSync(join(repoRoot, ID_FACTORY)) ? read(ID_FACTORY) : "";
  const body = stripComments(
    extractFunctionBody(src, "createInteractionDiagnosticsReport"),
  );

  for (const key of ORDERED_KEYS) {
    const paramByKey: Record<(typeof ORDERED_KEYS)[number], string> = {
      focus: "focusRegistry",
      selection: "selectionRegistry",
      hover: "hoverRegistry",
      keyboardNavigation: "keyboardNavigationRegistry",
      clipboard: "clipboardRegistry",
      interactionCommands: "interactionCommandDispatcher",
    };
    const p = paramByKey[key];
    assertCase(
      block,
      `section.${key}`,
      new RegExp(`${key}\\s*:\\s*${p}\\.getState\\s*\\(\\s*\\)`).test(body),
      `${key} section = ${p}.getState()`,
    );
  }

  assertCase(
    block,
    "noRegistryReturn",
    !/return\s+(focusRegistry|selectionRegistry|hoverRegistry|keyboardNavigationRegistry|clipboardRegistry|interactionCommandDispatcher)\b/.test(
      body,
    ),
    "Factory never returns a registry/dispatcher",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — snapshotIdentityFreeze                                           */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "snapshotIdentityFreeze";
  const src = existsSync(join(repoRoot, ID_FACTORY)) ? read(ID_FACTORY) : "";
  const body = stripComments(
    extractFunctionBody(src, "createInteractionDiagnosticsReport"),
  );
  const doc = existsSync(join(repoRoot, DOC_8_8)) ? read(DOC_8_8) : "";

  assertCase(
    block,
    "noMemo",
    !/\bmemo(?:ize|ization)?\b/i.test(body) &&
      !/\bcache\b/i.test(body) &&
      !/\bweakmap\b/i.test(body) &&
      !/\blastReport\b/i.test(body) &&
      !/\bcachedReport\b/i.test(body),
    "Factory has no memoization / cached report",
  );

  assertCase(
    block,
    "newObjectLiteral",
    /const\s+report\s*:\s*InteractionDiagnosticsReport\s*=\s*\{/.test(body) ||
      /return\s+Object\.freeze\s*\(\s*\{/.test(body),
    "Factory allocates a new report object each call",
  );

  assertCase(
    block,
    "doc.identity",
    /Snapshot Identity Freeze/i.test(doc) &&
      (/report.?1?\s*!==\s*report.?2?|report₁\s*!==\s*report₂/i.test(doc) ||
        /nuevo objeto|NEW report|new report/i.test(doc)),
    "Docs document Snapshot Identity Freeze",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — statelessDiagnosticsFreeze                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "statelessDiagnosticsFreeze";
  const allSrc = MODULE_FILES.map((f) =>
    existsSync(join(repoRoot, f)) ? stripComments(read(f)) : "",
  ).join("\n");

  const forbidden = [
    "cache",
    "memo",
    "memoization",
    "history",
    "polling",
    "setInterval",
    "setTimeout",
    "private state",
  ];

  for (const token of forbidden) {
    const re = new RegExp(`\\b${token.replace(/\s+/g, "\\s+")}\\b`, "i");
    // Allow mentions only in comments (already stripped) — forbid in code
    assertCase(
      block,
      `no.${token.replace(/\s+/g, "_")}`,
      !re.test(allSrc),
      `Module code has no ${token}`,
    );
  }

  assertCase(
    block,
    "noModuleLevelLet",
    !/^let\s+/m.test(allSrc) && !/^var\s+/m.test(allSrc),
    "No module-level mutable state",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 10 — registryIndependenceFreeze                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "registryIndependenceFreeze";
  const src = existsSync(join(repoRoot, ID_FACTORY)) ? read(ID_FACTORY) : "";
  const body = stripComments(
    extractFunctionBody(src, "createInteractionDiagnosticsReport"),
  );
  const doc = existsSync(join(repoRoot, DOC_8_8)) ? read(DOC_8_8) : "";

  assertCase(
    block,
    "noCoordinate",
    !/\b(coordinate|synchronize|synchroni[sz]e|correct|repair)\b/i.test(body),
    "Factory does not coordinate/sync/correct registries",
  );

  assertCase(
    block,
    "doc.independence",
    /Registry Independence Freeze/i.test(doc) &&
      (/coordina|coordinate/i.test(doc) || /sincroniza|synchron/i.test(doc)),
    "Docs document Registry Independence Freeze",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 11 — reportCompositionFreeze                                          */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "reportCompositionFreeze";
  const src = existsSync(join(repoRoot, ID_FACTORY)) ? read(ID_FACTORY) : "";
  const body = stripComments(
    extractFunctionBody(src, "createInteractionDiagnosticsReport"),
  );

  const forbiddenOps = [
    /\.map\s*\(/,
    /\.filter\s*\(/,
    /\.reduce\s*\(/,
    /\bnormalize\b/i,
    /\btransform\b/i,
    /\bderive\b/i,
    /\benrich\b/i,
    /\bmerge\b/i,
    /\bObject\.assign\b/,
    /\bspread\b/i,
  ];

  for (const re of forbiddenOps) {
    assertCase(
      block,
      `no.${re.source}`,
      !re.test(body),
      `Factory does not ${re.source}`,
    );
  }

  assertCase(
    block,
    "onlyAssignments",
    ORDERED_KEYS.every((key) =>
      new RegExp(`${key}\\s*:\\s*\\w+\\.getState\\s*\\(\\s*\\)`).test(body),
    ),
    "Each section is a direct getState() assignment",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 12 — reportOrderingFreeze                                             */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "reportOrderingFreeze";
  const reportSrc = existsSync(join(repoRoot, ID_REPORT))
    ? read(ID_REPORT)
    : "";
  const factorySrc = existsSync(join(repoRoot, ID_FACTORY))
    ? read(ID_FACTORY)
    : "";
  const reportBody = stripComments(
    extractReadonlyTypeBody(reportSrc, "InteractionDiagnosticsReport"),
  );
  const factoryBody = stripComments(
    extractFunctionBody(factorySrc, "createInteractionDiagnosticsReport"),
  );

  function keyOrder(text: string): string[] {
    const keys: string[] = [];
    for (const key of ORDERED_KEYS) {
      const idx = text.search(new RegExp(`\\b${key}\\s*:`));
      if (idx >= 0) keys.push(`${idx}:${key}`);
    }
    return keys
      .sort((a, b) => Number(a.split(":")[0]) - Number(b.split(":")[0]))
      .map((k) => k.split(":")[1]!);
  }

  const typeOrder = keyOrder(reportBody);
  const valueOrder = keyOrder(factoryBody);

  assertCase(
    block,
    "type.order",
    typeOrder.join(",") === ORDERED_KEYS.join(","),
    `Type property order is ${ORDERED_KEYS.join(" → ")}`,
  );

  assertCase(
    block,
    "factory.order",
    valueOrder.join(",") === ORDERED_KEYS.join(","),
    `Factory property order is ${ORDERED_KEYS.join(" → ")}`,
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 13 — failureTransparencyFreeze                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "failureTransparencyFreeze";
  const src = existsSync(join(repoRoot, ID_FACTORY)) ? read(ID_FACTORY) : "";
  const body = stripComments(
    extractFunctionBody(src, "createInteractionDiagnosticsReport"),
  );
  const doc = existsSync(join(repoRoot, DOC_8_8)) ? read(DOC_8_8) : "";

  assertCase(
    block,
    "noTry",
    !/\btry\b/.test(body),
    "Factory has no try",
  );

  assertCase(
    block,
    "noCatch",
    !/\bcatch\b/.test(body),
    "Factory has no catch",
  );

  assertCase(
    block,
    "noFinally",
    !/\bfinally\b/.test(body),
    "Factory has no finally",
  );

  assertCase(
    block,
    "noFallback",
    !/\bfallback\b/i.test(body) &&
      !/\bdefaultValue\b/i.test(body) &&
      !/\?\?/ .test(body) &&
      !/\bcatch\b/.test(body),
    "Factory has no fallback / default recovery",
  );

  assertCase(
    block,
    "doc.failure",
    /Failure Transparency Freeze/i.test(doc) &&
      (/propaga|propagat/i.test(doc) || /exception/i.test(doc)),
    "Docs document Failure Transparency Freeze",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 14 — apiFreeze                                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "apiFreeze";
  const indexSrc = existsSync(join(repoRoot, ID_INDEX)) ? read(ID_INDEX) : "";
  const uiIndex = existsSync(join(repoRoot, UI_INDEX)) ? read(UI_INDEX) : "";

  assertCase(
    block,
    "export.type",
    /export\s+type\s+\{\s*InteractionDiagnosticsReport\s*\}/.test(indexSrc),
    "Barrel exports InteractionDiagnosticsReport type",
  );

  assertCase(
    block,
    "export.factory",
    /export\s+\{\s*createInteractionDiagnosticsReport\s*\}/.test(indexSrc),
    "Barrel exports createInteractionDiagnosticsReport",
  );

  const exportLines = stripComments(indexSrc)
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("export"));

  assertCase(
    block,
    "exactlyTwoExports",
    exportLines.length === 2,
    `Barrel has exactly 2 export statements (found ${exportLines.length})`,
  );

  assertCase(
    block,
    "notInUiIndex",
    !/interaction-diagnostics/.test(uiIndex) &&
      !/InteractionDiagnosticsReport/.test(uiIndex) &&
      !/createInteractionDiagnosticsReport/.test(uiIndex),
    "src/ui/index.ts does not export interaction-diagnostics",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 15 — dependencyRule                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "dependencyRule";
  const allSrc = MODULE_FILES.map((f) =>
    existsSync(join(repoRoot, f)) ? read(f) : "",
  ).join("\n");
  const stripped = stripComments(allSrc);

  assertCase(
    block,
    "noWindowRegistry",
    !/WindowRegistry/.test(stripped) && !/windows\/WindowRegistry/.test(allSrc),
    "No WindowRegistry dependency",
  );

  assertCase(
    block,
    "noRuntime",
    !/from\s+["'][^"']*runtime[^"']*["']/.test(allSrc) &&
      !/\bThemeRuntime\b/.test(stripped),
    "No Runtime dependency",
  );

  assertCase(
    block,
    "noScientific",
    !/scientific\//.test(allSrc) && !/from\s+["']@?\/?.*scientific/.test(allSrc),
    "No scientific/** dependency",
  );

  assertCase(
    block,
    "noReactImport",
    !/from\s+["']react["']/.test(allSrc),
    "No React import",
  );

  assertCase(
    block,
    "publicContractsOnly",
    /from\s+["']\.\.\/focus["']/.test(allSrc) &&
      /from\s+["']\.\.\/selection["']/.test(allSrc) &&
      /from\s+["']\.\.\/hover["']/.test(allSrc) &&
      /from\s+["']\.\.\/keyboard-nav["']/.test(allSrc) &&
      /from\s+["']\.\.\/clipboard["']/.test(allSrc) &&
      /from\s+["']\.\.\/interaction-commands["']/.test(allSrc),
    "Depends on public sibling barrels only",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 16 — authorities                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "authorities";
  const doc = existsSync(join(repoRoot, DOC_8_8)) ? read(DOC_8_8) : "";
  const arch = existsSync(join(repoRoot, ARCH)) ? read(ARCH) : "";

  assertCase(
    block,
    "doc.noAuthority",
    /no posee autoridad|owns NO authority|NO authority|sin autoridad/i.test(
      doc,
    ),
    "Docs state diagnostics has no authority",
  );

  assertCase(
    block,
    "arch.queryOnly",
    /Diagnostics/i.test(arch) && /Query-only|query-only/i.test(arch),
    "Architecture SSOT lists Diagnostics as query-only",
  );

  assertCase(
    block,
    "priorAuthoritiesNamed",
    /Focus/i.test(doc) &&
      /Selection/i.test(doc) &&
      /Hover/i.test(doc) &&
      /Keyboard/i.test(doc) &&
      /Clipboard/i.test(doc) &&
      /Interaction [Cc]ommand/i.test(doc),
    "Docs retain prior authorities",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 17 — intactSurfaces                                                   */
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
    "page.noDiagnostics",
    !/interaction-diagnostics/.test(page) &&
      !/createInteractionDiagnosticsReport/.test(page) &&
      !/InteractionDiagnosticsReport/.test(page),
    "page.tsx does not reference interaction-diagnostics",
  );

  assertCase(
    block,
    "appShell.noDiagnostics",
    !/interaction-diagnostics/.test(shell) &&
      !/createInteractionDiagnosticsReport/.test(shell),
    "AppShell does not reference interaction-diagnostics",
  );

  assertCase(
    block,
    "uiIndex.untouched",
    !/interaction-diagnostics/.test(uiIndex) &&
      !/createInteractionDiagnosticsReport/.test(uiIndex),
    "src/ui/index.ts untouched by diagnostics",
  );

  assertCase(
    block,
    "windowRegistry.untouched",
    !/interaction-diagnostics/.test(wr) &&
      !/createInteractionDiagnosticsReport/.test(wr),
    "WindowRegistry untouched by diagnostics",
  );

  for (const [label, dir] of PRIOR_DIRS) {
    const prior = walkFiles(join(repoRoot, dir))
      .map((f) => readFileSync(f, "utf8"))
      .join("\n");
    assertCase(
      block,
      `prior.${label}.noDiagnosticsImport`,
      !/interaction-diagnostics/.test(prior) &&
        !/createInteractionDiagnosticsReport/.test(prior),
      `${dir} does not import interaction-diagnostics`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 18 — roadmapUpdated                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "roadmapUpdated";
  const roadmap = existsSync(join(repoRoot, ROADMAP)) ? read(ROADMAP) : "";

  assertCase(
    block,
    "roadmap.architectureRef",
    /UX-8-architecture\.md/.test(roadmap),
    "Roadmap references UX-8-architecture.md",
  );

  assertCase(
    block,
    "roadmap.ux88Complete",
    /UX-8\.8\s*=\s*COMPLETE/i.test(roadmap),
    "Roadmap marks UX-8.8 COMPLETE",
  );

  assertCase(
    block,
    "roadmap.tableComplete",
    /UX-8\.8\s*\|\s*Interaction Diagnostics\s*\|\s*COMPLETE/i.test(roadmap),
    "Roadmap phase table marks UX-8.8 COMPLETE",
  );

  assertCase(
    block,
    "roadmap.historicalGate",
    /validate:ux-8\.8/.test(roadmap) && /UX-8\.8\.md/.test(roadmap),
    "Roadmap lists historical gate validate:ux-8.8",
  );

  assertCase(
    block,
    "roadmap.next89",
    /UX-8\.9/.test(roadmap) && /Documentation Freeze/i.test(roadmap),
    "Roadmap lists UX-8.9 Documentation Freeze",
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const failed = results.filter((r) => !r.pass);
const passed = results.filter((r) => r.pass);

const blocks = [
  "documentationExists",
  "moduleExists",
  "reportContract",
  "factorySignature",
  "reportFreeze",
  "queryOnlyFreeze",
  "snapshotFreeze",
  "snapshotIdentityFreeze",
  "statelessDiagnosticsFreeze",
  "registryIndependenceFreeze",
  "reportCompositionFreeze",
  "reportOrderingFreeze",
  "failureTransparencyFreeze",
  "apiFreeze",
  "dependencyRule",
  "authorities",
  "intactSurfaces",
  "roadmapUpdated",
] as const;

console.log("\n=== UX-8.8 Interaction Diagnostics Gate ===\n");

for (const b of blocks) {
  const cases = results.filter((r) => r.block === b);
  const ok = cases.every((c) => c.pass);
  const mark = ok ? "PASS" : "FAIL";
  console.log(
    `${mark}  ${b} (${cases.filter((c) => c.pass).length}/${cases.length})`,
  );
  for (const c of cases.filter((x) => !x.pass)) {
    console.log(`      ✗ ${c.id}: ${c.detail}`);
  }
}

console.log(
  `\nTotal: ${passed.length} passed, ${failed.length} failed, ${results.length} assertions\n`,
);

if (failed.length > 0) {
  process.exit(1);
}

console.log("validate:ux-8.8 → PASS\n");
