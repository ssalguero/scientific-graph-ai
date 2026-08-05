/**
 * UX-8.3 — Multi Selection Foundation gate.
 *
 * Blocks:
 * documentationExists · selectionSetContract · selectionStateContract
 * registryApiFreeze · setOwnershipFreeze · projectionFreeze
 * independenceFreeze · barrelExport · dependencyRule · authorities
 * noProductMount · windowRegistryIntact · roadmapUpdated
 *
 * Architectural principles:
 * - Compatibility Freeze · Projection Freeze · Set Ownership Freeze
 * - API Freeze = exactly 16 methods · clear ≡ clearAllSelections
 * - Range Freeze · Independence Freeze · Dependency Rule
 * - SelectionRegistry = sole authority · no product mount
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "documentationExists"
  | "selectionSetContract"
  | "selectionStateContract"
  | "registryApiFreeze"
  | "setOwnershipFreeze"
  | "projectionFreeze"
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

const SELECTION_DIR = "src/ui/selection";
const SELECTION_SET = `${SELECTION_DIR}/SelectionSet.ts`;
const SELECTION_STATE = `${SELECTION_DIR}/SelectionState.ts`;
const SELECTION_REGISTRY = `${SELECTION_DIR}/SelectionRegistry.ts`;
const SELECTION_INDEX = `${SELECTION_DIR}/index.ts`;
const UI_INDEX = "src/ui/index.ts";
const WINDOW_REGISTRY = "src/components/windows/WindowRegistry.ts";
const PAGE_TSX = "src/app/page.tsx";
const ARCH = "docs/UX/UX-8-architecture.md";
const ROADMAP = "docs/UX/UX-8.0-roadmap.md";
const DOC_8_3 = "docs/UX/UX-8.3.md";
const PACKAGE_JSON = "package.json";

const HISTORICAL_METHODS = [
  "selectWindow",
  "selectContent",
  "selectSeries",
  "clear",
  "get",
  "getState",
] as const;

const NEW_METHODS = [
  "toggleWindow",
  "toggleContent",
  "toggleSeries",
  "clearWindowSelection",
  "clearContentSelection",
  "clearSeriesSelection",
  "clearAllSelections",
  "rangeWindow",
  "rangeContent",
  "rangeSeries",
] as const;

const FORBIDDEN_EXTRA_METHODS = [
  /\bisSelected\s*\(/,
  /\bcontains\s*\(/,
  /\bfindBy\w*\s*\(/,
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
    existsSync(join(repoRoot, DOC_8_3)),
    `${DOC_8_3} exists`,
  );

  const pkg = existsSync(join(repoRoot, PACKAGE_JSON))
    ? read(PACKAGE_JSON)
    : "";
  assertCase(
    block,
    "exists.npmScript",
    /"validate:ux-8\.3"\s*:/.test(pkg),
    "package.json has validate:ux-8.3",
  );

  const doc = existsSync(join(repoRoot, DOC_8_3)) ? read(DOC_8_3) : "";

  assertCase(
    block,
    "doc.architectureRef",
    /UX-8-architecture\.md/.test(doc),
    "UX-8.3.md references UX-8-architecture.md",
  );

  assertCase(
    block,
    "doc.compatibilityFreeze",
    /Compatibility Freeze/i.test(doc) &&
      /selectedWindowId/.test(doc) &&
      /selectedWindowIds/.test(doc) &&
      (/UX-8\.2/.test(doc) || /preserved|preserv/i.test(doc)),
    "UX-8.3.md documents Compatibility Freeze / UX-8.2",
  );

  assertCase(
    block,
    "doc.projectionFreeze",
    /Projection Freeze/i.test(doc) &&
      /size\s*==\s*0|size\s*0/.test(doc) &&
      /size\s*==\s*1|size\s*1/.test(doc) &&
      (/size\s*>\s*1|size\s*>1/.test(doc) || /size > 1/.test(doc)),
    "UX-8.3.md documents Projection Freeze",
  );

  assertCase(
    block,
    "doc.setOwnershipFreeze",
    /Set Ownership Freeze/i.test(doc) &&
      /Mutable Set/i.test(doc) &&
      /SelectionSet/.test(doc) &&
      /consumer/i.test(doc),
    "UX-8.3.md documents Set Ownership Freeze",
  );

  assertCase(
    block,
    "doc.apiFreeze",
    /API Freeze/i.test(doc) &&
      /selectWindow/.test(doc) &&
      /toggleWindow/.test(doc) &&
      /rangeWindow/.test(doc) &&
      /clearAllSelections/.test(doc) &&
      (/16/.test(doc) || /exactly 16/i.test(doc)),
    "UX-8.3.md documents API Freeze (16 methods)",
  );

  assertCase(
    block,
    "doc.clearEquivalent",
    /clear\(\)/.test(doc) &&
      /clearAllSelections/.test(doc) &&
      (/equivalent|equivalen|≡/.test(doc) || /intentionally equivalent/i.test(doc)),
    "UX-8.3.md documents clear ≡ clearAllSelections",
  );

  assertCase(
    block,
    "doc.rangeFreeze",
    /Range Freeze/i.test(doc) && /orderedIds/.test(doc),
    "UX-8.3.md documents Range Freeze with orderedIds",
  );

  assertCase(
    block,
    "doc.ctrlShiftFreeze",
    (/Ctrl\/Shift Freeze|Ctrl \/ Shift Freeze/i.test(doc) ||
      (/toggle\*/.test(doc) && /range\*/.test(doc))) &&
      (/NO DOM|No DOM|sin DOM/i.test(doc) || /no keyboard/i.test(doc)),
    "UX-8.3.md documents Ctrl/Shift Freeze (no DOM)",
  );

  assertCase(
    block,
    "doc.independenceFreeze",
    /Independence Freeze/i.test(doc),
    "UX-8.3.md documents Independence Freeze",
  );

  assertCase(
    block,
    "doc.dependencyRule",
    /Dependency Rule/i.test(doc),
    "UX-8.3.md documents Dependency Rule",
  );

  assertCase(
    block,
    "doc.authorities",
    /Authorit/i.test(doc) && /SelectionRegistry/.test(doc),
    "UX-8.3.md documents Authorities (SelectionRegistry)",
  );

  assertCase(
    block,
    "doc.outOfScope",
    /Out of Scope/i.test(doc),
    "UX-8.3.md documents Out of Scope",
  );

  assertCase(
    block,
    "doc.next84",
    /UX-8\.4/.test(doc) && /Hover/i.test(doc),
    "UX-8.3.md documents Next UX-8.4 Hover",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — selectionSetContract                                             */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "selectionSetContract";
  const src = existsSync(join(repoRoot, SELECTION_SET))
    ? stripComments(read(SELECTION_SET))
    : "";
  const raw = existsSync(join(repoRoot, SELECTION_SET))
    ? read(SELECTION_SET)
    : "";

  assertCase(
    block,
    "exists.SelectionSet",
    existsSync(join(repoRoot, SELECTION_SET)),
    `${SELECTION_SET} exists`,
  );

  assertCase(
    block,
    "set.type",
    /export\s+type\s+SelectionSet\s*</.test(src),
    "SelectionSet<T> type exported",
  );

  assertCase(
    block,
    "set.create",
    /export\s+function\s+createSelectionSet/.test(src),
    "createSelectionSet exported",
  );

  assertCase(
    block,
    "set.empty",
    /export\s+const\s+EMPTY_SELECTION_SET/.test(src),
    "EMPTY_SELECTION_SET exported",
  );

  assertCase(
    block,
    "set.immutableFreeze",
    /Object\.freeze/.test(src),
    "SelectionSet uses Object.freeze (immutable snapshot)",
  );

  assertCase(
    block,
    "set.cloneOnRead",
    /new\s+Set/.test(src),
    "createSelectionSet clones via new Set (clone-on-read)",
  );

  assertCase(
    block,
    "set.noPublicMutators",
    !/\badd\s*\(/.test(src) &&
      !/\bdelete\s*\(/.test(src) &&
      !/\bclear\s*\(/.test(src),
    "SelectionSet has no public mutators (add/delete/clear)",
  );

  assertCase(
    block,
    "set.noMetadata",
    !/\bmetadata\b/.test(extractReadonlyTypeBody(src, "SelectionSet")) &&
      !/\btimestamp\b/.test(src.replace(/UX-8\.3[\s\S]*?(?=\nexport)/, "")),
    "SelectionSet has no metadata / timestamps in contract",
  );

  assertCase(
    block,
    "set.ownershipNote",
    /Set Ownership Freeze/i.test(raw) || /never.*mutable/i.test(raw),
    "SelectionSet.ts documents Set Ownership / no mutable escape",
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
    "SelectionState.selectedWindowId preserved",
  );

  assertCase(
    block,
    "state.selectedContentId",
    /selectedContentId\s*:\s*SelectionContentId\s*\|\s*null/.test(body),
    "SelectionState.selectedContentId preserved",
  );

  assertCase(
    block,
    "state.selectedSeriesId",
    /selectedSeriesId\s*:\s*SelectionSeriesId\s*\|\s*null/.test(body),
    "SelectionState.selectedSeriesId preserved",
  );

  assertCase(
    block,
    "state.selectedWindowIds",
    /selectedWindowIds\s*:\s*SelectionSet\s*<\s*SelectionWindowId\s*>/.test(
      body,
    ),
    "SelectionState.selectedWindowIds: SelectionSet<SelectionWindowId>",
  );

  assertCase(
    block,
    "state.selectedContentIds",
    /selectedContentIds\s*:\s*SelectionSet\s*<\s*SelectionContentId\s*>/.test(
      body,
    ),
    "SelectionState.selectedContentIds: SelectionSet<SelectionContentId>",
  );

  assertCase(
    block,
    "state.selectedSeriesIds",
    /selectedSeriesIds\s*:\s*SelectionSet\s*<\s*SelectionSeriesId\s*>/.test(
      body,
    ),
    "SelectionState.selectedSeriesIds: SelectionSet<SelectionSeriesId>",
  );

  assertCase(
    block,
    "state.dualFields",
    /selectedWindowId/.test(body) &&
      /selectedWindowIds/.test(body) &&
      /selectedContentId/.test(body) &&
      /selectedContentIds/.test(body) &&
      /selectedSeriesId/.test(body) &&
      /selectedSeriesIds/.test(body),
    "SelectionState has dual fields (singular + Ids)",
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
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — registryApiFreeze                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "registryApiFreeze";
  const src = existsSync(join(repoRoot, SELECTION_REGISTRY))
    ? stripComments(read(SELECTION_REGISTRY))
    : "";
  const raw = existsSync(join(repoRoot, SELECTION_REGISTRY))
    ? read(SELECTION_REGISTRY)
    : "";
  const apiBody = extractInterfaceBody(src, "SelectionRegistryApi");

  for (const name of HISTORICAL_METHODS) {
    assertCase(
      block,
      `api.historical.${name}`,
      new RegExp(`\\b${name}\\s*\\(`).test(apiBody),
      `SelectionRegistryApi.${name} preserved`,
    );
  }

  for (const name of NEW_METHODS) {
    assertCase(
      block,
      `api.new.${name}`,
      new RegExp(`\\b${name}\\s*\\(`).test(apiBody),
      `SelectionRegistryApi.${name} present`,
    );
  }

  const methodCount = (apiBody.match(/\b\w+\s*\(/g) ?? []).length;
  assertCase(
    block,
    "api.exactlySixteenMethods",
    methodCount === 16,
    `SelectionRegistryApi has exactly 16 methods (found ${methodCount})`,
  );

  assertCase(
    block,
    "api.noForbiddenExtras",
    !FORBIDDEN_EXTRA_METHODS.some((re) => re.test(apiBody)),
    "SelectionRegistryApi has no forbidden extra helpers",
  );

  assertCase(
    block,
    "api.noIsSelectedHasSize",
    !/\bisSelected\s*\(/.test(apiBody) &&
      !/\bcontains\s*\(/.test(apiBody) &&
      !/(?<![a-zA-Z])has\s*\(/.test(apiBody) &&
      !/(?<![a-zA-Z])size\s*\(/.test(apiBody),
    "SelectionRegistryApi has no isSelected / has / size / contains",
  );

  assertCase(
    block,
    "api.rangeOrderedIds",
    /rangeWindow\s*\(\s*start\s*:\s*SelectionWindowId\s*,\s*end\s*:\s*SelectionWindowId\s*,\s*orderedIds\s*:\s*readonly\s+SelectionWindowId\[\]/.test(
      apiBody,
    ) &&
      /rangeContent\s*\([\s\S]*orderedIds/.test(apiBody) &&
      /rangeSeries\s*\([\s\S]*orderedIds/.test(apiBody),
    "range* signatures include orderedIds",
  );

  assertCase(
    block,
    "api.clearEquivalentBodies",
    (() => {
      const clearBody = extractMethodBody(src, "clear");
      const clearAllBody = extractMethodBody(src, "clearAllSelections");
      const clearsWindows =
        /selectedWindowIds\.clear\s*\(/.test(clearBody) &&
        /selectedWindowIds\.clear\s*\(/.test(clearAllBody);
      const clearsContent =
        /selectedContentIds\.clear\s*\(/.test(clearBody) &&
        /selectedContentIds\.clear\s*\(/.test(clearAllBody);
      const clearsSeries =
        /selectedSeriesIds\.clear\s*\(/.test(clearBody) &&
        /selectedSeriesIds\.clear\s*\(/.test(clearAllBody);
      return clearsWindows && clearsContent && clearsSeries;
    })(),
    "clear() and clearAllSelections() both clear all three axis Sets",
  );

  assertCase(
    block,
    "api.clearEquivalentDoc",
    /clear\(\)\s*≡\s*clearAllSelections|clear\(\) and clearAllSelections\(\) are intentionally equivalent|clear\(\).*clearAllSelections.*equivalent/i.test(
      raw,
    ) ||
      (/equivalent/i.test(raw) &&
        /clear\(\)/.test(raw) &&
        /clearAllSelections/.test(raw)),
    "Registry documents clear ≡ clearAllSelections",
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

  assertCase(
    block,
    "api.factory",
    /export\s+function\s+createSelectionRegistry\s*\(/.test(src),
    "createSelectionRegistry factory exported",
  );

  assertCase(
    block,
    "api.singleton",
    /export\s+const\s+selectionRegistry\s*:\s*SelectionRegistryApi\s*=/.test(
      src,
    ),
    "selectionRegistry singleton preserved",
  );

  assertCase(
    block,
    "api.noReact",
    !/\bfrom\s+["']react["']/.test(src) &&
      !/\bfrom\s+["']react-dom["']/.test(src),
    "SelectionRegistry is React-free",
  );

  assertCase(
    block,
    "api.selectReplaces",
    /Historical Semantics|replaces axis Set|replaceWindow/i.test(raw) ||
      (/selectWindow[\s\S]*replaceWindow|selectedWindowIds\.clear/.test(src) &&
        /selectWindow/.test(src)),
    "select* replaces axis Set semantics present",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — setOwnershipFreeze                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "setOwnershipFreeze";
  const registrySrc = existsSync(join(repoRoot, SELECTION_REGISTRY))
    ? stripComments(read(SELECTION_REGISTRY))
    : "";
  const registryRaw = existsSync(join(repoRoot, SELECTION_REGISTRY))
    ? read(SELECTION_REGISTRY)
    : "";
  const doc = existsSync(join(repoRoot, DOC_8_3)) ? read(DOC_8_3) : "";

  assertCase(
    block,
    "own.docFlow",
    /Set Ownership Freeze/i.test(doc) &&
      /Mutable Set/i.test(doc) &&
      /clone/i.test(doc) &&
      /SelectionSet/.test(doc) &&
      /SelectionState/.test(doc) &&
      /consumer/i.test(doc),
    "Docs document Mutable Set → clone → SelectionSet → SelectionState → consumer",
  );

  assertCase(
    block,
    "own.registryNote",
    /Set Ownership Freeze/i.test(registryRaw),
    "SelectionRegistry documents Set Ownership Freeze",
  );

  assertCase(
    block,
    "own.snapshotClones",
    /createSelectionSet\s*\(\s*selectedWindowIds\s*\)/.test(registrySrc) &&
      /createSelectionSet\s*\(\s*selectedContentIds\s*\)/.test(registrySrc) &&
      /createSelectionSet\s*\(\s*selectedSeriesIds\s*\)/.test(registrySrc),
    "snapshot clones private Sets via createSelectionSet",
  );

  assertCase(
    block,
    "own.noReturnMutableSet",
    !/return\s+selectedWindowIds/.test(registrySrc) &&
      !/return\s+selectedContentIds/.test(registrySrc) &&
      !/return\s+selectedSeriesIds/.test(registrySrc) &&
      !/:\s*Set\s*</.test(extractInterfaceBody(registrySrc, "SelectionRegistryApi")),
    "Registry API does not return private mutable Sets",
  );

  const privateSets =
    /const\s+selectedWindowIds\s*=\s*new\s+Set/.test(registrySrc) &&
    /const\s+selectedContentIds\s*=\s*new\s+Set/.test(registrySrc) &&
    /const\s+selectedSeriesIds\s*=\s*new\s+Set/.test(registrySrc);
  assertCase(
    block,
    "own.privateMutableSets",
    privateSets,
    "Registry owns private mutable Sets per axis",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — projectionFreeze                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "projectionFreeze";
  const stateSrc = existsSync(join(repoRoot, SELECTION_STATE))
    ? stripComments(read(SELECTION_STATE))
    : "";
  const stateRaw = existsSync(join(repoRoot, SELECTION_STATE))
    ? read(SELECTION_STATE)
    : "";
  const registrySrc = existsSync(join(repoRoot, SELECTION_REGISTRY))
    ? stripComments(read(SELECTION_REGISTRY))
    : "";
  const doc = existsSync(join(repoRoot, DOC_8_3)) ? read(DOC_8_3) : "";

  assertCase(
    block,
    "proj.docRules",
    /Projection Freeze/i.test(doc) &&
      (/size\s*==\s*0|size\s*0/.test(doc) || /size === 0/.test(doc)) &&
      (/null/.test(doc)) &&
      (/size\s*==\s*1|size\s*1/.test(doc)) &&
      (/size\s*>\s*1|size > 1/.test(doc)),
    "Docs document Projection Freeze rules (0/1/>1)",
  );

  assertCase(
    block,
    "proj.inCreateSelectionState",
    /Projection Freeze/i.test(stateRaw) &&
      /function\s+projectSingular/.test(stateSrc) &&
      /createSelectionState/.test(stateSrc),
    "Projection implemented via projectSingular in SelectionState",
  );

  const createBody = extractFunctionBody(stateSrc, "createSelectionState");
  assertCase(
    block,
    "proj.factoryUsesProject",
    /projectSingular\s*\(\s*selectedWindowIds\s*\)/.test(createBody) &&
      /projectSingular\s*\(\s*selectedContentIds\s*\)/.test(createBody) &&
      /projectSingular\s*\(\s*selectedSeriesIds\s*\)/.test(createBody),
    "createSelectionState projects all three singulars",
  );

  const projectBody = (() => {
    const re = /function\s+projectSingular\s*<[^>]*>\s*\([^)]*\)\s*:\s*[^{]+\{/;
    const m = re.exec(stateSrc);
    if (!m || m.index === undefined) return "";
    let i = m.index + m[0].length;
    let depth = 1;
    const start = i;
    while (i < stateSrc.length && depth > 0) {
      const ch = stateSrc[i];
      if (ch === "{") depth += 1;
      else if (ch === "}") depth -= 1;
      i += 1;
    }
    return stateSrc.slice(start, i - 1);
  })();

  assertCase(
    block,
    "proj.size0Null",
    /size\s*===\s*0/.test(projectBody) && /return\s+null/.test(projectBody),
    "projectSingular: size 0 → null",
  );

  assertCase(
    block,
    "proj.size1Id",
    /size\s*===\s*1/.test(projectBody),
    "projectSingular: size 1 → that id",
  );

  assertCase(
    block,
    "proj.sizeGt1Null",
    /return\s+null/.test(projectBody) &&
      (projectBody.match(/return\s+null/g) ?? []).length >= 2,
    "projectSingular: size > 1 → null",
  );

  assertCase(
    block,
    "proj.notInRegistry",
    !/function\s+projectSingular/.test(registrySrc) &&
      !/selectedWindowId\s*=/.test(registrySrc),
    "Registry does not duplicate projection logic",
  );

  assertCase(
    block,
    "proj.singlePlace",
    /single place|ONLY in createSelectionState|derived from Sets in createSelectionState/i.test(
      stateRaw + doc,
    ) || /Projection Freeze.*createSelectionState/i.test(doc),
    "Docs/state assert projection in one place only",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — independenceFreeze                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "independenceFreeze";
  const src = existsSync(join(repoRoot, SELECTION_REGISTRY))
    ? stripComments(read(SELECTION_REGISTRY))
    : "";
  const doc = existsSync(join(repoRoot, DOC_8_3)) ? read(DOC_8_3) : "";

  const checks: Array<{
    id: string;
    method: string;
    own: RegExp;
    foreign: RegExp[];
  }> = [
    {
      id: "indep.toggleWindow",
      method: "toggleWindow",
      own: /selectedWindowIds/,
      foreign: [/selectedContentIds/, /selectedSeriesIds/],
    },
    {
      id: "indep.toggleContent",
      method: "toggleContent",
      own: /selectedContentIds/,
      foreign: [/selectedWindowIds/, /selectedSeriesIds/],
    },
    {
      id: "indep.toggleSeries",
      method: "toggleSeries",
      own: /selectedSeriesIds/,
      foreign: [/selectedWindowIds/, /selectedContentIds/],
    },
    {
      id: "indep.clearWindow",
      method: "clearWindowSelection",
      own: /selectedWindowIds/,
      foreign: [/selectedContentIds/, /selectedSeriesIds/],
    },
    {
      id: "indep.clearContent",
      method: "clearContentSelection",
      own: /selectedContentIds/,
      foreign: [/selectedWindowIds/, /selectedSeriesIds/],
    },
    {
      id: "indep.clearSeries",
      method: "clearSeriesSelection",
      own: /selectedSeriesIds/,
      foreign: [/selectedWindowIds/, /selectedContentIds/],
    },
    {
      id: "indep.rangeWindow",
      method: "rangeWindow",
      own: /replaceWindow|selectedWindowIds/,
      foreign: [/replaceContent|selectedContentIds\.|selectedContentIds\s*=/, /replaceSeries|selectedSeriesIds\.|selectedSeriesIds\s*=/],
    },
    {
      id: "indep.rangeContent",
      method: "rangeContent",
      own: /replaceContent|selectedContentIds/,
      foreign: [/replaceWindow|selectedWindowIds\.|selectedWindowIds\s*=/, /replaceSeries|selectedSeriesIds\.|selectedSeriesIds\s*=/],
    },
    {
      id: "indep.rangeSeries",
      method: "rangeSeries",
      own: /replaceSeries|selectedSeriesIds/,
      foreign: [/replaceWindow|selectedWindowIds\.|selectedWindowIds\s*=/, /replaceContent|selectedContentIds\.|selectedContentIds\s*=/],
    },
  ];

  for (const c of checks) {
    const body = extractMethodBody(src, c.method);
    assertCase(
      block,
      c.id,
      c.own.test(body) && !c.foreign.some((re) => re.test(body)),
      `${c.method} mutates only its own axis`,
    );
  }

  assertCase(
    block,
    "indep.selectWindowOnlyWindow",
    (() => {
      const body = extractMethodBody(src, "selectWindow");
      return (
        /replaceWindow|selectedWindowIds/.test(body) &&
        !/replaceContent|selectedContentIds/.test(body) &&
        !/replaceSeries|selectedSeriesIds/.test(body)
      );
    })(),
    "selectWindow mutates only window axis",
  );

  assertCase(
    block,
    "indep.docMixedExample",
    /Independence Freeze/i.test(doc) &&
      (/Window:/.test(doc) || /Window\s+→/.test(doc) || /A,\s*B/.test(doc)) &&
      /Series/.test(doc),
    "UX-8.3.md documents mixed multi-axis Independence example",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — barrelExport                                                     */
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
    "SelectionSet",
    "createSelectionSet",
    "EMPTY_SELECTION_SET",
    "SelectionState",
    "createSelectionState",
    "EMPTY_SELECTION_STATE",
    "SelectionRegistryApi",
    "createSelectionRegistry",
    "selectionRegistry",
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
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — dependencyRule                                                   */
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
      !/\buseFocus\b/.test(all),
    "selection/** does not import Focus module",
  );

  assertCase(
    block,
    "dep.noHoverKeyboardClipboardCommands",
    !/from\s+["'][^"']*\/(hover|keyboard|clipboard|interaction-commands|commands|visibility|features)[^"']*["']/.test(
      all,
    ) &&
      !/\bHoverRegistry\b/.test(all) &&
      !/\bClipboardRegistry\b/.test(all) &&
      !/\bCommandRegistry\b/.test(all),
    "selection/** does not import Hover / Keyboard / Clipboard / Commands",
  );

  assertCase(
    block,
    "dep.noForeignProviderContext",
    !/\bCommandProvider\b/.test(all) &&
      !/\bFeatureProvider\b/.test(all) &&
      !/\bVisibilityProvider\b/.test(all) &&
      !/\bHoverProvider\b/.test(all) &&
      !/\bFocusProvider\b/.test(all),
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
/* PASS 10 — authorities                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "authorities";
  const arch = existsSync(join(repoRoot, ARCH)) ? read(ARCH) : "";
  const doc = existsSync(join(repoRoot, DOC_8_3)) ? read(DOC_8_3) : "";

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
    "UX-8.3.md documents SelectionRegistry as sole authority",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 11 — noProductMount                                                   */
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
/* PASS 12 — windowRegistryIntact                                             */
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
/* PASS 13 — roadmapUpdated                                                   */
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
    "roadmap.ux83Complete",
    /UX-8\.3\s*=\s*COMPLETE/i.test(roadmap),
    "Roadmap marks UX-8.3 COMPLETE",
  );

  assertCase(
    block,
    "roadmap.tableComplete",
    /UX-8\.3\s*\|\s*Multi Selection\s*\|\s*COMPLETE/i.test(roadmap),
    "Roadmap phase table marks UX-8.3 COMPLETE",
  );

  assertCase(
    block,
    "roadmap.gateListed",
    /validate:ux-8\.3/.test(roadmap) && /UX-8\.3\.md/.test(roadmap),
    "Roadmap lists validate:ux-8.3 historical gate",
  );

  assertCase(
    block,
    "roadmap.next84",
    /UX-8\.4/.test(roadmap) && /Hover/i.test(roadmap),
    "Roadmap lists UX-8.4 Hover System",
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const failed = results.filter((r) => r.pass === false);
const passed = results.filter((r) => r.pass);

const blocks = [
  "documentationExists",
  "selectionSetContract",
  "selectionStateContract",
  "registryApiFreeze",
  "setOwnershipFreeze",
  "projectionFreeze",
  "independenceFreeze",
  "barrelExport",
  "dependencyRule",
  "authorities",
  "noProductMount",
  "windowRegistryIntact",
  "roadmapUpdated",
] as const;

console.log("UX-8.3 Multi Selection Foundation — validation\n");

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
