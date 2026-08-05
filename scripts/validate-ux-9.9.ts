/**
 * UX-9.9 — Documentation Freeze gate.
 *
 * Blocks:
 * documentationExists · documentationFreeze · validationScopeFreeze
 * evidenceReuseFreeze · architectureConsistencyFreeze · documentationFinalityFreeze
 * historicalValidatorPreservationFreeze · productivityCompletionFreeze
 * visibleUserOutcomeDocumented · roadmapUpdated · packageScript
 * noHistoricalMutation · validatorPass
 *
 * Architectural principles:
 * - Documentation Freeze only · No Functional Changes
 * - Validation Scope Freeze — certify docs / roadmap / package.json / evidence
 *   · NEVER re-audit src/** · Runtime · registries · providers · dispatcher
 *   · diagnostics · FloatingWindow
 * - Evidence Reuse Freeze — validate:ux-9.1 → validate:ux-9.8 ONLY
 * - never re-execute functional audits · never nest historical ux-9 validates
 * - Architecture Consistency Freeze — UX-9-architecture.md remains sole SSOT
 * - Documentation Finality Freeze — future edits → UX-9.10 / UX-10 only
 * - Historical Validator Preservation — 9.1–9.8 intact
 * - Productivity Completion Freeze — UX-9.8 closed all functional capabilities
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "documentationExists"
  | "documentationFreeze"
  | "validationScopeFreeze"
  | "evidenceReuseFreeze"
  | "architectureConsistencyFreeze"
  | "documentationFinalityFreeze"
  | "historicalValidatorPreservationFreeze"
  | "productivityCompletionFreeze"
  | "visibleUserOutcomeDocumented"
  | "roadmapUpdated"
  | "packageScript"
  | "noHistoricalMutation"
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

const DOC = "docs/UX/UX-9.9.md";
const ARCH = "docs/UX/UX-9-architecture.md";
const ROADMAP = "docs/UX/UX-9.0-roadmap.md";
const PACKAGE_JSON = "package.json";
const VALIDATOR_SELF = "scripts/validate-ux-9.9.ts";

const SERIES_DOCS = [
  ["UX-9.1", "docs/UX/UX-9.1.md", "Workspace Activation"],
  ["UX-9.2", "docs/UX/UX-9.2.md", "Focus + Selection"],
  ["UX-9.3", "docs/UX/UX-9.3.md", "Hover + Discoverability"],
  ["UX-9.4", "docs/UX/UX-9.4.md", "Keyboard Navigation"],
  ["UX-9.5", "docs/UX/UX-9.5.md", "Clipboard"],
  ["UX-9.6", "docs/UX/UX-9.6.md", "Command Palette"],
  ["UX-9.7", "docs/UX/UX-9.7.md", "Undo / Redo"],
  ["UX-9.8", "docs/UX/UX-9.8.md", "Workspace Polish + Diagnostics"],
] as const;

const HISTORICAL_VALIDATORS = [
  "scripts/validate-ux-9.1.ts",
  "scripts/validate-ux-9.2.ts",
  "scripts/validate-ux-9.3.ts",
  "scripts/validate-ux-9.4.ts",
  "scripts/validate-ux-9.5.ts",
  "scripts/validate-ux-9.6.ts",
  "scripts/validate-ux-9.7.ts",
  "scripts/validate-ux-9.8.ts",
] as const;

const HISTORICAL_SCRIPTS = [
  "validate:ux-9.1",
  "validate:ux-9.2",
  "validate:ux-9.3",
  "validate:ux-9.4",
  "validate:ux-9.5",
  "validate:ux-9.6",
  "validate:ux-9.7",
  "validate:ux-9.8",
] as const;

const REQUIRED_HEADINGS = [
  "Executive Summary",
  "Scope Fence",
  "Documentation Freeze",
  "Validation Scope Freeze",
  "Evidence Reuse Freeze",
  "Architecture Consistency Freeze",
  "Documentation Finality Freeze",
  "Historical Validator Preservation Freeze",
  "Productivity Completion Freeze",
  "Visible User Outcome",
  "Acceptance Criteria",
  "Protected Files",
  "Gate",
  "Next UX-9.10",
] as const;

const VUO_CAPABILITIES = [
  "Workspace Activation",
  "Focus",
  "Selection",
  "Hover",
  "Keyboard Navigation",
  "Clipboard",
  "Command Palette",
  "Undo / Redo",
  "Workspace Polish",
  "Diagnostics",
] as const;

/* -------------------------------------------------------------------------- */
/* documentationExists                                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "documentationExists";
  assertCase(block, "doc.exists", exists(DOC), `${DOC} exists`);
  const doc = exists(DOC) ? read(DOC) : "";
  assertCase(
    block,
    "doc.declaration",
    /UX-9\.9\s*=\s*Documentation Freeze/i.test(doc),
    "Declaration states UX-9.9 = Documentation Freeze",
  );
  assertCase(
    block,
    "doc.ssotRef",
    /UX-9-architecture\.md/.test(doc),
    "Doc references UX-9-architecture.md",
  );
  assertCase(
    block,
    "doc.roadmapRef",
    /UX-9\.0-roadmap\.md/.test(doc),
    "Doc references UX-9.0-roadmap.md",
  );
  assertCase(
    block,
    "doc.next910",
    /UX-9\.10/.test(doc) && /Release Certification/i.test(doc),
    "Doc points Next to UX-9.10 Release Certification",
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
/* documentationFreeze                                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "documentationFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Documentation Freeze");
  assertCase(
    block,
    "section",
    hasHeading(doc, "Documentation Freeze"),
    "Documentation Freeze section present",
  );
  assertCase(
    block,
    "completely.implemented",
    /completely implemented/i.test(doc),
    "Declares UX-9 completely implemented",
  );
  assertCase(
    block,
    "no.functional.microphases",
    /No functional microphases remain/i.test(doc) ||
      /no functional microphases remain/i.test(doc),
    "Declares no functional microphases remain",
  );
  for (const [label, path, title] of SERIES_DOCS) {
    assertCase(
      block,
      `series.doc.${label}`,
      exists(path),
      `${path} exists`,
    );
    assertCase(
      block,
      `series.mentioned.${label}`,
      new RegExp(label.replace(".", "\\.")).test(body) ||
        new RegExp(label.replace(".", "\\.")).test(doc),
      `UX-9.9.md documents ${label}`,
    );
    assertCase(
      block,
      `series.title.${label}`,
      body.includes(title) || doc.includes(title),
      `Series title documented: ${title}`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* validationScopeFreeze                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "validationScopeFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Validation Scope Freeze");
  const self = exists(VALIDATOR_SELF) ? read(VALIDATOR_SELF) : "";

  assertCase(
    block,
    "section",
    hasHeading(doc, "Validation Scope Freeze"),
    "Validation Scope Freeze section present",
  );
  assertCase(
    block,
    "docsOnly",
    /certifies ONLY/i.test(body) &&
      /documentation/i.test(body) &&
      /roadmap/i.test(body) &&
      /package\.json/i.test(body),
    "Declares gate certifies only documentation / roadmap / package.json",
  );
  assertCase(
    block,
    "historical.evidence",
    /historical evidence/i.test(body) || /evidence/i.test(body),
    "Declares historical evidence in scope",
  );
  assertCase(
    block,
    "never.reaudit",
    /NEVER re-audits|never re-audit/i.test(body),
    "Declares never re-audits functional surfaces",
  );
  assertCase(
    block,
    "surfaces",
    /src\/\*\*/.test(body) &&
      /Runtime/i.test(body) &&
      /registries/i.test(body) &&
      /providers/i.test(body) &&
      /dispatcher/i.test(body) &&
      /diagnostics/i.test(body) &&
      /FloatingWindow/i.test(body),
    "Lists surfaces never re-audited",
  );

  const spawnTok = ["spawn", "Sync"].join("");
  const execTok = ["exec", "Sync"].join("");
  const execFileTok = ["execFile", "Sync"].join("");
  const childTok = ["child", "_process"].join("");
  const nestedNpm = ["npm run ", "validate:", "ux-9."].join("");

  assertCase(
    block,
    "noNestedValidate",
    !self.includes(nestedNpm) &&
      !self.includes(spawnTok) &&
      !self.includes(execTok) &&
      !self.includes(execFileTok) &&
      !self.includes(childTok),
    "Validator does not nest or spawn historical validates",
  );
}

/* -------------------------------------------------------------------------- */
/* evidenceReuseFreeze                                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "evidenceReuseFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Evidence Reuse Freeze");
  const pkg = exists(PACKAGE_JSON) ? read(PACKAGE_JSON) : "";

  assertCase(
    block,
    "section",
    hasHeading(doc, "Evidence Reuse Freeze"),
    "Evidence Reuse Freeze section present",
  );
  assertCase(
    block,
    "range",
    /validate:ux-9\.1/.test(body) && /validate:ux-9\.8/.test(body),
    "Declares reuse validate:ux-9.1 → validate:ux-9.8",
  );
  assertCase(
    block,
    "never.reexecute",
    /Never re-executes functional audits|never re-execute/i.test(body),
    "Declares never re-executes functional audits",
  );

  for (const script of HISTORICAL_SCRIPTS) {
    const escaped = script.replace(".", "\\.");
    assertCase(
      block,
      `pkg.${script}`,
      new RegExp(
        `"${escaped}"\\s*:\\s*"npx tsx scripts\\/${escaped.replace("validate:", "validate-")}\\.ts"`,
      ).test(pkg),
      `package.json preserves ${script}`,
    );
  }

  for (const path of HISTORICAL_VALIDATORS) {
    assertCase(
      block,
      `evidence.${path.replace(/[\\/.]/g, "_")}`,
      exists(path),
      `Historical evidence exists: ${path}`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* architectureConsistencyFreeze                                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "architectureConsistencyFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Architecture Consistency Freeze");

  assertCase(
    block,
    "section",
    hasHeading(doc, "Architecture Consistency Freeze"),
    "Architecture Consistency Freeze section present",
  );
  assertCase(
    block,
    "onlySsot",
    /ONLY architecture SSOT|ONLY SSOT|sole SSOT|único SSOT/i.test(body),
    "Declares UX-9-architecture.md is the only SSOT",
  );
  assertCase(
    block,
    "noReplace",
    /does NOT replace|does not replace|not replaced/i.test(body),
    "Declares UX-9.9 does not replace the SSOT",
  );
  assertCase(
    block,
    "noNewArch",
    /NO new architecture|introduces NO new architecture/i.test(body),
    "Declares UX-9.9 introduces no new architecture",
  );
  assertCase(block, "ssot.exists", exists(ARCH), `${ARCH} exists`);
  assertCase(
    block,
    "ssot.cited",
    /UX-9-architecture\.md/.test(doc),
    "UX-9.9 cites architecture SSOT",
  );
}

/* -------------------------------------------------------------------------- */
/* documentationFinalityFreeze                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "documentationFinalityFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Documentation Finality Freeze");

  assertCase(
    block,
    "section",
    hasHeading(doc, "Documentation Finality Freeze"),
    "Documentation Finality Freeze section present",
  );
  assertCase(
    block,
    "frozen",
    /frozen/i.test(body),
    "Declares UX-9 documentation frozen",
  );
  assertCase(
    block,
    "future.ux910",
    /UX-9\.10/.test(body),
    "Future modifications point to UX-9.10",
  );
  assertCase(
    block,
    "future.ux10",
    /UX-10/.test(body),
    "Future modifications point to UX-10",
  );
}

/* -------------------------------------------------------------------------- */
/* historicalValidatorPreservationFreeze                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "historicalValidatorPreservationFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Historical Validator Preservation Freeze");

  assertCase(
    block,
    "section",
    hasHeading(doc, "Historical Validator Preservation Freeze"),
    "Historical Validator Preservation Freeze section present",
  );
  assertCase(
    block,
    "range",
    /validate-ux-9\.1/.test(body) && /validate-ux-9\.8/.test(body),
    "Documents validate-ux-9.1 → validate-ux-9.8",
  );
  assertCase(
    block,
    "never.modified",
    /Never modified/i.test(body),
    "Declares historical validators never modified",
  );
  assertCase(
    block,
    "never.rewritten",
    /Never rewritten/i.test(body),
    "Declares historical validators never rewritten",
  );

  for (const path of HISTORICAL_VALIDATORS) {
    assertCase(
      block,
      `intact.${path.replace(/[\\/.]/g, "_")}`,
      exists(path),
      `${path} exists (preserved)`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* productivityCompletionFreeze                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "productivityCompletionFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Productivity Completion Freeze");

  assertCase(
    block,
    "section",
    hasHeading(doc, "Productivity Completion Freeze"),
    "Productivity Completion Freeze section present",
  );
  assertCase(
    block,
    "ux98.completed",
    /UX-9\.8 completed all functional capabilities/i.test(body),
    "Declares UX-9.8 completed all functional capabilities",
  );
  assertCase(
    block,
    "ux99.no.func",
    /UX-9\.9 incorporates NO functionalities|incorporates NO functionalities/i.test(
      body,
    ),
    "Declares UX-9.9 incorporates no functionalities",
  );
  assertCase(
    block,
    "remaining.910",
    /UX-9\.10/.test(body) && /Release Certification/i.test(doc),
    "Points remaining work to UX-9.10 Release Certification",
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
    "section",
    hasHeading(doc, "Visible User Outcome"),
    "Visible User Outcome section present",
  );
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
    "certifies.only",
    /only certifies/i.test(body),
    "Declares UX-9.9 only certifies existing integration",
  );
  for (const cap of VUO_CAPABILITIES) {
    assertCase(
      block,
      `cap.${cap.replace(/[\s/]+/g, "_")}`,
      body.includes(cap),
      `Capability documented: ${cap}`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* roadmapUpdated                                                             */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "roadmapUpdated";
  const roadmap = exists(ROADMAP) ? read(ROADMAP) : "";

  assertCase(block, "exists", exists(ROADMAP), `${ROADMAP} exists`);
  assertCase(
    block,
    "architectureRef",
    /UX-9-architecture\.md/.test(roadmap),
    "Roadmap references UX-9-architecture.md",
  );
  assertCase(
    block,
    "ux99.complete",
    /UX-9\.9\s*=\s*COMPLETE/.test(roadmap),
    "Roadmap marks UX-9.9 COMPLETE",
  );
  assertCase(
    block,
    "table.complete",
    /UX-9\.9\s*\|\s*Documentation Freeze\s*\|\s*\*\*COMPLETE\*\*|UX-9\.9\s*\|\s*Documentation Freeze\s*\|\s*COMPLETE/i.test(
      roadmap,
    ),
    "Roadmap phase table marks UX-9.9 COMPLETE",
  );
  assertCase(
    block,
    "ux910.pending",
    /UX-9\.10\s*=\s*PENDING/.test(roadmap) ||
      /UX-9\.10\s*\|\s*Release Certification\s*\|\s*PENDING/i.test(roadmap),
    "UX-9.10 remains PENDING",
  );
  assertCase(
    block,
    "ux98.complete",
    /UX-9\.8\s*=\s*COMPLETE/.test(roadmap),
    "Roadmap keeps UX-9.8 COMPLETE",
  );
  assertCase(
    block,
    "next.ux910",
    /Next.*UX-9\.10/i.test(roadmap) || /Next → UX-9\.10/.test(roadmap),
    "Next points to UX-9.10",
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
    /"validate:ux-9\.9":\s*"npx tsx scripts\/validate-ux-9\.9\.ts"/.test(pkg),
    "validate:ux-9.9 script exact",
  );
  assertCase(
    block,
    "preserves.98",
    /"validate:ux-9\.8":\s*"npx tsx scripts\/validate-ux-9\.8\.ts"/.test(pkg),
    "validate:ux-9.8 preserved",
  );
  assertCase(
    block,
    "no.ux910.yet",
    !/"validate:ux-9\.10"/.test(pkg),
    "validate:ux-9.10 not added yet (PENDING)",
  );
}

/* -------------------------------------------------------------------------- */
/* noHistoricalMutation                                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noHistoricalMutation";
  const self = exists(VALIDATOR_SELF) ? read(VALIDATOR_SELF) : "";
  const doc = exists(DOC) ? read(DOC) : "";

  for (const path of HISTORICAL_VALIDATORS) {
    assertCase(
      block,
      `exists.${path.replace(/[\\/.]/g, "_")}`,
      exists(path),
      `${path} still exists`,
    );
  }

  assertCase(
    block,
    "arch.untouched.declared",
    /UX-9-architecture\.md/.test(doc) &&
      (/Never modify/i.test(doc) || /does NOT replace/i.test(doc)),
    "Doc declares architecture SSOT untouched / not replaced",
  );

  const nestedHist = ["npm run ", "validate:", "ux-9."].join("");
  assertCase(
    block,
    "noNest",
    !self.includes(nestedHist),
    "Does not nest historical ux-9 validate scripts",
  );

  assertCase(
    block,
    "self.only.new",
    exists(VALIDATOR_SELF) && exists(DOC),
    "UX-9.9 adds only its own doc + validator",
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

const blocks: BlockId[] = [
  "documentationExists",
  "documentationFreeze",
  "validationScopeFreeze",
  "evidenceReuseFreeze",
  "architectureConsistencyFreeze",
  "documentationFinalityFreeze",
  "historicalValidatorPreservationFreeze",
  "productivityCompletionFreeze",
  "visibleUserOutcomeDocumented",
  "roadmapUpdated",
  "packageScript",
  "noHistoricalMutation",
  "validatorPass",
];

console.log("UX-9.9 — Documentation Freeze");
console.log("==============================");

for (const block of blocks) {
  const cases = results.filter((r) => r.block === block);
  const ok = cases.every((c) => c.pass);
  const mark = ok ? "PASS" : "FAIL";
  console.log(
    `${mark}  ${block}  (${cases.filter((c) => c.pass).length}/${cases.length})`,
  );
  if (!ok) {
    for (const c of cases.filter((x) => !x.pass)) {
      console.log(`      ✗ ${c.id}: ${c.detail}`);
    }
  }
}

console.log("------------------------------");
console.log(`Cases: ${passed.length}/${results.length} passed`);

if (failed.length > 0) {
  console.log("RESULT: FAIL");
  process.exit(1);
}

console.log("RESULT: PASS");
