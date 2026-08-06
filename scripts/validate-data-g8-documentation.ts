/**
 * DATA-G8 Documentation — freeze docs present and non-contradictory.
 */
import {
  assertCase,
  finishGate,
  fileExists,
  readRel,
  type GateCase,
} from "./lib/data-gate-helpers";

const results: GateCase[] = [];

const requiredDocs = [
  "src/data/ARCHITECTURE.md",
  "src/data/BOUNDARY_ENFORCEMENT.md",
  "src/data/RUNTIME_ENFORCEMENT_GUARANTEES.md",
  "src/data/BOUNDARY_CLEANUP.md",
  "src/data/hardening/QUALITY_GATES.md",
  "src/data/hardening/EVIDENCE_PACKAGE.md",
  "src/data/hardening/HARDENING_DIAGNOSTICS.md",
  "src/data/hardening/CERTIFICATION_READINESS.md",
  "src/data/ARCHITECTURE_COMPLIANCE_I9.md",
] as const;

for (const doc of requiredDocs) {
  assertCase(
    results,
    `g8.doc.${doc.split("/").pop()}`,
    fileExists(doc),
    `${doc} present`
  );
}

const arch = readRel("src/data/ARCHITECTURE.md");
assertCase(
  results,
  "g8.archHonorsFreeze",
  /Architecture Freeze/i.test(arch) && /API Freeze/i.test(arch),
  "ARCHITECTURE.md references Architecture + API Freeze"
);

assertCase(
  results,
  "g8.noRedefineFreeze",
  !/Architecture Freeze\s+is\s+revoked|API Freeze\s+is\s+revoked/i.test(arch),
  "ARCHITECTURE.md does not revoke freezes"
);

const qg = readRel("src/data/hardening/QUALITY_GATES.md");
assertCase(
  results,
  "g8.gatesDocumented",
  /DATA-G1/.test(qg) &&
    /DATA-G9/.test(qg) &&
    /validate:data/.test(qg),
  "QUALITY_GATES.md documents G1–G9 and aggregate"
);

assertCase(
  results,
  "g8.i8CertifiedMention",
  /DATA-I8/.test(arch) && /CERTIFIED/i.test(arch),
  "ARCHITECTURE.md retains I8 CERTIFIED lineage"
);

finishGate("data-g8-documentation", results);
