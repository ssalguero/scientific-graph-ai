/**
 * D46.5 — Sidebar v2 static certification gate.
 *
 * Verifies architecture, theme chrome tokens, rename 1:1, and no hard-coded
 * palette colors in Sidebar* sources. Governor only — no product changes.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const sidebarDir = join(repoRoot, "src/components/ui/sidebar");
const pagePath = join(repoRoot, "src/app/page.tsx");
const themePath = join(repoRoot, "src/lib/ui/theme.ts");
const indexPath = join(sidebarDir, "index.ts");

const requiredFiles = [
  "Sidebar.tsx",
  "SidebarSection.tsx",
  "SidebarGroup.tsx",
  "SidebarItem.tsx",
  "SidebarFooter.tsx",
  "types.ts",
  "index.ts",
];

const requiredThemeExports = [
  "sidebarWidthDesktop",
  "sidebarWidthTablet",
  "sidebarWidthCollapsed",
  "sidebarShellExpanded",
  "sidebarShellCollapsed",
  "sidebarOverlayOpen",
  "sidebarNavItem",
  "sidebarNavItemHover",
  "sidebarNavItemActive",
  "sidebarNavItemPressed",
  "sidebarNavItemDisabled",
];

const renameLabels = [
  "Visualización",
  "Proyecto",
  "Científico",
  "Análisis",
  "Recursos",
  "Ajustes",
];

const results: { id: string; pass: boolean; detail: string }[] = [];

const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

assertCase("sidebar.dir.exists", existsSync(sidebarDir), sidebarDir);

const present = existsSync(sidebarDir)
  ? new Set(readdirSync(sidebarDir))
  : new Set<string>();

for (const file of requiredFiles) {
  assertCase(`sidebar.file.${file}`, present.has(file), join(sidebarDir, file));
}

const indexSource = existsSync(indexPath)
  ? readFileSync(indexPath, "utf8")
  : "";

assertCase(
  "barrel.exports.intact",
  /export\s+\{\s*Sidebar\s*\}/.test(indexSource) &&
    /export\s+\{\s*SidebarSection\s*\}/.test(indexSource) &&
    /export\s+\{\s*SidebarGroup/.test(indexSource) &&
    /export\s+\{\s*SidebarItem\s*\}/.test(indexSource) &&
    /export\s+\{\s*SidebarFooter\s*\}/.test(indexSource) &&
    /export\s+type\s+\{[\s\S]*SidebarProps/.test(indexSource),
  "index.ts exports Sidebar* components + SidebarProps"
);

const pageSource = existsSync(pagePath) ? readFileSync(pagePath, "utf8") : "";
assertCase(
  "page.no.inline.aside",
  !/<aside[\s>]/.test(pageSource),
  "no inline <aside> remaining in page.tsx"
);
assertCase(
  "page.imports.Sidebar",
  /from\s+["']@\/components\/ui\/sidebar["']/.test(pageSource) &&
    /<Sidebar[\s>]/.test(pageSource),
  "page.tsx imports and renders <Sidebar>"
);

const themeSource = existsSync(themePath)
  ? readFileSync(themePath, "utf8")
  : "";

for (const name of requiredThemeExports) {
  assertCase(
    `theme.export.${name}`,
    new RegExp(`export\\s+const\\s+${name}\\b`).test(themeSource),
    `theme.ts exports ${name}`
  );
}

const sidebarTsxPath = join(sidebarDir, "Sidebar.tsx");
const sidebarSource = existsSync(sidebarTsxPath)
  ? readFileSync(sidebarTsxPath, "utf8")
  : "";

for (const label of renameLabels) {
  assertCase(
    `rename.present.${label}`,
    sidebarSource.includes(label),
    `Sidebar.tsx contains "${label}"`
  );
}

assertCase(
  "rename.absent.CurvasMatematicas",
  !sidebarSource.includes("Curvas matemáticas"),
  "legacy label Curvas matemáticas absent"
);
assertCase(
  "rename.absent.ProyectoCientifico",
  !sidebarSource.includes("Proyecto científico"),
  "legacy label Proyecto científico absent"
);
assertCase(
  "rename.absent.Herramientas",
  !sidebarSource.includes("Herramientas"),
  "legacy label Herramientas absent"
);
assertCase(
  "rename.absent.Sistema",
  !sidebarSource.includes("Sistema"),
  "legacy label Sistema absent"
);
assertCase(
  "rename.absent.ModulosTitle",
  !sidebarSource.includes('title="Módulos"') &&
    !sidebarSource.includes(">Módulos</"),
  "legacy section title Módulos absent"
);

const sidebarSources = requiredFiles
  .filter((file) => file.endsWith(".tsx") || file.endsWith(".ts"))
  .map((file) => {
    const full = join(sidebarDir, file);
    return existsSync(full) ? readFileSync(full, "utf8") : "";
  })
  .join("\n");

assertCase(
  "sidebar.no.hex.colors",
  !/#[0-9a-fA-F]{3,8}\b/.test(sidebarSources),
  "no hex colors in Sidebar*"
);
assertCase(
  "sidebar.no.bg-slate",
  !/\bbg-slate-/.test(sidebarSources),
  "no bg-slate-* in Sidebar*"
);
assertCase(
  "sidebar.no.text-zinc",
  !/\btext-zinc-/.test(sidebarSources),
  "no text-zinc-* in Sidebar*"
);

const sidebarItemSource = existsSync(join(sidebarDir, "SidebarItem.tsx"))
  ? readFileSync(join(sidebarDir, "SidebarItem.tsx"), "utf8")
  : "";

assertCase(
  "sidebarItem.uses.getIcon",
  /getIcon\s*\(/.test(sidebarItemSource) &&
    /from\s+["']@\/lib\/ui\/icons["']/.test(sidebarItemSource),
  "SidebarItem uses getIcon from @/lib/ui/icons"
);

assertCase(
  "collapse.toggle.aria-label",
  /aria-label=\{\s*[\s\S]*Expandir barra lateral[\s\S]*Colapsar barra lateral/.test(
    sidebarSource
  ) ||
    (/Colapsar barra lateral/.test(sidebarSource) &&
      /Expandir barra lateral/.test(sidebarSource)),
  "collapse toggle has aria-label strings"
);

assertCase(
  "overlay.helpers.used",
  /sidebarOverlayOpen/.test(sidebarSource) &&
    /sidebarOverlayBackdrop/.test(sidebarSource),
  "Sidebar uses overlay open + backdrop helpers"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "sidebar-v2",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
