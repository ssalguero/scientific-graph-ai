/**
 * D45 — UI architecture static gate.
 * Verifies src/lib/ui + components/ui scaffolding and wiring contracts.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const results: { id: string; pass: boolean; detail: string }[] = [];

const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const libUiDir = join(repoRoot, "src/lib/ui");
const requiredLibFiles = ["tokens.ts", "theme.ts", "icons.ts", "index.ts"];

assertCase("lib.ui.dir.exists", existsSync(libUiDir), libUiDir);

for (const file of requiredLibFiles) {
  assertCase(
    `lib.ui.file.${file}`,
    existsSync(join(libUiDir, file)),
    join(libUiDir, file)
  );
}

const themeSource = existsSync(join(libUiDir, "theme.ts"))
  ? readFileSync(join(libUiDir, "theme.ts"), "utf8")
  : "";
const iconsSource = existsSync(join(libUiDir, "icons.ts"))
  ? readFileSync(join(libUiDir, "icons.ts"), "utf8")
  : "";
const tokensSource = existsSync(join(libUiDir, "tokens.ts"))
  ? readFileSync(join(libUiDir, "tokens.ts"), "utf8")
  : "";
const indexSource = existsSync(join(libUiDir, "index.ts"))
  ? readFileSync(join(libUiDir, "index.ts"), "utf8")
  : "";

assertCase(
  "theme.helpers.present",
  /export function getButtonVariant/.test(themeSource) &&
    /export function getPanelStyle/.test(themeSource) &&
    /export function getBadgeStyle/.test(themeSource) &&
    /export function getStatusColor/.test(themeSource),
  "getButtonVariant/getPanelStyle/getBadgeStyle/getStatusColor"
);

assertCase(
  "theme.exports.core.classes",
  /export const btnPrimary/.test(themeSource) &&
    /export const contentPanel/.test(themeSource) &&
    /export const sidebarNavItem/.test(themeSource) &&
    /export const sidebarShell/.test(themeSource),
  "btnPrimary/contentPanel/sidebarNavItem/sidebarShell"
);

assertCase(
  "tokens.groups.present",
  /export const spacing/.test(tokensSource) &&
    /export const radius/.test(tokensSource) &&
    /export const shadows/.test(tokensSource) &&
    /export const transitions/.test(tokensSource) &&
    /export const animation/.test(tokensSource) &&
    /export const zIndex/.test(tokensSource) &&
    /export const elevation/.test(tokensSource),
  "spacing/radius/shadows/transitions/animation/zIndex/elevation"
);

assertCase(
  "icons.registry.present",
  /export const UI_ICONS/.test(iconsSource) &&
    /export function getIcon/.test(iconsSource),
  "UI_ICONS + getIcon"
);

assertCase(
  "lib.ui.barrel.reexports",
  indexSource.includes("./tokens") &&
    indexSource.includes("./theme") &&
    indexSource.includes("./icons"),
  "index.ts re-exports tokens/theme/icons"
);

const buttonDir = join(repoRoot, "src/components/ui/buttons");
const layoutDir = join(repoRoot, "src/components/ui/layout");
const sidebarDir = join(repoRoot, "src/components/ui/sidebar");

const requiredButtons = [
  "PrimaryButton.tsx",
  "SecondaryButton.tsx",
  "GhostButton.tsx",
  "IconButton.tsx",
  "DangerButton.tsx",
  "index.ts",
];
const requiredLayout = [
  "Panel.tsx",
  "PanelHeader.tsx",
  "PanelBody.tsx",
  "PanelFooter.tsx",
  "SectionTitle.tsx",
  "Divider.tsx",
  "index.ts",
];
const requiredSidebar = [
  "Sidebar.tsx",
  "SidebarSection.tsx",
  "SidebarGroup.tsx",
  "SidebarItem.tsx",
  "SidebarFooter.tsx",
  "index.ts",
];

assertCase("components.ui.buttons.dir", existsSync(buttonDir), buttonDir);
assertCase("components.ui.layout.dir", existsSync(layoutDir), layoutDir);
assertCase("components.ui.sidebar.dir", existsSync(sidebarDir), sidebarDir);

for (const file of requiredButtons) {
  assertCase(
    `buttons.file.${file}`,
    existsSync(join(buttonDir, file)),
    join(buttonDir, file)
  );
}
for (const file of requiredLayout) {
  assertCase(
    `layout.file.${file}`,
    existsSync(join(layoutDir, file)),
    join(layoutDir, file)
  );
}
for (const file of requiredSidebar) {
  assertCase(
    `sidebar.file.${file}`,
    existsSync(join(sidebarDir, file)),
    join(sidebarDir, file)
  );
}

const pageSource = readFileSync(join(repoRoot, "src/app/page.tsx"), "utf8");
assertCase(
  "page.imports.lib.ui.theme",
  /from\s+["']@\/lib\/ui\/theme["']/.test(pageSource),
  "page.tsx imports @/lib/ui/theme"
);
assertCase(
  "page.imports.sidebar",
  /from\s+["']@\/components\/ui\/sidebar["']/.test(pageSource) &&
    /<Sidebar[\s>]/.test(pageSource),
  "page.tsx wires <Sidebar>"
);
assertCase(
  "page.no.inline.aside",
  !/<aside[\s>]/.test(pageSource),
  "no inline <aside> in page.tsx"
);

const projectStyles = readFileSync(
  join(repoRoot, "src/app/projectFileUiStyles.ts"),
  "utf8"
);
assertCase(
  "projectFileUiStyles.reexports.theme",
  /from\s+["']@\/lib\/ui\/theme["']/.test(projectStyles) &&
    /as fieldLabel/.test(projectStyles) &&
    /as btnPrimary/.test(projectStyles),
  "projectFileUiStyles re-exports from theme"
);

const packageJson = readFileSync(join(repoRoot, "package.json"), "utf8");
assertCase(
  "no.new.icon.libraries",
  !/lucide-react/.test(packageJson) &&
    !/@heroicons\//.test(packageJson) &&
    !/react-icons/.test(packageJson) &&
    !/@radix-ui\/react-icons/.test(packageJson),
  "package.json has no icon UI libraries"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "ui-architecture",
  pass: failed.length === 0,
  caseCount: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
