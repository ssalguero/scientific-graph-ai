/**
 * UX-4.8 — Responsive + Docking Integration gate.
 *
 * Blocks:
 * responsiveLayout · sidebarResponsive · inspectorResponsive · noResponsiveLogic
 * dockingReuse · noDockRewrite · appShellRoot · runtimeFreeze · priorGate · tscCompile
 *
 * Principles:
 * - Normalize, don't invent — no second responsive system
 * - Tailwind responsive variants only inside app-shell/**
 * - Inspector Region owns only the grid track; Inspector owns width/visibility
 * - Docking reused unchanged
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
  | "responsiveLayout"
  | "sidebarResponsive"
  | "inspectorResponsive"
  | "noResponsiveLogic"
  | "dockingReuse"
  | "noDockRewrite"
  | "appShellRoot"
  | "runtimeFreeze"
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

const HOST_PATH = "src/app/theme-runtime-host.tsx";
const LAYOUT_PATH = "src/app/layout.tsx";
const UI_INDEX = "src/ui/index.ts";
const RUNTIME_INDEX = "src/ui/theme/runtime/index.ts";
const APP_SHELL = "src/components/app-shell/AppShell.tsx";
const APP_SHELL_LAYOUT = "src/components/app-shell/AppShellLayout.tsx";
const APP_SHELL_DIR = "src/components/app-shell";
const WORKSPACE_LAYOUT = "src/components/workspace/WorkspaceLayout.tsx";
const WORKSPACE_CONTENT = "src/components/workspace/WorkspaceContent.tsx";
const WORKSPACE_PANELS = "src/components/workspace/WorkspacePanels.tsx";
const SIDEBAR = "src/components/ui/sidebar/Sidebar.tsx";
const ADAPTIVE_TOOLBAR = "src/components/toolbar/AdaptiveToolbar.tsx";
const INSPECTOR = "src/components/inspector/Inspector.tsx";
const STATUS_BAR = "src/components/status-bar/StatusBar.tsx";
const PAGE = "src/app/page.tsx";
const DOCK_ROOT = "src/components/docking/DockRoot.tsx";
const DOCK_ZONE = "src/components/docking/DockZone.tsx";
const DOCK_FEATURES = "src/components/docking/dockFeatures.ts";
const FLOATING_LAYER = "src/components/windows/FloatingWindowLayer.tsx";
const FLOATING_BRIDGE = "src/components/windows/FloatingWindowBridge.tsx";
const WINDOW_MANAGER = "src/components/windows/WindowManager.tsx";

/* -------------------------------------------------------------------------- */
/* PASS 01 — responsiveLayout                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "responsiveLayout";
  const layoutSrc = existsSync(join(repoRoot, APP_SHELL_LAYOUT))
    ? stripComments(read(APP_SHELL_LAYOUT))
    : "";

  assertCase(
    block,
    "layout.exists",
    existsSync(join(repoRoot, APP_SHELL_LAYOUT)),
    "AppShellLayout.tsx exists",
  );

  assertCase(
    block,
    "layout.tailwindLgBreakpoint",
    /\blg:grid-cols-\[/.test(layoutSrc),
    "AppShellLayout uses Tailwind lg: responsive grid variant",
  );

  assertCase(
    block,
    "layout.sidebarTrackAuto",
    /grid-cols-\[auto_/.test(layoutSrc) &&
      /lg:grid-cols-\[auto_/.test(layoutSrc),
    "Sidebar column track remains auto at all breakpoints",
  );

  assertCase(
    block,
    "layout.workspacePriority",
    /minmax\(0,\s*1fr\)/.test(layoutSrc),
    "Workspace track keeps minmax(0,1fr) priority",
  );

  assertCase(
    block,
    "layout.inspectorTrackAutoLg",
    /lg:grid-cols-\[auto_minmax\(0,\s*1fr\)_auto\]/.test(layoutSrc),
    "Inspector track is content-driven auto at lg+",
  );

  assertCase(
    block,
    "layout.inspectorCollapsedBelowLg",
    /grid-cols-\[auto_minmax\(0,\s*1fr\)_0fr\]/.test(layoutSrc) ||
      /grid-cols-\[auto_minmax\(0,\s*1fr\)_0px\]/.test(layoutSrc),
    "Inspector track collapses below lg (workspace priority)",
  );

  assertCase(
    block,
    "layout.noInspectorFloor280",
    !/minmax\(280px/.test(layoutSrc),
    "No minmax(280px,…) floor on inspector track",
  );

  assertCase(
    block,
    "layout.fiveAreasRetained",
    /toolbar_toolbar_toolbar/.test(layoutSrc) &&
      /sidebar_workspace_inspector/.test(layoutSrc) &&
      /statusBar_statusBar_statusBar/.test(layoutSrc),
    "Five-region grid template areas retained",
  );

  assertCase(
    block,
    "layout.threeRowsRetained",
    /grid-rows-\[auto_minmax\(0,\s*1fr\)_auto\]/.test(layoutSrc),
    "Three-row grid structure retained",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — sidebarResponsive                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "sidebarResponsive";
  const sidebarSrc = existsSync(join(repoRoot, SIDEBAR))
    ? stripComments(read(SIDEBAR))
    : "";
  const shellSrc = existsSync(join(repoRoot, APP_SHELL))
    ? stripComments(read(APP_SHELL))
    : "";
  const layoutSrc = existsSync(join(repoRoot, APP_SHELL_LAYOUT))
    ? stripComments(read(APP_SHELL_LAYOUT))
    : "";
  const shellCombined = `${shellSrc}\n${layoutSrc}`;

  assertCase(
    block,
    "sidebar.ownsMobileMq",
    /SIDEBAR_MOBILE_MQ/.test(sidebarSrc) &&
      /max-width:\s*1023px/.test(sidebarSrc),
    "Sidebar still owns SIDEBAR_MOBILE_MQ (max-width: 1023px)",
  );

  assertCase(
    block,
    "sidebar.ownsDrawer",
    /overlayOpen/.test(sidebarSrc) && /matchMedia/.test(sidebarSrc),
    "Sidebar still owns mobile drawer / matchMedia",
  );

  assertCase(
    block,
    "appShell.noDrawer",
    !/SIDEBAR_MOBILE_MQ/.test(shellCombined) &&
      !/overlayOpen/.test(shellCombined) &&
      !/mobileTrigger/.test(shellCombined),
    "AppShell does not implement Sidebar drawer",
  );

  assertCase(
    block,
    "sidebarRegion.boundsOnly",
    /APP_SHELL_REGIONS\.sidebar[\s\S]{0,200}overflow-hidden/.test(shellSrc) &&
      !/APP_SHELL_REGIONS\.sidebar[\s\S]{0,200}overflow-auto/.test(shellSrc) &&
      !/minmax\(240px/.test(layoutSrc),
    "Sidebar Region bounds only (overflow-hidden, no 240px floor)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — inspectorResponsive                                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "inspectorResponsive";
  const shellSrc = existsSync(join(repoRoot, APP_SHELL))
    ? stripComments(read(APP_SHELL))
    : "";
  const layoutSrc = existsSync(join(repoRoot, APP_SHELL_LAYOUT))
    ? stripComments(read(APP_SHELL_LAYOUT))
    : "";
  const pageSrc = existsSync(join(repoRoot, PAGE))
    ? stripComments(read(PAGE))
    : "";

  assertCase(
    block,
    "appShell.noInspectorWidth",
    !/APP_SHELL_REGIONS\.inspector[\s\S]{0,250}w-\[/.test(shellSrc) &&
      !/APP_SHELL_REGIONS\.inspector[\s\S]{0,250}width:/.test(shellSrc) &&
      !/\bwidth=\{/.test(shellSrc),
    "AppShell does not control inspector width",
  );

  assertCase(
    block,
    "appShell.noInspectorVisibility",
    !/APP_SHELL_REGIONS\.inspector[\s\S]{0,250}visible=/.test(shellSrc) &&
      !/\bvisible=\{/.test(shellSrc),
    "AppShell does not control inspector visibility",
  );

  assertCase(
    block,
    "appShell.noInspectorImport",
    !/from\s+["']@\/components\/inspector/.test(shellSrc),
    "AppShell does not create/import Inspector",
  );

  assertCase(
    block,
    "inspector.frozenSubtree",
    /visible=\{false\}/.test(pageSrc) &&
      /INSPECTOR_TOKENS\.defaultWidth/.test(pageSrc),
    "page Inspector subtree remains visible={false} (ownership intact)",
  );

  assertCase(
    block,
    "inspector.trackOnly",
    /lg:grid-cols-\[auto_minmax\(0,\s*1fr\)_auto\]/.test(layoutSrc) &&
      !/minmax\(280px/.test(layoutSrc),
    "Inspector Region owns grid track only (auto, no 280px floor)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — noResponsiveLogic                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noResponsiveLogic";
  const offenders: string[] = [];
  const forbidden = [
    { re: /\bmatchMedia\b/, label: "matchMedia" },
    { re: /\bResizeObserver\b/, label: "ResizeObserver" },
    { re: /\buseMediaQuery\b/, label: "useMediaQuery" },
    { re: /\bwindow\.innerWidth\b/, label: "window.innerWidth" },
    {
      re: /addEventListener\s*\(\s*["']resize["']/,
      label: 'addEventListener("resize")',
    },
    { re: /\buseState\b/, label: "useState" },
    { re: /\buseEffect\b/, label: "useEffect" },
  ] as const;

  for (const f of walkFiles(join(repoRoot, APP_SHELL_DIR))) {
    const rel = relative(repoRoot, f).replace(/\\/g, "/");
    const src = stripComments(readFileSync(f, "utf8"));
    for (const { re, label } of forbidden) {
      if (re.test(src)) offenders.push(`${rel}:${label}`);
    }
  }

  assertCase(
    block,
    "appShell.noJsViewportLogic",
    offenders.length === 0,
    offenders.length === 0
      ? "app-shell/** has no JS viewport / state hooks"
      : `forbidden: ${offenders.join(", ")}`,
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — dockingReuse                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "dockingReuse";
  const pageSrc = existsSync(join(repoRoot, PAGE))
    ? stripComments(read(PAGE))
    : "";
  const panelsSrc = existsSync(join(repoRoot, WORKSPACE_PANELS))
    ? stripComments(read(WORKSPACE_PANELS))
    : "";
  const shellSrc = existsSync(join(repoRoot, APP_SHELL))
    ? stripComments(read(APP_SHELL))
    : "";
  const layoutSrc = existsSync(join(repoRoot, APP_SHELL_LAYOUT))
    ? stripComments(read(APP_SHELL_LAYOUT))
    : "";
  const shellCombined = `${shellSrc}\n${layoutSrc}`;

  assertCase(
    block,
    "exists.DockRoot",
    existsSync(join(repoRoot, DOCK_ROOT)),
    "DockRoot.tsx intact",
  );

  assertCase(
    block,
    "exists.DockZone",
    existsSync(join(repoRoot, DOCK_ZONE)),
    "DockZone.tsx intact",
  );

  assertCase(
    block,
    "exists.FloatingWindowLayer",
    existsSync(join(repoRoot, FLOATING_LAYER)),
    "FloatingWindowLayer.tsx intact",
  );

  assertCase(
    block,
    "exists.WindowManager",
    existsSync(join(repoRoot, WINDOW_MANAGER)),
    "WindowManager.tsx intact",
  );

  assertCase(
    block,
    "page.mountsDockTree",
    /<DockRoot\b/.test(pageSrc) &&
      /<DockZone\b/.test(pageSrc) &&
      /<DockPanel\b/.test(pageSrc),
    "page still mounts DockRoot → DockZone → DockPanel",
  );

  assertCase(
    block,
    "panels.mountsFloatingWindowBridge",
    /<FloatingWindowBridge\s*\/>/.test(panelsSrc) ||
      /<FloatingWindowBridge\b/.test(panelsSrc),
    "WorkspacePanels still mounts FloatingWindowBridge",
  );

  assertCase(
    block,
    "appShell.noDockOrWindowImports",
    !/DockRoot|DockZone|DockPanel|FloatingWindow|WindowManager/.test(
      shellCombined,
    ),
    "AppShell has zero dock/window imports",
  );

  assertCase(
    block,
    "page.mountsWindowManager",
    /<WindowManager\b/.test(pageSrc),
    "page still mounts WindowManager at root",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — noDockRewrite                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noDockRewrite";
  const featuresSrc = existsSync(join(repoRoot, DOCK_FEATURES))
    ? stripComments(read(DOCK_FEATURES))
    : "";

  assertCase(
    block,
    "no.DockRootV2",
    !existsSync(join(repoRoot, "src/components/docking/DockRootV2.tsx")) &&
      !existsSync(join(repoRoot, "src/components/app-shell/DockRoot.tsx")) &&
      !existsSync(join(repoRoot, "src/components/app-shell/DockRootV2.tsx")),
    "no DockRootV2 / alternate DockRoot under app-shell",
  );

  assertCase(
    block,
    "no.ResponsiveProvider",
    !existsSync(join(repoRoot, "src/components/app-shell/ResponsiveProvider.tsx")) &&
      !existsSync(join(repoRoot, "src/components/docking/ResponsiveProvider.tsx")) &&
      !existsSync(join(repoRoot, "src/components/ResponsiveProvider.tsx")),
    "no ResponsiveProvider",
  );

  assertCase(
    block,
    "no.newDockProviderFile",
    !existsSync(join(repoRoot, "src/components/app-shell/DockProvider.tsx")) &&
      !existsSync(join(repoRoot, "src/components/docking/DockProviderV2.tsx")),
    "no new DockProvider under app-shell / DockProviderV2",
  );

  assertCase(
    block,
    "dockFeatures.stillOff",
    /registration:\s*false/.test(featuresSrc) &&
      /visibility:\s*false/.test(featuresSrc) &&
      /layout:\s*false/.test(featuresSrc) &&
      /slots:\s*false/.test(featuresSrc),
    "DOCK_FEATURES remain all false",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — appShellRoot                                                     */
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
    "Sidebar.tsx still present",
  );

  assertCase(
    block,
    "intact.AdaptiveToolbar",
    existsSync(join(repoRoot, ADAPTIVE_TOOLBAR)),
    "AdaptiveToolbar.tsx still present",
  );

  assertCase(
    block,
    "intact.Inspector",
    existsSync(join(repoRoot, INSPECTOR)),
    "Inspector.tsx still present",
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

  assertCase(
    block,
    "intact.FloatingWindowBridge",
    existsSync(join(repoRoot, FLOATING_BRIDGE)),
    "FloatingWindowBridge.tsx still present",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — runtimeFreeze                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "runtimeFreeze";
  const uiIndex = existsSync(join(repoRoot, UI_INDEX))
    ? stripComments(read(UI_INDEX))
    : "";
  const runtimeIndex = existsSync(join(repoRoot, RUNTIME_INDEX))
    ? stripComments(read(RUNTIME_INDEX))
    : "";

  assertCase(
    block,
    "public.noPipeline",
    !/\bRuntimePipeline\b/.test(uiIndex) &&
      !/\bRuntimeDiagnostics\b/.test(uiIndex) &&
      !/\bRuntimeReporter\b/.test(uiIndex),
    "@/ui does not export diagnostics/pipeline/reporter",
  );

  assertCase(
    block,
    "runtime.keepsPrivate",
    !/\bRuntimePipeline\b/.test(runtimeIndex) &&
      !/\bRuntimeReporter\b/.test(runtimeIndex) &&
      !/\bRuntimeDiagnostics\b/.test(runtimeIndex),
    "runtime/index.ts keeps diagnostics private",
  );

  assertCase(
    block,
    "public.exportsThemeProvider",
    /\bThemeProvider\b/.test(uiIndex) && /\buseTheme\b/.test(uiIndex),
    "@/ui still exports ThemeProvider + useTheme",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — priorGate (UX-4.7 … UX-4.1 inline)                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "priorGate";
  const pkg = read("package.json");

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
/* PASS 10 — tscCompile                                                       */
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
  { id: "responsiveLayout", pass: 1, ca: "CA-UX-4.8.1" },
  { id: "sidebarResponsive", pass: 2, ca: "CA-UX-4.8.2" },
  { id: "inspectorResponsive", pass: 3, ca: "CA-UX-4.8.3" },
  { id: "noResponsiveLogic", pass: 4, ca: "layout-only / Tailwind-only" },
  { id: "dockingReuse", pass: 5, ca: "CA-UX-4.8.4 / CA-UX-4.8.5 / CA-UX-4.8.10" },
  { id: "noDockRewrite", pass: 6, ca: "CA-UX-4.8.9 / CA-UX-4.8.10" },
  { id: "appShellRoot", pass: 7, ca: "CA-UX-4.8.6 / CA-UX-4.8.7" },
  { id: "runtimeFreeze", pass: 8, ca: "CA-UX-4.8.8" },
  { id: "priorGate", pass: 9, ca: "CA-UX-4.8.12 (prior inline)" },
  { id: "tscCompile", pass: 10, ca: "CA-UX-4.8.11" },
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
console.log("validate:ux-4.8");
console.log(allPass ? "PASS" : "FAIL");
if (allPass) {
  console.log("Responsive + Docking Integration");
  console.log("Normalize, don't invent · track-only geometry");
  console.log("Docking reused · layout-only · no JS viewport logic");
}
console.log(`${passCount}/${BLOCKS.length}`);

process.exit(allPass ? 0 : 1);
