/**
 * UX-I2 — Shared Components Modernization gates.
 *
 * Shared UI must consume Design System CSS variable families directly.
 * No var(--app-*) in shared scopes. Design System sources untouched.
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
  "docs/UX/implementation/UX-I2-Shared-Components-Modernization-BUILD.md";

const SHARED_SCOPES = [
  "src/components/ui",
  "src/components/settings",
  "src/lib/ui",
] as const;

function main(): void {
  assertCase(
    "docs.buildRecord",
    existsSync(join(repoRoot, BUILD)),
    "UX-I2 Build record exists"
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
      `${domain} present`
    );
  }

  const tokens = read("src/lib/ui/tokens.ts");
  assertCase(
    "ds.radius",
    /--radius-container/.test(tokens) && /--radius-control/.test(tokens),
    "UI_TOKENS.radius consumes --radius-*"
  );
  assertCase(
    "ds.elevation",
    /--elevation-card/.test(tokens) && /--elevation-popover/.test(tokens),
    "UI_TOKENS.shadows consume --elevation-*"
  );
  assertCase(
    "ds.spacing",
    /--spacing-tight/.test(tokens) && /--spacing-compact/.test(tokens),
    "UI_TOKENS.spacing consumes --spacing-*"
  );
  assertCase(
    "ds.typography",
    /--typography-heading-sm-font-size/.test(tokens) &&
      /--typography-body-sm-font-size/.test(tokens),
    "UI_TOKENS.typography consumes --typography-*"
  );
  assertCase(
    "ds.motion",
    /--motion-enter-duration/.test(tokens),
    "UI_TOKENS.transitions consume --motion-*"
  );
  assertCase(
    "ds.color",
    /--color-border-default/.test(tokens) &&
      /--color-brand-primary/.test(tokens),
    "UI_TOKENS color chrome consumes --color-*"
  );

  const surfaces = read("src/components/workspace/surfaces/SurfaceTokens.ts");
  assertCase(
    "surfaces.dsRadius",
    /--radius-container/.test(surfaces),
    "SurfaceTokens consume --radius-*"
  );
  assertCase(
    "surfaces.noTailwindPaletteTones",
    !/text-sky-/.test(surfaces) &&
      !/text-violet-/.test(surfaces) &&
      !/text-emerald-/.test(surfaces),
    "SurfaceTokens tones use Design System colors (not sky/violet/emerald)"
  );

  const settings = read("src/components/settings/SettingsPanel.tsx");
  assertCase(
    "settings.dsVars",
    /--color-surface-default/.test(settings) &&
      /--radius-control/.test(settings) &&
      /--typography-body-sm-font-size/.test(settings) &&
      !/var\(--app-/.test(stripComments(settings)),
    "SettingsPanel consumes DS vars; no --app-*"
  );

  assertCase(
    "ui.readme",
    existsSync(join(repoRoot, "src/components/ui/README.md")),
    "Shared UI README documents DS consumer policy"
  );

  const appOffenders: string[] = [];
  for (const scope of SHARED_SCOPES) {
    for (const full of walkFiles(join(repoRoot, scope))) {
      const src = stripComments(readFileSync(full, "utf8"));
      if (/var\(--app-/.test(src)) {
        appOffenders.push(relative(repoRoot, full).replace(/\\/g, "/"));
      }
    }
  }
  assertCase(
    "shared.noAppCssVars",
    appOffenders.length === 0,
    appOffenders.length === 0
      ? "shared scopes use no var(--app-*)"
      : `var(--app-*) in: ${appOffenders.slice(0, 10).join(", ")}`
  );

  const buttons = [
    "src/components/ui/buttons/PrimaryButton.tsx",
    "src/components/ui/buttons/SecondaryButton.tsx",
    "src/components/ui/layout/Panel.tsx",
  ];
  for (const rel of buttons) {
    assertCase(
      `ui.exists.${rel}`,
      existsSync(join(repoRoot, rel)),
      `${rel} present`
    );
  }

  const prior = spawnSync("npm", ["run", "validate:ux-i1"], {
    stdio: "pipe",
    shell: true,
    cwd: repoRoot,
    encoding: "utf8",
  });
  assertCase(
    "prereq.uxI1",
    (prior.status ?? 1) === 0,
    (prior.status ?? 1) === 0
      ? "validate:ux-i1 PASS"
      : `validate:ux-i1 FAIL: ${(prior.stderr || prior.stdout || "").slice(0, 300)}`
  );

  const failed = results.filter((r) => !r.pass);
  console.log("UX-I2 — Shared Components Modernization\n");
  for (const r of results) {
    console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.id} — ${r.detail}`);
  }
  console.log(
    failed.length === 0
      ? `\nPASS — validate:ux-i2 (${results.length} checks)`
      : `\nFAIL — ${failed.length}/${results.length} checks`
  );
  process.exit(failed.length === 0 ? 0 : 1);
}

main();
