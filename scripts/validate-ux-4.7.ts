/**
 * UX-4.7 — Status Bar Integration gate.
 *
 * Blocks:
 * statusBarExists · statusRegion · placeholderRemoved · layoutOnly
 * runtimeIsolation · noStatusContext · appShellRoot · priorGate · tscCompile
 *
 * Principles:
 * - StatusBar is the permanent default chrome of the AppShell
 * - Placeholder mode ends in UX-4.7
 * - Layout-only · minimal API (children?, className?) · no Runtime
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
  | "statusBarExists"
  | "statusRegion"
  | "placeholderRemoved"
  | "layoutOnly"
  | "runtimeIsolation"
  | "noStatusContext"
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

const HOST_PATH = "src/app/theme-runtime-host.tsx";
const LAYOUT_PATH = "src/app/layout.tsx";
const UI_INDEX = "src/ui/index.ts";
const RUNTIME_INDEX = "src/ui/theme/runtime/index.ts";
const APP_SHELL = "src/components/app-shell/AppShell.tsx";
const APP_SHELL_DIR = "src/components/app-shell";
const WORKSPACE_LAYOUT = "src/components/workspace/WorkspaceLayout.tsx";
const WORKSPACE_CONTENT = "src/components/workspace/WorkspaceContent.tsx";
const SIDEBAR = "src/components/ui/sidebar/Sidebar.tsx";
const ADAPTIVE_TOOLBAR = "src/components/toolbar/AdaptiveToolbar.tsx";
const INSPECTOR = "src/components/inspector/Inspector.tsx";
const STATUS_BAR = "src/components/status-bar/StatusBar.tsx";
const STATUS_BAR_LAYOUT = "src/components/status-bar/StatusBarLayout.tsx";
const STATUS_BAR_BARREL = "src/components/status-bar/index.ts";
const STATUS_BAR_DIR = "src/components/status-bar";

/* -------------------------------------------------------------------------- */
/* PASS 01 — statusBarExists                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "statusBarExists";

  assertCase(
    block,
    "exists.StatusBar",
    existsSync(join(repoRoot, STATUS_BAR)),
    "StatusBar.tsx exists",
  );

  assertCase(
    block,
    "exists.StatusBarLayout",
    existsSync(join(repoRoot, STATUS_BAR_LAYOUT)),
    "StatusBarLayout.tsx exists",
  );

  const barrel = existsSync(join(repoRoot, STATUS_BAR_BARREL))
    ? stripComments(read(STATUS_BAR_BARREL))
    : "";
  assertCase(
    block,
    "exists.barrel",
    existsSync(join(repoRoot, STATUS_BAR_BARREL)) &&
      /\bStatusBar\b/.test(barrel) &&
      /\bStatusBarLayout\b/.test(barrel),
    "status-bar barrel exports StatusBar + StatusBarLayout",
  );

  assertCase(
    block,
    "no.StatusBarV2",
    !existsSync(join(repoRoot, "src/components/status-bar/StatusBarV2.tsx")) &&
      !existsSync(join(repoRoot, "src/components/app-shell/StatusBar.tsx")) &&
      !existsSync(join(repoRoot, "src/components/app-shell/StatusBarV2.tsx")),
    "no StatusBarV2 / alternate StatusBar mounts",
  );

  assertCase(
    block,
    "no.StatusProvider",
    !existsSync(join(repoRoot, "src/components/status-bar/StatusProvider.tsx")) &&
      !existsSync(join(repoRoot, "src/components/status-bar/StatusProvider.ts")),
    "no StatusProvider file",
  );

  assertCase(
    block,
    "no.StatusContext",
    !existsSync(join(repoRoot, "src/components/status-bar/StatusContext.tsx")) &&
      !existsSync(join(repoRoot, "src/components/status-bar/StatusContext.ts")),
    "no StatusContext file",
  );

  const statusSrc = existsSync(join(repoRoot, STATUS_BAR))
    ? stripComments(read(STATUS_BAR))
    : "";
  assertCase(
    block,
    "api.minimal",
    /children\?\s*:\s*ReactNode/.test(statusSrc) &&
      /className\?\s*:\s*string/.test(statusSrc) &&
      !/\bvisible\??\s*:/.test(statusSrc) &&
      !/\bwidth\??\s*:/.test(statusSrc) &&
      !/\bonClick\b/.test(statusSrc),
    "StatusBar public API is children? + className? only",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — statusRegion                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "statusRegion";
  const shellSrc = existsSync(join(repoRoot, APP_SHELL))
    ? stripComments(read(APP_SHELL))
    : "";

  assertCase(
    block,
    "region.importsStatusBar",
    /from\s+["']@\/components\/status-bar["']/.test(shellSrc) &&
      /\bStatusBar\b/.test(shellSrc),
    "AppShell imports StatusBar from @/components/status-bar",
  );

  assertCase(
    block,
    "region.attrStatusBar",
    /APP_SHELL_REGIONS\.statusBar/.test(shellSrc) &&
      /APP_SHELL_REGION_ATTR|data-app-shell-region/.test(shellSrc),
    "AppShell applies data-app-shell-region for statusBar",
  );

  assertCase(
    block,
    "region.defaultStatusBar",
    /statusBar\s*\?\?\s*<StatusBar\s*\/>/.test(shellSrc) ||
      /statusBar\s*\?\?\s*<StatusBar\b/.test(shellSrc),
    "Status Region defaults to statusBar ?? <StatusBar />",
  );

  assertCase(
    block,
    "region.wrapsInAppShellRegion",
    /AppShellRegion[\s\S]{0,200}APP_SHELL_REGIONS\.statusBar[\s\S]{0,200}statusBar\s*\?\?/.test(
      shellSrc,
    ) ||
      /APP_SHELL_REGIONS\.statusBar[\s\S]{0,300}statusBar\s*\?\?\s*<StatusBar/.test(
        shellSrc,
      ),
    "Status Region wraps StatusBar in AppShellRegion",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — placeholderRemoved                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "placeholderRemoved";
  const shellSrc = existsSync(join(repoRoot, APP_SHELL))
    ? stripComments(read(APP_SHELL))
    : "";

  assertCase(
    block,
    "placeholder.noStatusBarLabel",
    !/label=["']Status Bar["']/.test(shellSrc),
    'no AppShellRegionPlaceholder label="Status Bar"',
  );

  assertCase(
    block,
    "placeholder.noStatusBarFallback",
    !/statusBar\s*\?\?[\s\S]{0,120}AppShellRegionPlaceholder/.test(shellSrc),
    "Status Bar no longer falls back to AppShellRegionPlaceholder",
  );

  assertCase(
    block,
    "placeholder.toolbarRetained",
    /AppShellRegionPlaceholder[\s\S]{0,80}Toolbar|label=["']Toolbar["']/.test(
      shellSrc,
    ),
    "Toolbar placeholder retained when slot absent",
  );

  assertCase(
    block,
    "placeholder.inspectorRetained",
    /AppShellRegionPlaceholder[\s\S]{0,80}Inspector|label=["']Inspector["']/.test(
      shellSrc,
    ),
    "Inspector placeholder retained when slot absent",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — layoutOnly                                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "layoutOnly";

  const statusFiles = walkFiles(join(repoRoot, STATUS_BAR_DIR)).filter((f) =>
    /\.tsx?$/.test(f),
  );
  const shellFiles = walkFiles(join(repoRoot, APP_SHELL_DIR)).filter((f) =>
    /\.tsx?$/.test(f),
  );

  const forbidden = [
    { id: "useState", re: /\buseState\b/ },
    { id: "useEffect", re: /\buseEffect\b/ },
    { id: "useLayoutEffect", re: /\buseLayoutEffect\b/ },
    { id: "useReducer", re: /\buseReducer\b/ },
    { id: "useMemo", re: /\buseMemo\b/ },
    { id: "useCallback", re: /\buseCallback\b/ },
    { id: "useRef", re: /\buseRef\b/ },
    { id: "createContext", re: /\bcreateContext\b/ },
    { id: "useContext", re: /\buseContext\b/ },
    { id: "Provider", re: /\b\w+Provider\b/ },
    { id: "useTheme", re: /\buseTheme\b/ },
    { id: "zustand", re: /\bzustand\b|\bcreateStore\b/ },
  ];

  const offenders: string[] = [];
  for (const f of [...statusFiles, ...shellFiles]) {
    const rel = relative(repoRoot, f).replace(/\\/g, "/");
    const src = stripComments(readFileSync(f, "utf8"));
    for (const { id, re } of forbidden) {
      if (re.test(src)) {
        offenders.push(`${rel}:${id}`);
      }
    }
  }

  assertCase(
    block,
    "layoutOnly.noStateHooksProviders",
    offenders.length === 0,
    offenders.length === 0
      ? "status-bar + app-shell are layout-only"
      : `forbidden symbols: ${offenders.join(", ")}`,
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — runtimeIsolation                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "runtimeIsolation";

  const statusFiles = walkFiles(join(repoRoot, STATUS_BAR_DIR)).filter((f) =>
    /\.tsx?$/.test(f),
  );

  const runtimeForbidden = [
    { id: "RuntimeReporter", re: /\bRuntimeReporter\b/ },
    { id: "RuntimeDiagnostics", re: /\bRuntimeDiagnostics\b/ },
    { id: "RuntimePipeline", re: /\bRuntimePipeline\b/ },
    { id: "useTheme", re: /\buseTheme\b/ },
    { id: "ThemeProvider", re: /\bThemeProvider\b/ },
    {
      id: "runtimeImport",
      re: /from\s+["']@\/ui\/theme\/runtime/,
    },
    {
      id: "themeRuntimePath",
      re: /ui\/theme\/runtime/,
    },
  ];

  const offenders: string[] = [];
  for (const f of statusFiles) {
    const rel = relative(repoRoot, f).replace(/\\/g, "/");
    const src = stripComments(readFileSync(f, "utf8"));
    for (const { id, re } of runtimeForbidden) {
      if (re.test(src)) {
        offenders.push(`${rel}:${id}`);
      }
    }
  }

  assertCase(
    block,
    "status.noRuntime",
    offenders.length === 0,
    offenders.length === 0
      ? "status-bar has no Runtime / theme bindings"
      : `runtime symbols: ${offenders.join(", ")}`,
  );

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
/* PASS 06 — noStatusContext                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noStatusContext";

  const statusFiles = walkFiles(join(repoRoot, STATUS_BAR_DIR)).filter((f) =>
    /\.tsx?$/.test(f),
  );

  const offenders: string[] = [];
  for (const f of statusFiles) {
    const rel = relative(repoRoot, f).replace(/\\/g, "/");
    const src = stripComments(readFileSync(f, "utf8"));
    if (/\bcreateContext\b/.test(src)) offenders.push(`${rel}:createContext`);
    if (/\bStatusContext\b/.test(src)) offenders.push(`${rel}:StatusContext`);
    if (/\bStatusProvider\b/.test(src)) offenders.push(`${rel}:StatusProvider`);
    if (/\b\w+Provider\b/.test(src)) offenders.push(`${rel}:Provider`);
  }

  assertCase(
    block,
    "no.createContextOrProvider",
    offenders.length === 0,
    offenders.length === 0
      ? "status-bar has no StatusContext / Provider"
      : `context symbols: ${offenders.join(", ")}`,
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
  const contentSrc = existsSync(join(repoRoot, WORKSPACE_CONTENT))
    ? stripComments(read(WORKSPACE_CONTENT))
    : "";

  assertCase(
    block,
    "root.AppShellExists",
    existsSync(join(repoRoot, APP_SHELL)) && /\bexport function AppShell\b/.test(shellSrc),
    "AppShell remains sole composition root export",
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
    "root.bridgeDoesNotCreateStatusBar",
    !/\bStatusBar\b/.test(bridgeSrc),
    "WorkspaceLayout does not invent StatusBar",
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
    existsSync(join(repoRoot, WORKSPACE_CONTENT)) &&
      !/\bStatusBar\b/.test(contentSrc),
    "WorkspaceContent intact and not hosting StatusBar",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — priorGate (UX-4.6 … UX-4.1 inline)                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "priorGate";
  const pkg = read("package.json");

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
/* PASS 09 — tscCompile                                                       */
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
  { id: "statusBarExists", pass: 1, ca: "CA-UX-4.7.1" },
  { id: "statusRegion", pass: 2, ca: "CA-UX-4.7.2" },
  { id: "placeholderRemoved", pass: 3, ca: "CA-UX-4.7.3" },
  { id: "layoutOnly", pass: 4, ca: "CA-UX-4.7.4 / CA-UX-4.7.6" },
  { id: "runtimeIsolation", pass: 5, ca: "CA-UX-4.7.5 / CA-UX-4.7.9" },
  { id: "noStatusContext", pass: 6, ca: "CA-UX-4.7.6" },
  { id: "appShellRoot", pass: 7, ca: "CA-UX-4.7.7 / CA-UX-4.7.8" },
  { id: "priorGate", pass: 8, ca: "CA-UX-4.7.12 (prior inline)" },
  { id: "tscCompile", pass: 9, ca: "CA-UX-4.7.11" },
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
console.log("validate:ux-4.7");
console.log(allPass ? "PASS" : "FAIL");
if (allPass) {
  console.log("Status Bar Integration");
  console.log("Permanent default chrome · placeholder mode ended");
  console.log("Layout-only · minimal API · no Runtime");
}
console.log(`${passCount}/${BLOCKS.length}`);

process.exit(allPass ? 0 : 1);
