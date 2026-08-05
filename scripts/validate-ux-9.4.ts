/**
 * UX-9.4 — Keyboard Navigation Integration gate.
 *
 * Blocks:
 * documentationExists · keyboardIntegrationArchitecture
 * keyboardDomFreeze · keyboardSeedCanonicalFreeze
 * keyboardEphemeralityFreeze · directionNormalizationFreeze
 * keyboardSemanticsFreeze · keyboardIndicatorFreeze
 * visualMappingFreeze · visualPriorityFreeze · chromeFreeze
 * tokenFreeze · paintIndependenceFreeze · providerComposition
 * dependencyRule · authorities · noNewInfrastructure
 * visibleUserOutcomeDocumented · noHistoricalMutation
 * roadmapUpdated · packageScript · productionIntegration
 * validatorPass
 *
 * Architectural principles:
 * - Visual Integration · no parallel infrastructure
 * - ProductCompositionHost owns composition
 * - Active > Focused > Selected > Hover > Keyboard Navigation > Discoverability
 * - Keyboard Seed Canonical · Ephemerality · Direction Normalization
 * - Paint Independence · Visible User Outcome triad required
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "documentationExists"
  | "keyboardIntegrationArchitecture"
  | "keyboardDomFreeze"
  | "keyboardSeedCanonicalFreeze"
  | "keyboardEphemeralityFreeze"
  | "directionNormalizationFreeze"
  | "keyboardSemanticsFreeze"
  | "keyboardIndicatorFreeze"
  | "visualMappingFreeze"
  | "visualPriorityFreeze"
  | "chromeFreeze"
  | "tokenFreeze"
  | "paintIndependenceFreeze"
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
    `import\\s*\\{[^}]*\\b${name}\\b[^}]*\\}\\s*from\\s*["']@/ui/keyboard-nav["']`,
    "m",
  );
  return re.test(src);
}

const DOC = "docs/UX/UX-9.4.md";
const ARCH = "docs/UX/UX-9-architecture.md";
const ROADMAP = "docs/UX/UX-9.0-roadmap.md";
const PACKAGE_JSON = "package.json";
const VALIDATOR_SELF = "scripts/validate-ux-9.4.ts";
const HOST = "src/components/windows/ProductCompositionHost.tsx";
const PAGE = "src/app/page.tsx";
const FLOATING = "src/components/windows/FloatingWindow.tsx";
const BRIDGE = "src/components/windows/FloatingWindowBridge.tsx";

const REQUIRED_HEADINGS = [
  "Executive Summary",
  "Scope Fence",
  "Architecture",
  "Keyboard Integration Freeze",
  "Keyboard DOM Freeze",
  "Keyboard Seed Canonical Freeze",
  "Keyboard Ephemerality Freeze",
  "Direction Normalization Freeze",
  "Keyboard Indicator Freeze",
  "Keyboard Semantics Freeze",
  "Visual Mapping Freeze",
  "Visual Priority Freeze",
  "Chrome Freeze",
  "Token Freeze",
  "Paint Independence Freeze",
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
  "src/ui/keyboard-nav/KeyboardNavigationRegistry.ts",
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
      "next-ux-9.5",
      /UX-9\.5/i.test(doc) && /Next/i.test(doc),
      "documents Next UX-9.5",
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
/* PASS 2 — keyboardIntegrationArchitecture                                   */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "keyboardIntegrationArchitecture";
  const doc = exists(DOC) ? read(DOC) : "";
  const floating = exists(FLOATING) ? read(FLOATING) : "";
  const host = exists(HOST) ? read(HOST) : "";
  const floatingCode = stripComments(floating);
  const hostCode = stripComments(host);

  assertCase(
    block,
    "integration-heading",
    hasHeading(doc, "Keyboard Integration Freeze"),
    "Keyboard Integration Freeze section",
  );
  assertCase(
    block,
    "uses-useKeyboardNavigation-floating",
    /useKeyboardNavigation\s*\(/.test(floatingCode),
    "FloatingWindow uses useKeyboardNavigation()",
  );
  assertCase(
    block,
    "keyboard-from-certified",
    /from\s+["']@\/ui\/keyboard-nav["']/.test(floating),
    "FloatingWindow imports from @/ui/keyboard-nav",
  );
  assertCase(
    block,
    "no-singleton-floating",
    !importsSingleton(floating, "keyboardNavigationRegistry"),
    "no keyboardNavigationRegistry singleton in FloatingWindow",
  );
  assertCase(
    block,
    "no-singleton-host",
    !importsSingleton(host, "keyboardNavigationRegistry"),
    "no keyboardNavigationRegistry singleton in ProductCompositionHost",
  );
  assertCase(
    block,
    "chrome-no-keyboard-mutation",
    !/\.move\s*\(/.test(floatingCode) &&
      !/\.next\s*\(/.test(floatingCode) &&
      !/\.previous\s*\(/.test(floatingCode) &&
      !/\.escape\s*\(/.test(floatingCode) &&
      !/\.clear\s*\(/.test(floatingCode),
    "FloatingWindow does not mutate KeyboardNavigationRegistry",
  );
  assertCase(
    block,
    "host-uses-hook",
    /useKeyboardNavigation\s*\(/.test(hostCode),
    "ProductCompositionHost uses useKeyboardNavigation()",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 3 — keyboardDomFreeze                                                 */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "keyboardDomFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Keyboard DOM Freeze");
  const host = exists(HOST) ? read(HOST) : "";
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";
  const hostCode = stripComments(host);
  const bridge = exists(BRIDGE) ? stripComments(read(BRIDGE)) : "";

  assertCase(
    block,
    "dom-heading",
    hasHeading(doc, "Keyboard DOM Freeze"),
    "Keyboard DOM Freeze section",
  );
  assertCase(
    block,
    "dom-host-present",
    /KeyboardNavigationDomHost/.test(host),
    "KeyboardNavigationDomHost present",
  );
  assertCase(
    block,
    "host-onKeyDown",
    /onKeyDown/.test(hostCode) || /onKeyDownCapture/.test(hostCode),
    "DomHost uses onKeyDown or onKeyDownCapture",
  );
  assertCase(
    block,
    "host-tabIndex",
    /tabIndex\s*=\s*\{0\}/.test(host) || /tabIndex=\{0\}/.test(host),
    "DomHost uses tabIndex={0}",
  );
  assertCase(
    block,
    "no-document-listener",
    !/document\.addEventListener/.test(hostCode) &&
      !/document\.addEventListener/.test(floating) &&
      !/document\.addEventListener/.test(bridge),
    "no document.addEventListener in host/chrome/bridge",
  );
  assertCase(
    block,
    "no-window-listener",
    !/window\.addEventListener/.test(hostCode) &&
      !/window\.addEventListener/.test(floating) &&
      !/window\.addEventListener/.test(bridge),
    "no window.addEventListener in host/chrome/bridge",
  );
  assertCase(
    block,
    "floating-no-keydown",
    !/onKeyDown/.test(floating) && !/onKeyDownCapture/.test(floating),
    "FloatingWindow has no key listeners",
  );
  assertCase(
    block,
    "dom-freeze-documented",
    /onKeyDown/i.test(body) && /tabIndex/i.test(body),
    "Keyboard DOM Freeze documents onKeyDown and tabIndex",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 4 — keyboardSeedCanonicalFreeze                                       */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "keyboardSeedCanonicalFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Keyboard Seed Canonical Freeze");
  const host = exists(HOST) ? read(HOST) : "";
  const hostCode = stripComments(host);

  assertCase(
    block,
    "canonical-heading",
    hasHeading(doc, "Keyboard Seed Canonical Freeze"),
    "Keyboard Seed Canonical Freeze section",
  );
  assertCase(
    block,
    "seed-present",
    /KeyboardNavigationVisualSeed/.test(host),
    "KeyboardNavigationVisualSeed present",
  );
  assertCase(
    block,
    "seed-uses-move-next",
    /KeyboardNavigationVisualSeed[\s\S]*?\.move\s*\(\s*KeyboardNavigationDirection\.NEXT\s*\)/.test(
      hostCode,
    ) ||
      (/KeyboardNavigationVisualSeed/.test(hostCode) &&
        /move\s*\(\s*KeyboardNavigationDirection\.NEXT\s*\)/.test(hostCode)),
    "seed initializes via move(KeyboardNavigationDirection.NEXT)",
  );
  assertCase(
    block,
    "seed-no-next-helper",
    !/KeyboardNavigationVisualSeed[\s\S]*?\.next\s*\(/.test(hostCode) &&
      !(/function KeyboardNavigationVisualSeed[\s\S]*?\.next\s*\(/.test(host)),
    "seed never calls next()",
  );
  // Narrower check: extract seed function body
  {
    const seedMatch = hostCode.match(
      /function KeyboardNavigationVisualSeed\s*\([^)]*\)\s*\{[\s\S]*?\n\}/,
    );
    const seedBody = seedMatch?.[0] ?? "";
    assertCase(
      block,
      "seed-body-no-next",
      seedBody.length > 0 && !/\.next\s*\(/.test(seedBody),
      "KeyboardNavigationVisualSeed body has no next()",
    );
    assertCase(
      block,
      "seed-body-move-next",
      seedBody.length > 0 &&
        /\.move\s*\(\s*KeyboardNavigationDirection\.NEXT\s*\)/.test(seedBody),
      "KeyboardNavigationVisualSeed body calls move(NEXT)",
    );
  }
  assertCase(
    block,
    "canonical-documented",
    /move\s*\(\s*KeyboardNavigationDirection\.NEXT\s*\)/i.test(body) ||
      (/move\(NEXT\)/i.test(body) && /Never/i.test(body) && /next\(\)/i.test(body)),
    "canonical move(NEXT) · never next() documented",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 5 — keyboardEphemeralityFreeze                                        */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "keyboardEphemeralityFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Keyboard Ephemerality Freeze");
  const host = exists(HOST) ? stripComments(read(HOST)) : "";

  assertCase(
    block,
    "ephemerality-heading",
    hasHeading(doc, "Keyboard Ephemerality Freeze"),
    "Keyboard Ephemerality Freeze section",
  );
  assertCase(
    block,
    "one-shot-documented",
    /one-shot/i.test(body) || /one shot/i.test(body),
    "one-shot initialization documented",
  );
  assertCase(
    block,
    "permanently-inactive-documented",
    /permanently inactive/i.test(body) || /inactive forever/i.test(body),
    "permanently inactive documented",
  );
  assertCase(
    block,
    "noop-guards",
    /lastDirection/.test(host) && /windows\.size/.test(host),
    "seed NO-OP guards (lastDirection · windows.size)",
  );
  assertCase(
    block,
    "seeded-ref-once",
    /seededRef/.test(host) && /KeyboardNavigationVisualSeed/.test(host),
    "KeyboardNavigationVisualSeed uses seededRef for one-shot",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 6 — directionNormalizationFreeze                                      */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "directionNormalizationFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Direction Normalization Freeze");
  const host = exists(HOST) ? stripComments(read(HOST)) : "";

  assertCase(
    block,
    "direction-heading",
    hasHeading(doc, "Direction Normalization Freeze"),
    "Direction Normalization Freeze section",
  );
  assertCase(
    block,
    "move-canonical-documented",
    /move\s*\(\s*direction\s*\)/i.test(body) || /move\(direction\)/i.test(body),
    "move(direction) canonical documented",
  );
  assertCase(
    block,
    "helpers-documented",
    /next\(\)/i.test(body) &&
      /previous\(\)/i.test(body) &&
      /escape\(\)/i.test(body) &&
      /helpers?/i.test(body),
    "helpers remain helpers documented",
  );
  assertCase(
    block,
    "domhost-uses-move",
    /KeyboardNavigationDomHost/.test(host) && /\.move\s*\(/.test(host),
    "DomHost calls move()",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 7 — keyboardSemanticsFreeze                                           */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "keyboardSemanticsFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Keyboard Semantics Freeze");

  assertCase(
    block,
    "semantics-heading",
    hasHeading(doc, "Keyboard Semantics Freeze"),
    "Keyboard Semantics Freeze section",
  );
  assertCase(
    block,
    "keyboard-neq-active",
    /Keyboard/i.test(body) && /Active/i.test(body),
    "Keyboard ≠ Workspace Active documented",
  );
  assertCase(
    block,
    "keyboard-neq-focus",
    /Focus/i.test(body),
    "Keyboard ≠ Focus documented",
  );
  assertCase(
    block,
    "keyboard-neq-selection",
    /Select/i.test(body),
    "Keyboard ≠ Selection documented",
  );
  assertCase(
    block,
    "keyboard-neq-hover",
    /Hover/i.test(body),
    "Keyboard ≠ Hover documented",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 8 — keyboardIndicatorFreeze                                           */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "keyboardIndicatorFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Keyboard Indicator Freeze");
  const floating = exists(FLOATING) ? read(FLOATING) : "";

  assertCase(
    block,
    "indicator-heading",
    hasHeading(doc, "Keyboard Indicator Freeze"),
    "Keyboard Indicator Freeze section",
  );
  assertCase(
    block,
    "never-replaces-documented",
    /never replaces/i.test(body),
    "never replaces Active/Focus/Selection/Hover documented",
  );
  assertCase(
    block,
    "badge-present",
    /data-keyboard-badge/.test(floating),
    "keyboard badge attribute present",
  );
  assertCase(
    block,
    "arrow-present",
    /data-keyboard-arrow/.test(floating),
    "keyboard arrow attribute present",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 9 — visualMappingFreeze                                               */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "visualMappingFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Visual Mapping Freeze");

  assertCase(
    block,
    "mapping-heading",
    hasHeading(doc, "Visual Mapping Freeze"),
    "Visual Mapping Freeze section",
  );
  assertCase(
    block,
    "parallel-mapping",
    /[Pp]arallel/.test(body) && /[Nn]ever chained/.test(body),
    "parallel mapping · never chained",
  );
  assertCase(
    block,
    "domains-listed",
    /Active/i.test(body) &&
      /Focus/i.test(body) &&
      /Selection/i.test(body) &&
      /Hover/i.test(body) &&
      /Keyboard/i.test(body) &&
      /Discoverability/i.test(body),
    "all six domains in Visual Mapping",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 10 — visualPriorityFreeze                                             */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "visualPriorityFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Visual Priority Freeze");
  const floating = exists(FLOATING) ? read(FLOATING) : "";

  assertCase(
    block,
    "priority-heading",
    hasHeading(doc, "Visual Priority Freeze"),
    "Visual Priority Freeze section",
  );
  assertCase(
    block,
    "priority-order-documented",
    /Active/i.test(body) &&
      /Focused/i.test(body) &&
      /Selected/i.test(body) &&
      /Hover/i.test(body) &&
      /Keyboard/i.test(body) &&
      /Discoverability/i.test(body),
    "priority order includes Keyboard Navigation",
  );
  assertCase(
    block,
    "priority-in-chrome-comment",
    /Active\s*>\s*Focused\s*>\s*Selected\s*>\s*Hover\s*>\s*Keyboard Navigation/i.test(
      floating,
    ),
    "FloatingWindow documents priority with Keyboard Navigation",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 11 — chromeFreeze                                                     */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "chromeFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const floating = exists(FLOATING) ? read(FLOATING) : "";

  assertCase(
    block,
    "chrome-heading",
    hasHeading(doc, "Chrome Freeze"),
    "Chrome Freeze section",
  );
  assertCase(
    block,
    "data-keyboard-nav",
    /data-keyboard-nav/.test(floating),
    "keyboard nav attribute present",
  );
  assertCase(
    block,
    "data-keyboard-direction",
    /data-keyboard-direction/.test(floating),
    "keyboard direction attribute present",
  );
  assertCase(
    block,
    "forbidden-geometry-documented",
    /geometry/i.test(sectionBody(doc, "Chrome Freeze")) &&
      /z-order/i.test(sectionBody(doc, "Chrome Freeze")),
    "geometry/z-order forbidden documented",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 12 — tokenFreeze                                                      */
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
/* PASS 13 — paintIndependenceFreeze                                          */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "paintIndependenceFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Paint Independence Freeze");

  assertCase(
    block,
    "paint-heading",
    hasHeading(doc, "Paint Independence Freeze"),
    "Paint Independence Freeze section",
  );
  assertCase(
    block,
    "snapshot-to-chrome",
    /snapshot/i.test(body) && /chrome/i.test(body),
    "Keyboard snapshot → chrome documented",
  );
  assertCase(
    block,
    "no-mechanism-frozen",
    (/does\s+\*\*not\*\*\s+freeze/i.test(body) ||
      /does not freeze/i.test(body) ||
      /not freeze any concrete/i.test(body)) &&
      /React/i.test(body),
    "does not freeze concrete React re-render mechanism",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 14 — providerComposition                                              */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "providerComposition";
  const doc = exists(DOC) ? read(DOC) : "";
  const host = exists(HOST) ? read(HOST) : "";
  const page = exists(PAGE) ? read(PAGE) : "";
  const hostCode = stripComments(host);

  assertCase(
    block,
    "composition-heading",
    hasHeading(doc, "Provider Composition Completion Freeze"),
    "Provider Composition Completion Freeze section",
  );
  assertCase(
    block,
    "keyboard-provider-in-host",
    /KeyboardNavigationProvider/.test(hostCode),
    "KeyboardNavigationProvider mounted in ProductCompositionHost",
  );
  assertCase(
    block,
    "nest-order",
    /WindowManager[\s\S]*FocusProvider[\s\S]*SelectionProvider[\s\S]*HoverProvider[\s\S]*KeyboardNavigationProvider/.test(
      hostCode,
    ),
    "nest order WM → Focus → Selection → Hover → Keyboard",
  );
  assertCase(
    block,
    "seeds-under-keyboard",
    /KeyboardNavigationProvider[\s\S]*WorkspaceActivationSeed[\s\S]*FocusSelectionVisualSeed[\s\S]*HoverVisualSeed[\s\S]*KeyboardNavigationVisualSeed/.test(
      hostCode,
    ),
    "seeds under KeyboardNavigationProvider",
  );
  assertCase(
    block,
    "domhost-under-keyboard",
    /KeyboardNavigationProvider[\s\S]*KeyboardNavigationDomHost/.test(hostCode),
    "KeyboardNavigationDomHost under KeyboardNavigationProvider",
  );
  assertCase(
    block,
    "not-on-page",
    !/KeyboardNavigationProvider/.test(page),
    "KeyboardNavigationProvider not mounted from page.tsx",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 15 — dependencyRule                                                   */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "dependencyRule";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Dependency Rule");
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";

  assertCase(
    block,
    "dependency-heading",
    hasHeading(doc, "Dependency Rule"),
    "Dependency Rule section",
  );
  assertCase(
    block,
    "no-keyboard-to-focus",
    /Keyboard/i.test(body) && /Focus/i.test(body) && /Forbidden/i.test(body),
    "Keyboard → Focus mutation forbidden",
  );
  assertCase(
    block,
    "observe-only",
    /observe-only/i.test(body) || /Observe-only/i.test(body),
    "observe-only integration documented",
  );
  assertCase(
    block,
    "floating-observe-only",
    /useKeyboardNavigation\s*\(/.test(floating) &&
      !/\.move\s*\(/.test(floating),
    "FloatingWindow observe-only for keyboard",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 16 — authorities                                                      */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "authorities";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Authorities");

  assertCase(
    block,
    "authorities-heading",
    hasHeading(doc, "Authorities"),
    "Authorities section",
  );
  assertCase(
    block,
    "wm-authority",
    /WindowManager/i.test(body),
    "WindowManager authority",
  );
  assertCase(
    block,
    "focus-authority",
    /FocusRegistry/i.test(body),
    "FocusRegistry authority",
  );
  assertCase(
    block,
    "selection-authority",
    /SelectionRegistry/i.test(body),
    "SelectionRegistry authority",
  );
  assertCase(
    block,
    "hover-authority",
    /HoverRegistry/i.test(body),
    "HoverRegistry authority",
  );
  assertCase(
    block,
    "keyboard-authority",
    /KeyboardNavigationRegistry/i.test(body),
    "KeyboardNavigationRegistry authority",
  );
  assertCase(
    block,
    "disc-authority",
    /Discoverability/i.test(body),
    "Discoverability authority",
  );
  assertCase(
    block,
    "chrome-authority",
    /FloatingWindow/i.test(body),
    "FloatingWindow chrome authority",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 17 — noNewInfrastructure                                              */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "noNewInfrastructure";
  const doc = exists(DOC) ? read(DOC) : "";
  const host = exists(HOST) ? stripComments(read(HOST)) : "";
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";

  assertCase(
    block,
    "no-new-documented",
    /NO new/i.test(doc) || /No new/i.test(doc) || /no new Registry/i.test(doc),
    "no new infrastructure documented",
  );
  assertCase(
    block,
    "no-createContext-host",
    !/createContext\s*\(/.test(host),
    "ProductCompositionHost does not createContext",
  );
  assertCase(
    block,
    "no-createContext-floating",
    !/createContext\s*\(/.test(floating),
    "FloatingWindow does not createContext",
  );
  assertCase(
    block,
    "no-new-provider-decl",
    !/function\s+\w+Provider\s*\(/.test(host) &&
      !/const\s+\w+Provider\s*=/.test(host),
    "no new *Provider declaration in host",
  );
  assertCase(
    block,
    "keyboard-nav-infra-untouched",
    exists("src/ui/keyboard-nav/KeyboardNavigationRegistry.ts"),
    "certified keyboard-nav infrastructure present (untouched path)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 18 — visibleUserOutcomeDocumented                                     */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "visibleUserOutcomeDocumented";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Visible User Outcome");

  assertCase(
    block,
    "vuo-heading",
    hasHeading(doc, "Visible User Outcome"),
    "Visible User Outcome section",
  );
  assertCase(
    block,
    "visible-changes",
    /###\s+Visible Changes/i.test(body) || /Visible Changes/i.test(body),
    "Visible Changes present",
  );
  assertCase(
    block,
    "reused-infrastructure",
    /###\s+Reused Infrastructure/i.test(body) ||
      /Reused Infrastructure/i.test(body),
    "Reused Infrastructure present",
  );
  assertCase(
    block,
    "user-verification",
    /###\s+User Verification/i.test(body) || /User Verification/i.test(body),
    "User Verification present",
  );
  assertCase(
    block,
    "tab-shift-arrows-escape",
    /Tab/i.test(body) &&
      /Shift\+Tab/i.test(body) &&
      (/arrow/i.test(body) || /Arrow/i.test(body)) &&
      /Escape/i.test(body),
    "Tab · Shift+Tab · arrows · Escape in VUO",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 19 — noHistoricalMutation                                             */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "noHistoricalMutation";

  for (const path of FORBIDDEN_REGISTRY_PATHS) {
    assertCase(block, `exists-${path}`, exists(path), `${path} still exists`);
  }
  assertCase(
    block,
    "ux-9.1-validator",
    exists("scripts/validate-ux-9.1.ts"),
    "validate-ux-9.1.ts preserved",
  );
  assertCase(
    block,
    "ux-9.2-validator",
    exists("scripts/validate-ux-9.2.ts"),
    "validate-ux-9.2.ts preserved",
  );
  assertCase(
    block,
    "ux-9.3-validator",
    exists("scripts/validate-ux-9.3.ts"),
    "validate-ux-9.3.ts preserved",
  );
  assertCase(
    block,
    "ux-8.5-doc",
    exists("docs/UX/UX-8.5.md"),
    "UX-8.5 documentation preserved",
  );
  assertCase(
    block,
    "arch-ssot",
    exists(ARCH),
    "UX-9-architecture.md preserved",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 20 — roadmapUpdated                                                   */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "roadmapUpdated";
  const roadmap = exists(ROADMAP) ? read(ROADMAP) : "";

  assertCase(
    block,
    "ux-9.4-complete",
    /UX-9\.4\s*=\s*COMPLETE/i.test(roadmap) ||
      (/UX-9\.4/.test(roadmap) &&
        /Keyboard Navigation/i.test(roadmap) &&
        /\*\*COMPLETE\*\*/.test(roadmap)),
    "UX-9.4 marked COMPLETE",
  );
  assertCase(
    block,
    "ux-9.5-pending",
    /UX-9\.5\s*=\s*PENDING/i.test(roadmap) ||
      (/UX-9\.5/.test(roadmap) && /PENDING/.test(roadmap)),
    "UX-9.5 remains PENDING",
  );
  assertCase(
    block,
    "next-ux-9.5",
    /Next:\s*UX-9\.5/i.test(roadmap) || /Next → UX-9\.5/i.test(roadmap),
    "Next → UX-9.5",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 21 — packageScript                                                    */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "packageScript";
  const pkg = exists(PACKAGE_JSON) ? read(PACKAGE_JSON) : "";

  assertCase(
    block,
    "validate-ux-9.4-script",
    /"validate:ux-9\.4"\s*:\s*"npx tsx scripts\/validate-ux-9\.4\.ts"/.test(pkg),
    "validate:ux-9.4 script exact",
  );
  assertCase(
    block,
    "preserves-9.1",
    /"validate:ux-9\.1"/.test(pkg),
    "validate:ux-9.1 preserved",
  );
  assertCase(
    block,
    "preserves-9.2",
    /"validate:ux-9\.2"/.test(pkg),
    "validate:ux-9.2 preserved",
  );
  assertCase(
    block,
    "preserves-9.3",
    /"validate:ux-9\.3"/.test(pkg),
    "validate:ux-9.3 preserved",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 22 — productionIntegration                                            */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "productionIntegration";
  const host = exists(HOST) ? stripComments(read(HOST)) : "";
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";

  assertCase(
    block,
    "provider-mounted",
    /KeyboardNavigationProvider/.test(host),
    "KeyboardNavigationProvider mounted",
  );
  assertCase(
    block,
    "hook-consumed",
    /useKeyboardNavigation\s*\(/.test(floating),
    "useKeyboardNavigation consumed in chrome",
  );
  assertCase(
    block,
    "seed-ephemeral",
    /KeyboardNavigationVisualSeed/.test(host) && /seededRef/.test(host),
    "KeyboardNavigationVisualSeed ephemeral",
  );
  assertCase(
    block,
    "domhost-move",
    /KeyboardNavigationDomHost/.test(host) && /\.move\s*\(/.test(host),
    "DomHost translates to move()",
  );
  assertCase(
    block,
    "chrome-keyboard-attrs",
    /data-keyboard-nav/.test(floating) &&
      /data-keyboard-badge/.test(floating),
    "keyboard chrome attributes present",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 23 — validatorPass                                                    */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "validatorPass";
  const prior = results.filter((r) => r.block !== "validatorPass");
  const allPass = prior.every((r) => r.pass);
  assertCase(
    block,
    "all-prior-pass",
    allPass,
    allPass
      ? `all ${prior.length} prior cases pass`
      : `${prior.filter((r) => !r.pass).length} prior case(s) failed`,
  );
}

/* -------------------------------------------------------------------------- */
/* Report                                                                     */
/* -------------------------------------------------------------------------- */
const failed = results.filter((r) => !r.pass);
const passed = results.filter((r) => r.pass);

console.log(`\nUX-9.4 validator — ${passed.length}/${results.length} passed\n`);

const byBlock = new Map<BlockId, CaseResult[]>();
for (const r of results) {
  const list = byBlock.get(r.block) ?? [];
  list.push(r);
  byBlock.set(r.block, list);
}

for (const [block, cases] of byBlock) {
  const ok = cases.every((c) => c.pass);
  console.log(`${ok ? "PASS" : "FAIL"}  ${block}`);
  for (const c of cases.filter((x) => !x.pass)) {
    console.log(`       ✗ ${c.id}: ${c.detail}`);
  }
}

if (failed.length > 0) {
  console.log(`\nFAIL — ${failed.length} case(s)\n`);
  process.exit(1);
}

console.log("\nPASS — UX-9.4 Keyboard Navigation Integration\n");
process.exit(0);
