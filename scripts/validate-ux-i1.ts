/**
 * UX-I1 — Application Shell Modernization gates.
 *
 * Shell scopes must consume Design System `--color-*` directly.
 * No `var(--app-*)` in primary chrome. Design System sources untouched.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

type CaseResult = { id: string; pass: boolean; detail: string };

const results: CaseResult[] = [];
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function assertCase(id: string, pass: boolean, detail: string): void {
  results.push({ id, pass, detail });
}

function read(rel: string): string {
  return readFileSync(join(repoRoot, rel), "utf8");
}

function walkFiles(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (name === "node_modules" || name === ".next" || name === "dist") continue;
      walkFiles(full, acc);
    } else if (/\.(ts|tsx)$/.test(name)) {
      acc.push(full);
    }
  }
  return acc;
}

function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

const BUILD =
  "docs/UX/implementation/UX-I1-Application-Shell-Modernization-BUILD.md";

const SHELL_SCOPES = [
  "src/components/app-shell",
  "src/components/status-bar",
  "src/components/ui/sidebar",
  "src/components/toolbar",
  "src/components/docking",
  "src/components/windows",
  "src/components/workspace/navigation",
  "src/components/workspace/toolbar",
  "src/components/home",
] as const;

const DS_GUARD_PATHS = [
  "src/ui/foundation/tokens/semantic/color.ts",
  "src/ui/theme/maps/light.ts",
  "src/ui/providers/theme-provider.tsx",
] as const;

function main(): void {
  assertCase(
    "docs.buildRecord",
    existsSync(join(repoRoot, BUILD)),
    "UX-I1 Build record exists"
  );
  const build = existsSync(join(repoRoot, BUILD)) ? read(BUILD) : "";
  assertCase(
    "docs.buildImplemented",
    build.includes("IMPLEMENTED") && build.includes("COMPLETE"),
    "Build record declares IMPLEMENTED / COMPLETE"
  );

  for (const domain of ["src/engine", "src/data", "src/ai"] as const) {
    assertCase(
      `domains.${domain}`,
      existsSync(join(repoRoot, domain)),
      `${domain} present (RELEASE CERTIFIED)`
    );
  }

  for (const rel of DS_GUARD_PATHS) {
    assertCase(
      `ssot.exists.${rel}`,
      existsSync(join(repoRoot, rel)),
      `Design System artifact present: ${rel}`
    );
  }

  const appOffenders: string[] = [];
  for (const scope of SHELL_SCOPES) {
    for (const full of walkFiles(join(repoRoot, scope))) {
      const src = stripComments(readFileSync(full, "utf8"));
      if (/var\(--app-/.test(src)) {
        appOffenders.push(relative(repoRoot, full).replace(/\\/g, "/"));
      }
    }
  }
  assertCase(
    "shell.noAppCssVars",
    appOffenders.length === 0,
    appOffenders.length === 0
      ? "shell scopes use no var(--app-*)"
      : `var(--app-*) remains in: ${appOffenders.slice(0, 12).join(", ")}`
  );

  const colorConsumers = [
    "src/components/windows/FloatingWindow.tsx",
    "src/components/ui/sidebar/Sidebar.tsx",
    "src/components/workspace/navigation/navigationTokens.ts",
    "src/components/workspace/toolbar/ACTION_TOKENS.ts",
    "src/lib/ui/tokens.ts",
  ];
  for (const rel of colorConsumers) {
    const src = read(rel);
    assertCase(
      `consume.color.${rel}`,
      /--color-(surface|text|border|brand)/.test(src),
      `${rel} consumes --color-*`
    );
  }

  assertCase(
    "shell.appShellColor",
    existsSync(join(repoRoot, "src/components/app-shell/AppShell.tsx")) &&
      /--color-surface-canvas/.test(read("src/components/app-shell/AppShell.tsx")),
    "AppShell uses --color-surface-canvas"
  );
  assertCase(
    "shell.statusBarColor",
    /--color-surface-default/.test(
      read("src/components/status-bar/StatusBarLayout.tsx")
    ),
    "StatusBarLayout uses --color-surface-default"
  );
  assertCase(
    "shell.toolbarTokens",
    /TOOLBAR_TOKENS/.test(read("src/components/toolbar/AdaptiveToolbar.tsx")),
    "AdaptiveToolbar consumes TOOLBAR_TOKENS"
  );
  assertCase(
    "shell.dockTokens",
    /UI_TOKENS\.dock/.test(read("src/components/docking/DockTokens.ts")),
    "DockTokens bridges UI_TOKENS.dock (no local fork)"
  );

  const priorI0 = spawnSync("npm", ["run", "validate:ux-i0"], {
    stdio: "pipe",
    shell: true,
    cwd: repoRoot,
    encoding: "utf8",
  });
  assertCase(
    "prereq.uxI0",
    (priorI0.status ?? 1) === 0,
    (priorI0.status ?? 1) === 0
      ? "validate:ux-i0 PASS"
      : `validate:ux-i0 FAIL: ${(priorI0.stderr || priorI0.stdout || "").slice(0, 300)}`
  );

  const failed = results.filter((r) => !r.pass);
  console.log("UX-I1 — Application Shell Modernization\n");
  for (const r of results) {
    console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.id} — ${r.detail}`);
  }
  console.log(
    failed.length === 0
      ? `\nPASS — validate:ux-i1 (${results.length} checks)`
      : `\nFAIL — ${failed.length}/${results.length} checks`
  );
  process.exit(failed.length === 0 ? 0 : 1);
}

main();
