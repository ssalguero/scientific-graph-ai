/**
 * UX-9.5 — Clipboard Integration gate.
 *
 * Blocks:
 * documentationExists · clipboardBridgeAuthority · clipboardAdapterFreeze
 * clipboardOperationsFreeze · clipboardEntryCanonicalFreeze
 * clipboardSuccessFreeze · clipboardModulePurity · clipboardIntegrationFreeze
 * clipboardDomFreeze · clipboardSeedFreeze · clipboardFeedbackFreeze
 * clipboardFeedbackLifetimeFreeze · legacyIsolationFreeze
 * visualPriorityFreeze · tokenFreeze · paintIndependenceFreeze
 * providerComposition · dependencyRule · authorities · noNewInfrastructure
 * visibleUserOutcomeDocumented · noHistoricalMutation
 * roadmapUpdated · packageScript · productionIntegration · validatorPass
 *
 * Architectural principles:
 * - Visual Integration · no parallel base infrastructure
 * - ProductCompositionHost owns composition
 * - Bridge → BrowserAdapter → navigator.clipboard (Productivity Layer only)
 * - Entry Canonical · Success · Feedback Lifetime · Legacy Isolation
 * - Active > Focused > Selected > Hover > Keyboard Navigation > Discoverability
 * - Clipboard chrome additive · outside cascade
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "documentationExists"
  | "clipboardBridgeAuthority"
  | "clipboardAdapterFreeze"
  | "clipboardOperationsFreeze"
  | "clipboardEntryCanonicalFreeze"
  | "clipboardSuccessFreeze"
  | "clipboardModulePurity"
  | "clipboardIntegrationFreeze"
  | "clipboardDomFreeze"
  | "clipboardSeedFreeze"
  | "clipboardFeedbackFreeze"
  | "clipboardFeedbackLifetimeFreeze"
  | "legacyIsolationFreeze"
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

function importsClipboardSingleton(src: string): boolean {
  return /import\s*\{[^}]*\bclipboardRegistry\b[^}]*\}\s*from\s*["']@\/ui\/clipboard["']/.test(
    src,
  );
}

const DOC = "docs/UX/UX-9.5.md";
const ARCH = "docs/UX/UX-9-architecture.md";
const ROADMAP = "docs/UX/UX-9.0-roadmap.md";
const PACKAGE_JSON = "package.json";
const HOST = "src/components/windows/ProductCompositionHost.tsx";
const PAGE = "src/app/page.tsx";
const FLOATING = "src/components/windows/FloatingWindow.tsx";
const BRIDGE_FILE =
  "src/components/windows/clipboard/ClipboardIntegrationBridge.ts";
const ADAPTER_FILE =
  "src/components/windows/clipboard/BrowserClipboardAdapter.ts";
const CLIPBOARD_INDEX = "src/components/windows/clipboard/index.ts";

const REQUIRED_HEADINGS = [
  "Executive Summary",
  "Scope Fence",
  "Architecture",
  "Clipboard Bridge Authority Freeze",
  "Clipboard Adapter Freeze",
  "Clipboard Operations Freeze",
  "Clipboard Entry Canonical Freeze",
  "Clipboard Success Freeze",
  "Clipboard Module Purity Freeze",
  "Clipboard Integration Freeze",
  "Clipboard DOM Freeze",
  "Clipboard Seed Freeze",
  "Clipboard Feedback Freeze",
  "Clipboard Feedback Lifetime Freeze",
  "Legacy Isolation Freeze",
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
  "Next UX-9.6",
];

const FORBIDDEN_REGISTRY_PATHS = [
  "src/ui/clipboard/ClipboardRegistry.ts",
  "src/ui/clipboard/ClipboardProvider.tsx",
  "src/ui/clipboard/useClipboard.ts",
  "src/ui/focus/FocusRegistry.ts",
  "src/ui/selection/SelectionRegistry.ts",
  "src/ui/hover/HoverRegistry.ts",
  "src/ui/keyboard-nav/KeyboardNavigationRegistry.ts",
];

const ALLOWED_NAVIGATOR_FILES = [ADAPTER_FILE];

/* -------------------------------------------------------------------------- */
/* PASS 1 — documentationExists                                               */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "documentationExists";
  const doc = exists(DOC) ? read(DOC) : "";

  assertCase(block, "doc-exists", exists(DOC), "docs/UX/UX-9.5.md exists");
  assertCase(
    block,
    "small-incremental",
    /Small Incremental Visual Integration/i.test(doc) &&
      /extends UX-9\.4/i.test(doc),
    "Small Incremental Visual Integration · extends UX-9.4",
  );
  for (const heading of REQUIRED_HEADINGS) {
    assertCase(
      block,
      `heading-${heading}`,
      hasHeading(doc, heading),
      `heading: ${heading}`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 2 — clipboardBridgeAuthority                                          */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "clipboardBridgeAuthority";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Clipboard Bridge Authority Freeze");
  const host = exists(HOST) ? stripComments(read(HOST)) : "";
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";
  const bridge = exists(BRIDGE_FILE) ? stripComments(read(BRIDGE_FILE)) : "";
  const adapter = exists(ADAPTER_FILE) ? stripComments(read(ADAPTER_FILE)) : "";

  assertCase(
    block,
    "authority-heading",
    hasHeading(doc, "Clipboard Bridge Authority Freeze"),
    "Clipboard Bridge Authority Freeze section",
  );
  assertCase(
    block,
    "bridge-exists",
    exists(BRIDGE_FILE),
    "ClipboardIntegrationBridge.ts exists",
  );
  assertCase(
    block,
    "adapter-exists",
    exists(ADAPTER_FILE),
    "BrowserClipboardAdapter.ts exists",
  );
  assertCase(
    block,
    "doc-navigator-path",
    /navigator\.clipboard/i.test(body) && /BrowserClipboardAdapter/i.test(body),
    "doc: Bridge → Adapter → navigator.clipboard",
  );
  assertCase(
    block,
    "adapter-calls-navigator",
    /navigator\.clipboard/.test(adapter),
    "BrowserClipboardAdapter calls navigator.clipboard",
  );
  assertCase(
    block,
    "host-no-navigator",
    !/navigator\.clipboard/.test(host),
    "ProductCompositionHost does not call navigator.clipboard",
  );
  assertCase(
    block,
    "floating-no-navigator",
    !/navigator\.clipboard/.test(floating),
    "FloatingWindow does not call navigator.clipboard",
  );
  assertCase(
    block,
    "bridge-no-direct-navigator",
    !/navigator\.clipboard/.test(bridge),
    "Bridge does not call navigator.clipboard directly",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 3 — clipboardAdapterFreeze                                            */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "clipboardAdapterFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Clipboard Adapter Freeze");

  assertCase(
    block,
    "adapter-heading",
    hasHeading(doc, "Clipboard Adapter Freeze"),
    "Clipboard Adapter Freeze section",
  );
  assertCase(
    block,
    "browser-only",
    /BrowserClipboardAdapter/i.test(body) && /only/i.test(body),
    "Browser adapter only documented",
  );
  assertCase(
    block,
    "desktop-plugin-slots",
    /Desktop/i.test(body) && /Plugin/i.test(body) && /slot/i.test(body),
    "Desktop / Plugin remain architectural slots",
  );
  assertCase(
    block,
    "no-stubs",
    /No stub/i.test(body) || /no stub/i.test(body),
    "no stub implementations documented",
  );
  assertCase(
    block,
    "no-desktop-stub-file",
    !exists("src/components/windows/clipboard/DesktopClipboardAdapter.ts"),
    "no DesktopClipboardAdapter stub file",
  );
  assertCase(
    block,
    "no-plugin-stub-file",
    !exists("src/components/windows/clipboard/PluginClipboardAdapter.ts"),
    "no PluginClipboardAdapter stub file",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 4 — clipboardOperationsFreeze                                         */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "clipboardOperationsFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Clipboard Operations Freeze");
  const bridge = exists(BRIDGE_FILE) ? stripComments(read(BRIDGE_FILE)) : "";

  assertCase(
    block,
    "ops-heading",
    hasHeading(doc, "Clipboard Operations Freeze"),
    "Clipboard Operations Freeze section",
  );
  assertCase(
    block,
    "copy-paste",
    /\bCopy\b/.test(body) && /\bPaste\b/.test(body),
    "Copy · Paste documented",
  );
  assertCase(
    block,
    "out-of-scope",
    /Out of scope/i.test(body) &&
      /Cut/i.test(body) &&
      /History/i.test(body) &&
      /Manager/i.test(body),
    "Cut · History · Manager out of scope",
  );
  assertCase(
    block,
    "bridge-copy-paste",
    (/async\s+copy\s*\(/.test(bridge) || /\.copy\s*\(/.test(bridge)) &&
      (/async\s+paste\s*\(/.test(bridge) || /\.paste\s*\(/.test(bridge)),
    "Bridge exposes copy and paste",
  );
  assertCase(
    block,
    "bridge-no-cut",
    !/\bcut\s*\(/i.test(bridge),
    "Bridge has no cut()",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 5 — clipboardEntryCanonicalFreeze                                     */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "clipboardEntryCanonicalFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Clipboard Entry Canonical Freeze");
  const bridge = exists(BRIDGE_FILE) ? stripComments(read(BRIDGE_FILE)) : "";
  const host = exists(HOST) ? stripComments(read(HOST)) : "";
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";

  assertCase(
    block,
    "entry-heading",
    hasHeading(doc, "Clipboard Entry Canonical Freeze"),
    "Clipboard Entry Canonical Freeze section",
  );
  assertCase(
    block,
    "create-entry-doc",
    /createClipboardEntry/i.test(body),
    "createClipboardEntry documented",
  );
  assertCase(
    block,
    "create-entry-fn",
    /createClipboardEntry\s*\(/.test(bridge) ||
      /function\s+createClipboardEntry/.test(bridge),
    "Bridge defines createClipboardEntry",
  );
  assertCase(
    block,
    "set-via-create",
    /createClipboardEntry[\s\S]*\.set\s*\(|\.set\s*\(\s*createClipboardEntry/.test(
      bridge,
    ),
    "Registry.set uses createClipboardEntry",
  );
  assertCase(
    block,
    "host-no-hand-entry",
    !/kind:\s*["']text["']/.test(host) && !/payload:\s*/.test(host),
    "Host does not hand-build ClipboardEntry",
  );
  assertCase(
    block,
    "floating-no-hand-entry",
    !/createClipboardEntry/.test(floating) &&
      !/\.set\s*\(/.test(floating),
    "FloatingWindow does not construct or set entries",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 6 — clipboardSuccessFreeze                                            */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "clipboardSuccessFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Clipboard Success Freeze");
  const bridge = exists(BRIDGE_FILE) ? stripComments(read(BRIDGE_FILE)) : "";

  assertCase(
    block,
    "success-heading",
    hasHeading(doc, "Clipboard Success Freeze"),
    "Clipboard Success Freeze section",
  );
  assertCase(
    block,
    "success-then-set",
    /SUCCESS/i.test(body) && /Registry\.set/i.test(body),
    "SUCCESS → Registry.set documented",
  );
  assertCase(
    block,
    "failure-no-set",
    /FAIL/i.test(body) &&
      /No Registry\.set/i.test(body) &&
      /No feedback/i.test(body),
    "Failure → no set · no feedback documented",
  );
  assertCase(
    block,
    "await-write-before-set",
    /await\s+adapter\.writeText[\s\S]*registry\.set\s*\(\s*createClipboardEntry/.test(
      bridge,
    ),
    "copy awaits writeText before set",
  );
  assertCase(
    block,
    "await-read-before-set",
    /await\s+adapter\.readText[\s\S]*registry\.set\s*\(\s*createClipboardEntry/.test(
      bridge,
    ),
    "paste awaits readText before set",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 7 — clipboardModulePurity                                             */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "clipboardModulePurity";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Clipboard Module Purity Freeze");

  assertCase(
    block,
    "purity-heading",
    hasHeading(doc, "Clipboard Module Purity Freeze"),
    "Clipboard Module Purity Freeze section",
  );
  assertCase(
    block,
    "never-modify-doc",
    /Never modify/i.test(body) && /src\/ui\/clipboard/i.test(body),
    "never modify src/ui/clipboard documented",
  );
  assertCase(
    block,
    "bridge-outside",
    exists(BRIDGE_FILE) && exists(ADAPTER_FILE),
    "Bridge/Adapter outside src/ui/clipboard",
  );
  assertCase(
    block,
    "certified-module-present",
    exists("src/ui/clipboard/ClipboardRegistry.ts"),
    "certified clipboard module still present",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 8 — clipboardIntegrationFreeze                                        */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "clipboardIntegrationFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Clipboard Integration Freeze");
  const host = exists(HOST) ? stripComments(read(HOST)) : "";
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";

  assertCase(
    block,
    "integration-heading",
    hasHeading(doc, "Clipboard Integration Freeze"),
    "Clipboard Integration Freeze section",
  );
  assertCase(
    block,
    "use-clipboard-doc",
    /useClipboard\(\)/i.test(body),
    "useClipboard() documented",
  );
  assertCase(
    block,
    "no-singleton-doc",
    /clipboardRegistry/i.test(body) &&
      (/not\s+used/i.test(body) || /never/i.test(body)),
    "singleton not used in production UI documented",
  );
  assertCase(
    block,
    "host-use-clipboard",
    /useClipboard\s*\(/.test(host),
    "Host uses useClipboard()",
  );
  assertCase(
    block,
    "floating-use-clipboard",
    /useClipboard\s*\(/.test(floating),
    "FloatingWindow uses useClipboard()",
  );
  assertCase(
    block,
    "host-no-singleton-import",
    !importsClipboardSingleton(host),
    "Host does not import clipboardRegistry singleton",
  );
  assertCase(
    block,
    "floating-no-singleton-import",
    !importsClipboardSingleton(floating),
    "FloatingWindow does not import clipboardRegistry singleton",
  );
  assertCase(
    block,
    "floating-no-set-clear",
    !/\.set\s*\(/.test(floating) && !/\.clear\s*\(/.test(floating),
    "FloatingWindow never calls set/clear",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 9 — clipboardDomFreeze                                                */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "clipboardDomFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Clipboard DOM Freeze");
  const host = exists(HOST) ? stripComments(read(HOST)) : "";

  assertCase(
    block,
    "dom-heading",
    hasHeading(doc, "Clipboard DOM Freeze"),
    "Clipboard DOM Freeze section",
  );
  assertCase(
    block,
    "ctrl-cmd-cv",
    (/Ctrl\+C/i.test(body) || /Ctrl\/Cmd\+C/i.test(body)) &&
      (/Ctrl\+V/i.test(body) || /Ctrl\/Cmd\+V/i.test(body) || /Cmd\+V/i.test(body)),
    "Ctrl/Cmd+C · Ctrl/Cmd+V documented",
  );
  assertCase(
    block,
    "no-document-listener-doc",
    /document\.addEventListener/i.test(body) && /No/i.test(body),
    "no document.addEventListener documented",
  );
  assertCase(
    block,
    "domhost-present",
    /function\s+ClipboardDomHost/.test(host) ||
      /ClipboardDomHost/.test(host),
    "ClipboardDomHost present in Host",
  );
  assertCase(
    block,
    "domhost-onKeyDown",
    /ClipboardDomHost[\s\S]*onKeyDown/.test(host),
    "ClipboardDomHost uses onKeyDown",
  );
  assertCase(
    block,
    "no-document-listener-host",
    !/document\.addEventListener/.test(host),
    "Host has no document.addEventListener",
  );
  assertCase(
    block,
    "no-window-listener-host",
    !/window\.addEventListener/.test(host),
    "Host has no window.addEventListener",
  );
  assertCase(
    block,
    "keyboard-domhost-remains",
    /KeyboardNavigationDomHost/.test(host),
    "KeyboardNavigationDomHost remains",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 10 — clipboardSeedFreeze                                              */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "clipboardSeedFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Clipboard Seed Freeze");
  const host = exists(HOST) ? stripComments(read(HOST)) : "";

  assertCase(
    block,
    "seed-heading",
    hasHeading(doc, "Clipboard Seed Freeze"),
    "Clipboard Seed Freeze section",
  );
  assertCase(
    block,
    "runs-once",
    /Runs once/i.test(body) || /one-shot/i.test(body) || /once/i.test(body),
    "seed runs once documented",
  );
  assertCase(
    block,
    "noop-if-entry",
    /NO-OP/i.test(body) && /entry/i.test(body),
    "NO-OP if entry present documented",
  );
  assertCase(
    block,
    "seed-in-host",
    /ClipboardVisualSeed/.test(host) && /seededRef/.test(host),
    "ClipboardVisualSeed ephemeral in Host",
  );
  assertCase(
    block,
    "seed-uses-bridge",
    /clipboardIntegrationBridge[\s\S]*\.copy/.test(host) ||
      /ClipboardVisualSeed[\s\S]*\.copy/.test(host),
    "seed uses Bridge.copy",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 11 — clipboardFeedbackFreeze                                          */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "clipboardFeedbackFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Clipboard Feedback Freeze");
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";

  assertCase(
    block,
    "feedback-heading",
    hasHeading(doc, "Clipboard Feedback Freeze"),
    "Clipboard Feedback Freeze section",
  );
  assertCase(
    block,
    "never-mutates",
    /never mutates/i.test(body) &&
      /Focus/i.test(body) &&
      /Selection/i.test(body) &&
      /Hover/i.test(body) &&
      /Keyboard/i.test(body),
    "feedback never mutates Focus/Selection/Hover/Keyboard",
  );
  assertCase(
    block,
    "additive",
    /additive/i.test(body),
    "additive only documented",
  );
  assertCase(
    block,
    "chrome-attrs",
    /data-clipboard-badge/.test(floating) &&
      /data-clipboard-status/.test(floating),
    "clipboard badge/status attributes present",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 12 — clipboardFeedbackLifetimeFreeze                                  */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "clipboardFeedbackLifetimeFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Clipboard Feedback Lifetime Freeze");
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";
  const bridge = exists(BRIDGE_FILE) ? stripComments(read(BRIDGE_FILE)) : "";

  assertCase(
    block,
    "lifetime-heading",
    hasHeading(doc, "Clipboard Feedback Lifetime Freeze"),
    "Clipboard Feedback Lifetime Freeze section",
  );
  assertCase(
    block,
    "auto-disappear",
    /auto disappear/i.test(body) || /Auto disappear/i.test(body),
    "auto disappear documented",
  );
  assertCase(
    block,
    "never-persistent",
    /Never persistent/i.test(body) || /never persistent/i.test(body),
    "never persistent documented",
  );
  assertCase(
    block,
    "never-authority",
    /Never authority/i.test(body) || /never authority/i.test(body),
    "never authority documented",
  );
  assertCase(
    block,
    "ephemeral-signal",
    /setTimeout|FEEDBACK_MS|emitEphemeralFeedback/.test(bridge),
    "Bridge emits ephemeral feedback",
  );
  assertCase(
    block,
    "copy-paste-feedback-attrs",
    /data-clipboard-copy-feedback/.test(floating) &&
      /data-clipboard-paste-feedback/.test(floating),
    "copy/paste feedback attributes present",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 13 — legacyIsolationFreeze                                            */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "legacyIsolationFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Legacy Isolation Freeze");

  assertCase(
    block,
    "legacy-heading",
    hasHeading(doc, "Legacy Isolation Freeze"),
    "Legacy Isolation Freeze section",
  );
  assertCase(
    block,
    "page-documented",
    /page\.tsx/i.test(body),
    "page.tsx declared out of fence",
  );
  assertCase(
    block,
    "worksheet-documented",
    /ScientificWorksheetPanel/i.test(body),
    "ScientificWorksheetPanel declared out of fence",
  );
  assertCase(
    block,
    "do-not-migrate",
    /Do not migrate/i.test(body) &&
      /Do not modify/i.test(body) &&
      /Do not delete/i.test(body),
    "do not migrate/modify/delete documented",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 14 — visualPriorityFreeze                                             */
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
    "cascade-order",
    /Workspace Active/i.test(body) &&
      /Focused/i.test(body) &&
      /Selected/i.test(body) &&
      /Hover/i.test(body) &&
      /Keyboard Navigation/i.test(body) &&
      /Discoverability/i.test(body),
    "full Visual Priority cascade documented",
  );
  assertCase(
    block,
    "clipboard-additive",
    /additive/i.test(body) && /Clipboard/i.test(body),
    "Clipboard additive · outside cascade",
  );
  assertCase(
    block,
    "floating-comment-cascade",
    /Active\s*>\s*Focused\s*>\s*Selected\s*>\s*Hover\s*>\s*Keyboard Navigation\s*>\s*Discoverability/.test(
      floating,
    ),
    "FloatingWindow preserves cascade comment",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 15 — tokenFreeze                                                      */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "tokenFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Token Freeze");
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";

  assertCase(
    block,
    "token-heading",
    hasHeading(doc, "Token Freeze"),
    "Token Freeze section",
  );
  assertCase(
    block,
    "ui-tokens-doc",
    /UI_TOKENS/i.test(body),
    "UI_TOKENS documented",
  );
  assertCase(
    block,
    "floating-ui-tokens",
    /UI_TOKENS/.test(floating),
    "FloatingWindow uses UI_TOKENS",
  );
  assertCase(
    block,
    "no-hex-in-new-clipboard-chrome",
    !/#[0-9a-fA-F]{3,8}/.test(floating),
    "no hex colors in FloatingWindow",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 16 — paintIndependenceFreeze                                          */
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
    "Clipboard snapshot → chrome documented",
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
/* PASS 17 — providerComposition                                              */
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
    hasHeading(doc, "Provider Composition Freeze"),
    "Provider Composition Freeze section",
  );
  assertCase(
    block,
    "clipboard-provider-in-host",
    /ClipboardProvider/.test(hostCode),
    "ClipboardProvider mounted in ProductCompositionHost",
  );
  assertCase(
    block,
    "nest-order",
    /WindowManager[\s\S]*FocusProvider[\s\S]*SelectionProvider[\s\S]*HoverProvider[\s\S]*KeyboardNavigationProvider[\s\S]*ClipboardProvider/.test(
      hostCode,
    ),
    "nest order WM → Focus → Selection → Hover → Keyboard → Clipboard",
  );
  assertCase(
    block,
    "seeds-under-clipboard",
    /ClipboardProvider[\s\S]*WorkspaceActivationSeed[\s\S]*FocusSelectionVisualSeed[\s\S]*HoverVisualSeed[\s\S]*KeyboardNavigationVisualSeed[\s\S]*ClipboardVisualSeed/.test(
      hostCode,
    ),
    "seeds under ClipboardProvider",
  );
  assertCase(
    block,
    "domhosts-order",
    /KeyboardNavigationDomHost[\s\S]*ClipboardDomHost/.test(hostCode),
    "Keyboard DomHost wraps Clipboard DomHost",
  );
  assertCase(
    block,
    "not-on-page",
    !/ClipboardProvider/.test(page),
    "ClipboardProvider not mounted from page.tsx",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 18 — dependencyRule                                                   */
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
    "no-clipboard-to-focus",
    /Clipboard/i.test(body) && /Focus/i.test(body) && /Forbidden/i.test(body),
    "Clipboard → Focus mutation forbidden",
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
    /useClipboard\s*\(/.test(floating) &&
      !/\.set\s*\(/.test(floating) &&
      !/\.clear\s*\(/.test(floating),
    "FloatingWindow observe-only for clipboard",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 19 — authorities                                                      */
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
    "clipboard-authority",
    /ClipboardRegistry/i.test(body),
    "ClipboardRegistry authority",
  );
  assertCase(
    block,
    "browser-adapter-authority",
    /BrowserClipboardAdapter/i.test(body),
    "BrowserClipboardAdapter authority",
  );
  assertCase(
    block,
    "chrome-authority",
    /FloatingWindow/i.test(body),
    "FloatingWindow chrome authority",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 20 — noNewInfrastructure                                              */
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
    "bridge-and-adapter-only",
    exists(BRIDGE_FILE) && exists(ADAPTER_FILE) && exists(CLIPBOARD_INDEX),
    "Bridge + Adapter (+ barrel) only new transport files",
  );
  assertCase(
    block,
    "clipboard-infra-untouched",
    exists("src/ui/clipboard/ClipboardRegistry.ts"),
    "certified clipboard infrastructure present",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 21 — visibleUserOutcomeDocumented                                     */
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
    "copy-paste-in-vuo",
    /Copy/i.test(body) && /Paste/i.test(body),
    "Copy · Paste in VUO",
  );
  assertCase(
    block,
    "badge-status-feedback",
    /badge/i.test(body) && /status/i.test(body) && /feedback/i.test(body),
    "badge · status · feedback in VUO",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 22 — noHistoricalMutation                                             */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "noHistoricalMutation";

  for (const path of FORBIDDEN_REGISTRY_PATHS) {
    assertCase(block, `exists-${path}`, exists(path), `${path} still exists`);
  }
  assertCase(
    block,
    "ux-9.4-validator",
    exists("scripts/validate-ux-9.4.ts"),
    "validate-ux-9.4.ts preserved",
  );
  assertCase(
    block,
    "ux-9.3-validator",
    exists("scripts/validate-ux-9.3.ts"),
    "validate-ux-9.3.ts preserved",
  );
  assertCase(
    block,
    "ux-8.6-doc",
    exists("docs/UX/UX-8.6.md"),
    "UX-8.6 documentation preserved",
  );
  assertCase(
    block,
    "arch-ssot",
    exists(ARCH),
    "UX-9-architecture.md preserved",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 23 — roadmapUpdated                                                   */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "roadmapUpdated";
  const roadmap = exists(ROADMAP) ? read(ROADMAP) : "";

  assertCase(
    block,
    "ux-9.5-complete",
    /UX-9\.5\s*=\s*COMPLETE/i.test(roadmap) ||
      (/UX-9\.5/.test(roadmap) &&
        /Clipboard Integration/i.test(roadmap) &&
        /\*\*COMPLETE\*\*/.test(roadmap)),
    "UX-9.5 marked COMPLETE",
  );
  assertCase(
    block,
    "ux-9.6-pending",
    /UX-9\.6\s*=\s*PENDING/i.test(roadmap) ||
      (/UX-9\.6/.test(roadmap) && /PENDING/.test(roadmap)),
    "UX-9.6 remains PENDING",
  );
  assertCase(
    block,
    "next-ux-9.6",
    /Next:\s*UX-9\.6/i.test(roadmap) || /Next → UX-9\.6/i.test(roadmap),
    "Next → UX-9.6",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 24 — packageScript                                                    */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "packageScript";
  const pkg = exists(PACKAGE_JSON) ? read(PACKAGE_JSON) : "";

  assertCase(
    block,
    "validate-ux-9.5-script",
    /"validate:ux-9\.5"\s*:\s*"npx tsx scripts\/validate-ux-9\.5\.ts"/.test(pkg),
    "validate:ux-9.5 script exact",
  );
  assertCase(
    block,
    "preserves-9.4",
    /"validate:ux-9\.4"/.test(pkg),
    "validate:ux-9.4 preserved",
  );
  assertCase(
    block,
    "preserves-9.1",
    /"validate:ux-9\.1"/.test(pkg),
    "validate:ux-9.1 preserved",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 25 — productionIntegration                                            */
/* -------------------------------------------------------------------------- */
{
  const block: BlockId = "productionIntegration";
  const host = exists(HOST) ? stripComments(read(HOST)) : "";
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";
  const adapter = exists(ADAPTER_FILE) ? stripComments(read(ADAPTER_FILE)) : "";
  const bridge = exists(BRIDGE_FILE) ? stripComments(read(BRIDGE_FILE)) : "";

  assertCase(
    block,
    "provider-mounted",
    /ClipboardProvider/.test(host),
    "ClipboardProvider mounted",
  );
  assertCase(
    block,
    "hook-consumed",
    /useClipboard\s*\(/.test(floating),
    "useClipboard consumed in chrome",
  );
  assertCase(
    block,
    "seed-ephemeral",
    /ClipboardVisualSeed/.test(host) && /seededRef/.test(host),
    "ClipboardVisualSeed ephemeral",
  );
  assertCase(
    block,
    "domhost-bridge",
    /ClipboardDomHost/.test(host) &&
      /clipboardIntegrationBridge/.test(host),
    "DomHost calls Bridge",
  );
  assertCase(
    block,
    "chrome-clipboard-attrs",
    /data-clipboard-badge/.test(floating) &&
      /data-clipboard-status/.test(floating),
    "clipboard chrome attributes present",
  );
  assertCase(
    block,
    "navigator-only-in-adapter-among-allowed",
    /navigator\.clipboard/.test(adapter) &&
      !/navigator\.clipboard/.test(bridge) &&
      !/navigator\.clipboard/.test(host) &&
      !/navigator\.clipboard/.test(floating),
    "navigator.clipboard only in BrowserClipboardAdapter among allowed files",
  );
  assertCase(
    block,
    "allowed-navigator-files",
    ALLOWED_NAVIGATOR_FILES.every((f) => exists(f)),
    "allowed navigator adapter file exists",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 26 — validatorPass                                                    */
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

console.log(`\nUX-9.5 validator — ${passed.length}/${results.length} passed\n`);

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

console.log("\nPASS — UX-9.5 Clipboard Integration\n");
process.exit(0);
