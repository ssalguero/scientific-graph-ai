/**
 * RELEASE-P1 — Governance & Evidence Architecture validation gate.
 *
 * Authority: RELEASE-P0 · RELEASE-P1 Planning Baseline ·
 * docs/RELEASE/implementation/RELEASE-P1-Governance-and-Evidence-Architecture.md
 *
 * Layout + boundary + behavioral invariants. No production release / CI release gates.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  RELEASE_DOMAIN_MOTTO,
  RELEASE_P1_STATUS,
  RELEASE_P1_CERTIFICATION_STATUS,
  CROSS_DOMAIN_BASELINE_FACTS,
  listEvidencePathGaps,
  CERTIFICATION_BOUNDARY_INVARIANT,
  p1ClaimsGlobalReleaseCertification,
  evidenceAcceptanceAuthorizesProductionRelease,
  releaseMustNot,
  requestTransfersPeerOwnership,
  asReleaseEvidenceId,
  canTransitionEvidenceLifecycle,
  transitionEvidenceLifecycle,
  evaluateEvidenceTrust,
  missingEvidenceBecomesPass,
  recordSupportsPass,
  isKnownEvidenceClass,
  classifyEvidenceRecord,
  probeEvidenceCompleteness,
  createReleaseException,
  isBlocker,
  warningAuthorizesRelease,
  missingEvidenceException,
  validateEvidenceRecord,
  intakeCrossDomainBaseline,
  listReleaseGateCategories,
  evidenceForGate,
  concreteGateCriteriaDefined,
  finalCertificationGateImplemented,
  listTraceabilityChain,
  buildEvidenceTraceView,
  releaseCandidateExecutionEnabled,
  releaseDecisionExecutionEnabled,
  createDecisionProvenanceDraft,
  createEvidenceIndex,
  isDefinitiveReleaseEvidenceIndex,
  normalizeEvidenceInput,
} from "../src/release";
import {
  isForbiddenReleasePeerImport,
  isAllowedReleasePublicImport,
} from "../src/release/internal/boundary-policy";

const repoRoot = process.cwd();
const releaseDir = join(repoRoot, "src/release");

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const toPosix = (p: string) => p.replace(/\\/g, "/");
const relFromRepo = (abs: string) => toPosix(relative(repoRoot, abs));

const collectTsFiles = (dir: string): string[] => {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  const walk = (abs: string) => {
    for (const name of readdirSync(abs)) {
      const child = join(abs, name);
      if (statSync(child).isDirectory()) walk(child);
      else if (/\.(ts|tsx)$/.test(name)) out.push(child);
    }
  };
  walk(dir);
  return out;
};

const REQUIRED_DIRS = [
  "src/release",
  "src/release/foundation",
  "src/release/types",
  "src/release/baseline",
  "src/release/governance",
  "src/release/evidence",
  "src/release/public",
  "src/release/internal",
  "docs/RELEASE/implementation",
  "docs/RELEASE/official-records",
];

const REQUIRED_FILES = [
  "src/release/index.ts",
  "src/release/README.md",
  "src/release/ARCHITECTURE.md",
  "src/release/foundation/identity.ts",
  "src/release/types/vocabulary.ts",
  "src/release/types/evidence.ts",
  "src/release/baseline/cross-domain.ts",
  "src/release/governance/authority.ts",
  "src/release/governance/certification-boundary.ts",
  "src/release/evidence/lifecycle.ts",
  "src/release/evidence/trust.ts",
  "src/release/evidence/intake.ts",
  "src/release/evidence/index-model.ts",
  "src/release/internal/boundary-policy.ts",
  "docs/RELEASE/RELEASE-Planning-Charter.md",
  "docs/RELEASE/official-records/RELEASE-P0-Constitution-and-Domain-Baseline.md",
  "docs/RELEASE/official-records/RELEASE-P1-Planning-Certification.md",
  "docs/RELEASE/implementation/RELEASE-P1-Governance-and-Evidence-Architecture.md",
];

const FORBIDDEN_DIRS = [
  "src/release/deploy",
  "src/release/promotion",
  "src/release/ci",
  "src/release/shipping",
  "src/release/database",
];

const PEER_IMPORT_RE =
  /from\s+["']@\/(engine|data|ai|ui|plugins|performance|collab|components|app)(\/|["'])/;

const FORBIDDEN_SOURCE_PATTERNS: { id: string; re: RegExp }[] = [
  { id: "deploy", re: /\b(deployToProduction|ProductionDeployer)\b/ },
  { id: "ci-release-gate", re: /\b(registerReleaseCiGate|ReleaseCiPipeline)\b/ },
  { id: "publish", re: /\b(publishNpmPackage|externalPublish)\b/ },
];

for (const rel of REQUIRED_DIRS) {
  assertCase(
    `layout.dir.${rel}`,
    existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel)) ? "present" : "missing",
  );
}
for (const rel of REQUIRED_FILES) {
  assertCase(
    `layout.file.${rel}`,
    existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel)) ? "present" : "missing",
  );
}
for (const rel of FORBIDDEN_DIRS) {
  assertCase(
    `no.forbidden.dir.${rel}`,
    !existsSync(join(repoRoot, rel)),
    "absent",
  );
}

assertCase(
  "identity.motto",
  RELEASE_DOMAIN_MOTTO === "Consolidate without replacing.",
  RELEASE_DOMAIN_MOTTO,
);
assertCase(
  "identity.status",
  RELEASE_P1_STATUS === "CERTIFIED_FROZEN",
  RELEASE_P1_STATUS,
);
assertCase(
  "identity.cert.claimed",
  RELEASE_P1_CERTIFICATION_STATUS === "CERTIFIED_FROZEN",
  RELEASE_P1_CERTIFICATION_STATUS,
);

// Boundary: no peer imports inside src/release
const tsFiles = collectTsFiles(releaseDir);
let peerImportHits = 0;
for (const file of tsFiles) {
  const text = readFileSync(file, "utf8");
  if (PEER_IMPORT_RE.test(text)) {
    peerImportHits += 1;
    assertCase(
      `boundary.peer.${relFromRepo(file)}`,
      false,
      "peer import forbidden",
    );
  }
  for (const pat of FORBIDDEN_SOURCE_PATTERNS) {
    if (pat.re.test(text)) {
      assertCase(
        `forbidden.pattern.${pat.id}.${relFromRepo(file)}`,
        false,
        "forbidden runtime pattern",
      );
    }
  }
}
assertCase(
  "boundary.no.peer.imports",
  peerImportHits === 0,
  `${peerImportHits} peer import file(s)`,
);
assertCase(
  "boundary.public.import",
  isAllowedReleasePublicImport("@/release") &&
    isForbiddenReleasePeerImport("@/engine"),
  "public @/release only; peers forbidden",
);

// Peer packages must not import @/release (no circular dep)
const peerRoots = [
  "src/engine",
  "src/data",
  "src/ai",
  "src/ui",
  "src/plugins",
  "src/performance",
];
let peerDependsOnRelease = 0;
for (const root of peerRoots) {
  const abs = join(repoRoot, root);
  if (!existsSync(abs)) continue;
  for (const file of collectTsFiles(abs)) {
    const text = readFileSync(file, "utf8");
    if (/from\s+["']@\/release/.test(text)) {
      peerDependsOnRelease += 1;
      assertCase(
        `circular.peer.${relFromRepo(file)}`,
        false,
        "peer must not depend on @/release",
      );
    }
  }
}
assertCase(
  "circular.none",
  peerDependsOnRelease === 0,
  "peers do not import @/release",
);

// Classification
assertCase(
  "classification.known",
  isKnownEvidenceClass("DOMAIN_CERTIFICATION"),
  "DOMAIN_CERTIFICATION",
);

// Lifecycle
assertCase(
  "lifecycle.legal",
  canTransitionEvidenceLifecycle("DISCOVERED", "REGISTERED"),
  "DISCOVERED→REGISTERED",
);
assertCase(
  "lifecycle.illegal",
  !canTransitionEvidenceLifecycle("DISCOVERED", "CONSUMED"),
  "DISCOVERED→CONSUMED forbidden",
);

const sample = normalizeEvidenceInput({
  id: asReleaseEvidenceId("e-sample"),
  source: "test",
  artifact: "artifact",
  evidenceClass: "TEST",
  originatingDomain: "DATA",
  owningDomain: "DATA",
  certificationRelationship: "unit",
  freshness: { versionLabel: "1", isCurrent: true },
  provenance: {
    producedBy: "validator",
    authorityPath: "test",
    recordedAt: "2026-08-08",
  },
  scope: "unit",
  dependencyIds: [],
  limitations: [],
  blocking: { contributes: false },
  gateCategories: ["Functional"],
  lifecycleState: "DISCOVERED",
});
const t1 = transitionEvidenceLifecycle(sample, "REGISTERED");
assertCase("lifecycle.transition.ok", t1.ok, t1.ok ? "ok" : t1.reason);
const tBad = transitionEvidenceLifecycle(sample, "CONSUMED");
assertCase("lifecycle.transition.bad", !tBad.ok, "rejected");

// Provenance / ownership
assertCase(
  "provenance.present",
  sample.provenance.authorityPath === "test",
  "authorityPath",
);
assertCase("ownership.peer", sample.owningDomain === "DATA", "DATA owns");

// Trust / missing ≠ PASS
assertCase("trust.missing.never.pass", missingEvidenceBecomesPass() === false, "false");
const missingTrust = evaluateEvidenceTrust({
  trustClass: "MISSING",
  validationOutcome: "PASS",
  isCurrent: true,
});
assertCase(
  "trust.missing.blocks",
  missingTrust.maySupportPass === false,
  missingTrust.reason,
);

const staleTrust = evaluateEvidenceTrust({
  trustClass: "AUTHORITATIVE",
  validationOutcome: "PASS",
  isCurrent: false,
});
assertCase("trust.stale", staleTrust.maySupportPass === false, staleTrust.reason);

const conflictTrust = evaluateEvidenceTrust({
  trustClass: "CONFLICTING",
  validationOutcome: "PASS",
  isCurrent: true,
});
assertCase(
  "trust.conflict",
  conflictTrust.maySupportPass === false,
  conflictTrust.reason,
);

const missingValidate = validateEvidenceRecord({
  ...sample,
  id: asReleaseEvidenceId("e-missing"),
  trustClass: "MISSING",
  validationOutcome: "PASS",
});
assertCase(
  "validate.missing.fail",
  missingValidate.outcome === "FAIL",
  missingValidate.outcome,
);

// Gaps WARNING vs BLOCKER
const blocker = missingEvidenceException("ENGINE", "required pack missing");
const warning = createReleaseException({
  severity: "WARNING",
  kind: "EVIDENCE_PATH_GAP",
  message: "gap",
  relatedEvidenceIds: [],
  open: true,
});
assertCase("gap.blocker", isBlocker(blocker), "BLOCKER");
assertCase(
  "gap.warning.no.auth",
  warningAuthorizesRelease(warning) === false,
  "WARNING ≠ authorize",
);

// Intake / baseline facts
const intake = intakeCrossDomainBaseline();
assertCase(
  "intake.count",
  intake.evidence.length === CROSS_DOMAIN_BASELINE_FACTS.length,
  String(intake.evidence.length),
);
assertCase(
  "baseline.engine.gap",
  listEvidencePathGaps().some((f) => f.domain === "ENGINE"),
  "ENGINE path gap",
);
assertCase(
  "baseline.collab",
  intake.exceptions.some(
    (e) =>
      e.relatedDomain === "COLLAB" &&
      /I-series not started/i.test(e.message),
  ),
  "COLLAB I* warning",
);
assertCase(
  "baseline.performance",
  intake.exceptions.some(
    (e) =>
      e.relatedDomain === "PERFORMANCE" &&
      /global RELEASE has not been executed/i.test(e.message),
  ),
  "PERFORMANCE global RELEASE not executed",
);

// Classification on intake
const engineEv = intake.evidence.find((e) => e.owningDomain === "ENGINE");
assertCase(
  "classification.intake",
  !!engineEv && classifyEvidenceRecord(engineEv) === "DOMAIN_CERTIFICATION",
  "ENGINE class",
);

// Completeness
const probes = probeEvidenceCompleteness(null);
assertCase(
  "completeness.missing.exists",
  probes.some((p) => p.dimension === "EXISTS" && p.satisfied === false),
  "null → EXISTS false",
);
assertCase(
  "completeness.sufficient.deferred",
  probes.every(
    (p) =>
      p.dimension !== "SUFFICIENT_FOR_CERTIFICATION" || p.satisfied === false,
  ),
  "no silent sufficiency",
);

// Traceability
assertCase(
  "traceability.chain",
  listTraceabilityChain()[0] === "Domain" &&
    listTraceabilityChain().includes("ReleaseDecision"),
  "full chain",
);
if (engineEv) {
  const view = buildEvidenceTraceView(engineEv);
  assertCase(
    "traceability.view",
    view.domain === "ENGINE" && view.releaseCandidateSlot === "DEFERRED",
    "RC deferred",
  );
}
assertCase(
  "traceability.no.rc.exec",
  releaseCandidateExecutionEnabled() === false,
  "RC exec off",
);
assertCase(
  "traceability.no.decision.exec",
  releaseDecisionExecutionEnabled() === false,
  "Decision exec off",
);

// Gates
assertCase(
  "gates.categories",
  listReleaseGateCategories().length === 10 &&
    listReleaseGateCategories().includes("Final Certification"),
  "10 categories",
);
assertCase(
  "gates.no.criteria",
  concreteGateCriteriaDefined() === false,
  "no criteria",
);
assertCase(
  "gates.no.final.exec",
  finalCertificationGateImplemented() === false,
  "final not implemented",
);
const govEvidence = evidenceForGate(intake.evidence, "Governance");
assertCase("gates.relation", govEvidence.length > 0, "Governance consumers");

// Index
const index = createEvidenceIndex(intake.evidence, intake.exceptions);
const answers = index.answerQueries();
assertCase(
  "index.exists",
  answers.whatExists.length === intake.evidence.length,
  String(answers.whatExists.length),
);
assertCase(
  "index.owners",
  answers.owners[String(asReleaseEvidenceId("baseline:DATA"))] === "DATA",
  "DATA owner",
);
assertCase(
  "index.not.definitive",
  isDefinitiveReleaseEvidenceIndex(index) === false,
  "architecture only",
);

// Certification boundary
assertCase(
  "boundary.invariant",
  CERTIFICATION_BOUNDARY_INVARIANT.includes("≠"),
  CERTIFICATION_BOUNDARY_INVARIANT,
);
assertCase(
  "boundary.no.global.claim",
  p1ClaimsGlobalReleaseCertification() === false,
  "no global claim",
);
assertCase(
  "boundary.acceptance.ne.prod",
  evidenceAcceptanceAuthorizesProductionRelease() === false,
  "acceptance ≠ production",
);

// Governance immutability markers
assertCase(
  "governance.no.ownership.transfer",
  requestTransfersPeerOwnership() === false,
  "no transfer",
);
assertCase(
  "governance.must.not.silent.pass",
  releaseMustNot("SILENT_PASS_FOR_MISSING") === true,
  "must not silent pass",
);

// Provenance draft
const draft = createDecisionProvenanceDraft({
  evaluatedIdentity: "not-a-release",
  consumedEvidenceIds: [],
  gatesEvaluated: ["Governance"],
  acceptedEvidenceIds: [],
  rejectedEvidenceIds: [],
  limitations: [],
  authorityPath: "RELEASE-P1",
  productVersionIdentity: "n/a",
});
assertCase(
  "provenance.draft.not.executed",
  draft.decision === "NOT_EXECUTED_IN_P1",
  draft.decision,
);

// Supports pass helper on accepted good record
const okRecord = {
  ...sample,
  lifecycleState: "ACCEPTED" as const,
  validationOutcome: "PASS" as const,
  trustClass: "AUTHORITATIVE" as const,
};
assertCase("trust.ok.pass", recordSupportsPass(okRecord) === true, "authoritative pass");

// P0 frozen (file exists; content not rewritten by checking motto phrase)
const p0 = readFileSync(
  join(
    repoRoot,
    "docs/RELEASE/official-records/RELEASE-P0-Constitution-and-Domain-Baseline.md",
  ),
  "utf8",
);
assertCase(
  "p0.frozen.marker",
  p0.includes("RELEASE CERTIFIED / FROZEN") &&
    p0.includes("Consolidate without replacing"),
  "P0 present",
);

// No P2–P11 ladder invented in src
const allReleaseText = tsFiles.map((f) => readFileSync(f, "utf8")).join("\n");
assertCase(
  "no.p2.p11.ladder",
  !/RELEASE-P1[1-9]|RELEASE-P2[0-9]|P2–P11 ladder/.test(allReleaseText),
  "no ladder",
);

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  const mark = r.pass ? "PASS" : "FAIL";
  console.log(`${mark}  ${r.id} — ${r.detail}`);
}
console.log("");
console.log(
  `RELEASE-P1 validation: ${results.length - failed.length}/${results.length} passed`,
);
if (failed.length > 0) {
  console.error("FAILED:");
  for (const f of failed) console.error(`  - ${f.id}: ${f.detail}`);
  process.exit(1);
}
console.log("RELEASE-P1 — CERTIFIED / FROZEN");
console.log("P1 CERTIFICATION — CERTIFIED / FROZEN");
console.log("Product Release — NOT AUTHORIZED");
