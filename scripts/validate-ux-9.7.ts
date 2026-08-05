/**
 * UX-9.7 — Undo / Redo Integration gate.
 *
 * Blocks:
 * documentationExists · historyEntryFreeze · undoSemanticsFreeze
 * thinHistoryAdapterFreeze · historyStateCanonicalFreeze · historyIdentityFreeze
 * historyCanonicalFreeze · commandEnvelopeReuseFreeze · historyOwnershipFreeze
 * executionOwnershipFreeze · historyOverlayOwnershipFreeze
 * undoRedoOperationsFreeze · historySuccessFreeze · undoRedoFeedbackFreeze
 * feedbackLifetimeFreeze · domFreeze · visualPriorityFreeze · tokenFreeze
 * paintIndependenceFreeze · providerComposition · dependencyRule
 * authorities · noNewInfrastructure · visibleUserOutcomeDocumented
 * seriesClosureNote · noHistoricalMutation · roadmapUpdated · packageScript
 * productionIntegration · validatorPass
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "documentationExists"
  | "historyEntryFreeze"
  | "undoSemanticsFreeze"
  | "thinHistoryAdapterFreeze"
  | "historyStateCanonicalFreeze"
  | "historyIdentityFreeze"
  | "historyCanonicalFreeze"
  | "commandEnvelopeReuseFreeze"
  | "historyOwnershipFreeze"
  | "executionOwnershipFreeze"
  | "historyOverlayOwnershipFreeze"
  | "undoRedoOperationsFreeze"
  | "historySuccessFreeze"
  | "undoRedoFeedbackFreeze"
  | "feedbackLifetimeFreeze"
  | "domFreeze"
  | "visualPriorityFreeze"
  | "tokenFreeze"
  | "paintIndependenceFreeze"
  | "providerComposition"
  | "dependencyRule"
  | "authorities"
  | "noNewInfrastructure"
  | "visibleUserOutcomeDocumented"
  | "seriesClosureNote"
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
  const start = new RegExp(`^##\\s+${escaped}\\s*$`, "m").exec(doc);
  if (!start) {
    return "";
  }
  const from = start.index + start[0].length;
  const rest = doc.slice(from);
  const next = /^##\s+/m.exec(rest);
  return next ? rest.slice(0, next.index) : rest;
}

const DOC = "docs/UX/UX-9.7.md";
const ROADMAP = "docs/UX/UX-9.0-roadmap.md";
const PACKAGE_JSON = "package.json";
const HOST = "src/components/windows/ProductCompositionHost.tsx";
const PAGE = "src/app/page.tsx";
const FLOATING = "src/components/windows/FloatingWindow.tsx";
const INT_BRIDGE = "src/components/windows/commands/InteractionCommandBridge.ts";
const ADAPTER = "src/components/windows/history/ThinHistoryAdapter.ts";
const BRIDGE = "src/components/windows/history/UndoRedoBridge.ts";
const DOM_HOST = "src/components/windows/history/UndoRedoDomHost.tsx";
const HIST_INDEX = "src/components/windows/history/index.ts";

const REQUIRED_HEADINGS = [
  "Executive Summary",
  "Scope Fence",
  "Architecture",
  "History Entry Freeze",
  "Undo Semantics Freeze",
  "Thin History Adapter Freeze",
  "History State Canonical Freeze",
  "History Identity Freeze",
  "History Canonical Freeze",
  "Command Envelope Reuse Freeze",
  "History Ownership Freeze",
  "Execution Ownership Freeze",
  "History Overlay Ownership Freeze",
  "Undo / Redo Operations Freeze",
  "History Success Freeze",
  "Undo / Redo Feedback Freeze",
  "Feedback Lifetime Freeze",
  "DOM Freeze",
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
  "Series Closure Note",
  "Next UX-9.8",
];

const FORBIDDEN_PATHS = [
  "src/ui/interaction-commands/InteractionCommandDispatcher.ts",
  "src/ui/interaction-commands/InteractionCommandProvider.tsx",
  "src/ui/palette/CommandPaletteProvider.tsx",
  "src/ui/clipboard/ClipboardRegistry.ts",
  "docs/UX/UX-9.6.md",
  "scripts/validate-ux-9.6.ts",
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
    "doc.extends96",
    /Small Incremental Visual Integration/i.test(doc) &&
      /extends UX-9\.6/i.test(doc),
    "Documents Small Incremental Visual Integration extending UX-9.6",
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
/* historyEntryFreeze                                                         */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "historyEntryFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "History Entry Freeze");
  assertCase(
    block,
    "doc.acceptedOnly",
    /accepted\s*===\s*true/i.test(body) && /never recorded/i.test(body),
    "Accepted-only entry documented",
  );
  const intBridge = exists(INT_BRIDGE) ? stripComments(read(INT_BRIDGE)) : "";
  assertCase(
    block,
    "bridge.recordOnAccepted",
    /result\.accepted/.test(intBridge) &&
      /recordAccepted/.test(intBridge) &&
      /history/i.test(intBridge),
    "InteractionCommandBridge records only when accepted",
  );
}

/* -------------------------------------------------------------------------- */
/* undoSemanticsFreeze                                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "undoSemanticsFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Undo Semantics Freeze");
  assertCase(
    block,
    "doc.structural",
    /structural only/i.test(body) && /No domain rollback/i.test(body),
    "Structural undo semantics documented",
  );
  const bridge = exists(BRIDGE) ? stripComments(read(BRIDGE)) : "";
  assertCase(
    block,
    "bridge.noDomainInvert",
    !/domainRollback/i.test(bridge) &&
      !/invertCommand/i.test(bridge) &&
      !/localStorage/.test(bridge) &&
      !/indexedDB/.test(bridge),
    "Bridge has no domain inversion",
  );
}

/* -------------------------------------------------------------------------- */
/* thinHistoryAdapterFreeze                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "thinHistoryAdapterFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Thin History Adapter Freeze");
  assertCase(
    block,
    "doc.api",
    /push/.test(body) &&
      /undo/.test(body) &&
      /redo/.test(body) &&
      /canUndo/.test(body) &&
      /canRedo/.test(body),
    "Adapter API documented",
  );
  assertCase(block, "adapter.exists", exists(ADAPTER), `${ADAPTER} exists`);
  const adapter = exists(ADAPTER) ? stripComments(read(ADAPTER)) : "";
  assertCase(
    block,
    "adapter.api",
    /\bpush\(/.test(adapter) &&
      /\bundo\(/.test(adapter) &&
      /\bredo\(/.test(adapter) &&
      /\bcanUndo\(/.test(adapter) &&
      /\bcanRedo\(/.test(adapter),
    "Adapter implements push/undo/redo/canUndo/canRedo",
  );
  assertCase(
    block,
    "adapter.noReact",
    !/from\s+["']react["']/.test(adapter) && !/\bReact\b/.test(adapter),
    "Adapter has no React",
  );
  assertCase(
    block,
    "adapter.noRegistries",
    !/FocusRegistry|SelectionRegistry|ClipboardRegistry|HoverRegistry|KeyboardNavigationRegistry|WindowManager/.test(
      adapter,
    ) && !/from\s+["']react["']/.test(adapter),
    "Adapter imports no registries / WindowManager",
  );
  // Allow only InteractionCommand type import from interaction-commands
  assertCase(
    block,
    "adapter.typeImportOnly",
    /import\s+type\s+\{[^}]*InteractionCommand/.test(read(ADAPTER)) &&
      !/FocusRegistry|SelectionRegistry|ClipboardRegistry|HoverRegistry|KeyboardNavigation/.test(
        adapter,
      ),
    "Adapter only type-imports InteractionCommand",
  );
}

/* -------------------------------------------------------------------------- */
/* historyStateCanonicalFreeze                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "historyStateCanonicalFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "History State Canonical Freeze");
  assertCase(
    block,
    "doc.publicState",
    /canUndo/.test(body) &&
      /canRedo/.test(body) &&
      /private/i.test(body) &&
      /never inspects stacks/i.test(body),
    "Public canUndo/canRedo · stacks private documented",
  );
  const adapter = exists(ADAPTER) ? stripComments(read(ADAPTER)) : "";
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";
  const dom = exists(DOM_HOST) ? stripComments(read(DOM_HOST)) : "";
  assertCase(
    block,
    "adapter.noPublicStacks",
    !/getState\s*\(/.test(adapter) &&
      !/export\s+(const|let|var|function|type|interface).*undoStack/i.test(
        read(ADAPTER),
      ),
    "Adapter does not export stacks or getState",
  );
  assertCase(
    block,
    "ui.noStackInspect",
    !/undoStack/.test(floating) &&
      !/redoStack/.test(floating) &&
      !/undoStack/.test(dom) &&
      !/redoStack/.test(dom) &&
      !/thinHistoryAdapter/.test(floating),
    "UI never inspects stacks / Adapter",
  );
}

/* -------------------------------------------------------------------------- */
/* historyIdentityFreeze                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "historyIdentityFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "History Identity Freeze");
  assertCase(
    block,
    "doc.identity",
    /same reference/i.test(body) &&
      /No clone/i.test(body) &&
      /No copy/i.test(body) &&
      /No normalize/i.test(body),
    "Identity freeze documented",
  );
  const adapter = exists(ADAPTER) ? stripComments(read(ADAPTER)) : "";
  assertCase(
    block,
    "adapter.noClone",
    !/structuredClone/.test(adapter) &&
      !/\.map\(/.test(adapter) &&
      !/\{\s*\.\.\./.test(adapter) &&
      !/JSON\.parse/.test(adapter) &&
      !/JSON\.stringify/.test(adapter),
    "Adapter does not clone/copy/normalize commands",
  );
  assertCase(
    block,
    "adapter.pushReference",
    /undoStack\.push\(command\)/.test(adapter),
    "push stores command reference",
  );
}

/* -------------------------------------------------------------------------- */
/* historyCanonicalFreeze                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "historyCanonicalFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "History Canonical Freeze");
  assertCase(
    block,
    "doc.canonical",
    /InteractionCommandBridge/.test(body) && /recordAccepted/.test(body),
    "Canonical registration documented",
  );
  const intBridge = exists(INT_BRIDGE) ? stripComments(read(INT_BRIDGE)) : "";
  const bridge = exists(BRIDGE) ? stripComments(read(BRIDGE)) : "";
  const dom = exists(DOM_HOST) ? stripComments(read(DOM_HOST)) : "";
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";
  const host = exists(HOST) ? stripComments(read(HOST)) : "";
  assertCase(
    block,
    "icb.callsRecordAccepted",
    /undoRedoBridge\.recordAccepted/.test(intBridge),
    "InteractionCommandBridge calls recordAccepted",
  );
  assertCase(
    block,
    "others.noRecordAccepted",
    !/recordAccepted/.test(dom) &&
      !/recordAccepted/.test(floating) &&
      !/recordAccepted/.test(host) &&
      !/\.push\(/.test(dom) &&
      !/thinHistoryAdapter\.push/.test(floating),
    "DomHost/FloatingWindow/Host do not record history",
  );
  assertCase(
    block,
    "bridge.definesRecordAccepted",
    /recordAccepted\(/.test(bridge),
    "UndoRedoBridge defines recordAccepted",
  );
}

/* -------------------------------------------------------------------------- */
/* commandEnvelopeReuseFreeze                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "commandEnvelopeReuseFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Command Envelope Reuse Freeze");
  assertCase(
    block,
    "doc.envelopes",
    /history\.undo/.test(body) &&
      /history\.redo/.test(body) &&
      /palette\.execute/.test(body),
    "Envelope reuse documented",
  );
  const intBridge = exists(INT_BRIDGE) ? stripComments(read(INT_BRIDGE)) : "";
  assertCase(
    block,
    "icb.createCommandEnvelope",
    /createCommandEnvelope\(/.test(intBridge),
    "createCommandEnvelope exists",
  );
  assertCase(
    block,
    "icb.historyUndo",
    /history\.undo/.test(intBridge),
    "history.undo envelope",
  );
  assertCase(
    block,
    "icb.historyRedo",
    /history\.redo/.test(intBridge),
    "history.redo envelope",
  );
  assertCase(
    block,
    "icb.paletteExecute",
    /palette\.execute/.test(intBridge),
    "palette.execute preserved",
  );
}

/* -------------------------------------------------------------------------- */
/* historyOwnershipFreeze                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "historyOwnershipFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "History Ownership Freeze");
  assertCase(
    block,
    "doc.ownership",
    /ThinHistoryAdapter stores/i.test(body) &&
      /InteractionCommandBridge dispatches/i.test(body) &&
      /UndoRedoBridge orchestrates/i.test(body),
    "Ownership matrix documented",
  );
  const adapter = exists(ADAPTER) ? stripComments(read(ADAPTER)) : "";
  assertCase(
    block,
    "adapter.noDispatch",
    !/\.dispatch\(/.test(adapter) && !/Dispatcher/.test(adapter),
    "Adapter never dispatches",
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
    "doc.execution",
    /executeUndo/.test(body) &&
      /executeRedo/.test(body) &&
      /InteractionCommandBridge/.test(body) &&
      /Never directly through Dispatcher/i.test(body),
    "Execution ownership documented",
  );
  const bridge = exists(BRIDGE) ? stripComments(read(BRIDGE)) : "";
  const dom = exists(DOM_HOST) ? stripComments(read(DOM_HOST)) : "";
  assertCase(
    block,
    "bridge.executeViaIcb",
    /executeUndo\(/.test(bridge) &&
      /executeRedo\(/.test(bridge) &&
      /interactionCommandBridge\.execute/.test(bridge),
    "Bridge executeUndo/Redo via InteractionCommandBridge",
  );
  assertCase(
    block,
    "bridge.noDirectDispatch",
    !/dispatcher\.dispatch/.test(bridge),
    "Bridge never calls dispatcher.dispatch directly",
  );
  assertCase(
    block,
    "dom.callsBridgeOnly",
    /executeUndo/.test(dom) &&
      /executeRedo/.test(dom) &&
      !/\.dispatch\(/.test(dom),
    "DomHost calls Bridge executeUndo/Redo only",
  );
}

/* -------------------------------------------------------------------------- */
/* historyOverlayOwnershipFreeze                                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "historyOverlayOwnershipFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "History Overlay Ownership Freeze");
  assertCase(
    block,
    "doc.overlay",
    /UndoRedoBridge/.test(body) &&
      /observe-only/i.test(body) &&
      /pure/i.test(body),
    "Overlay ownership documented",
  );
  const bridge = exists(BRIDGE) ? stripComments(read(BRIDGE)) : "";
  const adapter = exists(ADAPTER) ? stripComments(read(ADAPTER)) : "";
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";
  const dom = exists(DOM_HOST) ? stripComments(read(DOM_HOST)) : "";
  assertCase(
    block,
    "bridge.ownsOverlay",
    /subscribeUndoRedoOverlay/.test(bridge) &&
      /getUndoRedoOverlay/.test(bridge) &&
      /canUndo/.test(bridge) &&
      /canRedo/.test(bridge),
    "UndoRedoBridge owns overlay subscribe/get",
  );
  assertCase(
    block,
    "adapter.noOverlay",
    !/subscribe/.test(adapter) &&
      !/feedback/i.test(adapter) &&
      !/overlay/i.test(adapter),
    "Adapter has no overlay/feedback",
  );
  assertCase(
    block,
    "floating.observeOnly",
    /subscribeUndoRedoOverlay/.test(floating) &&
      /subscribeUndoRedoFeedback/.test(floating) &&
      !/executeUndo/.test(floating) &&
      !/executeRedo/.test(floating) &&
      !/recordAccepted/.test(floating),
    "FloatingWindow observe-only",
  );
  assertCase(
    block,
    "dom.noOverlayState",
    !/subscribeUndoRedoOverlay/.test(dom) &&
      !/getUndoRedoOverlay/.test(dom) &&
      !/canUndo/.test(dom),
    "DomHost does not own overlay state",
  );
}

/* -------------------------------------------------------------------------- */
/* undoRedoOperationsFreeze                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "undoRedoOperationsFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Undo / Redo Operations Freeze");
  assertCase(
    block,
    "doc.ops",
    /Supported/.test(body) &&
      /Forbidden/.test(body) &&
      /Timeline/.test(body) &&
      /Persistence/.test(body) &&
      /Branching/.test(body),
    "Supported/Forbidden ops documented",
  );
  const bridge = exists(BRIDGE) ? stripComments(read(BRIDGE)) : "";
  const adapter = exists(ADAPTER) ? stripComments(read(ADAPTER)) : "";
  assertCase(
    block,
    "noForbiddenOps",
    !/timeline/i.test(bridge) &&
      !/persist/i.test(bridge) &&
      !/checkpoint/i.test(bridge) &&
      !/branch/i.test(adapter) &&
      !/localStorage/.test(bridge),
    "No forbidden history operations in code",
  );
}

/* -------------------------------------------------------------------------- */
/* historySuccessFreeze                                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "historySuccessFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "History Success Freeze");
  assertCase(
    block,
    "doc.success",
    /accepted/.test(body) &&
      /history update/.test(body) &&
      /no history mutation/i.test(body),
    "Success path documented",
  );
  const intBridge = exists(INT_BRIDGE) ? stripComments(read(INT_BRIDGE)) : "";
  const bridge = exists(BRIDGE) ? stripComments(read(BRIDGE)) : "";
  assertCase(
    block,
    "recordAfterAccepted",
    /if\s*\(\s*result\.accepted\s*\)/.test(intBridge) &&
      /recordAccepted/.test(intBridge),
    "recordAccepted gated on accepted",
  );
  assertCase(
    block,
    "undoAfterAccepted",
    /if\s*\(\s*!result\.accepted\s*\)/.test(bridge) &&
      /thinHistoryAdapter\.undo/.test(bridge),
    "Stack undo only after accepted dispatch",
  );
}

/* -------------------------------------------------------------------------- */
/* undoRedoFeedbackFreeze                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "undoRedoFeedbackFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Undo / Redo Feedback Freeze");
  assertCase(
    block,
    "doc.kinds",
    /undo available/i.test(body) &&
      /redo available/i.test(body) &&
      /undo executed/i.test(body) &&
      /redo executed/i.test(body),
    "Feedback kinds documented",
  );
  const bridge = exists(BRIDGE) ? stripComments(read(BRIDGE)) : "";
  assertCase(
    block,
    "bridge.kinds",
    /undo-available/.test(bridge) &&
      /redo-available/.test(bridge) &&
      /undo-executed/.test(bridge) &&
      /redo-executed/.test(bridge),
    "Bridge defines four feedback kinds",
  );
  assertCase(
    block,
    "bridge.noFocusMutation",
    !/FocusRegistry/.test(bridge) &&
      !/SelectionRegistry/.test(bridge) &&
      !/HoverRegistry/.test(bridge) &&
      !/ClipboardRegistry/.test(bridge),
    "Bridge never mutates interaction registries",
  );
}

/* -------------------------------------------------------------------------- */
/* feedbackLifetimeFreeze                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "feedbackLifetimeFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Feedback Lifetime Freeze");
  assertCase(
    block,
    "doc.ephemeral",
    /ephemeral/i.test(body) && /auto disappear/i.test(body),
    "Ephemeral lifetime documented",
  );
  const bridge = exists(BRIDGE) ? stripComments(read(BRIDGE)) : "";
  assertCase(
    block,
    "bridge.timeout",
    /setTimeout/.test(bridge) && /FEEDBACK_MS/.test(bridge),
    "Bridge auto-clears feedback",
  );
}

/* -------------------------------------------------------------------------- */
/* domFreeze                                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "domFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "DOM Freeze");
  assertCase(
    block,
    "doc.keys",
    /Ctrl\/Cmd\+Z/.test(body) &&
      /Ctrl\/Cmd\+Shift\+Z/.test(body) &&
      /Ctrl\/Cmd\+Y/.test(body),
    "DOM keys documented",
  );
  assertCase(block, "dom.exists", exists(DOM_HOST), `${DOM_HOST} exists`);
  const dom = exists(DOM_HOST) ? stripComments(read(DOM_HOST)) : "";
  assertCase(
    block,
    "dom.onKeyDown",
    /onKeyDown/.test(dom),
    "DomHost uses onKeyDown",
  );
  assertCase(
    block,
    "dom.noGlobalListeners",
    !/document\.addEventListener/.test(dom) &&
      !/window\.addEventListener/.test(dom),
    "No document/window listeners",
  );
  assertCase(
    block,
    "dom.keys",
    /["']z["']/.test(dom.toLowerCase()) && /["']y["']/.test(dom.toLowerCase()),
    "DomHost captures Z and Y",
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
    "doc.priority",
    /Workspace Active/.test(body) &&
      /Discoverability/.test(body) &&
      /additive/i.test(body),
    "Visual Priority documented",
  );
  const floating = exists(FLOATING) ? read(FLOATING) : "";
  assertCase(
    block,
    "floating.additive",
    /additive/i.test(floating) && /Undo/.test(floating),
    "FloatingWindow marks Undo/Redo chrome additive",
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
    /UI_TOKENS/.test(body) && /CSS variables/i.test(body),
    "Token Freeze documented",
  );
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";
  assertCase(
    block,
    "floating.tokens",
    /UI_TOKENS/.test(floating) &&
      /var\(--app-/.test(floating) &&
      !/#[0-9a-fA-F]{3,8}/.test(floating.replace(/\/\*[\s\S]*?\*\//g, "")),
    "FloatingWindow uses UI_TOKENS / CSS vars (no hex in code)",
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
    /Adapter snapshot/.test(body) &&
      /UndoRedoBridge overlay/.test(body) &&
      /FloatingWindow chrome/.test(body),
    "Paint Independence documented",
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
    /No new Provider/.test(body) &&
      /UndoRedoDomHost/.test(body) &&
      /CommandPaletteDomHost/.test(body),
    "Provider composition documented",
  );
  const host = exists(HOST) ? stripComments(read(HOST)) : "";
  const page = exists(PAGE) ? stripComments(read(PAGE)) : "";
  assertCase(
    block,
    "host.mountsDomHost",
    /UndoRedoDomHost/.test(host) && /CommandPaletteDomHost/.test(host),
    "Host mounts UndoRedoDomHost",
  );
  assertCase(
    block,
    "nestOrder",
    /CommandPaletteDomHost[\s\S]*UndoRedoDomHost[\s\S]*children/.test(host),
    "UndoRedoDomHost nested after CommandPaletteDomHost",
  );
  assertCase(
    block,
    "page.noProvider",
    !/UndoRedoProvider/.test(page) && !/HistoryProvider/.test(page),
    "page.tsx does not mount history Provider",
  );
  assertCase(
    block,
    "noNewProvider",
    !/createContext\(/.test(host) &&
      !/HistoryProvider/.test(host) &&
      !/UndoRedoProvider/.test(host),
    "No new Provider/Context in host",
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
    /never mutates/i.test(body) && /observe-only/i.test(body),
    "Dependency Rule documented",
  );
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";
  assertCase(
    block,
    "floating.observeOnly",
    /subscribeUndoRedoOverlay/.test(floating) &&
      !/undoRedoBridge\.execute/.test(floating) &&
      !/thinHistoryAdapter/.test(floating),
    "FloatingWindow observe-only for undo/redo",
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
      /ThinHistoryAdapter/.test(body) &&
      /UndoRedoBridge/.test(body) &&
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
  assertCase(
    block,
    "productSurfaceExists",
    exists(ADAPTER) && exists(BRIDGE) && exists(DOM_HOST) && exists(HIST_INDEX),
    "Product surface files exist",
  );
  const host = exists(HOST) ? stripComments(read(HOST)) : "";
  assertCase(
    block,
    "no.createContext",
    !/createContext\(/.test(host),
    "Host does not createContext",
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
    /Visible Changes/.test(body),
    "Visible Changes present",
  );
  assertCase(
    block,
    "has.ReusedInfrastructure",
    /Reused Infrastructure/.test(body),
    "Reused Infrastructure present",
  );
  assertCase(
    block,
    "has.UserVerification",
    /User Verification/.test(body),
    "User Verification present",
  );
  assertCase(
    block,
    "mentions.ops",
    /Ctrl\/Cmd\+Z/.test(body) &&
      /Ctrl\/Cmd\+Y/.test(body) &&
      /Undo/i.test(body) &&
      /Redo/i.test(body),
    "VUO mentions shortcuts and undo/redo",
  );
}

/* -------------------------------------------------------------------------- */
/* seriesClosureNote                                                          */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "seriesClosureNote";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Series Closure Note");
  assertCase(
    block,
    "doc.closure",
    /no new Productivity capabilities/i.test(body) &&
      /UX-9\.8/.test(body) &&
      /UX-9\.9/.test(body) &&
      /UX-9\.10/.test(body),
    "Series closure note present",
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
    "ux97.complete",
    /UX-9\.7\s*=\s*COMPLETE/.test(roadmap) ||
      /UX-9\.7.*COMPLETE/.test(roadmap),
    "UX-9.7 marked COMPLETE",
  );
  assertCase(
    block,
    "ux98.pending",
    /UX-9\.8.*PENDING/.test(roadmap),
    "UX-9.8 remains PENDING",
  );
  assertCase(
    block,
    "next.ux98",
    /Next.*UX-9\.8/i.test(roadmap) || /Next → UX-9\.8/.test(roadmap),
    "Next points to UX-9.8",
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
    /"validate:ux-9\.7":\s*"npx tsx scripts\/validate-ux-9\.7\.ts"/.test(pkg),
    "validate:ux-9.7 script exact",
  );
  assertCase(
    block,
    "preserves.96",
    /"validate:ux-9\.6":\s*"npx tsx scripts\/validate-ux-9\.6\.ts"/.test(pkg),
    "validate:ux-9.6 preserved",
  );
}

/* -------------------------------------------------------------------------- */
/* productionIntegration                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "productionIntegration";
  const host = exists(HOST) ? stripComments(read(HOST)) : "";
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";
  const intBridge = exists(INT_BRIDGE) ? stripComments(read(INT_BRIDGE)) : "";
  const bridge = exists(BRIDGE) ? stripComments(read(BRIDGE)) : "";
  const dom = exists(DOM_HOST) ? stripComments(read(DOM_HOST)) : "";
  const adapter = exists(ADAPTER) ? stripComments(read(ADAPTER)) : "";
  assertCase(
    block,
    "host.domNesting",
    /CommandPaletteDomHost[\s\S]*UndoRedoDomHost/.test(host),
    "Host nests UndoRedoDomHost after CommandPaletteDomHost",
  );
  assertCase(
    block,
    "dom.hook",
    /useInteractionCommands/.test(dom) && /undoRedoBridge/.test(dom),
    "DomHost uses Provider hook + Bridge",
  );
  assertCase(
    block,
    "bridge.execute",
    /executeUndo/.test(bridge) &&
      /executeRedo/.test(bridge) &&
      /interactionCommandBridge\.execute/.test(bridge),
    "UndoRedoBridge executeUndo/Redo wired",
  );
  assertCase(
    block,
    "icb.envelope",
    /createCommandEnvelope/.test(intBridge) &&
      /history\.undo/.test(intBridge) &&
      /history\.redo/.test(intBridge) &&
      /recordAccepted/.test(intBridge),
    "InteractionCommandBridge envelope + recordAccepted",
  );
  assertCase(
    block,
    "adapter.privateStacks",
    /canUndo/.test(adapter) &&
      /canRedo/.test(adapter) &&
      !/^export\s+.*undoStack/m.test(read(ADAPTER)) &&
      !/^export\s+\{[^}]*undoStack/m.test(read(ADAPTER)),
    "Adapter public API availability only",
  );
  assertCase(
    block,
    "floating.chrome",
    /data-undo-badge/.test(floating) &&
      /data-redo-badge/.test(floating) &&
      /data-undo-executed-feedback/.test(floating),
    "FloatingWindow undo/redo chrome present",
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

console.log("UX-9.7 validate-ux-9.7");
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
