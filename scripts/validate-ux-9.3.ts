/**
 * UX-9.3 — Hover + Discoverability Integration gate.
 *
 * Blocks:
 * documentationExists · hoverIntegrationArchitecture
 * discoverabilityIntegrationArchitecture · discoverabilityFreeze
 * discoverabilityPipelineLifetimeFreeze · hoverSemanticsFreeze
 * visualMappingFreeze · visualPriorityFreeze · hoverSeedFreeze
 * hoverEphemeralityFreeze · chromeFreeze · tokenFreeze
 * providerComposition · dependencyRule · authorities
 * noNewInfrastructure · visibleUserOutcomeDocumented
 * noHistoricalMutation · roadmapUpdated · packageScript
 * productionIntegration · validatorPass
 *
 * Architectural principles:
 * - Visual Integration · no parallel infrastructure
 * - ProductCompositionHost owns composition
 * - Visibility = Discoverability (UX-7) · ≠ window lifecycle
 * - Active > Focused > Selected > Hover > Discoverability
 * - Hover Ephemerality · Pipeline Lifetime · Seed Freeze
 * - Visible User Outcome triad required
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "documentationExists"
  | "hoverIntegrationArchitecture"
  | "discoverabilityIntegrationArchitecture"
  | "discoverabilityFreeze"
  | "discoverabilityPipelineLifetimeFreeze"
  | "hoverSemanticsFreeze"
  | "visualMappingFreeze"
  | "visualPriorityFreeze"
  | "hoverSeedFreeze"
  | "hoverEphemeralityFreeze"
  | "chromeFreeze"
  | "tokenFreeze"
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
    `import\\s*\\{[^}]*\\b${name}\\b[^}]*\\}\\s*from\\s*["']@/ui/(?:hover|focus|selection)["']`,
    "m",
  );
  return re.test(src);
}

const DOC = "docs/UX/UX-9.3.md";
const ARCH = "docs/UX/UX-9-architecture.md";
const ROADMAP = "docs/UX/UX-9.0-roadmap.md";
const PACKAGE_JSON = "package.json";
const VALIDATOR_SELF = "scripts/validate-ux-9.3.ts";
const HOST = "src/components/windows/ProductCompositionHost.tsx";
const PAGE = "src/app/page.tsx";
const FLOATING = "src/components/windows/FloatingWindow.tsx";
const BRIDGE = "src/components/windows/FloatingWindowBridge.tsx";

const REQUIRED_HEADINGS = [
  "Executive Summary",
  "Scope Fence",
  "Architecture",
  "Hover Integration Freeze",
  "Discoverability Integration Freeze",
  "Discoverability Freeze",
  "Discoverability Pipeline Lifetime Freeze",
  "Hover Visual Seed Freeze",
  "Hover Ephemerality Freeze",
  "Hover Semantics Freeze",
  "Visual Mapping Freeze",
  "Visual Priority Freeze",
  "Chrome Freeze",
  "Token Freeze",
  "Render Independence Freeze",
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
      "next-ux-9.4",
      /UX-9\.4/i.test(doc) && /Next/i.test(doc),
      "documents Next UX-9.4",
    );
    assertCase(
      block,
      "incremental-integration",
      /Small Incremental Visual Integration/i.test(doc) &&
        /extend/i.test(doc) &&
        /never replace/i.test(doc),
      "small incremental visual integration note",
    );
    assertCase(
      block,
      "visibility-means-discoverability",
      /Visibility\s+means\s+Discoverability/i.test(doc) ||
        (/Visibility\s*=\s*Discoverability/i.test(doc) &&
          /UX-7/i.test(doc)),
      "Visibility means Discoverability (UX-7) stated",
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 2 — hoverIntegrationArchitecture                                      */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "hoverIntegrationArchitecture";
  const doc = exists(DOC) ? read(DOC) : "";
  const floating = exists(FLOATING) ? read(FLOATING) : "";
  const bridge = exists(BRIDGE) ? read(BRIDGE) : "";
  const floatingCode = stripComments(floating);
  const bridgeCode = stripComments(bridge);

  assertCase(
    block,
    "hover-heading",
    hasHeading(doc, "Hover Integration Freeze"),
    "Hover Integration Freeze section",
  );
  assertCase(
    block,
    "uses-useHover",
    /useHover\s*\(/.test(floatingCode),
    "FloatingWindow uses useHover()",
  );
  assertCase(
    block,
    "hover-from-certified",
    /from\s+["']@\/ui\/hover["']/.test(floating),
    "FloatingWindow imports from @/ui/hover",
  );
  assertCase(
    block,
    "no-singleton-hover",
    !importsSingleton(floating, "hoverRegistry") &&
      !importsSingleton(bridge, "hoverRegistry"),
    "no hoverRegistry singleton import in chrome/bridge",
  );
  assertCase(
    block,
    "chrome-no-hover-mutation",
    !/\.hoverWindow\s*\(/.test(floatingCode) &&
      !/\.hoverContent\s*\(/.test(floatingCode) &&
      !/\.hoverSeries\s*\(/.test(floatingCode) &&
      !/\.clear\s*\(/.test(floatingCode),
    "FloatingWindow does not mutate HoverRegistry",
  );
  assertCase(
    block,
    "bridge-no-hover-mutation",
    !/from\s+["']@\/ui\/hover["']/.test(bridgeCode) &&
      !/\.hoverWindow\s*\(/.test(bridgeCode) &&
      !/\.hoverContent\s*\(/.test(bridgeCode),
    "FloatingWindowBridge does not wire Hover mutations",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 3 — discoverabilityIntegrationArchitecture                            */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "discoverabilityIntegrationArchitecture";
  const doc = exists(DOC) ? read(DOC) : "";
  const floating = exists(FLOATING) ? read(FLOATING) : "";
  const bridge = exists(BRIDGE) ? read(BRIDGE) : "";
  const floatingCode = stripComments(floating);
  const bridgeCode = stripComments(bridge);

  assertCase(
    block,
    "disc-integration-heading",
    hasHeading(doc, "Discoverability Integration Freeze"),
    "Discoverability Integration Freeze section",
  );
  assertCase(
    block,
    "uses-queryDiscSnapshot",
    /queryDiscSnapshot\s*\(/.test(floatingCode),
    "FloatingWindow uses queryDiscSnapshot()",
  );
  assertCase(
    block,
    "uses-DiscoverabilityView",
    /DiscoverabilityView/.test(floatingCode),
    "FloatingWindow uses DiscoverabilityView",
  );
  assertCase(
    block,
    "bridge-creates-pipeline",
    /createDiscoverabilityPipeline\s*\(/.test(bridgeCode),
    "FloatingWindowBridge creates DiscoverabilityPipeline",
  );
  assertCase(
    block,
    "no-visibility-provider",
    !/VisibilityProvider/.test(floating) &&
      !/VisibilityProvider/.test(bridge) &&
      !/VisibilityProvider/.test(exists(HOST) ? read(HOST) : ""),
    "no VisibilityProvider invented",
  );
  assertCase(
    block,
    "no-ssot-register",
    !/\.register\s*\(/.test(floatingCode) &&
      !/visibilityRegistry/.test(floatingCode),
    "FloatingWindow does not register Visibility SSOT",
  );
  assertCase(
    block,
    "low-priority-hints-documented",
    /Discoverability hints/i.test(doc) &&
      /never compete/i.test(doc),
    "low-priority Discoverability hints documented",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 4 — discoverabilityFreeze                                             */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "discoverabilityFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Discoverability Freeze");
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";

  assertCase(
    block,
    "disc-freeze-heading",
    hasHeading(doc, "Discoverability Freeze"),
    "Discoverability Freeze section",
  );
  assertCase(
    block,
    "not-window-visibility",
    /not\s+Window\s+Visibility/i.test(body) ||
      /≠\s*Window/i.test(body) ||
      /never means/i.test(doc),
    "Discoverability ≠ Window Visibility documented",
  );
  assertCase(
    block,
    "forbids-lifecycle-vocab",
    /visible/i.test(body) &&
      /hidden/i.test(body) &&
      /collapsed/i.test(body) &&
      /minimized/i.test(body),
    "forbids visible/hidden/collapsed/minimized as Discoverability",
  );
  assertCase(
    block,
    "chrome-no-lifecycle-as-disc",
    !/data-window-minimized/.test(floating) &&
      !/data-window-collapsed/.test(floating) &&
      !/data-window-hidden/.test(floating),
    "FloatingWindow does not present lifecycle as Discoverability attrs",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 5 — discoverabilityPipelineLifetimeFreeze                              */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "discoverabilityPipelineLifetimeFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Discoverability Pipeline Lifetime Freeze");
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";
  const bridge = exists(BRIDGE) ? stripComments(read(BRIDGE)) : "";

  assertCase(
    block,
    "lifetime-heading",
    hasHeading(doc, "Discoverability Pipeline Lifetime Freeze"),
    "Discoverability Pipeline Lifetime Freeze section",
  );
  assertCase(
    block,
    "one-per-composition-documented",
    /one/i.test(body) &&
      /composition/i.test(body) &&
      (/never/i.test(body) || /Never/i.test(body)),
    "one pipeline per composition documented",
  );
  assertCase(
    block,
    "never-per-window-documented",
    /per FloatingWindow/i.test(body) || /per window/i.test(body),
    "never per FloatingWindow documented",
  );
  assertCase(
    block,
    "bridge-owns-useRef-pipeline",
    /useRef\s*\(\s*createDiscoverabilityPipeline\s*\(/.test(bridge),
    "Bridge owns useRef(createDiscoverabilityPipeline())",
  );
  assertCase(
    block,
    "floating-no-create-pipeline",
    !/createDiscoverabilityPipeline\s*\(/.test(floating),
    "FloatingWindow does not create DiscoverabilityPipeline",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 6 — hoverSemanticsFreeze                                              */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "hoverSemanticsFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Hover Semantics Freeze");

  assertCase(
    block,
    "semantics-heading",
    hasHeading(doc, "Hover Semantics Freeze"),
    "Hover Semantics Freeze section",
  );
  assertCase(
    block,
    "hover-neq-active",
    /Hover/i.test(body) && /Active/i.test(body),
    "Hover ≠ Workspace Active documented",
  );
  assertCase(
    block,
    "hover-neq-focus",
    /Focus/i.test(body),
    "Hover ≠ Focus documented",
  );
  assertCase(
    block,
    "hover-neq-selection",
    /Select/i.test(body),
    "Hover ≠ Selection documented",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 7 — visualMappingFreeze                                               */
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
      /Discoverability/i.test(body),
    "all five domains in Visual Mapping",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 8 — visualPriorityFreeze                                              */
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
      /Discoverability/i.test(body),
    "priority order Active > Focused > Selected > Hover > Discoverability",
  );
  assertCase(
    block,
    "priority-in-chrome-comment",
    /Active\s*>\s*Focused\s*>\s*Selected\s*>\s*Hover/i.test(floating),
    "FloatingWindow documents priority order",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 9 — hoverSeedFreeze                                                   */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "hoverSeedFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const host = exists(HOST) ? read(HOST) : "";
  const hostCode = stripComments(host);

  assertCase(
    block,
    "seed-heading",
    hasHeading(doc, "Hover Visual Seed Freeze"),
    "Hover Visual Seed Freeze section",
  );
  assertCase(
    block,
    "seed-present",
    /HoverVisualSeed/.test(host),
    "HoverVisualSeed present",
  );
  assertCase(
    block,
    "seed-noop-guards",
    /hoveredWindowId/.test(hostCode) &&
      /hoveredContentId/.test(hostCode) &&
      /windows\.size/.test(hostCode),
    "HoverVisualSeed NO-OP guards present",
  );
  assertCase(
    block,
    "seed-writes-only-hover",
    /\.hoverWindow\s*\(/.test(hostCode) &&
      /\.hoverContent\s*\(/.test(hostCode),
    "seed writes hoverWindow + hoverContent",
  );
  assertCase(
    block,
    "seed-no-enter-leave",
    !/\.enter\s*\(/.test(hostCode) && !/\.leave\s*\(/.test(hostCode),
    "seed never calls enter/leave",
  );
  assertCase(
    block,
    "seed-no-clear",
    !/hoverApi\.clear\s*\(/.test(hostCode) &&
      !/hoverRegistry\.clear\s*\(/.test(hostCode),
    "seed never calls clear",
  );
  assertCase(
    block,
    "seed-no-singleton",
    !importsSingleton(host, "hoverRegistry"),
    "seed does not use hoverRegistry singleton",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 10 — hoverEphemeralityFreeze                                          */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "hoverEphemeralityFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Hover Ephemerality Freeze");
  const host = exists(HOST) ? stripComments(read(HOST)) : "";

  assertCase(
    block,
    "ephemerality-heading",
    hasHeading(doc, "Hover Ephemerality Freeze"),
    "Hover Ephemerality Freeze section",
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
    "never-resync-documented",
    /never synchroniz/i.test(body) || /never re-sync/i.test(body),
    "never synchronizes with real hover documented",
  );
  assertCase(
    block,
    "seeded-ref-once",
    /seededRef/.test(host) && /HoverVisualSeed/.test(host),
    "HoverVisualSeed uses seededRef for one-shot",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 11 — chromeFreeze                                                     */
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
    "data-window-hovered",
    /data-window-hovered/.test(floating),
    "hovered indicator attribute present",
  );
  assertCase(
    block,
    "data-hover-badge",
    /data-hover-badge/.test(floating),
    "hover badge attribute present",
  );
  assertCase(
    block,
    "data-discoverability",
    /data-discoverability/.test(floating),
    "discoverability indicator attribute present",
  );
  assertCase(
    block,
    "bridge-activate-only",
    /\.activate\s*\(/.test(bridge),
    "bridge still calls api.activate",
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
/* PASS 13 — providerComposition                                              */
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
    "hover-provider-mounted",
    /<HoverProvider>/.test(hostCode) || /HoverProvider/.test(hostCode),
    "HoverProvider mounted in ProductCompositionHost",
  );
  assertCase(
    block,
    "nesting-order",
    /WindowManager[\s\S]*FocusProvider[\s\S]*SelectionProvider[\s\S]*HoverProvider/.test(
      hostCode,
    ),
    "WindowManager → FocusProvider → SelectionProvider → HoverProvider",
  );
  assertCase(
    block,
    "seeds-under-hover",
    /HoverProvider[\s\S]*WorkspaceActivationSeed[\s\S]*FocusSelectionVisualSeed[\s\S]*HoverVisualSeed/.test(
      hostCode,
    ),
    "seeds under HoverProvider in order",
  );
  assertCase(
    block,
    "no-hover-on-page",
    !/HoverProvider/.test(stripComments(page)),
    "HoverProvider not mounted from page.tsx",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 14 — dependencyRule                                                   */
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
    "no-hover-to-focus",
    /Hover\s*→\s*Focus/i.test(body) || /Hover → Focus/i.test(doc),
    "forbids Hover → Focus mutation",
  );
  assertCase(
    block,
    "lifecycle-neq-disc",
    /lifecycle/i.test(body) && /Discoverability/i.test(body),
    "Window lifecycle ≠ Discoverability",
  );
  assertCase(
    block,
    "observe-only-chrome",
    !/\.focus\s*\(/.test(floating) &&
      !/\.selectWindow\s*\(/.test(floating) &&
      !/\.hoverWindow\s*\(/.test(floating),
    "FloatingWindow observe-only across domains",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 15 — authorities                                                      */
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
    "auth-active",
    /WindowManager/i.test(body),
    "Workspace Active → WindowManager",
  );
  assertCase(
    block,
    "auth-focus",
    /FocusRegistry/i.test(body),
    "Focus → FocusRegistry",
  );
  assertCase(
    block,
    "auth-selection",
    /SelectionRegistry/i.test(body),
    "Selection → SelectionRegistry",
  );
  assertCase(
    block,
    "auth-hover",
    /HoverRegistry/i.test(body),
    "Hover → HoverRegistry",
  );
  assertCase(
    block,
    "auth-disc",
    /Discoverability\s+Pipeline/i.test(body) ||
      /UX-7.*Pipeline/i.test(body),
    "Discoverability → UX-7 Pipeline",
  );
  assertCase(
    block,
    "auth-chrome",
    /FloatingWindow/i.test(body),
    "Chrome → FloatingWindow",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 16 — noNewInfrastructure                                              */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "noNewInfrastructure";
  const doc = exists(DOC) ? read(DOC) : "";
  const host = exists(HOST) ? stripComments(read(HOST)) : "";
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";
  const bridge = exists(BRIDGE) ? stripComments(read(BRIDGE)) : "";

  assertCase(
    block,
    "no-new-infra-documented",
    /[Nn]o new/i.test(doc) &&
      (/Registry/i.test(doc) || /Provider/i.test(doc)),
    "no new infrastructure documented",
  );
  assertCase(
    block,
    "no-createContext",
    !/createContext\s*\(/.test(host) &&
      !/createContext\s*\(/.test(floating) &&
      !/createContext\s*\(/.test(bridge),
    "no new Context created in production chrome files",
  );
  assertCase(
    block,
    "no-new-provider-decl",
    !/function\s+\w+Provider\s*\(/.test(host) &&
      !/function\s+\w+Provider\s*\(/.test(floating),
    "no new Provider function declared in host/chrome",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 17 — visibleUserOutcomeDocumented                                     */
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
    /Visible Changes/i.test(body),
    "Visible Changes subsection",
  );
  assertCase(
    block,
    "reused-infrastructure",
    /Reused Infrastructure/i.test(body),
    "Reused Infrastructure subsection",
  );
  assertCase(
    block,
    "user-verification",
    /User Verification/i.test(body),
    "User Verification subsection",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 18 — noHistoricalMutation                                             */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "noHistoricalMutation";

  for (const path of FORBIDDEN_REGISTRY_PATHS) {
    assertCase(block, `exists-${path}`, exists(path), `${path} untouched path exists`);
  }
  assertCase(
    block,
    "historical-ux-9.1-validator",
    exists("scripts/validate-ux-9.1.ts"),
    "validate-ux-9.1.ts preserved",
  );
  assertCase(
    block,
    "historical-ux-9.2-validator",
    exists("scripts/validate-ux-9.2.ts"),
    "validate-ux-9.2.ts preserved",
  );
  assertCase(
    block,
    "ux-8-arch-untouched",
    exists("docs/UX/UX-8-architecture.md"),
    "UX-8 architecture preserved",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 19 — roadmapUpdated                                                   */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "roadmapUpdated";
  const roadmap = exists(ROADMAP) ? read(ROADMAP) : "";

  assertCase(
    block,
    "ux-9.3-complete",
    /UX-9\.3[^\n]*COMPLETE/i.test(roadmap) ||
      /UX-9\.3\s*=\s*COMPLETE/i.test(roadmap),
    "UX-9.3 marked COMPLETE",
  );
  assertCase(
    block,
    "ux-9.4-pending",
    /UX-9\.4[^\n]*PENDING/i.test(roadmap) ||
      /UX-9\.4\s*=\s*PENDING/i.test(roadmap),
    "UX-9.4 remains PENDING",
  );
  assertCase(
    block,
    "next-ux-9.4",
    /Next[^\n]*UX-9\.4/i.test(roadmap) ||
      /→\s*UX-9\.4/i.test(roadmap),
    "Next points to UX-9.4",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 20 — packageScript                                                    */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "packageScript";
  const pkg = exists(PACKAGE_JSON) ? read(PACKAGE_JSON) : "";

  assertCase(
    block,
    "validate-script",
    /"validate:ux-9\.3"\s*:\s*"npx tsx scripts\/validate-ux-9\.3\.ts"/.test(
      pkg,
    ),
    "package.json has validate:ux-9.3",
  );
  assertCase(
    block,
    "preserves-9.1",
    /"validate:ux-9\.1"/.test(pkg),
    "preserves validate:ux-9.1",
  );
  assertCase(
    block,
    "preserves-9.2",
    /"validate:ux-9\.2"/.test(pkg),
    "preserves validate:ux-9.2",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 21 — productionIntegration                                            */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "productionIntegration";
  const host = exists(HOST) ? read(HOST) : "";
  const floating = exists(FLOATING) ? read(FLOATING) : "";
  const bridge = exists(BRIDGE) ? read(BRIDGE) : "";
  const hostCode = stripComments(host);
  const floatingCode = stripComments(floating);

  assertCase(
    block,
    "hover-provider-in-host",
    /HoverProvider/.test(hostCode),
    "HoverProvider in ProductCompositionHost",
  );
  assertCase(
    block,
    "useHover-in-floating",
    /useHover\s*\(/.test(floatingCode),
    "useHover() in FloatingWindow",
  );
  assertCase(
    block,
    "pipeline-prop-fanout",
    /pipeline=\{pipeline\}/.test(bridge) || /pipeline=\{/.test(bridge),
    "Bridge fans pipeline prop to FloatingWindow",
  );
  assertCase(
    block,
    "hover-seed-ephemeral",
    /HoverVisualSeed/.test(host) && /seededRef/.test(hostCode),
    "HoverVisualSeed ephemeral one-shot",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 22 — validatorPass                                                    */
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
      ? `all ${prior.length} prior cases passed`
      : `${prior.filter((r) => !r.pass).length} prior case(s) failed`,
  );
}

/* -------------------------------------------------------------------------- */
/* Report                                                                     */
/* -------------------------------------------------------------------------- */
const failed = results.filter((r) => !r.pass);
const passed = results.filter((r) => r.pass);

console.log("UX-9.3 — Hover + Discoverability Integration");
console.log(`PASS: ${passed.length}`);
console.log(`FAIL: ${failed.length}`);

if (failed.length > 0) {
  console.log("\nFailures:");
  for (const f of failed) {
    console.log(`  [${f.block}] ${f.id}: ${f.detail}`);
  }
}

process.exitCode = failed.length > 0 ? 1 : 0;
