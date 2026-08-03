/**
 * UX-4.6 — Inspector Integration gate.
 *
 * Blocks:
 * inspectorRegion · singleInspector · inspectorIdentity · placeholderRemoved
 * workspaceBridge · appShellRoot · toolbarSidebarWorkspaceIntact
 * runtimeFreeze · priorGate · tscCompile
 *
 * Principles:
 * - Move-only identity preservation — Inspector JSX subtree identity preserved
 * - Inspector owns width and visibility; AppShell owns region bounds and position
 * - WorkspaceLayout forwards inspector transparently
 * - Single Inspector instance
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
  | "inspectorRegion"
  | "singleInspector"
  | "inspectorIdentity"
  | "placeholderRemoved"
  | "workspaceBridge"
  | "appShellRoot"
  | "toolbarSidebarWorkspaceIntact"
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
const WORKSPACE_TYPES = "src/components/workspace/types.ts";
const SIDEBAR = "src/components/ui/sidebar/Sidebar.tsx";
const ADAPTIVE_TOOLBAR = "src/components/toolbar/AdaptiveToolbar.tsx";
const INSPECTOR = "src/components/inspector/Inspector.tsx";
const INSPECTOR_DIR = "src/components/inspector";

/* -------------------------------------------------------------------------- */
/* PASS 01 — inspectorRegion                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "inspectorRegion";
  const shellSrc = existsSync(join(repoRoot, APP_SHELL))
    ? stripComments(read(APP_SHELL))
    : "";

  assertCase(
    block,
    "region.attrInspector",
    /APP_SHELL_REGIONS\.inspector/.test(shellSrc) &&
      /APP_SHELL_REGION_ATTR|data-app-shell-region/.test(shellSrc),
    "AppShell applies data-app-shell-region for inspector",
  );

  assertCase(
    block,
    "region.wrapsReceivedSlot",
    /inspector\s*!=\s*null[\s\S]{0,400}AppShellRegion[\s\S]{0,200}\{inspector\}/.test(
      shellSrc,
    ) ||
      /inspector\s*\?\s*\([\s\S]{0,400}AppShellRegion[\s\S]{0,200}\{inspector\}/.test(
        shellSrc,
      ),
    "Inspector Region wraps the received inspector slot",
  );

  assertCase(
    block,
    "region.boundsOnly",
    /APP_SHELL_REGIONS\.inspector[\s\S]{0,200}overflow-hidden/.test(shellSrc) &&
      !/APP_SHELL_REGIONS\.inspector[\s\S]{0,200}overflow-auto/.test(shellSrc),
    "Inspector Region bounds only (overflow-hidden)",
  );

  assertCase(
    block,
    "region.placeholderWhenAbsent",
    /AppShellRegionPlaceholder[\s\S]{0,120}inspector|APP_SHELL_REGIONS\.inspector[\s\S]{0,80}Inspector/.test(
      shellSrc,
    ),
    "Inspector placeholder retained when slot absent",
  );

  const pageSrc = existsSync(join(repoRoot, PAGE_PATH))
    ? stripComments(read(PAGE_PATH))
    : "";
  assertCase(
    block,
    "page.passesInspectorToLayout",
    /inspector=\{[\s\S]{0,80}<Inspector\b/.test(pageSrc) &&
      /<WorkspaceLayout\b[\s\S]*inspector=\{/.test(pageSrc),
    "page mounts Inspector into WorkspaceLayout.inspector",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — singleInspector                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "singleInspector";

  assertCase(
    block,
    "exists.Inspector",
    existsSync(join(repoRoot, INSPECTOR)),
    "Inspector.tsx exists",
  );

  assertCase(
    block,
    "no.InspectorV2",
    !existsSync(join(repoRoot, "src/components/inspector/InspectorV2.tsx")) &&
      !existsSync(join(repoRoot, "src/components/app-shell/Inspector.tsx")) &&
      !existsSync(join(repoRoot, "src/components/app-shell/InspectorV2.tsx")),
    "no alternate Inspector / InspectorV2 mounts",
  );

  const pageSrc = existsSync(join(repoRoot, PAGE_PATH))
    ? stripComments(read(PAGE_PATH))
    : "";
  const mountCount = (pageSrc.match(/<Inspector\b/g) ?? []).length;
  assertCase(
    block,
    "page.singleMount",
    mountCount === 1,
    mountCount === 1
      ? "page.tsx mounts Inspector exactly once"
      : `Inspector mounts in page.tsx: ${mountCount}`,
  );

  const bridgeSrc = existsSync(join(repoRoot, WORKSPACE_LAYOUT))
    ? stripComments(read(WORKSPACE_LAYOUT))
    : "";
  assertCase(
    block,
    "bridge.passesInspectorOnce",
    (bridgeSrc.match(/\binspector=\{inspector\}/g) ?? []).length === 1,
    "WorkspaceLayout passes inspector slot exactly once",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — inspectorIdentity                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "inspectorIdentity";
  const pageSrc = existsSync(join(repoRoot, PAGE_PATH))
    ? stripComments(read(PAGE_PATH))
    : "";

  const frozenSubtree =
    /inspector=\{\s*<Inspector\s+visible=\{false\}\s+width=\{INSPECTOR_TOKENS\.defaultWidth\}\s*>\s*<InspectorPanel\s*\/>\s*<\/Inspector>\s*\}/.test(
      pageSrc,
    );

  assertCase(
    block,
    "page.frozenSubtree",
    frozenSubtree,
    "page preserves frozen Inspector subtree (visible/width/InspectorPanel)",
  );

  assertCase(
    block,
    "page.visibleFalse",
    /<Inspector[\s\S]*?\bvisible=\{false\}/.test(pageSrc),
    "visible={false} contract preserved",
  );

  assertCase(
    block,
    "page.widthToken",
    /<Inspector[\s\S]*?\bwidth=\{INSPECTOR_TOKENS\.defaultWidth\}/.test(
      pageSrc,
    ),
    "width={INSPECTOR_TOKENS.defaultWidth} preserved",
  );

  assertCase(
    block,
    "page.inspectorPanelChild",
    /<Inspector[\s\S]*?<InspectorPanel\s*\/>/.test(pageSrc),
    "<InspectorPanel /> child preserved",
  );

  const shellFiles = walkFiles(join(repoRoot, APP_SHELL_DIR));
  const hits: string[] = [];
  for (const f of shellFiles) {
    const src = stripComments(readFileSync(f, "utf8"));
    if (
      /from\s+["']@\/components\/inspector/.test(src) ||
      /<Inspector\b/.test(src)
    ) {
      hits.push(relative(repoRoot, f).replace(/\\/g, "/"));
    }
  }
  assertCase(
    block,
    "appShell.noInspectorImport",
    hits.length === 0,
    hits.length === 0
      ? "app-shell does not import or instantiate Inspector"
      : `Inspector reference in: ${hits.join(", ")}`,
  );

  const shellSrc = existsSync(join(repoRoot, APP_SHELL))
    ? stripComments(read(APP_SHELL))
    : "";
  assertCase(
    block,
    "appShell.rendersSlotOnly",
    /\{inspector\}/.test(shellSrc),
    "AppShell renders received {inspector} slot",
  );

  assertCase(
    block,
    "appShell.noWidthDecision",
    !/APP_SHELL_REGIONS\.inspector[\s\S]{0,250}w-\[/.test(shellSrc) &&
      !/APP_SHELL_REGIONS\.inspector[\s\S]{0,250}width:/.test(shellSrc) &&
      !/APP_SHELL_REGIONS\.inspector[\s\S]{0,250}visible=/.test(shellSrc),
    "AppShell does not decide inspector width or visibility",
  );

  const bridgeSrc = existsSync(join(repoRoot, WORKSPACE_LAYOUT))
    ? stripComments(read(WORKSPACE_LAYOUT))
    : "";
  assertCase(
    block,
    "bridge.noInspectorImport",
    !/from\s+["']@\/components\/inspector/.test(bridgeSrc) &&
      !/<Inspector\b/.test(bridgeSrc),
    "WorkspaceLayout does not import or instantiate Inspector",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — placeholderRemoved                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "placeholderRemoved";
  const shellSrc = existsSync(join(repoRoot, APP_SHELL))
    ? stripComments(read(APP_SHELL))
    : "";
  const pageSrc = existsSync(join(repoRoot, PAGE_PATH))
    ? stripComments(read(PAGE_PATH))
    : "";

  assertCase(
    block,
    "shell.slotPathNotPlaceholder",
    /inspector\s*!=\s*null[\s\S]{0,400}AppShellRegion[\s\S]{0,200}\{inspector\}/.test(
      shellSrc,
    ) ||
      /inspector\s*\?\s*\([\s\S]{0,400}AppShellRegion[\s\S]{0,200}\{inspector\}/.test(
        shellSrc,
      ),
    "when slot present, AppShell uses AppShellRegion (not placeholder-only)",
  );

  assertCase(
    block,
    "dock.noInspectorChild",
    !/<DockPanel[^>]*>[\s\S]*?<Inspector\b/.test(pageSrc),
    "DockPanel no longer mounts Inspector",
  );

  assertCase(
    block,
    "dock.infrastructureIntact",
    /<DockRoot>/.test(pageSrc) &&
      /<DockZone\b/.test(pageSrc) &&
      /<DockPanel\b/.test(pageSrc) &&
      /<WorkspacePanels>/.test(pageSrc),
    "DockRoot / DockZone / DockPanel / WorkspacePanels retained",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — workspaceBridge                                                  */
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
    "bridge.transparentInspectorForward",
    /\binspector=\{inspector\}/.test(bridgeSrc) &&
      !/<Inspector\b/.test(bridgeSrc) &&
      !/from\s+["']@\/components\/inspector/.test(bridgeSrc),
    "bridge forwards inspector={inspector} without creating Inspector",
  );

  assertCase(
    block,
    "bridge.noInspectorWrap",
    !/inspector[\s\S]{0,80}<div[\s\S]{0,120}\{inspector\}/.test(bridgeSrc) &&
      !/inspector\s*\?\s*\(/.test(bridgeSrc) &&
      !/inspector\s*&&/.test(bridgeSrc),
    "bridge does not wrap/conditionally transform inspector",
  );

  assertCase(
    block,
    "types.layoutHasInspector",
    /WorkspaceLayoutProps\s*=\s*\{[\s\S]*?\binspector\?:\s*ReactNode/.test(
      typesSrc,
    ),
    "WorkspaceLayoutProps includes optional inspector slot",
  );

  assertCase(
    block,
    "bridge.priorSlotsStillForwarded",
    /\btoolbar=\{toolbar\}/.test(bridgeSrc) &&
      /\bsidebar=\{sidebar\}/.test(bridgeSrc) &&
      /\{workspace\}/.test(bridgeSrc) &&
      /\{panels\}/.test(bridgeSrc),
    "toolbar/sidebar/workspace/panels still forwarded",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — appShellRoot                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "appShellRoot";

  assertCase(
    block,
    "exists.AppShell",
    existsSync(join(repoRoot, APP_SHELL)),
    "AppShell.tsx exists",
  );

  assertCase(
    block,
    "legacy.absent",
    !existsSync(join(repoRoot, "src/components/layout/AppShell.tsx")) &&
      !existsSync(join(repoRoot, "src/components/AppShell.tsx")) &&
      !existsSync(join(repoRoot, "src/app/AppShell.tsx")),
    "legacy AppShell paths absent",
  );

  const shellSrc = stripComments(read(APP_SHELL));
  assertCase(
    block,
    "layoutOnly.noHooks",
    !/\buseState\b/.test(shellSrc) &&
      !/\buseEffect\b/.test(shellSrc) &&
      !/\bcreateContext\b/.test(shellSrc) &&
      !/\buseTheme\b/.test(shellSrc),
    "AppShell remains layout-only",
  );

  assertCase(
    block,
    "appShell.noInspectorCreate",
    !/from\s+["']@\/components\/inspector/.test(shellSrc) &&
      !/<Inspector\b/.test(shellSrc),
    "AppShell does not create Inspector",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — toolbarSidebarWorkspaceIntact                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "toolbarSidebarWorkspaceIntact";
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
  const contentSrc = existsSync(join(repoRoot, WORKSPACE_CONTENT))
    ? stripComments(read(WORKSPACE_CONTENT))
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
    "workspace.regionBounds",
    /APP_SHELL_REGIONS\.workspace[\s\S]{0,200}overflow-hidden/.test(shellSrc) &&
      /APP_SHELL_REGIONS\.workspace[\s\S]{0,200}\brelative\b/.test(shellSrc),
    "Workspace Region bounds + relative containing block intact",
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

  assertCase(
    block,
    "content.noToolbar",
    !/AdaptiveToolbar/.test(contentSrc),
    "WorkspaceContent still detached from AdaptiveToolbar",
  );

  assertCase(
    block,
    "inspector.bodyUntouched",
    existsSync(join(repoRoot, INSPECTOR_DIR)),
    "Inspector module directory remains (body not rewritten by AppShell)",
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
/* PASS 09 — priorGate (UX-4.5 / 4.4 / 4.3 / 4.2 / 4.1 inline)                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "priorGate";
  const pkg = read("package.json");

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
  { id: "inspectorRegion", pass: 1, ca: "CA-UX-4.6.1" },
  { id: "singleInspector", pass: 2, ca: "CA-UX-4.6.2" },
  { id: "inspectorIdentity", pass: 3, ca: "CA-UX-4.6.4 / ownership" },
  { id: "placeholderRemoved", pass: 4, ca: "CA-UX-4.6.3" },
  { id: "workspaceBridge", pass: 5, ca: "CA-UX-4.6.6" },
  { id: "appShellRoot", pass: 6, ca: "CA-UX-4.6.5" },
  { id: "toolbarSidebarWorkspaceIntact", pass: 7, ca: "CA-UX-4.6.7" },
  { id: "runtimeFreeze", pass: 8, ca: "CA-UX-4.6.8 / CA-UX-4.6.9" },
  { id: "priorGate", pass: 9, ca: "CA-UX-4.6.12 (prior inline)" },
  { id: "tscCompile", pass: 10, ca: "CA-UX-4.6.11" },
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
console.log("validate:ux-4.6");
console.log(allPass ? "PASS" : "FAIL");
if (allPass) {
  console.log("Inspector Integration");
  console.log("Move-only identity · transparent bridge · single Inspector");
  console.log("AppShell owns bounds/position · Inspector owns width/visibility");
}
console.log(`${passCount}/${BLOCKS.length}`);

process.exit(allPass ? 0 : 1);
