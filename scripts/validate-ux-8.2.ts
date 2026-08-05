/**
 * UX-8.2 — Selection Foundation gate.
 *
 * Blocks:
 * documentationExists · moduleExists · selectionStateContract · registryApiFreeze
 * independenceFreeze · barrelExport · dependencyRule · authorities
 * noProductMount · windowRegistryIntact · roadmapUpdated
 *
 * Architectural principles:
 * - SelectionState = { selectedWindowId, selectedContentId, selectedSeriesId } only.
 * - Independence Freeze · select* mutates only its axis.
 * - Registry Freeze = selectWindow / selectContent / selectSeries / clear / get / getState.
 * - API Stability Freeze = get() ≡ getState().
 * - Singleton Freeze = infra/testing only · React via Provider + useSelection.
 * - SelectionRegistry = sole authority · Dependency Rule · no product mount.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "documentationExists"
  | "moduleExists"
  | "selectionStateContract"
  | "registryApiFreeze"
  | "independenceFreeze"
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

function extractMethodBody(src: string, methodName: string): string {
  const re = new RegExp(`${methodName}\\s*\\([^)]*\\)\\s*:\\s*\\w+\\s*\\{`);
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

const SELECTION_DIR = "src/ui/selection";
const SELECTION_TYPES = `${SELECTION_DIR}/SelectionTypes.ts`;
const SELECTION_STATE = `${SELECTION_DIR}/SelectionState.ts`;
const SELECTION_REGISTRY = `${SELECTION_DIR}/SelectionRegistry.ts`;
const SELECTION_CONTEXT = `${SELECTION_DIR}/SelectionContext.tsx`;
const SELECTION_PROVIDER = `${SELECTION_DIR}/SelectionProvider.tsx`;
const SELECTION_HOOK = `${SELECTION_DIR}/useSelection.ts`;
const SELECTION_INDEX = `${SELECTION_DIR}/index.ts`;
const UI_INDEX = "src/ui/index.ts";
const WINDOW_REGISTRY = "src/components/windows/WindowRegistry.ts";
const PAGE_TSX = "src/app/page.tsx";
const ARCH = "docs/UX/UX-8-architecture.md";
const ROADMAP = "docs/UX/UX-8.0-roadmap.md";
const DOC_8_2 = "docs/UX/UX-8.2.md";
const PACKAGE_JSON = "package.json";

const MODULE_FILES = [
  SELECTION_TYPES,
  SELECTION_STATE,
  SELECTION_REGISTRY,
  SELECTION_CONTEXT,
  SELECTION_PROVIDER,
  SELECTION_HOOK,
  SELECTION_INDEX,
] as const;

const FORBIDDEN_EXTRA_METHODS = [
  /\btoggle\s*\(/,
  /\brange\s*\(/,
  /\bisSelected\s*\(/,
  /\bclearWindow\s*\(/,
  /\bclearContent\s*\(/,
  /\bclearSeries\s*\(/,
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
    existsSync(join(repoRoot, DOC_8_2)),
    `${DOC_8_2} exists`,
  );

  const pkg = existsSync(join(repoRoot, PACKAGE_JSON))
    ? read(PACKAGE_JSON)
    : "";
  assertCase(
    block,
    "exists.npmScript",
    /"validate:ux-8\.2"\s*:/.test(pkg),
    "package.json has validate:ux-8.2",
  );

  const doc = existsSync(join(repoRoot, DOC_8_2)) ? read(DOC_8_2) : "";

  assertCase(
    block,
    "doc.apiFreeze",
    /API Freeze/i.test(doc) &&
      /selectWindow\(\)/.test(doc) &&
      /selectContent\(\)/.test(doc) &&
      /selectSeries\(\)/.test(doc) &&
      /clear\(\)/.test(doc) &&
      /get\(\)/.test(doc) &&
      /getState\(\)/.test(doc),
    "UX-8.2.md documents API Freeze (6 methods)",
  );

  assertCase(
    block,
    "doc.apiStabilityFreeze",
    /API Stability Freeze/i.test(doc) &&
      (/equivalen/i.test(doc) || /equivalent/i.test(doc)) &&
      /get\(\)/.test(doc) &&
      /getState\(\)/.test(doc) &&
      (/no.*asumir diferencias|must not assume|no behavioral differences/i.test(
        doc,
      ) ||
        /diferencias de comportamiento/i.test(doc)),
    "UX-8.2.md documents API Stability Freeze (get ≡ getState)",
  );

  assertCase(
    block,
    "doc.singletonFreeze",
    /Singleton Freeze/i.test(doc) &&
      /SelectionProvider/.test(doc) &&
      /useSelection/.test(doc) &&
      (/infraestructura|infrastructure/i.test(doc) || /testing/i.test(doc)),
    "UX-8.2.md documents Singleton Freeze",
  );

  assertCase(
    block,
    "doc.independenceFreeze",
    /Independence Freeze/i.test(doc) &&
      (/mixed null|Mixed null|nulls are valid|null.*valid/i.test(doc) ||
        /ejes.*independ/i.test(doc)),
    "UX-8.2.md documents Independence Freeze",
  );

  assertCase(
    block,
    "doc.dependencyRule",
    /Dependency Rule/i.test(doc),
    "UX-8.2.md documents Dependency Rule",
  );

  assertCase(
    block,
    "doc.authorities",
    /Authorit/i.test(doc) && /SelectionRegistry/.test(doc),
    "UX-8.2.md documents Authorities (SelectionRegistry)",
  );

  assertCase(
    block,
    "doc.integrationFence",
    /Integration Fence/i.test(doc) || /Exclusions/i.test(doc),
    "UX-8.2.md documents Integration Fence / Exclusions",
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
    existsSync(join(repoRoot, SELECTION_DIR)),
    "src/ui/selection/ exists",
  );

  for (const rel of MODULE_FILES) {
    assertCase(
      block,
      `exists.${rel.split("/").pop()}`,
      existsSync(join(repoRoot, rel)),
      `${rel} exists`,
    );
  }

  assertCase(
    block,
    "exists.sevenFiles",
    MODULE_FILES.every((rel) => existsSync(join(repoRoot, rel))),
    "Exactly seven module files present",
  );

  const registrySrc = existsSync(join(repoRoot, SELECTION_REGISTRY))
    ? stripComments(read(SELECTION_REGISTRY))
    : "";

  assertCase(
    block,
    "registry.apiInterface",
    /export\s+interface\s+SelectionRegistryApi\s*\{/.test(registrySrc),
    "SelectionRegistryApi interface exported",
  );

  assertCase(
    block,
    "registry.singleton",
    /export\s+const\s+selectionRegistry\s*:\s*SelectionRegistryApi\s*=/.test(
      registrySrc,
    ),
    "selectionRegistry singleton SSOT exported",
  );

  assertCase(
    block,
    "registry.create",
    /export\s+function\s+createSelectionRegistry\s*\(/.test(registrySrc),
    "createSelectionRegistry exported",
  );

  assertCase(
    block,
    "registry.noReact",
    !/\bfrom\s+["']react["']/.test(registrySrc) &&
      !/\bfrom\s+["']react-dom["']/.test(registrySrc),
    "SelectionRegistry is React-free",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — selectionStateContract                                           */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "selectionStateContract";
  const src = existsSync(join(repoRoot, SELECTION_STATE))
    ? stripComments(read(SELECTION_STATE))
    : "";
  const body = extractReadonlyTypeBody(src, "SelectionState");

  assertCase(
    block,
    "state.selectedWindowId",
    /selectedWindowId\s*:\s*SelectionWindowId\s*\|\s*null/.test(body),
    "SelectionState.selectedWindowId: SelectionWindowId | null",
  );

  assertCase(
    block,
    "state.selectedContentId",
    /selectedContentId\s*:\s*SelectionContentId\s*\|\s*null/.test(body),
    "SelectionState.selectedContentId: SelectionContentId | null",
  );

  assertCase(
    block,
    "state.selectedSeriesId",
    /selectedSeriesId\s*:\s*SelectionSeriesId\s*\|\s*null/.test(body),
    "SelectionState.selectedSeriesId: SelectionSeriesId | null",
  );

  assertCase(
    block,
    "state.noArraysSetsMaps",
    !/\bArray\b/.test(body) &&
      !/\bSet\b/.test(body) &&
      !/\bMap\b/.test(body) &&
      !/\[\]/.test(body),
    "SelectionState has no arrays / Set / Map",
  );

  assertCase(
    block,
    "state.noMetadata",
    !/\bmetadata\b/.test(body) &&
      !/\btimestamp\b/.test(body) &&
      !/\bownership\b/.test(body),
    "SelectionState has no metadata / timestamps / ownership",
  );

  assertCase(
    block,
    "state.createFreeze",
    /export\s+function\s+createSelectionState/.test(src) &&
      /Object\.freeze/.test(src),
    "createSelectionState uses Object.freeze",
  );

  assertCase(
    block,
    "state.emptyConstant",
    /export\s+const\s+EMPTY_SELECTION_STATE/.test(src),
    "EMPTY_SELECTION_STATE exported",
  );

  const typesSrc = existsSync(join(repoRoot, SELECTION_TYPES))
    ? stripComments(read(SELECTION_TYPES))
    : "";
  assertCase(
    block,
    "types.brandedIds",
    /export\s+type\s+SelectionWindowId\s*=/.test(typesSrc) &&
      /export\s+type\s+SelectionContentId\s*=/.test(typesSrc) &&
      /export\s+type\s+SelectionSeriesId\s*=/.test(typesSrc) &&
      /export\s+function\s+asSelectionWindowId/.test(typesSrc) &&
      /export\s+function\s+asSelectionContentId/.test(typesSrc) &&
      /export\s+function\s+asSelectionSeriesId/.test(typesSrc),
    "Branded IDs + casters exported",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — registryApiFreeze                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "registryApiFreeze";
  const src = existsSync(join(repoRoot, SELECTION_REGISTRY))
    ? stripComments(read(SELECTION_REGISTRY))
    : "";
  const apiBody = extractInterfaceBody(src, "SelectionRegistryApi");

  assertCase(
    block,
    "api.selectWindow",
    /\bselectWindow\s*\(\s*id\s*:\s*SelectionWindowId\s*\)\s*:\s*void/.test(
      apiBody,
    ),
    "SelectionRegistryApi.selectWindow(id): void",
  );

  assertCase(
    block,
    "api.selectContent",
    /\bselectContent\s*\(\s*id\s*:\s*SelectionContentId\s*\)\s*:\s*void/.test(
      apiBody,
    ),
    "SelectionRegistryApi.selectContent(id): void",
  );

  assertCase(
    block,
    "api.selectSeries",
    /\bselectSeries\s*\(\s*id\s*:\s*SelectionSeriesId\s*\)\s*:\s*void/.test(
      apiBody,
    ),
    "SelectionRegistryApi.selectSeries(id): void",
  );

  assertCase(
    block,
    "api.clear",
    /\bclear\s*\(\s*\)\s*:\s*void/.test(apiBody),
    "SelectionRegistryApi.clear(): void",
  );

  assertCase(
    block,
    "api.get",
    /\bget\s*\(\s*\)\s*:\s*SelectionState/.test(apiBody),
    "SelectionRegistryApi.get(): SelectionState",
  );

  assertCase(
    block,
    "api.getState",
    /\bgetState\s*\(\s*\)\s*:\s*SelectionState/.test(apiBody),
    "SelectionRegistryApi.getState(): SelectionState",
  );

  const methodCount = (apiBody.match(/\b\w+\s*\(/g) ?? []).length;
  assertCase(
    block,
    "api.exactlySixMethods",
    methodCount === 6,
    `SelectionRegistryApi has exactly 6 methods (found ${methodCount})`,
  );

  assertCase(
    block,
    "api.noForbiddenExtras",
    !FORBIDDEN_EXTRA_METHODS.some((re) => re.test(apiBody)),
    "SelectionRegistryApi has no forbidden extra methods",
  );

  assertCase(
    block,
    "api.cloneOnRead.get",
    /get\s*\(\s*\)\s*:\s*SelectionState\s*\{[\s\S]*?(?:createSelectionState|snapshot\s*\()/.test(
      src,
    ),
    "get uses createSelectionState / snapshot (clone-on-read)",
  );

  assertCase(
    block,
    "api.cloneOnRead.getState",
    /getState\s*\(\s*\)\s*:\s*SelectionState\s*\{[\s\S]*?(?:createSelectionState|snapshot\s*\()/.test(
      src,
    ),
    "getState uses createSelectionState / snapshot (clone-on-read)",
  );

  assertCase(
    block,
    "api.objectFreezeApi",
    /return\s+Object\.freeze\s*\(\s*\{/.test(src),
    "createSelectionRegistry returns Object.freeze({...})",
  );

  const registryRaw = existsSync(join(repoRoot, SELECTION_REGISTRY))
    ? read(SELECTION_REGISTRY)
    : "";
  assertCase(
    block,
    "api.stabilityNoteInRegistry",
    /get\(\)\s+and\s+getState\(\)\s+are\s+intentionally\s+equivalent/i.test(
      registryRaw,
    ) ||
      (/equivalent/i.test(registryRaw) &&
        /get\(\)/.test(registryRaw) &&
        /getState\(\)/.test(registryRaw)),
    "SelectionRegistry documents get ≡ getState",
  );

  assertCase(
    block,
    "api.singletonFreezeNote",
    /infrastructure/i.test(registryRaw) &&
      /testing/i.test(registryRaw) &&
      /SelectionProvider/.test(registryRaw) &&
      /useSelection/.test(registryRaw),
    "SelectionRegistry documents Singleton Freeze",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — independenceFreeze                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "independenceFreeze";
  const src = existsSync(join(repoRoot, SELECTION_REGISTRY))
    ? stripComments(read(SELECTION_REGISTRY))
    : "";
  const doc = existsSync(join(repoRoot, DOC_8_2)) ? read(DOC_8_2) : "";

  const selectWindowBody = extractMethodBody(src, "selectWindow");
  const selectContentBody = extractMethodBody(src, "selectContent");
  const selectSeriesBody = extractMethodBody(src, "selectSeries");
  const clearBody = extractMethodBody(src, "clear");

  assertCase(
    block,
    "indep.selectWindowOnlyWindow",
    /selectedWindowId\s*=/.test(selectWindowBody) &&
      !/selectedContentId\s*=/.test(selectWindowBody) &&
      !/selectedSeriesId\s*=/.test(selectWindowBody),
    "selectWindow mutates only selectedWindowId",
  );

  assertCase(
    block,
    "indep.selectContentOnlyContent",
    /selectedContentId\s*=/.test(selectContentBody) &&
      !/selectedWindowId\s*=/.test(selectContentBody) &&
      !/selectedSeriesId\s*=/.test(selectContentBody),
    "selectContent mutates only selectedContentId",
  );

  assertCase(
    block,
    "indep.selectSeriesOnlySeries",
    /selectedSeriesId\s*=/.test(selectSeriesBody) &&
      !/selectedWindowId\s*=/.test(selectSeriesBody) &&
      !/selectedContentId\s*=/.test(selectSeriesBody),
    "selectSeries mutates only selectedSeriesId",
  );

  assertCase(
    block,
    "indep.clearResetsAll",
    /selectedWindowId\s*=\s*null/.test(clearBody) &&
      /selectedContentId\s*=\s*null/.test(clearBody) &&
      /selectedSeriesId\s*=\s*null/.test(clearBody),
    "clear() resets all three axes to null",
  );

  assertCase(
    block,
    "indep.docMixedNullExample",
    /WindowA|selectedWindowId\s*=/.test(doc) &&
      /null/.test(doc) &&
      (/Series17|Series\s*17|selectedSeriesId/i.test(doc)),
    "UX-8.2.md documents mixed-null Independence example",
  );

  assertCase(
    block,
    "indep.docNoHierarchy",
    /no hierarchy|no.*jerarqu|completely independent|completamente independientes/i.test(
      doc,
    ),
    "UX-8.2.md documents no hierarchy / complete independence",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — barrelExport                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "barrelExport";
  const indexSrc = existsSync(join(repoRoot, SELECTION_INDEX))
    ? stripComments(read(SELECTION_INDEX))
    : "";
  const uiIndex = existsSync(join(repoRoot, UI_INDEX))
    ? stripComments(read(UI_INDEX))
    : "";

  const requiredExports = [
    "SelectionWindowId",
    "SelectionContentId",
    "SelectionSeriesId",
    "asSelectionWindowId",
    "asSelectionContentId",
    "asSelectionSeriesId",
    "SelectionState",
    "createSelectionState",
    "EMPTY_SELECTION_STATE",
    "SelectionRegistryApi",
    "createSelectionRegistry",
    "selectionRegistry",
    "SelectionContext",
    "SelectionContextValue",
    "SelectionProvider",
    "useSelection",
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
    !/from\s+["']\.\/selection["']/.test(uiIndex) &&
      !/from\s+["']\.\/selection\//.test(uiIndex),
    "src/ui/index.ts does not re-export selection module",
  );

  const indexRaw = existsSync(join(repoRoot, SELECTION_INDEX))
    ? read(SELECTION_INDEX)
    : "";
  assertCase(
    block,
    "barrel.localOnlyComment",
    /Not re-exported from @\/ui/i.test(indexRaw) ||
      /not re-exported/i.test(indexRaw),
    "index.ts comments that module is not exported globally",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — dependencyRule                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "dependencyRule";
  const selectionFiles = walkFiles(join(repoRoot, SELECTION_DIR));
  const allRaw = selectionFiles.map((f) => readFileSync(f, "utf8")).join("\n");
  const all = stripComments(allRaw);

  assertCase(
    block,
    "dep.noWindows",
    !/components\/windows/.test(all) &&
      !/from\s+["'][^"']*windows[^"']*["']/.test(all) &&
      !/\bWindowRegistry\b/.test(all) &&
      !/\bWindowManager\b/.test(all) &&
      !/\bWindowAPI\b/.test(all) &&
      !/\bWindowTypes\b/.test(all),
    "selection/** does not import windows/** or WindowRegistry",
  );

  assertCase(
    block,
    "dep.noFocus",
    !/from\s+["'][^"']*\/focus[^"']*["']/.test(all) &&
      !/\bFocusRegistry\b/.test(all) &&
      !/\bFocusProvider\b/.test(all) &&
      !/\bFocusContext\b/.test(all) &&
      !/\buseFocus\b/.test(all),
    "selection/** does not import Focus module",
  );

  assertCase(
    block,
    "dep.noForeignRegistry",
    !/from\s+["'][^"']*\/(commands|visibility|features|hover|clipboard|shortcuts|menus|focus)[^"']*["']/.test(
      all,
    ) &&
      !/\bCommandRegistry\b/.test(all) &&
      !/\bVisibilityRegistry\b/.test(all) &&
      !/\bFeatureRegistry\b/.test(all) &&
      !/\bHoverRegistry\b/.test(all),
    "selection/** does not import foreign Registry modules",
  );

  assertCase(
    block,
    "dep.noForeignProviderContext",
    !/\bCommandProvider\b/.test(all) &&
      !/\bCommandContext\b/.test(all) &&
      !/\bFeatureProvider\b/.test(all) &&
      !/\bVisibilityProvider\b/.test(all) &&
      !/\bActivePanelProvider\b/.test(all) &&
      !/\bHoverProvider\b/.test(all) &&
      !/\bHoverContext\b/.test(all),
    "selection/** does not import foreign Provider/Context",
  );

  assertCase(
    block,
    "dep.noScientific",
    !/lib\/scientific/.test(all) && !/\bsrc\/lib\/graph\b/.test(all),
    "selection/** does not import scientific / graph engines",
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
  const doc = existsSync(join(repoRoot, DOC_8_2)) ? read(DOC_8_2) : "";

  assertCase(
    block,
    "auth.matrixSelection",
    /Selection\s*\|\s*`?SelectionRegistry`?/i.test(arch) ||
      (/Authorities Matrix/i.test(arch) && /SelectionRegistry/.test(arch)),
    "Architecture Authorities Matrix lists Selection → SelectionRegistry",
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
    /única autoridad|sole.*authority|SelectionRegistry.*authority/i.test(doc),
    "UX-8.2.md documents SelectionRegistry as sole authority",
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
    "mount.noPageSelectionProvider",
    !/\bSelectionProvider\b/.test(page) && !/ui\/selection/.test(page),
    "page.tsx does not mount SelectionProvider",
  );

  assertCase(
    block,
    "mount.noAppShellSelection",
    !/\bSelectionProvider\b/.test(appShellRaw) &&
      !/ui\/selection/.test(appShellRaw),
    "AppShell does not mount SelectionProvider",
  );

  assertCase(
    block,
    "mount.noPublicBarrel",
    !/from\s+["']\.\/selection["']/.test(uiIndex) &&
      !/from\s+["']\.\/selection\//.test(uiIndex),
    "@/ui barrel does not export selection",
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
    "window.noSelectionImport",
    !/ui\/selection/.test(wr) && !/\bselectionRegistry\b/.test(wr),
    "WindowRegistry does not import selection module",
  );

  const selectionAll = walkFiles(join(repoRoot, SELECTION_DIR))
    .map((f) => readFileSync(f, "utf8"))
    .join("\n");
  assertCase(
    block,
    "selection.noWindowRegistryImport",
    !/WindowRegistry/.test(stripComments(selectionAll)),
    "selection/** does not reference WindowRegistry",
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
    "roadmap.ux82Complete",
    /UX-8\.2\s*=\s*COMPLETE/i.test(roadmap) ||
      (/UX-8\.2/.test(roadmap) &&
        /Selection Foundation/.test(roadmap) &&
        /COMPLETE/.test(roadmap)),
    "Roadmap marks UX-8.2 COMPLETE",
  );

  assertCase(
    block,
    "roadmap.tableComplete",
    /UX-8\.2\s*\|\s*Selection Foundation\s*\|\s*COMPLETE/i.test(roadmap),
    "Roadmap phase table marks UX-8.2 COMPLETE",
  );

  assertCase(
    block,
    "roadmap.next83",
    /UX-8\.3/.test(roadmap) && /Multi Selection/i.test(roadmap),
    "Roadmap lists UX-8.3 Multi Selection",
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
  "selectionStateContract",
  "registryApiFreeze",
  "independenceFreeze",
  "barrelExport",
  "dependencyRule",
  "authorities",
  "noProductMount",
  "windowRegistryIntact",
  "roadmapUpdated",
] as const;

console.log("UX-8.2 Selection Foundation — validation\n");

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
