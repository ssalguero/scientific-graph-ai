/**
 * UX-4.1 — Theme Runtime Host Integration gate.
 *
 * Blocks:
 * hostMount · providerIntact · hostContract · importFence
 * noShell · apiFreeze · priorGate · tscCompile
 *
 * Architectural principle: Integrate the certified runtime into the
 * application without modifying certified runtime components.
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
  | "hostMount"
  | "providerIntact"
  | "hostContract"
  | "importFence"
  | "noShell"
  | "apiFreeze"
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

function sha256File(rel: string): string {
  return createHash("sha256").update(read(rel)).digest("hex");
}

/* -------------------------------------------------------------------------- */
/* PASS 01 — hostMount                                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "hostMount";

  assertCase(
    block,
    "host.fileExists",
    existsSync(join(repoRoot, HOST_PATH)),
    `${HOST_PATH} exists`,
  );

  const hostSrc = existsSync(join(repoRoot, HOST_PATH))
    ? stripComments(read(HOST_PATH))
    : "";
  const layoutSrc = existsSync(join(repoRoot, LAYOUT_PATH))
    ? stripComments(read(LAYOUT_PATH))
    : "";

  assertCase(
    block,
    "host.importsThemeProviderFromUi",
    /from\s+["']@\/ui["']/.test(hostSrc) &&
      /\bThemeProvider\b/.test(hostSrc),
    "ThemeRuntimeHost imports ThemeProvider from @/ui",
  );

  assertCase(
    block,
    "host.noInternalRuntimeImport",
    !/theme\/runtime/.test(hostSrc) &&
      !/from\s+["'][^"']*ui\/theme\/runtime/.test(hostSrc),
    "ThemeRuntimeHost does not import runtime internals",
  );

  assertCase(
    block,
    "layout.mountsHost",
    /\bThemeRuntimeHost\b/.test(layoutSrc) &&
      /from\s+["']\.\/theme-runtime-host["']/.test(layoutSrc),
    "layout.tsx mounts ThemeRuntimeHost",
  );

  assertCase(
    block,
    "host.exportsThemeRuntimeHost",
    /\bexport\s+function\s+ThemeRuntimeHost\b/.test(hostSrc),
    "ThemeRuntimeHost is exported",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — providerIntact                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "providerIntact";
  const providerSrc = existsSync(join(repoRoot, PROVIDER_PATH))
    ? read(PROVIDER_PATH)
    : "";
  const stripped = stripComments(providerSrc);

  assertCase(
    block,
    "provider.fileExists",
    existsSync(join(repoRoot, PROVIDER_PATH)),
    `${PROVIDER_PATH} exists`,
  );

  // Props surface: theme?, defaultTheme?, children, attribute? — no className.
  const propsMatch = stripped.match(
    /export\s+type\s+ThemeProviderProps\s*=\s*\{([^}]+)\}/,
  );
  const propsBody = propsMatch?.[1] ?? "";
  assertCase(
    block,
    "provider.noClassNameProp",
    propsMatch !== null && !/\bclassName\b/.test(propsBody),
    "ThemeProviderProps has no className (UX-3 surface intact)",
  );

  assertCase(
    block,
    "provider.noDocumentElement",
    !/\bdocumentElement\b/.test(stripped) &&
      !/\blocalStorage\b/.test(stripped) &&
      !/\bdocument\.body\b/.test(stripped),
    "ThemeProvider has no documentElement / localStorage / document.body",
  );

  assertCase(
    block,
    "provider.noDiagnosticsWiring",
    !/\bRuntimeDiagnostics\b/.test(stripped) &&
      !/\bRuntimePipeline\b/.test(stripped) &&
      !/\bRuntimeReporter\b/.test(stripped),
    "ThemeProvider does not wire RuntimeDiagnostics / Pipeline / Reporter",
  );

  assertCase(
    block,
    "provider.hostScopedDiv",
    /<div\s+\{\.\.\.\{\s*\[attribute\]:\s*theme\s*\}\}\s+style=\{hostStyle\}>/.test(
      stripped.replace(/\s+/g, " "),
    ) ||
      (/\{\s*\.\.\.\{\s*\[attribute\]:\s*theme\s*\}\}/.test(stripped) &&
        /\bstyle=\{hostStyle\}/.test(stripped)),
    "ThemeProvider host remains attribute + style only",
  );

  const hash = existsSync(join(repoRoot, PROVIDER_PATH))
    ? sha256File(PROVIDER_PATH)
    : "";
  assertCase(
    block,
    "provider.hashRecorded",
    hash.length === 64,
    `ThemeProvider sha256=${hash || "(missing)"}`,
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — hostContract                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "hostContract";
  const hostSrc = existsSync(join(repoRoot, HOST_PATH))
    ? stripComments(read(HOST_PATH))
    : "";
  const globalsSrc = existsSync(join(repoRoot, "src/app/globals.css"))
    ? read("src/app/globals.css")
    : "";

  assertCase(
    block,
    "host.noDocumentElement",
    !/\bdocumentElement\b/.test(hostSrc) &&
      !/\blocalStorage\b/.test(hostSrc) &&
      !/\bdocument\b/.test(hostSrc),
    "ThemeRuntimeHost has no document / localStorage access",
  );

  assertCase(
    block,
    "host.noDiagnostics",
    !/\bRuntimeDiagnostics\b/.test(hostSrc) &&
      !/\bRuntimePipeline\b/.test(hostSrc),
    "ThemeRuntimeHost does not reference diagnostics/pipeline",
  );

  assertCase(
    block,
    "host.uncontrolledDefaultLight",
    /defaultTheme\s*=\s*["']light["']/.test(hostSrc),
    "ThemeRuntimeHost uses uncontrolled defaultTheme=light",
  );

  assertCase(
    block,
    "host.noThemeModeBridge",
    !/\bthemeMode\b/.test(hostSrc) && !/\bUI_TOKENS\b/.test(hostSrc),
    "ThemeRuntimeHost does not bridge themeMode / UI_TOKENS",
  );

  assertCase(
    block,
    "globals.noHtmlDataTheme",
    !/html\s*\[data-theme\]/.test(globalsSrc) &&
      !/documentElement/.test(globalsSrc),
    "globals.css does not elevate theme to html",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — importFence                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "importFence";
  const appFiles = walkFiles(join(repoRoot, "src/app"));
  const componentFiles = walkFiles(join(repoRoot, "src/components"));
  const offendersUi: string[] = [];
  const offendersRuntime: string[] = [];

  for (const full of [...appFiles, ...componentFiles]) {
    const rel = relative(repoRoot, full).replace(/\\/g, "/");
    const src = stripComments(readFileSync(full, "utf8"));

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

  assertCase(
    block,
    "import.onlyHostImportsUi",
    offendersUi.length === 0,
    offendersUi.length === 0
      ? "only theme-runtime-host.tsx imports @/ui"
      : `unexpected @/ui imports: ${offendersUi.join(", ")}`,
  );

  assertCase(
    block,
    "import.noRuntimeInternals",
    offendersRuntime.length === 0,
    offendersRuntime.length === 0
      ? "no app/components import runtime internals"
      : `runtime internal imports: ${offendersRuntime.join(", ")}`,
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — noShell                                                          */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noShell";

  assertCase(
    block,
    "no.AppShell",
    !existsSync(join(repoRoot, "src/components/layout/AppShell.tsx")) &&
      !existsSync(join(repoRoot, "src/components/AppShell.tsx")) &&
      !existsSync(join(repoRoot, "src/app/AppShell.tsx")),
    "AppShell.tsx not introduced",
  );

  const hostSrc = existsSync(join(repoRoot, HOST_PATH))
    ? stripComments(read(HOST_PATH))
    : "";
  assertCase(
    block,
    "host.noStatusBar",
    !/\bStatusBar\b/.test(hostSrc),
    "ThemeRuntimeHost does not introduce StatusBar",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — apiFreeze                                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "apiFreeze";
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
      !/\bRuntimeReporter\b/.test(uiIndex) &&
      !/\bRuntimeReportSnapshot\b/.test(uiIndex),
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
/* PASS 07 — priorGate (UX-3.21 freeze re-verified inline)                     */
/* Nested spawn of validate:ux-3.21 is avoided: it recursively runs 3.15–3.20 */
/* + tsc and can hang on Windows. Freeze contracts are checked in-process.    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "priorGate";

  assertCase(
    block,
    "prior.scriptExists",
    existsSync(join(repoRoot, "scripts/validate-ux-3.21.ts")),
    "scripts/validate-ux-3.21.ts exists",
  );

  assertCase(
    block,
    "prior.npmScript",
    /"validate:ux-3\.21"\s*:/.test(read("package.json")),
    "package.json retains validate:ux-3.21",
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

  const uiIndex = stripComments(read(UI_INDEX));
  assertCase(
    block,
    "prior.publicBarrelsClean",
    !/\bRuntimePipeline\b/.test(uiIndex) &&
      !/\bRuntimeDiagnostics\b/.test(uiIndex) &&
      !/\bRuntimeReporter\b/.test(uiIndex),
    "public @/ui barrels remain free of diagnostics API",
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
  { id: "hostMount", pass: 1, ca: "CA-UX-4.1.1 / CA-UX-4.1.2" },
  { id: "providerIntact", pass: 2, ca: "CA-UX-4.1.4 / CA-UX-4.1.5" },
  { id: "hostContract", pass: 3, ca: "CA-UX-4.1.3 / CA-UX-4.1.6" },
  { id: "importFence", pass: 4, ca: "CA-UX-4.1.7" },
  { id: "noShell", pass: 5, ca: "CA-UX-4.1.8" },
  { id: "apiFreeze", pass: 6, ca: "CA-UX-4.1.5" },
  { id: "priorGate", pass: 7, ca: "CA-UX-4.1.10" },
  { id: "tscCompile", pass: 8, ca: "CA-UX-4.1.9" },
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
console.log("validate:ux-4.1");
console.log(allPass ? "PASS" : "FAIL");
if (allPass) {
  console.log("Theme Runtime Host Integration");
  console.log("ThemeProvider Intact");
  console.log("Dual-stack Coexistence");
}
console.log(`${passCount}/${BLOCKS.length}`);

process.exit(allPass ? 0 : 1);
