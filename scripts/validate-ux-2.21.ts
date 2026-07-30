/**
 * UX-2.21 — Final Visual Polish gate.
 * Token consistency + visual rhythm only; no new APIs / packages / Content Grammar.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const workspaceDir = join(repoRoot, "src/components/workspace");
const contentGrammarDir = join(workspaceDir, "content");
const panelsDir = join(workspaceDir, "panels");
const surfacesDir = join(workspaceDir, "surfaces");
const layoutDir = join(workspaceDir, "layout");
const semanticsDir = join(workspaceDir, "semantics");
const toolbarDir = join(workspaceDir, "toolbar");
const iconographyDir = join(workspaceDir, "iconography");
const disclosureDir = join(workspaceDir, "disclosure");
const emptyDir = join(panelsDir, "empty");
const packagePath = join(repoRoot, "package.json");
const docPath = join(repoRoot, "docs/UX-2.21-final-visual-polish.md");
const roadmapPath = join(repoRoot, "docs/UX-2.0-roadmap.md");
const ux220DocPath = join(
  repoRoot,
  "docs/UX-2.20-iconography-microinteractions.md"
);

const results: { id: string; pass: boolean; detail: string }[] = [];

const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const read = (path: string): string =>
  existsSync(path) ? readFileSync(path, "utf8") : "";

const collectTsFiles = (
  dir: string
): { path: string; source: string }[] => {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return [];
  const out: { path: string; source: string }[] = [];
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".")) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...collectTsFiles(full));
      continue;
    }
    if (/\.(tsx?|mts|cts)$/.test(name)) {
      out.push({ path: full, source: read(full) });
    }
  }
  return out;
};

const extractTokenKeys = (source: string, exportName: string): string[] => {
  const re = new RegExp(
    `export\\s+const\\s+${exportName}\\s*=\\s*\\{([\\s\\S]*?)\\}\\s*as\\s+const`
  );
  const m = source.match(re);
  if (!m) return [];
  const body = m[1];
  const keys: string[] = [];
  const keyRe = /^\s{2}([A-Za-z_][A-Za-z0-9_]*)\s*:/gm;
  let km: RegExpExecArray | null;
  while ((km = keyRe.exec(body))) {
    keys.push(km[1]);
  }
  return keys;
};

const workspaceFiles = collectTsFiles(workspaceDir);
const workspaceSource = workspaceFiles.map((f) => f.source).join("\n");
const surfaceTokens = read(join(surfacesDir, "SurfaceTokens.ts"));
const layoutTokens = read(join(layoutDir, "LayoutTokens.ts"));
const semanticTokens = read(join(semanticsDir, "SEMANTIC_TOKENS.ts"));
const actionTokens = read(join(toolbarDir, "ACTION_TOKENS.ts"));
const iconTokens = read(join(iconographyDir, "ICON_TOKENS.ts"));
const contextDivider = read(join(disclosureDir, "ContextDivider.tsx"));
const panelHeader = read(join(panelsDir, "PanelHeader.tsx"));
const panelBody = read(join(panelsDir, "PanelBody.tsx"));
const bodyLayout = read(join(panelsDir, "WorkspaceBodyLayout.tsx"));
const explorer = read(join(panelsDir, "content/ExplorerContent.tsx"));
const inspector = read(join(panelsDir, "content/InspectorContent.tsx"));
const consoleContent = read(join(panelsDir, "content/ConsoleContent.tsx"));
const emptyState = read(join(emptyDir, "EmptyState.tsx"));
const emptyIcon = read(join(emptyDir, "EmptyIcon.tsx"));
const workspaceBarrel = read(join(workspaceDir, "index.ts"));
const pkg = read(packagePath);
const doc = read(docPath);
const roadmap = read(roadmapPath);
const ux220Doc = read(ux220DocPath);

/* -------------------------------------------------------------------------- */
/* A. No Content Grammar / no new packages                                    */
/* -------------------------------------------------------------------------- */

/* UX-2.22 may introduce workspace/content/; leaf gate only forbids public barrel growth. */
assertCase(
  "ux221.no.public.barrel.growth",
  !/from\s+["']\.\/content/.test(workspaceBarrel) &&
    !/CONTENT_TOKENS/.test(workspaceBarrel) &&
    !/ContentGroup/.test(workspaceBarrel),
  "Public workspace barrel unchanged (no content exports)"
);

assertCase(
  "ux221.content.package.deferred.or.present",
  true,
  existsSync(contentGrammarDir)
    ? "workspace/content/ present (UX-2.22+); UX-2.21 leaf allows successor"
    : "workspace/content/ absent (pure UX-2.21)"
);

/* -------------------------------------------------------------------------- */
/* B. Shell + divider + empty parity                                          */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux221.panelHeader.tokens",
  /LAYOUT_TOKENS/.test(panelHeader) &&
    /SURFACE_TOKENS/.test(panelHeader) &&
    /regionPadding/.test(panelHeader) &&
    !/px-3\s+py-2/.test(panelHeader) &&
    !/tracking-\[0\.09em\]/.test(panelHeader),
  "PanelHeader uses LAYOUT/SURFACE tokens; no px-3 py-2 / tracking-0.09"
);

assertCase(
  "ux221.panelBody.tokens",
  /LAYOUT_TOKENS/.test(panelBody) &&
    /regionPadding/.test(panelBody) &&
    !/px-3\s+py-2/.test(panelBody),
  "PanelBody uses LAYOUT_TOKENS.regionPadding"
);

assertCase(
  "ux221.canvas.tokens",
  /SURFACE_TOKENS\.radius\.canvas/.test(bodyLayout) &&
    /SURFACE_TOKENS\.padding\.md/.test(bodyLayout) &&
    !/rounded-xl/.test(bodyLayout) &&
    !/\bp-4\b/.test(bodyLayout) &&
    !/sm:p-6/.test(bodyLayout),
  "Canvas shell uses SURFACE radius/padding tokens"
);

assertCase(
  "ux221.contextDivider.tokens",
  /SURFACE_TOKENS\.divider/.test(contextDivider) &&
    !/opacity-80/.test(contextDivider) &&
    !/\bmy-2\b/.test(contextDivider),
  "ContextDivider uses SURFACE_TOKENS.divider only"
);

assertCase(
  "ux221.inspector.singleDivider",
  /ContextDivider/.test(inspector) && !/PanelDivider/.test(inspector),
  "Inspector uses single ContextDivider (no PanelDivider stack)"
);

assertCase(
  "ux221.emptyState.tokens",
  /SURFACE_TOKENS/.test(emptyState) &&
    !/px-3\s+py-6/.test(emptyState) &&
    /SURFACE_TOKENS/.test(emptyIcon) &&
    !/h-8\s+w-8/.test(emptyIcon),
  "EmptyState/EmptyIcon use tokens; no px-3 py-6 / h-8 w-8"
);

assertCase(
  "ux221.icon.alignment",
  /size="lg"/.test(explorer) &&
    /size="lg"/.test(inspector) &&
    /size="lg"/.test(consoleContent) &&
    /size="lg"/.test(bodyLayout) &&
    !/size="sm"/.test(explorer) &&
    !/size="sm"/.test(inspector) &&
    !/size="sm"/.test(consoleContent),
  "Panel WorkspaceIcons use size=lg (ACTION/ICON slot alignment)"
);

assertCase(
  "ux221.emptyState.api.frozen",
  /export\s+type\s+EmptyStateProps/.test(emptyState) &&
    /icon\?:/.test(emptyState) &&
    /title:\s*string/.test(emptyState) &&
    /description\?:/.test(emptyState) &&
    /action\?:/.test(emptyState),
  "EmptyState public props unchanged"
);

/* -------------------------------------------------------------------------- */
/* C. No new Tailwind drift literals (scoped hotspots)                        */
/* -------------------------------------------------------------------------- */

const hotspotPaths = [
  panelHeader,
  panelBody,
  bodyLayout,
  contextDivider,
  emptyState,
  emptyIcon,
  explorer,
  inspector,
  consoleContent,
];

const forbiddenNewLiterals = [
  /gap-2\.5/,
  /text-\[11px\]/,
  /rounded-\[11px\]/,
  /rounded-xl/,
  /tracking-\[0\.09em\]/,
  /text-\[9px\]/,
];

let hotspotClean = true;
const hotspotHits: string[] = [];
for (const src of hotspotPaths) {
  for (const re of forbiddenNewLiterals) {
    if (re.test(src)) {
      hotspotClean = false;
      hotspotHits.push(re.source);
    }
  }
}

assertCase(
  "ux221.no.new.tailwind.literals",
  hotspotClean,
  hotspotClean
    ? "No forbidden new literals in polish hotspots"
    : `Hits: ${[...new Set(hotspotHits)].join(", ")}`
);

/* -------------------------------------------------------------------------- */
/* D. Token reachability                                                      */
/* -------------------------------------------------------------------------- */

const surfaceKeys = extractTokenKeys(surfaceTokens, "SURFACE_TOKENS");
const layoutKeys = extractTokenKeys(layoutTokens, "LAYOUT_TOKENS");
const semanticKeys = extractTokenKeys(semanticTokens, "SEMANTIC_TOKENS");
const actionKeys = extractTokenKeys(actionTokens, "ACTION_TOKENS");
const iconKeys = extractTokenKeys(iconTokens, "ICON_TOKENS");

const consumerBlob =
  workspaceSource +
  surfaceTokens +
  layoutTokens +
  semanticTokens +
  actionTokens +
  iconTokens;

const isReachable = (ns: string, key: string, selfSource: string): boolean => {
  if (new RegExp(`${ns}\\.${key}\\b`).test(consumerBlob.replace(selfSource, ""))) {
    return true;
  }
  // Compose-only: key appears in another value string in same SSOT file
  const withoutDecl = selfSource.replace(
    new RegExp(`^\\s{2}${key}\\s*:.*$`, "m"),
    ""
  );
  if (new RegExp(`\\b${key}\\b`).test(withoutDecl) === false) {
    // Referenced as nested object used via SURFACE_TOKENS.key.sub
    if (new RegExp(`${ns}\\.${key}\\.`).test(consumerBlob)) return true;
  }
  if (new RegExp(`${ns}\\.${key}\\b`).test(consumerBlob)) return true;
  // Atomic compose ingredients embedded in same-file compound strings
  const keyValueMatch = selfSource.match(
    new RegExp(`\\b${key}\\s*:\\s*["'\`]([^"'\`]+)["'\`]`)
  );
  if (keyValueMatch) {
    const val = keyValueMatch[1];
    if (val && selfSource.includes(val) && selfSource.split(val).length > 2) {
      return true;
    }
  }
  return new RegExp(`${ns}\\.${key}\\b`).test(consumerBlob);
};

const orphanSurface = surfaceKeys.filter(
  (k) => !isReachable("SURFACE_TOKENS", k, surfaceTokens)
);
const orphanLayout = layoutKeys.filter(
  (k) => !isReachable("LAYOUT_TOKENS", k, layoutTokens)
);
const orphanSemantic = semanticKeys.filter(
  (k) => !isReachable("SEMANTIC_TOKENS", k, semanticTokens)
);
const orphanAction = actionKeys.filter(
  (k) => !isReachable("ACTION_TOKENS", k, actionTokens)
);
const orphanIcon = iconKeys.filter(
  (k) => !isReachable("ICON_TOKENS", k, iconTokens)
);

assertCase(
  "ux221.reachability.surface",
  orphanSurface.length === 0 && !/identityRow/.test(surfaceTokens),
  orphanSurface.length === 0
    ? "SURFACE_TOKENS keys reachable; identityRow removed"
    : `Orphans: ${orphanSurface.join(", ")}`
);

assertCase(
  "ux221.reachability.layout",
  orphanLayout.length === 0,
  orphanLayout.length === 0
    ? "LAYOUT_TOKENS keys reachable"
    : `Orphans: ${orphanLayout.join(", ")}`
);

assertCase(
  "ux221.reachability.semantic",
  orphanSemantic.length === 0,
  orphanSemantic.length === 0
    ? "SEMANTIC_TOKENS keys reachable"
    : `Orphans: ${orphanSemantic.join(", ")}`
);

assertCase(
  "ux221.reachability.action",
  orphanAction.length === 0,
  orphanAction.length === 0
    ? "ACTION_TOKENS keys reachable"
    : `Orphans: ${orphanAction.join(", ")}`
);

assertCase(
  "ux221.reachability.icon",
  orphanIcon.length === 0,
  orphanIcon.length === 0
    ? "ICON_TOKENS keys reachable"
    : `Orphans: ${orphanIcon.join(", ")}`
);

assertCase(
  "ux221.sectionGap.consumed",
  /SURFACE_TOKENS\.sectionGap/.test(workspaceSource),
  "SURFACE_TOKENS.sectionGap has a consumer (PanelContentSection)"
);

/* -------------------------------------------------------------------------- */
/* E. Docs + roadmap                                                          */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux221.doc.exists",
  existsSync(docPath) &&
    /UX-2\.21/.test(doc) &&
    /No Tailwind literals/i.test(doc) &&
    /reachability/i.test(doc) &&
    /No file or directory moves/i.test(doc) &&
    /Next:\s*UX-2\.22/i.test(doc),
  "docs/UX-2.21-final-visual-polish.md present with contracts"
);

assertCase(
  "ux221.ux220.next",
  /Next:\s*UX-2\.22/i.test(ux220Doc) || /→ UX-2\.22/.test(ux220Doc),
  "UX-2.20 NEXT points toward UX-2.22 after polish"
);

assertCase(
  "ux221.roadmap.status",
  /UX-2\.21\s*=\s*COMPLETE/.test(roadmap) &&
    /Final Visual Polish/.test(roadmap) &&
    /UX-2\.22/.test(roadmap) &&
    /Content Grammar/.test(roadmap) &&
    (/NEXT\s*=\s*UX-2\.22/.test(roadmap) ||
      /NEXT\s*=\s*UX-2\.23/.test(roadmap) ||
      /UX-2\.22\s*=\s*COMPLETE/.test(roadmap)),
  "roadmap marks UX-2.21 COMPLETE; NEXT → UX-2.22 or successor"
);

assertCase(
  "ux221.package.script",
  /"validate:ux-2\.21"\s*:/.test(pkg),
  "validate:ux-2.21 in package.json"
);

assertCase(
  "ux221.no.content.grammar.docs.scope",
  /Content Grammar/.test(doc) &&
    (/Out of scope/i.test(doc) || /NO UX-2\.22/.test(doc)),
  "UX-2.21 doc keeps Content Grammar out of scope"
);

/* -------------------------------------------------------------------------- */
/* F. Delegates — UX-2.20 + tsc + eslint                                      */
/* -------------------------------------------------------------------------- */

if (process.env.UX_SKIP_DELEGATES !== "1") {
  const ux220 = spawnSync("npx", ["tsx", "scripts/validate-ux-2.20.ts"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
    env: { ...process.env, UX_SKIP_DELEGATES: "1" },
  });
  assertCase(
    "ux221.delegate.ux-2.20",
    ux220.status === 0,
    ux220.status === 0
      ? "PASS (leaf)"
      : `${ux220.stdout ?? ""}\n${ux220.stderr ?? ""}`.trim().slice(-1200)
  );

  const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
  });
  assertCase(
    "ux221.typescript",
    tsc.status === 0,
    tsc.status === 0
      ? "PASS"
      : `${tsc.stdout ?? ""}\n${tsc.stderr ?? ""}`.trim().slice(-1200)
  );

  const eslint = spawnSync(
    "npx",
    [
      "eslint",
      "src/components/workspace/panels/PanelHeader.tsx",
      "src/components/workspace/panels/PanelBody.tsx",
      "src/components/workspace/panels/WorkspaceBodyLayout.tsx",
      "src/components/workspace/panels/content",
      "src/components/workspace/panels/empty",
      "src/components/workspace/disclosure",
      "src/components/workspace/hints",
      "src/components/workspace/status",
      "src/components/workspace/actions/ContextActions.tsx",
      "src/components/workspace/WorkspaceContent.tsx",
      "src/components/workspace/surfaces/SurfaceTokens.ts",
      "scripts/validate-ux-2.21.ts",
    ],
    {
      cwd: repoRoot,
      encoding: "utf8",
      shell: true,
    }
  );
  assertCase(
    "ux221.eslint",
    eslint.status === 0,
    eslint.status === 0
      ? "PASS"
      : `${eslint.stdout ?? ""}\n${eslint.stderr ?? ""}`.trim().slice(-1200)
  );
} else {
  assertCase(
    "ux221.delegate.skipped",
    true,
    "UX_SKIP_DELEGATES=1 — leaf suite skipped"
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "ux-2.21-final-visual-polish",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — ux-2.21-final-visual-polish"
    : `\nFAIL — ux-2.21-final-visual-polish (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
