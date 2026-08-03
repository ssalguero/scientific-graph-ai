/**
 * UX-4.5 — Workspace Integration gate.
 *
 * Composition certification + ownership normalization.
 * No structural relocation.
 *
 * Blocks:
 * workspaceRegion · workspaceIdentity · singleWorkspace
 * windowManagerIntact · floatingWindowsIntact · workspaceOwnership
 * workspaceBridge · toolbarSidebarIntact · runtimeFreeze
 * priorGate · tscCompile
 *
 * Principles:
 * - Workspace Region owns overlay containing block (relative)
 * - AppShell bounds only (overflow-hidden); Workspace owns scroll
 * - AppShell does not import/create WorkspaceContent — slot only
 * - WindowManager remains at page root
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
  | "workspaceRegion"
  | "workspaceIdentity"
  | "singleWorkspace"
  | "windowManagerIntact"
  | "floatingWindowsIntact"
  | "workspaceOwnership"
  | "workspaceBridge"
  | "toolbarSidebarIntact"
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
const PAGE_PATH = "src/app/page.tsx";
const UI_INDEX = "src/ui/index.ts";
const RUNTIME_INDEX = "src/ui/theme/runtime/index.ts";
const APP_SHELL = "src/components/app-shell/AppShell.tsx";
const APP_SHELL_LAYOUT = "src/components/app-shell/AppShellLayout.tsx";
const APP_SHELL_DIR = "src/components/app-shell";
const WORKSPACE_LAYOUT = "src/components/workspace/WorkspaceLayout.tsx";
const WORKSPACE_CONTENT = "src/components/workspace/WorkspaceContent.tsx";
const WORKSPACE_PANELS = "src/components/workspace/WorkspacePanels.tsx";
const WORKSPACE_TYPES = "src/components/workspace/types.ts";
const SIDEBAR = "src/components/ui/sidebar/Sidebar.tsx";
const ADAPTIVE_TOOLBAR = "src/components/toolbar/AdaptiveToolbar.tsx";
const WINDOW_MANAGER = "src/components/windows/WindowManager.tsx";
const FLOATING_LAYER = "src/components/windows/FloatingWindowLayer.tsx";
const FLOATING_BRIDGE = "src/components/windows/FloatingWindowBridge.tsx";

/* -------------------------------------------------------------------------- */
/* PASS 01 — workspaceRegion                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "workspaceRegion";
  const shellSrc = existsSync(join(repoRoot, APP_SHELL))
    ? stripComments(read(APP_SHELL))
    : "";

  assertCase(
    block,
    "region.attrWorkspace",
    /APP_SHELL_REGIONS\.workspace/.test(shellSrc) &&
      /APP_SHELL_REGION_ATTR|data-app-shell-region/.test(shellSrc),
    "AppShell applies data-app-shell-region for workspace",
  );

  assertCase(
    block,
    "region.wrapsReceivedSlot",
    /APP_SHELL_REGIONS\.workspace[\s\S]{0,300}\{workspace\}/.test(shellSrc),
    "Workspace Region wraps the received workspace slot",
  );

  // Extract workspace region className near APP_SHELL_REGIONS.workspace
  const regionMatch = shellSrc.match(
    /APP_SHELL_REGIONS\.workspace[\s\S]{0,200}className="([^"]+)"/,
  );
  const regionClass = regionMatch?.[1] ?? "";

  assertCase(
    block,
    "region.relativeContainingBlock",
    /\brelative\b/.test(regionClass),
    "Workspace Region keeps relative (overlay containing block)",
  );

  assertCase(
    block,
    "region.overflowHidden",
    /\boverflow-hidden\b/.test(regionClass) &&
      !/\boverflow-auto\b/.test(regionClass),
    "Workspace Region bounds with overflow-hidden (not overflow-auto)",
  );

  assertCase(
    block,
    "region.minH0",
    /\bmin-h-0\b/.test(regionClass),
    "Workspace Region has min-h-0",
  );

  assertCase(
    block,
    "region.hFullMinW0",
    /\bh-full\b/.test(regionClass) && /\bmin-w-0\b/.test(regionClass),
    "Workspace Region has h-full min-w-0",
  );

  assertCase(
    block,
    "region.noFlex",
    !/\bflex\b/.test(regionClass),
    "Workspace Region does not use flex (overlay siblings safe)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — workspaceIdentity                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "workspaceIdentity";
  const shellFiles = walkFiles(join(repoRoot, APP_SHELL_DIR));
  const hits: string[] = [];
  for (const f of shellFiles) {
    const src = stripComments(readFileSync(f, "utf8"));
    if (
      /WorkspaceContent/.test(src) ||
      /from\s+["']@\/components\/workspace/.test(src) ||
      /<WorkspaceContent\b/.test(src)
    ) {
      hits.push(relative(repoRoot, f).replace(/\\/g, "/"));
    }
  }

  assertCase(
    block,
    "appShell.noWorkspaceContentImport",
    hits.length === 0,
    hits.length === 0
      ? "app-shell does not import or instantiate WorkspaceContent"
      : `WorkspaceContent reference in: ${hits.join(", ")}`,
  );

  const shellSrc = existsSync(join(repoRoot, APP_SHELL))
    ? stripComments(read(APP_SHELL))
    : "";
  assertCase(
    block,
    "appShell.rendersSlotOnly",
    /\{workspace\}/.test(shellSrc) && !/<WorkspaceContent\b/.test(shellSrc),
    "AppShell renders received {workspace} slot only",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — singleWorkspace                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "singleWorkspace";

  assertCase(
    block,
    "exists.WorkspaceContent",
    existsSync(join(repoRoot, WORKSPACE_CONTENT)),
    "WorkspaceContent.tsx exists",
  );

  assertCase(
    block,
    "no.WorkspaceV2",
    !existsSync(join(repoRoot, "src/components/workspace/WorkspaceV2.tsx")) &&
      !existsSync(join(repoRoot, "src/components/workspace/WorkspaceContentV2.tsx")) &&
      !existsSync(join(repoRoot, "src/components/app-shell/WorkspaceContent.tsx")) &&
      !existsSync(join(repoRoot, "src/components/app-shell/Workspace.tsx")),
    "no alternate Workspace / WorkspaceV2 mounts",
  );

  const pageSrc = existsSync(join(repoRoot, PAGE_PATH))
    ? stripComments(read(PAGE_PATH))
    : "";
  const mountCount = (pageSrc.match(/<WorkspaceContent\b/g) ?? []).length;
  assertCase(
    block,
    "page.singleMount",
    mountCount === 1,
    mountCount === 1
      ? "page.tsx mounts WorkspaceContent exactly once"
      : `WorkspaceContent mounts in page.tsx: ${mountCount}`,
  );

  const bridgeSrc = existsSync(join(repoRoot, WORKSPACE_LAYOUT))
    ? stripComments(read(WORKSPACE_LAYOUT))
    : "";
  assertCase(
    block,
    "bridge.workspaceSlotOnce",
    (bridgeSrc.match(/\{workspace\}/g) ?? []).length >= 1 &&
      /workspace=\{\s*<>[\s\S]*\{workspace\}[\s\S]*\{panels\}/.test(bridgeSrc),
    "WorkspaceLayout composes workspace + panels into AppShell once",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — windowManagerIntact                                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "windowManagerIntact";

  assertCase(
    block,
    "exists.WindowManager",
    existsSync(join(repoRoot, WINDOW_MANAGER)),
    "WindowManager.tsx exists",
  );

  const pageSrc = existsSync(join(repoRoot, PAGE_PATH))
    ? stripComments(read(PAGE_PATH))
    : "";
  assertCase(
    block,
    "page.mountsWindowManager",
    /<WindowManager\b/.test(pageSrc) &&
      /from\s+["']@\/components\/windows["']/.test(pageSrc),
    "page.tsx still mounts WindowManager at Home root",
  );

  const shellSrc = existsSync(join(repoRoot, APP_SHELL))
    ? stripComments(read(APP_SHELL))
    : "";
  const bridgeSrc = existsSync(join(repoRoot, WORKSPACE_LAYOUT))
    ? stripComments(read(WORKSPACE_LAYOUT))
    : "";

  assertCase(
    block,
    "appShell.noWindowManagerImport",
    !/WindowManager/.test(shellSrc) &&
      !/from\s+["']@\/components\/windows/.test(shellSrc),
    "AppShell does not import WindowManager",
  );

  assertCase(
    block,
    "bridge.noWindowManagerImport",
    !/WindowManager/.test(bridgeSrc) &&
      !/from\s+["']@\/components\/windows/.test(bridgeSrc),
    "WorkspaceLayout does not import WindowManager",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — floatingWindowsIntact                                            */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "floatingWindowsIntact";

  assertCase(
    block,
    "exists.FloatingWindowLayer",
    existsSync(join(repoRoot, FLOATING_LAYER)),
    "FloatingWindowLayer.tsx exists",
  );

  assertCase(
    block,
    "exists.FloatingWindowBridge",
    existsSync(join(repoRoot, FLOATING_BRIDGE)),
    "FloatingWindowBridge.tsx exists",
  );

  const panelsSrc = existsSync(join(repoRoot, WORKSPACE_PANELS))
    ? stripComments(read(WORKSPACE_PANELS))
    : "";
  assertCase(
    block,
    "panels.mountsFloatingWindowBridge",
    /<FloatingWindowBridge\s*\/>/.test(panelsSrc) ||
      /<FloatingWindowBridge\b/.test(panelsSrc),
    "WorkspacePanels still mounts FloatingWindowBridge",
  );

  const bridgeSrc = existsSync(join(repoRoot, WORKSPACE_LAYOUT))
    ? stripComments(read(WORKSPACE_LAYOUT))
    : "";
  assertCase(
    block,
    "bridge.panelsInWorkspaceSlot",
    /\{panels\}/.test(bridgeSrc) &&
      /workspace=\{\s*<>[\s\S]*\{workspace\}[\s\S]*\{panels\}/.test(bridgeSrc),
    "panels remain composed into Workspace Region via bridge",
  );

  const shellSrc = existsSync(join(repoRoot, APP_SHELL))
    ? stripComments(read(APP_SHELL))
    : "";
  assertCase(
    block,
    "appShell.noFloatingWindowImport",
    !/FloatingWindow/.test(shellSrc),
    "AppShell does not import FloatingWindow*",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — workspaceOwnership                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "workspaceOwnership";
  const contentSrc = existsSync(join(repoRoot, WORKSPACE_CONTENT))
    ? stripComments(read(WORKSPACE_CONTENT))
    : "";
  const shellSrc = existsSync(join(repoRoot, APP_SHELL))
    ? stripComments(read(APP_SHELL))
    : "";

  assertCase(
    block,
    "content.keepsProviders",
    /WorkspaceModeProvider/.test(contentSrc) &&
      /PanelProvider/.test(contentSrc) &&
      /PanelResizeProvider/.test(contentSrc) &&
      /ActivePanelProvider/.test(contentSrc) &&
      /WorkspaceBodyLayout/.test(contentSrc),
    "WorkspaceContent retains providers + WorkspaceBodyLayout",
  );

  assertCase(
    block,
    "content.scrollFill",
    /h-full min-h-0/.test(contentSrc) ||
      /className=\{`\$\{WORKSPACE_TOKENS\.mainColumn\} h-full min-h-0`\}/.test(
        contentSrc,
      ),
    "WorkspaceContent has h-full min-h-0 (scroll owner fill)",
  );

  assertCase(
    block,
    "appShell.layoutOnly",
    !/\buseState\b/.test(shellSrc) &&
      !/\buseEffect\b/.test(shellSrc) &&
      !/\bcreateContext\b/.test(shellSrc) &&
      !/\buseTheme\b/.test(shellSrc),
    "AppShell remains layout-only",
  );

  assertCase(
    block,
    "appShell.noSidebarToolbarImport",
    !/from\s+["']@\/components\/ui\/sidebar/.test(shellSrc) &&
      !/from\s+["']@\/components\/toolbar/.test(shellSrc) &&
      !/<AdaptiveToolbar\b/.test(shellSrc) &&
      !/<Sidebar\b/.test(shellSrc),
    "AppShell does not import Sidebar or AdaptiveToolbar",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — workspaceBridge                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "workspaceBridge";
  const bridgeSrc = existsSync(join(repoRoot, WORKSPACE_LAYOUT))
    ? stripComments(read(WORKSPACE_LAYOUT))
    : "";
  const typesSrc = existsSync(join(repoRoot, WORKSPACE_TYPES))
    ? stripComments(read(WORKSPACE_TYPES))
    : "";

  assertCase(
    block,
    "bridge.mountsAppShell",
    /<AppShell\b/.test(bridgeSrc) &&
      /from\s+["']@\/components\/app-shell["']/.test(bridgeSrc),
    "WorkspaceLayout mounts AppShell as bridge",
  );

  assertCase(
    block,
    "bridge.transparentToolbar",
    /\btoolbar=\{toolbar\}/.test(bridgeSrc),
    "bridge forwards toolbar={toolbar}",
  );

  assertCase(
    block,
    "bridge.transparentSidebar",
    /\bsidebar=\{sidebar\}/.test(bridgeSrc),
    "bridge forwards sidebar={sidebar}",
  );

  assertCase(
    block,
    "bridge.workspacePlusPanels",
    /\{workspace\}/.test(bridgeSrc) && /\{panels\}/.test(bridgeSrc),
    "bridge forwards workspace + panels",
  );

  assertCase(
    block,
    "bridge.noBareMainComposition",
    !/<main[\s>][\s\S]*\{sidebar\}[\s\S]*\{workspace\}[\s\S]*\{panels\}/.test(
      bridgeSrc,
    ),
    "no bare 3-slot <main> composition",
  );

  assertCase(
    block,
    "types.layoutContract",
    /WorkspaceLayoutProps\s*=\s*\{[\s\S]*?\btoolbar\?:\s*ReactNode/.test(
      typesSrc,
    ) &&
      /\bsidebar:\s*ReactNode/.test(typesSrc) &&
      /\bworkspace:\s*ReactNode/.test(typesSrc) &&
      /\bpanels\?:\s*ReactNode/.test(typesSrc),
    "WorkspaceLayoutProps contract preserved",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — toolbarSidebarIntact                                             */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "toolbarSidebarIntact";
  const shellSrc = existsSync(join(repoRoot, APP_SHELL))
    ? stripComments(read(APP_SHELL))
    : "";
  const layoutSrc = existsSync(join(repoRoot, APP_SHELL_LAYOUT))
    ? stripComments(read(APP_SHELL_LAYOUT))
    : "";
  const combined = `${layoutSrc}\n${shellSrc}`;
  const pageSrc = existsSync(join(repoRoot, PAGE_PATH))
    ? stripComments(read(PAGE_PATH))
    : "";

  assertCase(
    block,
    "toolbar.regionWrapsSlot",
    /toolbar\s*!=\s*null[\s\S]{0,400}AppShellRegion[\s\S]{0,200}\{toolbar\}/.test(
      shellSrc,
    ) ||
      /toolbar\s*\?\s*\([\s\S]{0,400}AppShellRegion[\s\S]{0,200}\{toolbar\}/.test(
        shellSrc,
      ),
    "Toolbar Region still wraps received toolbar slot",
  );

  assertCase(
    block,
    "sidebar.regionBounds",
    /APP_SHELL_REGIONS\.sidebar[\s\S]{0,200}overflow-hidden/.test(shellSrc) &&
      !/APP_SHELL_REGIONS\.sidebar[\s\S]{0,200}overflow-auto/.test(shellSrc),
    "Sidebar Region bounds only (overflow-hidden)",
  );

  assertCase(
    block,
    "no.minWidth240Column",
    !/minmax\(240px/.test(combined) &&
      !/min-w-\[240px\]/.test(combined) &&
      !/min-w-\[15rem\]/.test(combined),
    "AppShell does not impose 240px min width on Sidebar column",
  );

  assertCase(
    block,
    "exists.Sidebar",
    existsSync(join(repoRoot, SIDEBAR)),
    "Sidebar.tsx still present",
  );

  assertCase(
    block,
    "exists.AdaptiveToolbar",
    existsSync(join(repoRoot, ADAPTIVE_TOOLBAR)),
    "AdaptiveToolbar.tsx still present",
  );

  assertCase(
    block,
    "page.singleAdaptiveToolbar",
    (pageSrc.match(/<AdaptiveToolbar\b/g) ?? []).length === 1,
    "page still mounts AdaptiveToolbar once",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — runtimeFreeze                                                    */
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
/* PASS 10 — priorGate (UX-4.4 / 4.3 / 4.2 / 4.1 inline)                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "priorGate";
  const pkg = read("package.json");

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
  { id: "workspaceRegion", pass: 1, ca: "CA-UX-4.5.1" },
  { id: "workspaceIdentity", pass: 2, ca: "CA-UX-4.5.5 / ownership" },
  { id: "singleWorkspace", pass: 3, ca: "CA-UX-4.5.2" },
  { id: "windowManagerIntact", pass: 4, ca: "CA-UX-4.5.3" },
  { id: "floatingWindowsIntact", pass: 5, ca: "CA-UX-4.5.4" },
  { id: "workspaceOwnership", pass: 6, ca: "CA-UX-4.5.5 / CA-UX-4.5.6" },
  { id: "workspaceBridge", pass: 7, ca: "CA-UX-4.5.7" },
  { id: "toolbarSidebarIntact", pass: 8, ca: "CA-UX-4.5.8" },
  { id: "runtimeFreeze", pass: 9, ca: "CA-UX-4.5.9" },
  { id: "priorGate", pass: 10, ca: "CA-UX-4.5.12 (prior inline)" },
  { id: "tscCompile", pass: 11, ca: "CA-UX-4.5.11" },
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
console.log("validate:ux-4.5");
console.log(allPass ? "PASS" : "FAIL");
if (allPass) {
  console.log("Workspace Integration");
  console.log("Composition certification · ownership normalization");
  console.log("No structural relocation · AppShell bounds · Workspace owns scroll");
}
console.log(`${passCount}/${BLOCKS.length}`);

process.exit(allPass ? 0 : 1);
