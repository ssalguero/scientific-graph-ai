/**
 * DATA-G5 Ownership — Owns / References / Never Owns map (P6/P8).
 */
import {
  assertCase,
  finishGate,
  fileExists,
  readRel,
  type GateCase,
} from "./lib/data-gate-helpers";
import { DATA_OWNERSHIP_STRATEGY } from "../src/data/internal/registry/ownership";
import { DataOwnerComponent } from "../src/data/internal/registry/roles";

const results: GateCase[] = [];

assertCase(
  results,
  "g5.ownershipModule",
  fileExists("src/data/internal/registry/ownership.ts"),
  "ownership.ts present"
);

assertCase(
  results,
  "g5.escalationModule",
  fileExists("src/data/internal/registry/escalation.ts"),
  "escalation.ts present"
);

const owners = Object.keys(DATA_OWNERSHIP_STRATEGY);
assertCase(
  results,
  "g5.ownerCount",
  owners.length >= 6,
  `ownership records: ${owners.length}`
);

const requiredOwners = [
  DataOwnerComponent.DatasetManager,
  DataOwnerComponent.ScientificModelManager,
  DataOwnerComponent.MetadataManager,
  DataOwnerComponent.ValidationEngine,
  DataOwnerComponent.TransformationEngine,
] as const;

for (const owner of requiredOwners) {
  const rec = DATA_OWNERSHIP_STRATEGY[owner];
  assertCase(
    results,
    `g5.owner.${owner}.present`,
    !!rec,
    `${owner} in ownership map`
  );
  if (rec) {
    assertCase(
      results,
      `g5.owner.${owner}.neverOwns`,
      rec.neverOwns.length > 0 &&
        rec.neverOwns.some((n) => /UI|Product Flows|Persistence/i.test(n)),
      `${owner} Never Owns includes UI/Flows/Persistence class`
    );
  }
}

const esc = readRel("src/data/internal/registry/escalation.ts");
assertCase(
  results,
  "g5.escalationRule",
  /Escalation|escalat/i.test(esc),
  "Ownership Escalation Rule documented in code"
);

finishGate("data-g5-ownership", results);
