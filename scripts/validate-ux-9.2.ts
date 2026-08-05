/**
 * UX-9.2 — Focus + Selection Visual gate.
 *
 * Blocks:
 * documentationExists · focusIntegrationArchitecture · selectionIntegrationArchitecture
 * visualMappingFreeze · visualPriorityFreeze · focusSemanticsFreeze · chromeFreeze
 * tokenFreeze · demoMinimalityFreeze · renderIndependenceFreeze · providerComposition
 * dependencyRule · authorities · noNewInfrastructure · visibleUserOutcomeDocumented
 * noHistoricalMutation · roadmapUpdated · packageScript · productionIntegration
 * validatorPass
 *
 * Architectural principles:
 * - Visual Integration · no parallel infrastructure
 * - ProductCompositionHost owns composition
 * - Active ≠ Focused ≠ Selected · Active > Focused > Selected
 * - Demo Minimality · Render Independence · Seed Freeze
 * - Visible User Outcome triad required
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "documentationExists"
  | "focusIntegrationArchitecture"
  | "selectionIntegrationArchitecture"
  | "visualMappingFreeze"
  | "visualPriorityFreeze"
  | "focusSemanticsFreeze"
  | "chromeFreeze"
  | "tokenFreeze"
  | "demoMinimalityFreeze"
  | "renderIndependenceFreeze"
  | "providerComposition"
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

function importsSingleton(src: string, name: string): boolean {
  const re = new RegExp(
    `import\\s*\\{[^}]*\\b${name}\\b[^}]*\\}\\s*from\\s*["']@/ui/(?:focus|selection)["']`,
    "m",
  );
  return re.test(src);
}

const DOC = "docs/UX/UX-9.2.md";
const ARCH = "docs/UX/UX-9-architecture.md";
const ROADMAP = "docs/UX/UX-9.0-roadmap.md";
const PACKAGE_JSON = "package.json";
const VALIDATOR_SELF = "scripts/validate-ux-9.2.ts";
const HOST = "src/components/windows/ProductCompositionHost.tsx";
const PAGE = "src/app/page.tsx";
const FLOATING = "src/components/windows/FloatingWindow.tsx";
const BRIDGE = "src/components/windows/FloatingWindowBridge.tsx";

const REQUIRED_HEADINGS = [
  "Executive Summary",
  "Scope Fence",
  "Architecture",
  "Focus Integration Freeze",
  "Selection Integration Freeze",
  "Visual Mapping Freeze",
  "Visual Priority Freeze",
  "Focus Semantics Freeze",
  "Chrome Freeze",
  "Token Freeze",
  "Demo Minimality Freeze",
  "Render Independence Freeze",
  "Focus & Selection Seed Freeze",
  "Provider Composition Completion Freeze",
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
      "next-ux-9.3",
      /UX-9\.3/i.test(doc) && /Next/i.test(doc),
      "documents Next UX-9.3",
    );
    assertCase(
      block,
      "incremental-integration",
      /Small Incremental Visual Integration/i.test(doc) &&
        /extend/i.test(doc) &&
        /never replace/i.test(doc),
      "small incremental visual integration note",
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 2 — focusIntegrationArchitecture                                      */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "focusIntegrationArchitecture";
  const doc = exists(DOC) ? read(DOC) : "";
  const floating = exists(FLOATING) ? read(FLOATING) : "";
  const bridge = exists(BRIDGE) ? read(BRIDGE) : "";
  const floatingCode = stripComments(floating);
  const bridgeCode = stripComments(bridge);

  assertCase(
    block,
    "focus-heading",
    hasHeading(doc, "Focus Integration Freeze"),
    "Focus Integration Freeze section",
  );
  assertCase(
    block,
    "uses-useFocus",
    /useFocus\s*\(/.test(floatingCode),
    "FloatingWindow uses useFocus()",
  );
  assertCase(
    block,
    "focus-from-certified",
    /from\s+["']@\/ui\/focus["']/.test(floating),
    "FloatingWindow imports from @/ui/focus",
  );
  assertCase(
    block,
    "no-singleton-focus",
    !importsSingleton(floating, "focusRegistry") &&
      !importsSingleton(bridge, "focusRegistry"),
    "no focusRegistry singleton import in chrome/bridge",
  );
  assertCase(
    block,
    "chrome-no-focus-mutation",
    !/\.focus\s*\(/.test(floatingCode) &&
      !/\.blur\s*\(/.test(floatingCode) &&
      !/\.clear\s*\(/.test(floatingCode),
    "FloatingWindow does not mutate FocusRegistry",
  );
  assertCase(
    block,
    "bridge-no-focus-mutation",
    !/from\s+["']@\/ui\/focus["']/.test(bridgeCode) &&
      !/\.blur\s*\(/.test(bridgeCode),
    "FloatingWindowBridge does not wire Focus mutations",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 3 — selectionIntegrationArchitecture                                  */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "selectionIntegrationArchitecture";
  const doc = exists(DOC) ? read(DOC) : "";
  const host = exists(HOST) ? read(HOST) : "";
  const floating = exists(FLOATING) ? read(FLOATING) : "";
  const bridge = exists(BRIDGE) ? read(BRIDGE) : "";
  const floatingCode = stripComments(floating);
  const bridgeCode = stripComments(bridge);

  assertCase(
    block,
    "selection-heading",
    hasHeading(doc, "Selection Integration Freeze"),
    "Selection Integration Freeze section",
  );
  assertCase(
    block,
    "host-selection-provider",
    /\bSelectionProvider\b/.test(host),
    "host mounts SelectionProvider",
  );
  assertCase(
    block,
    "uses-useSelection",
    /useSelection\s*\(/.test(floatingCode),
    "FloatingWindow uses useSelection()",
  );
  assertCase(
    block,
    "selection-from-certified",
    /from\s+["']@\/ui\/selection["']/.test(floating),
    "FloatingWindow imports from @/ui/selection",
  );
  assertCase(
    block,
    "no-singleton-selection",
    !importsSingleton(host, "selectionRegistry") &&
      !importsSingleton(floating, "selectionRegistry") &&
      !importsSingleton(bridge, "selectionRegistry"),
    "no selectionRegistry singleton import in production UI",
  );
  assertCase(
    block,
    "chrome-no-selection-mutation",
    !/\.selectWindow\s*\(/.test(floatingCode) &&
      !/\.selectContent\s*\(/.test(floatingCode) &&
      !/\.selectSeries\s*\(/.test(floatingCode) &&
      !/\.toggle\w*\s*\(/.test(floatingCode) &&
      !/\.range\w*\s*\(/.test(floatingCode) &&
      !/\.clear\w*\s*\(/.test(floatingCode),
    "FloatingWindow does not mutate SelectionRegistry",
  );
  assertCase(
    block,
    "bridge-no-selection-mutation",
    !/from\s+["']@\/ui\/selection["']/.test(bridgeCode),
    "FloatingWindowBridge does not import Selection",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 4 — visualMappingFreeze                                               */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "visualMappingFreeze";
  const doc = exists(DOC) ? read(DOC) : "";

  assertCase(
    block,
    "mapping-heading",
    hasHeading(doc, "Visual Mapping Freeze"),
    "Visual Mapping Freeze section",
  );
  assertCase(
    block,
    "parallel-mapping",
    /Parallel/i.test(sectionBody(doc, "Visual Mapping Freeze")) ||
      /parallel/i.test(doc),
    "parallel mapping documented",
  );
  assertCase(
    block,
    "never-chained",
    /Never chained/i.test(doc) || /never chained/i.test(doc),
    "never chained documented",
  );
  assertCase(
    block,
    "three-domains",
    /Workspace Active/i.test(doc) &&
      /\bFocus\b/i.test(doc) &&
      /\bSelection\b/i.test(doc),
    "Active · Focus · Selection present",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 5 — visualPriorityFreeze                                              */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "visualPriorityFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const floating = exists(FLOATING) ? read(FLOATING) : "";

  assertCase(
    block,
    "priority-heading",
    hasHeading(doc, "Visual Priority Freeze"),
    "Visual Priority Freeze section",
  );
  assertCase(
    block,
    "order-documented",
    /Active\s*>\s*Focused\s*>\s*Selected/i.test(doc) ||
      (/Workspace Active/i.test(doc) &&
        />\s*Focused/i.test(doc) &&
        />\s*Selected/i.test(doc)),
    "Active > Focused > Selected documented",
  );
  assertCase(
    block,
    "priority-in-chrome",
    /Visual Priority/i.test(floating) &&
      /Active\s*>\s*Focused\s*>\s*Selected/i.test(floating),
    "FloatingWindow encodes Active > Focused > Selected",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 6 — focusSemanticsFreeze                                              */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "focusSemanticsFreeze";
  const doc = exists(DOC) ? read(DOC) : "";

  assertCase(
    block,
    "semantics-heading",
    hasHeading(doc, "Focus Semantics Freeze"),
    "Focus Semantics Freeze section",
  );
  assertCase(
    block,
    "three-concepts",
    /Workspace Active/i.test(doc) &&
      /Focused Window/i.test(doc) &&
      /Selected Content/i.test(doc),
    "Active ≠ Focused ≠ Selected documented",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 7 — chromeFreeze                                                      */
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
    "data-window-focused",
    /data-window-focused/.test(floating),
    "focused indicator attribute present",
  );
  assertCase(
    block,
    "data-window-selected",
    /data-window-selected/.test(floating),
    "selected indicator attribute present",
  );
  assertCase(
    block,
    "bridge-activate-only",
    /\.activate\s*\(/.test(bridge),
    "bridge still calls api.activate",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 8 — tokenFreeze                                                       */
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

  const floatingNoComments = stripComments(floating);
  const hostNoComments = stripComments(host);

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
/* PASS 9 — demoMinimalityFreeze                                              */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "demoMinimalityFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const host = exists(HOST) ? read(HOST) : "";
  const hostCode = stripComments(host);

  assertCase(
    block,
    "demo-heading",
    hasHeading(doc, "Demo Minimality Freeze"),
    "Demo Minimality Freeze section",
  );
  assertCase(
    block,
    "seed-present",
    /FocusSelectionVisualSeed/.test(host),
    "FocusSelectionVisualSeed present",
  );
  assertCase(
    block,
    "seed-focus",
    /\.focus\s*\(/.test(hostCode),
    "seed calls focus()",
  );
  assertCase(
    block,
    "seed-select-window",
    /\.selectWindow\s*\(/.test(hostCode),
    "seed calls selectWindow()",
  );
  assertCase(
    block,
    "seed-select-content",
    /\.selectContent\s*\(/.test(hostCode),
    "seed calls selectContent()",
  );
  assertCase(
    block,
    "seed-no-toggle",
    !/\.toggle\w*\s*\(/.test(hostCode),
    "seed does not call toggle*",
  );
  assertCase(
    block,
    "seed-no-range",
    !/\.range\w*\s*\(/.test(hostCode),
    "seed does not call range*",
  );
  assertCase(
    block,
    "seed-noop-guards",
    /focusedId/.test(hostCode) &&
      (/selectedWindowIds\.size/.test(hostCode) ||
        /selectionEmpty/.test(hostCode)) &&
      /windows\.size/.test(hostCode),
    "seed NO-OP guards present",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 10 — renderIndependenceFreeze                                         */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "renderIndependenceFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Render Independence Freeze");

  assertCase(
    block,
    "render-heading",
    hasHeading(doc, "Render Independence Freeze"),
    "Render Independence Freeze section",
  );
  assertCase(
    block,
    "observable-effect",
    /snapshot/i.test(body) && /chrome/i.test(body),
    "documents snapshot → chrome observable effect",
  );
  assertCase(
    block,
    "no-mechanism-freeze",
    /does\s+\*\*not\*\*\s+freeze/i.test(body) ||
      /does not freeze/i.test(body) ||
      /Do NOT freeze/i.test(doc),
    "does not freeze concrete re-render mechanism",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 11 — providerComposition                                              */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "providerComposition";
  const host = exists(HOST) ? read(HOST) : "";
  const page = exists(PAGE) ? read(PAGE) : "";
  const doc = exists(DOC) ? read(DOC) : "";
  const hostCode = stripComments(host);
  const pageCode = stripComments(page);

  assertCase(
    block,
    "completion-heading",
    hasHeading(doc, "Provider Composition Completion Freeze"),
    "Provider Composition Completion Freeze section",
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
    "host-selection-provider",
    /\bSelectionProvider\b/.test(host),
    "host mounts SelectionProvider",
  );
  assertCase(
    block,
    "host-order",
    /WindowManager[\s\S]*FocusProvider[\s\S]*SelectionProvider/.test(host),
    "WindowManager → FocusProvider → SelectionProvider order",
  );
  assertCase(
    block,
    "selection-from-certified",
    /from\s+["']@\/ui\/selection["']/.test(host),
    "SelectionProvider imported from @/ui/selection",
  );
  assertCase(
    block,
    "page-no-providers",
    !/<FocusProvider[\s>]/.test(pageCode) &&
      !/<SelectionProvider[\s>]/.test(pageCode),
    "page does not mount Focus/Selection providers",
  );
  assertCase(
    block,
    "no-new-provider-decl",
    !/function\s+\w+Provider\s*\(/.test(hostCode) &&
      !/const\s+\w+Provider\s*=/.test(hostCode),
    "host invents no new *Provider",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 12 — dependencyRule                                                   */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "dependencyRule";
  const doc = exists(DOC) ? read(DOC) : "";
  const floating = exists(FLOATING) ? read(FLOATING) : "";
  const bridge = exists(BRIDGE) ? read(BRIDGE) : "";

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
    "no-hover-import",
    !/@\/ui\/hover/.test(floating) && !/@\/ui\/hover/.test(bridge),
    "no Hover module import in chrome/bridge",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 13 — authorities                                                      */
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
    "selection-authority",
    /SelectionRegistry/i.test(doc),
    "Selection → SelectionRegistry",
  );
  assertCase(
    block,
    "chrome-authority",
    /FloatingWindow/i.test(doc) && /Chrome/i.test(doc),
    "Chrome → FloatingWindow UI",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 14 — noNewInfrastructure                                              */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "noNewInfrastructure";
  const host = exists(HOST) ? read(HOST) : "";
  const floating = exists(FLOATING) ? read(FLOATING) : "";
  const doc = exists(DOC) ? read(DOC) : "";
  const hostCode = stripComments(host);
  const floatingCode = stripComments(floating);

  assertCase(
    block,
    "no-create-context",
    !/createContext\s*\(/.test(hostCode) &&
      !/createContext\s*\(/.test(floatingCode),
    "no new Context created",
  );
  assertCase(
    block,
    "no-create-registry",
    !/create\w*Registry\s*\(/.test(hostCode) &&
      !/create\w*Registry\s*\(/.test(floatingCode),
    "no Registry factory called in host/chrome",
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
/* PASS 15 — visibleUserOutcomeDocumented                                     */
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
/* PASS 16 — noHistoricalMutation                                             */
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
  assertCase(
    block,
    "ux-9.1-intact",
    exists("docs/UX/UX-9.1.md") && exists("scripts/validate-ux-9.1.ts"),
    "UX-9.1 evidence intact",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 17 — roadmapUpdated                                                   */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "roadmapUpdated";
  const roadmap = exists(ROADMAP) ? read(ROADMAP) : "";

  assertCase(
    block,
    "ux91-complete",
    /UX-9\.1[^\n]*COMPLETE/i.test(roadmap),
    "UX-9.1 remains COMPLETE",
  );
  assertCase(
    block,
    "ux92-complete",
    /UX-9\.2[^\n]*COMPLETE/i.test(roadmap),
    "UX-9.2 marked COMPLETE",
  );
  assertCase(
    block,
    "ux93-pending",
    /UX-9\.3[^\n]*PENDING/i.test(roadmap),
    "UX-9.3 remains PENDING",
  );
  assertCase(
    block,
    "ux90-frozen",
    /UX-9\.0[^\n]*FROZEN/i.test(roadmap),
    "UX-9.0 remains FROZEN",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 18 — packageScript                                                    */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "packageScript";
  const pkg = exists(PACKAGE_JSON) ? read(PACKAGE_JSON) : "";

  assertCase(
    block,
    "script-present",
    /"validate:ux-9\.2"\s*:\s*"npx tsx scripts\/validate-ux-9\.2\.ts"/.test(pkg),
    "validate:ux-9.2 script present",
  );
  assertCase(
    block,
    "historical-ux91",
    /"validate:ux-9\.1"/.test(pkg),
    "historical validate:ux-9.1 preserved",
  );
  assertCase(
    block,
    "historical-ux810",
    /"validate:ux-8\.10"/.test(pkg),
    "historical validate:ux-8.10 preserved",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 19 — productionIntegration                                            */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "productionIntegration";
  const page = exists(PAGE) ? read(PAGE) : "";
  const floating = exists(FLOATING) ? read(FLOATING) : "";
  const host = exists(HOST) ? read(HOST) : "";

  assertCase(
    block,
    "host-in-production-page",
    /ProductCompositionHost/.test(page),
    "production page uses ProductCompositionHost",
  );
  assertCase(
    block,
    "chrome-active-focus-selected",
    /rootActive/.test(floating) &&
      /rootFocused/.test(floating) &&
      /rootSelected/.test(floating),
    "active · focused · selected chrome variants exist",
  );
  assertCase(
    block,
    "focus-selection-seed",
    /FocusSelectionVisualSeed/.test(host),
    "FocusSelectionVisualSeed integrated in host",
  );
  assertCase(
    block,
    "seed-freeze-heading",
    hasHeading(exists(DOC) ? read(DOC) : "", "Focus & Selection Seed Freeze"),
    "Focus & Selection Seed Freeze documented",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 20 — validatorPass                                                    */
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

console.log("UX-9.2 — Focus + Selection Visual validator\n");

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
  console.log("\nUX-9.2 VALIDATOR PASS");
}
