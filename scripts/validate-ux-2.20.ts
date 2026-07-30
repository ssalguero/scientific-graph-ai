/**
 * UX-2.20 — Iconography & Microinteractions gate.
 * Presentational only; ACTION_TOKENS owns interaction; ICON_TOKENS owns icons.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const workspaceDir = join(repoRoot, "src/components/workspace");
const iconographyDir = join(workspaceDir, "iconography");
const toolbarDir = join(workspaceDir, "toolbar");
const panelsDir = join(workspaceDir, "panels");
const contentDir = join(panelsDir, "content");
const packagePath = join(repoRoot, "package.json");
const docPath = join(repoRoot, "docs/UX-2.20-iconography-microinteractions.md");
const roadmapPath = join(repoRoot, "docs/UX-2.0-roadmap.md");
const ux219DocPath = join(repoRoot, "docs/UX-2.19-toolbar-actions.md");

const results: { id: string; pass: boolean; detail: string }[] = [];

const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const read = (path: string): string =>
  existsSync(path) ? readFileSync(path, "utf8") : "";

const collectTsSources = (dir: string): string[] => {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return [];
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".")) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...collectTsSources(full));
      continue;
    }
    if (/\.(tsx?|mts|cts)$/.test(name)) {
      out.push(read(full));
    }
  }
  return out;
};

const collectTsFilesOutside = (
  dir: string,
  excludeDir: string
): { path: string; source: string }[] => {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return [];
  const out: { path: string; source: string }[] = [];
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".")) continue;
    const full = join(dir, name);
    if (full === excludeDir || full.startsWith(excludeDir + "\\") || full.startsWith(excludeDir + "/")) {
      continue;
    }
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...collectTsFilesOutside(full, excludeDir));
      continue;
    }
    if (/\.(tsx?|mts|cts)$/.test(name)) {
      out.push({ path: full, source: read(full) });
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
  /\buseRef\s*\(/.test(source);

const iconographySource = collectTsSources(iconographyDir).join("\n");
const iconographyBarrel = read(join(iconographyDir, "index.ts"));
const tokensSource = read(join(iconographyDir, "ICON_TOKENS.ts"));
const iconSource = read(join(iconographyDir, "WorkspaceIcon.tsx"));
const registrySource = read(join(iconographyDir, "workspaceIconRegistry.ts"));
const actionTokensSource = read(join(toolbarDir, "ACTION_TOKENS.ts"));
const buttonSource = read(join(toolbarDir, "ActionButton.tsx"));
const bodyLayoutSource = read(join(panelsDir, "WorkspaceBodyLayout.tsx"));
const explorerSource = read(join(contentDir, "ExplorerContent.tsx"));
const inspectorSource = read(join(contentDir, "InspectorContent.tsx"));
const consoleSource = read(join(contentDir, "ConsoleContent.tsx"));
const workspaceBarrel = read(join(workspaceDir, "index.ts"));
const pkg = read(packagePath);
const doc = read(docPath);
const roadmap = read(roadmapPath);
const ux219Doc = read(ux219DocPath);

/* -------------------------------------------------------------------------- */
/* A. iconography/ structure + barrel                                         */
/* -------------------------------------------------------------------------- */

const iconographyFiles = [
  "ICON_TOKENS.ts",
  "WorkspaceIcon.tsx",
  "workspaceIconRegistry.ts",
  "index.ts",
];
for (const f of iconographyFiles) {
  assertCase(
    `ux220.iconography.file.${f}`,
    existsSync(join(iconographyDir, f)),
    `workspace/iconography/${f} present`
  );
}

assertCase(
  "ux220.iconography.no.interaction_tokens",
  !existsSync(join(iconographyDir, "INTERACTION_TOKENS.ts")) &&
    !/INTERACTION_TOKENS/.test(iconographySource),
  "no INTERACTION_TOKENS SSOT"
);

assertCase(
  "ux220.iconography.barrel",
  /ICON_TOKENS/.test(iconographyBarrel) &&
    /WorkspaceIcon/.test(iconographyBarrel) &&
    /WorkspaceIconProps/.test(iconographyBarrel) &&
    !/workspaceIconRegistry/.test(iconographyBarrel) &&
    !/WorkspaceIconName/.test(iconographyBarrel) &&
    !/INTERACTION_TOKENS/.test(iconographyBarrel),
  "local barrel exports only ICON_TOKENS · WorkspaceIcon · WorkspaceIconProps"
);

assertCase(
  "ux220.registry.private",
  /export\s+const\s+workspaceIconRegistry/.test(registrySource) &&
    /keyof typeof workspaceIconRegistry/.test(registrySource) &&
    !/export\s+\{[^}]*workspaceIconRegistry/.test(iconographyBarrel) &&
    !/export\s+type\s+\{[^}]*WorkspaceIconName/.test(iconographyBarrel),
  "workspaceIconRegistry exists; WorkspaceIconName internal; not barrel-exported"
);

/* -------------------------------------------------------------------------- */
/* B. ICON_TOKENS + WorkspaceIcon API                                         */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux220.icon_tokens.compose",
  /export\s+const\s+ICON_TOKENS/.test(tokensSource) &&
    /sizeSm:/.test(tokensSource) &&
    /sizeMd:/.test(tokensSource) &&
    /sizeLg:/.test(tokensSource) &&
    /color:/.test(tokensSource) &&
    !/hover/.test(tokensSource) &&
    !/pressed/.test(tokensSource) &&
    !/disabled/.test(tokensSource) &&
    !/transition/.test(tokensSource) &&
    !/duration-/.test(tokensSource),
  "ICON_TOKENS sizes/color only; no interaction ownership"
);

assertCase(
  "ux220.workspace_icon.api",
  /export\s+type\s+WorkspaceIconProps/.test(iconSource) &&
    /name:\s*WorkspaceIconName/.test(iconSource) &&
    /size\?:\s*"sm"\s*\|\s*"md"\s*\|\s*"lg"/.test(iconSource) &&
    /aria-hidden/.test(iconSource) &&
    !/children\?:/.test(iconSource) &&
    !/onClick/.test(iconSource) &&
    !/role=/.test(iconSource) &&
    !/tabIndex/.test(iconSource),
  "WorkspaceIcon API frozen (name + size?); decorative"
);

assertCase(
  "ux220.no.hooks.use_client",
  !/"use client"/.test(iconographySource) && !hasHookCall(iconographySource),
  "iconography/ has no use client and no hooks"
);

/* -------------------------------------------------------------------------- */
/* C. lucide-react isolation                                                  */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux220.lucide.in.iconography",
  /from\s+["']lucide-react["']/.test(registrySource),
  "lucide-react imported in workspaceIconRegistry"
);

const outsideFiles = collectTsFilesOutside(workspaceDir, iconographyDir);
const lucideOutside = outsideFiles.filter((f) =>
  /from\s+["']lucide-react["']/.test(f.source)
);
assertCase(
  "ux220.lucide.only.iconography",
  lucideOutside.length === 0,
  lucideOutside.length === 0
    ? "no lucide-react outside iconography/"
    : `lucide outside: ${lucideOutside.map((f) => f.path).join(", ")}`
);

assertCase(
  "ux220.pkg.lucide",
  /"lucide-react"\s*:/.test(pkg),
  "lucide-react in package.json dependencies"
);

/* -------------------------------------------------------------------------- */
/* D. Isolation + ACTION_TOKENS ownership                                     */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux220.iconography.isolation",
  !hasImportPath(iconographySource, "/toolbar/") &&
    !hasImportPath(iconographySource, "ACTION_TOKENS") &&
    !hasImportPath(iconographySource, "/layout") &&
    !hasImportPath(iconographySource, "/surfaces") &&
    !hasImportPath(iconographySource, "/composition") &&
    !hasImportPath(iconographySource, "/semantics") &&
    !hasImportPath(iconographySource, "/actions") &&
    !hasImportPath(iconographySource, "/hints") &&
    !hasImportPath(iconographySource, "/status") &&
    !hasImportPath(iconographySource, "/disclosure") &&
    !hasImportPath(iconographySource, "PanelState") &&
    !hasImportPath(iconographySource, "/modes") &&
    !hasImportPath(iconographySource, "/focus"),
  "iconography/ does not import toolbar components or frozen packages"
);

assertCase(
  "ux220.action_tokens.owns.interaction",
  /hoverOpacity:/.test(actionTokensSource) &&
    /appearances:/.test(actionTokensSource) &&
    /duration-100/.test(actionTokensSource) &&
    /motion-reduce:/.test(actionTokensSource) &&
    /active:opacity/.test(actionTokensSource),
  "ACTION_TOKENS owns hover / transition / pressed affordances"
);

assertCase(
  "ux220.action_tokens.bridge",
  hasImportPath(actionTokensSource, "ICON_TOKENS") &&
    !hasImportPath(actionTokensSource, "WorkspaceIcon") &&
    !hasImportPath(actionTokensSource, "workspaceIconRegistry"),
  "ACTION_TOKENS may compose ICON_TOKENS only (no WorkspaceIcon)"
);

assertCase(
  "ux220.toolbar.no.iconography.components",
  !hasImportPath(buttonSource, "WorkspaceIcon") &&
    !hasImportPath(buttonSource, "iconography") &&
    /icon\?:/.test(buttonSource) &&
    /appearance\?:/.test(buttonSource) &&
    /children\?:/.test(buttonSource) &&
    /<span\b/.test(buttonSource),
  "ActionButton public API unchanged; no iconography component import"
);

/* -------------------------------------------------------------------------- */
/* E. Wiring                                                                  */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux220.wiring.explorer",
  hasImportPath(explorerSource, "iconography") &&
    hasJsxComponent(explorerSource, "WorkspaceIcon") &&
    hasJsxComponent(explorerSource, "ActionButton") &&
    /leading=\{/.test(explorerSource) &&
    /icon=\{/.test(explorerSource) &&
    !/icon="○"/.test(explorerSource),
  "Explorer: SemanticHeader.leading + ActionButton + EmptyState icons"
);

assertCase(
  "ux220.wiring.inspector",
  hasImportPath(inspectorSource, "iconography") &&
    hasJsxComponent(inspectorSource, "WorkspaceIcon") &&
    hasJsxComponent(inspectorSource, "ActionButton") &&
    /leading=\{/.test(inspectorSource) &&
    !/icon="○"/.test(inspectorSource),
  "Inspector: leading + toolbar + EmptyState icons"
);

assertCase(
  "ux220.wiring.console",
  hasImportPath(consoleSource, "iconography") &&
    hasJsxComponent(consoleSource, "WorkspaceIcon") &&
    hasJsxComponent(consoleSource, "ActionButton") &&
    /leading=\{/.test(consoleSource) &&
    !/icon="○"/.test(consoleSource),
  "Console: leading + toolbar + EmptyState icons"
);

assertCase(
  "ux220.wiring.canvas",
  hasImportPath(bodyLayoutSource, "iconography") &&
    hasJsxComponent(bodyLayoutSource, "WorkspaceIcon") &&
    hasJsxComponent(bodyLayoutSource, "ActionButton") &&
    /leading=\{/.test(bodyLayoutSource),
  "Canvas: SemanticHeader.leading + ActionButton icons"
);

assertCase(
  "ux220.no.public.barrel",
  !/iconography/.test(workspaceBarrel) &&
    !/WorkspaceIcon/.test(workspaceBarrel) &&
    !/ICON_TOKENS/.test(workspaceBarrel),
  "@/components/workspace barrel does not export iconography"
);

/* -------------------------------------------------------------------------- */
/* F. Docs + roadmap                                                          */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux220.doc.exists",
  existsSync(docPath) &&
    /UX-2\.20/.test(doc) &&
    /ICON_TOKENS/.test(doc) &&
    /WorkspaceIcon/.test(doc) &&
    /No Visual Regression/i.test(doc) &&
    /ACTION_TOKENS/.test(doc) &&
    /Next:\s*UX-2\.21/i.test(doc),
  "docs/UX-2.20-iconography-microinteractions.md present with contracts"
);

assertCase(
  "ux220.ux219.next",
  /Next:\s*UX-2\.20/i.test(ux219Doc) || /→ UX-2\.20/.test(ux219Doc),
  "UX-2.19 NEXT points to UX-2.20"
);

assertCase(
  "ux220.roadmap.status",
  /UX-2\.20\s*=\s*COMPLETE/.test(roadmap) &&
    /Iconography/.test(roadmap) &&
    /UX-2\.21/.test(roadmap) &&
    /NEXT\s*=\s*UX-2\.21/.test(roadmap),
  "roadmap marks UX-2.20 COMPLETE; NEXT → UX-2.21"
);

assertCase(
  "ux220.package.script",
  /"validate:ux-2\.20"\s*:/.test(pkg),
  "validate:ux-2.20 in package.json"
);

/* -------------------------------------------------------------------------- */
/* G. Delegates — UX-2.19 + tsc + eslint                                      */
/* -------------------------------------------------------------------------- */

if (process.env.UX_SKIP_DELEGATES !== "1") {
  const ux219 = spawnSync("npx", ["tsx", "scripts/validate-ux-2.19.ts"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
    env: { ...process.env, UX_SKIP_DELEGATES: "1" },
  });
  assertCase(
    "ux220.delegate.ux-2.19",
    ux219.status === 0,
    ux219.status === 0
      ? "PASS (leaf)"
      : `${ux219.stdout ?? ""}\n${ux219.stderr ?? ""}`.trim().slice(-1200)
  );

  const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
  });
  assertCase(
    "ux220.typescript",
    tsc.status === 0,
    tsc.status === 0
      ? "PASS"
      : `${tsc.stdout ?? ""}\n${tsc.stderr ?? ""}`.trim().slice(-1200)
  );

  const eslint = spawnSync(
    "npx",
    [
      "eslint",
      "src/components/workspace/iconography",
      "src/components/workspace/toolbar/ACTION_TOKENS.ts",
      "src/components/workspace/panels/WorkspaceBodyLayout.tsx",
      "src/components/workspace/panels/content/ExplorerContent.tsx",
      "src/components/workspace/panels/content/InspectorContent.tsx",
      "src/components/workspace/panels/content/ConsoleContent.tsx",
      "scripts/validate-ux-2.20.ts",
    ],
    {
      cwd: repoRoot,
      encoding: "utf8",
      shell: true,
    }
  );
  assertCase(
    "ux220.eslint",
    eslint.status === 0,
    eslint.status === 0
      ? "PASS"
      : `${eslint.stdout ?? ""}\n${eslint.stderr ?? ""}`.trim().slice(-1200)
  );
} else {
  assertCase(
    "ux220.delegate.skipped",
    true,
    "UX_SKIP_DELEGATES=1 — leaf suite skipped"
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "ux-2.20-iconography-microinteractions",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — ux-2.20-iconography-microinteractions"
    : `\nFAIL — ux-2.20-iconography-microinteractions (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
