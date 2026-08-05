/**
 * UX-9.10 — Release Certification gate.
 *
 * Blocks (exact order):
 * documentationExists · releaseCertificationDeclared · seriesSummary
 * certifiedArchitecture · seriesIdentityFreeze · productCompositionCertification
 * visualSystemCertification · evidenceReuse · validationScopeFreeze
 * releaseFreeze · architectureConsistency · certificationFinalityFreeze
 * historicalValidatorPreservationFreeze · historicalCertification
 * seriesCompletion · productivityFinality · roadmapUpdated · packageScript
 * historicalValidatorsIntact · validatorPass
 *
 * Architectural principles:
 * - Release Certification only · Documentation + validator
 * - Evidence Reuse Only · no nested validate:ux-9.*
 * - Validation Scope Freeze — NEVER re-audit src/** · Runtime · registries ·
 *   providers · dispatcher · diagnostics · FloatingWindow
 * - Series Identity Freeze · ProductCompositionHost Certification
 * - Visual System Certification · Productivity Finality
 * - Certification Finality Freeze · Historical Validator Preservation Freeze
 * - Architecture Consistency — UX-9-architecture.md remains sole SSOT
 * - Documentary only · never inspects src/**
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "documentationExists"
  | "releaseCertificationDeclared"
  | "seriesSummary"
  | "certifiedArchitecture"
  | "seriesIdentityFreeze"
  | "productCompositionCertification"
  | "visualSystemCertification"
  | "evidenceReuse"
  | "validationScopeFreeze"
  | "releaseFreeze"
  | "architectureConsistency"
  | "certificationFinalityFreeze"
  | "historicalValidatorPreservationFreeze"
  | "historicalCertification"
  | "seriesCompletion"
  | "productivityFinality"
  | "roadmapUpdated"
  | "packageScript"
  | "historicalValidatorsIntact"
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

const DOC = "docs/UX/UX-9.10.md";
const ARCH = "docs/UX/UX-9-architecture.md";
const ROADMAP = "docs/UX/UX-9.0-roadmap.md";
const PACKAGE_JSON = "package.json";
const VALIDATOR_SELF = "scripts/validate-ux-9.10.ts";

const SERIES_PHASES = [
  ["UX-9.1", "Workspace Activation"],
  ["UX-9.2", "Focus + Selection Visual"],
  ["UX-9.3", "Hover + Discoverability"],
  ["UX-9.4", "Keyboard Navigation"],
  ["UX-9.5", "Clipboard Integration"],
  ["UX-9.6", "Command Palette + Interaction Commands"],
  ["UX-9.7", "Undo / Redo Integration"],
  ["UX-9.8", "Workspace Polish + Diagnostics"],
  ["UX-9.9", "Documentation Freeze"],
] as const;

const SERIES_DOCS = [
  "docs/UX/UX-9.1.md",
  "docs/UX/UX-9.2.md",
  "docs/UX/UX-9.3.md",
  "docs/UX/UX-9.4.md",
  "docs/UX/UX-9.5.md",
  "docs/UX/UX-9.6.md",
  "docs/UX/UX-9.7.md",
  "docs/UX/UX-9.8.md",
  "docs/UX/UX-9.9.md",
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
  "scripts/validate-ux-9.9.ts",
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
  "validate:ux-9.9",
] as const;

const REQUIRED_SECTIONS = [
  "Executive Summary",
  "Scope Fence",
  "In Scope",
  "Out of Scope",
  "Protected Files",
  "Series Summary",
  "Certified Architecture",
  "Series Identity Freeze",
  "ProductCompositionHost Certification",
  "Visual System Certification",
  "Evidence Reuse",
  "Validation Scope Freeze",
  "Release Freeze",
  "Architecture Consistency",
  "Certification Finality Freeze",
  "Historical Validator Preservation Freeze",
  "Historical Certification",
  "Series Completion",
  "Productivity Finality",
  "Acceptance Criteria",
  "Gate",
  "Next Series",
] as const;

const ARCH_TOKENS = [
  "ProductCompositionHost",
  "FloatingWindow chrome",
  "Focus integration",
  "Selection integration",
  "Hover integration",
  "Keyboard integration",
  "Clipboard integration",
  "Command Palette integration",
  "Undo / Redo integration",
  "Workspace Diagnostics Overlay",
  "Provider composition",
  "Authorities",
  "Dependency rules",
  "Folder layout",
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
    /UX-9\.10\s*=\s*Release Certification/i.test(doc),
    "Declaration states UX-9.10 = Release Certification",
  );
  assertCase(
    block,
    "doc.scope",
    /documentation\s*\+\s*validator only|SCOPE\s*=\s*documentation/i.test(doc),
    "Declaration states Scope = documentation + validator only",
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
    "doc.nextUx10",
    /Next\s*=\s*UX-10|Next Series\s*=\s*UX-10|Next Series\s*→\s*UX-10|Next:\s*UX-10/i.test(
      doc,
    ),
    "Doc points Next to UX-10",
  );

  for (const section of REQUIRED_SECTIONS) {
    assertCase(
      block,
      `doc.section.${section.replace(/\s+/g, "_")}`,
      hasHeading(doc, section),
      `Required section: ${section}`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* releaseCertificationDeclared                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "releaseCertificationDeclared";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Executive Summary");

  assertCase(
    block,
    "release.declared",
    /UX-9 RELEASE CERTIFIED/.test(doc),
    "Declares UX-9 RELEASE CERTIFIED",
  );
  assertCase(
    block,
    "release.closed",
    /Series CLOSED|CLOSED/.test(body) || /Series CLOSED/.test(doc),
    "Declares Series CLOSED",
  );
  assertCase(
    block,
    "release.productivityCertified",
    /Productivity Layer certified/i.test(doc),
    "Declares Productivity Layer certified",
  );
  assertCase(
    block,
    "release.infraFrozen",
    /Infrastructure frozen/i.test(doc),
    "Declares Infrastructure frozen",
  );
  assertCase(
    block,
    "release.nextUx10",
    /Next Series\s*→\s*UX-10|Next Series\s*=\s*UX-10|Ready for UX-10/i.test(
      doc,
    ),
    "Declares Next Series → UX-10",
  );
}

/* -------------------------------------------------------------------------- */
/* seriesSummary                                                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "seriesSummary";
  const doc = exists(DOC) ? read(DOC) : "";

  assertCase(
    block,
    "series.section",
    hasHeading(doc, "Series Summary"),
    "Series Summary section present",
  );

  for (const [label, title] of SERIES_PHASES) {
    assertCase(
      block,
      `series.phase.${label.replace(".", "_")}`,
      new RegExp(label.replace(".", "\\.")).test(doc) &&
        new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(
          doc,
        ),
      `Series Summary documents ${label} ${title}`,
    );
  }

  for (const path of SERIES_DOCS) {
    assertCase(
      block,
      `series.doc.${path.split("/").pop()?.replace(/\./g, "_")}`,
      exists(path),
      `${path} exists`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* certifiedArchitecture                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "certifiedArchitecture";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Certified Architecture");

  assertCase(
    block,
    "arch.section",
    hasHeading(doc, "Certified Architecture"),
    "Certified Architecture section present",
  );

  for (const token of ARCH_TOKENS) {
    assertCase(
      block,
      `arch.${token.replace(/[\s/]+/g, "_")}`,
      body.includes(token) || new RegExp(token, "i").test(body),
      `Certified Architecture documents ${token}`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* seriesIdentityFreeze                                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "seriesIdentityFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Series Identity Freeze");

  assertCase(
    block,
    "sif.section",
    hasHeading(doc, "Series Identity Freeze"),
    "Series Identity Freeze section present",
  );
  assertCase(
    block,
    "sif.productivityLayer",
    /UX-9\s*=\s*Productivity Layer|Productivity Layer/.test(body) &&
      /official identity|Official name/i.test(body),
    "Declares UX-9 = Productivity Layer (official identity)",
  );
  assertCase(
    block,
    "sif.visualIntegration",
    /Visual Integration/i.test(body) &&
      /implementation strategy/i.test(body),
    "Declares Visual Integration = implementation strategy only",
  );
  assertCase(
    block,
    "sif.noRedefine",
    /does not redefine|does NOT redefine/i.test(body),
    "Declares UX-9.10 does not redefine the series identity",
  );
}

/* -------------------------------------------------------------------------- */
/* productCompositionCertification                                            */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "productCompositionCertification";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "ProductCompositionHost Certification");
  const self = exists(VALIDATOR_SELF) ? read(VALIDATOR_SELF) : "";

  assertCase(
    block,
    "pch.section",
    hasHeading(doc, "ProductCompositionHost Certification"),
    "ProductCompositionHost Certification section present",
  );
  assertCase(
    block,
    "pch.host",
    /ProductCompositionHost/.test(body),
    "Certifies ProductCompositionHost",
  );
  assertCase(
    block,
    "pch.providerComposition",
    /Provider composition/i.test(body),
    "Certifies Provider composition",
  );
  assertCase(
    block,
    "pch.workspaceTree",
    /Workspace composition tree/i.test(body),
    "Certifies Workspace composition tree",
  );
  assertCase(
    block,
    "pch.documentaryOnly",
    /Documentary certification only|documentary only|never.*inspects src/i.test(
      body,
    ),
    "Declares documentary certification only",
  );
  const readSrcDq = ["read(", '"src/'].join("");
  const readSrcSq = ["read(", "'src/"].join("");
  const joinSrc = ["join(repoRoot,", " \"src/"].join("");
  const joinSrcSq = ["join(repoRoot,", " 'src/"].join("");
  assertCase(
    block,
    "pch.noSrcRead",
    !self.includes(readSrcDq) &&
      !self.includes(readSrcSq) &&
      !self.includes(joinSrc) &&
      !self.includes(joinSrcSq),
    "Validator does not inspect src/** for this certification",
  );
}

/* -------------------------------------------------------------------------- */
/* visualSystemCertification                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "visualSystemCertification";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Visual System Certification");

  assertCase(
    block,
    "vsc.section",
    hasHeading(doc, "Visual System Certification"),
    "Visual System Certification section present",
  );

  const tokens = [
    ["Visual System", /Visual System/i],
    ["Chrome consistency", /Chrome consistency/i],
    ["Density", /Density/i],
    ["Visual hierarchy", /Visual hierarchy|Hierarchy/i],
    [
      "Lovable-inspired visual language",
      /Lovable-inspired visual language/i,
    ],
  ] as const;

  for (const [label, re] of tokens) {
    assertCase(
      block,
      `vsc.${label.replace(/[\s-]+/g, "_")}`,
      re.test(body),
      `Certifies ${label}`,
    );
  }

  assertCase(
    block,
    "vsc.documentary",
    /Pure documentary|documentary certification|CERTIFIED/i.test(body),
    "Declares documentary / CERTIFIED visual system",
  );
}

/* -------------------------------------------------------------------------- */
/* evidenceReuse                                                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "evidenceReuse";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Evidence Reuse");
  const pkg = exists(PACKAGE_JSON) ? read(PACKAGE_JSON) : "";

  assertCase(
    block,
    "er.section",
    hasHeading(doc, "Evidence Reuse"),
    "Evidence Reuse section present",
  );
  assertCase(
    block,
    "er.validate91",
    /validate:ux-9\.1/.test(body),
    "Declares reuse of validate:ux-9.1",
  );
  assertCase(
    block,
    "er.validate99",
    /validate:ux-9\.9/.test(body),
    "Declares reuse of validate:ux-9.9",
  );
  assertCase(
    block,
    "er.noFunctionalReaudit",
    /No functional re-audit|no functional re-audit/i.test(body),
    "Declares No functional re-audit",
  );
  assertCase(
    block,
    "er.noNested",
    /No nested validators|no nested validators/i.test(body),
    "Declares No nested validators",
  );

  for (const script of HISTORICAL_SCRIPTS) {
    const escaped = script.replace(".", "\\.");
    assertCase(
      block,
      `er.pkg.${script}`,
      new RegExp(
        `"${escaped}"\\s*:\\s*"npx tsx scripts\\/${escaped.replace("validate:", "validate-")}\\.ts"`,
      ).test(pkg),
      `package.json preserves ${script}`,
    );
  }

  for (const path of HISTORICAL_VALIDATORS) {
    assertCase(
      block,
      `er.evidence.${path.replace(/[\\/.]/g, "_")}`,
      exists(path),
      `Historical evidence exists: ${path}`,
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
    "vsf.section",
    hasHeading(doc, "Validation Scope Freeze"),
    "Validation Scope Freeze section present",
  );
  assertCase(
    block,
    "vsf.docsOnly",
    /certifies ONLY/i.test(body) &&
      /documentation/i.test(body) &&
      /roadmap/i.test(body) &&
      /package\.json/i.test(body),
    "Declares gate certifies only documentation / roadmap / package.json",
  );
  assertCase(
    block,
    "vsf.historicalEvidence",
    /historical evidence/i.test(body),
    "Declares historical evidence in scope",
  );
  assertCase(
    block,
    "vsf.neverSurfaces",
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
    "vsf.noNestedValidate",
    !self.includes(nestedNpm) &&
      !self.includes(spawnTok) &&
      !self.includes(execTok) &&
      !self.includes(execFileTok) &&
      !self.includes(childTok),
    "Validator does not nest or spawn historical validates",
  );
}

/* -------------------------------------------------------------------------- */
/* releaseFreeze                                                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "releaseFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Release Freeze");

  assertCase(
    block,
    "rf.section",
    hasHeading(doc, "Release Freeze"),
    "Release Freeze section present",
  );
  assertCase(
    block,
    "rf.closed",
    /UX-9 CLOSED|serie queda cerrada|UX-9.*congelada/i.test(body),
    "Declares UX-9 CLOSED",
  );
  assertCase(
    block,
    "rf.noFurther",
    /No new UX-9 microphases|no further UX-9 microphases|no se aceptan nuevas microfases UX-9/i.test(
      body,
    ),
    "Declares no new UX-9 microphases",
  );
  assertCase(
    block,
    "rf.evolutionUx10",
    /continues exclusively in UX-10|continúa exclusivamente en UX-10|continues in UX-10/i.test(
      body,
    ),
    "Declares future evolution continues exclusively in UX-10",
  );
}

/* -------------------------------------------------------------------------- */
/* architectureConsistency                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "architectureConsistency";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Architecture Consistency");

  assertCase(
    block,
    "ac.section",
    hasHeading(doc, "Architecture Consistency"),
    "Architecture Consistency section present",
  );
  assertCase(
    block,
    "ac.onlySsot",
    /ONLY architecture SSOT|ONLY SSOT|sole SSOT|único SSOT/i.test(body),
    "Declares UX-9-architecture.md is the only / sole SSOT",
  );
  assertCase(
    block,
    "ac.noNewRules",
    /introduces\s+NO\s+architectural rules|NO architectural rules/i.test(body),
    "Declares UX-9.10 introduces NO architectural rules",
  );
  assertCase(
    block,
    "ac.noReplace",
    /does NOT replace|does not replace|not replaced/i.test(body),
    "Declares UX-9.10 does not replace the SSOT",
  );
  assertCase(block, "ac.ssotExists", exists(ARCH), `${ARCH} exists`);
  assertCase(
    block,
    "ac.ssotCited",
    /UX-9-architecture\.md/.test(doc),
    "UX-9.10 cites architecture SSOT",
  );
}

/* -------------------------------------------------------------------------- */
/* certificationFinalityFreeze                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "certificationFinalityFreeze";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Certification Finality Freeze");

  assertCase(
    block,
    "cff.section",
    hasHeading(doc, "Certification Finality Freeze"),
    "Certification Finality Freeze section present",
  );
  assertCase(
    block,
    "cff.final",
    /is final|final and irreversible/i.test(body),
    "Declares RELEASE CERTIFIED is final / irreversible",
  );
  assertCase(
    block,
    "cff.no911",
    /no UX-9\.11|No UX-9\.11/i.test(body),
    "Declares no UX-9.11",
  );
  assertCase(
    block,
    "cff.noRecert",
    /no.*UX-9 recertification|no UX-9 recertification/i.test(body),
    "Declares no UX-9 recertification",
  );
  assertCase(
    block,
    "cff.futureUx10",
    /Future work belongs ONLY to UX-10|belongs ONLY to UX-10/i.test(body),
    "Declares future work belongs ONLY to UX-10+",
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
    "hvpf.section",
    hasHeading(doc, "Historical Validator Preservation Freeze"),
    "Historical Validator Preservation Freeze section present",
  );
  assertCase(
    block,
    "hvpf.range",
    /validate-ux-9\.1/.test(body) && /validate-ux-9\.9/.test(body),
    "Documents validate-ux-9.1 → validate-ux-9.9",
  );
  assertCase(
    block,
    "hvpf.unchanged",
    /remain unchanged historical evidence|unchanged historical evidence/i.test(
      body,
    ),
    "Declares historical validators remain unchanged evidence",
  );
  assertCase(
    block,
    "hvpf.reuses",
    /reuses/i.test(body) && /never rewrites/i.test(body),
    "Declares validate:ux-9.10 reuses but never rewrites",
  );
  assertCase(
    block,
    "hvpf.noModify",
    /does not modify/i.test(body),
    "Declares does not modify historical validators",
  );
  assertCase(
    block,
    "hvpf.noReplace",
    /does not replace/i.test(body),
    "Declares does not replace historical validators",
  );
  assertCase(
    block,
    "hvpf.noMeaning",
    /does not change their meaning|never.*change their meaning/i.test(body),
    "Declares does not change their meaning",
  );
}

/* -------------------------------------------------------------------------- */
/* historicalCertification                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "historicalCertification";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Historical Certification");

  assertCase(
    block,
    "hc.section",
    hasHeading(doc, "Historical Certification"),
    "Historical Certification section present",
  );
  assertCase(
    block,
    "hc.range",
    /UX-9\.1\s*→\s*UX-9\.9|UX-9\.1\s*-\s*UX-9\.9|UX-9\.1[\s\S]*UX-9\.9/i.test(
      body,
    ),
    "Declares UX-9.1 → UX-9.9 construction history",
  );
  assertCase(
    block,
    "hc.official",
    /official certified construction history|official.*construction history/i.test(
      body,
    ),
    "Declares official certified construction history",
  );
}

/* -------------------------------------------------------------------------- */
/* seriesCompletion                                                           */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "seriesCompletion";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Series Completion");

  assertCase(
    block,
    "sc.section",
    hasHeading(doc, "Series Completion"),
    "Series Completion section present",
  );
  assertCase(
    block,
    "sc.ux98",
    /UX-9\.8 completed the functional implementation/i.test(body),
    "Declares UX-9.8 completed the functional implementation",
  );
  assertCase(
    block,
    "sc.ux99",
    /UX-9\.9 froze documentation/i.test(body),
    "Declares UX-9.9 froze documentation",
  );
  assertCase(
    block,
    "sc.ux910",
    /UX-9\.10 certifies the series/i.test(body),
    "Declares UX-9.10 certifies the series",
  );
}

/* -------------------------------------------------------------------------- */
/* productivityFinality                                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "productivityFinality";
  const doc = exists(DOC) ? read(DOC) : "";
  const body = sectionBody(doc, "Productivity Finality");

  assertCase(
    block,
    "pf.section",
    hasHeading(doc, "Productivity Finality"),
    "Productivity Finality section present",
  );
  assertCase(
    block,
    "pf.everyCapability",
    /UX-9\.8 completed every functional Productivity capability/i.test(body),
    "Declares UX-9.8 completed every functional Productivity capability",
  );
  assertCase(
    block,
    "pf.docsFrozen",
    /UX-9\.9 froze documentation/i.test(body),
    "Declares UX-9.9 froze documentation",
  );
  assertCase(
    block,
    "pf.certifies",
    /UX-9\.10 certifies the series/i.test(body),
    "Declares UX-9.10 certifies the series",
  );
  assertCase(
    block,
    "pf.noFurther",
    /No further Productivity functionality belongs to UX-9/i.test(body),
    "Declares No further Productivity functionality belongs to UX-9",
  );
}

/* -------------------------------------------------------------------------- */
/* roadmapUpdated                                                             */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "roadmapUpdated";
  const roadmap = exists(ROADMAP) ? read(ROADMAP) : "";

  assertCase(block, "roadmap.exists", exists(ROADMAP), `${ROADMAP} exists`);
  assertCase(
    block,
    "roadmap.releaseCertified",
    /UX-9\s+RELEASE\s+CERTIFIED/.test(roadmap) ||
      /UX-9\s*=\s*RELEASE CERTIFIED/.test(roadmap),
    "Roadmap declares UX-9 RELEASE CERTIFIED",
  );
  assertCase(
    block,
    "roadmap.closed",
    (/Status:\s*CLOSED/.test(roadmap) || /UX-9\s*=\s*CLOSED/.test(roadmap)) &&
      /RELEASE CERTIFIED/.test(roadmap),
    "Roadmap marks UX-9 CLOSED",
  );
  assertCase(
    block,
    "roadmap.ux910Complete",
    /UX-9\.10\s*=\s*COMPLETE/i.test(roadmap),
    "Roadmap marks UX-9.10 COMPLETE",
  );
  assertCase(
    block,
    "roadmap.tableComplete",
    /UX-9\.10\s*\|\s*Release Certification\s*\|\s*\*\*COMPLETE\*\*|UX-9\.10\s*\|\s*Release Certification\s*\|\s*COMPLETE/i.test(
      roadmap,
    ),
    "Roadmap phase table marks UX-9.10 COMPLETE",
  );
  assertCase(
    block,
    "roadmap.historicalGate",
    /validate:ux-9\.10/.test(roadmap) && /UX-9\.10\.md/.test(roadmap),
    "Roadmap lists historical gate validate:ux-9.10",
  );
  assertCase(
    block,
    "roadmap.nextUx10",
    /Next Series\s*=\s*UX-10|Next Series\s*→\s*UX-10|Next Series:\s*UX-10/i.test(
      roadmap,
    ),
    "Roadmap Next Series → UX-10",
  );
  assertCase(
    block,
    "roadmap.architectureRef",
    /UX-9-architecture\.md/.test(roadmap),
    "Roadmap keeps Architecture SSOT reference",
  );
  assertCase(
    block,
    "roadmap.seriesClosed",
    /Series [Cc]losed|Series Closure|Series Completion|Certification Finality/i.test(
      roadmap,
    ),
    "Roadmap declares Series Closed / Certification Finality",
  );
  assertCase(
    block,
    "roadmap.identity",
    /Productivity Layer/.test(roadmap),
    "Roadmap preserves Series Identity Productivity Layer",
  );
  assertCase(
    block,
    "roadmap.ux99Complete",
    /UX-9\.9\s*=\s*COMPLETE/i.test(roadmap),
    "Roadmap keeps UX-9.9 COMPLETE",
  );
  assertCase(
    block,
    "roadmap.governance",
    /validate:ux-9\.10/.test(roadmap) &&
      (/Active gate|Final series gate|series final/i.test(roadmap) ||
        /RELEASE CERTIFIED/.test(roadmap)),
    "Validator governance points to validate:ux-9.10",
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
    "pkg.validate910",
    /"validate:ux-9\.10"\s*:\s*"npx tsx scripts\/validate-ux-9\.10\.ts"/.test(
      pkg,
    ),
    'package.json has "validate:ux-9.10": "npx tsx scripts/validate-ux-9.10.ts"',
  );
  assertCase(
    block,
    "pkg.preserves99",
    /"validate:ux-9\.9"\s*:\s*"npx tsx scripts\/validate-ux-9\.9\.ts"/.test(
      pkg,
    ),
    "validate:ux-9.9 preserved",
  );
}

/* -------------------------------------------------------------------------- */
/* historicalValidatorsIntact                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "historicalValidatorsIntact";
  const self = exists(VALIDATOR_SELF) ? read(VALIDATOR_SELF) : "";

  for (const path of HISTORICAL_VALIDATORS) {
    assertCase(
      block,
      `histVal.${path.replace(/[\\/.]/g, "_")}`,
      exists(path),
      `${path} exists`,
    );
  }

  const nestedHist = ["npm run ", "validate:", "ux-9."].join("");
  assertCase(
    block,
    "histVal.noNest",
    !self.includes(nestedHist),
    "Does not nest historical ux-9 validate scripts",
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
  "releaseCertificationDeclared",
  "seriesSummary",
  "certifiedArchitecture",
  "seriesIdentityFreeze",
  "productCompositionCertification",
  "visualSystemCertification",
  "evidenceReuse",
  "validationScopeFreeze",
  "releaseFreeze",
  "architectureConsistency",
  "certificationFinalityFreeze",
  "historicalValidatorPreservationFreeze",
  "historicalCertification",
  "seriesCompletion",
  "productivityFinality",
  "roadmapUpdated",
  "packageScript",
  "historicalValidatorsIntact",
  "validatorPass",
];

console.log("UX-9.10 — Release Certification");
console.log("================================");

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
console.log("UX-9 RELEASE CERTIFIED");
console.log("Series Closed");
console.log("Next: UX-10");
