/**
 * UX-8.10 — Release Certification gate.
 *
 * Blocks:
 * documentationExists · releaseCertificationDeclared · seriesSummary
 * certifiedArchitecture · evidenceReuse · validationScopeFreeze
 * releaseFreeze · architectureConsistency · historicalCertification
 * certificationFinalityFreeze · historicalValidatorPreservationFreeze
 * roadmapUpdated · packageScript · historicalValidatorsIntact
 * intactSurfaces
 *
 * Architectural principles:
 * - Release Certification only · Documentation + validator
 * - Evidence Reuse Only · no nested validate:ux-8.* (Windows hang)
 * - Validation Scope Freeze — NEVER re-audit src/ui · Runtime · registries ·
 *   dispatcher · diagnostics
 * - Certification Finality Freeze · Historical Validator Preservation Freeze
 * - Architecture Consistency — UX-8-architecture.md remains sole SSOT
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "documentationExists"
  | "releaseCertificationDeclared"
  | "seriesSummary"
  | "certifiedArchitecture"
  | "evidenceReuse"
  | "validationScopeFreeze"
  | "releaseFreeze"
  | "architectureConsistency"
  | "historicalCertification"
  | "certificationFinalityFreeze"
  | "historicalValidatorPreservationFreeze"
  | "roadmapUpdated"
  | "packageScript"
  | "historicalValidatorsIntact"
  | "intactSurfaces";

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

function hasHeading(doc: string, title: string): boolean {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^#{1,3}\\s+${escaped}\\s*$`, "m").test(doc);
}

const ARCH = "docs/UX/UX-8-architecture.md";
const ROADMAP = "docs/UX/UX-8.0-roadmap.md";
const DOC_8_10 = "docs/UX/UX-8.10.md";
const PACKAGE_JSON = "package.json";
const VALIDATOR_SELF = "scripts/validate-ux-8.10.ts";
const UI_INDEX = "src/ui/index.ts";
const WINDOW_REGISTRY = "src/components/windows/WindowRegistry.ts";
const PAGE_TSX = "src/app/page.tsx";
const APP_SHELL = "src/components/app-shell/AppShell.tsx";

const SERIES_PHASES = [
  ["UX-8.1", "Focus"],
  ["UX-8.2", "Selection"],
  ["UX-8.3", "Multi Selection"],
  ["UX-8.4", "Hover"],
  ["UX-8.5", "Keyboard Navigation"],
  ["UX-8.6", "Clipboard"],
  ["UX-8.7", "Interaction Commands"],
  ["UX-8.8", "Interaction Diagnostics"],
  ["UX-8.9", "Documentation Freeze"],
] as const;

const SERIES_DOCS = [
  "docs/UX/UX-8.1.md",
  "docs/UX/UX-8.2.md",
  "docs/UX/UX-8.3.md",
  "docs/UX/UX-8.4.md",
  "docs/UX/UX-8.5.md",
  "docs/UX/UX-8.6.md",
  "docs/UX/UX-8.7.md",
  "docs/UX/UX-8.8.md",
  "docs/UX/UX-8.9.md",
] as const;

const FROZEN_DIRS = [
  "src/ui/focus",
  "src/ui/selection",
  "src/ui/hover",
  "src/ui/keyboard-nav",
  "src/ui/clipboard",
  "src/ui/interaction-commands",
  "src/ui/interaction-diagnostics",
] as const;

const REQUIRED_SECTIONS = [
  "Executive Summary",
  "Series Summary",
  "Certified Architecture",
  "Evidence Reuse",
  "Validation Scope Freeze",
  "Release Freeze",
  "Architecture Consistency",
  "Historical Certification",
  "Certification Finality Freeze",
  "Historical Validator Preservation Freeze",
  "Acceptance Criteria",
  "Gate",
  "Next Series",
  "In Scope",
  "Out of Scope",
  "Protected Files",
] as const;

const HISTORICAL_VALIDATORS = [
  "scripts/validate-ux-8.1.ts",
  "scripts/validate-ux-8.2.ts",
  "scripts/validate-ux-8.3.ts",
  "scripts/validate-ux-8.4.ts",
  "scripts/validate-ux-8.5.ts",
  "scripts/validate-ux-8.6.ts",
  "scripts/validate-ux-8.7.ts",
  "scripts/validate-ux-8.8.ts",
  "scripts/validate-ux-8.9.ts",
] as const;

const PRODUCT_MOUNT_TOKENS = [
  /from\s+["']@\/ui\/focus/,
  /from\s+["']@\/ui\/selection/,
  /from\s+["']@\/ui\/hover/,
  /from\s+["']@\/ui\/keyboard-nav/,
  /from\s+["']@\/ui\/clipboard/,
  /from\s+["']@\/ui\/interaction-commands/,
  /from\s+["']@\/ui\/interaction-diagnostics/,
  /FocusProvider/,
  /SelectionProvider/,
  /HoverProvider/,
  /KeyboardNavigationProvider/,
  /ClipboardProvider/,
  /InteractionCommandProvider/,
  /createInteractionDiagnosticsReport/,
];

function hasProductMount(src: string): boolean {
  return PRODUCT_MOUNT_TOKENS.some((re) => re.test(src));
}

/* -------------------------------------------------------------------------- */
/* PASS 01 — documentationExists                                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "documentationExists";
  const exists = existsSync(join(repoRoot, DOC_8_10));
  assertCase(block, "doc.exists", exists, `${DOC_8_10} exists`);

  const doc = exists ? read(DOC_8_10) : "";

  assertCase(
    block,
    "doc.declaration",
    /UX-8\.10\s*=\s*Release Certification/i.test(doc),
    "Declaration states UX-8.10 = Release Certification",
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
    /UX-8-architecture\.md/.test(doc),
    "Doc references UX-8-architecture.md",
  );

  assertCase(
    block,
    "doc.roadmapRef",
    /UX-8\.0-roadmap\.md/.test(doc),
    "Doc references UX-8.0-roadmap.md",
  );

  assertCase(
    block,
    "doc.nextUx9",
    /Next\s*=\s*UX-9|Next Series\s*=\s*UX-9|Next:\s*UX-9/i.test(doc),
    "Doc points Next to UX-9",
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
/* PASS 02 — releaseCertificationDeclared                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "releaseCertificationDeclared";
  const doc = existsSync(join(repoRoot, DOC_8_10)) ? read(DOC_8_10) : "";

  assertCase(
    block,
    "release.declared",
    /UX-8 RELEASE CERTIFIED/.test(doc),
    "Declares UX-8 RELEASE CERTIFIED",
  );
  assertCase(
    block,
    "release.infraComplete",
    /Infrastructure complete/i.test(doc),
    "Declares Infrastructure complete",
  );
  assertCase(
    block,
    "release.docsFrozen",
    /Documentation frozen/i.test(doc),
    "Declares Documentation frozen",
  );
  assertCase(
    block,
    "release.readyUx9",
    /Ready for UX-9/i.test(doc),
    "Declares Ready for UX-9",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — seriesSummary                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "seriesSummary";
  const doc = existsSync(join(repoRoot, DOC_8_10)) ? read(DOC_8_10) : "";

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
      existsSync(join(repoRoot, path)),
      `${path} exists`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — certifiedArchitecture                                            */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "certifiedArchitecture";
  const doc = existsSync(join(repoRoot, DOC_8_10)) ? read(DOC_8_10) : "";

  assertCase(
    block,
    "arch.section",
    hasHeading(doc, "Certified Architecture"),
    "Certified Architecture section present",
  );

  const tokens = [
    "registries",
    "dispatcher",
    "diagnostics",
    "providers",
    "hooks",
    "contracts",
    "dependency rules",
    "authorities",
    "folder layout",
  ] as const;

  for (const token of tokens) {
    assertCase(
      block,
      `arch.${token.replace(/\s+/g, "_")}`,
      new RegExp(token, "i").test(doc),
      `Certified Architecture documents ${token}`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — evidenceReuse                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "evidenceReuse";
  const doc = existsSync(join(repoRoot, DOC_8_10)) ? read(DOC_8_10) : "";

  assertCase(
    block,
    "er.section",
    hasHeading(doc, "Evidence Reuse"),
    "Evidence Reuse section present",
  );
  assertCase(
    block,
    "er.validate81",
    /validate:ux-8\.1/.test(doc),
    "Declares reuse of validate:ux-8.1",
  );
  assertCase(
    block,
    "er.validate89",
    /validate:ux-8\.9/.test(doc),
    "Declares reuse of validate:ux-8.9",
  );
  assertCase(
    block,
    "er.noFunctionalReaudit",
    /No functional re-audit|no functional re-audit/i.test(doc),
    "Declares No functional re-audit",
  );
  assertCase(
    block,
    "er.noNested",
    /No nested validators|no nested validators/i.test(doc),
    "Declares No nested validators",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — validationScopeFreeze                                            */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "validationScopeFreeze";
  const doc = existsSync(join(repoRoot, DOC_8_10)) ? read(DOC_8_10) : "";
  const self = existsSync(join(repoRoot, VALIDATOR_SELF))
    ? read(VALIDATOR_SELF)
    : "";

  assertCase(
    block,
    "vsf.section",
    hasHeading(doc, "Validation Scope Freeze"),
    "Validation Scope Freeze section present",
  );
  assertCase(
    block,
    "vsf.docsOnly",
    /certifies ONLY/i.test(doc) &&
      /documentation/i.test(doc) &&
      /roadmap/i.test(doc) &&
      /package\.json/i.test(doc),
    "Declares gate certifies only documentation / roadmap / package.json",
  );
  assertCase(
    block,
    "vsf.historicalEvidence",
    /historical evidence/i.test(doc),
    "Declares historical evidence in scope",
  );
  assertCase(
    block,
    "vsf.neverSurfaces",
    /src\/ui\/\*\*/.test(doc) &&
      /Runtime/i.test(doc) &&
      /registries/i.test(doc) &&
      /dispatcher/i.test(doc) &&
      /diagnostics/i.test(doc),
    "Lists surfaces never re-audited",
  );

  const spawnTok = ["spawn", "Sync"].join("");
  const execTok = ["exec", "Sync"].join("");
  const execFileTok = ["execFile", "Sync"].join("");
  const childTok = ["child", "_process"].join("");
  const nestedNpm = ["npm run ", "validate:", "ux-8."].join("");

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
/* PASS 07 — releaseFreeze                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "releaseFreeze";
  const doc = existsSync(join(repoRoot, DOC_8_10)) ? read(DOC_8_10) : "";

  assertCase(
    block,
    "rf.section",
    hasHeading(doc, "Release Freeze"),
    "Release Freeze section present",
  );
  assertCase(
    block,
    "rf.infraFrozen",
    /infrastructure is frozen|infrastructure UX-8.*congelada|UX-8 infrastructure/i.test(
      doc,
    ),
    "Declares UX-8 infrastructure frozen",
  );
  assertCase(
    block,
    "rf.noFurther",
    /No further UX-8 microphases|no further UX-8 microphases|no se aceptan nuevas microfases UX-8/i.test(
      doc,
    ),
    "Declares no further UX-8 microphases",
  );
  assertCase(
    block,
    "rf.evolutionUx9",
    /future evolution continues in UX-9|continúa exclusivamente en UX-9|continues in UX-9/i.test(
      doc,
    ),
    "Declares future evolution continues in UX-9",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — architectureConsistency                                          */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "architectureConsistency";
  const doc = existsSync(join(repoRoot, DOC_8_10)) ? read(DOC_8_10) : "";
  const archExists = existsSync(join(repoRoot, ARCH));
  const arch = archExists ? read(ARCH) : "";

  assertCase(
    block,
    "ac.section",
    hasHeading(doc, "Architecture Consistency"),
    "Architecture Consistency section present",
  );
  assertCase(
    block,
    "ac.onlySsot",
    /ONLY architecture SSOT|ONLY SSOT|sole SSOT|único SSOT/i.test(doc),
    "Declares UX-8-architecture.md is the only SSOT",
  );
  assertCase(
    block,
    "ac.noNewRules",
    /introduces\s+NO\s+architectural rules|NO architectural rules/i.test(doc),
    "Declares UX-8.10 introduces NO architectural rules",
  );
  assertCase(
    block,
    "ac.noReplace",
    /does NOT replace|does not replace|not replaced/i.test(doc),
    "Declares UX-8.10 does not replace the SSOT",
  );
  assertCase(block, "ac.ssotExists", archExists, `${ARCH} exists`);
  assertCase(
    block,
    "ac.ssotAuthorities",
    /Authorities Matrix/i.test(arch),
    "SSOT still contains Authorities Matrix",
  );
  assertCase(
    block,
    "ac.ssotDependency",
    /Dependency Rule/i.test(arch),
    "SSOT still contains Dependency Rule",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — historicalCertification                                          */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "historicalCertification";
  const doc = existsSync(join(repoRoot, DOC_8_10)) ? read(DOC_8_10) : "";

  assertCase(
    block,
    "hc.section",
    hasHeading(doc, "Historical Certification"),
    "Historical Certification section present",
  );
  assertCase(
    block,
    "hc.range",
    /UX-8\.1\s*→\s*UX-8\.9|UX-8\.1\s*-\s*UX-8\.9|UX-8\.1[\s\S]*UX-8\.9/i.test(
      doc,
    ),
    "Declares UX-8.1 → UX-8.9 construction history",
  );
  assertCase(
    block,
    "hc.official",
    /official certified construction history|official.*construction history/i.test(
      doc,
    ),
    "Declares official certified construction history",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 10 — certificationFinalityFreeze                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "certificationFinalityFreeze";
  const doc = existsSync(join(repoRoot, DOC_8_10)) ? read(DOC_8_10) : "";

  assertCase(
    block,
    "cff.section",
    hasHeading(doc, "Certification Finality Freeze"),
    "Certification Finality Freeze section present",
  );
  assertCase(
    block,
    "cff.final",
    /is final|final and irreversible/i.test(doc),
    "Declares RELEASE CERTIFIED is final",
  );
  assertCase(
    block,
    "cff.noRecert",
    /no.*UX-8 recertification|no future:\s*\n?\s*UX-8 recertification/i.test(
      doc,
    ),
    "Declares no UX-8 recertification",
  );
  assertCase(
    block,
    "cff.noReopening",
    /no.*UX-8 reopening|no UX-8 reopening/i.test(doc),
    "Declares no UX-8 reopening",
  );
  assertCase(
    block,
    "cff.noAdditional",
    /no additional UX-8 microphases|no.*additional UX-8 microphases/i.test(
      doc,
    ),
    "Declares no additional UX-8 microphases",
  );
  assertCase(
    block,
    "cff.futureUx9",
    /Future work belongs ONLY to UX-9|belongs ONLY to UX-9/i.test(doc),
    "Declares future work belongs ONLY to UX-9+",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 11 — historicalValidatorPreservationFreeze                            */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "historicalValidatorPreservationFreeze";
  const doc = existsSync(join(repoRoot, DOC_8_10)) ? read(DOC_8_10) : "";

  assertCase(
    block,
    "hvpf.section",
    hasHeading(doc, "Historical Validator Preservation Freeze"),
    "Historical Validator Preservation Freeze section present",
  );
  assertCase(
    block,
    "hvpf.unchanged",
    /remain unchanged historical evidence|unchanged historical evidence/i.test(
      doc,
    ),
    "Declares historical validators remain unchanged evidence",
  );
  assertCase(
    block,
    "hvpf.reuses",
    /reuses/i.test(doc) && /never rewrites/i.test(doc),
    "Declares validate:ux-8.10 reuses but never rewrites",
  );
  assertCase(
    block,
    "hvpf.noModify",
    /does not modify/i.test(doc),
    "Declares does not modify historical validators",
  );
  assertCase(
    block,
    "hvpf.noReplace",
    /does not replace/i.test(doc),
    "Declares does not replace historical validators",
  );
  assertCase(
    block,
    "hvpf.noMeaning",
    /does not change their meaning|never.*change their meaning/i.test(doc),
    "Declares does not change their meaning",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 12 — roadmapUpdated                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "roadmapUpdated";
  const roadmap = existsSync(join(repoRoot, ROADMAP)) ? read(ROADMAP) : "";

  assertCase(
    block,
    "roadmap.exists",
    existsSync(join(repoRoot, ROADMAP)),
    `${ROADMAP} exists`,
  );
  assertCase(
    block,
    "roadmap.releaseCertified",
    /UX-8\s+RELEASE\s+CERTIFIED/.test(roadmap) ||
      /UX-8\s*=\s*RELEASE CERTIFIED/.test(roadmap),
    "Roadmap declares UX-8 RELEASE CERTIFIED",
  );
  assertCase(
    block,
    "roadmap.closed",
    /UX-8\s*=\s*CLOSED|CLOSED/.test(roadmap) &&
      (/RELEASE CERTIFIED/.test(roadmap) || /Series closed/i.test(roadmap)),
    "Roadmap marks UX-8 CLOSED",
  );
  assertCase(
    block,
    "roadmap.ux810Complete",
    /UX-8\.10\s*=\s*COMPLETE/i.test(roadmap),
    "Roadmap marks UX-8.10 COMPLETE",
  );
  assertCase(
    block,
    "roadmap.tableComplete",
    /UX-8\.10\s*\|\s*Release Certification\s*\|\s*COMPLETE/i.test(roadmap),
    "Roadmap phase table marks UX-8.10 COMPLETE",
  );
  assertCase(
    block,
    "roadmap.historicalGate",
    /validate:ux-8\.10/.test(roadmap) && /UX-8\.10\.md/.test(roadmap),
    "Roadmap lists historical gate validate:ux-8.10",
  );
  assertCase(
    block,
    "roadmap.nextUx9",
    /Next Series\s*=\s*UX-9|Next Series\s*→\s*UX-9|Next Series:\s*UX-9/i.test(
      roadmap,
    ),
    "Roadmap Next Series = UX-9",
  );
  assertCase(
    block,
    "roadmap.architectureRef",
    /UX-8-architecture\.md/.test(roadmap),
    "Roadmap keeps Architecture SSOT reference",
  );
  assertCase(
    block,
    "roadmap.seriesClosed",
    /Series closed|Series Closure|Series Completion/i.test(roadmap),
    "Roadmap declares series closed",
  );
  assertCase(
    block,
    "roadmap.ux89Complete",
    /UX-8\.9\s*=\s*COMPLETE/i.test(roadmap),
    "Roadmap keeps UX-8.9 COMPLETE",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 13 — packageScript                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "packageScript";
  const pkg = existsSync(join(repoRoot, PACKAGE_JSON))
    ? read(PACKAGE_JSON)
    : "";

  assertCase(
    block,
    "pkg.validate810",
    /"validate:ux-8\.10"\s*:\s*"npx tsx scripts\/validate-ux-8\.10\.ts"/.test(
      pkg,
    ),
    'package.json has "validate:ux-8.10": "npx tsx scripts/validate-ux-8.10.ts"',
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 14 — historicalValidatorsIntact                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "historicalValidatorsIntact";

  for (const path of HISTORICAL_VALIDATORS) {
    assertCase(
      block,
      `histVal.${path.replace(/[\\/.]/g, "_")}`,
      existsSync(join(repoRoot, path)),
      `${path} exists`,
    );
  }

  const self = existsSync(join(repoRoot, VALIDATOR_SELF))
    ? read(VALIDATOR_SELF)
    : "";

  const nestedHist = ["npm run ", "validate:", "ux-8."].join("");
  assertCase(
    block,
    "histVal.noNest",
    !self.includes(nestedHist),
    "Does not nest historical ux-8 validate scripts",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 15 — intactSurfaces                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "intactSurfaces";

  const page = existsSync(join(repoRoot, PAGE_TSX)) ? read(PAGE_TSX) : "";
  const shell = existsSync(join(repoRoot, APP_SHELL)) ? read(APP_SHELL) : "";
  const uiIndex = existsSync(join(repoRoot, UI_INDEX)) ? read(UI_INDEX) : "";
  const wr = existsSync(join(repoRoot, WINDOW_REGISTRY))
    ? read(WINDOW_REGISTRY)
    : "";

  assertCase(
    block,
    "intact.page",
    existsSync(join(repoRoot, PAGE_TSX)) && !hasProductMount(page),
    "page.tsx has no UX-8 product mount",
  );
  assertCase(
    block,
    "intact.appShell",
    existsSync(join(repoRoot, APP_SHELL)) && !hasProductMount(shell),
    "AppShell has no UX-8 product mount",
  );
  assertCase(
    block,
    "intact.uiIndex",
    existsSync(join(repoRoot, UI_INDEX)) && !hasProductMount(uiIndex),
    "src/ui/index.ts has no UX-8 product mount exports",
  );
  assertCase(
    block,
    "intact.windowRegistry",
    existsSync(join(repoRoot, WINDOW_REGISTRY)) && !hasProductMount(wr),
    "WindowRegistry untouched by UX-8 product mount",
  );

  for (const dir of FROZEN_DIRS) {
    assertCase(
      block,
      `intact.evidence.${dir.replace(/\//g, "_")}`,
      existsSync(join(repoRoot, dir)),
      `Evidence reuse: ${dir} exists (prior construction)`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const failed = results.filter((r) => !r.pass);
const passed = results.filter((r) => r.pass);

const blocks: BlockId[] = [
  "documentationExists",
  "releaseCertificationDeclared",
  "seriesSummary",
  "certifiedArchitecture",
  "evidenceReuse",
  "validationScopeFreeze",
  "releaseFreeze",
  "architectureConsistency",
  "historicalCertification",
  "certificationFinalityFreeze",
  "historicalValidatorPreservationFreeze",
  "roadmapUpdated",
  "packageScript",
  "historicalValidatorsIntact",
  "intactSurfaces",
];

console.log("UX-8.10 — Release Certification");
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
console.log("UX-8 RELEASE CERTIFIED");
console.log("Series Closed");
console.log("Next: UX-9");
