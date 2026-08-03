/**
 * UX-4.3 — Sidebar Alignment gate.
 *
 * Blocks:
 * sidebarRegion · singleSidebar · railCollapseSafe · noRewrite
 * workspaceIsolation · appShellRoot · workspaceBridge · toolbarDeferred
 * scrollOwnership · runtimeFreeze · priorGate · tscCompile
 *
 * Principles:
 * - Sidebar owns width · AppShell owns position
 * - Scrolling ownership remains inside Sidebar · AppShell only bounds the region
 * - Single Sidebar instance
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
  | "sidebarRegion"
  | "singleSidebar"
  | "railCollapseSafe"
  | "noRewrite"
  | "workspaceIsolation"
  | "appShellRoot"
  | "workspaceBridge"
  | "toolbarDeferred"
  | "scrollOwnership"
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
const SIDEBAR = "src/components/ui/sidebar/Sidebar.tsx";

/* -------------------------------------------------------------------------- */
/* PASS 01 — sidebarRegion                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "sidebarRegion";
  const shellSrc = existsSync(join(repoRoot, APP_SHELL))
    ? stripComments(read(APP_SHELL))
    : "";
  const layoutSrc = existsSync(join(repoRoot, APP_SHELL_LAYOUT))
    ? stripComments(read(APP_SHELL_LAYOUT))
    : "";

  assertCase(
    block,
    "region.attrSidebar",
    /APP_SHELL_REGIONS\.sidebar|"sidebar"/.test(shellSrc) &&
      /APP_SHELL_REGION_ATTR|data-app-shell-region/.test(shellSrc),
    "AppShell applies data-app-shell-region for sidebar",
  );

  assertCase(
    block,
    "region.fillHeight",
    /h-full/.test(shellSrc) && /min-h-0/.test(shellSrc),
    "Sidebar Region uses h-full min-h-0 fill contract",
  );

  assertCase(
    block,
    "region.overflowBound",
    /overflow-hidden/.test(shellSrc),
    "Sidebar Region bounds overflow (overflow-hidden)",
  );

  assertCase(
    block,
    "region.noOverflowAutoOnSidebar",
    /APP_SHELL_REGIONS\.sidebar[\s\S]{0,200}overflow-hidden/.test(shellSrc) &&
      !/APP_SHELL_REGIONS\.sidebar[\s\S]{0,200}overflow-auto/.test(shellSrc),
    "Sidebar Region uses overflow-hidden, not overflow-auto",
  );

  assertCase(
    block,
    "layout.sidebarColumnAuto",
    /grid-cols-\[auto_/.test(layoutSrc) ||
      /grid-cols-\[minmax\(0,\s*max-content\)_/.test(layoutSrc) ||
      /grid-cols-\[minmax\(0,\s*auto\)_/.test(layoutSrc),
    "AppShellLayout sidebar column follows content (auto / max-content)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — singleSidebar                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "singleSidebar";

  assertCase(
    block,
    "exists.Sidebar",
    existsSync(join(repoRoot, SIDEBAR)),
    "Sidebar.tsx exists",
  );

  assertCase(
    block,
    "no.SidebarV2",
    !existsSync(join(repoRoot, "src/components/ui/sidebar/SidebarV2.tsx")) &&
      !existsSync(join(repoRoot, "src/components/sidebar/Sidebar.tsx")) &&
      !existsSync(join(repoRoot, "src/components/app-shell/Sidebar.tsx")),
    "no alternate Sidebar / SidebarV2 mounts",
  );

  const shellFiles = walkFiles(join(repoRoot, APP_SHELL_DIR));
  const sidebarImports: string[] = [];
  for (const f of shellFiles) {
    const src = stripComments(readFileSync(f, "utf8"));
    if (
      /from\s+["']@\/components\/ui\/sidebar/.test(src) ||
      /\bimport\s+\{[^}]*\bSidebar\b/.test(src)
    ) {
      sidebarImports.push(relative(repoRoot, f).replace(/\\/g, "/"));
    }
  }
  assertCase(
    block,
    "appShell.noSidebarImport",
    sidebarImports.length === 0,
    sidebarImports.length === 0
      ? "app-shell does not import Sidebar (slot only)"
      : `Sidebar imported in: ${sidebarImports.join(", ")}`,
  );

  const bridgeSrc = existsSync(join(repoRoot, WORKSPACE_LAYOUT))
    ? stripComments(read(WORKSPACE_LAYOUT))
    : "";
  assertCase(
    block,
    "bridge.passesSidebarOnce",
    (bridgeSrc.match(/\bsidebar=\{sidebar\}/g) ?? []).length === 1,
    "WorkspaceLayout passes sidebar slot exactly once",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — railCollapseSafe                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "railCollapseSafe";
  const layoutSrc = existsSync(join(repoRoot, APP_SHELL_LAYOUT))
    ? stripComments(read(APP_SHELL_LAYOUT))
    : "";
  const shellSrc = existsSync(join(repoRoot, APP_SHELL))
    ? stripComments(read(APP_SHELL))
    : "";
  const combined = `${layoutSrc}\n${shellSrc}`;

  assertCase(
    block,
    "no.minWidth240Column",
    !/minmax\(240px/.test(combined) &&
      !/min-w-\[240px\]/.test(combined) &&
      !/min-w-\[15rem\]/.test(combined) &&
      !/w-\[240px\]/.test(combined),
    "AppShell does not impose 240px min width on Sidebar column",
  );

  const sidebarSrc = existsSync(join(repoRoot, SIDEBAR))
    ? stripComments(read(SIDEBAR))
    : "";
  assertCase(
    block,
    "sidebar.keepsCollapsedShell",
    /sidebarShellCollapsed|shellCollapsed/.test(sidebarSrc),
    "Sidebar retains collapsed rail shell",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — noRewrite                                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noRewrite";

  assertCase(
    block,
    "no.SidebarContext",
    !existsSync(join(repoRoot, "src/components/ui/sidebar/SidebarContext.tsx")) &&
      !existsSync(join(repoRoot, "src/components/app-shell/SidebarContext.tsx")),
    "no SidebarContext file",
  );

  assertCase(
    block,
    "no.SidebarProvider",
    !existsSync(join(repoRoot, "src/components/ui/sidebar/SidebarProvider.tsx")) &&
      !existsSync(join(repoRoot, "src/components/app-shell/SidebarProvider.tsx")),
    "no SidebarProvider file",
  );

  const sidebarDir = join(repoRoot, "src/components/ui/sidebar");
  const storeHits: string[] = [];
  for (const f of walkFiles(sidebarDir)) {
    const src = stripComments(readFileSync(f, "utf8"));
    if (/\bzustand\b|\bcreateStore\b|\bredux\b/.test(src)) {
      storeHits.push(relative(repoRoot, f).replace(/\\/g, "/"));
    }
  }
  assertCase(
    block,
    "no.newStores",
    storeHits.length === 0,
    storeHits.length === 0
      ? "no new stores under ui/sidebar"
      : `store symbols: ${storeHits.join(", ")}`,
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — workspaceIsolation                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "workspaceIsolation";
  const shellSrc = existsSync(join(repoRoot, APP_SHELL))
    ? stripComments(read(APP_SHELL))
    : "";
  const bridgeSrc = existsSync(join(repoRoot, WORKSPACE_LAYOUT))
    ? stripComments(read(WORKSPACE_LAYOUT))
    : "";

  assertCase(
    block,
    "workspace.regionDistinct",
    /APP_SHELL_REGIONS\.workspace/.test(shellSrc),
    "Workspace region present and distinct",
  );

  assertCase(
    block,
    "bridge.workspacePlusPanels",
    /\{workspace\}/.test(bridgeSrc) && /\{panels\}/.test(bridgeSrc),
    "Workspace + panels still composed into workspace slot",
  );

  assertCase(
    block,
    "windowManagerUntouched",
    existsSync(join(repoRoot, "src/components/windows/WindowManager.tsx")),
    "WindowManager still present (not rewritten)",
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
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — workspaceBridge                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "workspaceBridge";
  const bridgeSrc = existsSync(join(repoRoot, WORKSPACE_LAYOUT))
    ? stripComments(read(WORKSPACE_LAYOUT))
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
    "bridge.noBareMain",
    !/<main[\s>][\s\S]*\{sidebar\}[\s\S]*\{workspace\}[\s\S]*\{panels\}/.test(
      bridgeSrc,
    ),
    "no bare 3-slot <main> composition",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — toolbarDeferred                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "toolbarDeferred";
  const contentSrc = existsSync(join(repoRoot, WORKSPACE_CONTENT))
    ? stripComments(read(WORKSPACE_CONTENT))
    : "";

  assertCase(
    block,
    "content.keepsToolbarSlot",
    /\btoolbar\b/.test(contentSrc),
    "WorkspaceContent retains toolbar slot",
  );

  const shellFiles = walkFiles(join(repoRoot, APP_SHELL_DIR));
  const hits: string[] = [];
  for (const f of shellFiles) {
    const src = stripComments(readFileSync(f, "utf8"));
    if (/AdaptiveToolbar/.test(src) || /from\s+["']@\/components\/toolbar/.test(src)) {
      hits.push(relative(repoRoot, f).replace(/\\/g, "/"));
    }
  }
  assertCase(
    block,
    "appShell.noAdaptiveToolbar",
    hits.length === 0,
    hits.length === 0
      ? "AdaptiveToolbar not imported by app-shell"
      : `found in: ${hits.join(", ")}`,
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — scrollOwnership                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "scrollOwnership";
  const sidebarSrc = existsSync(join(repoRoot, SIDEBAR))
    ? stripComments(read(SIDEBAR))
    : "";
  const shellSrc = existsSync(join(repoRoot, APP_SHELL))
    ? stripComments(read(APP_SHELL))
    : "";

  assertCase(
    block,
    "sidebar.keepsInternalScroll",
    /sidebarSectionGap|sectionGap|overflow-y-auto/.test(sidebarSrc),
    "Sidebar retains internal scroll classes/tokens",
  );

  assertCase(
    block,
    "sidebar.fillRegionNotViewport",
    /!h-full/.test(sidebarSrc) && /!min-h-0/.test(sidebarSrc),
    "Sidebar uses !h-full !min-h-0 to fill region",
  );

  assertCase(
    block,
    "appShell.sidebarRegionBoundsOnly",
    /APP_SHELL_REGIONS\.sidebar[\s\S]{0,200}overflow-hidden/.test(shellSrc) &&
      !/APP_SHELL_REGIONS\.sidebar[\s\S]{0,200}overflow-auto/.test(shellSrc),
    "AppShell Sidebar Region bounds only (no overflow-auto)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 10 — runtimeFreeze                                                    */
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
/* PASS 11 — priorGate (UX-4.1 host + UX-4.2 shell inline)                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "priorGate";

  assertCase(
    block,
    "prior.ux42Exists",
    existsSync(join(repoRoot, APP_SHELL)) &&
      existsSync(join(repoRoot, "scripts/validate-ux-4.2.ts")) &&
      /"validate:ux-4\.2"\s*:/.test(read("package.json")),
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
/* PASS 12 — tscCompile                                                       */
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
  { id: "sidebarRegion", pass: 1, ca: "CA-UX-4.3.1" },
  { id: "singleSidebar", pass: 2, ca: "CA-UX-4.3.2" },
  { id: "railCollapseSafe", pass: 3, ca: "CA-UX-4.3.3" },
  { id: "noRewrite", pass: 4, ca: "CA-UX-4.3.3 / CA-UX-4.3.10" },
  { id: "workspaceIsolation", pass: 5, ca: "CA-UX-4.3.4" },
  { id: "appShellRoot", pass: 6, ca: "CA-UX-4.3.5" },
  { id: "workspaceBridge", pass: 7, ca: "CA-UX-4.3.6" },
  { id: "toolbarDeferred", pass: 8, ca: "CA-UX-4.3.7" },
  { id: "scrollOwnership", pass: 9, ca: "CA-UX-4.3.1 (scroll)" },
  { id: "runtimeFreeze", pass: 10, ca: "CA-UX-4.3.8 / CA-UX-4.3.9" },
  { id: "priorGate", pass: 11, ca: "CA-UX-4.3.12 (prior inline)" },
  { id: "tscCompile", pass: 12, ca: "CA-UX-4.3.11" },
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
console.log("validate:ux-4.3");
console.log(allPass ? "PASS" : "FAIL");
if (allPass) {
  console.log("Sidebar Alignment");
  console.log("Sidebar owns width · AppShell owns position");
  console.log("Scrolling ownership remains inside Sidebar");
  console.log("Single Sidebar instance");
}
console.log(`${passCount}/${BLOCKS.length}`);

process.exit(allPass ? 0 : 1);
