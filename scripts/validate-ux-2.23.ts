/**
 * UX-2.23 — Workspace Surface Polish Foundation gate.
 * Presentation layer only; PanelSurface + PanelLayout preserved.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const workspaceDir = join(repoRoot, "src/components/workspace");
const surfaceDir = join(workspaceDir, "surface");
const panelsDir = join(workspaceDir, "panels");
const panelContentDir = join(panelsDir, "content");
const disclosureDir = join(workspaceDir, "disclosure");
const packagePath = join(repoRoot, "package.json");
const docPath = join(repoRoot, "docs/UX-2.23-surface-polish.md");
const roadmapPath = join(repoRoot, "docs/UX-2.0-roadmap.md");

const results: { id: string; pass: boolean; detail: string }[] = [];

const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const read = (path: string): string =>
  existsSync(path) ? readFileSync(path, "utf8") : "";

const collectTsFiles = (
  dir: string
): { path: string; source: string; name: string }[] => {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return [];
  const out: { path: string; source: string; name: string }[] = [];
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".")) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...collectTsFiles(full));
      continue;
    }
    if (/\.(tsx?|mts|cts)$/.test(name)) {
      out.push({ path: full, source: read(full), name });
    }
  }
  return out;
};

const hasImportPath = (source: string, needle: string): boolean =>
  new RegExp(
    `from\\s+["'][^"']*${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^"']*["']`
  ).test(source);

const hasJsxComponent = (source: string, name: string): boolean =>
  new RegExp(`<${name}\\b`).test(source);

const hasHookCall = (source: string): boolean =>
  /\buseState\s*\(/.test(source) ||
  /\buseMemo\s*\(/.test(source) ||
  /\buseEffect\s*\(/.test(source) ||
  /\buseLayoutEffect\s*\(/.test(source) ||
  /\buseCallback\s*\(/.test(source) ||
  /\buseRef\s*\(/.test(source) ||
  /\buseContext\s*\(/.test(source);

const orderOk = (source: string, names: string[]): boolean => {
  let last = -1;
  for (const name of names) {
    const idx = source.indexOf(`<${name}`);
    if (idx < 0 || idx < last) return false;
    last = idx;
  }
  return true;
};

const surfaceFiles = collectTsFiles(surfaceDir);
const surfaceSource = surfaceFiles.map((f) => f.source).join("\n");
const surfaceBarrel = read(join(surfaceDir, "index.ts"));
const tokensSource = read(join(surfaceDir, "SURFACE_TOKENS.ts"));
const surfaceComp = read(join(surfaceDir, "Surface.tsx"));
const surfaceHeader = read(join(surfaceDir, "SurfaceHeader.tsx"));
const surfaceBody = read(join(surfaceDir, "SurfaceBody.tsx"));
const surfaceFooter = read(join(surfaceDir, "SurfaceFooter.tsx"));
const surfaceDivider = read(join(surfaceDir, "SurfaceDivider.tsx"));
const explorerSource = read(join(panelContentDir, "ExplorerContent.tsx"));
const inspectorSource = read(join(panelContentDir, "InspectorContent.tsx"));
const consoleSource = read(join(panelContentDir, "ConsoleContent.tsx"));
const bodyLayoutSource = read(join(panelsDir, "WorkspaceBodyLayout.tsx"));
const contextDivider = read(join(disclosureDir, "ContextDivider.tsx"));
const workspaceBarrel = read(join(workspaceDir, "index.ts"));
const pkg = read(packagePath);
const doc = read(docPath);
const roadmap = read(roadmapPath);

const panelSources = [
  { id: "explorer", source: explorerSource },
  { id: "inspector", source: inspectorSource },
  { id: "console", source: consoleSource },
  { id: "canvas", source: bodyLayoutSource },
];

/* -------------------------------------------------------------------------- */
/* A. surface/ structure + barrel                                             */
/* -------------------------------------------------------------------------- */

const requiredFiles = [
  "SURFACE_TOKENS.ts",
  "Surface.tsx",
  "SurfaceHeader.tsx",
  "SurfaceBody.tsx",
  "SurfaceFooter.tsx",
  "SurfaceDivider.tsx",
  "index.ts",
];
for (const f of requiredFiles) {
  assertCase(
    `ux223.surface.file.${f}`,
    existsSync(join(surfaceDir, f)),
    `workspace/surface/${f} present`
  );
}

assertCase(
  "ux223.surface.barrel",
  /SURFACE_TOKENS/.test(surfaceBarrel) &&
    /Surface/.test(surfaceBarrel) &&
    /SurfaceHeader/.test(surfaceBarrel) &&
    /SurfaceBody/.test(surfaceBarrel) &&
    /SurfaceFooter/.test(surfaceBarrel) &&
    /SurfaceDivider/.test(surfaceBarrel),
  "surface barrel exports public API"
);

assertCase(
  "ux223.surface.barrel.noHelpers",
  !/export\s+function\s+/.test(surfaceBarrel) &&
    !/export\s+const\s+(?!SURFACE_TOKENS)/.test(
      surfaceBarrel.replace(/export\s+\{\s*SURFACE_TOKENS[\s\S]*?\}/, "")
    ),
  "surface barrel is re-exports only"
);

assertCase(
  "ux223.surface.noPublicBarrel",
  !/from\s+["']\.\/surface/.test(workspaceBarrel) &&
    !/SurfaceHeader/.test(workspaceBarrel) &&
    !/SurfaceDivider/.test(workspaceBarrel) &&
    !/SURFACE_TOKENS/.test(workspaceBarrel),
  "workspace public barrel does not export surface/"
);

/* -------------------------------------------------------------------------- */
/* B. Tokens — independent compose-only SSOT                                  */
/* -------------------------------------------------------------------------- */

const requiredKeys = [
  "panelRadius",
  "panelPadding",
  "headerHeight",
  "bodyGap",
  "footerHeight",
  "surfaceBackground",
  "surfaceBorder",
  "surfaceShadow",
  "dividerOpacity",
  "compactSpacing",
  "normalSpacing",
  "comfortableSpacing",
];

assertCase(
  "ux223.tokens.keys",
  requiredKeys.every((k) => new RegExp(`\\b${k}\\s*:`).test(tokensSource)),
  "SURFACE_TOKENS has required keys"
);

assertCase(
  "ux223.tokens.composeOnlyDocs",
  /compose-only/i.test(tokensSource) &&
    (/MUST NOT import/i.test(tokensSource) ||
      /MUST NOT/.test(tokensSource)),
  "SURFACE_TOKENS documents compose-only independence"
);

assertCase(
  "ux223.tokens.noTokenObjectDeps",
  !hasImportPath(tokensSource, "ui/tokens") &&
    !hasImportPath(tokensSource, "UI_TOKENS") &&
    !hasImportPath(tokensSource, "SurfaceTokens") &&
    !hasImportPath(tokensSource, "CONTENT_TOKENS") &&
    !hasImportPath(tokensSource, "LAYOUT_TOKENS") &&
    !hasImportPath(tokensSource, "SEMANTIC_TOKENS") &&
    !hasImportPath(tokensSource, "ACTION_TOKENS") &&
    !hasImportPath(tokensSource, "ICON_TOKENS") &&
    !/from\s+["'][^"']*surfaces/.test(tokensSource) &&
    !/export\s+\{\s*UI_TOKENS/.test(tokensSource) &&
    !/export\s+\*\s+from/.test(tokensSource),
  "SURFACE_TOKENS does not import/re-export other *_TOKENS objects"
);

const primitivesReadTokens = [
  ["Surface", surfaceComp],
  ["SurfaceHeader", surfaceHeader],
  ["SurfaceBody", surfaceBody],
  ["SurfaceFooter", surfaceFooter],
  ["SurfaceDivider", surfaceDivider],
] as const;

for (const [name, source] of primitivesReadTokens) {
  assertCase(
    `ux223.tokens.consumedBy.${name}`,
    /SURFACE_TOKENS/.test(source),
    `${name} reads SURFACE_TOKENS`
  );
}

/* -------------------------------------------------------------------------- */
/* C. Governance                                                              */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux223.governance.noUseClient",
  !/"use client"/.test(surfaceSource),
  "surface/ has no use client"
);

assertCase(
  "ux223.governance.noHooks",
  !hasHookCall(surfaceSource),
  "surface/ has no hooks"
);

assertCase(
  "ux223.governance.noAppImports",
  !hasImportPath(surfaceSource, "@/app") &&
    !/from\s+["'][^"']*\/app\//.test(surfaceSource),
  "surface/ has no app imports"
);

assertCase(
  "ux223.governance.noClsClassnames",
  !/\bclsx\b/.test(surfaceSource) && !/\bclassnames\b/.test(surfaceSource),
  "surface/ has no clsx/classnames"
);

/* -------------------------------------------------------------------------- */
/* D. API freeze                                                              */
/* -------------------------------------------------------------------------- */

const childrenOnlyOk = (source: string, typeName: string): boolean => {
  const m = source.match(
    new RegExp(
      `export\\s+type\\s+${typeName}\\s*=\\s*\\{([\\s\\S]*?)\\}`
    )
  );
  if (!m) return false;
  const body = m[1];
  const props = [...body.matchAll(/(\w+)\s*\??\s*:/g)].map((x) => x[1]);
  return props.length === 1 && props[0] === "children";
};

assertCase(
  "ux223.api.Surface",
  childrenOnlyOk(surfaceComp, "SurfaceProps"),
  "Surface: children? only"
);

assertCase(
  "ux223.api.SurfaceHeader",
  childrenOnlyOk(surfaceHeader, "SurfaceHeaderProps"),
  "SurfaceHeader: children? only"
);

assertCase(
  "ux223.api.SurfaceBody",
  childrenOnlyOk(surfaceBody, "SurfaceBodyProps"),
  "SurfaceBody: children? only"
);

assertCase(
  "ux223.api.SurfaceFooter",
  childrenOnlyOk(surfaceFooter, "SurfaceFooterProps"),
  "SurfaceFooter: children? only"
);

assertCase(
  "ux223.api.SurfaceDivider",
  (() => {
    const m = surfaceDivider.match(
      /export\s+type\s+SurfaceDividerProps\s*=\s*\{([\s\S]*?)\}/
    );
    if (!m) return false;
    const body = m[1];
    const props = [...body.matchAll(/(\w+)\s*\??\s*:/g)].map((x) => x[1]);
    return (
      props.length === 1 &&
      props[0] === "className" &&
      !/\bchildren\b/.test(body)
    );
  })(),
  "SurfaceDivider: className? only; no children"
);

/* -------------------------------------------------------------------------- */
/* E. Wiring + hierarchy order                                                */
/* -------------------------------------------------------------------------- */

for (const { id, source } of panelSources) {
  assertCase(
    `ux223.wiring.${id}.components`,
    hasJsxComponent(source, "PanelSurface") &&
      hasJsxComponent(source, "Surface") &&
      hasJsxComponent(source, "PanelLayout") &&
      hasJsxComponent(source, "SurfaceHeader") &&
      hasJsxComponent(source, "SurfaceBody") &&
      hasJsxComponent(source, "SurfaceFooter"),
    `${id}: PanelSurface + Surface + PanelLayout + Header/Body/Footer`
  );

  assertCase(
    `ux223.wiring.${id}.order`,
    orderOk(source, [
      "PanelSurface",
      "Surface",
      "PanelLayout",
      "SurfaceHeader",
      "SurfaceBody",
      "SurfaceFooter",
    ]),
    `${id}: PanelSurface → Surface → PanelLayout → Header → Body → Footer`
  );
}

assertCase(
  "ux223.wiring.sidePanels.accent",
  hasJsxComponent(explorerSource, "PanelAccent") &&
    hasJsxComponent(inspectorSource, "PanelAccent") &&
    hasJsxComponent(consoleSource, "PanelAccent") &&
    orderOk(explorerSource, ["PanelSurface", "PanelAccent", "Surface"]),
  "Explorer/Inspector/Console: PanelSurface → PanelAccent → Surface"
);

/* -------------------------------------------------------------------------- */
/* F. Panel preservation — Surface never replaces PanelSurface                */
/* -------------------------------------------------------------------------- */

for (const { id, source } of panelSources) {
  const panelSurfaceIdx = source.indexOf("<PanelSurface");
  const surfaceIdx = source.indexOf("<Surface");
  const layoutIdx = source.indexOf("<PanelLayout");

  assertCase(
    `ux223.preserve.${id}.panelSurface`,
    panelSurfaceIdx >= 0,
    `${id}: PanelSurface still exists`
  );

  assertCase(
    `ux223.preserve.${id}.panelLayout`,
    layoutIdx >= 0,
    `${id}: PanelLayout still exists`
  );

  assertCase(
    `ux223.preserve.${id}.surfaceInsidePanelSurface`,
    panelSurfaceIdx >= 0 &&
      surfaceIdx > panelSurfaceIdx &&
      layoutIdx > surfaceIdx,
    `${id}: Surface inside PanelSurface; PanelLayout inside Surface`
  );
}

/* -------------------------------------------------------------------------- */
/* G. Dividers                                                                */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux223.dividers.contextComposesSurface",
  hasImportPath(contextDivider, "surface") &&
    /SurfaceDivider/.test(contextDivider) &&
    hasJsxComponent(contextDivider, "SurfaceDivider") &&
    /SURFACE_TOKENS\.divider/.test(contextDivider),
  "ContextDivider imports/composes SurfaceDivider; keeps surfaces divider tokens"
);

for (const { id, source } of panelSources) {
  assertCase(
    `ux223.dividers.${id}.noSurfaceDividerImport`,
    !hasImportPath(source, "SurfaceDivider") &&
      !/\bSurfaceDivider\b/.test(source),
    `${id}: does not import SurfaceDivider`
  );
}

assertCase(
  "ux223.dividers.panelsKeepContextDivider",
  hasJsxComponent(explorerSource, "ContextDivider") &&
    hasJsxComponent(inspectorSource, "ContextDivider") &&
    hasJsxComponent(consoleSource, "ContextDivider"),
  "Explorer/Inspector/Console still use ContextDivider"
);

assertCase(
  "ux223.dividers.noAdHocHrInChrome",
  !/<hr\b/.test(explorerSource) &&
    !/<hr\b/.test(inspectorSource) &&
    !/<hr\b/.test(consoleSource) &&
    !/<hr\b/.test(bodyLayoutSource),
  "panel chrome sources have no ad-hoc <hr>"
);

/* -------------------------------------------------------------------------- */
/* H. Docs                                                                    */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux223.doc.exists",
  existsSync(docPath) && /UX-2\.23/.test(doc) && /COMPLETE/.test(doc),
  "docs/UX-2.23-surface-polish.md COMPLETE"
);

assertCase(
  "ux223.roadmap.status",
  /UX-2\.23\s*=\s*COMPLETE/.test(roadmap) &&
    /Surface Polish/i.test(roadmap) &&
    (/NEXT\s*=\s*UX-3\.0/.test(roadmap) || /NEXT\s*→\s*UX-3\.0/.test(roadmap)),
  "roadmap marks UX-2.23 COMPLETE; NEXT → UX-3.0"
);

assertCase(
  "ux223.package.script",
  /"validate:ux-2\.23"\s*:/.test(pkg),
  "validate:ux-2.23 in package.json"
);

/* -------------------------------------------------------------------------- */
/* I. Delegates — UX-2.22 + tsc + eslint                                      */
/* -------------------------------------------------------------------------- */

if (process.env.UX_SKIP_DELEGATES !== "1") {
  const ux222 = spawnSync("npx", ["tsx", "scripts/validate-ux-2.22.ts"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
    env: { ...process.env, UX_SKIP_DELEGATES: "1" },
  });
  assertCase(
    "ux223.delegate.ux-2.22",
    ux222.status === 0,
    ux222.status === 0
      ? "PASS (leaf)"
      : `${ux222.stdout ?? ""}\n${ux222.stderr ?? ""}`.trim().slice(-1200)
  );

  const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
  });
  assertCase(
    "ux223.typescript",
    tsc.status === 0,
    tsc.status === 0
      ? "PASS"
      : `${tsc.stdout ?? ""}\n${tsc.stderr ?? ""}`.trim().slice(-1200)
  );

  const eslint = spawnSync(
    "npx",
    [
      "eslint",
      "src/components/workspace/surface",
      "src/components/workspace/disclosure/ContextDivider.tsx",
      "src/components/workspace/panels/content",
      "src/components/workspace/panels/WorkspaceBodyLayout.tsx",
      "scripts/validate-ux-2.23.ts",
    ],
    {
      cwd: repoRoot,
      encoding: "utf8",
      shell: true,
    }
  );
  assertCase(
    "ux223.eslint",
    eslint.status === 0,
    eslint.status === 0
      ? "PASS"
      : `${eslint.stdout ?? ""}\n${eslint.stderr ?? ""}`.trim().slice(-1200)
  );
} else {
  assertCase(
    "ux223.delegate.skipped",
    true,
    "UX_SKIP_DELEGATES=1 — leaf suite skipped"
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "ux-2.23-surface-polish",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — ux-2.23-surface-polish"
    : `\nFAIL — ux-2.23-surface-polish (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
