import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const sidebarDir = join(repoRoot, "src/components/ui/sidebar");
const pagePath = join(repoRoot, "src/app/page.tsx");

const requiredFiles = [
  "Sidebar.tsx",
  "SidebarSection.tsx",
  "SidebarGroup.tsx",
  "SidebarItem.tsx",
  "SidebarFooter.tsx",
  "types.ts",
  "index.ts",
];

const results: { id: string; pass: boolean; detail: string }[] = [];

const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

assertCase(
  "sidebar.dir.exists",
  existsSync(sidebarDir),
  sidebarDir
);

const present = existsSync(sidebarDir)
  ? new Set(readdirSync(sidebarDir))
  : new Set<string>();

for (const file of requiredFiles) {
  assertCase(
    `sidebar.file.${file}`,
    present.has(file),
    join(sidebarDir, file)
  );
}

const pageSource = readFileSync(pagePath, "utf8");
assertCase(
  "page.imports.Sidebar",
  /from\s+["']@\/components\/ui\/sidebar["']/.test(pageSource) &&
    /<Sidebar[\s>]/.test(pageSource),
  "page.tsx imports and renders <Sidebar>"
);

assertCase(
  "page.no.inline.aside",
  !/<aside[\s>]/.test(pageSource),
  "no inline <aside> remaining in page.tsx"
);

const sidebarSources = requiredFiles
  .filter((file) => file.endsWith(".tsx") || file.endsWith(".ts"))
  .map((file) => {
    const full = join(sidebarDir, file);
    return existsSync(full) ? readFileSync(full, "utf8") : "";
  })
  .join("\n");

const iconLibPattern =
  /from\s+["'](lucide-react|@heroicons\/|react-icons\/|@radix-ui\/react-icons)["']/;

assertCase(
  "sidebar.no.icon.libraries",
  !iconLibPattern.test(sidebarSources),
  "no lucide/heroicons/react-icons/radix icon imports"
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

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "ui-sidebar-architecture",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
