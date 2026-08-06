/**
 * UX-I0 — Visual Modernization Foundation gates.
 *
 * G1 Architecture · G2 SSOT · G3 Boundaries · G4 Dual-stack · G5 Theme
 * G6 Non-regression (theme-runtime + planning artifact) · G7 Documentation
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

type CaseResult = { id: string; pass: boolean; detail: string };

const results: CaseResult[] = [];
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function assertCase(id: string, pass: boolean, detail: string): void {
  results.push({ id, pass, detail });
}

function read(rel: string): string {
  return readFileSync(join(repoRoot, rel), "utf8");
}

function walkFiles(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (name === "node_modules" || name === ".next" || name === "dist") continue;
      walkFiles(full, acc);
    } else if (/\.(ts|tsx)$/.test(name)) {
      acc.push(full);
    }
  }
  return acc;
}

const PLANNING =
  "docs/UX/implementation/UX-I0-Visual-Modernization-Foundation.md";
const BUILD =
  "docs/UX/implementation/UX-I0-Visual-Modernization-Foundation-BUILD.md";
const HOST = "src/app/theme-runtime-host.tsx";
const BRIDGE = "src/app/legacy-app-token-bridge.ts";
const TOKENS = "src/lib/ui/tokens.ts";
const GLOBALS = "src/app/globals.css";

/* G5 — Theme contract still resolvable */
async function assertThemes(): Promise<void> {
  const { getThemeCssVars, THEME_IDS } = await import("../src/ui/theme");
  for (const id of THEME_IDS) {
    const vars = getThemeCssVars(id);
    assertCase(
      `g5.themeResolves.${id}`,
      typeof vars["--color-surface-canvas"] === "string" &&
        typeof vars["--color-text-primary"] === "string",
      `ThemeId ${id} resolves surface/text CSS vars`
    );
  }
}

async function main(): Promise<void> {
  /* G7 — Documentation / planning */
  {
    assertCase(
      "g7.planningRecord",
      existsSync(join(repoRoot, PLANNING)),
      "UX-I0 Planning record exists"
    );
    const plan = existsSync(join(repoRoot, PLANNING)) ? read(PLANNING) : "";
    assertCase(
      "g7.planningCertified",
      plan.includes("PLANNING CERTIFIED"),
      "Planning record declares PLANNING CERTIFIED"
    );
    assertCase(
      "g7.buildRecord",
      existsSync(join(repoRoot, BUILD)),
      "UX-I0 Build completion record exists"
    );
  }

  /* G1 / G3 — Host + bridge + forbidden domains */
  {
    const host = read(HOST);
    assertCase(
      "g1.hostMountsProvider",
      /ThemeProvider/.test(host) && /defaultTheme\s*=\s*["']light["']/.test(host),
      "ThemeRuntimeHost mounts ThemeProvider defaultTheme=light"
    );
    assertCase(
      "g1.hostUsesBridge",
      /legacyAppTokenBridgeStyle|legacy-app-token-bridge/.test(host) &&
        /data-ux-i0-bridge/.test(host),
      "ThemeRuntimeHost applies UX-I0 legacy token bridge"
    );
    assertCase(
      "g1.hostNoUiTokens",
      !/\bUI_TOKENS\b/.test(host) && !/\bthemeMode\b/.test(host),
      "Host does not bridge themeMode / UI_TOKENS"
    );
    assertCase(
      "g1.bridgeExists",
      existsSync(join(repoRoot, BRIDGE)),
      "legacy-app-token-bridge.ts exists"
    );

    const bridge = read(BRIDGE);
    assertCase(
      "g2.bridgeConsumesColorVars",
      /--color-surface-default/.test(bridge) &&
        /--color-brand-primary/.test(bridge) &&
        /--app-surface/.test(bridge),
      "Bridge maps --app-* → --color-* (consume DS)"
    );
    assertCase(
      "g2.bridgeNoUiImport",
      !/from\s+["']@\/ui/.test(bridge),
      "Bridge does not import @/ui (no DS fork)"
    );

    for (const domain of ["src/engine", "src/data", "src/ai"] as const) {
      assertCase(
        `g3.domainPresent.${domain}`,
        existsSync(join(repoRoot, domain)),
        `${domain} remains present (RELEASE CERTIFIED; not deleted)`
      );
    }
  }

  /* G2 / G4 — Shell tokens */
  {
    const tokens = read(TOKENS);
    assertCase(
      "g4.noHexShellPalette",
      !/#ecebe8/.test(tokens) && !/#1b2028/.test(tokens) && !/#f9f8f6/.test(tokens),
      "layout.appShell no longer injects legacy hex palette"
    );
    assertCase(
      "g4.shellUsesColorCanvas",
      /appShellLight:[\s\S]*--color-surface-canvas/.test(tokens),
      "appShellLight consumes --color-surface-canvas"
    );
    assertCase(
      "g4.noLiteralAppOverridesInLayout",
      !/appShellLight:[\s\S]*?\[--app-surface:/.test(tokens),
      "appShellLight does not define local --app-* literal overrides"
    );
    assertCase(
      "g2.sharedTokensPreferColor",
      /--color-border-default/.test(tokens) &&
        /--color-brand-primary/.test(tokens) &&
        /--color-text-primary/.test(tokens),
      "UI_TOKENS chrome prefers --color-* vars"
    );
  }

  await assertThemes();

  /* Adoption — app-shell / status-bar */
  {
    const shellFiles = [
      ...walkFiles(join(repoRoot, "src/components/app-shell")),
      ...walkFiles(join(repoRoot, "src/components/status-bar")),
    ];
    const offenders: string[] = [];
    for (const full of shellFiles) {
      const src = readFileSync(full, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
      if (/--app-/.test(src)) {
        offenders.push(relative(repoRoot, full).replace(/\\/g, "/"));
      }
    }
    assertCase(
      "g4.chromeNoAppVars",
      offenders.length === 0,
      offenders.length === 0
        ? "app-shell/status-bar use no --app-*"
        : `--app-* in chrome: ${offenders.join(", ")}`
    );
  }

  /* Globals */
  {
    const globals = read(GLOBALS);
    assertCase(
      "g1.globalsNoPrefersDarkOverride",
      !/prefers-color-scheme:\s*dark/.test(globals),
      "globals.css no longer fights ThemeProvider with prefers-color-scheme dark"
    );
    assertCase(
      "g1.globalsHostUsesColorCanvas",
      /body\s*>\s*\[data-theme\][\s\S]*--color-surface-canvas/.test(globals),
      "globals.css paints [data-theme] host with --color-surface-canvas"
    );
  }

  /* G6 — theme-runtime prior gate */
  {
    const prior = spawnSync("npm", ["run", "validate:theme-runtime"], {
      stdio: "pipe",
      shell: true,
      cwd: repoRoot,
      encoding: "utf8",
    });
    assertCase(
      "g6.themeRuntime",
      (prior.status ?? 1) === 0,
      (prior.status ?? 1) === 0
        ? "validate:theme-runtime PASS"
        : `validate:theme-runtime FAIL: ${(prior.stderr || prior.stdout || "").slice(0, 400)}`
    );
  }

  const failed = results.filter((r) => !r.pass);
  console.log("UX-I0 — Visual Modernization Foundation\n");
  for (const r of results) {
    console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.id} — ${r.detail}`);
  }
  console.log(
    failed.length === 0
      ? `\nPASS — validate:ux-i0 (${results.length} checks)`
      : `\nFAIL — ${failed.length}/${results.length} checks`
  );
  process.exit(failed.length === 0 ? 0 : 1);
}

main();
