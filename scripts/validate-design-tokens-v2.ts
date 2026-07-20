/**
 * D48.4 — Design Tokens v2 static governance gate.
 *
 * Validates UI_TOKENS SSOT, theme facade, Workspace contract, Sidebar wiring,
 * and API Freeze. Governor only — does not modify product code.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const results: { id: string; pass: boolean; detail: string }[] = [];

const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const read = (rel: string): string => {
  const full = join(repoRoot, rel);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
};

const collectTsxUnder = (dirRel: string): { name: string; source: string }[] => {
  const abs = join(repoRoot, dirRel);
  if (!existsSync(abs)) return [];
  return readdirSync(abs)
    .filter((name) => name.endsWith(".ts") || name.endsWith(".tsx"))
    .map((name) => ({
      name,
      source: readFileSync(join(abs, name), "utf8"),
    }));
};

const FROZEN_WORKSPACE = {
  shell: "flex min-h-screen flex-col lg:flex-row",
  mainColumn: "flex-1 min-w-0 overflow-auto",
  inner: "w-full px-3 sm:px-4 lg:px-5 xl:px-6 py-2.5 sm:py-3 space-y-3",
} as const;

const UI_TOKEN_CATEGORIES = [
  "layout",
  "spacing",
  "radius",
  "border",
  "typography",
  "transition",
  "shadow",
  "workspace",
  "panel",
  "button",
  "sidebar",
] as const;

const tokensPath = "src/lib/ui/tokens.ts";
const themePath = "src/lib/ui/theme.ts";
const iconsPath = "src/lib/ui/icons.ts";
const indexPath = "src/lib/ui/index.ts";
const workspaceTokensPath = "src/components/workspace/WorkspaceTokens.ts";
const workspaceLayoutPath = "src/components/workspace/WorkspaceLayout.tsx";
const workspaceContentPath = "src/components/workspace/WorkspaceContent.tsx";
const workspacePanelsPath = "src/components/workspace/WorkspacePanels.tsx";
const sidebarDir = "src/components/ui/sidebar";
const layoutDir = "src/components/ui/layout";
const buttonsDir = "src/components/ui/buttons";

const tokensSource = read(tokensPath);
const themeSource = read(themePath);
const iconsSource = read(iconsPath);
const indexSource = read(indexPath);
const workspaceTokensSource = read(workspaceTokensPath);
const workspaceLayoutSource = read(workspaceLayoutPath);
const workspaceContentSource = read(workspaceContentPath);
const workspacePanelsSource = read(workspacePanelsPath);
const sidebarFiles = collectTsxUnder(sidebarDir);
const layoutFiles = collectTsxUnder(layoutDir);
const buttonFiles = collectTsxUnder(buttonsDir);
const sidebarAll = sidebarFiles.map((f) => f.source).join("\n");
const uiConsumerAll = [
  ...sidebarFiles,
  ...layoutFiles,
  ...buttonFiles,
]
  .map((f) => f.source)
  .join("\n");

/* -------------------------------------------------------------------------- */
/* A. UI_TOKENS exists                                                        */
/* -------------------------------------------------------------------------- */

assertCase(
  "tokens.file.exists",
  existsSync(join(repoRoot, tokensPath)),
  tokensPath
);

assertCase(
  "tokens.exports.UI_TOKENS",
  /export const UI_TOKENS\b/.test(tokensSource),
  "export const UI_TOKENS"
);

for (const key of UI_TOKEN_CATEGORIES) {
  assertCase(
    `tokens.UI_TOKENS.category.${key}`,
    new RegExp(`\\b${key}\\b`).test(tokensSource) &&
      /export const UI_TOKENS\s*=\s*\{[\s\S]*\}/.test(tokensSource),
    `UI_TOKENS includes ${key}`
  );
}

assertCase(
  "tokens.workspace.frozen.values",
  tokensSource.includes(`shell: "${FROZEN_WORKSPACE.shell}"`) &&
    tokensSource.includes(`mainColumn: "${FROZEN_WORKSPACE.mainColumn}"`) &&
    tokensSource.includes(`inner: "${FROZEN_WORKSPACE.inner}"`),
  "UI_TOKENS.workspace freeze literals present in tokens.ts"
);

/* -------------------------------------------------------------------------- */
/* B. WORKSPACE_TOKENS exists                                                 */
/* -------------------------------------------------------------------------- */

assertCase(
  "workspaceTokens.file.exists",
  existsSync(join(repoRoot, workspaceTokensPath)),
  workspaceTokensPath
);

assertCase(
  "workspaceTokens.exports.WORKSPACE_TOKENS",
  /export const WORKSPACE_TOKENS\b/.test(workspaceTokensSource),
  "export const WORKSPACE_TOKENS"
);

assertCase(
  "workspaceTokens.keys.shape",
  /shell\s*:/.test(workspaceTokensSource) &&
    /mainColumn\s*:/.test(workspaceTokensSource) &&
    /inner\s*:/.test(workspaceTokensSource),
  "shell / mainColumn / inner"
);

assertCase(
  "workspaceTokens.sources.UI_TOKENS.workspace",
  /UI_TOKENS\.workspace\.(shell|mainColumn|inner)/.test(workspaceTokensSource) &&
    /from\s+["']@\/lib\/ui\/tokens["']/.test(workspaceTokensSource),
  "WORKSPACE_TOKENS delegates to UI_TOKENS.workspace"
);

/* -------------------------------------------------------------------------- */
/* C + tokens.themeFacade                                                     */
/* -------------------------------------------------------------------------- */

assertCase(
  "theme.file.exists",
  existsSync(join(repoRoot, themePath)),
  themePath
);

const themeImportsUiTokens =
  /import\s*\{[^}]*\bUI_TOKENS\b[^}]*\}\s*from\s*["']\.\/tokens["']/.test(
    themeSource
  );

assertCase(
  "tokens.themeFacade",
  themeImportsUiTokens &&
    /UI_TOKENS\.(layout|panel|typography|button|sidebar)\./.test(themeSource),
  "theme.ts imports and delegates to UI_TOKENS"
);

const themeRedefinesPrimitives =
  /export const spacing\b/.test(themeSource) ||
  /export const radius\b/.test(themeSource) ||
  /export const shadows\b/.test(themeSource) ||
  /export const transitions\b/.test(themeSource) ||
  /export const elevation\b/.test(themeSource) ||
  /export const border\b/.test(themeSource) ||
  /export const typography\b/.test(themeSource) ||
  /export const workspace\b/.test(themeSource);

assertCase(
  "theme.noPrimitiveRedefinition",
  !themeRedefinesPrimitives,
  "theme does not re-export/redefine spacing/radius/shadows/transitions/elevation/border/typography/workspace"
);

/** Long hard-coded class strings (not template refs) indicate non-facade. */
const themeHardcodedClassAssign =
  /export const \w+\s*=\s*"(?:rounded-|inline-flex |flex w-full |border border-\[var)/.test(
    themeSource
  );

assertCase(
  "theme.noHardcodedClassStrings",
  !themeHardcodedClassAssign,
  "theme class exports use UI_TOKENS refs (no reintroduced string literals)"
);

/* -------------------------------------------------------------------------- */
/* D + tokens.sidebarCompatible                                               */
/* -------------------------------------------------------------------------- */

const sidebarMain = sidebarFiles.find((f) => f.name === "Sidebar.tsx")?.source ?? "";
const sidebarItem =
  sidebarFiles.find((f) => f.name === "SidebarItem.tsx")?.source ?? "";
const sidebarGroup =
  sidebarFiles.find((f) => f.name === "SidebarGroup.tsx")?.source ?? "";
const sidebarSection =
  sidebarFiles.find((f) => f.name === "SidebarSection.tsx")?.source ?? "";

assertCase(
  "tokens.sidebarCompatible",
  /from\s+["']@\/lib\/ui\/tokens["']/.test(sidebarMain) &&
    /\bUI_TOKENS\b/.test(sidebarMain) &&
    /\bUI_TOKENS\b/.test(sidebarItem) &&
    /\bUI_TOKENS\b/.test(sidebarGroup) &&
    /\bUI_TOKENS\b/.test(sidebarSection),
  "Sidebar* chrome modules import/use UI_TOKENS"
);

const knownTokenLiterals = [
  "transition-all duration-200",
  "transition-colors duration-200",
  "grid-rows-[1fr] opacity-100",
  "grid-rows-[0fr] opacity-0",
  "active:scale-[0.98]",
  "shadow-sm hover:shadow-md",
];

const sidebarDuplicatedTokenLiterals = knownTokenLiterals.filter((lit) =>
  sidebarAll.includes(`"${lit}"`) || sidebarAll.includes(`\`${lit}\``)
);

assertCase(
  "sidebar.noDuplicatedTokenLiterals",
  sidebarDuplicatedTokenLiterals.length === 0,
  sidebarDuplicatedTokenLiterals.length === 0
    ? "no known UI_TOKENS string literals inlined in Sidebar*"
    : `found: ${sidebarDuplicatedTokenLiterals.join(", ")}`
);

assertCase(
  "sidebar.noThemeChromeImports",
  !/from\s+["']@\/lib\/ui\/theme["']/.test(sidebarMain) &&
    !/from\s+["']@\/lib\/ui\/theme["']/.test(sidebarItem) &&
    !/from\s+["']@\/lib\/ui\/theme["']/.test(sidebarGroup) &&
    !/from\s+["']@\/lib\/ui\/theme["']/.test(sidebarSection),
  "Sidebar chrome does not import theme named class exports"
);

/* -------------------------------------------------------------------------- */
/* E + tokens.workspaceContract                                               */
/* -------------------------------------------------------------------------- */

const workspaceRuntimeSources = [
  workspaceLayoutSource,
  workspaceContentSource,
  workspacePanelsSource,
].join("\n");

assertCase(
  "tokens.workspaceContract",
  /WORKSPACE_TOKENS\.shell/.test(workspaceLayoutSource) &&
    /WORKSPACE_TOKENS\.mainColumn/.test(workspaceContentSource) &&
    /WORKSPACE_TOKENS\.inner/.test(workspaceContentSource) &&
    /export const WORKSPACE_TOKENS\b/.test(workspaceTokensSource),
  "Layout/Content use WORKSPACE_TOKENS; contract exported"
);

assertCase(
  "workspace.noDirectUiTokensCategories",
  !/UI_TOKENS\.(layout|spacing|radius|border|typography|transition|shadow|panel|button|sidebar|workspace)\b/.test(
    workspaceRuntimeSources
  ) &&
    !/from\s+["']@\/lib\/ui\/tokens["']/.test(workspaceLayoutSource) &&
    !/from\s+["']@\/lib\/ui\/tokens["']/.test(workspaceContentSource) &&
    !/from\s+["']@\/lib\/ui\/tokens["']/.test(workspacePanelsSource),
  "WorkspaceLayout/Content/Panels do not import UI_TOKENS categories"
);

/* -------------------------------------------------------------------------- */
/* F + tokens.singleSourceOfTruth / noDuplicatedClasses                       */
/* -------------------------------------------------------------------------- */

assertCase(
  "tokens.singleSourceOfTruth",
  /export const UI_TOKENS\b/.test(tokensSource) &&
    /export const spacing\b/.test(tokensSource) &&
    /export const radius\b/.test(tokensSource) &&
    /export const border\b/.test(tokensSource) &&
    /export const typography\b/.test(tokensSource) &&
    /export const transitions\b/.test(tokensSource) &&
    /export const shadows\b/.test(tokensSource) &&
    /export const layout\b/.test(tokensSource) &&
    /export const workspace\b/.test(tokensSource) &&
    themeImportsUiTokens &&
    !themeRedefinesPrimitives,
  "primitives + UI_TOKENS live in tokens.ts; theme is facade only"
);

const elevationDerivesFromShadows =
  /low:\s*shadows\.sm/.test(tokensSource) &&
  /medium:\s*shadows\.md/.test(tokensSource) &&
  /interactive:\s*`\$\{shadows\.sm\} \$\{shadows\.hoverMd\}`/.test(tokensSource);

assertCase(
  "tokens.noDuplicatedClasses",
  elevationDerivesFromShadows &&
    /resultsSubsection:\s*panelDatasetCard/.test(tokensSource) &&
    /dataDataset:\s*panelDatasetCard/.test(tokensSource),
  "elevation aliases shadows; panel dataset card shared once"
);

/* -------------------------------------------------------------------------- */
/* G. tokens.noInlineValues (UI consumers)                                    */
/* -------------------------------------------------------------------------- */

const consumerHasHex = /#[0-9a-fA-F]{3,8}\b/.test(uiConsumerAll);
const consumerHasSlate = /\bbg-slate-/.test(uiConsumerAll);
const consumerHasZinc = /\btext-zinc-/.test(uiConsumerAll);
const consumerImportsSpacingDirect =
  /import\s*\{[^}]*\bspacing\b[^}]*\}\s*from\s*["']@\/lib\/ui\/tokens["']/.test(
    uiConsumerAll
  );

assertCase(
  "tokens.noInlineValues",
  !consumerHasHex &&
    !consumerHasSlate &&
    !consumerHasZinc &&
    !consumerImportsSpacingDirect,
  !consumerHasHex && !consumerHasSlate && !consumerHasZinc && !consumerImportsSpacingDirect
    ? "UI consumers avoid hex/slate/zinc and direct spacing imports"
    : `hex=${consumerHasHex} slate=${consumerHasSlate} zinc=${consumerHasZinc} spacingImport=${consumerImportsSpacingDirect}`
);

/* -------------------------------------------------------------------------- */
/* H. API Freeze                                                              */
/* -------------------------------------------------------------------------- */

assertCase(
  "apiFreeze.UI_TOKENS",
  /export const UI_TOKENS\b/.test(tokensSource) &&
    /UI_TOKENS/.test(indexSource),
  "UI_TOKENS exported from tokens + barrel"
);

assertCase(
  "apiFreeze.WORKSPACE_TOKENS",
  /export const WORKSPACE_TOKENS\b/.test(workspaceTokensSource) &&
    /WORKSPACE_TOKENS/.test(read("src/components/workspace/index.ts")),
  "WORKSPACE_TOKENS exported from WorkspaceTokens + barrel"
);

assertCase(
  "apiFreeze.themeHelpers",
  /export const getAppShell\b/.test(themeSource) &&
    /export function getButtonVariant\b/.test(themeSource) &&
    /export function getPanelStyle\b/.test(themeSource) &&
    /export function getBadgeStyle\b/.test(themeSource) &&
    /export function getStatusColor\b/.test(themeSource),
  "getAppShell/getButtonVariant/getPanelStyle/getBadgeStyle/getStatusColor"
);

assertCase(
  "apiFreeze.iconRegistry",
  /export const UI_ICONS\b/.test(iconsSource) &&
    /export function getIcon\b/.test(iconsSource) &&
    /UI_ICONS/.test(indexSource),
  "UI_ICONS + getIcon"
);

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "design-tokens-v2",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  governance: {
    "tokens.singleSourceOfTruth":
      results.find((r) => r.id === "tokens.singleSourceOfTruth")?.pass ?? false,
    "tokens.noInlineValues":
      results.find((r) => r.id === "tokens.noInlineValues")?.pass ?? false,
    "tokens.noDuplicatedClasses":
      results.find((r) => r.id === "tokens.noDuplicatedClasses")?.pass ?? false,
    "tokens.themeFacade":
      results.find((r) => r.id === "tokens.themeFacade")?.pass ?? false,
    "tokens.workspaceContract":
      results.find((r) => r.id === "tokens.workspaceContract")?.pass ?? false,
    "tokens.sidebarCompatible":
      results.find((r) => r.id === "tokens.sidebarCompatible")?.pass ?? false,
  },
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — design-tokens-v2"
    : `\nFAIL — design-tokens-v2 (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
