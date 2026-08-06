/**
 * DATA-G7 Lifecycle / Validation — Validation before Available/Publication (P5).
 */
import {
  assertCase,
  finishGate,
  fileExists,
  readRel,
  type GateCase,
} from "./lib/data-gate-helpers";
import { LifecycleState } from "../src/data/internal/lifecycle/states";

const results: GateCase[] = [];

assertCase(
  results,
  "g7.states",
  fileExists("src/data/internal/lifecycle/states.ts"),
  "lifecycle states present"
);

assertCase(
  results,
  "g7.transitions",
  fileExists("src/data/internal/lifecycle/transitions.ts"),
  "lifecycle transitions present"
);

assertCase(
  results,
  "g7.validationGate",
  fileExists("src/data/internal/lifecycle/validation-gate.ts"),
  "Validation Gate present"
);

assertCase(
  results,
  "g7.tracker",
  fileExists("src/data/internal/lifecycle/lifecycle-tracker.ts"),
  "LifecycleTracker present"
);

assertCase(
  results,
  "g7.validationEngine",
  fileExists("src/data/validation/validation-engine/ValidationEngine.ts"),
  "ValidationEngine present"
);

const states = Object.values(LifecycleState);
assertCase(
  results,
  "g7.hasAvailable",
  (states as string[]).includes("Available"),
  "Available state present"
);

assertCase(
  results,
  "g7.hasValidated",
  (states as string[]).includes("Validated"),
  "Validated state present"
);

const gateSrc = readRel("src/data/internal/lifecycle/validation-gate.ts");
assertCase(
  results,
  "g7.assertAvailable",
  /assertCanEnterAvailable/.test(gateSrc),
  "Validation Gate enforces Available entry"
);

const tracker = readRel("src/data/internal/lifecycle/lifecycle-tracker.ts");
assertCase(
  results,
  "g7.trackerUsesGate",
  /assertCanEnterAvailable/.test(tracker),
  "LifecycleTracker invokes Validation Gate for Available"
);

const eligibility = readRel(
  "src/data/repository/repository-services/eligibility.ts"
);
assertCase(
  results,
  "g7.publicationEligibility",
  /evaluatePublicationEligibility/.test(eligibility) &&
    /Available/.test(eligibility) &&
    /hasPassed|Validation/.test(eligibility),
  "Publication eligibility requires Available + validation"
);

finishGate("data-g7-lifecycle", results);
