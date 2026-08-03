/**
 * UX-4.9 — Chrome Runtime Migration gate.
 *
 * Blocks:
 * chromeRuntime · noLegacyTokens · visualParity · geometryFreeze
 * runtimeIsolation · appShellRoot · priorGate · tscCompile
 *
 * Principles:
 * - Theme Runtime is SSOT for AppShell chrome styling
 * - Chrome migration only — dual-stack outside is intentional
 * - Frozen mapping only — no additional mappings
 * - Geometry frozen after UX-4.8
 * - Visual parity is structural, not pixel-perfect
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { TokenCache } from "../src/ui/theme/tokens/runtime/TokenCache";
import { ThemeTokenResolver } from "../src/ui/theme/tokens/runtime/ThemeTokenResolver";
import { RuntimeReporter } from "../src/ui/theme/runtime/RuntimeReporter";
import { RuntimeDiagnostics } from "../src/ui/theme/runtime/diagnostics/RuntimeDiagnostics";
import { RuntimePipeline } from "../src/ui/theme/runtime/pipeline/RuntimePipeline";
import type { ThemeRuntime } from "../src/ui/theme/runtime/selectors/ThemeSelector";

type BlockId =
  | "chromeRuntime"
  | "noLegacyTokens"
  | "visualParity"
  | "geometryFreeze"
  | "runtimeIsolation"
  | "appShellRoot"
  | "priorGate"
  | "tscCompile";

type CaseResult = { block: BlockId; id: string; pass: boolean; detail: string };

const results: CaseResult[] = [];

function assertCase(
  block: BlockId,
  id: string,
  pass: boolean,
  detail: string,
): void {
  results.push({ block, id, pass, detail });
}

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel: string): string {
  return readFileSync(join(repoRoot, rel), "utf8");
}

function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

function walkFiles(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (name === "node_modules" || name === ".next" || name === "dist") {
        continue;
      }
      walkFiles(full, acc);
    } else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(name)) {
      acc.push(full);
    }
  }
  return acc;
}

/** Frozen UX-4.9 legacy → runtime mapping (exhaustive for this phase). */
const FROZEN_MAPPING: ReadonlyArray<[string, string]> = [
  ["--app-border", "--color-border-default"],
  ["--app-surface", "--color-surface-default"],
  ["--app-surface-muted", "--color-surface-canvas"],
  ["--app-text-muted", "--color-text-muted"],
];

const HOST_PATH = "src/app/theme-runtime-host.tsx";
const LAYOUT_PATH = "src/app/layout.tsx";
const UI_INDEX = "src/ui/index.ts";
const RUNTIME_INDEX = "src/ui/theme/runtime/index.ts";
const THEME_PROVIDER = "src/ui/providers/theme-provider.tsx";
const APP_SHELL = "src/components/app-shell/AppShell.tsx";
const APP_SHELL_LAYOUT = "src/components/app-shell/AppShellLayout.tsx";
const APP_SHELL_DIR = "src/components/app-shell";
const STATUS_BAR_DIR = "src/components/status-bar";
const STATUS_BAR = "src/components/status-bar/StatusBar.tsx";
const STATUS_BAR_LAYOUT = "src/components/status-bar/StatusBarLayout.tsx";
const WORKSPACE_LAYOUT = "src/components/workspace/WorkspaceLayout.tsx";
const WORKSPACE_CONTENT = "src/components/workspace/WorkspaceContent.tsx";
const SIDEBAR = "src/components/ui/sidebar/Sidebar.tsx";
const ADAPTIVE_TOOLBAR = "src/components/toolbar/AdaptiveToolbar.tsx";
const INSPECTOR = "src/components/inspector/Inspector.tsx";

function chromeSources(): { rel: string; src: string; stripped: string }[] {
  const files = [
    ...walkFiles(join(repoRoot, APP_SHELL_DIR)),
    ...walkFiles(join(repoRoot, STATUS_BAR_DIR)),
  ];
  return files.map((f) => {
    const rel = relative(repoRoot, f).replace(/\\/g, "/");
    const src = readFileSync(f, "utf8");
    return { rel, src, stripped: stripComments(src) };
  });
}

/* -------------------------------------------------------------------------- */
/* PASS 01 — chromeRuntime                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "chromeRuntime";
  const shellSrc = existsSync(join(repoRoot, APP_SHELL))
    ? stripComments(read(APP_SHELL))
    : "";
  const statusLayoutSrc = existsSync(join(repoRoot, STATUS_BAR_LAYOUT))
    ? stripComments(read(STATUS_BAR_LAYOUT))
    : "";

  assertCase(
    block,
    "chrome.placeholderUsesColorBorder",
    /border-\[var\(--color-border-default\)\]/.test(shellSrc),
    "AppShell placeholder uses --color-border-default",
  );

  assertCase(
    block,
    "chrome.placeholderUsesColorSurfaceCanvas",
    /bg-\[var\(--color-surface-canvas\)\]/.test(shellSrc),
    "AppShell placeholder uses --color-surface-canvas",
  );

  assertCase(
    block,
    "chrome.placeholderUsesColorTextMuted",
    /text-\[var\(--color-text-muted\)\]/.test(shellSrc),
    "AppShell placeholder uses --color-text-muted",
  );

  assertCase(
    block,
    "chrome.statusBarUsesColorBorder",
    /border-\[var\(--color-border-default\)\]/.test(statusLayoutSrc),
    "StatusBarLayout uses --color-border-default",
  );

  assertCase(
    block,
    "chrome.statusBarUsesColorSurfaceDefault",
    /bg-\[var\(--color-surface-default\)\]/.test(statusLayoutSrc),
    "StatusBarLayout uses --color-surface-default",
  );

  assertCase(
    block,
    "chrome.statusBarUsesColorTextMuted",
    /text-\[var\(--color-text-muted\)\]/.test(statusLayoutSrc),
    "StatusBarLayout uses --color-text-muted",
  );

  assertCase(
    block,
    "chrome.mappingExhaustive",
    FROZEN_MAPPING.length === 4 &&
      FROZEN_MAPPING.every(
        ([legacy, runtime]) =>
          legacy.startsWith("--app-") && runtime.startsWith("--color-"),
      ),
    "Frozen mapping table has exactly 4 --app-* → --color-* rows",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — noLegacyTokens (chrome dirs ONLY)                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noLegacyTokens";
  const chrome = chromeSources();
  const appOffenders: string[] = [];
  const uiTokensOffenders: string[] = [];

  for (const { rel, stripped } of chrome) {
    if (/--app-/.test(stripped)) {
      appOffenders.push(rel);
    }
    if (/\bUI_TOKENS\b/.test(stripped)) {
      uiTokensOffenders.push(rel);
    }
  }

  assertCase(
    block,
    "chrome.noAppCssVars",
    appOffenders.length === 0,
    appOffenders.length === 0
      ? "no --app-* in app-shell/** or status-bar/**"
      : `--app-* remains in: ${appOffenders.join(", ")}`,
  );

  assertCase(
    block,
    "chrome.noUiTokens",
    uiTokensOffenders.length === 0,
    uiTokensOffenders.length === 0
      ? "no UI_TOKENS in app-shell/** or status-bar/**"
      : `UI_TOKENS in: ${uiTokensOffenders.join(", ")}`,
  );

  assertCase(
    block,
    "chrome.scopeOnly",
    chrome.length > 0 &&
      chrome.every(
        (c) =>
          c.rel.startsWith("src/components/app-shell/") ||
          c.rel.startsWith("src/components/status-bar/"),
      ),
    "noLegacyTokens scan scoped to app-shell/** + status-bar/** only",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — visualParity (structural)                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "visualParity";
  const shellSrc = existsSync(join(repoRoot, APP_SHELL))
    ? stripComments(read(APP_SHELL))
    : "";
  const statusLayoutSrc = existsSync(join(repoRoot, STATUS_BAR_LAYOUT))
    ? stripComments(read(STATUS_BAR_LAYOUT))
    : "";
  const chrome = chromeSources();

  const hexOffenders: string[] = [];
  const inlineStyleOffenders: string[] = [];
  for (const { rel, stripped } of chrome) {
    if (/#[0-9a-fA-F]{3,8}\b/.test(stripped)) {
      hexOffenders.push(rel);
    }
    if (/\bstyle\s*=\s*\{/.test(stripped)) {
      inlineStyleOffenders.push(rel);
    }
  }

  assertCase(
    block,
    "parity.noHardcodedHex",
    hexOffenders.length === 0,
    hexOffenders.length === 0
      ? "no hardcoded hex colors in chrome dirs"
      : `hex in: ${hexOffenders.join(", ")}`,
  );

  assertCase(
    block,
    "parity.noInlineStyle",
    inlineStyleOffenders.length === 0,
    inlineStyleOffenders.length === 0
      ? "no inline style= in chrome dirs"
      : `inline style in: ${inlineStyleOffenders.join(", ")}`,
  );

  assertCase(
    block,
    "parity.placeholderStructure",
    /flex items-center justify-center border border-dashed/.test(shellSrc) &&
      /px-3 py-2 text-xs/.test(shellSrc),
    "AppShell placeholder structural classes retained",
  );

  assertCase(
    block,
    "parity.statusBarStructure",
    /flex h-8 w-full min-w-0 items-center border-t/.test(statusLayoutSrc) &&
      /px-3 text-xs/.test(statusLayoutSrc),
    "StatusBarLayout structural classes retained",
  );

  assertCase(
    block,
    "parity.onlyFrozenRuntimeVars",
    !/--color-(?!border-default|surface-default|surface-canvas|text-muted)[a-z0-9-]+/.test(
      `${shellSrc}\n${statusLayoutSrc}`,
    ),
    "chrome color vars limited to frozen mapping targets",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — geometryFreeze                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "geometryFreeze";
  const layoutSrc = existsSync(join(repoRoot, APP_SHELL_LAYOUT))
    ? stripComments(read(APP_SHELL_LAYOUT))
    : "";
  const shellSrc = existsSync(join(repoRoot, APP_SHELL))
    ? stripComments(read(APP_SHELL))
    : "";

  assertCase(
    block,
    "geometry.lgBreakpoint",
    /\blg:grid-cols-\[/.test(layoutSrc),
    "AppShellLayout retains Tailwind lg: responsive grid",
  );

  assertCase(
    block,
    "geometry.colsBelowLg",
    /grid-cols-\[auto_minmax\(0,\s*1fr\)_0fr\]/.test(layoutSrc),
    "Below-lg grid cols identical to UX-4.8",
  );

  assertCase(
    block,
    "geometry.colsAtLg",
    /lg:grid-cols-\[auto_minmax\(0,\s*1fr\)_auto\]/.test(layoutSrc),
    "lg+ grid cols identical to UX-4.8",
  );

  assertCase(
    block,
    "geometry.rows",
    /grid-rows-\[auto_minmax\(0,\s*1fr\)_auto\]/.test(layoutSrc),
    "Three-row grid identical to UX-4.8",
  );

  assertCase(
    block,
    "geometry.areas",
    /toolbar_toolbar_toolbar/.test(layoutSrc) &&
      /sidebar_workspace_inspector/.test(layoutSrc) &&
      /statusBar_statusBar_statusBar/.test(layoutSrc),
    "Five-region template areas identical to UX-4.8",
  );

  assertCase(
    block,
    "geometry.noInspectorFloor280",
    !/minmax\(280px/.test(layoutSrc),
    "No minmax(280px,…) on inspector track",
  );

  assertCase(
    block,
    "geometry.workspaceBounds",
    /relative h-full min-h-0 min-w-0 overflow-hidden/.test(shellSrc),
    "Workspace Region bounds identical to UX-4.8",
  );

  assertCase(
    block,
    "geometry.sidebarBounds",
    /flex h-full min-h-0 flex-col overflow-hidden/.test(shellSrc),
    "Sidebar Region bounds identical to UX-4.8",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — runtimeIsolation                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "runtimeIsolation";
  const chrome = chromeSources();
  const runtimeImportOffenders: string[] = [];
  for (const { rel, stripped } of chrome) {
    if (
      /from\s+["']@\/ui\/theme\/runtime/.test(stripped) ||
      /from\s+["']\.\.\/.*theme\/runtime/.test(stripped)
    ) {
      runtimeImportOffenders.push(rel);
    }
  }

  assertCase(
    block,
    "isolation.noRuntimeImports",
    runtimeImportOffenders.length === 0,
    runtimeImportOffenders.length === 0
      ? "chrome has no @/ui/theme/runtime imports"
      : `runtime imports: ${runtimeImportOffenders.join(", ")}`,
  );

  const uiIndex = existsSync(join(repoRoot, UI_INDEX))
    ? stripComments(read(UI_INDEX))
    : "";
  const runtimeIndex = existsSync(join(repoRoot, RUNTIME_INDEX))
    ? stripComments(read(RUNTIME_INDEX))
    : "";

  assertCase(
    block,
    "isolation.themeProviderExists",
    existsSync(join(repoRoot, THEME_PROVIDER)),
    "ThemeProvider file intact",
  );

  assertCase(
    block,
    "isolation.publicApi",
    /\bThemeProvider\b/.test(uiIndex) && /\buseTheme\b/.test(uiIndex),
    "@/ui still exports ThemeProvider + useTheme",
  );

  assertCase(
    block,
    "isolation.noPipelinePublic",
    !/\bRuntimePipeline\b/.test(uiIndex) &&
      !/\bRuntimeDiagnostics\b/.test(uiIndex) &&
      !/\bRuntimeReporter\b/.test(uiIndex),
    "@/ui does not export diagnostics/pipeline/reporter",
  );

  assertCase(
    block,
    "isolation.runtimeKeepsPrivate",
    !/\bRuntimePipeline\b/.test(runtimeIndex) &&
      !/\bRuntimeReporter\b/.test(runtimeIndex) &&
      !/\bRuntimeDiagnostics\b/.test(runtimeIndex),
    "runtime/index.ts keeps diagnostics private",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — appShellRoot                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "appShellRoot";
  const shellSrc = existsSync(join(repoRoot, APP_SHELL))
    ? stripComments(read(APP_SHELL))
    : "";
  const bridgeSrc = existsSync(join(repoRoot, WORKSPACE_LAYOUT))
    ? stripComments(read(WORKSPACE_LAYOUT))
    : "";

  assertCase(
    block,
    "root.AppShellExists",
    existsSync(join(repoRoot, APP_SHELL)) &&
      /\bexport function AppShell\b/.test(shellSrc),
    "AppShell remains sole composition root export",
  );

  assertCase(
    block,
    "root.legacyAbsent",
    !existsSync(join(repoRoot, "src/components/layout/AppShell.tsx")) &&
      !existsSync(join(repoRoot, "src/components/root/AppShell.tsx")) &&
      !existsSync(join(repoRoot, "src/app/AppShell.tsx")),
    "no legacy alternate AppShell paths",
  );

  assertCase(
    block,
    "root.bridgeUsesAppShell",
    /from\s+["']@\/components\/app-shell["']/.test(bridgeSrc) &&
      /<AppShell\b/.test(bridgeSrc),
    "WorkspaceLayout still bridges to AppShell",
  );

  assertCase(
    block,
    "intact.Sidebar",
    existsSync(join(repoRoot, SIDEBAR)),
    "Sidebar.tsx still present (dual-stack intentional)",
  );

  assertCase(
    block,
    "intact.AdaptiveToolbar",
    existsSync(join(repoRoot, ADAPTIVE_TOOLBAR)),
    "AdaptiveToolbar.tsx still present (dual-stack intentional)",
  );

  assertCase(
    block,
    "intact.Inspector",
    existsSync(join(repoRoot, INSPECTOR)),
    "Inspector.tsx still present (dual-stack intentional)",
  );

  assertCase(
    block,
    "intact.WorkspaceContent",
    existsSync(join(repoRoot, WORKSPACE_CONTENT)),
    "WorkspaceContent.tsx still present",
  );

  assertCase(
    block,
    "intact.StatusBar",
    existsSync(join(repoRoot, STATUS_BAR)),
    "StatusBar.tsx still present",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — priorGate (UX-4.8 … UX-4.1 inline · no nested validate)           */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "priorGate";
  const pkg = read("package.json");

  assertCase(
    block,
    "prior.ux48Exists",
    existsSync(join(repoRoot, "scripts/validate-ux-4.8.ts")) &&
      /"validate:ux-4\.8"\s*:/.test(pkg) &&
      existsSync(join(repoRoot, "docs/UX/UX-4.8.md")),
    "UX-4.8 validator + doc + npm script retained",
  );

  assertCase(
    block,
    "prior.ux47Exists",
    existsSync(join(repoRoot, "scripts/validate-ux-4.7.ts")) &&
      /"validate:ux-4\.7"\s*:/.test(pkg) &&
      existsSync(join(repoRoot, "docs/UX/UX-4.7.md")),
    "UX-4.7 validator + doc + npm script retained",
  );

  assertCase(
    block,
    "prior.ux46Exists",
    existsSync(join(repoRoot, "scripts/validate-ux-4.6.ts")) &&
      /"validate:ux-4\.6"\s*:/.test(pkg) &&
      existsSync(join(repoRoot, "docs/UX/UX-4.6.md")),
    "UX-4.6 validator + doc + npm script retained",
  );

  assertCase(
    block,
    "prior.ux45Exists",
    existsSync(join(repoRoot, "scripts/validate-ux-4.5.ts")) &&
      /"validate:ux-4\.5"\s*:/.test(pkg) &&
      existsSync(join(repoRoot, "docs/UX/UX-4.5.md")),
    "UX-4.5 validator + doc + npm script retained",
  );

  assertCase(
    block,
    "prior.ux44Exists",
    existsSync(join(repoRoot, "scripts/validate-ux-4.4.ts")) &&
      /"validate:ux-4\.4"\s*:/.test(pkg) &&
      existsSync(join(repoRoot, "docs/UX/UX-4.4.md")),
    "UX-4.4 validator + doc + npm script retained",
  );

  assertCase(
    block,
    "prior.ux43Exists",
    existsSync(join(repoRoot, "scripts/validate-ux-4.3.ts")) &&
      /"validate:ux-4\.3"\s*:/.test(pkg) &&
      existsSync(join(repoRoot, "docs/UX/UX-4.3.md")),
    "UX-4.3 validator + doc + npm script retained",
  );

  assertCase(
    block,
    "prior.ux42Exists",
    existsSync(join(repoRoot, APP_SHELL)) &&
      existsSync(join(repoRoot, "scripts/validate-ux-4.2.ts")) &&
      /"validate:ux-4\.2"\s*:/.test(pkg),
    "UX-4.2 AppShell + validate:ux-4.2 retained",
  );

  assertCase(
    block,
    "prior.ux41Host",
    existsSync(join(repoRoot, HOST_PATH)) &&
      existsSync(join(repoRoot, "scripts/validate-ux-4.1.ts")),
    "UX-4.1 ThemeRuntimeHost + validator retained",
  );

  const hostSrc = existsSync(join(repoRoot, HOST_PATH))
    ? stripComments(read(HOST_PATH))
    : "";
  const layoutSrc = existsSync(join(repoRoot, LAYOUT_PATH))
    ? stripComments(read(LAYOUT_PATH))
    : "";

  assertCase(
    block,
    "prior.hostMount",
    /\bThemeRuntimeHost\b/.test(hostSrc) &&
      /ThemeProvider/.test(hostSrc) &&
      /from\s+["']@\/ui["']/.test(hostSrc) &&
      /ThemeRuntimeHost/.test(layoutSrc),
    "ThemeRuntimeHost mount intact",
  );

  assertCase(
    block,
    "prior.hostScoped",
    !/documentElement/.test(hostSrc) && !/localStorage/.test(hostSrc),
    "ThemeRuntimeHost remains host-scoped",
  );

  TokenCache.clear();
  const runtime = ThemeTokenResolver.resolve("light") as ThemeRuntime;
  const report = RuntimeReporter.build(runtime);
  const viaDiag = RuntimeDiagnostics.collect(runtime);
  const viaPipe = RuntimePipeline.run(runtime);

  assertCase(
    block,
    "prior.reporterBuild",
    report != null &&
      typeof report === "object" &&
      "runtime" in report &&
      "health" in report,
    "RuntimeReporter.build freeze intact",
  );

  assertCase(
    block,
    "prior.diagnosticsCollect",
    Object.isFrozen(RuntimeDiagnostics) &&
      viaDiag != null &&
      "health" in viaDiag,
    "RuntimeDiagnostics.collect freeze intact",
  );

  assertCase(
    block,
    "prior.pipelineRun",
    Object.isFrozen(RuntimePipeline) &&
      viaPipe != null &&
      "runtime" in viaPipe,
    "RuntimePipeline.run freeze intact",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — tscCompile                                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "tscCompile";
  const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
    timeout: 180_000,
  });
  const tscPass = tsc.status === 0;
  assertCase(
    block,
    "tsc.noEmit",
    tscPass,
    tscPass
      ? "npx tsc --noEmit PASS"
      : `tsc failed: ${(tsc.stderr || tsc.stdout || "").slice(0, 500)}`,
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const BLOCKS: Array<{ id: BlockId; pass: number; ca: string }> = [
  { id: "chromeRuntime", pass: 1, ca: "CA-UX-4.9.1" },
  { id: "noLegacyTokens", pass: 2, ca: "CA-UX-4.9.2 / CA-UX-4.9.3" },
  { id: "visualParity", pass: 3, ca: "CA-UX-4.9.5" },
  { id: "geometryFreeze", pass: 4, ca: "CA-UX-4.9.4" },
  { id: "runtimeIsolation", pass: 5, ca: "CA-UX-4.9.6 / CA-UX-4.9.7" },
  { id: "appShellRoot", pass: 6, ca: "CA-UX-4.9.8 / CA-UX-4.9.9 / CA-UX-4.9.10" },
  { id: "priorGate", pass: 7, ca: "CA-UX-4.9.12 (prior inline)" },
  { id: "tscCompile", pass: 8, ca: "CA-UX-4.9.11" },
];

let passCount = 0;
for (const { id: block, pass, ca } of BLOCKS) {
  const blockResults = results.filter((r) => r.block === block);
  const failed = blockResults.filter((r) => r.pass === false);
  const ok = failed.length === 0 && blockResults.length > 0;
  if (ok) passCount += 1;
  const label = `PASS ${String(pass).padStart(2, "0")} ${block}`;
  const pad = ".".repeat(Math.max(1, 42 - label.length));
  console.log(`${label} ${pad} ${ok ? "PASS" : "FAIL"} (${ca})`);
  for (const f of failed) {
    console.log(`  FAIL ${f.id}: ${f.detail}`);
  }
  if (blockResults.length === 0) {
    console.log(`  FAIL (no cases)`);
  }
}

const allPass = passCount === BLOCKS.length;
console.log("validate:ux-4.9");
console.log(allPass ? "PASS" : "FAIL");
if (allPass) {
  console.log("Chrome Runtime Migration");
  console.log("Frozen mapping · dual-stack outside intentional");
  console.log("Geometry frozen · Theme Runtime SSOT for chrome");
}
console.log(`${passCount}/${BLOCKS.length}`);

process.exit(allPass ? 0 : 1);
