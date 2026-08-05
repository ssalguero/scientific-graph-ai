/**
 * UX-9.1 — Workspace Activation gate.
 *
 * Blocks:
 * documentationExists · activationArchitecture · productCompositionHostUsage
 * providerComposition · activationSemanticsFreeze · chromeFreeze · tokenFreeze
 * activationSeedFreeze · dependencyRule · authorities · noNewInfrastructure
 * visibleUserOutcomeDocumented · noHistoricalMutation · roadmapUpdated
 * packageScript · productionIntegration · validatorPass
 *
 * Architectural principles:
 * - Visual Integration · no parallel infrastructure
 * - ProductCompositionHost owns composition
 * - Workspace Active → Window Chrome → User Feedback
 * - Activation Seed Freeze · Token Freeze · Chrome Freeze
 * - Visible User Outcome triad required
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "documentationExists"
  | "activationArchitecture"
  | "productCompositionHostUsage"
  | "providerComposition"
  | "activationSemanticsFreeze"
  | "chromeFreeze"
  | "tokenFreeze"
  | "activationSeedFreeze"
  | "dependencyRule"
  | "authorities"
  | "noNewInfrastructure"
  | "visibleUserOutcomeDocumented"
  | "noHistoricalMutation"
  | "roadmapUpdated"
  | "packageScript"
  | "productionIntegration"
  | "validatorPass";

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

function exists(rel: string): boolean {
  return existsSync(join(repoRoot, rel));
}

function hasHeading(doc: string, title: string): boolean {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^#{1,3}\\s+${escaped}\\s*$`, "m").test(doc);
}

function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

/** Body until the next H2 (allows ### subsections inside). */
function sectionBody(doc: string, title: string): string {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(
    `^##\\s+${escaped}\\s*$([\\s\\S]*?)(?=^##\\s+|\\Z)`,
    "m",
  );
  const m = re.exec(doc);
  return m?.[1] ?? "";
}

const DOC = "docs/UX/UX-9.1.md";
const ARCH = "docs/UX/UX-9-architecture.md";
const ROADMAP = "docs/UX/UX-9.0-roadmap.md";
const PACKAGE_JSON = "package.json";
const VALIDATOR_SELF = "scripts/validate-ux-9.1.ts";
const HOST = "src/components/windows/ProductCompositionHost.tsx";
const PAGE = "src/app/page.tsx";
const FLOATING = "src/components/windows/FloatingWindow.tsx";
const BRIDGE = "src/components/windows/FloatingWindowBridge.tsx";
const BARREL = "src/components/windows/index.ts";

const REQUIRED_HEADINGS = [
  "Executive Summary",
  "Scope Fence",
  "Architecture",
  "Activation Semantics Freeze",
  "Chrome Freeze",
  "Token Freeze",
  "Activation Seed Freeze",
  "Provider Composition Freeze",
  "Dependency Rule",
  "Authorities",
  "Visible User Outcome",
  "Acceptance Criteria",
  "Protected Files",
  "Gate",
] as const;

const FORBIDDEN_REGISTRY_PATHS = [
  "src/ui/focus/FocusRegistry.ts",
  "src/ui/selection/SelectionRegistry.ts",
  "src/ui/hover/HoverRegistry.ts",
  "src/ui/clipboard/ClipboardRegistry.ts",
  "src/ui/interaction-commands/InteractionCommandDispatcher.ts",
  "src/ui/visibility/VisibilityRegistry.ts",
  "src/components/windows/WindowRegistry.ts",
] as const;

const COLOR_LITERAL_RE =
  /#[0-9a-fA-F]{3,8}\b|\brgba?\s*\(|\bhsla?\s*\(/;

/* -------------------------------------------------------------------------- */
/* PASS 1 — documentationExists                                               */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "documentationExists";
  assertCase(block, "doc-exists", exists(DOC), `${DOC} exists`);
  assertCase(block, "arch-exists", exists(ARCH), `${ARCH} exists`);
  assertCase(block, "host-exists", exists(HOST), `${HOST} exists`);
  assertCase(
    block,
    "validator-exists",
    exists(VALIDATOR_SELF),
    `${VALIDATOR_SELF} exists`,
  );

  if (exists(DOC)) {
    const doc = read(DOC);
    for (const heading of REQUIRED_HEADINGS) {
      assertCase(
        block,
        `heading-${heading}`,
        hasHeading(doc, heading),
        `heading "${heading}"`,
      );
    }
    assertCase(
      block,
      "next-ux-9.2",
      /UX-9\.2/i.test(doc) && /Next/i.test(doc),
      "documents Next UX-9.2",
    );
    assertCase(
      block,
      "smallest-integration",
      /Smallest Possible Production Integration/i.test(doc) &&
        /extend/i.test(doc) &&
        /never replace/i.test(doc),
      "smallest production integration note",
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 2 — activationArchitecture                                            */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "activationArchitecture";
  const doc = exists(DOC) ? read(DOC) : "";
  const host = exists(HOST) ? read(HOST) : "";

  assertCase(
    block,
    "chain-documented",
    /Workspace Active/i.test(doc) &&
      /Window Chrome/i.test(doc) &&
      /User Feedback/i.test(doc),
    "activation chain documented",
  );
  assertCase(
    block,
    "host-window-manager",
    /\bWindowManager\b/.test(host),
    "host mounts WindowManager",
  );
  assertCase(
    block,
    "host-focus-provider",
    /\bFocusProvider\b/.test(host),
    "host mounts FocusProvider",
  );
  assertCase(
    block,
    "host-order",
    /WindowManager[\s\S]*FocusProvider/.test(host),
    "WindowManager wraps FocusProvider",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 3 — productCompositionHostUsage                                       */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "productCompositionHostUsage";
  const page = exists(PAGE) ? read(PAGE) : "";
  const barrel = exists(BARREL) ? read(BARREL) : "";

  assertCase(
    block,
    "page-imports-host",
    /ProductCompositionHost/.test(page) &&
      /from\s+["']@\/components\/windows["']/.test(page),
    "page imports ProductCompositionHost",
  );
  assertCase(
    block,
    "page-mounts-host",
    /<ProductCompositionHost[\s>]/.test(page) &&
      /<\/ProductCompositionHost>/.test(page),
    "page mounts ProductCompositionHost",
  );
  assertCase(
    block,
    "page-no-direct-window-manager",
    !/<WindowManager[\s>]/.test(page),
    "page does not mount WindowManager directly",
  );
  assertCase(
    block,
    "barrel-exports-host",
    /ProductCompositionHost/.test(barrel),
    "windows barrel exports ProductCompositionHost",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 4 — providerComposition                                               */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "providerComposition";
  const host = exists(HOST) ? read(HOST) : "";
  const page = exists(PAGE) ? read(PAGE) : "";

  const hostCode = stripComments(host);
  const pageCode = stripComments(page);

  assertCase(
    block,
    "no-visibility-provider",
    !/\bVisibilityProvider\b/.test(hostCode) &&
      !/\bVisibilityProvider\b/.test(pageCode),
    "no VisibilityProvider invented",
  );
  assertCase(
    block,
    "no-new-provider-decl",
    !/function\s+\w+Provider\s*\(/.test(hostCode) &&
      !/const\s+\w+Provider\s*=/.test(hostCode),
    "host invents no new *Provider",
  );
  assertCase(
    block,
    "focus-from-certified",
    /from\s+["']@\/ui\/focus["']/.test(host),
    "FocusProvider imported from @/ui/focus",
  );
  assertCase(
    block,
    "page-no-focus-provider",
    !/from\s+["'][^"']*focus[^"']*["']/.test(pageCode) &&
      !/<FocusProvider[\s>]/.test(pageCode),
    "page does not mount FocusProvider ad-hoc",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 5 — activationSemanticsFreeze                                         */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "activationSemanticsFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const floating = exists(FLOATING) ? read(FLOATING) : "";

  assertCase(
    block,
    "semantics-heading",
    hasHeading(doc, "Activation Semantics Freeze"),
    "Activation Semantics Freeze section",
  );
  assertCase(
    block,
    "three-concepts",
    /Workspace Active/i.test(doc) &&
      /Window Focus/i.test(doc) &&
      /Panel Selection/i.test(doc),
    "three concepts distinguished",
  );
  const floatingCode = stripComments(floating);

  assertCase(
    block,
    "chrome-uses-activeId",
    /activeId/.test(floatingCode),
    "FloatingWindow reads activeId",
  );
  assertCase(
    block,
    "no-focus-registry-chrome",
    !/focusRegistry/i.test(floatingCode) &&
      !/useFocus\s*\(/.test(floatingCode) &&
      !/from\s+["']@\/ui\/focus["']/.test(floatingCode),
    "FloatingWindow does not wire FocusRegistry",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 6 — chromeFreeze                                                      */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "chromeFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const floating = exists(FLOATING) ? read(FLOATING) : "";
  const bridge = exists(BRIDGE) ? read(BRIDGE) : "";

  assertCase(
    block,
    "chrome-heading",
    hasHeading(doc, "Chrome Freeze"),
    "Chrome Freeze section",
  );
  assertCase(
    block,
    "data-workspace-active",
    /data-workspace-active/.test(floating),
    "active indicator attribute present",
  );
  assertCase(
    block,
    "bridge-activate",
    /\.activate\s*\(/.test(bridge),
    "bridge calls api.activate",
  );
  assertCase(
    block,
    "no-zindex-mutation",
    !/zIndex\s*=\s*[^1]/.test(bridge.replace(/zIndex,\s*$/m, "")) ||
      /let zIndex = 1/.test(bridge),
    "bridge keeps sequential zIndex mapping (no active-driven z-order)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 7 — tokenFreeze                                                       */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "tokenFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const floating = exists(FLOATING) ? read(FLOATING) : "";
  const host = exists(HOST) ? read(HOST) : "";

  assertCase(
    block,
    "token-heading",
    hasHeading(doc, "Token Freeze"),
    "Token Freeze section",
  );
  assertCase(
    block,
    "uses-ui-tokens",
    /UI_TOKENS/.test(floating),
    "FloatingWindow uses UI_TOKENS",
  );
  assertCase(
    block,
    "uses-css-vars",
    /var\(--app-/.test(floating),
    "FloatingWindow uses existing --app-* CSS variables",
  );

  const floatingNoComments = floating
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  const hostNoComments = host
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

  assertCase(
    block,
    "no-hardcoded-colors-floating",
    !COLOR_LITERAL_RE.test(floatingNoComments),
    "FloatingWindow has no hardcoded color literals",
  );
  assertCase(
    block,
    "no-hardcoded-colors-host",
    !COLOR_LITERAL_RE.test(hostNoComments),
    "ProductCompositionHost has no hardcoded color literals",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 8 — activationSeedFreeze                                              */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "activationSeedFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const host = exists(HOST) ? read(HOST) : "";

  assertCase(
    block,
    "seed-heading",
    hasHeading(doc, "Activation Seed Freeze"),
    "Activation Seed Freeze section",
  );
  assertCase(
    block,
    "temporary-utility",
    /temporary integration utility/i.test(doc) &&
      /MUST NOT become a permanent source/i.test(doc),
    "seed documented as temporary utility",
  );
  assertCase(
    block,
    "seed-component",
    /WorkspaceActivationSeed/.test(host),
    "WorkspaceActivationSeed present in host",
  );
  assertCase(
    block,
    "seed-noop-guard",
    /windows\.size\s*>\s*0/.test(host) || /size\s*>\s*0/.test(host),
    "seed NO-OP when windows already exist",
  );
  assertCase(
    block,
    "seed-creates-pair",
    (host.match(/api\.create\s*\(/g) ?? []).length >= 2,
    "seed creates two windows when empty",
  );
  assertCase(
    block,
    "seed-activates",
    /api\.activate\s*\(/.test(host),
    "seed activates one window",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 9 — dependencyRule                                                    */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "dependencyRule";
  const doc = exists(DOC) ? read(DOC) : "";
  const host = exists(HOST) ? read(HOST) : "";
  const floating = exists(FLOATING) ? read(FLOATING) : "";

  assertCase(
    block,
    "dep-heading",
    hasHeading(doc, "Dependency Rule"),
    "Dependency Rule section",
  );
  assertCase(
    block,
    "no-cross-registry",
    /No cross-registry/i.test(doc),
    "no cross-registry mutation documented",
  );
  assertCase(
    block,
    "no-selection-import",
    !/@\/ui\/selection/.test(host) && !/@\/ui\/selection/.test(floating),
    "no Selection module import in integration chrome",
  );
  assertCase(
    block,
    "no-hover-import",
    !/@\/ui\/hover/.test(host) && !/@\/ui\/hover/.test(floating),
    "no Hover module import in integration chrome",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 10 — authorities                                                      */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "authorities";
  const doc = exists(DOC) ? read(DOC) : "";

  assertCase(
    block,
    "authorities-heading",
    hasHeading(doc, "Authorities"),
    "Authorities section",
  );
  assertCase(
    block,
    "window-lifecycle",
    /WindowManager/i.test(doc) && /lifecycle/i.test(doc),
    "Window lifecycle → WindowManager",
  );
  assertCase(
    block,
    "focus-authority",
    /FocusRegistry/i.test(doc),
    "Focus → FocusRegistry",
  );
  assertCase(
    block,
    "visibility-authority",
    /VisibilityRegistry/i.test(doc),
    "Visibility → VisibilityRegistry",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 11 — noNewInfrastructure                                              */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "noNewInfrastructure";
  const host = exists(HOST) ? read(HOST) : "";
  const doc = exists(DOC) ? read(DOC) : "";

  const hostCode = stripComments(host);

  assertCase(
    block,
    "no-create-context",
    !/createContext\s*\(/.test(hostCode),
    "host creates no Context",
  );
  assertCase(
    block,
    "no-create-registry",
    !/create\w*Registry\s*\(/.test(hostCode),
    "host creates no Registry",
  );
  assertCase(
    block,
    "no-dispatcher",
    !/\b\w*Dispatcher\b/.test(hostCode) &&
      !/create\w*Dispatcher\s*\(/.test(hostCode),
    "host creates no Dispatcher",
  );
  assertCase(
    block,
    "doc-forbids-parallel",
    /No new Registry/i.test(doc) || /NO new Registry/i.test(doc),
    "doc forbids parallel infrastructure",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 12 — visibleUserOutcomeDocumented                                     */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "visibleUserOutcomeDocumented";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Visible User Outcome");

  assertCase(
    block,
    "vuo-heading",
    hasHeading(doc, "Visible User Outcome"),
    "Visible User Outcome section exists",
  );
  assertCase(
    block,
    "vuo-visible-changes",
    /Visible Changes/i.test(body),
    "contains Visible Changes",
  );
  assertCase(
    block,
    "vuo-reused-infrastructure",
    /Reused Infrastructure/i.test(body),
    "contains Reused Infrastructure",
  );
  assertCase(
    block,
    "vuo-user-verification",
    /User Verification/i.test(body),
    "contains User Verification",
  );
  assertCase(
    block,
    "vuo-no-devtools",
    /without DevTools/i.test(body) || /Without DevTools/i.test(body),
    "verification without DevTools",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 13 — noHistoricalMutation                                             */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "noHistoricalMutation";

  for (const rel of FORBIDDEN_REGISTRY_PATHS) {
    assertCase(block, `exists-${rel}`, exists(rel), `${rel} still present`);
  }

  assertCase(
    block,
    "ux-8-10-intact",
    exists("docs/UX/UX-8.10.md") && exists("scripts/validate-ux-8.10.ts"),
    "UX-8.10 certification evidence intact",
  );
  assertCase(
    block,
    "arch-ssot-intact",
    exists(ARCH),
    "UX-9 architecture SSOT intact",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 14 — roadmapUpdated                                                   */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "roadmapUpdated";
  const roadmap = exists(ROADMAP) ? read(ROADMAP) : "";

  assertCase(
    block,
    "ux91-complete",
    /UX-9\.1[^\n]*COMPLETE/i.test(roadmap),
    "UX-9.1 marked COMPLETE",
  );
  assertCase(
    block,
    "ux92-pending",
    /UX-9\.2[^\n]*PENDING/i.test(roadmap),
    "UX-9.2 remains PENDING",
  );
  assertCase(
    block,
    "ux90-frozen",
    /UX-9\.0[^\n]*FROZEN/i.test(roadmap),
    "UX-9.0 remains FROZEN",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 15 — packageScript                                                    */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "packageScript";
  const pkg = exists(PACKAGE_JSON) ? read(PACKAGE_JSON) : "";

  assertCase(
    block,
    "script-present",
    /"validate:ux-9\.1"\s*:\s*"npx tsx scripts\/validate-ux-9\.1\.ts"/.test(pkg),
    "validate:ux-9.1 script present",
  );
  assertCase(
    block,
    "historical-ux810",
    /"validate:ux-8\.10"/.test(pkg),
    "historical validate:ux-8.10 preserved",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 16 — productionIntegration                                            */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "productionIntegration";
  const page = exists(PAGE) ? read(PAGE) : "";
  const floating = exists(FLOATING) ? read(FLOATING) : "";
  const bridge = exists(BRIDGE) ? read(BRIDGE) : "";

  assertCase(
    block,
    "host-in-production-page",
    /ProductCompositionHost/.test(page),
    "production page uses ProductCompositionHost",
  );
  assertCase(
    block,
    "chrome-active-inactive",
    /rootActive/.test(floating) && /rootInactive/.test(floating),
    "active and inactive chrome variants exist",
  );
  assertCase(
    block,
    "activation-wired",
    /\.activate\s*\(/.test(bridge),
    "activation wired in bridge",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 17 — validatorPass                                                    */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "validatorPass";
  const priorFailed = results.some((r) => !r.pass);
  assertCase(
    block,
    "all-prior-pass",
    !priorFailed,
    priorFailed ? "one or more prior cases failed" : "all prior cases passed",
  );
}

/* -------------------------------------------------------------------------- */
/* Report                                                                     */
/* -------------------------------------------------------------------------- */

const failed = results.filter((r) => !r.pass);
const passed = results.filter((r) => r.pass);

console.log("UX-9.1 — Workspace Activation validator\n");

const blocks = Array.from(new Set(results.map((r) => r.block)));
for (const block of blocks) {
  const cases = results.filter((r) => r.block === block);
  const ok = cases.every((c) => c.pass);
  console.log(`${ok ? "PASS" : "FAIL"}  ${block} (${cases.length} checks)`);
  for (const c of cases.filter((x) => !x.pass)) {
    console.log(`       ✗ ${c.id}: ${c.detail}`);
  }
}

console.log(
  `\n${passed.length} passed · ${failed.length} failed · ${results.length} total`,
);

if (failed.length > 0) {
  process.exitCode = 1;
} else {
  console.log("\nUX-9.1 VALIDATOR PASS");
}
