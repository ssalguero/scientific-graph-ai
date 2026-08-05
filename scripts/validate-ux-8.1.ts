/**
 * UX-8.1 — Focus System Foundation gate.
 *
 * Blocks:
 * documentationExists · moduleExists · focusStateContract · registryApiFreeze
 * derivedIsFocused · barrelExport · dependencyRule · authorities
 * noProductMount · windowRegistryIntact · roadmapUpdated
 *
 * Architectural principles:
 * - FocusState = { focusedId, lastFocusedId } only — no blurred.
 * - isFocused(id) derived · getState clone-on-read.
 * - Registry Freeze = focus / blur / getState / isFocused / clear.
 * - FocusRegistry = sole authority · Dependency Rule · no product mount.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "documentationExists"
  | "moduleExists"
  | "focusStateContract"
  | "registryApiFreeze"
  | "derivedIsFocused"
  | "barrelExport"
  | "dependencyRule"
  | "authorities"
  | "noProductMount"
  | "windowRegistryIntact"
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

const FOCUS_DIR = "src/ui/focus";
const FOCUS_TYPES = `${FOCUS_DIR}/FocusTypes.ts`;
const FOCUS_STATE = `${FOCUS_DIR}/FocusState.ts`;
const FOCUS_REGISTRY = `${FOCUS_DIR}/FocusRegistry.ts`;
const FOCUS_CONTEXT = `${FOCUS_DIR}/FocusContext.tsx`;
const FOCUS_PROVIDER = `${FOCUS_DIR}/FocusProvider.tsx`;
const FOCUS_HOOK = `${FOCUS_DIR}/useFocus.ts`;
const FOCUS_INDEX = `${FOCUS_DIR}/index.ts`;
const UI_INDEX = "src/ui/index.ts";
const WINDOW_REGISTRY = "src/components/windows/WindowRegistry.ts";
const PAGE_TSX = "src/app/page.tsx";
const ARCH = "docs/UX/UX-8-architecture.md";
const ROADMAP = "docs/UX/UX-8.0-roadmap.md";
const DOC_8_1 = "docs/UX/UX-8.1.md";
const PACKAGE_JSON = "package.json";

const MODULE_FILES = [
  FOCUS_TYPES,
  FOCUS_STATE,
  FOCUS_REGISTRY,
  FOCUS_CONTEXT,
  FOCUS_PROVIDER,
  FOCUS_HOOK,
  FOCUS_INDEX,
] as const;

const FORBIDDEN_EXTRA_METHODS = [
  /\bfindBy\w*\s*\(/,
  /\bcontains\s*\(/,
  /\bsize\s*\(/,
  /\bhas\s*\(/,
  /\bremove\s*\(/,
  /\breplace\s*\(/,
  /\bsetState\s*\(/,
  /\bupdate\s*\(/,
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
    existsSync(join(repoRoot, DOC_8_1)),
    `${DOC_8_1} exists`,
  );

  const pkg = existsSync(join(repoRoot, PACKAGE_JSON))
    ? read(PACKAGE_JSON)
    : "";
  assertCase(
    block,
    "exists.npmScript",
    /"validate:ux-8\.1"\s*:/.test(pkg),
    "package.json has validate:ux-8.1",
  );

  const doc = existsSync(join(repoRoot, DOC_8_1)) ? read(DOC_8_1) : "";
  assertCase(
    block,
    "doc.registryFreeze",
    /Registry Freeze/i.test(doc) &&
      /focus\(\)/.test(doc) &&
      /blur\(\)/.test(doc) &&
      /getState\(\)/.test(doc) &&
      /isFocused\(\)/.test(doc) &&
      /clear\(\)/.test(doc),
    "UX-8.1.md documents Registry Freeze (5 methods)",
  );

  assertCase(
    block,
    "doc.noBlurred",
    /No blurred/i.test(doc) || /sin.*blurred/i.test(doc),
    "UX-8.1.md documents no blurred field",
  );

  assertCase(
    block,
    "doc.dependencyRule",
    /Dependency Rule/i.test(doc),
    "UX-8.1.md documents Dependency Rule",
  );

  assertCase(
    block,
    "doc.authorities",
    /Authorit/i.test(doc) && /FocusRegistry/.test(doc),
    "UX-8.1.md documents Authorities (FocusRegistry)",
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
    existsSync(join(repoRoot, FOCUS_DIR)),
    "src/ui/focus/ exists",
  );

  for (const rel of MODULE_FILES) {
    assertCase(
      block,
      `exists.${rel.split("/").pop()}`,
      existsSync(join(repoRoot, rel)),
      `${rel} exists`,
    );
  }

  const registrySrc = existsSync(join(repoRoot, FOCUS_REGISTRY))
    ? stripComments(read(FOCUS_REGISTRY))
    : "";

  assertCase(
    block,
    "registry.apiInterface",
    /export\s+interface\s+FocusRegistryApi\s*\{/.test(registrySrc),
    "FocusRegistryApi interface exported",
  );

  assertCase(
    block,
    "registry.singleton",
    /export\s+const\s+focusRegistry\s*:\s*FocusRegistryApi\s*=/.test(
      registrySrc,
    ),
    "focusRegistry singleton SSOT exported",
  );

  assertCase(
    block,
    "registry.create",
    /export\s+function\s+createFocusRegistry\s*\(/.test(registrySrc),
    "createFocusRegistry exported",
  );

  assertCase(
    block,
    "registry.noReact",
    !/\bfrom\s+["']react["']/.test(registrySrc) &&
      !/\bfrom\s+["']react-dom["']/.test(registrySrc),
    "FocusRegistry is React-free",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — focusStateContract                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "focusStateContract";
  const src = existsSync(join(repoRoot, FOCUS_STATE))
    ? stripComments(read(FOCUS_STATE))
    : "";
  const body = extractReadonlyTypeBody(src, "FocusState");

  assertCase(
    block,
    "state.focusedId",
    /focusedId\s*:\s*FocusTargetId\s*\|\s*null/.test(body),
    "FocusState.focusedId: FocusTargetId | null",
  );

  assertCase(
    block,
    "state.lastFocusedId",
    /lastFocusedId\s*:\s*FocusTargetId\s*\|\s*null/.test(body),
    "FocusState.lastFocusedId: FocusTargetId | null",
  );

  assertCase(
    block,
    "state.noBlurred",
    !/\bblurred\b/.test(body),
    "FocusState has no blurred field",
  );

  assertCase(
    block,
    "state.onlyTwoFields",
    (body.match(/\b\w+Id\b/g) ?? []).length >= 2 &&
      !/\benabled\b/.test(body) &&
      !/\bvisible\b/.test(body),
    "FocusState only focus id fields",
  );

  assertCase(
    block,
    "state.createFreeze",
    /export\s+function\s+createFocusState/.test(src) &&
      /Object\.freeze/.test(src),
    "createFocusState uses Object.freeze",
  );

  const typesSrc = existsSync(join(repoRoot, FOCUS_TYPES))
    ? stripComments(read(FOCUS_TYPES))
    : "";
  assertCase(
    block,
    "types.FocusTargetId",
    /export\s+type\s+FocusTargetId\s*=/.test(typesSrc) &&
      /export\s+function\s+asFocusTargetId/.test(typesSrc),
    "FocusTargetId + asFocusTargetId exported",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — registryApiFreeze                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "registryApiFreeze";
  const src = existsSync(join(repoRoot, FOCUS_REGISTRY))
    ? stripComments(read(FOCUS_REGISTRY))
    : "";
  const apiBody = extractInterfaceBody(src, "FocusRegistryApi");

  assertCase(
    block,
    "api.focus",
    /\bfocus\s*\(\s*id\s*:\s*FocusTargetId\s*\)\s*:\s*void/.test(apiBody),
    "FocusRegistryApi.focus(id): void",
  );

  assertCase(
    block,
    "api.blur",
    /\bblur\s*\(\s*\)\s*:\s*void/.test(apiBody),
    "FocusRegistryApi.blur(): void",
  );

  assertCase(
    block,
    "api.getState",
    /\bgetState\s*\(\s*\)\s*:\s*FocusState/.test(apiBody),
    "FocusRegistryApi.getState(): FocusState",
  );

  assertCase(
    block,
    "api.isFocused",
    /\bisFocused\s*\(\s*id\s*:\s*FocusTargetId\s*\)\s*:\s*boolean/.test(
      apiBody,
    ),
    "FocusRegistryApi.isFocused(id): boolean",
  );

  assertCase(
    block,
    "api.clear",
    /\bclear\s*\(\s*\)\s*:\s*void/.test(apiBody),
    "FocusRegistryApi.clear(): void",
  );

  const methodCount = (apiBody.match(/\b\w+\s*\(/g) ?? []).length;
  assertCase(
    block,
    "api.exactlyFiveMethods",
    methodCount === 5,
    `FocusRegistryApi has exactly 5 methods (found ${methodCount})`,
  );

  assertCase(
    block,
    "api.noForbiddenExtras",
    !FORBIDDEN_EXTRA_METHODS.some((re) => re.test(apiBody)),
    "FocusRegistryApi has no forbidden extra methods",
  );

  assertCase(
    block,
    "api.cloneOnRead",
    /getState\s*\(\s*\)\s*:\s*FocusState\s*\{[\s\S]*createFocusState/.test(
      src,
    ),
    "getState uses createFocusState (clone-on-read)",
  );

  assertCase(
    block,
    "api.objectFreezeApi",
    /return\s+Object\.freeze\s*\(\s*\{/.test(src),
    "createFocusRegistry returns Object.freeze({...})",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — derivedIsFocused                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "derivedIsFocused";
  const src = existsSync(join(repoRoot, FOCUS_REGISTRY))
    ? stripComments(read(FOCUS_REGISTRY))
    : "";

  assertCase(
    block,
    "isFocused.derivedEquals",
    /isFocused\s*\(\s*id\s*:\s*FocusTargetId\s*\)\s*:\s*boolean\s*\{[\s\S]*?return\s+focusedId\s*===\s*id/.test(
      src,
    ),
    "isFocused derives from focusedId === id",
  );

  assertCase(
    block,
    "isFocused.notStoredOnState",
    (() => {
      const stateSrc = existsSync(join(repoRoot, FOCUS_STATE))
        ? stripComments(read(FOCUS_STATE))
        : "";
      const body = extractReadonlyTypeBody(stateSrc, "FocusState");
      return !/\bisFocused\b/.test(body);
    })(),
    "isFocused is not a FocusState field",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — barrelExport                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "barrelExport";
  const indexSrc = existsSync(join(repoRoot, FOCUS_INDEX))
    ? stripComments(read(FOCUS_INDEX))
    : "";
  const uiIndex = existsSync(join(repoRoot, UI_INDEX))
    ? stripComments(read(UI_INDEX))
    : "";

  const requiredExports = [
    "FocusTargetId",
    "asFocusTargetId",
    "FocusState",
    "createFocusState",
    "FocusRegistryApi",
    "createFocusRegistry",
    "focusRegistry",
    "FocusContext",
    "FocusContextValue",
    "FocusProvider",
    "useFocus",
  ];

  for (const name of requiredExports) {
    assertCase(
      block,
      `barrel.${name}`,
      new RegExp(`\\b${name}\\b`).test(indexSrc),
      `index.ts exports ${name}`,
    );
  }

  assertCase(
    block,
    "barrel.notInPublicUi",
    !/\bfocus\b/i.test(uiIndex) ||
      (!/from\s+["']\.\/focus["']/.test(uiIndex) &&
        !/from\s+["']\.\/focus\//.test(uiIndex)),
    "src/ui/index.ts does not re-export focus module",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — dependencyRule                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "dependencyRule";
  const focusFiles = walkFiles(join(repoRoot, FOCUS_DIR));
  const allRaw = focusFiles.map((f) => readFileSync(f, "utf8")).join("\n");
  const all = stripComments(allRaw);

  assertCase(
    block,
    "dep.noWindows",
    !/components\/windows/.test(all) &&
      !/from\s+["'][^"']*windows[^"']*["']/.test(all) &&
      !/\bWindowRegistry\b/.test(all) &&
      !/\bWindowManager\b/.test(all) &&
      !/\bWindowAPI\b/.test(all),
    "focus/** does not import windows/** or WindowRegistry",
  );

  assertCase(
    block,
    "dep.noForeignRegistry",
    !/from\s+["'][^"']*\/(commands|visibility|features|selection|hover|clipboard|shortcuts|menus)[^"']*["']/.test(
      all,
    ) &&
      !/\bCommandRegistry\b/.test(all) &&
      !/\bVisibilityRegistry\b/.test(all) &&
      !/\bFeatureRegistry\b/.test(all),
    "focus/** does not import foreign Registry modules",
  );

  assertCase(
    block,
    "dep.noForeignProviderContext",
    !/\bCommandProvider\b/.test(all) &&
      !/\bCommandContext\b/.test(all) &&
      !/\bFeatureProvider\b/.test(all) &&
      !/\bVisibilityProvider\b/.test(all) &&
      !/\bActivePanelProvider\b/.test(all),
    "focus/** does not import foreign Provider/Context",
  );

  assertCase(
    block,
    "dep.noScientific",
    !/lib\/scientific/.test(all) && !/\bsrc\/lib\/graph\b/.test(all),
    "focus/** does not import scientific / graph engines",
  );

  const arch = existsSync(join(repoRoot, ARCH)) ? read(ARCH) : "";
  assertCase(
    block,
    "dep.architectureDocumentsRule",
    /Dependency Rule/i.test(arch),
    "UX-8-architecture.md documents Dependency Rule",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — authorities                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "authorities";
  const arch = existsSync(join(repoRoot, ARCH)) ? read(ARCH) : "";
  const doc = existsSync(join(repoRoot, DOC_8_1)) ? read(DOC_8_1) : "";

  assertCase(
    block,
    "auth.matrixFocus",
    /Focus\s*\|\s*`?FocusRegistry`?/i.test(arch) ||
      (/Authorities Matrix/i.test(arch) && /FocusRegistry/.test(arch)),
    "Architecture Authorities Matrix lists Focus → FocusRegistry",
  );

  assertCase(
    block,
    "auth.noCrossMutation",
    /Ningún registry puede modificar/i.test(arch) ||
      /no registry can modify/i.test(arch) ||
      /cross-registry mutation/i.test(arch),
    "Architecture documents no cross-registry mutation",
  );

  assertCase(
    block,
    "auth.docSoleAuthority",
    /única autoridad|sole.*authority|FocusRegistry.*authority/i.test(doc),
    "UX-8.1.md documents FocusRegistry as sole authority",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — noProductMount                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noProductMount";
  const page = existsSync(join(repoRoot, PAGE_TSX)) ? read(PAGE_TSX) : "";
  const uiIndex = existsSync(join(repoRoot, UI_INDEX)) ? read(UI_INDEX) : "";

  const appShellFiles = walkFiles(join(repoRoot, "src/components/app-shell"));
  const appShellRaw = appShellFiles
    .map((f) => readFileSync(f, "utf8"))
    .join("\n");

  assertCase(
    block,
    "mount.noPageFocusProvider",
    !/\bFocusProvider\b/.test(page) && !/ui\/focus/.test(page),
    "page.tsx does not mount FocusProvider",
  );

  assertCase(
    block,
    "mount.noAppShellFocus",
    !/\bFocusProvider\b/.test(appShellRaw) && !/ui\/focus/.test(appShellRaw),
    "AppShell does not mount FocusProvider",
  );

  assertCase(
    block,
    "mount.noPublicBarrel",
    !/from\s+["']\.\/focus["']/.test(uiIndex) &&
      !/from\s+["']\.\/focus\//.test(uiIndex),
    "@/ui barrel does not export focus",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 10 — windowRegistryIntact                                             */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "windowRegistryIntact";
  const wr = existsSync(join(repoRoot, WINDOW_REGISTRY))
    ? stripComments(read(WINDOW_REGISTRY))
    : "";

  assertCase(
    block,
    "window.exists",
    existsSync(join(repoRoot, WINDOW_REGISTRY)),
    "WindowRegistry.ts still exists",
  );

  assertCase(
    block,
    "window.apiSurface",
    /export\s+type\s+WindowRegistry\s*=/.test(wr) &&
      /\bregister\s*\(/.test(wr) &&
      /\bunregister\s*\(/.test(wr) &&
      /\bhas\s*\(/.test(wr) &&
      /\bget\s*\(/.test(wr) &&
      /\bgetAll\s*\(/.test(wr),
    "WindowRegistry API surface intact",
  );

  assertCase(
    block,
    "window.noFocusImport",
    !/ui\/focus/.test(wr) && !/\bfocusRegistry\b/.test(wr),
    "WindowRegistry does not import focus module",
  );

  const focusAll = walkFiles(join(repoRoot, FOCUS_DIR))
    .map((f) => readFileSync(f, "utf8"))
    .join("\n");
  assertCase(
    block,
    "focus.noWindowRegistryImport",
    !/WindowRegistry/.test(stripComments(focusAll)),
    "focus/** does not reference WindowRegistry",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 11 — roadmapUpdated                                                   */
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
    "roadmap.ux81Complete",
    /UX-8\.1\s*=\s*COMPLETE/i.test(roadmap) ||
      (/UX-8\.1/.test(roadmap) && /Focus System Foundation/.test(roadmap) &&
        /COMPLETE/.test(roadmap)),
    "Roadmap marks UX-8.1 COMPLETE",
  );

  assertCase(
    block,
    "roadmap.next82",
    /UX-8\.2/.test(roadmap) && /Selection/i.test(roadmap),
    "Roadmap lists UX-8.2 Selection",
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
  "focusStateContract",
  "registryApiFreeze",
  "derivedIsFocused",
  "barrelExport",
  "dependencyRule",
  "authorities",
  "noProductMount",
  "windowRegistryIntact",
  "roadmapUpdated",
] as const;

console.log("UX-8.1 Focus System Foundation — validation\n");

for (const b of blocks) {
  const blockResults = results.filter((r) => r.block === b);
  const ok = blockResults.every((r) => r.pass);
  const label = ok ? "PASS" : "FAIL";
  console.log(
    `  [${label}] ${b} (${blockResults.filter((r) => r.pass).length}/${blockResults.length})`,
  );
  for (const r of blockResults.filter((x) => !x.pass)) {
    console.log(`         ✗ ${r.id}: ${r.detail}`);
  }
}

console.log(
  `\nResult: ${failed.length === 0 ? "PASS" : "FAIL"} ${passed.length}/${results.length}`,
);

if (failed.length > 0) {
  process.exitCode = 1;
}
