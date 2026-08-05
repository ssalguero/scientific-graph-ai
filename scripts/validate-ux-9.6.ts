/**
 * UX-9.6 — Command Palette + Interaction Commands gate.
 *
 * Blocks:
 * documentationExists · commandPaletteAuthority · overlayOwnershipFreeze
 * productCatalogIsolationFreeze · commandEnvelopeCanonicalFreeze
 * searchPurityFreeze · overlayStateFreeze · dispatcherAuthority
 * executionOwnershipFreeze · interactionSuccessFreeze
 * paletteModulePurity · interactionModulePurity
 * commandFeedbackFreeze · commandFeedbackLifetimeFreeze
 * paletteDomFreeze · visualPriorityFreeze · tokenFreeze
 * paintIndependenceFreeze · providerComposition · dependencyRule
 * authorities · noNewInfrastructure · visibleUserOutcomeDocumented
 * noHistoricalMutation · roadmapUpdated · packageScript
 * productionIntegration · validatorPass
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "documentationExists"
  | "commandPaletteAuthority"
  | "overlayOwnershipFreeze"
  | "productCatalogIsolationFreeze"
  | "commandEnvelopeCanonicalFreeze"
  | "searchPurityFreeze"
  | "overlayStateFreeze"
  | "dispatcherAuthority"
  | "executionOwnershipFreeze"
  | "interactionSuccessFreeze"
  | "paletteModulePurity"
  | "interactionModulePurity"
  | "commandFeedbackFreeze"
  | "commandFeedbackLifetimeFreeze"
  | "paletteDomFreeze"
  | "visualPriorityFreeze"
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

const DOC = "docs/UX/UX-9.6.md";
const ROADMAP = "docs/UX/UX-9.0-roadmap.md";
const PACKAGE_JSON = "package.json";
const HOST = "src/components/windows/ProductCompositionHost.tsx";
const PAGE = "src/app/page.tsx";
const FLOATING = "src/components/windows/FloatingWindow.tsx";
const PAL_BRIDGE = "src/components/windows/commands/CommandPaletteBridge.ts";
const INT_BRIDGE = "src/components/windows/commands/InteractionCommandBridge.ts";
const DOM_HOST = "src/components/windows/commands/CommandPaletteDomHost.tsx";
const CMD_INDEX = "src/components/windows/commands/index.ts";

const REQUIRED_HEADINGS = [
  "Executive Summary",
  "Scope Fence",
  "Architecture",
  "Command Palette Authority Freeze",
  "Overlay Ownership Freeze",
  "Product Catalog Isolation Freeze",
  "Command Envelope Canonical Freeze",
  "Search Purity Freeze",
  "Overlay State Freeze",
  "Dispatcher Authority Freeze",
  "Execution Ownership Freeze",
  "Interaction Success Freeze",
  "Palette Module Purity Freeze",
  "Interaction Module Purity Freeze",
  "Command Feedback Freeze",
  "Command Feedback Lifetime Freeze",
  "Palette DOM Freeze",
  "Visual Priority Freeze",
  "Token Freeze",
  "Paint Independence Freeze",
  "Provider Composition Freeze",
  "Dependency Rule",
  "Authorities",
  "Visible User Outcome",
  "Acceptance Criteria",
  "Protected Files",
  "Gate",
  "Next UX-9.7",
];

const FORBIDDEN_PATHS = [
  "src/ui/palette/CommandPaletteProvider.tsx",
  "src/ui/palette/CommandPaletteSearch.ts",
  "src/ui/interaction-commands/InteractionCommandDispatcher.ts",
  "src/ui/interaction-commands/InteractionCommandProvider.tsx",
  "src/ui/clipboard/ClipboardRegistry.ts",
  "docs/UX/UX-9.5.md",
  "scripts/validate-ux-9.5.ts",
];

/* -------------------------------------------------------------------------- */
/* documentationExists                                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "documentationExists";
  assertCase(block, "doc.exists", exists(DOC), `${DOC} exists`);
  const doc = exists(DOC) ? read(DOC) : "";
  assertCase(
    block,
    "doc.extends95",
    /Small Incremental Visual Integration/i.test(doc) &&
      /extends UX-9\.5/i.test(doc),
    "Documents Small Incremental Visual Integration extending UX-9.5",
  );
  for (const heading of REQUIRED_HEADINGS) {
    assertCase(
      block,
      `doc.heading.${heading.replace(/\s+/g, "_")}`,
      hasHeading(doc, heading),
      `Heading: ${heading}`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* commandPaletteAuthority                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "commandPaletteAuthority";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Command Palette Authority Freeze");
  assertCase(
    block,
    "doc.authority",
    /CommandPaletteBridge/i.test(body) &&
      /InteractionCommandBridge/i.test(body) &&
      /Dispatcher/i.test(body),
    "Authority chain Palette → Bridges → Dispatcher documented",
  );
  assertCase(
    block,
    "files.bridges",
    exists(PAL_BRIDGE) && exists(INT_BRIDGE) && exists(DOM_HOST),
    "CommandPaletteBridge · InteractionCommandBridge · DomHost exist",
  );
}

/* -------------------------------------------------------------------------- */
/* overlayOwnershipFreeze                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "overlayOwnershipFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Overlay Ownership Freeze");
  assertCase(
    block,
    "doc.overlayOwnership",
    /src\/components\/windows\/commands/i.test(body) &&
      /never.*src\/ui\/palette/i.test(body),
    "Overlay ownership documented in Productivity Layer",
  );
  const hostSrc = exists(DOM_HOST) ? stripComments(read(DOM_HOST)) : "";
  assertCase(
    block,
    "dom.overlayUi",
    /data-command-palette-overlay/.test(hostSrc) &&
      /data-command-palette-query/.test(hostSrc) &&
      /data-command-palette-list/.test(hostSrc),
    "DomHost owns overlay query list UI",
  );
  assertCase(
    block,
    "palette.noOverlay",
    !exists("src/ui/palette/CommandPaletteOverlay.tsx") &&
      !exists("src/ui/palette/CommandPaletteDomHost.tsx"),
    "No overlay under src/ui/palette",
  );
}

/* -------------------------------------------------------------------------- */
/* productCatalogIsolationFreeze                                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "productCatalogIsolationFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Product Catalog Isolation Freeze");
  assertCase(
    block,
    "doc.localRegistry",
    /createCommandRegistry\(productDefinitions\)/.test(body) &&
      /commandRegistry/.test(body),
    "Local product registry documented; global commandRegistry isolation",
  );
  const bridge = exists(PAL_BRIDGE) ? stripComments(read(PAL_BRIDGE)) : "";
  assertCase(
    block,
    "bridge.createRegistry",
    /createCommandRegistry\(/.test(bridge) &&
      /PRODUCT_COMMAND_DEFINITIONS/.test(bridge) ||
      /productDefinitions/.test(bridge),
    "CommandPaletteBridge creates local createCommandRegistry",
  );
  assertCase(
    block,
    "bridge.noGlobalMutation",
    !/\bcommandRegistry\.(register|set|add|clear)\b/.test(bridge) &&
      !/import\s*\{[^}]*\bcommandRegistry\b/.test(bridge),
    "Bridge does not import or mutate global commandRegistry",
  );
}

/* -------------------------------------------------------------------------- */
/* commandEnvelopeCanonicalFreeze                                             */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "commandEnvelopeCanonicalFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Command Envelope Canonical Freeze");
  assertCase(
    block,
    "doc.envelope",
    /createCommandEnvelope/.test(body) &&
      /Never/i.test(body) &&
      /DomHost/i.test(body),
    "Envelope Canonical Freeze documented",
  );
  const intBridge = exists(INT_BRIDGE) ? stripComments(read(INT_BRIDGE)) : "";
  const dom = exists(DOM_HOST) ? stripComments(read(DOM_HOST)) : "";
  const pal = exists(PAL_BRIDGE) ? stripComments(read(PAL_BRIDGE)) : "";
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";
  assertCase(
    block,
    "bridge.hasCreateEnvelope",
    /createCommandEnvelope\(/.test(intBridge),
    "InteractionCommandBridge defines createCommandEnvelope",
  );
  assertCase(
    block,
    "others.noEnvelopeConstruction",
    !/type:\s*["']palette\.execute["']/.test(dom) &&
      !/type:\s*["']palette\.execute["']/.test(pal) &&
      !/type:\s*["']palette\.execute["']/.test(floating) &&
      !/createCommandEnvelope\(/.test(dom) &&
      !/createCommandEnvelope\(/.test(pal) &&
      !/createCommandEnvelope\(/.test(floating),
    "DomHost / PaletteBridge / FloatingWindow never build envelopes",
  );
}

/* -------------------------------------------------------------------------- */
/* searchPurityFreeze                                                         */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "searchPurityFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Search Purity Freeze");
  assertCase(
    block,
    "doc.searchPurity",
    /search\(index,\s*query\)/.test(body) &&
      /Never/i.test(body) &&
      /dispatch/i.test(body),
    "Search purity documented",
  );
  const pal = exists(PAL_BRIDGE) ? stripComments(read(PAL_BRIDGE)) : "";
  assertCase(
    block,
    "bridge.searchPure",
    /search\(index,\s*query\)/.test(pal) &&
      !/\.dispatch\(/.test(pal) &&
      !/emitEphemeralFeedback/.test(pal),
    "CommandPaletteBridge search has no dispatch/feedback",
  );
}

/* -------------------------------------------------------------------------- */
/* overlayStateFreeze                                                         */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "overlayStateFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Overlay State Freeze");
  assertCase(
    block,
    "doc.overlayState",
    /\bopen\b/.test(body) &&
      /\bquery\b/.test(body) &&
      /selectedIndex/.test(body) &&
      /Forbidden/i.test(body) &&
      /history/i.test(body),
    "Overlay state limited and forbidden fields documented",
  );
  const pal = exists(PAL_BRIDGE) ? stripComments(read(PAL_BRIDGE)) : "";
  assertCase(
    block,
    "bridge.overlayShape",
    /open:\s*boolean/.test(pal) &&
      /query:\s*string/.test(pal) &&
      /selectedIndex:\s*number/.test(pal) &&
      !/\bhistory\b/.test(pal) &&
      !/\bfavorites\b/.test(pal) &&
      !/\bpersistence\b/.test(pal) &&
      !/localStorage/.test(pal),
    "Bridge OverlayState is open/query/selectedIndex only",
  );
}

/* -------------------------------------------------------------------------- */
/* dispatcherAuthority                                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "dispatcherAuthority";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Dispatcher Authority Freeze");
  assertCase(
    block,
    "doc.dispatcherAuthority",
    /InteractionCommandBridge/.test(body) && /dispatch\(\)/.test(body),
    "Dispatcher Authority documented",
  );
  const intBridge = exists(INT_BRIDGE) ? stripComments(read(INT_BRIDGE)) : "";
  const dom = exists(DOM_HOST) ? stripComments(read(DOM_HOST)) : "";
  const pal = exists(PAL_BRIDGE) ? stripComments(read(PAL_BRIDGE)) : "";
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";
  const host = exists(HOST) ? stripComments(read(HOST)) : "";
  assertCase(
    block,
    "bridge.callsDispatch",
    /dispatcher\.dispatch\(/.test(intBridge),
    "InteractionCommandBridge calls dispatcher.dispatch",
  );
  assertCase(
    block,
    "others.noDispatch",
    !/\.dispatch\(/.test(dom) &&
      !/\.dispatch\(/.test(pal) &&
      !/\.dispatch\(/.test(floating) &&
      !/\.dispatch\(/.test(host),
    "DomHost / PaletteBridge / FloatingWindow / Host never call dispatch",
  );
}

/* -------------------------------------------------------------------------- */
/* executionOwnershipFreeze                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "executionOwnershipFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Execution Ownership Freeze");
  assertCase(
    block,
    "doc.executionOwnership",
    /never executes business logic/i.test(body) &&
      /Clipboard/i.test(body) &&
      /Focus/i.test(body) &&
      /accepted/i.test(body),
    "Execution Ownership Freeze documented",
  );
  const intBridge = exists(INT_BRIDGE) ? stripComments(read(INT_BRIDGE)) : "";
  assertCase(
    block,
    "bridge.noBusinessCalls",
    !/useClipboard|useFocus|useSelection|useHover|useKeyboardNavigation|useWindowContext/.test(
      intBridge,
    ) && !/navigator\.clipboard/.test(intBridge),
    "InteractionCommandBridge has no business domain calls",
  );
}

/* -------------------------------------------------------------------------- */
/* interactionSuccessFreeze                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "interactionSuccessFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Interaction Success Freeze");
  assertCase(
    block,
    "doc.success",
    /accepted\s*==\s*true/i.test(body) &&
      /accepted\s*==\s*false/i.test(body) &&
      /no positive feedback/i.test(body),
    "Interaction Success Freeze documented",
  );
  const intBridge = exists(INT_BRIDGE) ? stripComments(read(INT_BRIDGE)) : "";
  assertCase(
    block,
    "bridge.acceptedBranch",
    /result\.accepted/.test(intBridge) &&
      /emitEphemeralFeedback\(["']accepted["']/.test(intBridge) &&
      /emitEphemeralFeedback\(["']rejected["']/.test(intBridge),
    "Bridge emits accepted/rejected from result.accepted",
  );
}

/* -------------------------------------------------------------------------- */
/* paletteModulePurity                                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "paletteModulePurity";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Palette Module Purity Freeze");
  assertCase(
    block,
    "doc.palettePurity",
    /Never modify/i.test(body) && /src\/ui\/palette/.test(body),
    "Palette Module Purity documented",
  );
  assertCase(
    block,
    "palette.certifiedExists",
    exists("src/ui/palette/CommandPaletteSearch.ts") &&
      exists("src/ui/palette/CommandPaletteProvider.tsx"),
    "Certified palette module present (untouched)",
  );
  const host = exists(HOST) ? stripComments(read(HOST)) : "";
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";
  const pal = exists(PAL_BRIDGE) ? stripComments(read(PAL_BRIDGE)) : "";
  const dom = exists(DOM_HOST) ? stripComments(read(DOM_HOST)) : "";
  const productFiles = [host, floating, pal, dom];
  assertCase(
    block,
    "no.CommandPaletteProviderImport",
    productFiles.every((src) => !/CommandPaletteProvider/.test(src)),
    "No CommandPaletteProvider import outside src/ui/palette",
  );
}

/* -------------------------------------------------------------------------- */
/* interactionModulePurity                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "interactionModulePurity";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Interaction Module Purity Freeze");
  assertCase(
    block,
    "doc.interactionPurity",
    /Never modify/i.test(body) &&
      /src\/ui\/interaction-commands/.test(body) &&
      /useInteractionCommands/.test(body),
    "Interaction Module Purity documented",
  );
  const host = exists(HOST) ? stripComments(read(HOST)) : "";
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";
  const dom = exists(DOM_HOST) ? stripComments(read(DOM_HOST)) : "";
  assertCase(
    block,
    "uses.hook",
    /useInteractionCommands/.test(dom),
    "DomHost uses useInteractionCommands()",
  );
  assertCase(
    block,
    "no.singletonProduction",
    !/interactionCommandDispatcher/.test(host) &&
      !/interactionCommandDispatcher/.test(floating) &&
      !/interactionCommandDispatcher/.test(dom),
    "No singleton interactionCommandDispatcher in production host/chrome/dom",
  );
  assertCase(
    block,
    "floating.noDispatchClear",
    !/\.dispatch\(/.test(floating) && !/\.clear\(/.test(floating),
    "FloatingWindow never calls dispatch/clear",
  );
}

/* -------------------------------------------------------------------------- */
/* commandFeedbackFreeze                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "commandFeedbackFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Command Feedback Freeze");
  assertCase(
    block,
    "doc.feedback",
    /never mutates/i.test(body) &&
      /Focus/i.test(body) &&
      /Additive/i.test(body),
    "Command Feedback Freeze documented",
  );
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";
  assertCase(
    block,
    "floating.feedbackAttrs",
    /data-palette-badge/.test(floating) &&
      /data-palette-status/.test(floating) &&
      /data-command-accepted-feedback/.test(floating) &&
      /data-command-rejected-feedback/.test(floating) &&
      /data-execution-badge/.test(floating),
    "FloatingWindow has palette/command feedback chrome attrs",
  );
}

/* -------------------------------------------------------------------------- */
/* commandFeedbackLifetimeFreeze                                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "commandFeedbackLifetimeFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Command Feedback Lifetime Freeze");
  assertCase(
    block,
    "doc.lifetime",
    /auto disappear/i.test(body) &&
      /Never persistent/i.test(body) &&
      /Never authority/i.test(body),
    "Feedback lifetime documented",
  );
  const intBridge = exists(INT_BRIDGE) ? stripComments(read(INT_BRIDGE)) : "";
  assertCase(
    block,
    "bridge.ephemeral",
    /FEEDBACK_MS/.test(intBridge) &&
      /setTimeout/.test(intBridge) &&
      /emitEphemeralFeedback/.test(intBridge),
    "Bridge uses ephemeral setTimeout feedback",
  );
}

/* -------------------------------------------------------------------------- */
/* paletteDomFreeze                                                           */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "paletteDomFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Palette DOM Freeze");
  assertCase(
    block,
    "doc.domFreeze",
    /Ctrl\/Cmd\+K/.test(body) &&
      /Esc/.test(body) &&
      /document\.addEventListener/.test(body) &&
      /window\.addEventListener/.test(body),
    "Palette DOM Freeze documented",
  );
  const dom = exists(DOM_HOST) ? stripComments(read(DOM_HOST)) : "";
  const host = exists(HOST) ? stripComments(read(HOST)) : "";
  assertCase(
    block,
    "dom.onKeyDown",
    /onKeyDown/.test(dom) &&
      /metaKey|ctrlKey/.test(dom) &&
      /Escape/.test(dom) &&
      !/document\.addEventListener/.test(dom) &&
      !/window\.addEventListener/.test(dom),
    "DomHost uses onKeyDown only — no document/window listeners",
  );
  assertCase(
    block,
    "host.keepsKeyboardDomHost",
    /KeyboardNavigationDomHost/.test(host),
    "KeyboardNavigationDomHost remains in composition",
  );
}

/* -------------------------------------------------------------------------- */
/* visualPriorityFreeze                                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "visualPriorityFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Visual Priority Freeze");
  assertCase(
    block,
    "doc.cascade",
    /Workspace Active/.test(body) &&
      /Focused/.test(body) &&
      /Selected/.test(body) &&
      /Hover/.test(body) &&
      /Keyboard Navigation/.test(body) &&
      /Discoverability/.test(body) &&
      /temporary overlay/i.test(body),
    "Visual Priority cascade + temporary overlay documented",
  );
  const floating = exists(FLOATING) ? read(FLOATING) : "";
  assertCase(
    block,
    "floating.cascadeComment",
    /Active > Focused > Selected > Hover > Keyboard Navigation > Discoverability/.test(
      floating,
    ),
    "FloatingWindow retains Visual Priority cascade",
  );
}

/* -------------------------------------------------------------------------- */
/* tokenFreeze                                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "tokenFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Token Freeze");
  assertCase(
    block,
    "doc.tokens",
    /UI_TOKENS/.test(body),
    "Token Freeze documents UI_TOKENS",
  );
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";
  const dom = exists(DOM_HOST) ? stripComments(read(DOM_HOST)) : "";
  assertCase(
    block,
    "uses.UI_TOKENS",
    /UI_TOKENS/.test(floating) && /UI_TOKENS/.test(dom),
    "FloatingWindow and DomHost use UI_TOKENS",
  );
  assertCase(
    block,
    "no.hex",
    !/#[0-9a-fA-F]{3,8}\b/.test(floating) &&
      !/#[0-9a-fA-F]{3,8}\b/.test(dom),
    "No hex colors in FloatingWindow / DomHost",
  );
}

/* -------------------------------------------------------------------------- */
/* paintIndependenceFreeze                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "paintIndependenceFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Paint Independence Freeze");
  assertCase(
    block,
    "doc.paint",
    /Dispatcher snapshot/i.test(body) &&
      /Overlay/i.test(body) &&
      /does \*\*not\*\* freeze any concrete React|does not freeze any concrete React/i.test(
        body,
      ),
    "Paint Independence Freeze documented",
  );
}

/* -------------------------------------------------------------------------- */
/* providerComposition                                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "providerComposition";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Provider Composition Freeze");
  assertCase(
    block,
    "doc.composition",
    /InteractionCommandProvider/.test(body) &&
      /ProductCompositionHost/.test(body) &&
      /page\.tsx/.test(body),
    "Provider composition documented",
  );
  const host = exists(HOST) ? stripComments(read(HOST)) : "";
  const page = exists(PAGE) ? stripComments(read(PAGE)) : "";
  assertCase(
    block,
    "host.mountsProvider",
    /InteractionCommandProvider/.test(host) &&
      /CommandPaletteDomHost/.test(host) &&
      /ClipboardDomHost/.test(host),
    "Host mounts InteractionCommandProvider + DomHosts",
  );
  assertCase(
    block,
    "nestOrder",
    /ClipboardProvider[\s\S]*InteractionCommandProvider[\s\S]*ClipboardDomHost[\s\S]*CommandPaletteDomHost/.test(
      host,
    ),
    "Nest order ClipboardProvider → InteractionCommandProvider → … → CommandPaletteDomHost",
  );
  assertCase(
    block,
    "page.noProvider",
    !/InteractionCommandProvider/.test(page),
    "page.tsx does not mount InteractionCommandProvider",
  );
}

/* -------------------------------------------------------------------------- */
/* dependencyRule                                                             */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "dependencyRule";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Dependency Rule");
  assertCase(
    block,
    "doc.dependency",
    /Command Palette → Focus mutation/.test(body) &&
      /observe-only/i.test(body),
    "Dependency Rule documented",
  );
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";
  assertCase(
    block,
    "floating.observeOnly",
    /subscribeCommandFeedback/.test(floating) &&
      /subscribeOverlayState/.test(floating) &&
      !/interactionCommandBridge\.execute/.test(floating) &&
      !/createCommandEnvelope/.test(floating),
    "FloatingWindow observe-only for command feedback",
  );
}

/* -------------------------------------------------------------------------- */
/* authorities                                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "authorities";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Authorities");
  assertCase(
    block,
    "doc.authorities",
    /WindowManager/.test(body) &&
      /FocusRegistry/.test(body) &&
      /SelectionRegistry/.test(body) &&
      /HoverRegistry/.test(body) &&
      /KeyboardNavigationRegistry/.test(body) &&
      /ClipboardRegistry/.test(body) &&
      /InteractionCommandDispatcher/.test(body) &&
      /CommandPaletteBridge/.test(body) &&
      /FloatingWindow/.test(body),
    "Authorities matrix documented",
  );
}

/* -------------------------------------------------------------------------- */
/* noNewInfrastructure                                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noNewInfrastructure";
  const doc = exists(DOC) ? read(DOC) : "";
  assertCase(
    block,
    "doc.noNewInfra",
    /NO new Registry/i.test(doc) || /No new Registry/i.test(doc),
    "No new base infrastructure declared",
  );
  const host = exists(HOST) ? stripComments(read(HOST)) : "";
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";
  assertCase(
    block,
    "no.createContext",
    !/createContext\(/.test(host) && !/createContext\(/.test(floating),
    "Host/FloatingWindow do not createContext",
  );
  assertCase(
    block,
    "productSurfaceExists",
    exists(PAL_BRIDGE) &&
      exists(INT_BRIDGE) &&
      exists(DOM_HOST) &&
      exists(CMD_INDEX),
    "Product surface files exist",
  );
}

/* -------------------------------------------------------------------------- */
/* visibleUserOutcomeDocumented                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "visibleUserOutcomeDocumented";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Visible User Outcome");
  assertCase(
    block,
    "has.VisibleChanges",
    /###\s+Visible Changes/.test(body) || /Visible Changes/.test(body),
    "Visible Changes present",
  );
  assertCase(
    block,
    "has.ReusedInfrastructure",
    /###\s+Reused Infrastructure/.test(body) ||
      /Reused Infrastructure/.test(body),
    "Reused Infrastructure present",
  );
  assertCase(
    block,
    "has.UserVerification",
    /###\s+User Verification/.test(body) || /User Verification/.test(body),
    "User Verification present",
  );
  assertCase(
    block,
    "mentions.ops",
    /Ctrl\/Cmd\+K/.test(body) &&
      /Esc/.test(body) &&
      /Enter/.test(body) &&
      /Accepted/i.test(body),
    "VUO mentions open/close/execute/feedback",
  );
}

/* -------------------------------------------------------------------------- */
/* noHistoricalMutation                                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noHistoricalMutation";
  for (const rel of FORBIDDEN_PATHS) {
    assertCase(block, `exists.${rel}`, exists(rel), `${rel} still exists`);
  }
}

/* -------------------------------------------------------------------------- */
/* roadmapUpdated                                                             */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "roadmapUpdated";
  const roadmap = exists(ROADMAP) ? read(ROADMAP) : "";
  assertCase(
    block,
    "ux96.complete",
    /UX-9\.6\s*=\s*COMPLETE/.test(roadmap) ||
      /UX-9\.6.*COMPLETE/.test(roadmap),
    "UX-9.6 marked COMPLETE",
  );
  assertCase(
    block,
    "ux97.pending",
    /UX-9\.7.*PENDING/.test(roadmap),
    "UX-9.7 remains PENDING",
  );
  assertCase(
    block,
    "next.ux97",
    /Next.*UX-9\.7/i.test(roadmap) || /Next → UX-9\.7/.test(roadmap),
    "Next points to UX-9.7",
  );
}

/* -------------------------------------------------------------------------- */
/* packageScript                                                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "packageScript";
  const pkg = exists(PACKAGE_JSON) ? read(PACKAGE_JSON) : "";
  assertCase(
    block,
    "script.exact",
    /"validate:ux-9\.6":\s*"npx tsx scripts\/validate-ux-9\.6\.ts"/.test(pkg),
    "validate:ux-9.6 script exact",
  );
  assertCase(
    block,
    "preserves.95",
    /"validate:ux-9\.5":\s*"npx tsx scripts\/validate-ux-9\.5\.ts"/.test(pkg),
    "validate:ux-9.5 preserved",
  );
}

/* -------------------------------------------------------------------------- */
/* productionIntegration                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "productionIntegration";
  const host = exists(HOST) ? stripComments(read(HOST)) : "";
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";
  const pal = exists(PAL_BRIDGE) ? stripComments(read(PAL_BRIDGE)) : "";
  const intBridge = exists(INT_BRIDGE) ? stripComments(read(INT_BRIDGE)) : "";
  const dom = exists(DOM_HOST) ? stripComments(read(DOM_HOST)) : "";
  assertCase(
    block,
    "provider.hook.dom",
    /InteractionCommandProvider/.test(host) &&
      /useInteractionCommands/.test(dom) &&
      /CommandPaletteDomHost/.test(host),
    "Provider + hook + DomHost wired",
  );
  assertCase(
    block,
    "bridge.search",
    /createCommandPaletteCatalog/.test(pal) &&
      /createCommandPaletteIndex/.test(pal) &&
      /\bsearch\(/.test(pal),
    "PaletteBridge uses UX-6.5 catalog/index/search",
  );
  assertCase(
    block,
    "bridge.execute",
    /createCommandEnvelope/.test(intBridge) &&
      /dispatcher\.dispatch/.test(intBridge),
    "InteractionCommandBridge envelope + dispatch",
  );
  assertCase(
    block,
    "floating.chrome",
    /data-palette-badge/.test(floating) &&
      /data-command-accepted-feedback/.test(floating),
    "FloatingWindow command chrome present",
  );
  assertCase(
    block,
    "dom.keys",
    /["']k["']/.test(dom.toLowerCase()) || /toLowerCase\(\)\s*===\s*["']k["']/.test(dom),
    "DomHost captures Ctrl/Cmd+K",
  );
}

/* -------------------------------------------------------------------------- */
/* validatorPass                                                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "validatorPass";
  const prior = results.filter((r) => r.block !== "validatorPass");
  const allPass = prior.every((r) => r.pass);
  assertCase(
    block,
    "all.prior.pass",
    allPass,
    allPass ? "All prior cases pass" : "One or more prior cases failed",
  );
}

/* -------------------------------------------------------------------------- */
/* Report                                                                     */
/* -------------------------------------------------------------------------- */

const failed = results.filter((r) => !r.pass);
const byBlock = new Map<BlockId, CaseResult[]>();
for (const r of results) {
  const list = byBlock.get(r.block) ?? [];
  list.push(r);
  byBlock.set(r.block, list);
}

console.log("UX-9.6 validate-ux-9.6");
console.log("======================");
for (const [block, cases] of byBlock) {
  const ok = cases.every((c) => c.pass);
  console.log(`${ok ? "PASS" : "FAIL"}  ${block} (${cases.length})`);
  for (const c of cases) {
    if (!c.pass) {
      console.log(`  - ${c.id}: ${c.detail}`);
    }
  }
}

if (failed.length > 0) {
  console.log(`\nFAILED: ${failed.length}/${results.length}`);
  process.exit(1);
}

console.log(`\nPASS: ${results.length}/${results.length}`);
