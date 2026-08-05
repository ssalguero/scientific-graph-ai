/**
 * UX-8.4 — Hover System Foundation gate.
 *
 * Blocks:
 * documentationExists · moduleExists · hoverStateContract · registryApiFreeze
 * apiStabilityFreeze · independenceFreeze · barrelExport · dependencyRule
 * authorities · noProductMount · windowRegistryIntact · roadmapUpdated
 *
 * Architectural principles:
 * - HoverState = { hoveredWindowId, hoveredContentId, hoveredSeriesId } only.
 * - Hover Semantics Freeze · current state only · no enter/leave/history.
 * - Registry Freeze = hoverWindow / hoverContent / hoverSeries / clear / get / getState.
 * - API Stability Freeze = get() ≡ getState().
 * - Singleton Freeze = infra/testing only · React via Provider + useHover.
 * - HoverRegistry = sole authority · Dependency Rule · no product mount.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "documentationExists"
  | "moduleExists"
  | "hoverStateContract"
  | "registryApiFreeze"
  | "apiStabilityFreeze"
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

const HOVER_DIR = "src/ui/hover";
const HOVER_TYPES = `${HOVER_DIR}/HoverTypes.ts`;
const HOVER_STATE = `${HOVER_DIR}/HoverState.ts`;
const HOVER_REGISTRY = `${HOVER_DIR}/HoverRegistry.ts`;
const HOVER_CONTEXT = `${HOVER_DIR}/HoverContext.tsx`;
const HOVER_PROVIDER = `${HOVER_DIR}/HoverProvider.tsx`;
const HOVER_HOOK = `${HOVER_DIR}/useHover.ts`;
const HOVER_INDEX = `${HOVER_DIR}/index.ts`;
const UI_INDEX = "src/ui/index.ts";
const WINDOW_REGISTRY = "src/components/windows/WindowRegistry.ts";
const PAGE_TSX = "src/app/page.tsx";
const ARCH = "docs/UX/UX-8-architecture.md";
const ROADMAP = "docs/UX/UX-8.0-roadmap.md";
const DOC_8_4 = "docs/UX/UX-8.4.md";
const PACKAGE_JSON = "package.json";

const MODULE_FILES = [
  HOVER_TYPES,
  HOVER_STATE,
  HOVER_REGISTRY,
  HOVER_CONTEXT,
  HOVER_PROVIDER,
  HOVER_HOOK,
  HOVER_INDEX,
] as const;

const FORBIDDEN_EXTRA_METHODS = [
  /\benter\s*\(/,
  /\bleave\s*\(/,
  /\bisHovered\s*\(/,
  /\bhasHover\s*\(/,
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
    existsSync(join(repoRoot, DOC_8_4)),
    `${DOC_8_4} exists`,
  );

  const pkg = existsSync(join(repoRoot, PACKAGE_JSON))
    ? read(PACKAGE_JSON)
    : "";
  assertCase(
    block,
    "exists.npmScript",
    /"validate:ux-8\.4"\s*:/.test(pkg),
    "package.json has validate:ux-8.4",
  );

  const doc = existsSync(join(repoRoot, DOC_8_4)) ? read(DOC_8_4) : "";

  assertCase(
    block,
    "doc.ssotRef",
    /UX-8-architecture\.md/.test(doc),
    "UX-8.4.md references architecture SSOT",
  );

  assertCase(
    block,
    "doc.apiFreeze",
    /API Freeze/i.test(doc) &&
      /hoverWindow\(\)/.test(doc) &&
      /hoverContent\(\)/.test(doc) &&
      /hoverSeries\(\)/.test(doc) &&
      /clear\(\)/.test(doc) &&
      /get\(\)/.test(doc) &&
      /getState\(\)/.test(doc),
    "UX-8.4.md documents API Freeze (6 methods)",
  );

  assertCase(
    block,
    "doc.hoverSemanticsFreeze",
    /Hover Semantics Freeze/i.test(doc) &&
      (/current state|estado actual/i.test(doc) || /no enter/i.test(doc)) &&
      (/mixed null|Mixed null|nulls are valid|null.*valid/i.test(doc) ||
        /ejes.*independ/i.test(doc)),
    "UX-8.4.md documents Hover Semantics Freeze",
  );

  assertCase(
    block,
    "doc.singletonFreeze",
    /Singleton Freeze/i.test(doc) &&
      /HoverProvider/.test(doc) &&
      /useHover/.test(doc) &&
      (/infraestructura|infrastructure/i.test(doc) || /testing/i.test(doc)),
    "UX-8.4.md documents Singleton Freeze",
  );

  assertCase(
    block,
    "doc.dependencyRule",
    /Dependency Rule/i.test(doc),
    "UX-8.4.md documents Dependency Rule",
  );

  assertCase(
    block,
    "doc.authorities",
    /Authorit/i.test(doc) && /HoverRegistry/.test(doc),
    "UX-8.4.md documents Authorities (HoverRegistry)",
  );

  assertCase(
    block,
    "doc.outOfScope",
    /Out of Scope/i.test(doc),
    "UX-8.4.md documents Out of Scope",
  );

  assertCase(
    block,
    "doc.integrationFence",
    /Integration Fence/i.test(doc) || /Exclusions/i.test(doc),
    "UX-8.4.md documents Integration Fence / Exclusions",
  );

  assertCase(
    block,
    "doc.next85",
    /Next/i.test(doc) && /UX-8\.5/.test(doc) && /Keyboard/i.test(doc),
    "UX-8.4.md documents Next UX-8.5 Keyboard Navigation",
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
    existsSync(join(repoRoot, HOVER_DIR)),
    "src/ui/hover/ exists",
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

  const registrySrc = existsSync(join(repoRoot, HOVER_REGISTRY))
    ? stripComments(read(HOVER_REGISTRY))
    : "";

  assertCase(
    block,
    "registry.apiInterface",
    /export\s+interface\s+HoverRegistryApi\s*\{/.test(registrySrc),
    "HoverRegistryApi interface exported",
  );

  assertCase(
    block,
    "registry.singleton",
    /export\s+const\s+hoverRegistry\s*:\s*HoverRegistryApi\s*=/.test(
      registrySrc,
    ),
    "hoverRegistry singleton SSOT exported",
  );

  assertCase(
    block,
    "registry.create",
    /export\s+function\s+createHoverRegistry\s*\(/.test(registrySrc),
    "createHoverRegistry exported",
  );

  assertCase(
    block,
    "registry.noReact",
    !/\bfrom\s+["']react["']/.test(registrySrc) &&
      !/\bfrom\s+["']react-dom["']/.test(registrySrc),
    "HoverRegistry is React-free",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — hoverStateContract                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "hoverStateContract";
  const src = existsSync(join(repoRoot, HOVER_STATE))
    ? stripComments(read(HOVER_STATE))
    : "";
  const body = extractReadonlyTypeBody(src, "HoverState");

  assertCase(
    block,
    "state.hoveredWindowId",
    /hoveredWindowId\s*:\s*HoverWindowId\s*\|\s*null/.test(body),
    "HoverState.hoveredWindowId: HoverWindowId | null",
  );

  assertCase(
    block,
    "state.hoveredContentId",
    /hoveredContentId\s*:\s*HoverContentId\s*\|\s*null/.test(body),
    "HoverState.hoveredContentId: HoverContentId | null",
  );

  assertCase(
    block,
    "state.hoveredSeriesId",
    /hoveredSeriesId\s*:\s*HoverSeriesId\s*\|\s*null/.test(body),
    "HoverState.hoveredSeriesId: HoverSeriesId | null",
  );

  assertCase(
    block,
    "state.noArraysSetsMaps",
    !/\bArray\b/.test(body) &&
      !/\bSet\b/.test(body) &&
      !/\bMap\b/.test(body) &&
      !/\[\]/.test(body),
    "HoverState has no arrays / Set / Map",
  );

  assertCase(
    block,
    "state.noMetadata",
    !/\bmetadata\b/.test(body) &&
      !/\btimestamp\b/.test(body) &&
      !/\bownership\b/.test(body) &&
      !/\bcoordinate\b/.test(body) &&
      !/\blastHover\b/.test(body),
    "HoverState has no metadata / timestamps / ownership / coordinates / history",
  );

  assertCase(
    block,
    "state.createFreeze",
    /export\s+function\s+createHoverState/.test(src) &&
      /Object\.freeze/.test(src),
    "createHoverState uses Object.freeze",
  );

  assertCase(
    block,
    "state.emptyConstant",
    /export\s+const\s+EMPTY_HOVER_STATE/.test(src),
    "EMPTY_HOVER_STATE exported",
  );

  const typesSrc = existsSync(join(repoRoot, HOVER_TYPES))
    ? stripComments(read(HOVER_TYPES))
    : "";
  assertCase(
    block,
    "types.brandedIds",
    /export\s+type\s+HoverWindowId\s*=/.test(typesSrc) &&
      /export\s+type\s+HoverContentId\s*=/.test(typesSrc) &&
      /export\s+type\s+HoverSeriesId\s*=/.test(typesSrc) &&
      /export\s+function\s+asHoverWindowId/.test(typesSrc) &&
      /export\s+function\s+asHoverContentId/.test(typesSrc) &&
      /export\s+function\s+asHoverSeriesId/.test(typesSrc),
    "Branded IDs + casters exported",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — registryApiFreeze                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "registryApiFreeze";
  const src = existsSync(join(repoRoot, HOVER_REGISTRY))
    ? stripComments(read(HOVER_REGISTRY))
    : "";
  const apiBody = extractInterfaceBody(src, "HoverRegistryApi");

  assertCase(
    block,
    "api.hoverWindow",
    /\bhoverWindow\s*\(\s*id\s*:\s*HoverWindowId\s*\)\s*:\s*void/.test(apiBody),
    "HoverRegistryApi.hoverWindow(id): void",
  );

  assertCase(
    block,
    "api.hoverContent",
    /\bhoverContent\s*\(\s*id\s*:\s*HoverContentId\s*\)\s*:\s*void/.test(
      apiBody,
    ),
    "HoverRegistryApi.hoverContent(id): void",
  );

  assertCase(
    block,
    "api.hoverSeries",
    /\bhoverSeries\s*\(\s*id\s*:\s*HoverSeriesId\s*\)\s*:\s*void/.test(apiBody),
    "HoverRegistryApi.hoverSeries(id): void",
  );

  assertCase(
    block,
    "api.clear",
    /\bclear\s*\(\s*\)\s*:\s*void/.test(apiBody),
    "HoverRegistryApi.clear(): void",
  );

  assertCase(
    block,
    "api.get",
    /\bget\s*\(\s*\)\s*:\s*HoverState/.test(apiBody),
    "HoverRegistryApi.get(): HoverState",
  );

  assertCase(
    block,
    "api.getState",
    /\bgetState\s*\(\s*\)\s*:\s*HoverState/.test(apiBody),
    "HoverRegistryApi.getState(): HoverState",
  );

  const methodCount = (apiBody.match(/\b\w+\s*\(/g) ?? []).length;
  assertCase(
    block,
    "api.exactlySixMethods",
    methodCount === 6,
    `HoverRegistryApi has exactly 6 methods (found ${methodCount})`,
  );

  assertCase(
    block,
    "api.noForbiddenExtras",
    !FORBIDDEN_EXTRA_METHODS.some((re) => re.test(apiBody)),
    "HoverRegistryApi has no forbidden extra methods",
  );

  assertCase(
    block,
    "api.cloneOnRead.get",
    /get\s*\(\s*\)\s*:\s*HoverState\s*\{[\s\S]*?(?:createHoverState|snapshot\s*\()/.test(
      src,
    ),
    "get uses createHoverState / snapshot (clone-on-read)",
  );

  assertCase(
    block,
    "api.cloneOnRead.getState",
    /getState\s*\(\s*\)\s*:\s*HoverState\s*\{[\s\S]*?(?:createHoverState|snapshot\s*\()/.test(
      src,
    ),
    "getState uses createHoverState / snapshot (clone-on-read)",
  );

  assertCase(
    block,
    "api.objectFreezeApi",
    /return\s+Object\.freeze\s*\(\s*\{/.test(src),
    "createHoverRegistry returns Object.freeze({...})",
  );

  const registryRaw = existsSync(join(repoRoot, HOVER_REGISTRY))
    ? read(HOVER_REGISTRY)
    : "";
  assertCase(
    block,
    "api.singletonFreezeNote",
    /infrastructure/i.test(registryRaw) &&
      /testing/i.test(registryRaw) &&
      /HoverProvider/.test(registryRaw) &&
      /useHover/.test(registryRaw),
    "HoverRegistry documents Singleton Freeze",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — apiStabilityFreeze                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "apiStabilityFreeze";
  const doc = existsSync(join(repoRoot, DOC_8_4)) ? read(DOC_8_4) : "";
  const registryRaw = existsSync(join(repoRoot, HOVER_REGISTRY))
    ? read(HOVER_REGISTRY)
    : "";

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
        /diferencias de comportamiento/i.test(doc) ||
        /intencionalmente equivalentes/i.test(doc)),
    "UX-8.4.md documents API Stability Freeze (get ≡ getState)",
  );

  assertCase(
    block,
    "registry.stabilityNote",
    /get\(\)\s+and\s+getState\(\)\s+are\s+intentionally\s+equivalent/i.test(
      registryRaw,
    ) ||
      (/equivalent/i.test(registryRaw) &&
        /get\(\)/.test(registryRaw) &&
        /getState\(\)/.test(registryRaw)),
    "HoverRegistry documents get ≡ getState",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — independenceFreeze                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "independenceFreeze";
  const src = existsSync(join(repoRoot, HOVER_REGISTRY))
    ? stripComments(read(HOVER_REGISTRY))
    : "";
  const doc = existsSync(join(repoRoot, DOC_8_4)) ? read(DOC_8_4) : "";

  const hoverWindowBody = extractMethodBody(src, "hoverWindow");
  const hoverContentBody = extractMethodBody(src, "hoverContent");
  const hoverSeriesBody = extractMethodBody(src, "hoverSeries");
  const clearBody = extractMethodBody(src, "clear");

  assertCase(
    block,
    "indep.hoverWindowOnlyWindow",
    /hoveredWindowId\s*=/.test(hoverWindowBody) &&
      !/hoveredContentId\s*=/.test(hoverWindowBody) &&
      !/hoveredSeriesId\s*=/.test(hoverWindowBody),
    "hoverWindow mutates only hoveredWindowId",
  );

  assertCase(
    block,
    "indep.hoverContentOnlyContent",
    /hoveredContentId\s*=/.test(hoverContentBody) &&
      !/hoveredWindowId\s*=/.test(hoverContentBody) &&
      !/hoveredSeriesId\s*=/.test(hoverContentBody),
    "hoverContent mutates only hoveredContentId",
  );

  assertCase(
    block,
    "indep.hoverSeriesOnlySeries",
    /hoveredSeriesId\s*=/.test(hoverSeriesBody) &&
      !/hoveredWindowId\s*=/.test(hoverSeriesBody) &&
      !/hoveredContentId\s*=/.test(hoverSeriesBody),
    "hoverSeries mutates only hoveredSeriesId",
  );

  assertCase(
    block,
    "indep.clearResetsAll",
    /hoveredWindowId\s*=\s*null/.test(clearBody) &&
      /hoveredContentId\s*=\s*null/.test(clearBody) &&
      /hoveredSeriesId\s*=\s*null/.test(clearBody),
    "clear() resets all three axes to null",
  );

  assertCase(
    block,
    "indep.docMixedNullExample",
    /WindowA|hoveredWindowId\s*=/.test(doc) &&
      /null/.test(doc) &&
      (/Series17|Series\s*17|hoveredSeriesId/i.test(doc)),
    "UX-8.4.md documents mixed-null Hover Semantics example",
  );

  assertCase(
    block,
    "indep.docNoHierarchy",
    /no hierarchy|no.*jerarqu|completely independent|completamente independientes|NEVER mutates another|NUNCA.*otro/i.test(
      doc,
    ),
    "UX-8.4.md documents axis independence / no hierarchy",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — barrelExport                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "barrelExport";
  const indexSrc = existsSync(join(repoRoot, HOVER_INDEX))
    ? stripComments(read(HOVER_INDEX))
    : "";
  const uiIndex = existsSync(join(repoRoot, UI_INDEX))
    ? stripComments(read(UI_INDEX))
    : "";

  const requiredExports = [
    "HoverWindowId",
    "HoverContentId",
    "HoverSeriesId",
    "asHoverWindowId",
    "asHoverContentId",
    "asHoverSeriesId",
    "HoverState",
    "createHoverState",
    "EMPTY_HOVER_STATE",
    "HoverRegistryApi",
    "createHoverRegistry",
    "hoverRegistry",
    "HoverContext",
    "HoverContextValue",
    "HoverProvider",
    "useHover",
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
    !/from\s+["']\.\/hover["']/.test(uiIndex) &&
      !/from\s+["']\.\/hover\//.test(uiIndex),
    "src/ui/index.ts does not re-export hover module",
  );

  const indexRaw = existsSync(join(repoRoot, HOVER_INDEX))
    ? read(HOVER_INDEX)
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
/* PASS 08 — dependencyRule                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "dependencyRule";
  const hoverFiles = walkFiles(join(repoRoot, HOVER_DIR));
  const allRaw = hoverFiles.map((f) => readFileSync(f, "utf8")).join("\n");
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
    "hover/** does not import windows/** or WindowRegistry",
  );

  assertCase(
    block,
    "dep.noFocus",
    !/from\s+["'][^"']*\/focus[^"']*["']/.test(all) &&
      !/\bFocusRegistry\b/.test(all) &&
      !/\bFocusProvider\b/.test(all) &&
      !/\bFocusContext\b/.test(all) &&
      !/\buseFocus\b/.test(all),
    "hover/** does not import Focus module",
  );

  assertCase(
    block,
    "dep.noSelection",
    !/from\s+["'][^"']*\/selection[^"']*["']/.test(all) &&
      !/\bSelectionRegistry\b/.test(all) &&
      !/\bSelectionProvider\b/.test(all) &&
      !/\bSelectionContext\b/.test(all) &&
      !/\buseSelection\b/.test(all),
    "hover/** does not import Selection module",
  );

  assertCase(
    block,
    "dep.noForeignRegistry",
    !/from\s+["'][^"']*\/(commands|visibility|features|selection|clipboard|shortcuts|menus|focus|keyboard)[^"']*["']/.test(
      all,
    ) &&
      !/\bCommandRegistry\b/.test(all) &&
      !/\bVisibilityRegistry\b/.test(all) &&
      !/\bFeatureRegistry\b/.test(all) &&
      !/\bSelectionRegistry\b/.test(all) &&
      !/\bFocusRegistry\b/.test(all),
    "hover/** does not import foreign Registry modules",
  );

  assertCase(
    block,
    "dep.noForeignProviderContext",
    !/\bCommandProvider\b/.test(all) &&
      !/\bCommandContext\b/.test(all) &&
      !/\bFeatureProvider\b/.test(all) &&
      !/\bVisibilityProvider\b/.test(all) &&
      !/\bActivePanelProvider\b/.test(all) &&
      !/\bSelectionProvider\b/.test(all) &&
      !/\bSelectionContext\b/.test(all) &&
      !/\bFocusProvider\b/.test(all) &&
      !/\bFocusContext\b/.test(all),
    "hover/** does not import foreign Provider/Context",
  );

  assertCase(
    block,
    "dep.noScientific",
    !/lib\/scientific/.test(all) && !/\bsrc\/lib\/graph\b/.test(all),
    "hover/** does not import scientific / graph engines",
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
/* PASS 09 — authorities                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "authorities";
  const arch = existsSync(join(repoRoot, ARCH)) ? read(ARCH) : "";
  const doc = existsSync(join(repoRoot, DOC_8_4)) ? read(DOC_8_4) : "";

  assertCase(
    block,
    "auth.matrixHover",
    /Hover\s*\|\s*`?HoverRegistry`?/i.test(arch) ||
      (/Authorities Matrix/i.test(arch) && /HoverRegistry/.test(arch)),
    "Architecture Authorities Matrix lists Hover → HoverRegistry",
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
    /única autoridad|sole.*authority|HoverRegistry.*authority/i.test(doc),
    "UX-8.4.md documents HoverRegistry as sole authority",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 10 — noProductMount                                                   */
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
    "mount.noPageHoverProvider",
    !/\bHoverProvider\b/.test(page) && !/ui\/hover/.test(page),
    "page.tsx does not mount HoverProvider",
  );

  assertCase(
    block,
    "mount.noAppShellHover",
    !/\bHoverProvider\b/.test(appShellRaw) && !/ui\/hover/.test(appShellRaw),
    "AppShell does not mount HoverProvider",
  );

  assertCase(
    block,
    "mount.noPublicBarrel",
    !/from\s+["']\.\/hover["']/.test(uiIndex) &&
      !/from\s+["']\.\/hover\//.test(uiIndex),
    "@/ui barrel does not export hover",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 11 — windowRegistryIntact                                             */
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
    "window.noHoverImport",
    !/ui\/hover/.test(wr) && !/\bhoverRegistry\b/.test(wr),
    "WindowRegistry does not import hover module",
  );

  const hoverAll = walkFiles(join(repoRoot, HOVER_DIR))
    .map((f) => readFileSync(f, "utf8"))
    .join("\n");
  assertCase(
    block,
    "hover.noWindowRegistryImport",
    !/WindowRegistry/.test(stripComments(hoverAll)),
    "hover/** does not reference WindowRegistry",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 12 — roadmapUpdated                                                   */
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
    "roadmap.ux84Complete",
    /UX-8\.4\s*=\s*COMPLETE/i.test(roadmap) ||
      (/UX-8\.4/.test(roadmap) &&
        /Hover System/.test(roadmap) &&
        /COMPLETE/.test(roadmap)),
    "Roadmap marks UX-8.4 COMPLETE",
  );

  assertCase(
    block,
    "roadmap.tableComplete",
    /UX-8\.4\s*\|\s*Hover System\s*\|\s*COMPLETE/i.test(roadmap),
    "Roadmap phase table marks UX-8.4 COMPLETE",
  );

  assertCase(
    block,
    "roadmap.historicalGate",
    /validate:ux-8\.4/.test(roadmap) && /UX-8\.4\.md/.test(roadmap),
    "Roadmap lists historical gate validate:ux-8.4",
  );

  assertCase(
    block,
    "roadmap.next85",
    /UX-8\.5/.test(roadmap) && /Keyboard Navigation/i.test(roadmap),
    "Roadmap lists UX-8.5 Keyboard Navigation",
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
  "hoverStateContract",
  "registryApiFreeze",
  "apiStabilityFreeze",
  "independenceFreeze",
  "barrelExport",
  "dependencyRule",
  "authorities",
  "noProductMount",
  "windowRegistryIntact",
  "roadmapUpdated",
] as const;

console.log("UX-8.4 Hover System Foundation — validation\n");

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
