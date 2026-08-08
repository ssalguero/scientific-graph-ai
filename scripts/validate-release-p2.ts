/**
 * RELEASE-P2 — Readiness & Gate Architecture validation gate.
 *
 * Authority: RELEASE-P2-Planning-Certification.md
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  RELEASE_P2_STATUS,
  RELEASE_P2_CERTIFICATION_STATUS,
  RELEASE_READINESS_STATES,
  RELEASE_GATE_IDS,
  RELEASE_GATE_STATES,
  selectAcceptedEvidenceForReadiness,
  assertAcceptedOnly,
  assessReleaseReadiness,
  readinessImpliesReleaseCertification,
  concreteReadinessThresholdsDefined,
  readyImpliesCertified,
  RELEASE_READY_BOUNDARY_INVARIANT,
  warningSilentlyBecomesPass,
  propagateEvidenceToReadiness,
  listGateDescriptors,
  concreteGateThresholdsDefined,
  defaultFinalCertificationDependencies,
  validateGateDependencies,
  detectGateDependencyCycle,
  finalCertificationDependsOnCategories,
  productionReleaseDependencyAllowed,
  createGateResult,
  gatePassImpliesGlobalCertification,
  createReleaseWaiver,
  waiverRequiresProvenance,
  listReadinessTraceabilityChain,
  futureReleaseCandidatePromotionEnabled,
  releaseCandidatePromotionImplemented,
  createReadinessDecisionProvenanceDraft,
  createReadinessSummaryView,
  isDefinitiveReadinessSummary,
  asReleaseEvidenceId,
  normalizeEvidenceInput,
  createReleaseException,
  CROSS_DOMAIN_BASELINE_FACTS,
  listEvidencePathGaps,
  missingEvidenceBecomesPass,
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

const REQUIRED_FILES = [
  "docs/RELEASE/official-records/RELEASE-P2-Planning-Certification.md",
  "src/release/readiness/vocabulary.ts",
  "src/release/readiness/inputs.ts",
  "src/release/readiness/assessment.ts",
  "src/release/readiness/blocking.ts",
  "src/release/gates/catalog.ts",
  "src/release/gates/dependencies.ts",
  "src/release/gates/results.ts",
  "src/release/gates/waivers.ts",
  "docs/RELEASE/implementation/RELEASE-P2-Readiness-and-Gate-Architecture.md",
];

for (const rel of REQUIRED_FILES) {
  assertCase(`layout.${rel}`, existsSync(join(repoRoot, rel)), "present");
}

assertCase(
  "p2.status",
  RELEASE_P2_STATUS === "CERTIFIED_FROZEN",
  RELEASE_P2_STATUS,
);
assertCase(
  "p2.cert.claimed",
  RELEASE_P2_CERTIFICATION_STATUS === "CERTIFIED_FROZEN",
  RELEASE_P2_CERTIFICATION_STATUS,
);

assertCase(
  "readiness.vocab",
  RELEASE_READINESS_STATES.length === 4 &&
    RELEASE_READINESS_STATES.includes("READY") &&
    RELEASE_READINESS_STATES.includes("PENDING"),
  RELEASE_READINESS_STATES.join(","),
);

assertCase("gates.count", RELEASE_GATE_IDS.length === 10, String(RELEASE_GATE_IDS.length));
assertCase(
  "gates.final",
  RELEASE_GATE_IDS.includes("FINAL_CERTIFICATION"),
  "FINAL_CERTIFICATION",
);
assertCase(
  "gate.states",
  RELEASE_GATE_STATES.includes("WAIVED") && RELEASE_GATE_STATES.length === 6,
  RELEASE_GATE_STATES.join(","),
);

const accepted = normalizeEvidenceInput({
  id: asReleaseEvidenceId("e-acc"),
  source: "t",
  artifact: "a",
  evidenceClass: "TEST",
  originatingDomain: "DATA",
  owningDomain: "DATA",
  certificationRelationship: "t",
  freshness: { versionLabel: "1", isCurrent: true },
  provenance: { producedBy: "t", authorityPath: "t", recordedAt: "2026-08-08" },
  scope: "t",
  dependencyIds: [],
  limitations: [],
  blocking: { contributes: false },
  gateCategories: ["Functional"],
  lifecycleState: "ACCEPTED",
  validationOutcome: "PASS",
  trustClass: "AUTHORITATIVE",
});
const validatedOnly = { ...accepted, id: asReleaseEvidenceId("e-val"), lifecycleState: "VALIDATED" as const };

assertCase(
  "accepted.only.filter",
  selectAcceptedEvidenceForReadiness([accepted, validatedOnly]).length === 1,
  "filter",
);
assertCase(
  "accepted.only.assert",
  assertAcceptedOnly([validatedOnly]).ok === false,
  "reject VALIDATED",
);

const assessment = assessReleaseReadiness({
  acceptedEvidence: [accepted],
  exceptions: [],
});
assertCase(
  "readiness.pending.no.threshold",
  assessment.state === "PENDING" && concreteReadinessThresholdsDefined() === false,
  assessment.state,
);
assertCase(
  "readiness.ne.cert",
  readinessImpliesReleaseCertification() === false &&
    readyImpliesCertified() === false &&
    assessment.impliesReleaseCertification === false,
  RELEASE_READY_BOUNDARY_INVARIANT,
);

const blockerEx = createReleaseException({
  severity: "BLOCKER",
  kind: "MISSING_EVIDENCE",
  message: "missing",
  relatedEvidenceIds: [],
  open: true,
});
const blocked = assessReleaseReadiness({
  acceptedEvidence: [accepted],
  exceptions: [blockerEx],
});
assertCase("readiness.blocked", blocked.state === "BLOCKED", blocked.state);

assertCase("warning.ne.pass", warningSilentlyBecomesPass() === false, "false");
assertCase("missing.ne.pass", missingEvidenceBecomesPass() === false, "false");

const propagated = propagateEvidenceToReadiness([blockerEx], "GOVERNANCE");
assertCase(
  "blocker.propagation",
  propagated.some((b) => b.layer === "READINESS"),
  "EVIDENCE→GATE→READINESS",
);

assertCase(
  "gate.descriptors",
  listGateDescriptors().length === 10,
  "10",
);
assertCase(
  "gate.no.thresholds",
  concreteGateThresholdsDefined() === false,
  "false",
);

const edges = defaultFinalCertificationDependencies();
assertCase(
  "deps.final",
  finalCertificationDependsOnCategories(edges) === true,
  "FINAL depends on categories",
);
assertCase(
  "deps.valid",
  validateGateDependencies(edges).ok === true,
  "acyclic",
);
assertCase(
  "deps.no.prod",
  productionReleaseDependencyAllowed() === false,
  "false",
);

const cycleEdges = [
  ...edges,
  { from: "FUNCTIONAL" as const, to: "FINAL_CERTIFICATION" as const, kind: "REQUIRES_GATE" as const },
  {
    from: "FINAL_CERTIFICATION" as const,
    to: "FUNCTIONAL" as const,
    kind: "REQUIRES_GATE" as const,
  },
];
// Actually FINAL already depends on FUNCTIONAL; adding FUNCTIONAL→FINAL creates cycle
const cycleOnly = [
  { from: "FUNCTIONAL" as const, to: "ARCHITECTURAL" as const, kind: "REQUIRES_GATE" as const },
  { from: "ARCHITECTURAL" as const, to: "FUNCTIONAL" as const, kind: "REQUIRES_GATE" as const },
];
assertCase(
  "deps.cycle.reject",
  detectGateDependencyCycle(cycleOnly) !== null &&
    validateGateDependencies(cycleOnly).ok === false,
  "cycle rejected",
);

const gateResult = createGateResult({
  gateId: "FUNCTIONAL",
  state: "PASS",
  acceptedEvidence: [accepted],
});
assertCase(
  "gate.trace",
  gateResult.evidenceTrace.evidenceIds.length === 1,
  "evidence linked",
);
assertCase(
  "gate.pass.ne.global",
  gatePassImpliesGlobalCertification() === false,
  "false",
);

const waiver = createReleaseWaiver({
  authorityPath: "RELEASE governance",
  supportingEvidenceIds: [accepted.id],
  scope: "test",
  effectOnReadiness: "NO_CHANGE",
});
assertCase(
  "waiver.semantics",
  waiver.organizationalRoleInvented === false &&
    waiver.auditable === true &&
    waiverRequiresProvenance(waiver),
  "RELEASE authority",
);

assertCase(
  "traceability.chain",
  listReadinessTraceabilityChain()[0] === "Domain" &&
    listReadinessTraceabilityChain().includes("FutureReleaseCandidate"),
  "chain",
);
assertCase(
  "no.rc.promotion",
  futureReleaseCandidatePromotionEnabled() === false &&
    releaseCandidatePromotionImplemented() === false,
  "false",
);

const draft = createReadinessDecisionProvenanceDraft({
  evaluatedEvidenceIds: [accepted.id],
  evaluatedGateIds: ["FUNCTIONAL"],
  blockerIds: [],
  warningIds: [],
  acceptedExceptionIds: [],
  resultingReadinessState: "PENDING",
  productVersionIdentity: "n/a",
  evaluatedIdentity: "n/a",
});
assertCase(
  "provenance.draft",
  draft.decision === "NOT_EXECUTED_IN_P2",
  draft.decision,
);

const summary = createReadinessSummaryView({
  readinessState: "PENDING",
  supportingEvidenceIds: [accepted.id],
  gateResults: [gateResult],
  warnings: [],
  blockers: [],
  limitations: [],
  contributingDomains: ["DATA"],
  remainingRequirements: ["thresholds deferred"],
});
assertCase(
  "summary.not.definitive",
  summary.definitiveArtifact === false &&
    isDefinitiveReadinessSummary(summary) === false,
  "architecture only",
);

// Baseline preserved
assertCase(
  "baseline.engine.gap",
  listEvidencePathGaps().some((f) => f.domain === "ENGINE"),
  "ENGINE gap",
);
assertCase(
  "baseline.peers",
  CROSS_DOMAIN_BASELINE_FACTS.length === 7,
  String(CROSS_DOMAIN_BASELINE_FACTS.length),
);

// Boundaries
const PEER_IMPORT_RE =
  /from\s+["']@\/(engine|data|ai|ui|plugins|performance|collab|components|app)(\/|["'])/;
let peerHits = 0;
for (const file of collectTsFiles(releaseDir)) {
  if (PEER_IMPORT_RE.test(readFileSync(file, "utf8"))) {
    peerHits += 1;
    assertCase(`peer.import.${relFromRepo(file)}`, false, "forbidden");
  }
}
assertCase("no.peer.imports", peerHits === 0, "0");
assertCase(
  "public.import",
  isAllowedReleasePublicImport("@/release") &&
    isForbiddenReleasePeerImport("@/engine"),
  "ok",
);

let peerDepends = 0;
for (const root of ["src/engine", "src/data", "src/ai", "src/ui", "src/plugins", "src/performance"]) {
  const abs = join(repoRoot, root);
  if (!existsSync(abs)) continue;
  for (const file of collectTsFiles(abs)) {
    if (/from\s+["']@\/release/.test(readFileSync(file, "utf8"))) {
      peerDepends += 1;
    }
  }
}
assertCase("no.circular.peers", peerDepends === 0, "peers immutable imports");

const p2plan = readFileSync(
  join(repoRoot, "docs/RELEASE/official-records/RELEASE-P2-Planning-Certification.md"),
  "utf8",
);
assertCase(
  "p1.compat.cited",
  p2plan.includes("D-P2-19") && p2plan.includes("ACCEPTED"),
  "planning contract",
);

assertCase(
  "no.thresholds",
  concreteReadinessThresholdsDefined() === false &&
    concreteGateThresholdsDefined() === false,
  "none",
);

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.id} — ${r.detail}`);
}
console.log("");
console.log(
  `RELEASE-P2 validation: ${results.length - failed.length}/${results.length} passed`,
);
if (failed.length > 0) {
  for (const f of failed) console.error(`  - ${f.id}: ${f.detail}`);
  process.exit(1);
}
console.log("RELEASE-P2 — CERTIFIED / FROZEN");
console.log("P2 CERTIFICATION — CERTIFIED / FROZEN");
console.log("Product Release — NOT AUTHORIZED");
