/**
 * UX-7.10 — Release Certification gate.
 *
 * Blocks:
 * seriesComplete · roadmapClosed · documentationComplete
 * architectureCertified · apiCertified · pipelineCertified
 * diagnosticsCertified · visualCertified · auditCertified
 * releaseCertified
 *
 * Architectural principles:
 * - Certification Freeze · Certification Independence Freeze
 * - Certification Evidence Freeze · Certification Determinism Freeze
 * - Series Closure Freeze · Certification Immutability Freeze
 * - Evidence Reuse Only — consume UX-7.9 Final Audit + docs/validators
 * - Never reaudit · never read src/ui/** · never execute Runtime
 * - No nested validate:ux-* (Windows hang)
 * - Deterministic: same artifacts → same PASS/FAIL (no Date/env/runtime)
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "seriesComplete"
  | "roadmapClosed"
  | "documentationComplete"
  | "architectureCertified"
  | "apiCertified"
  | "pipelineCertified"
  | "diagnosticsCertified"
  | "visualCertified"
  | "auditCertified"
  | "releaseCertified";

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

/* -------------------------------------------------------------------------- */
/* Paths                                                                      */
/* -------------------------------------------------------------------------- */

const ROADMAP_7 = "docs/UX/UX-7.0-roadmap.md";
const DOC_7_9 = "docs/UX/UX-7.9.md";
const DOC_7_10 = "docs/UX/UX-7.10.md";
const PACKAGE_JSON = "package.json";
const VALIDATOR_7_9 = "scripts/validate-ux-7.9.ts";
const VALIDATOR_7_10 = "scripts/validate-ux-7.10.ts";

const SERIES_DOCS_1_9 = [
  "docs/UX/UX-7.1.md",
  "docs/UX/UX-7.2.md",
  "docs/UX/UX-7.3.md",
  "docs/UX/UX-7.4.md",
  "docs/UX/UX-7.5.md",
  "docs/UX/UX-7.6.md",
  "docs/UX/UX-7.7.md",
  "docs/UX/UX-7.8.md",
  "docs/UX/UX-7.9.md",
] as const;

const DOC_7_1 = "docs/UX/UX-7.1.md";
const DOC_7_6 = "docs/UX/UX-7.6.md";
const DOC_7_7 = "docs/UX/UX-7.7.md";
const DOC_7_8 = "docs/UX/UX-7.8.md";

/* -------------------------------------------------------------------------- */
/* PASS 01 — seriesComplete                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "seriesComplete";

  const roadmap = existsSync(join(repoRoot, ROADMAP_7)) ? read(ROADMAP_7) : "";
  const pkg = existsSync(join(repoRoot, PACKAGE_JSON))
    ? read(PACKAGE_JSON)
    : "";

  for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9] as const) {
    assertCase(
      block,
      `roadmap.complete.7.${n}`,
      new RegExp(`UX-7\\.${n}\\s*=\\s*COMPLETE`).test(roadmap),
      `Roadmap declares UX-7.${n} = COMPLETE`,
    );

    const doc = `docs/UX/UX-7.${n}.md`;
    assertCase(
      block,
      `exists.doc.7.${n}`,
      existsSync(join(repoRoot, doc)),
      `${doc} exists`,
    );

    const validator = `scripts/validate-ux-7.${n}.ts`;
    assertCase(
      block,
      `exists.validator.7.${n}`,
      existsSync(join(repoRoot, validator)),
      `${validator} exists`,
    );

    assertCase(
      block,
      `npm.script.7.${n}`,
      new RegExp(`"validate:ux-7\\.${n}"\\s*:`).test(pkg),
      `package.json has validate:ux-7.${n}`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — roadmapClosed                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "roadmapClosed";

  assertCase(
    block,
    "exists.roadmap",
    existsSync(join(repoRoot, ROADMAP_7)),
    `${ROADMAP_7} exists`,
  );

  const roadmap = existsSync(join(repoRoot, ROADMAP_7)) ? read(ROADMAP_7) : "";

  assertCase(
    block,
    "roadmap.closed",
    /UX-7\s*=\s*CLOSED/.test(roadmap),
    "roadmap marks UX-7 = CLOSED",
  );

  assertCase(
    block,
    "roadmap.releaseCertified",
    /UX-7\s+RELEASE\s+CERTIFIED/.test(roadmap),
    "roadmap declares UX-7 RELEASE CERTIFIED",
  );

  assertCase(
    block,
    "roadmap.ux710Complete",
    /UX-7\.10\s*=\s*COMPLETE/.test(roadmap),
    "roadmap marks UX-7.10 = COMPLETE",
  );

  assertCase(
    block,
    "roadmap.table.7.10",
    /UX-7\.10\s*\|\s*(Release\s+)?Certification/i.test(roadmap) &&
      /COMPLETE/.test(roadmap),
    "roadmap microphase table includes UX-7.10 COMPLETE",
  );

  assertCase(
    block,
    "roadmap.nextUx8",
    /Next Series\s*=\s*UX-8/.test(roadmap) ||
      /Next Series\s*→\s*UX-8/.test(roadmap) ||
      /Next Series:\s*UX-8/.test(roadmap),
    "roadmap Next Series → UX-8",
  );

  assertCase(
    block,
    "roadmap.historicalGate.7.10",
    /validate:ux-7\.10/.test(roadmap),
    "roadmap lists historical gate validate:ux-7.10",
  );

  assertCase(
    block,
    "roadmap.seriesClosureNote",
    /Series Closure/i.test(roadmap),
    "roadmap documents Series Closure",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — documentationComplete                                            */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "documentationComplete";

  assertCase(
    block,
    "exists.roadmap",
    existsSync(join(repoRoot, ROADMAP_7)),
    `${ROADMAP_7} exists`,
  );

  for (const rel of SERIES_DOCS_1_9) {
    assertCase(
      block,
      `exists.${rel.split("/").pop()}`,
      existsSync(join(repoRoot, rel)),
      `${rel} exists`,
    );
  }

  assertCase(
    block,
    "exists.doc710",
    existsSync(join(repoRoot, DOC_7_10)),
    `${DOC_7_10} exists`,
  );

  const doc710 = existsSync(join(repoRoot, DOC_7_10)) ? read(DOC_7_10) : "";

  assertCase(
    block,
    "doc710.certificationFreeze",
    /Certification Freeze/.test(doc710),
    "UX-7.10.md declares Certification Freeze",
  );

  assertCase(
    block,
    "doc710.independenceFreeze",
    /Certification Independence Freeze/.test(doc710),
    "UX-7.10.md declares Certification Independence Freeze",
  );

  assertCase(
    block,
    "doc710.evidenceFreeze",
    /Certification Evidence Freeze/.test(doc710),
    "UX-7.10.md declares Certification Evidence Freeze",
  );

  assertCase(
    block,
    "doc710.determinismFreeze",
    /Certification Determinism Freeze/.test(doc710),
    "UX-7.10.md declares Certification Determinism Freeze",
  );

  assertCase(
    block,
    "doc710.seriesClosureFreeze",
    /Series Closure Freeze/.test(doc710),
    "UX-7.10.md declares Series Closure Freeze",
  );

  assertCase(
    block,
    "doc710.immutabilityFreeze",
    /Certification Immutability Freeze/.test(doc710),
    "UX-7.10.md declares Certification Immutability Freeze",
  );

  assertCase(
    block,
    "doc710.releaseCertified",
    /UX-7\s*\n?\s*RELEASE\s+CERTIFIED/.test(doc710) ||
      /UX-7 RELEASE CERTIFIED/.test(doc710),
    "UX-7.10.md declares UX-7 RELEASE CERTIFIED",
  );

  assertCase(
    block,
    "doc710.nextUx8",
    /Next Series\s*→\s*UX-8/.test(doc710) ||
      /Next Series\s*=\s*UX-8/.test(doc710),
    "UX-7.10.md Next Series → UX-8",
  );

  assertCase(
    block,
    "doc710.architectureOfClosure",
    /Arquitectura de cierre/i.test(doc710) ||
      /Release Certification/.test(doc710),
    "UX-7.10.md documents closure architecture",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — architectureCertified                                            */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "architectureCertified";

  const doc79 = existsSync(join(repoRoot, DOC_7_9)) ? read(DOC_7_9) : "";
  const validator79 = existsSync(join(repoRoot, VALIDATOR_7_9))
    ? read(VALIDATOR_7_9)
    : "";
  const doc710 = existsSync(join(repoRoot, DOC_7_10)) ? read(DOC_7_10) : "";

  assertCase(
    block,
    "audit.architectureFreeze",
    /Architecture Freeze/.test(doc79) &&
      /UX-7\.1/.test(doc79) &&
      /UX-7\.8/.test(doc79),
    "UX-7.9.md documents Architecture Freeze UX-7.1–7.8",
  );

  assertCase(
    block,
    "audit.modulesListed",
    /src\/ui\/visibility/.test(doc79) &&
      /src\/ui\/tooltips/.test(doc79) &&
      /src\/ui\/discoverability/.test(doc79) &&
      /src\/ui\/visual-integration/.test(doc79),
    "UX-7.9.md lists frozen UX-7 module paths",
  );

  assertCase(
    block,
    "audit.validator.architectureBlock",
    /architectureFreeze/.test(validator79),
    "validate-ux-7.9.ts includes architectureFreeze block",
  );

  assertCase(
    block,
    "cert.architectureFreeze",
    /Architecture Freeze UX-7\.1–UX-7\.9/.test(doc710) ||
      /Architecture Freeze UX-7\.1–7\.9/.test(doc710),
    "UX-7.10.md declares Architecture Freeze UX-7.1–7.9",
  );

  for (const n of [1, 2, 3, 4, 5, 6, 7, 8] as const) {
    const doc = existsSync(join(repoRoot, `docs/UX/UX-7.${n}.md`))
      ? read(`docs/UX/UX-7.${n}.md`)
      : "";
    assertCase(
      block,
      `phase.doc.7.${n}`,
      doc.length > 0,
      `UX-7.${n}.md present for architecture certification`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — apiCertified                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "apiCertified";

  const doc79 = existsSync(join(repoRoot, DOC_7_9)) ? read(DOC_7_9) : "";
  const validator79 = existsSync(join(repoRoot, VALIDATOR_7_9))
    ? read(VALIDATOR_7_9)
    : "";
  const doc71 = existsSync(join(repoRoot, DOC_7_1)) ? read(DOC_7_1) : "";
  const doc76 = existsSync(join(repoRoot, DOC_7_6)) ? read(DOC_7_6) : "";
  const doc77 = existsSync(join(repoRoot, DOC_7_7)) ? read(DOC_7_7) : "";

  assertCase(
    block,
    "audit.apiFreeze",
    /API Freeze/i.test(doc79),
    "UX-7.9.md documents API Freeze",
  );

  assertCase(
    block,
    "audit.validator.apiBlock",
    /apiFreeze/.test(validator79),
    "validate-ux-7.9.ts includes apiFreeze block",
  );

  assertCase(
    block,
    "phase.registryFreeze",
    /Registry Freeze/i.test(doc71) || /API Freeze/i.test(doc71),
    "UX-7.1.md documents Registry/API Freeze",
  );

  assertCase(
    block,
    "phase.pipelineApi",
    /API Freeze/i.test(doc76) || /Pipeline Freeze/i.test(doc76),
    "UX-7.6.md documents Pipeline/API Freeze",
  );

  assertCase(
    block,
    "phase.diagnosticsApi",
    /API Freeze/i.test(doc77) || /Diagnostics Freeze/i.test(doc77),
    "UX-7.7.md documents Diagnostics/API Freeze",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — pipelineCertified                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "pipelineCertified";

  const doc76 = existsSync(join(repoRoot, DOC_7_6)) ? read(DOC_7_6) : "";
  const doc79 = existsSync(join(repoRoot, DOC_7_9)) ? read(DOC_7_9) : "";
  const validator79 = existsSync(join(repoRoot, VALIDATOR_7_9))
    ? read(VALIDATOR_7_9)
    : "";

  assertCase(
    block,
    "exists.doc76",
    existsSync(join(repoRoot, DOC_7_6)),
    `${DOC_7_6} exists`,
  );

  assertCase(
    block,
    "phase.pipelineFreeze",
    /Pipeline Freeze/.test(doc76),
    "UX-7.6.md declares Pipeline Freeze",
  );

  assertCase(
    block,
    "phase.discoverabilityPipeline",
    /Discoverability Pipeline/i.test(doc76),
    "UX-7.6.md documents Discoverability Pipeline",
  );

  assertCase(
    block,
    "audit.pipelineFreeze",
    /Pipeline Freeze/.test(doc79),
    "UX-7.9.md documents Pipeline Freeze",
  );

  assertCase(
    block,
    "audit.validator.pipelineBlock",
    /pipelineFreeze/.test(validator79),
    "validate-ux-7.9.ts includes pipelineFreeze block",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — diagnosticsCertified                                             */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "diagnosticsCertified";

  const doc77 = existsSync(join(repoRoot, DOC_7_7)) ? read(DOC_7_7) : "";
  const doc79 = existsSync(join(repoRoot, DOC_7_9)) ? read(DOC_7_9) : "";
  const validator79 = existsSync(join(repoRoot, VALIDATOR_7_9))
    ? read(VALIDATOR_7_9)
    : "";

  assertCase(
    block,
    "exists.doc77",
    existsSync(join(repoRoot, DOC_7_7)),
    `${DOC_7_7} exists`,
  );

  assertCase(
    block,
    "phase.diagnosticsFreeze",
    /Diagnostics Freeze/.test(doc77),
    "UX-7.7.md declares Diagnostics Freeze",
  );

  assertCase(
    block,
    "audit.diagnosticsFreeze",
    /Diagnostics Freeze/.test(doc79),
    "UX-7.9.md documents Diagnostics Freeze",
  );

  assertCase(
    block,
    "audit.validator.diagnosticsBlock",
    /diagnosticsFreeze/.test(validator79),
    "validate-ux-7.9.ts includes diagnosticsFreeze block",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — visualCertified                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "visualCertified";

  const doc78 = existsSync(join(repoRoot, DOC_7_8)) ? read(DOC_7_8) : "";
  const doc79 = existsSync(join(repoRoot, DOC_7_9)) ? read(DOC_7_9) : "";
  const validator79 = existsSync(join(repoRoot, VALIDATOR_7_9))
    ? read(VALIDATOR_7_9)
    : "";

  assertCase(
    block,
    "exists.doc78",
    existsSync(join(repoRoot, DOC_7_8)),
    `${DOC_7_8} exists`,
  );

  assertCase(
    block,
    "phase.visualIntegration",
    /Visual Integration/i.test(doc78),
    "UX-7.8.md documents Visual Integration",
  );

  assertCase(
    block,
    "phase.visualFreeze",
    /Visual Integration Freeze/i.test(doc78) ||
      /Architecture Freeze/i.test(doc78),
    "UX-7.8.md declares Visual Integration / Architecture Freeze",
  );

  assertCase(
    block,
    "audit.visualFreeze",
    /Visual Integration Freeze/i.test(doc79),
    "UX-7.9.md documents Visual Integration Freeze",
  );

  assertCase(
    block,
    "audit.validator.visualBlock",
    /visualIntegrationFreeze/.test(validator79),
    "validate-ux-7.9.ts includes visualIntegrationFreeze block",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — auditCertified                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "auditCertified";

  const doc79 = existsSync(join(repoRoot, DOC_7_9)) ? read(DOC_7_9) : "";
  const validator79 = existsSync(join(repoRoot, VALIDATOR_7_9))
    ? read(VALIDATOR_7_9)
    : "";
  const pkg = existsSync(join(repoRoot, PACKAGE_JSON))
    ? read(PACKAGE_JSON)
    : "";

  assertCase(
    block,
    "exists.doc79",
    existsSync(join(repoRoot, DOC_7_9)),
    `${DOC_7_9} exists`,
  );

  assertCase(
    block,
    "exists.validator79",
    existsSync(join(repoRoot, VALIDATOR_7_9)),
    `${VALIDATOR_7_9} exists`,
  );

  assertCase(
    block,
    "npm.script.7.9",
    /"validate:ux-7\.9"\s*:/.test(pkg),
    "package.json has validate:ux-7.9",
  );

  assertCase(
    block,
    "doc79.finalAudit",
    /Final Audit/i.test(doc79),
    "UX-7.9.md is Final Audit",
  );

  assertCase(
    block,
    "doc79.auditFreeze",
    /Audit Freeze/.test(doc79),
    "UX-7.9.md declares Audit Freeze",
  );

  assertCase(
    block,
    "doc79.independenceFreeze",
    /Audit Independence Freeze/.test(doc79),
    "UX-7.9.md declares Audit Independence Freeze",
  );

  assertCase(
    block,
    "doc79.evidenceFreeze",
    /Evidence Freeze/.test(doc79),
    "UX-7.9.md declares Evidence Freeze",
  );

  assertCase(
    block,
    "doc79.determinismFreeze",
    /Audit Determinism Freeze/.test(doc79),
    "UX-7.9.md declares Audit Determinism Freeze",
  );

  const hasLiteralPass =
    /validate:ux-7\.9\s*→\s*PASS 10\/10/.test(validator79) ||
    /PASS 10\/10/.test(validator79);
  const hasHistoricalGateShape =
    /CA-UX-7\.9\.10/.test(validator79) &&
    (/BLOCKS\.length/.test(validator79) || /\/\*\s*PASS 10\b/.test(validator79));
  assertCase(
    block,
    "validator79.passFingerprint",
    hasLiteralPass || hasHistoricalGateShape,
    "validate-ux-7.9.ts contains gate PASS 10/10 fingerprint",
  );

  assertCase(
    block,
    "validator79.noNested",
    !/npm\s+run\s+validate:ux-7\./.test(validator79) &&
      !/spawnSync\s*\(/.test(validator79) &&
      !/spawn\s*\(/.test(validator79),
    "validate-ux-7.9 does not nest/spawn historical validators",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 10 — releaseCertified                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "releaseCertified";

  const doc710 = existsSync(join(repoRoot, DOC_7_10)) ? read(DOC_7_10) : "";
  const roadmap = existsSync(join(repoRoot, ROADMAP_7)) ? read(ROADMAP_7) : "";
  const pkg = existsSync(join(repoRoot, PACKAGE_JSON))
    ? read(PACKAGE_JSON)
    : "";
  const selfSrc = existsSync(join(repoRoot, VALIDATOR_7_10))
    ? read(VALIDATOR_7_10)
    : "";

  assertCase(
    block,
    "exists.doc710",
    existsSync(join(repoRoot, DOC_7_10)),
    `${DOC_7_10} exists`,
  );

  assertCase(
    block,
    "doc710.releaseCertified",
    /UX-7 RELEASE CERTIFIED/.test(doc710),
    "UX-7.10.md official declaration UX-7 RELEASE CERTIFIED",
  );

  assertCase(
    block,
    "roadmap.releaseCertified",
    /UX-7\s+RELEASE\s+CERTIFIED/.test(roadmap),
    "roadmap declares UX-7 RELEASE CERTIFIED",
  );

  assertCase(
    block,
    "roadmap.closed",
    /UX-7\s*=\s*CLOSED/.test(roadmap),
    "roadmap marks UX-7 CLOSED",
  );

  assertCase(
    block,
    "doc710.seriesClosureFreeze",
    /Series Closure Freeze/.test(doc710),
    "UX-7.10.md Series Closure Freeze",
  );

  assertCase(
    block,
    "doc710.immutabilityFreeze",
    /Certification Immutability Freeze/.test(doc710),
    "UX-7.10.md Certification Immutability Freeze",
  );

  assertCase(
    block,
    "npm.script.7.10",
    /"validate:ux-7\.10"\s*:/.test(pkg),
    "package.json has validate:ux-7.10",
  );

  assertCase(
    block,
    "exists.validator710",
    existsSync(join(repoRoot, VALIDATOR_7_10)),
    `${VALIDATOR_7_10} exists`,
  );

  assertCase(
    block,
    "self.noNestedValidates",
    !/npm\s+run\s+validate:ux-/.test(selfSrc) &&
      !/spawnSync\s*\(/.test(selfSrc) &&
      !/spawn\s*\(/.test(selfSrc) &&
      !/execSync\s*\(/.test(selfSrc),
    "validate-ux-7.10 does not nest/spawn validators",
  );

  assertCase(
    block,
    "self.noSrcUiReads",
    !/=\s*["']src\/ui\//.test(selfSrc) &&
      !/read\(\s*["']src\/ui\//.test(selfSrc) &&
      !/join\(\s*repoRoot\s*,\s*["']src\/ui\//.test(selfSrc),
    "validate-ux-7.10 does not read src/ui/** evidence paths",
  );

  // Independence: no import of UI modules (static marker)
  assertCase(
    block,
    "self.noUiImports",
    !/from\s+["']@\/ui/.test(selfSrc) &&
      !/from\s+["'].*src\/ui/.test(selfSrc) &&
      !/require\s*\(\s*["'].*src\/ui/.test(selfSrc),
    "validate-ux-7.10 does not import UI/Pipeline/Diagnostics/Runtime",
  );

  assertCase(
    block,
    "seriesClosure.allOrNothing",
    /Series Closure/i.test(doc710) &&
      (/all-or-nothing/i.test(doc710) ||
        /parcial/i.test(doc710) ||
        /Partial/i.test(doc710) ||
        /solo si/i.test(doc710)),
    "UX-7.10.md Series Closure = all-or-nothing certification",
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const BLOCKS: { id: BlockId; ca: string }[] = [
  { id: "seriesComplete", ca: "CA-UX-7.10.1" },
  { id: "roadmapClosed", ca: "CA-UX-7.10.2" },
  { id: "documentationComplete", ca: "CA-UX-7.10.3" },
  { id: "architectureCertified", ca: "CA-UX-7.10.4" },
  { id: "apiCertified", ca: "CA-UX-7.10.5" },
  { id: "pipelineCertified", ca: "CA-UX-7.10.6" },
  { id: "diagnosticsCertified", ca: "CA-UX-7.10.7" },
  { id: "visualCertified", ca: "CA-UX-7.10.8" },
  { id: "auditCertified", ca: "CA-UX-7.10.9" },
  { id: "releaseCertified", ca: "CA-UX-7.10.10" },
];

let failedBlocks = 0;
for (const { id, ca } of BLOCKS) {
  const cases = results.filter((r) => r.block === id);
  const failed = cases.filter((r) => !r.pass);
  const pass = failed.length === 0 && cases.length > 0;
  if (!pass) failedBlocks += 1;
  const status = pass ? "PASS" : "FAIL";
  console.log(
    `${status} ${ca} (${id}) — ${cases.length - failed.length}/${cases.length}`,
  );
  for (const f of failed) {
    console.log(`  ✗ ${f.id}: ${f.detail}`);
  }
}

const totalPass = failedBlocks === 0;
console.log("");
if (totalPass) {
  console.log("validate:ux-7.10 → PASS 10/10");
  console.log("UX-7 RELEASE CERTIFIED");
  console.log("Series Closed");
  console.log("Next: UX-8");
  console.log("Series Closure Freeze = VIGENTE");
  console.log("Certification Immutability Freeze = VIGENTE");
} else {
  console.log(`validate:ux-7.10 → FAIL ${10 - failedBlocks}/10`);
  console.log(
    "UX-7 RELEASE CERTIFIED is NOT valid (partial certification forbidden)",
  );
}
process.exit(totalPass ? 0 : 1);
