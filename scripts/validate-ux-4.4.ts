/**
 * UX-4.4 — Toolbar Migration gate.
 *
 * Blocks:
 * toolbarRegion · singleToolbar · toolbarIdentity · workspaceDetached
 * noRewrite · appShellRoot · workspaceBridge · sidebarIntact
 * runtimeFreeze · priorGate · tscCompile
 *
 * Principles:
 * - Move-only migration — AdaptiveToolbar JSX identity preserved
 * - WorkspaceLayout forwards toolbar transparently
 * - AppShell owns position, not toolbar creation
 * - Single AdaptiveToolbar instance
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
  | "toolbarRegion"
  | "singleToolbar"
  | "toolbarIdentity"
  | "workspaceDetached"
  | "noRewrite"
  | "appShellRoot"
  | "workspaceBridge"
  | "sidebarIntact"
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
const TOOLBAR_DIR = "src/components/toolbar";

/* -------------------------------------------------------------------------- */
/* PASS 01 — toolbarRegion                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "toolbarRegion";
  const shellSrc = existsSync(join(repoRoot, APP_SHELL))
    ? stripComments(read(APP_SHELL))
    : "";

  assertCase(
    block,
    "region.attrToolbar",
    /APP_SHELL_REGIONS\.toolbar/.test(shellSrc) &&
      /APP_SHELL_REGION_ATTR|data-app-shell-region/.test(shellSrc),
    "AppShell applies data-app-shell-region for toolbar",
  );

  assertCase(
    block,
    "region.wrapsReceivedSlot",
    /toolbar\s*!=\s*null[\s\S]{0,400}AppShellRegion[\s\S]{0,200}\{toolbar\}/.test(
      shellSrc,
    ) ||
      /toolbar\s*\?\s*\([\s\S]{0,400}AppShellRegion[\s\S]{0,200}\{toolbar\}/.test(
        shellSrc,
      ),
    "Toolbar Region wraps the received toolbar slot",
  );

  assertCase(
    block,
    "region.placeholderWhenAbsent",
    /AppShellRegionPlaceholder[\s\S]{0,120}toolbar|APP_SHELL_REGIONS\.toolbar[\s\S]{0,80}Toolbar/.test(
      shellSrc,
    ),
    "Toolbar placeholder retained when slot absent",
  );

  const pageSrc = existsSync(join(repoRoot, PAGE_PATH))
    ? stripComments(read(PAGE_PATH))
    : "";
  assertCase(
    block,
    "page.passesAdaptiveToolbarToLayout",
    /toolbar=\{[\s\S]{0,80}<AdaptiveToolbar\b/.test(pageSrc) &&
      /<WorkspaceLayout\b[\s\S]*toolbar=\{/.test(pageSrc),
    "page mounts AdaptiveToolbar into WorkspaceLayout.toolbar",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — singleToolbar                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "singleToolbar";

  assertCase(
    block,
    "exists.AdaptiveToolbar",
    existsSync(join(repoRoot, ADAPTIVE_TOOLBAR)),
    "AdaptiveToolbar.tsx exists",
  );

  assertCase(
    block,
    "no.ToolbarV2",
    !existsSync(join(repoRoot, "src/components/toolbar/ToolbarV2.tsx")) &&
      !existsSync(join(repoRoot, "src/components/toolbar/AdaptiveToolbarV2.tsx")) &&
      !existsSync(join(repoRoot, "src/components/app-shell/AdaptiveToolbar.tsx")),
    "no alternate Toolbar / ToolbarV2 mounts",
  );

  const pageSrc = existsSync(join(repoRoot, PAGE_PATH))
    ? stripComments(read(PAGE_PATH))
    : "";
  const mountCount = (pageSrc.match(/<AdaptiveToolbar\b/g) ?? []).length;
  assertCase(
    block,
    "page.singleMount",
    mountCount === 1,
    mountCount === 1
      ? "page.tsx mounts AdaptiveToolbar exactly once"
      : `AdaptiveToolbar mounts in page.tsx: ${mountCount}`,
  );

  const bridgeSrc = existsSync(join(repoRoot, WORKSPACE_LAYOUT))
    ? stripComments(read(WORKSPACE_LAYOUT))
    : "";
  assertCase(
    block,
    "bridge.passesToolbarOnce",
    (bridgeSrc.match(/\btoolbar=\{toolbar\}/g) ?? []).length === 1,
    "WorkspaceLayout passes toolbar slot exactly once",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — toolbarIdentity                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "toolbarIdentity";
  const shellFiles = walkFiles(join(repoRoot, APP_SHELL_DIR));
  const hits: string[] = [];
  for (const f of shellFiles) {
    const src = stripComments(readFileSync(f, "utf8"));
    if (
      /AdaptiveToolbar/.test(src) ||
      /from\s+["']@\/components\/toolbar/.test(src) ||
      /<AdaptiveToolbar\b/.test(src)
    ) {
      // Allow comment-only mentions of AdaptiveToolbar in docs-style comments
      // were stripped; any remaining AdaptiveToolbar in code is a fail.
      // Exception: the principle comment may remain if stripComments left it —
      // stripComments removes block comments, so leftover AdaptiveToolbar is code.
      hits.push(relative(repoRoot, f).replace(/\\/g, "/"));
    }
  }

  // Re-check with raw files excluding pure comment lines for principle docs:
  // After stripComments, AdaptiveToolbar in AppShell.tsx header is gone.
  // If hits remain, AppShell created/imported toolbar — fail.
  assertCase(
    block,
    "appShell.noAdaptiveToolbarImport",
    hits.length === 0,
    hits.length === 0
      ? "app-shell does not import or instantiate AdaptiveToolbar"
      : `AdaptiveToolbar reference in: ${hits.join(", ")}`,
  );

  const shellSrc = existsSync(join(repoRoot, APP_SHELL))
    ? stripComments(read(APP_SHELL))
    : "";
  assertCase(
    block,
    "appShell.rendersSlotOnly",
    /\{toolbar\}/.test(shellSrc),
    "AppShell renders received {toolbar} slot",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — workspaceDetached                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "workspaceDetached";
  const contentSrc = existsSync(join(repoRoot, WORKSPACE_CONTENT))
    ? stripComments(read(WORKSPACE_CONTENT))
    : "";
  const typesSrc = existsSync(join(repoRoot, WORKSPACE_TYPES))
    ? stripComments(read(WORKSPACE_TYPES))
    : "";

  assertCase(
    block,
    "content.noToolbarRender",
    !/\{toolbar\}/.test(contentSrc) && !/\btoolbar\b/.test(contentSrc),
    "WorkspaceContent no longer renders toolbar",
  );

  assertCase(
    block,
    "content.noAdaptiveToolbar",
    !/AdaptiveToolbar/.test(contentSrc) &&
      !/from\s+["']@\/components\/toolbar/.test(contentSrc),
    "WorkspaceContent does not mount AdaptiveToolbar",
  );

  assertCase(
    block,
    "types.noToolbarOnContent",
    /WorkspaceContentProps\s*=\s*\{[\s\S]*?\}/.test(typesSrc) &&
      !/WorkspaceContentProps\s*=\s*\{[^}]*\btoolbar\b/.test(typesSrc),
    "WorkspaceContentProps no longer includes toolbar",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — noRewrite                                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noRewrite";

  assertCase(
    block,
    "no.ToolbarContext",
    !existsSync(join(repoRoot, "src/components/toolbar/ToolbarContext.tsx")) &&
      !existsSync(join(repoRoot, "src/components/app-shell/ToolbarContext.tsx")),
    "no ToolbarContext file",
  );

  assertCase(
    block,
    "no.ToolbarProvider",
    !existsSync(join(repoRoot, "src/components/toolbar/ToolbarProvider.tsx")) &&
      !existsSync(join(repoRoot, "src/components/app-shell/ToolbarProvider.tsx")),
    "no ToolbarProvider file",
  );

  const toolbarDir = join(repoRoot, TOOLBAR_DIR);
  const storeHits: string[] = [];
  for (const f of walkFiles(toolbarDir)) {
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
      ? "no new stores under toolbar"
      : `store symbols: ${storeHits.join(", ")}`,
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
    "bridge.transparentToolbarForward",
    /\btoolbar=\{toolbar\}/.test(bridgeSrc) &&
      !/<AdaptiveToolbar\b/.test(bridgeSrc) &&
      !/from\s+["']@\/components\/toolbar/.test(bridgeSrc),
    "bridge forwards toolbar={toolbar} without creating AdaptiveToolbar",
  );

  assertCase(
    block,
    "bridge.noToolbarWrap",
    !/toolbar[\s\S]{0,80}<div[\s\S]{0,120}\{toolbar\}/.test(bridgeSrc) &&
      !/toolbar\s*\?\s*\(/.test(bridgeSrc) &&
      !/toolbar\s*&&/.test(bridgeSrc),
    "bridge does not wrap/conditionally transform toolbar",
  );

  assertCase(
    block,
    "types.layoutHasToolbar",
    /WorkspaceLayoutProps\s*=\s*\{[\s\S]*?\btoolbar\?:\s*ReactNode/.test(
      typesSrc,
    ),
    "WorkspaceLayoutProps includes optional toolbar slot",
  );

  assertCase(
    block,
    "bridge.sidebarStillForwarded",
    /\bsidebar=\{sidebar\}/.test(bridgeSrc),
    "sidebar={sidebar} still forwarded",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — sidebarIntact                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "sidebarIntact";
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

  assertCase(
    block,
    "sidebar.regionBounds",
    /APP_SHELL_REGIONS\.sidebar[\s\S]{0,200}overflow-hidden/.test(shellSrc) &&
      !/APP_SHELL_REGIONS\.sidebar[\s\S]{0,200}overflow-auto/.test(shellSrc),
    "Sidebar Region bounds only (overflow-hidden)",
  );

  assertCase(
    block,
    "exists.Sidebar",
    existsSync(join(repoRoot, SIDEBAR)),
    "Sidebar.tsx still present",
  );

  const shellFiles = walkFiles(join(repoRoot, APP_SHELL_DIR));
  const sidebarImports: string[] = [];
  for (const f of shellFiles) {
    const src = stripComments(readFileSync(f, "utf8"));
    if (
      /from\s+["']@\/components\/ui\/sidebar/.test(src) ||
      (/\bimport\s+\{[^}]*\bSidebar\b/.test(src) &&
        !/APP_SHELL_REGIONS\.sidebar/.test(src))
    ) {
      sidebarImports.push(relative(repoRoot, f).replace(/\\/g, "/"));
    }
  }
  assertCase(
    block,
    "appShell.noSidebarImport",
    sidebarImports.length === 0,
    sidebarImports.length === 0
      ? "app-shell does not import Sidebar"
      : `Sidebar imported in: ${sidebarImports.join(", ")}`,
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
/* PASS 10 — priorGate (UX-4.3 / 4.2 / 4.1 inline — no nested validate:*)      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "priorGate";
  const pkg = read("package.json");

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
  { id: "toolbarRegion", pass: 1, ca: "CA-UX-4.4.1" },
  { id: "singleToolbar", pass: 2, ca: "CA-UX-4.4.2" },
  { id: "toolbarIdentity", pass: 3, ca: "CA-UX-4.4.4 / ownership" },
  { id: "workspaceDetached", pass: 4, ca: "CA-UX-4.4.3" },
  { id: "noRewrite", pass: 5, ca: "CA-UX-4.4.10" },
  { id: "appShellRoot", pass: 6, ca: "CA-UX-4.4.5" },
  { id: "workspaceBridge", pass: 7, ca: "CA-UX-4.4.6" },
  { id: "sidebarIntact", pass: 8, ca: "CA-UX-4.4.7" },
  { id: "runtimeFreeze", pass: 9, ca: "CA-UX-4.4.8 / CA-UX-4.4.9" },
  { id: "priorGate", pass: 10, ca: "CA-UX-4.4.12 (prior inline)" },
  { id: "tscCompile", pass: 11, ca: "CA-UX-4.4.11" },
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
console.log("validate:ux-4.4");
console.log(allPass ? "PASS" : "FAIL");
if (allPass) {
  console.log("Toolbar Migration");
  console.log("Move-only · transparent bridge · single AdaptiveToolbar");
  console.log("AppShell owns position · Toolbar owns functionality");
}
console.log(`${passCount}/${BLOCKS.length}`);

process.exit(allPass ? 0 : 1);
