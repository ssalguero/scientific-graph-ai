/**
 * DATA-G9 Certification Readiness — evidence pack completeness (I10 prep).
 * Does not certify the domain (DATA-I10). Verifies evidence artifacts exist.
 */
import {
  assertCase,
  finishGate,
  fileExists,
  readRel,
  type GateCase,
} from "./lib/data-gate-helpers";
import {
  DATA_QUALITY_GATE_COUNT,
  DATA_QUALITY_GATES,
} from "../src/data/internal/quality-gates";

const results: GateCase[] = [];

assertCase(
  results,
  "g9.gateCount",
  DATA_QUALITY_GATE_COUNT === 9,
  `quality gates registered: ${DATA_QUALITY_GATE_COUNT}`
);

for (const gate of DATA_QUALITY_GATES) {
  assertCase(
    results,
    `g9.gate.${gate.id}`,
    !!gate.npmScript && gate.npmScript.startsWith("validate:data-g"),
    `${gate.id} → ${gate.npmScript}`
  );
}

const evidence = readRel("src/data/hardening/EVIDENCE_PACKAGE.md");
assertCase(
  results,
  "g9.evidenceHasG1",
  /DATA-G1/.test(evidence),
  "evidence package lists G1"
);

assertCase(
  results,
  "g9.evidenceHasG9",
  /DATA-G9/.test(evidence),
  "evidence package lists G9"
);

assertCase(
  results,
  "g9.evidenceZeroFunctional",
  /zero functional|Functional Changes:\s*NONE|no functional/i.test(evidence),
  "evidence asserts zero functional changes"
);

assertCase(
  results,
  "g9.complianceReport",
  fileExists("src/data/ARCHITECTURE_COMPLIANCE_I9.md"),
  "I9 compliance report present"
);

assertCase(
  results,
  "g9.certificationReadiness",
  fileExists("src/data/hardening/CERTIFICATION_READINESS.md"),
  "CERTIFICATION_READINESS.md present for I10"
);

const readiness = readRel("src/data/hardening/CERTIFICATION_READINESS.md");
assertCase(
  results,
  "g9.readinessReadyForI10",
  /Ready for DATA-I10/i.test(readiness) &&
    /Quality Gates PASS/i.test(readiness),
  "readiness report declares gates PASS and Ready for I10"
);

assertCase(
  results,
  "g9.notDomainCertification",
  !/DATA-I10 Status.*CERTIFIED/i.test(
    readRel("src/data/ARCHITECTURE.md")
  ),
  "DATA-I10 not prematurely CERTIFIED"
);

const pkg = readRel("package.json");
assertCase(
  results,
  "g9.aggregateScript",
  /"validate:data"/.test(pkg),
  "validate:data aggregate script present"
);

for (const gate of DATA_QUALITY_GATES) {
  const key = `"${gate.npmScript}"`;
  assertCase(
    results,
    `g9.npm.${gate.id}`,
    pkg.includes(key),
    `${gate.npmScript} in package.json`
  );
}

finishGate("data-g9-certification", results);
