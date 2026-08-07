/**
 * UX-I5 — UX Polish, Accessibility & Certification gates.
 *
 * Presentation-only: focus, motion, a11y polish + certification package.
 * No functional / architectural / Design System source changes.
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
  "docs/UX/implementation/UX-I5-UX-Polish-Accessibility-Certification-BUILD.md";
const CERT = "docs/UX/certification/CERTIFICATION.md";

function main(): void {
  assertCase(
    "docs.buildRecord",
    existsSync(join(repoRoot, BUILD)),
    "UX-I5 Build record exists"
  );
  const build = existsSync(join(repoRoot, BUILD)) ? read(BUILD) : "";
  assertCase(
    "docs.buildImplemented",
    build.includes("IMPLEMENTED") &&
      build.includes("COMPLETE") &&
      build.includes("UX RELEASE CERTIFIED"),
    "Build record declares IMPLEMENTED / COMPLETE / UX RELEASE CERTIFIED"
  );

  assertCase(
    "docs.certification",
    existsSync(join(repoRoot, CERT)),
    "CERTIFICATION.md exists"
  );
  const cert = existsSync(join(repoRoot, CERT)) ? read(CERT) : "";
  assertCase(
    "docs.certRelease",
    /RELEASE CERTIFIED/.test(cert),
    "Certification declares RELEASE CERTIFIED"
  );

  for (const rel of [
    "docs/UX/certification/ACCESSIBILITY.md",
    "docs/UX/certification/VISUAL_CONSISTENCY.md",
    "docs/UX/certification/EVIDENCE.md",
  ] as const) {
    assertCase(
      `docs.${rel.split("/").pop()}`,
      existsSync(join(repoRoot, rel)),
      `${rel} present`
    );
  }

  for (const domain of ["src/engine", "src/data", "src/ai"] as const) {
    assertCase(
      `domains.${domain}`,
      existsSync(join(repoRoot, domain)),
      `${domain} present`
    );
  }

  const focus = read("src/lib/ui/focus-ring.ts");
  assertCase(
    "polish.focusRing",
    /DS_FOCUS_RING/.test(focus) && /--focus-ring-color/.test(focus),
    "focus-ring.ts exports DS_FOCUS_RING with --focus-ring-*"
  );
  assertCase(
    "polish.motionReduce",
    /motion-reduce:transition-none/.test(focus),
    "Shared motion helpers honor prefers-reduced-motion"
  );

  const tokens = read("src/lib/ui/tokens.ts");
  assertCase(
    "tokens.focusImport",
    /from ["']\.\/focus-ring["']/.test(tokens) && /DS_FOCUS_RING/.test(tokens),
    "UI_TOKENS consume DS_FOCUS_RING"
  );
  assertCase(
    "tokens.motionReduce",
    /motion-reduce:transition-none/.test(tokens),
    "UI_TOKENS transitions include motion-reduce"
  );

  const host = read("src/app/theme-runtime-host.tsx");
  assertCase(
    "a11y.skipLink",
    /ux-skip-link/.test(host) &&
      /#main-content/.test(host) &&
      /id=["']main-content["']/.test(host),
    "ThemeRuntimeHost provides skip link and #main-content target"
  );

  const globals = read("src/app/globals.css");
  assertCase(
    "a11y.globals",
    /prefers-reduced-motion/.test(globals) && /\.ux-skip-link/.test(globals),
    "globals.css has reduced-motion + skip-link styles"
  );

  const busy = read(
    "src/components/workspace/status/PanelBusyOverlay.tsx"
  );
  assertCase(
    "a11y.busyLive",
    /aria-live=["']polite["']/.test(busy) && /role=["']status["']/.test(busy),
    "PanelBusyOverlay exposes polite status live region"
  );

  const reveal = read(
    "src/components/workspace/disclosure/RevealButton.tsx"
  );
  assertCase(
    "polish.reveal",
    /DS_FOCUS_RING/.test(reveal),
    "RevealButton uses DS_FOCUS_RING"
  );

  assertCase(
    "ssot.themeProvider",
    existsSync(join(repoRoot, "src/ui/providers/theme-provider.tsx")),
    "Design System ThemeProvider present"
  );

  const prior = spawnSync("npm", ["run", "validate:ux-i4"], {
    stdio: "pipe",
    shell: true,
    cwd: repoRoot,
    encoding: "utf8",
  });
  assertCase(
    "prereq.uxI4",
    (prior.status ?? 1) === 0,
    (prior.status ?? 1) === 0
      ? "validate:ux-i4 PASS"
      : `validate:ux-i4 FAIL: ${(prior.stderr || prior.stdout || "").slice(0, 300)}`
  );

  const failed = results.filter((r) => !r.pass);
  console.log("UX-I5 — UX Polish, Accessibility & Certification\n");
  for (const r of results) {
    console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.id} — ${r.detail}`);
  }
  console.log(
    failed.length === 0
      ? `\nPASS — validate:ux-i5 (${results.length} checks)`
      : `\nFAIL — ${failed.length}/${results.length} checks`
  );
  process.exit(failed.length === 0 ? 0 : 1);
}

main();
