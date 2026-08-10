/**
 * UX-9.8 — Workspace Polish + Diagnostics gate.
 *
 * Blocks:
 * documentationExists · workspacePolishFreeze · polishIdentityFreeze
 * workspaceChromeFreeze · lovableIdentityFreeze · visualSystemConsistencyFreeze
 * chromeDensityFreeze · diagnosticsFreeze · diagnosticsVisibilityFreeze
 * diagnosticsDataFreeze · diagnosticsReadabilityFreeze · diagnosticsLifetimeFreeze
 * polishDiagnosticsSeparationFreeze · visualHierarchyFreeze · animationFreeze
 * providerComposition · dependencyRule · authorities · noNewInfrastructure
 * visibleUserOutcomeDocumented · seriesCompletionNote · roadmapUpdated
 * packageScript · productionIntegration · validatorPass
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "documentationExists"
  | "workspacePolishFreeze"
  | "polishIdentityFreeze"
  | "workspaceChromeFreeze"
  | "lovableIdentityFreeze"
  | "visualSystemConsistencyFreeze"
  | "chromeDensityFreeze"
  | "diagnosticsFreeze"
  | "diagnosticsVisibilityFreeze"
  | "diagnosticsDataFreeze"
  | "diagnosticsReadabilityFreeze"
  | "diagnosticsLifetimeFreeze"
  | "polishDiagnosticsSeparationFreeze"
  | "visualHierarchyFreeze"
  | "animationFreeze"
  | "providerComposition"
  | "dependencyRule"
  | "authorities"
  | "noNewInfrastructure"
  | "visibleUserOutcomeDocumented"
  | "seriesCompletionNote"
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

const DOC = "docs/UX/specifications/UX-9.8.md";
const ROADMAP = "docs/UX/roadmaps/UX-9.0-roadmap.md";
const PACKAGE_JSON = "package.json";
const HOST = "src/components/windows/ProductCompositionHost.tsx";
const FLOATING = "src/components/windows/FloatingWindow.tsx";
const OVERLAY =
  "src/components/windows/diagnostics/WorkspaceDiagnosticsOverlay.tsx";
const DIAG_INDEX = "src/components/windows/diagnostics/index.ts";
const HISTORY_DIR = "src/components/windows/history";
const COMMANDS_DIR = "src/components/windows/commands";
const CLIPBOARD_DIR = "src/components/windows/clipboard";

const REQUIRED_HEADINGS = [
  "Executive Summary",
  "Scope Fence",
  "Architecture",
  "Workspace Polish",
  "Polish Identity Freeze",
  "Workspace Chrome Freeze",
  "Lovable Identity Freeze",
  "Visual System Consistency Freeze",
  "Chrome Density Freeze",
  "Diagnostics",
  "Diagnostics Freeze",
  "Diagnostics Visibility Freeze",
  "Diagnostics Data Freeze",
  "Diagnostics Readability Freeze",
  "Diagnostics Lifetime Freeze",
  "Polish / Diagnostics Separation Freeze",
  "Visual Hierarchy Freeze",
  "Animation Freeze",
  "Provider Composition Freeze",
  "Dependency Rule",
  "Authorities",
  "Visible User Outcome",
  "Acceptance Criteria",
  "Protected Files",
  "Gate",
  "Series Completion Note",
  "Next UX-9.9",
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
    "extends.97",
    /extends UX-9\.7/i.test(doc) || /UX-9\.8 extends UX-9\.7/i.test(doc),
    "Doc states UX-9.8 extends UX-9.7",
  );
  for (const heading of REQUIRED_HEADINGS) {
    assertCase(
      block,
      `heading.${heading}`,
      hasHeading(doc, heading),
      `Heading present: ${heading}`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* workspacePolishFreeze                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "workspacePolishFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Workspace Polish");
  assertCase(
    block,
    "doc.polish",
    /FloatingWindow/i.test(body) && /Never modify/i.test(body),
    "Workspace Polish documents FloatingWindow-only surface",
  );
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";
  assertCase(
    block,
    "fw.noDispatch",
    !/\.dispatch\s*\(/.test(floating) &&
      !/\.clear\s*\(/.test(floating) &&
      !/executeUndo|executeRedo/.test(floating),
    "FloatingWindow has no dispatch/clear/executeUndo/Redo",
  );
  assertCase(
    block,
    "fw.chromeObject",
    /FLOATING_WINDOW_CHROME/.test(floating) && /UX-9\.8/.test(read(FLOATING)),
    "FloatingWindow chrome object present with UX-9.8",
  );
}

/* -------------------------------------------------------------------------- */
/* polishIdentityFreeze                                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "polishIdentityFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Polish Identity Freeze");
  assertCase(
    block,
    "doc.identity",
    /Never logic/i.test(body) && /visual hierarchy/i.test(body),
    "Polish Identity Freeze documented",
  );
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";
  assertCase(
    block,
    "fw.uiTokens",
    /UI_TOKENS/.test(floating),
    "FloatingWindow uses UI_TOKENS",
  );
  assertCase(
    block,
    "fw.appVars",
    /var\(--app-/.test(floating) || /var\(--color-/.test(floating),
    "FloatingWindow uses --app-* or Design System --color-* CSS variables",
  );
  assertCase(
    block,
    "fw.noHex",
    !/#[0-9a-fA-F]{3,8}\b/.test(floating) &&
      !/\brgba?\s*\(/.test(floating),
    "FloatingWindow has no hex/rgb colors",
  );
}

/* -------------------------------------------------------------------------- */
/* workspaceChromeFreeze                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "workspaceChromeFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Workspace Chrome Freeze");
  assertCase(
    block,
    "doc.allowed",
    /header/i.test(body) &&
      /badge/i.test(body) &&
      /Forbidden/i.test(body) &&
      /geometry/i.test(body),
    "Workspace Chrome Freeze lists allowed/forbidden",
  );
  const floating = exists(FLOATING) ? read(FLOATING) : "";
  assertCase(
    block,
    "fw.geometryInline",
    /left:\s*model\.x/.test(floating) &&
      /width:\s*model\.width/.test(floating),
    "FloatingWindow geometry remains inline style",
  );
}

/* -------------------------------------------------------------------------- */
/* lovableIdentityFreeze                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "lovableIdentityFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Lovable Identity Freeze");
  assertCase(
    block,
    "doc.lovable",
    /UI_TOKENS/.test(body) &&
      /Never/i.test(body) &&
      /new tokens/i.test(body),
    "Lovable Identity Freeze documented",
  );
}

/* -------------------------------------------------------------------------- */
/* visualSystemConsistencyFreeze                                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "visualSystemConsistencyFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Visual System Consistency Freeze");
  assertCase(
    block,
    "doc.consistency",
    /same radius/i.test(body) &&
      /same spacing/i.test(body) &&
      /same typography/i.test(body) &&
      /one visual system/i.test(body),
    "Visual System Consistency Freeze documented",
  );
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";
  assertCase(
    block,
    "fw.indicatorShell",
    /INDICATOR_SHELL/.test(floating) &&
      /INDICATOR_STATUS_SHELL/.test(floating),
    "Shared INDICATOR_SHELL / STATUS_SHELL present",
  );
  assertCase(
    block,
    "fw.sharedRhythm",
    floating.includes("INDICATOR_SHELL") &&
      /focusBadge:[\s\S]*INDICATOR_SHELL/.test(floating) &&
      /clipboardBadge:[\s\S]*INDICATOR_SHELL/.test(floating) &&
      /paletteBadge:[\s\S]*INDICATOR_SHELL/.test(floating) &&
      /undoRedoBadge:[\s\S]*INDICATOR_SHELL/.test(floating),
    "Domain badges share INDICATOR_SHELL",
  );
}

/* -------------------------------------------------------------------------- */
/* chromeDensityFreeze                                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "chromeDensityFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Chrome Density Freeze");
  assertCase(
    block,
    "doc.density",
    /padding/i.test(body) &&
      /header height/i.test(body) &&
      /badge spacing/i.test(body) &&
      /Never alter layout/i.test(body),
    "Chrome Density Freeze documented",
  );
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";
  assertCase(
    block,
    "fw.headerDensity",
    /headerBase:[\s\S]*h-8/.test(floating) &&
      /UI_TOKENS\.spacing/.test(floating),
    "Header density uses h-8 and UI_TOKENS.spacing",
  );
}

/* -------------------------------------------------------------------------- */
/* diagnosticsFreeze                                                          */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "diagnosticsFreeze";
  assertCase(block, "overlay.exists", exists(OVERLAY), `${OVERLAY} exists`);
  assertCase(
    block,
    "index.exists",
    exists(DIAG_INDEX),
    `${DIAG_INDEX} exists`,
  );
  const overlay = exists(OVERLAY) ? stripComments(read(OVERLAY)) : "";
  assertCase(
    block,
    "no.dispatch",
    !/\.dispatch\s*\(/.test(overlay),
    "Overlay has no dispatch()",
  );
  assertCase(
    block,
    "no.mutateApis",
    !/\.clear\s*\(/.test(overlay) &&
      !/\.sync\s*\(/.test(overlay) &&
      !/executeUndo|executeRedo/.test(overlay) &&
      !/\.copy\s*\(/.test(overlay) &&
      !/\.paste\s*\(/.test(overlay) &&
      !/\.activate\s*\(/.test(overlay) &&
      !/\.focus\s*\(/.test(overlay) &&
      !/\.push\s*\(/.test(overlay) &&
      !/api\./.test(overlay),
    "Overlay has no mutate APIs",
  );
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Diagnostics Freeze");
  assertCase(
    block,
    "doc.queryOnly",
    /query-only/i.test(body) && /Never/i.test(body),
    "Diagnostics Freeze documented query-only",
  );
}

/* -------------------------------------------------------------------------- */
/* diagnosticsVisibilityFreeze                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "diagnosticsVisibilityFreeze";
  const overlay = exists(OVERLAY) ? read(OVERLAY) : "";
  const stripped = stripComments(overlay);
  assertCase(
    block,
    "env.gate",
    /NEXT_PUBLIC_WORKSPACE_DIAGNOSTICS/.test(overlay) &&
      /DIAGNOSTICS_ENABLED/.test(overlay) &&
      /===\s*"1"/.test(overlay),
    "Env gate NEXT_PUBLIC_WORKSPACE_DIAGNOSTICS === \"1\"",
  );
  assertCase(
    block,
    "default.off",
    /if\s*\(\s*!DIAGNOSTICS_ENABLED\s*\)/.test(stripped) &&
      /return\s+null/.test(stripped),
    "Overlay returns null when disabled",
  );
  assertCase(
    block,
    "no.hotkey",
    !/onKeyDown/.test(stripped) && !/addEventListener/.test(stripped),
    "No hotkey / global listeners",
  );
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Diagnostics Visibility Freeze");
  assertCase(
    block,
    "doc.visibility",
    /NEXT_PUBLIC_WORKSPACE_DIAGNOSTICS/.test(body) &&
      /No hotkeys/i.test(body),
    "Diagnostics Visibility Freeze documented",
  );
}

/* -------------------------------------------------------------------------- */
/* diagnosticsDataFreeze                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "diagnosticsDataFreeze";
  const overlay = exists(OVERLAY) ? stripComments(read(OVERLAY)) : "";
  assertCase(
    block,
    "imports.factory",
    /createInteractionDiagnosticsReport/.test(overlay),
    "Overlay imports createInteractionDiagnosticsReport",
  );
  assertCase(
    block,
    "calls.factory",
    /createInteractionDiagnosticsReport\s*\(/.test(overlay),
    "Overlay calls createInteractionDiagnosticsReport",
  );
  assertCase(
    block,
    "uses.windowState",
    /useWindowContext/.test(overlay),
    "Overlay uses WindowContext",
  );
  assertCase(
    block,
    "uses.undoOverlay",
    /getUndoRedoOverlay/.test(overlay),
    "Overlay observes UndoRedo overlay",
  );
  assertCase(
    block,
    "no.localReportBuilder",
    !/function\s+create\w*Report/.test(overlay) &&
      !/Object\.assign\s*\(\s*report/.test(overlay),
    "No local report builder",
  );
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Diagnostics Data Freeze");
  assertCase(
    block,
    "doc.data",
    /createInteractionDiagnosticsReport/.test(body) &&
      /Never create reports locally/i.test(body),
    "Diagnostics Data Freeze documented",
  );
}

/* -------------------------------------------------------------------------- */
/* diagnosticsReadabilityFreeze                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "diagnosticsReadabilityFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Diagnostics Readability Freeze");
  assertCase(
    block,
    "doc.readability",
    /labels/i.test(body) &&
      /values/i.test(body) &&
      /grouping/i.test(body) &&
      /JSON/i.test(body),
    "Diagnostics Readability Freeze documented",
  );
  const overlay = exists(OVERLAY) ? stripComments(read(OVERLAY)) : "";
  assertCase(
    block,
    "no.json",
    !/JSON\.stringify/.test(overlay) && !/<pre[\s>]/.test(overlay),
    "Overlay has no JSON.stringify / pre dumps",
  );
  assertCase(
    block,
    "has.labelValue",
    /DiagnosticsRow/.test(overlay) &&
      /DiagnosticsGroup/.test(overlay) &&
      /label/.test(overlay) &&
      /value/.test(overlay),
    "Overlay uses label/value/group structure",
  );
  assertCase(
    block,
    "no.complexTable",
    !/<table[\s>]/.test(overlay),
    "Overlay has no complex tables",
  );
}

/* -------------------------------------------------------------------------- */
/* diagnosticsLifetimeFreeze                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "diagnosticsLifetimeFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Diagnostics Lifetime Freeze");
  assertCase(
    block,
    "doc.lifetime",
    /DIAGNOSTICS_ENABLED/.test(body) &&
      /No persistence/i.test(body) &&
      /No history/i.test(body),
    "Diagnostics Lifetime Freeze documented",
  );
  const overlay = exists(OVERLAY) ? stripComments(read(OVERLAY)) : "";
  assertCase(
    block,
    "no.persistence",
    !/localStorage/.test(overlay) &&
      !/sessionStorage/.test(overlay) &&
      !/indexedDB/.test(overlay),
    "Overlay has no persistence APIs",
  );
}

/* -------------------------------------------------------------------------- */
/* polishDiagnosticsSeparationFreeze                                          */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "polishDiagnosticsSeparationFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Polish / Diagnostics Separation Freeze");
  assertCase(
    block,
    "doc.separation",
    /UI only/i.test(body) &&
      /Snapshots only/i.test(body) &&
      /Never communicate/i.test(body),
    "Polish / Diagnostics Separation documented",
  );
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";
  assertCase(
    block,
    "fw.noDiagnosticsImport",
    !/diagnostics/i.test(floating) &&
      !/WorkspaceDiagnosticsOverlay/.test(floating),
    "FloatingWindow does not import diagnostics",
  );
  const overlay = exists(OVERLAY) ? stripComments(read(OVERLAY)) : "";
  assertCase(
    block,
    "diag.noFloatingImport",
    !/FloatingWindow/.test(overlay) &&
      !/FLOATING_WINDOW_CHROME/.test(overlay),
    "Overlay does not import FloatingWindow chrome",
  );
}

/* -------------------------------------------------------------------------- */
/* visualHierarchyFreeze                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "visualHierarchyFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Visual Hierarchy Freeze");
  assertCase(
    block,
    "doc.cascade",
    /Workspace Active/i.test(body) &&
      /Focused/i.test(body) &&
      /Selected/i.test(body) &&
      /Hover/i.test(body) &&
      /Keyboard Navigation/i.test(body) &&
      /Discoverability/i.test(body) &&
      /additive/i.test(body),
    "Visual Hierarchy Freeze cascade documented",
  );
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";
  assertCase(
    block,
    "fw.cascadeOrder",
    /isActive[\s\S]*isFocused[\s\S]*isSelected[\s\S]*isHovered/.test(
      floating,
    ),
    "FloatingWindow cascade order preserved",
  );
}

/* -------------------------------------------------------------------------- */
/* animationFreeze                                                            */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "animationFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Animation Freeze");
  assertCase(
    block,
    "doc.animation",
    /opacity/i.test(body) &&
      /transform/i.test(body) &&
      /transition-all/i.test(body) &&
      /Forbidden/i.test(body),
    "Animation Freeze documented",
  );
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";
  assertCase(
    block,
    "fw.noTransitionAll",
    !/transition-all/.test(floating) &&
      !/UI_TOKENS\.transition\.all200/.test(floating),
    "FloatingWindow has no transition-all",
  );
  const overlay = exists(OVERLAY) ? stripComments(read(OVERLAY)) : "";
  assertCase(
    block,
    "overlay.noTransitionAll",
    !/transition-all/.test(overlay) &&
      !/UI_TOKENS\.transition\.all200/.test(overlay),
    "Overlay has no transition-all",
  );
}

/* -------------------------------------------------------------------------- */
/* providerComposition                                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "providerComposition";
  const host = exists(HOST) ? stripComments(read(HOST)) : "";
  assertCase(
    block,
    "host.mountsOverlay",
    /WorkspaceDiagnosticsOverlay/.test(host) &&
      /UndoRedoDomHost[\s\S]*WorkspaceDiagnosticsOverlay/.test(host),
    "Host mounts overlay under UndoRedoDomHost",
  );
  assertCase(
    block,
    "no.createContext",
    !/createContext\(/.test(host),
    "Host does not createContext",
  );
  assertCase(
    block,
    "no.newProvider",
    !/DiagnosticsProvider/.test(host) && !/createContext/.test(host),
    "No new Diagnostics Provider",
  );
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Provider Composition Freeze");
  assertCase(
    block,
    "doc.provider",
    /No new Provider/i.test(body) &&
      /UndoRedoDomHost/i.test(body),
    "Provider Composition Freeze documented",
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
    "doc.dep",
    /Polish never reads registries/i.test(body) &&
      /never mutate/i.test(body),
    "Dependency Rule documented",
  );
  const overlay = exists(OVERLAY) ? stripComments(read(OVERLAY)) : "";
  assertCase(
    block,
    "diag.queryOnlyHooks",
    /useFocus/.test(overlay) &&
      /useSelection/.test(overlay) &&
      /getState|createInteractionDiagnosticsReport/.test(overlay),
    "Diagnostics uses query hooks / report factory",
  );
}

/* -------------------------------------------------------------------------- */
/* authorities                                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "authorities";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Authorities");
  const required = [
    "WindowManager",
    "FocusRegistry",
    "SelectionRegistry",
    "HoverRegistry",
    "KeyboardNavigationRegistry",
    "ClipboardRegistry",
    "InteractionCommandDispatcher",
    "ThinHistoryAdapter",
    "createInteractionDiagnosticsReport",
    "FloatingWindow",
  ];
  for (const name of required) {
    assertCase(
      block,
      `auth.${name}`,
      body.includes(name),
      `Authority listed: ${name}`,
    );
  }
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
    exists(OVERLAY) && exists(DIAG_INDEX),
    "Diagnostics product surface files exist",
  );
  const overlay = exists(OVERLAY) ? stripComments(read(OVERLAY)) : "";
  const index = exists(DIAG_INDEX) ? stripComments(read(DIAG_INDEX)) : "";
  assertCase(
    block,
    "no.createContext.diag",
    !/createContext\(/.test(overlay) && !/createContext\(/.test(index),
    "Diagnostics module does not createContext",
  );
  assertCase(
    block,
    "historyUntouchedLogic",
    exists(`${HISTORY_DIR}/ThinHistoryAdapter.ts`) &&
      exists(`${HISTORY_DIR}/UndoRedoBridge.ts`),
    "History modules remain (not replaced)",
  );
  assertCase(
    block,
    "commandsUntouched",
    exists(`${COMMANDS_DIR}/InteractionCommandBridge.ts`),
    "Commands bridge remains",
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
    "one.visual.system",
    /one visual system/i.test(body),
    "VUO mentions one visual system",
  );
  assertCase(
    block,
    "modern.professional",
    /modern professional application/i.test(body) &&
      /independent widgets/i.test(body),
    "VUO mentions modern professional application vs widgets",
  );
}

/* -------------------------------------------------------------------------- */
/* seriesCompletionNote                                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "seriesCompletionNote";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Series Completion Note");
  assertCase(
    block,
    "doc.completion",
    /functional/i.test(body) &&
      /UX-9\.9/.test(body) &&
      /UX-9\.10/.test(body) &&
      /Documentation Freeze/i.test(body),
    "Series Completion Note points to 9.9 / 9.10",
  );
}

/* -------------------------------------------------------------------------- */
/* roadmapUpdated                                                             */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "roadmapUpdated";
  const roadmap = exists(ROADMAP) ? read(ROADMAP) : "";
  assertCase(
    block,
    "ux98.complete",
    /UX-9\.8\s*=\s*COMPLETE/.test(roadmap) ||
      /UX-9\.8.*COMPLETE/.test(roadmap),
    "UX-9.8 marked COMPLETE",
  );
  assertCase(
    block,
    "ux99.pending",
    /UX-9\.9.*PENDING/.test(roadmap) || /UX-9\.9\s*=\s*COMPLETE/.test(roadmap),
    "UX-9.9 PENDING or series-complete COMPLETE",
  );
  assertCase(
    block,
    "ux910.pending",
    /UX-9\.10.*PENDING/.test(roadmap) ||
      /UX-9\.10\s*=\s*COMPLETE/.test(roadmap),
    "UX-9.10 PENDING or series-complete COMPLETE",
  );
  assertCase(
    block,
    "next.ux99",
    /Next.*UX-9\.9/i.test(roadmap) ||
      /Next → UX-9\.9/.test(roadmap) ||
      /UX-9 RELEASE CERTIFIED/i.test(roadmap) ||
      /validate:ux-9\.10/.test(roadmap),
    "Next points to UX-9.9 or series RELEASE CERTIFIED",
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
    /"validate:ux-9\.8":\s*"npx tsx scripts\/validate-ux-9\.8\.ts"/.test(pkg),
    "validate:ux-9.8 script exact",
  );
  assertCase(
    block,
    "preserves.97",
    /"validate:ux-9\.7":\s*"npx tsx scripts\/validate-ux-9\.7\.ts"/.test(pkg),
    "validate:ux-9.7 preserved",
  );
}

/* -------------------------------------------------------------------------- */
/* productionIntegration                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "productionIntegration";
  const host = exists(HOST) ? stripComments(read(HOST)) : "";
  const floating = exists(FLOATING) ? stripComments(read(FLOATING)) : "";
  const overlay = exists(OVERLAY) ? stripComments(read(OVERLAY)) : "";
  assertCase(
    block,
    "host.importOverlay",
    /from\s+["']\.\/diagnostics["']/.test(host) ||
      /from\s+["']\.\/diagnostics\//.test(host),
    "Host imports diagnostics barrel",
  );
  assertCase(
    block,
    "host.jsxMount",
    /<WorkspaceDiagnosticsOverlay\s*\/>/.test(host),
    "Host JSX mounts WorkspaceDiagnosticsOverlay",
  );
  assertCase(
    block,
    "overlay.export",
    /export\s+function\s+WorkspaceDiagnosticsOverlay/.test(overlay),
    "Overlay exports WorkspaceDiagnosticsOverlay",
  );
  assertCase(
    block,
    "fw.polishMarkers",
    /INDICATOR_SHELL/.test(floating) &&
      (/UI_TOKENS\.transition\.colors200/.test(floating) ||
        /INTERACTION_MOTION/.test(floating)),
    "FloatingWindow polish markers present",
  );
  assertCase(
    block,
    "gate.constant",
    /DIAGNOSTICS_ENABLED/.test(overlay),
    "Diagnostics gate constant present",
  );
}

/* -------------------------------------------------------------------------- */
/* validatorPass                                                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "validatorPass";
  const failed = results.filter((r) => !r.pass);
  assertCase(
    block,
    "all.prior.pass",
    failed.length === 0,
    failed.length === 0
      ? "All prior cases passed"
      : `${failed.length} prior failure(s)`,
  );
}

/* -------------------------------------------------------------------------- */
/* Report                                                                     */
/* -------------------------------------------------------------------------- */

const failed = results.filter((r) => !r.pass);
const passed = results.filter((r) => r.pass);

console.log(`UX-9.8 validator: ${passed.length} passed · ${failed.length} failed`);
for (const r of results) {
  const mark = r.pass ? "PASS" : "FAIL";
  console.log(`  [${mark}] ${r.block} · ${r.id} — ${r.detail}`);
}

if (failed.length > 0) {
  process.exit(1);
}
