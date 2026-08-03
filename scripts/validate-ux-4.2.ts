/**
 * UX-4.2 — App Shell Foundation gate.
 *
 * Blocks:
 * appShellExists · fiveRegions · soleCompositionRoot · layoutOnly
 * reuseFence · hostIntact · runtimeFreeze · priorGate · tscCompile
 *
 * Architectural principles:
 * - AppShell is the only composition root for application chrome.
 * - WorkspaceLayout acts as a transitional bridge.
 * - AppShell is layout-only. It owns no application state.
 */
import { createHash } from "node:crypto";
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
  | "appShellExists"
  | "fiveRegions"
  | "soleCompositionRoot"
  | "layoutOnly"
  | "reuseFence"
  | "hostIntact"
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
const PROVIDER_PATH = "src/ui/providers/theme-provider.tsx";
const UI_INDEX = "src/ui/index.ts";
const RUNTIME_INDEX = "src/ui/theme/runtime/index.ts";
const APP_SHELL_DIR = "src/components/app-shell";
const APP_SHELL = `${APP_SHELL_DIR}/AppShell.tsx`;
const APP_SHELL_LAYOUT = `${APP_SHELL_DIR}/AppShellLayout.tsx`;
const APP_SHELL_REGIONS = `${APP_SHELL_DIR}/AppShellRegions.ts`;
const APP_SHELL_INDEX = `${APP_SHELL_DIR}/index.ts`;
const WORKSPACE_LAYOUT = "src/components/workspace/WorkspaceLayout.tsx";
const WORKSPACE_CONTENT = "src/components/workspace/WorkspaceContent.tsx";

const REGION_IDS = [
  "toolbar",
  "sidebar",
  "workspace",
  "inspector",
  "statusBar",
] as const;

/* -------------------------------------------------------------------------- */
/* PASS 01 — appShellExists                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "appShellExists";

  assertCase(
    block,
    "exists.dir",
    existsSync(join(repoRoot, APP_SHELL_DIR)),
    "src/components/app-shell/ exists",
  );

  for (const [id, rel] of [
    ["exists.AppShell", APP_SHELL],
    ["exists.AppShellLayout", APP_SHELL_LAYOUT],
    ["exists.AppShellRegions", APP_SHELL_REGIONS],
    ["exists.index", APP_SHELL_INDEX],
  ] as const) {
    assertCase(block, id, existsSync(join(repoRoot, rel)), `${rel} exists`);
  }

  const shellSrc = existsSync(join(repoRoot, APP_SHELL))
    ? stripComments(read(APP_SHELL))
    : "";
  assertCase(
    block,
    "export.AppShell",
    /\bexport\s+function\s+AppShell\b/.test(shellSrc),
    "AppShell.tsx exports function AppShell",
  );

  const indexSrc = existsSync(join(repoRoot, APP_SHELL_INDEX))
    ? stripComments(read(APP_SHELL_INDEX))
    : "";
  assertCase(
    block,
    "barrel.exportsAppShell",
    /\bAppShell\b/.test(indexSrc),
    "index.ts re-exports AppShell",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — fiveRegions                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "fiveRegions";

  const regionsSrc = existsSync(join(repoRoot, APP_SHELL_REGIONS))
    ? stripComments(read(APP_SHELL_REGIONS))
    : "";
  const shellSrc = existsSync(join(repoRoot, APP_SHELL))
    ? stripComments(read(APP_SHELL))
    : "";

  assertCase(
    block,
    "regions.attrConstant",
    /data-app-shell-region/.test(regionsSrc) ||
      /APP_SHELL_REGION_ATTR/.test(regionsSrc),
    "AppShellRegions defines data-app-shell-region attr",
  );

  for (const id of REGION_IDS) {
    assertCase(
      block,
      `regions.id.${id}`,
      new RegExp(`["']${id}["']`).test(regionsSrc),
      `AppShellRegions includes "${id}"`,
    );
  }

  assertCase(
    block,
    "regions.attrUsed",
    /APP_SHELL_REGION_ATTR|data-app-shell-region/.test(shellSrc),
    "AppShell applies region attribute",
  );

  for (const id of REGION_IDS) {
    assertCase(
      block,
      `regions.rendered.${id}`,
      new RegExp(`APP_SHELL_REGIONS\\.${id}|["']${id}["']`).test(shellSrc),
      `AppShell references region ${id}`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — soleCompositionRoot                                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "soleCompositionRoot";

  assertCase(
    block,
    "legacy.noLayoutAppShell",
    !existsSync(join(repoRoot, "src/components/layout/AppShell.tsx")) &&
      !existsSync(join(repoRoot, "src/components/AppShell.tsx")) &&
      !existsSync(join(repoRoot, "src/app/AppShell.tsx")),
    "legacy AppShell paths absent",
  );

  const bridgeSrc = existsSync(join(repoRoot, WORKSPACE_LAYOUT))
    ? stripComments(read(WORKSPACE_LAYOUT))
    : "";

  assertCase(
    block,
    "bridge.importsAppShell",
    /from\s+["']@\/components\/app-shell["']/.test(bridgeSrc) ||
      /from\s+["']\.\/.*app-shell/.test(bridgeSrc),
    "WorkspaceLayout imports AppShell from app-shell",
  );

  assertCase(
    block,
    "bridge.mountsAppShell",
    /<AppShell\b/.test(bridgeSrc),
    "WorkspaceLayout mounts <AppShell>",
  );

  assertCase(
    block,
    "bridge.noBareMainSlots",
    !/<main[\s>][\s\S]*\{sidebar\}[\s\S]*\{workspace\}[\s\S]*\{panels\}/.test(
      bridgeSrc,
    ),
    "WorkspaceLayout no longer renders bare 3-slot <main>",
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
    "sole.oneAppShellExport",
    exportAppShellCount === 1,
    `exactly one export function AppShell (found ${exportAppShellCount})`,
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — layoutOnly                                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "layoutOnly";

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
  for (const f of shellFiles) {
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
      ? "app-shell is layout-only"
      : `forbidden symbols: ${offenders.join(", ")}`,
  );

  assertCase(
    block,
    "layoutOnly.noAppShellContextFile",
    !existsSync(join(repoRoot, `${APP_SHELL_DIR}/AppShellContext.tsx`)) &&
      !existsSync(join(repoRoot, `${APP_SHELL_DIR}/AppShellContext.ts`)),
    "no AppShellContext file",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — reuseFence                                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "reuseFence";

  assertCase(
    block,
    "reuse.sidebarExists",
    existsSync(join(repoRoot, "src/components/ui/sidebar/Sidebar.tsx")),
    "Sidebar.tsx still present (reused, not rewritten)",
  );

  assertCase(
    block,
    "reuse.windowManagerExists",
    existsSync(join(repoRoot, "src/components/windows/WindowManager.tsx")),
    "WindowManager.tsx still present",
  );

  assertCase(
    block,
    "reuse.adaptiveToolbarExists",
    existsSync(join(repoRoot, "src/components/toolbar/AdaptiveToolbar.tsx")),
    "AdaptiveToolbar.tsx still present",
  );

  const contentSrc = existsSync(join(repoRoot, WORKSPACE_CONTENT))
    ? stripComments(read(WORKSPACE_CONTENT))
    : "";
  assertCase(
    block,
    "reuse.toolbarStillInWorkspaceContent",
    /\btoolbar\b/.test(contentSrc),
    "WorkspaceContent still hosts toolbar slot (AdaptiveToolbar not migrated)",
  );

  const shellFiles = walkFiles(join(repoRoot, APP_SHELL_DIR));
  const toolbarImports: string[] = [];
  for (const f of shellFiles) {
    const src = stripComments(readFileSync(f, "utf8"));
    if (
      /AdaptiveToolbar/.test(src) ||
      /from\s+["']@\/components\/toolbar/.test(src)
    ) {
      toolbarImports.push(relative(repoRoot, f).replace(/\\/g, "/"));
    }
  }
  assertCase(
    block,
    "reuse.noAdaptiveToolbarInAppShell",
    toolbarImports.length === 0,
    toolbarImports.length === 0
      ? "app-shell does not import AdaptiveToolbar"
      : `AdaptiveToolbar imported from: ${toolbarImports.join(", ")}`,
  );

  const bridgeSrc = existsSync(join(repoRoot, WORKSPACE_LAYOUT))
    ? stripComments(read(WORKSPACE_LAYOUT))
    : "";
  assertCase(
    block,
    "reuse.bridgePassesSidebar",
    /\bsidebar=\{sidebar\}/.test(bridgeSrc) || /\bsidebar=\{/.test(bridgeSrc),
    "WorkspaceLayout passes sidebar into AppShell",
  );
  assertCase(
    block,
    "reuse.bridgePassesWorkspacePanels",
    /\{workspace\}/.test(bridgeSrc) && /\{panels\}/.test(bridgeSrc),
    "WorkspaceLayout composes workspace + panels into AppShell",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — hostIntact                                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "hostIntact";

  assertCase(
    block,
    "host.fileExists",
    existsSync(join(repoRoot, HOST_PATH)),
    "theme-runtime-host.tsx exists",
  );

  const hostSrc = existsSync(join(repoRoot, HOST_PATH))
    ? stripComments(read(HOST_PATH))
    : "";
  const layoutSrc = existsSync(join(repoRoot, LAYOUT_PATH))
    ? stripComments(read(LAYOUT_PATH))
    : "";

  assertCase(
    block,
    "host.exportsThemeRuntimeHost",
    /\bexport\s+function\s+ThemeRuntimeHost\b/.test(hostSrc),
    "exports ThemeRuntimeHost",
  );

  assertCase(
    block,
    "host.importsThemeProviderFromUi",
    /ThemeProvider/.test(hostSrc) &&
      /from\s+["']@\/ui["']/.test(hostSrc) &&
      !/theme\/runtime/.test(hostSrc),
    "ThemeProvider imported from @/ui only",
  );

  assertCase(
    block,
    "layout.mountsHost",
    /ThemeRuntimeHost/.test(layoutSrc) &&
      /from\s+["']\.\/theme-runtime-host["']/.test(layoutSrc),
    "layout.tsx mounts ThemeRuntimeHost",
  );

  assertCase(
    block,
    "host.noDocumentElement",
    !/documentElement/.test(hostSrc) && !/localStorage/.test(hostSrc),
    "host remains host-scoped (no documentElement/localStorage)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — runtimeFreeze                                                    */
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
/* PASS 08 — priorGate (UX-4.1 host/provider/import fence inline)              */
/* Nested spawn of validate:ux-4.1 avoided (Windows hang with nested tsc).    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "priorGate";

  assertCase(
    block,
    "prior.ux41ScriptExists",
    existsSync(join(repoRoot, "scripts/validate-ux-4.1.ts")),
    "scripts/validate-ux-4.1.ts exists",
  );

  assertCase(
    block,
    "prior.ux41NpmScript",
    /"validate:ux-4\.1"\s*:/.test(read("package.json")),
    "package.json retains validate:ux-4.1",
  );

  assertCase(
    block,
    "prior.providerExists",
    existsSync(join(repoRoot, PROVIDER_PATH)),
    "theme-provider.tsx exists",
  );

  const providerSrc = existsSync(join(repoRoot, PROVIDER_PATH))
    ? stripComments(read(PROVIDER_PATH))
    : "";

  assertCase(
    block,
    "prior.providerNoClassName",
    !/\bclassName\b/.test(providerSrc),
    "ThemeProvider has no className prop surface",
  );

  assertCase(
    block,
    "prior.providerNoDocumentElement",
    !/documentElement/.test(providerSrc) &&
      !/localStorage/.test(providerSrc) &&
      !/document\.body/.test(providerSrc),
    "ThemeProvider remains host-scoped",
  );

  assertCase(
    block,
    "prior.providerNoDiagnostics",
    !/\bRuntimeDiagnostics\b/.test(providerSrc) &&
      !/\bRuntimePipeline\b/.test(providerSrc) &&
      !/\bRuntimeReporter\b/.test(providerSrc),
    "ThemeProvider has no diagnostics wiring",
  );

  const providerHash = existsSync(join(repoRoot, PROVIDER_PATH))
    ? createHash("sha256").update(read(PROVIDER_PATH)).digest("hex")
    : "";
  assertCase(
    block,
    "prior.providerShaRecorded",
    providerHash.length === 64,
    `ThemeProvider sha256 recorded (${providerHash.slice(0, 12)}…)`,
  );

  // Legacy noShell paths (UX-4.1 CA) — authorized path is app-shell/
  assertCase(
    block,
    "prior.legacyNoShellPaths",
    !existsSync(join(repoRoot, "src/components/layout/AppShell.tsx")) &&
      !existsSync(join(repoRoot, "src/components/AppShell.tsx")) &&
      !existsSync(join(repoRoot, "src/app/AppShell.tsx")),
    "UX-4.1 legacy AppShell paths still absent",
  );

  // Import fence: only host may import @/ui from app/components
  const offendersUi: string[] = [];
  const offendersRuntime: string[] = [];
  for (const base of ["src/app", "src/components"]) {
    for (const f of walkFiles(join(repoRoot, base))) {
      const rel = relative(repoRoot, f).replace(/\\/g, "/");
      const src = stripComments(readFileSync(f, "utf8"));
      if (/from\s+["']@\/ui["']/.test(src) || /from\s+["']@\/ui\//.test(src)) {
        if (rel !== HOST_PATH) {
          offendersUi.push(rel);
        }
      }
      if (
        /from\s+["'][^"']*ui\/theme\/runtime/.test(src) ||
        /from\s+["']@\/ui\/theme\/runtime/.test(src)
      ) {
        offendersRuntime.push(rel);
      }
    }
  }

  assertCase(
    block,
    "prior.importOnlyHostImportsUi",
    offendersUi.length === 0,
    offendersUi.length === 0
      ? "only theme-runtime-host.tsx imports @/ui"
      : `unexpected @/ui imports: ${offendersUi.join(", ")}`,
  );

  assertCase(
    block,
    "prior.noRuntimeInternals",
    offendersRuntime.length === 0,
    offendersRuntime.length === 0
      ? "no app/components import runtime internals"
      : `runtime internal imports: ${offendersRuntime.join(", ")}`,
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
      "metrics" in report &&
      "health" in report,
    "RuntimeReporter.build → RuntimeReportSnapshot shape",
  );

  assertCase(
    block,
    "prior.diagnosticsCollect",
    Object.keys(RuntimeDiagnostics).length === 1 &&
      typeof RuntimeDiagnostics.collect === "function" &&
      Object.isFrozen(RuntimeDiagnostics) &&
      viaDiag != null &&
      "health" in viaDiag,
    "RuntimeDiagnostics.collect freeze intact",
  );

  assertCase(
    block,
    "prior.pipelineRun",
    typeof RuntimePipeline.run === "function" &&
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
  { id: "appShellExists", pass: 1, ca: "CA-UX-4.2.1" },
  { id: "fiveRegions", pass: 2, ca: "CA-UX-4.2.3" },
  { id: "soleCompositionRoot", pass: 3, ca: "CA-UX-4.2.2" },
  { id: "layoutOnly", pass: 4, ca: "CA-UX-4.2.10" },
  { id: "reuseFence", pass: 5, ca: "CA-UX-4.2.4 / CA-UX-4.2.5 / CA-UX-4.2.6" },
  { id: "hostIntact", pass: 6, ca: "CA-UX-4.2.7" },
  { id: "runtimeFreeze", pass: 7, ca: "CA-UX-4.2.8 / CA-UX-4.2.9" },
  { id: "priorGate", pass: 8, ca: "CA-UX-4.2.12 (UX-4.1 inline)" },
  { id: "tscCompile", pass: 9, ca: "CA-UX-4.2.11" },
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
console.log("validate:ux-4.2");
console.log(allPass ? "PASS" : "FAIL");
if (allPass) {
  console.log("App Shell Foundation");
  console.log("AppShell = only composition root");
  console.log("WorkspaceLayout = transitional bridge");
  console.log("AppShell is layout-only");
  console.log("AdaptiveToolbar deferred to UX-4.4");
}
console.log(`${passCount}/${BLOCKS.length}`);

process.exit(allPass ? 0 : 1);
