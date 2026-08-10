/**
 * UX-I3 — Workspace Modernization gates.
 *
 * Workspace presentation consumes Design System spacing / elevation / surfaces.
 * Behavior unchanged. Design System sources untouched.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
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

const BUILD =
  "docs/UX/implementation/UX-I3-Workspace-Modernization-BUILD.md";

function main(): void {
  assertCase(
    "docs.buildRecord",
    existsSync(join(repoRoot, BUILD)),
    "UX-I3 Build record exists"
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

  const density = read("src/components/workspace/density/densityTokens.ts");
  assertCase(
    "density.spacingVars",
    /--spacing-compact/.test(density) && /--spacing-tight/.test(density),
    "WORKSPACE_DENSITY_TOKENS consumes --spacing-*"
  );

  const layout = read("src/components/workspace/layout/LayoutTokens.ts");
  assertCase(
    "layout.spacingVars",
    /--spacing-tight/.test(layout) && /--spacing-compact/.test(layout),
    "LAYOUT_TOKENS mirrors density with --spacing-*"
  );

  const surface = read("src/components/workspace/surface/SURFACE_TOKENS.ts");
  assertCase(
    "surface.dsRadiusSpacing",
    /--radius-container/.test(surface) && /--spacing-compact/.test(surface),
    "surface SURFACE_TOKENS uses DS radius/spacing"
  );

  const canvas = read(
    "src/components/workspace/panels/WorkspaceBodyLayout.tsx"
  );
  assertCase(
    "canvas.elevation",
    /--elevation-card/.test(canvas) && /--elevation-popover/.test(canvas),
    "Canvas framing uses Design System elevation"
  );
  assertCase(
    "canvas.floatingSurface",
    /--color-surface-floating/.test(canvas),
    "Canvas uses floating surface for content prominence"
  );
  assertCase(
    "canvas.dataMarker",
    /data-workspace-canvas/.test(canvas),
    "Canvas marker preserved (behavior unchanged)"
  );

  const panel = read("src/components/workspace/panels/Panel.tsx");
  assertCase(
    "panel.elevation",
    /--elevation-card/.test(panel),
    "Side panels use elevation hierarchy"
  );

  const tokens = read("src/lib/ui/tokens.ts");
  assertCase(
    "workspace.innerSpacing",
    /inner:[\s\S]*--spacing-compact/.test(tokens),
    "UI_TOKENS.workspace.inner uses Design System spacing"
  );
  assertCase(
    "inspector.bodyHierarchy",
    /inspector[\s\S]*body:[\s\S]*--color-surface-canvas/.test(tokens),
    "Inspector body uses canvas surface for hierarchy"
  );

  const header = read("src/components/workspace/WorkspaceContent.tsx");
  assertCase(
    "header.typography",
    /--typography-[a-z0-9-]+-font-size/.test(header),
    "Workspace header consumes typography tokens"
  );

  assertCase(
    "ssot.themeProvider",
    existsSync(join(repoRoot, "src/ui/providers/theme-provider.tsx")),
    "Design System ThemeProvider present (unmodified by gate)"
  );

  const prior = spawnSync("npm", ["run", "validate:ux-i2"], {
    stdio: "pipe",
    shell: true,
    cwd: repoRoot,
    encoding: "utf8",
  });
  assertCase(
    "prereq.uxI2",
    (prior.status ?? 1) === 0,
    (prior.status ?? 1) === 0
      ? "validate:ux-i2 PASS"
      : `validate:ux-i2 FAIL: ${(prior.stderr || prior.stdout || "").slice(0, 300)}`
  );

  const failed = results.filter((r) => !r.pass);
  console.log("UX-I3 — Workspace Modernization\n");
  for (const r of results) {
    console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.id} — ${r.detail}`);
  }
  console.log(
    failed.length === 0
      ? `\nPASS — validate:ux-i3 (${results.length} checks)`
      : `\nFAIL — ${failed.length}/${results.length} checks`
  );
  process.exit(failed.length === 0 ? 0 : 1);
}

main();
