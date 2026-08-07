/**
 * UX-I4 — Interaction & Window Experience gates.
 *
 * Presentation-only: windows / palette / tabs consume Design System
 * focus, elevation, motion. Behavior markers preserved.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
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

const BUILD =
  "docs/UX/implementation/UX-I4-Interaction-Window-Experience-BUILD.md";

function main(): void {
  assertCase(
    "docs.buildRecord",
    existsSync(join(repoRoot, BUILD)),
    "UX-I4 Build record exists"
  );
  const build = existsSync(join(repoRoot, BUILD)) ? read(BUILD) : "";
  assertCase(
    "docs.buildImplemented",
    build.includes("IMPLEMENTED") && build.includes("COMPLETE"),
    "Build record declares IMPLEMENTED / COMPLETE"
  );

  for (const domain of ["src/engine", "src/data", "src/ai"] as const) {
    assertCase(
      `domains.${domain}`,
      existsSync(join(repoRoot, domain)),
      `${domain} present`
    );
  }

  const chrome = read(
    "src/components/windows/InteractionChromeTokens.ts"
  );
  const focusHelper = read("src/lib/ui/focus-ring.ts");
  assertCase(
    "chrome.focusRing",
    (/--focus-ring-color/.test(chrome) && /--focus-ring-width/.test(chrome)) ||
      (/DS_FOCUS_RING/.test(chrome) &&
        /--focus-ring-color/.test(focusHelper) &&
        /--focus-ring-width/.test(focusHelper)),
    "InteractionChromeTokens consume --focus-ring-* (direct or via focus-ring helper)"
  );
  assertCase(
    "chrome.elevation",
    /--elevation-floating/.test(chrome) &&
      /--elevation-dialog/.test(chrome) &&
      /--elevation-popover/.test(chrome),
    "InteractionChromeTokens consume elevation roles"
  );
  assertCase(
    "chrome.motion",
    /--motion-feedback-duration/.test(chrome) ||
      (/DS_MOTION_FEEDBACK/.test(chrome) &&
        /--motion-feedback-duration/.test(focusHelper)),
    "InteractionChromeTokens consume motion tokens (direct or via focus-ring helper)"
  );

  const fw = read("src/components/windows/FloatingWindow.tsx");
  assertCase(
    "window.usesChromeTokens",
    /InteractionChromeTokens/.test(fw),
    "FloatingWindow imports InteractionChromeTokens"
  );
  assertCase(
    "window.elevationActive",
    /INTERACTION_ELEVATION\.active|--elevation-floating/.test(fw),
    "Active window uses floating elevation"
  );
  assertCase(
    "window.focusRing",
    /--focus-ring-color|INTERACTION_FOCUS_RING/.test(fw),
    "FloatingWindow uses certified focus presentation"
  );
  assertCase(
    "window.behaviorFrozen",
    /Visual Priority Freeze|Never mutates/.test(fw),
    "FloatingWindow behavior freezes documented"
  );

  const palette = read(
    "src/components/windows/commands/CommandPaletteDomHost.tsx"
  );
  assertCase(
    "palette.dialogElevation",
    /INTERACTION_ELEVATION\.dialog|--elevation-dialog/.test(palette),
    "Command Palette uses dialog elevation"
  );
  assertCase(
    "palette.focus",
    /INTERACTION_FOCUS_RING|--focus-ring/.test(palette),
    "Command Palette input/items use focus ring"
  );

  const tabs = read("src/components/windows/tab-ui/TabStrip.tsx");
  assertCase(
    "tabs.presentation",
    /INTERACTION_FOCUS_RING/.test(tabs) && /data-tab-active/.test(tabs),
    "TabStrip has DS presentation; active marker preserved"
  );
  assertCase(
    "tabs.propsOnly",
    /onSelect\?\.|onClose\(/.test(tabs) && !/useState|useEffect/.test(tabs),
    "TabStrip remains props-only (no new interaction model)"
  );

  assertCase(
    "ssot.themeProvider",
    existsSync(join(repoRoot, "src/ui/providers/theme-provider.tsx")),
    "Design System ThemeProvider present"
  );

  const prior = spawnSync("npm", ["run", "validate:ux-i3"], {
    stdio: "pipe",
    shell: true,
    cwd: repoRoot,
    encoding: "utf8",
  });
  assertCase(
    "prereq.uxI3",
    (prior.status ?? 1) === 0,
    (prior.status ?? 1) === 0
      ? "validate:ux-i3 PASS"
      : `validate:ux-i3 FAIL: ${(prior.stderr || prior.stdout || "").slice(0, 300)}`
  );

  const failed = results.filter((r) => !r.pass);
  console.log("UX-I4 — Interaction & Window Experience\n");
  for (const r of results) {
    console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.id} — ${r.detail}`);
  }
  console.log(
    failed.length === 0
      ? `\nPASS — validate:ux-i4 (${results.length} checks)`
      : `\nFAIL — ${failed.length}/${results.length} checks`
  );
  process.exit(failed.length === 0 ? 0 : 1);
}

main();
