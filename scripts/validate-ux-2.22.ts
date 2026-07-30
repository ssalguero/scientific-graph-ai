/**
 * UX-2.22 — Content Grammar Foundation gate.
 * Presentational content blocks only; pixel parity with UX-2.21.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const workspaceDir = join(repoRoot, "src/components/workspace");
const contentDir = join(workspaceDir, "content");
const panelsDir = join(workspaceDir, "panels");
const panelContentDir = join(panelsDir, "content");
const emptyDir = join(panelsDir, "empty");
const packagePath = join(repoRoot, "package.json");
const docPath = join(repoRoot, "docs/UX-2.22-content-grammar.md");
const roadmapPath = join(repoRoot, "docs/UX-2.0-roadmap.md");
const ux221DocPath = join(repoRoot, "docs/UX-2.21-final-visual-polish.md");

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

const contentFiles = collectTsFiles(contentDir);
const contentSource = contentFiles.map((f) => f.source).join("\n");
const contentBarrel = read(join(contentDir, "index.ts"));
const tokensSource = read(join(contentDir, "CONTENT_TOKENS.ts"));
const explorerSource = read(join(panelContentDir, "ExplorerContent.tsx"));
const inspectorSource = read(join(panelContentDir, "InspectorContent.tsx"));
const consoleSource = read(join(panelContentDir, "ConsoleContent.tsx"));
const bodyLayoutSource = read(join(panelsDir, "WorkspaceBodyLayout.tsx"));
const panelEmptyState = read(join(emptyDir, "EmptyState.tsx"));
const panelEmptyDescription = read(join(emptyDir, "EmptyDescription.tsx"));
const workspaceBarrel = read(join(workspaceDir, "index.ts"));
const pkg = read(packagePath);
const doc = read(docPath);
const roadmap = read(roadmapPath);
const ux221Doc = read(ux221DocPath);

/* -------------------------------------------------------------------------- */
/* A. content/ structure + barrel                                             */
/* -------------------------------------------------------------------------- */

const requiredFiles = [
  "CONTENT_TOKENS.ts",
  "ContentGroup.tsx",
  "ContentRow.tsx",
  "KeyValue.tsx",
  "Description.tsx",
  "Notice.tsx",
  "EmptyState.tsx",
  "DividerContent.tsx",
  "index.ts",
];
for (const f of requiredFiles) {
  assertCase(
    `ux222.content.file.${f}`,
    existsSync(join(contentDir, f)),
    `workspace/content/${f} present`
  );
}

assertCase(
  "ux222.content.barrel",
  /CONTENT_TOKENS/.test(contentBarrel) &&
    /ContentGroup/.test(contentBarrel) &&
    /ContentRow/.test(contentBarrel) &&
    /KeyValue/.test(contentBarrel) &&
    /Description/.test(contentBarrel) &&
    /Notice/.test(contentBarrel) &&
    /EmptyState/.test(contentBarrel) &&
    /DividerContent/.test(contentBarrel),
  "content barrel exports public API"
);

assertCase(
  "ux222.content.barrel.noHelpers",
  !/export\s+function\s+/.test(contentBarrel) &&
    !/export\s+const\s+\w+\s*=/.test(contentBarrel),
  "content barrel re-exports only (no inline helpers)"
);

assertCase(
  "ux222.no.public.workspace.barrel",
  !/from\s+["']\.\/content/.test(workspaceBarrel) &&
    !/CONTENT_TOKENS/.test(workspaceBarrel) &&
    !/ContentGroup/.test(workspaceBarrel) &&
    !/KeyValue/.test(workspaceBarrel) &&
    !/DividerContent/.test(workspaceBarrel),
  "workspace/index.ts does not export content/"
);

/* -------------------------------------------------------------------------- */
/* B. CONTENT_TOKENS compose-only SSOT                                        */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux222.tokens.composeOnlyDoc",
  /compose-only|únicamente compone|aliases existing|Reuses existing/i.test(
    tokensSource + "\n" + doc
  ),
  "CONTENT_TOKENS documented as compose-only"
);

assertCase(
  "ux222.tokens.noParallelSsot",
  !/export\s+const\s+SURFACE_TOKENS/.test(tokensSource) &&
    !/export\s+const\s+LAYOUT_TOKENS/.test(tokensSource) &&
    !/export\s+const\s+SEMANTIC_TOKENS/.test(tokensSource) &&
    !/export\s+const\s+ACTION_TOKENS/.test(tokensSource) &&
    !/export\s+const\s+ICON_TOKENS/.test(tokensSource),
  "CONTENT_TOKENS does not redefine other token SSOTs"
);

assertCase(
  "ux222.tokens.noDownwardImport",
  !hasImportPath(tokensSource, "SurfaceTokens") &&
    !hasImportPath(tokensSource, "LayoutTokens") &&
    !hasImportPath(tokensSource, "SEMANTIC_TOKENS") &&
    !hasImportPath(tokensSource, "ACTION_TOKENS") &&
    !hasImportPath(tokensSource, "ICON_TOKENS") &&
    !hasImportPath(tokensSource, "surfaces") &&
    !hasImportPath(tokensSource, "layout") &&
    !hasImportPath(tokensSource, "semantics") &&
    !hasImportPath(tokensSource, "toolbar") &&
    !hasImportPath(tokensSource, "iconography"),
  "CONTENT_TOKENS has no imports from other token packages"
);

assertCase(
  "ux222.tokens.keys",
  /groupGap/.test(tokensSource) &&
    /groupRoot/.test(tokensSource) &&
    /rowRoot/.test(tokensSource) &&
    /keyValueRoot/.test(tokensSource) &&
    /description:/.test(tokensSource) &&
    /notice:/.test(tokensSource) &&
    /emptyTitle/.test(tokensSource) &&
    /divider:/.test(tokensSource),
  "CONTENT_TOKENS has required composition keys"
);

assertCase(
  "ux222.tokens.notice.variants",
  /info:/.test(tokensSource) &&
    /warning:/.test(tokensSource) &&
    /success:/.test(tokensSource) &&
    /danger:/.test(tokensSource),
  "CONTENT_TOKENS.notice has info/warning/success/danger"
);

/* -------------------------------------------------------------------------- */
/* C. Server Components — no client / hooks / logic                           */
/* -------------------------------------------------------------------------- */

for (const file of contentFiles) {
  assertCase(
    `ux222.noUseClient.${file.name}`,
    !/["']use client["']/.test(file.source),
    `${file.name} has no "use client"`
  );
  assertCase(
    `ux222.noHooks.${file.name}`,
    !hasHookCall(file.source),
    `${file.name} has no hooks`
  );
  assertCase(
    `ux222.noAppImport.${file.name}`,
    !hasImportPath(file.source, "@/app") &&
      !hasImportPath(file.source, "src/app") &&
      !/from\s+["'][^"']*\/app\//.test(file.source),
    `${file.name} has no app imports`
  );
  assertCase(
    `ux222.noCallbacks.${file.name}`,
    !/\bon[A-Z][A-Za-z]+\s*[?:]/.test(file.source) &&
      !/\bonClick\b/.test(file.source) &&
      !/\bonToggle\b/.test(file.source),
    `${file.name} has no callback props`
  );
}

assertCase(
  "ux222.noInteractive",
  !/<button\b/.test(contentSource) &&
    !/<input\b/.test(contentSource) &&
    !/<select\b/.test(contentSource) &&
    !/<textarea\b/.test(contentSource) &&
    !/<form\b/.test(contentSource),
  "content/ has no interactive form controls"
);

/* -------------------------------------------------------------------------- */
/* D. API Freeze                                                              */
/* -------------------------------------------------------------------------- */

const keyValueSource = read(join(contentDir, "KeyValue.tsx"));
const noticeSource = read(join(contentDir, "Notice.tsx"));
const contentEmptySource = read(join(contentDir, "EmptyState.tsx"));
const descriptionSource = read(join(contentDir, "Description.tsx"));

assertCase(
  "ux222.api.KeyValue",
  /label:\s*string/.test(keyValueSource) &&
    /value:\s*string/.test(keyValueSource) &&
    /export\s+function\s+KeyValue/.test(keyValueSource),
  "KeyValue API: label + value"
);

assertCase(
  "ux222.api.KeyValue.exportedUnusedOk",
  /KeyValue/.test(contentBarrel) &&
    !hasJsxComponent(explorerSource, "KeyValue") &&
    !hasJsxComponent(inspectorSource, "KeyValue") &&
    !hasJsxComponent(consoleSource, "KeyValue"),
  "KeyValue exported; no fictional pairs wired"
);

assertCase(
  "ux222.api.Notice.variants",
  /NoticeVariant/.test(noticeSource) &&
    /"info"\s*\|\s*"warning"\s*\|\s*"success"\s*\|\s*"danger"/.test(
      noticeSource
    ),
  "Notice variants: info | warning | success | danger"
);

assertCase(
  "ux222.api.content.EmptyState",
  /title:\s*string/.test(contentEmptySource) &&
    /description\?:/.test(contentEmptySource) &&
    !/\bicon\s*[?:]/.test(contentEmptySource) &&
    !/\baction\s*[?:]/.test(contentEmptySource),
  "content EmptyState: title + description only (no icon/action)"
);

assertCase(
  "ux222.api.panel.EmptyState.preserved",
  /export\s+type\s+EmptyStateProps/.test(panelEmptyState) &&
    /icon\?:/.test(panelEmptyState) &&
    /title:\s*string/.test(panelEmptyState) &&
    /description\?:/.test(panelEmptyState) &&
    /action\?:/.test(panelEmptyState) &&
    /ContentEmptyState|from\s+["'][^"']*content/.test(panelEmptyState),
  "panels/empty EmptyState API preserved; composes content EmptyState"
);

assertCase(
  "ux222.api.Description",
  /children\?:/.test(descriptionSource) || /children:/.test(descriptionSource),
  "Description API: children"
);

/* -------------------------------------------------------------------------- */
/* E. Wiring — pixel parity / no Canvas / no KeyValue fiction                 */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux222.wire.explorer",
  hasJsxComponent(explorerSource, "ContentGroup") &&
    hasJsxComponent(explorerSource, "WorkspaceGroup") &&
    hasJsxComponent(explorerSource, "ContextDivider") &&
    !hasJsxComponent(explorerSource, "KeyValue") &&
    !hasJsxComponent(explorerSource, "Notice"),
  "Explorer: ContentGroup structure only; no KeyValue/Notice"
);

assertCase(
  "ux222.wire.inspector",
  hasJsxComponent(inspectorSource, "ContentGroup") &&
    hasJsxComponent(inspectorSource, "Notice") &&
    /variant=["']info["']/.test(inspectorSource) &&
    !hasJsxComponent(inspectorSource, "KeyValue"),
  "Inspector: ContentGroup + Notice(info); no KeyValue"
);

assertCase(
  "ux222.wire.console",
  hasJsxComponent(consoleSource, "ContentGroup") &&
    /description=["']Console messages will appear here\.["']/.test(
      consoleSource
    ) &&
    !hasJsxComponent(consoleSource, "KeyValue") &&
    !hasJsxComponent(consoleSource, "Notice"),
  "Console: ContentGroup; existing description copy; Description via EmptyState"
);

assertCase(
  "ux222.wire.console.description.path",
  /Description/.test(panelEmptyDescription) ||
    /from\s+["'][^"']*content/.test(panelEmptyDescription),
  "EmptyDescription composes content Description"
);

assertCase(
  "ux222.wire.canvas.untouched",
  !/from\s+["'][^"']*workspace\/content/.test(bodyLayoutSource) &&
    !/from\s+["']\.\.\/\.\.\/content["']/.test(bodyLayoutSource) &&
    !/from\s+["']\.\.\/content["']/.test(bodyLayoutSource) &&
    !hasJsxComponent(bodyLayoutSource, "ContentGroup") &&
    !hasJsxComponent(bodyLayoutSource, "Notice") &&
    !hasJsxComponent(bodyLayoutSource, "KeyValue") &&
    !hasJsxComponent(bodyLayoutSource, "DividerContent") &&
    !hasJsxComponent(bodyLayoutSource, "ContentRow"),
  "Canvas (WorkspaceBodyLayout) not modified with content grammar"
);

assertCase(
  "ux222.no.fictional.copy",
  !/TODO|lorem|placeholder label|Sample value/i.test(
    explorerSource + inspectorSource + consoleSource
  ),
  "No fictional KeyValue/Notice copy in panel content"
);

/* -------------------------------------------------------------------------- */
/* F. Package isolation — content does not touch frozen surfaces              */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux222.isolation.noSessionWindow",
  !hasImportPath(contentSource, "session") &&
    !hasImportPath(contentSource, "WindowManager") &&
    !hasImportPath(contentSource, "WorkspaceLayout") &&
    !hasImportPath(contentSource, "PanelState") &&
    !hasImportPath(contentSource, "PanelProvider") &&
    !hasImportPath(contentSource, "/focus") &&
    !hasImportPath(contentSource, "/modes") &&
    !hasImportPath(contentSource, "/resize"),
  "content/ isolated from Session/Window/state/focus/modes/resize"
);

assertCase(
  "ux222.isolation.componentsUseTokens",
  /CONTENT_TOKENS/.test(read(join(contentDir, "ContentGroup.tsx"))) &&
    /CONTENT_TOKENS/.test(read(join(contentDir, "ContentRow.tsx"))) &&
    /CONTENT_TOKENS/.test(keyValueSource) &&
    /CONTENT_TOKENS/.test(descriptionSource) &&
    /CONTENT_TOKENS/.test(noticeSource) &&
    /CONTENT_TOKENS/.test(contentEmptySource) &&
    /CONTENT_TOKENS/.test(read(join(contentDir, "DividerContent.tsx"))),
  "All content primitives read CONTENT_TOKENS"
);

/* -------------------------------------------------------------------------- */
/* G. Docs + roadmap                                                          */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux222.doc.exists",
  existsSync(docPath) &&
    /UX-2\.22/.test(doc) &&
    /CONTENT_TOKENS/.test(doc) &&
    /Content Grammar/i.test(doc) &&
    /pixel parity|pixel-identical/i.test(doc) &&
    /API FREEZE|API frozen|congelad/i.test(doc),
  "docs/UX-2.22-content-grammar.md present with contracts"
);

assertCase(
  "ux222.roadmap.status",
  /UX-2\.22\s*=\s*COMPLETE/.test(roadmap) &&
    /Content Grammar/.test(roadmap) &&
    (/NEXT\s*=\s*UX-2\.23/.test(roadmap) || /NEXT\s*→\s*UX-2\.23/.test(roadmap)),
  "roadmap marks UX-2.22 COMPLETE; NEXT → UX-2.23"
);

assertCase(
  "ux222.package.script",
  /"validate:ux-2\.22"\s*:/.test(pkg),
  "validate:ux-2.22 in package.json"
);

/* -------------------------------------------------------------------------- */
/* H. Delegates — UX-2.21 + tsc + eslint                                      */
/* -------------------------------------------------------------------------- */

if (process.env.UX_SKIP_DELEGATES !== "1") {
  const ux221 = spawnSync("npx", ["tsx", "scripts/validate-ux-2.21.ts"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
    env: { ...process.env, UX_SKIP_DELEGATES: "1" },
  });
  assertCase(
    "ux222.delegate.ux-2.21",
    ux221.status === 0,
    ux221.status === 0
      ? "PASS (leaf)"
      : `${ux221.stdout ?? ""}\n${ux221.stderr ?? ""}`.trim().slice(-1200)
  );

  const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
  });
  assertCase(
    "ux222.typescript",
    tsc.status === 0,
    tsc.status === 0
      ? "PASS"
      : `${tsc.stdout ?? ""}\n${tsc.stderr ?? ""}`.trim().slice(-1200)
  );

  const eslint = spawnSync(
    "npx",
    [
      "eslint",
      "src/components/workspace/content",
      "src/components/workspace/panels/content",
      "src/components/workspace/panels/empty",
      "scripts/validate-ux-2.22.ts",
    ],
    {
      cwd: repoRoot,
      encoding: "utf8",
      shell: true,
    }
  );
  assertCase(
    "ux222.eslint",
    eslint.status === 0,
    eslint.status === 0
      ? "PASS"
      : `${eslint.stdout ?? ""}\n${eslint.stderr ?? ""}`.trim().slice(-1200)
  );
} else {
  assertCase(
    "ux222.delegate.skipped",
    true,
    "UX_SKIP_DELEGATES=1 — leaf suite skipped"
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "ux-2.22-content-grammar",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — ux-2.22-content-grammar"
    : `\nFAIL — ux-2.22-content-grammar (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
