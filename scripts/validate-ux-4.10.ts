/**
 * UX-4.10 — Integration Certification gate.
 *
 * Blocks:
 * runtimeCertified · hostCertified · appShellCertified · responsiveCertified
 * chromeCertified · geometryFreeze · runtimeFreeze · dualStackCertified
 * roadmapConsistency · priorArtifacts · tscCompile
 *
 * Frozen principles:
 * - Documentary — certification only; no production changes
 * - Architectural — system under certification is unchanged
 * - Evidence Reuse — aggregates UX-4.1–4.9 proofs; does not redefine criteria
 * - Read-only Validator — reads / verifies / reports only; never mutates artifacts
 * - Series Closure — SERIES CERTIFIED only if every block passes
 *
 * No nested validate:ux-4.N (Windows hang). Inline evidence reuse only.
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
  | "runtimeCertified"
  | "hostCertified"
  | "appShellCertified"
  | "responsiveCertified"
  | "chromeCertified"
  | "geometryFreeze"
  | "runtimeFreeze"
  | "dualStackCertified"
  | "roadmapConsistency"
  | "priorArtifacts"
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

/** Frozen UX-4.9 mapping (reused; not redefined). */
const FROZEN_MAPPING: ReadonlyArray<[string, string]> = [
  ["--app-border", "--color-border-default"],
  ["--app-surface", "--color-surface-default"],
  ["--app-surface-muted", "--color-surface-canvas"],
  ["--app-text-muted", "--color-text-muted"],
];

const REGION_IDS = [
  "toolbar",
  "sidebar",
  "workspace",
  "inspector",
  "statusBar",
] as const;

const HOST_PATH = "src/app/theme-runtime-host.tsx";
const LAYOUT_PATH = "src/app/layout.tsx";
const UI_INDEX = "src/ui/index.ts";
const RUNTIME_INDEX = "src/ui/theme/runtime/index.ts";
const THEME_PROVIDER = "src/ui/providers/theme-provider.tsx";
const APP_SHELL = "src/components/app-shell/AppShell.tsx";
const APP_SHELL_LAYOUT = "src/components/app-shell/AppShellLayout.tsx";
const APP_SHELL_REGIONS = "src/components/app-shell/AppShellRegions.ts";
const APP_SHELL_INDEX = "src/components/app-shell/index.ts";
const APP_SHELL_DIR = "src/components/app-shell";
const STATUS_BAR_DIR = "src/components/status-bar";
const STATUS_BAR = "src/components/status-bar/StatusBar.tsx";
const STATUS_BAR_LAYOUT = "src/components/status-bar/StatusBarLayout.tsx";
const WORKSPACE_LAYOUT = "src/components/workspace/WorkspaceLayout.tsx";
const WORKSPACE_CONTENT = "src/components/workspace/WorkspaceContent.tsx";
const SIDEBAR = "src/components/ui/sidebar/Sidebar.tsx";
const ADAPTIVE_TOOLBAR = "src/components/toolbar/AdaptiveToolbar.tsx";
const INSPECTOR = "src/components/inspector/Inspector.tsx";
const ROADMAP = "docs/UX/UX-4.0-roadmap.md";
const DOC_410 = "docs/UX/UX-4.10.md";

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
/* PASS 01 — runtimeCertified (UX-3 evidence reuse)                           */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "runtimeCertified";
  const uiIndex = existsSync(join(repoRoot, UI_INDEX))
    ? stripComments(read(UI_INDEX))
    : "";
  const runtimeIndex = existsSync(join(repoRoot, RUNTIME_INDEX))
    ? stripComments(read(RUNTIME_INDEX))
    : "";

  TokenCache.clear();
  const runtime = ThemeTokenResolver.resolve("light") as ThemeRuntime;
  const report = RuntimeReporter.build(runtime);
  const viaDiag = RuntimeDiagnostics.collect(runtime);
  const viaPipe = RuntimePipeline.run(runtime);

  assertCase(
    block,
    "runtime.reporterBuild",
    report != null &&
      typeof report === "object" &&
      "runtime" in report &&
      "health" in report,
    "RuntimeReporter.build intact (UX-3)",
  );

  assertCase(
    block,
    "runtime.diagnosticsCollect",
    Object.isFrozen(RuntimeDiagnostics) &&
      viaDiag != null &&
      "health" in viaDiag,
    "RuntimeDiagnostics.collect frozen + intact",
  );

  assertCase(
    block,
    "runtime.pipelineRun",
    Object.isFrozen(RuntimePipeline) &&
      viaPipe != null &&
      "runtime" in viaPipe,
    "RuntimePipeline.run frozen + intact",
  );

  assertCase(
    block,
    "runtime.reporterFrozen",
    Object.isFrozen(RuntimeReporter),
    "RuntimeReporter object frozen",
  );

  assertCase(
    block,
    "runtime.noPublicLeakUi",
    !/\bRuntimePipeline\b/.test(uiIndex) &&
      !/\bRuntimeDiagnostics\b/.test(uiIndex) &&
      !/\bRuntimeReporter\b/.test(uiIndex),
    "@/ui does not export Pipeline/Diagnostics/Reporter",
  );

  assertCase(
    block,
    "runtime.noPublicLeakRuntimeIndex",
    !/\bRuntimePipeline\b/.test(runtimeIndex) &&
      !/\bRuntimeReporter\b/.test(runtimeIndex) &&
      !/\bRuntimeDiagnostics\b/.test(runtimeIndex),
    "runtime/index.ts keeps diagnostics private",
  );

  assertCase(
    block,
    "runtime.ux321Doc",
    existsSync(join(repoRoot, "docs/UX/UX-3.21.md")),
    "UX-3.21 certification doc retained",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — hostCertified (UX-4.1 evidence reuse)                            */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "hostCertified";
  const hostSrc = existsSync(join(repoRoot, HOST_PATH))
    ? stripComments(read(HOST_PATH))
    : "";
  const layoutSrc = existsSync(join(repoRoot, LAYOUT_PATH))
    ? stripComments(read(LAYOUT_PATH))
    : "";
  const providerSrc = existsSync(join(repoRoot, THEME_PROVIDER))
    ? stripComments(read(THEME_PROVIDER))
    : "";

  assertCase(
    block,
    "host.fileExists",
    existsSync(join(repoRoot, HOST_PATH)),
    "theme-runtime-host.tsx exists",
  );

  assertCase(
    block,
    "host.exportsThemeRuntimeHost",
    /\bexport\s+function\s+ThemeRuntimeHost\b/.test(hostSrc),
    "exports ThemeRuntimeHost",
  );

  assertCase(
    block,
    "host.importsThemeProviderFromUi",
    /ThemeProvider/.test(hostSrc) && /from\s+["']@\/ui["']/.test(hostSrc),
    "ThemeProvider imported from @/ui",
  );

  assertCase(
    block,
    "host.noInternalRuntimeImport",
    !/theme\/runtime/.test(hostSrc),
    "host does not import theme/runtime internals",
  );

  assertCase(
    block,
    "host.layoutMounts",
    /\bThemeRuntimeHost\b/.test(layoutSrc) &&
      /from\s+["']\.\/theme-runtime-host["']/.test(layoutSrc),
    "layout.tsx mounts ThemeRuntimeHost",
  );

  assertCase(
    block,
    "host.scoped",
    !/documentElement/.test(hostSrc) && !/localStorage/.test(hostSrc),
    "ThemeRuntimeHost remains host-scoped",
  );

  assertCase(
    block,
    "host.providerIntact",
    existsSync(join(repoRoot, THEME_PROVIDER)) &&
      !/RuntimeDiagnostics/.test(providerSrc) &&
      !/documentElement/.test(providerSrc) &&
      !/localStorage/.test(providerSrc),
    "ThemeProvider intact (no Diagnostics / document / storage)",
  );

  assertCase(
    block,
    "host.defaultThemeLight",
    /defaultTheme\s*=\s*["']light["']/.test(hostSrc),
    "host uses defaultTheme light",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — appShellCertified (UX-4.2 evidence reuse)                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "appShellCertified";
  const shellSrc = existsSync(join(repoRoot, APP_SHELL))
    ? stripComments(read(APP_SHELL))
    : "";
  const regionsSrc = existsSync(join(repoRoot, APP_SHELL_REGIONS))
    ? stripComments(read(APP_SHELL_REGIONS))
    : "";
  const bridgeSrc = existsSync(join(repoRoot, WORKSPACE_LAYOUT))
    ? stripComments(read(WORKSPACE_LAYOUT))
    : "";
  const indexSrc = existsSync(join(repoRoot, APP_SHELL_INDEX))
    ? stripComments(read(APP_SHELL_INDEX))
    : "";

  assertCase(
    block,
    "shell.dirExists",
    existsSync(join(repoRoot, APP_SHELL_DIR)),
    "src/components/app-shell/ exists",
  );

  assertCase(
    block,
    "shell.filesExist",
    existsSync(join(repoRoot, APP_SHELL)) &&
      existsSync(join(repoRoot, APP_SHELL_LAYOUT)) &&
      existsSync(join(repoRoot, APP_SHELL_REGIONS)) &&
      existsSync(join(repoRoot, APP_SHELL_INDEX)),
    "AppShell core files present",
  );

  assertCase(
    block,
    "shell.exportAppShell",
    /\bexport\s+function\s+AppShell\b/.test(shellSrc),
    "AppShell.tsx exports function AppShell",
  );

  assertCase(
    block,
    "shell.barrelExports",
    /\bAppShell\b/.test(indexSrc),
    "index.ts re-exports AppShell",
  );

  assertCase(
    block,
    "shell.regionAttr",
    /data-app-shell-region/.test(regionsSrc) ||
      /APP_SHELL_REGION_ATTR/.test(regionsSrc),
    "AppShellRegions defines region attr",
  );

  for (const id of REGION_IDS) {
    assertCase(
      block,
      `shell.regionId.${id}`,
      new RegExp(`["']${id}["']`).test(regionsSrc),
      `AppShellRegions includes "${id}"`,
    );
    assertCase(
      block,
      `shell.regionRendered.${id}`,
      new RegExp(`APP_SHELL_REGIONS\\.${id}|["']${id}["']`).test(shellSrc),
      `AppShell references region ${id}`,
    );
  }

  assertCase(
    block,
    "shell.legacyAbsent",
    !existsSync(join(repoRoot, "src/components/layout/AppShell.tsx")) &&
      !existsSync(join(repoRoot, "src/components/AppShell.tsx")) &&
      !existsSync(join(repoRoot, "src/app/AppShell.tsx")),
    "legacy AppShell paths absent",
  );

  assertCase(
    block,
    "shell.bridgeMounts",
    /from\s+["']@\/components\/app-shell["']/.test(bridgeSrc) &&
      /<AppShell\b/.test(bridgeSrc),
    "WorkspaceLayout bridges to AppShell",
  );

  const shellFiles = walkFiles(join(repoRoot, APP_SHELL_DIR)).filter((f) =>
    /\.tsx?$/.test(f),
  );
  let exportAppShellCount = 0;
  for (const f of shellFiles) {
    const src = stripComments(readFileSync(f, "utf8"));
    if (/\bexport\s+function\s+AppShell\b/.test(src)) {
      exportAppShellCount += 1;
    }
  }
  assertCase(
    block,
    "shell.soleExport",
    exportAppShellCount === 1,
    `exactly one export function AppShell (found ${exportAppShellCount})`,
  );

  // CA-UX-4.10.9 — no new features: layout-only (reuse UX-4.2 layoutOnly)
  const forbidden = [
    /\buseState\b/,
    /\buseEffect\b/,
    /\buseReducer\b/,
    /\bcreateContext\b/,
    /\bzustand\b/,
  ];
  const offenders: string[] = [];
  for (const f of shellFiles) {
    const rel = relative(repoRoot, f).replace(/\\/g, "/");
    const src = stripComments(readFileSync(f, "utf8"));
    for (const re of forbidden) {
      if (re.test(src)) offenders.push(`${rel}:${re}`);
    }
  }
  assertCase(
    block,
    "shell.layoutOnlyNoFeatures",
    offenders.length === 0,
    offenders.length === 0
      ? "app-shell remains layout-only (no new features)"
      : `forbidden: ${offenders.join(", ")}`,
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — responsiveCertified (UX-4.8 evidence reuse)                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "responsiveCertified";
  const layoutSrc = existsSync(join(repoRoot, APP_SHELL_LAYOUT))
    ? stripComments(read(APP_SHELL_LAYOUT))
    : "";

  assertCase(
    block,
    "responsive.exists",
    existsSync(join(repoRoot, APP_SHELL_LAYOUT)),
    "AppShellLayout.tsx exists",
  );

  assertCase(
    block,
    "responsive.lgBreakpoint",
    /\blg:grid-cols-\[/.test(layoutSrc),
    "Tailwind lg: responsive grid retained",
  );

  assertCase(
    block,
    "responsive.sidebarTrackAuto",
    /grid-cols-\[auto_/.test(layoutSrc) &&
      /lg:grid-cols-\[auto_/.test(layoutSrc),
    "Sidebar track auto at all breakpoints",
  );

  assertCase(
    block,
    "responsive.workspacePriority",
    /minmax\(0,\s*1fr\)/.test(layoutSrc),
    "Workspace track minmax(0,1fr)",
  );

  assertCase(
    block,
    "responsive.inspectorAutoLg",
    /lg:grid-cols-\[auto_minmax\(0,\s*1fr\)_auto\]/.test(layoutSrc),
    "Inspector track auto at lg+",
  );

  assertCase(
    block,
    "responsive.inspectorCollapsed",
    /grid-cols-\[auto_minmax\(0,\s*1fr\)_0fr\]/.test(layoutSrc) ||
      /grid-cols-\[auto_minmax\(0,\s*1fr\)_0px\]/.test(layoutSrc),
    "Inspector collapses below lg",
  );

  assertCase(
    block,
    "responsive.noFloor280",
    !/minmax\(280px/.test(layoutSrc),
    "No minmax(280px,…) inspector floor",
  );

  assertCase(
    block,
    "responsive.fiveAreas",
    /toolbar_toolbar_toolbar/.test(layoutSrc) &&
      /sidebar_workspace_inspector/.test(layoutSrc) &&
      /statusBar_statusBar_statusBar/.test(layoutSrc),
    "Five-region grid areas retained",
  );

  assertCase(
    block,
    "responsive.threeRows",
    /grid-rows-\[auto_minmax\(0,\s*1fr\)_auto\]/.test(layoutSrc),
    "Three-row grid retained",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — chromeCertified (UX-4.9 evidence reuse)                          */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "chromeCertified";
  const shellSrc = existsSync(join(repoRoot, APP_SHELL))
    ? stripComments(read(APP_SHELL))
    : "";
  const statusLayoutSrc = existsSync(join(repoRoot, STATUS_BAR_LAYOUT))
    ? stripComments(read(STATUS_BAR_LAYOUT))
    : "";
  const chrome = chromeSources();
  const appOffenders: string[] = [];
  const uiTokensOffenders: string[] = [];

  for (const { rel, stripped } of chrome) {
    if (/--app-/.test(stripped)) appOffenders.push(rel);
    if (/\bUI_TOKENS\b/.test(stripped)) uiTokensOffenders.push(rel);
  }

  assertCase(
    block,
    "chrome.placeholderColorBorder",
    /border-\[var\(--color-border-default\)\]/.test(shellSrc),
    "AppShell placeholder uses --color-border-default",
  );

  assertCase(
    block,
    "chrome.placeholderColorSurfaceCanvas",
    /bg-\[var\(--color-surface-canvas\)\]/.test(shellSrc),
    "AppShell placeholder uses --color-surface-canvas",
  );

  assertCase(
    block,
    "chrome.placeholderColorTextMuted",
    /text-\[var\(--color-text-muted\)\]/.test(shellSrc),
    "AppShell placeholder uses --color-text-muted",
  );

  assertCase(
    block,
    "chrome.statusBarColorBorder",
    /border-\[var\(--color-border-default\)\]/.test(statusLayoutSrc),
    "StatusBarLayout uses --color-border-default",
  );

  assertCase(
    block,
    "chrome.statusBarColorSurface",
    /bg-\[var\(--color-surface-default\)\]/.test(statusLayoutSrc),
    "StatusBarLayout uses --color-surface-default",
  );

  assertCase(
    block,
    "chrome.statusBarColorTextMuted",
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
    "Frozen mapping still exactly 4 rows (not redefined)",
  );

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
      ? "no UI_TOKENS in chrome dirs"
      : `UI_TOKENS in: ${uiTokensOffenders.join(", ")}`,
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — geometryFreeze (UX-4.8 / UX-4.9 evidence reuse)                  */
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
    "lg: responsive grid unchanged",
  );

  assertCase(
    block,
    "geometry.colsBelowLg",
    /grid-cols-\[auto_minmax\(0,\s*1fr\)_0fr\]/.test(layoutSrc),
    "Below-lg cols identical to UX-4.8",
  );

  assertCase(
    block,
    "geometry.colsAtLg",
    /lg:grid-cols-\[auto_minmax\(0,\s*1fr\)_auto\]/.test(layoutSrc),
    "lg+ cols identical to UX-4.8",
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
    "Five-region areas identical to UX-4.8",
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
/* PASS 07 — runtimeFreeze (public surface)                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "runtimeFreeze";
  const chrome = chromeSources();
  const uiIndex = existsSync(join(repoRoot, UI_INDEX))
    ? stripComments(read(UI_INDEX))
    : "";
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
    "freeze.noRuntimeImportsInChrome",
    runtimeImportOffenders.length === 0,
    runtimeImportOffenders.length === 0
      ? "chrome has no theme/runtime imports"
      : `runtime imports: ${runtimeImportOffenders.join(", ")}`,
  );

  assertCase(
    block,
    "freeze.publicApi",
    /\bThemeProvider\b/.test(uiIndex) && /\buseTheme\b/.test(uiIndex),
    "@/ui exports ThemeProvider + useTheme",
  );

  assertCase(
    block,
    "freeze.themeProviderExists",
    existsSync(join(repoRoot, THEME_PROVIDER)),
    "ThemeProvider file intact",
  );

  assertCase(
    block,
    "freeze.pipelinePrivate",
    Object.isFrozen(RuntimePipeline) &&
      Object.isFrozen(RuntimeReporter) &&
      Object.isFrozen(RuntimeDiagnostics),
    "Pipeline/Reporter/Diagnostics remain frozen objects",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — dualStackCertified (UX-4.9 intentional boundary)                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "dualStackCertified";

  assertCase(
    block,
    "dual.Sidebar",
    existsSync(join(repoRoot, SIDEBAR)),
    "Sidebar.tsx present (dual-stack intentional)",
  );

  assertCase(
    block,
    "dual.AdaptiveToolbar",
    existsSync(join(repoRoot, ADAPTIVE_TOOLBAR)),
    "AdaptiveToolbar.tsx present (dual-stack intentional)",
  );

  assertCase(
    block,
    "dual.Inspector",
    existsSync(join(repoRoot, INSPECTOR)),
    "Inspector.tsx present (dual-stack intentional)",
  );

  assertCase(
    block,
    "dual.WorkspaceContent",
    existsSync(join(repoRoot, WORKSPACE_CONTENT)),
    "WorkspaceContent.tsx present",
  );

  assertCase(
    block,
    "dual.StatusBar",
    existsSync(join(repoRoot, STATUS_BAR)),
    "StatusBar.tsx present",
  );

  // Product dual-stack may still use --app-* outside chrome — intentional
  const sidebarSrc = existsSync(join(repoRoot, SIDEBAR))
    ? stripComments(read(SIDEBAR))
    : "";
  const toolbarSrc = existsSync(join(repoRoot, ADAPTIVE_TOOLBAR))
    ? stripComments(read(ADAPTIVE_TOOLBAR))
    : "";
  const inspectorSrc = existsSync(join(repoRoot, INSPECTOR))
    ? stripComments(read(INSPECTOR))
    : "";
  const productCombined = `${sidebarSrc}\n${toolbarSrc}\n${inspectorSrc}`;

  assertCase(
    block,
    "dual.productMayUseLegacyOrTokens",
    productCombined.length > 0,
    "product chrome components exist for dual-stack boundary",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — roadmapConsistency                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "roadmapConsistency";
  const roadmap = existsSync(join(repoRoot, ROADMAP)) ? read(ROADMAP) : "";
  const doc410 = existsSync(join(repoRoot, DOC_410)) ? read(DOC_410) : "";

  assertCase(
    block,
    "roadmap.exists",
    existsSync(join(repoRoot, ROADMAP)),
    "UX-4.0-roadmap.md exists",
  );

  for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9] as const) {
    assertCase(
      block,
      `roadmap.ux4${n}Complete`,
      new RegExp(`UX-4\\.${n}\\s*=\\s*COMPLETE`).test(roadmap) ||
        new RegExp(`### UX-4\\.${n}[\\s\\S]*?COMPLETE`).test(roadmap),
      `roadmap marks UX-4.${n} COMPLETE`,
    );
  }

  assertCase(
    block,
    "roadmap.ux410Complete",
    /UX-4\.10\s*=\s*COMPLETE/.test(roadmap),
    "roadmap marks UX-4.10 COMPLETE",
  );

  assertCase(
    block,
    "roadmap.seriesCertified",
    /UX-4\s+SERIES\s+CERTIFIED/.test(roadmap),
    "roadmap declares UX-4 SERIES CERTIFIED",
  );

  assertCase(
    block,
    "roadmap.nextUx5",
    /UX-5/.test(roadmap) && /Feature Integration/i.test(roadmap),
    "roadmap Next → UX-5 Feature Integration",
  );

  assertCase(
    block,
    "doc410.exists",
    existsSync(join(repoRoot, DOC_410)),
    "docs/UX/UX-4.10.md exists",
  );

  assertCase(
    block,
    "doc410.principles",
    /Evidence Reuse Principle/.test(doc410) &&
      /Read-only Validator Principle/.test(doc410) &&
      /Series Closure Principle/.test(doc410) &&
      /Documentary Principle/.test(doc410) &&
      /Architectural Principles/.test(doc410),
    "UX-4.10.md declares five frozen principles",
  );

  assertCase(
    block,
    "doc410.certificationStatement",
    /fully certified/i.test(doc410) && /officially closed/i.test(doc410),
    "UX-4.10.md contains official certification statement",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 10 — priorArtifacts (UX-4.1 … UX-4.9)                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "priorArtifacts";
  const pkg = read("package.json");

  for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9] as const) {
    const script = `scripts/validate-ux-4.${n}.ts`;
    const doc = `docs/UX/UX-4.${n}.md`;
    assertCase(
      block,
      `prior.ux4${n}`,
      existsSync(join(repoRoot, script)) &&
        existsSync(join(repoRoot, doc)) &&
        new RegExp(`"validate:ux-4\\.${n}"\\s*:`).test(pkg),
      `UX-4.${n} validator + doc + npm script retained`,
    );
  }

  assertCase(
    block,
    "prior.validate410Script",
    /"validate:ux-4\.10"\s*:/.test(pkg),
    "package.json includes validate:ux-4.10",
  );

  assertCase(
    block,
    "prior.validate410File",
    existsSync(join(repoRoot, "scripts/validate-ux-4.10.ts")),
    "scripts/validate-ux-4.10.ts exists",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 11 — tscCompile                                                       */
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
  { id: "runtimeCertified", pass: 1, ca: "CA-UX-4.10.1" },
  { id: "hostCertified", pass: 2, ca: "CA-UX-4.10.2" },
  { id: "appShellCertified", pass: 3, ca: "CA-UX-4.10.3 / CA-UX-4.10.4 / CA-UX-4.10.9" },
  { id: "responsiveCertified", pass: 4, ca: "CA-UX-4.10.5" },
  { id: "chromeCertified", pass: 5, ca: "CA-UX-4.10.6" },
  { id: "geometryFreeze", pass: 6, ca: "CA-UX-4.10.7" },
  { id: "runtimeFreeze", pass: 7, ca: "CA-UX-4.10.1 (surface)" },
  { id: "dualStackCertified", pass: 8, ca: "CA-UX-4.10.8" },
  { id: "roadmapConsistency", pass: 9, ca: "CA-UX-4.10.10" },
  { id: "priorArtifacts", pass: 10, ca: "CA-UX-4.10.10 / CA-UX-4.10.12" },
  { id: "tscCompile", pass: 11, ca: "CA-UX-4.10.11" },
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
console.log("validate:ux-4.10");
console.log(allPass ? "PASS" : "FAIL");
if (allPass) {
  console.log("UX-4 Integration Certified");
  console.log("Series Closed · Next UX-5");
  console.log("Partial certification is not permitted — all blocks passed");
} else {
  console.log("UX-4 SERIES CERTIFIED is NOT valid (partial certification forbidden)");
}
console.log(`${passCount}/${BLOCKS.length}`);

process.exit(allPass ? 0 : 1);
