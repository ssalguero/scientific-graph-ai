/**
 * DATA-G4 API Freeze — Capability Groups / Categories / catalog fidelity (P9).
 */
import {
  assertCase,
  finishGate,
  readRel,
  stripComments,
  type GateCase,
} from "./lib/data-gate-helpers";
import { DATA_PUBLIC_CONTRACT_CATALOG } from "../src/data/contracts/catalog";
import { DataCapabilityGroup } from "../src/data/contracts/capability-groups";
import { DataContractCategory } from "../src/data/contracts/contract-categories";
import { DataSurfaceClass } from "../src/data/contracts/surface";
import {
  DATA_FROZEN_CAPABILITY_GROUPS,
  DATA_FROZEN_CONTRACT_CATEGORIES,
} from "../src/data/internal/boundary-policy";

const results: GateCase[] = [];

const capabilityValues = Object.values(DataCapabilityGroup);
const categoryValues = Object.values(DataContractCategory);

assertCase(
  results,
  "g4.capabilityCount",
  capabilityValues.length === 6,
  `capability groups: ${capabilityValues.length}`
);

assertCase(
  results,
  "g4.capabilitySet",
  DATA_FROZEN_CAPABILITY_GROUPS.every((g) =>
    (capabilityValues as string[]).includes(g)
  ),
  "capability groups match API Freeze"
);

assertCase(
  results,
  "g4.categoryCount",
  categoryValues.length === 6,
  `contract categories: ${categoryValues.length}`
);

assertCase(
  results,
  "g4.categorySet",
  DATA_FROZEN_CONTRACT_CATEGORIES.every((c) =>
    (categoryValues as string[]).includes(c)
  ),
  "contract categories match API Freeze"
);

const nonPublic = DATA_PUBLIC_CONTRACT_CATALOG.filter(
  (e) => e.surfaceClass !== DataSurfaceClass.Public
);
assertCase(
  results,
  "g4.catalogPublic",
  nonPublic.length === 0,
  `catalog all Public (${DATA_PUBLIC_CONTRACT_CATALOG.length})`
);

const factory = stripComments(
  readRel("src/data/integration/public-api-factory.ts")
);
const missing = DATA_PUBLIC_CONTRACT_CATALOG.map((e) => e.id).filter(
  (id) => !factory.includes(id)
);
assertCase(
  results,
  "g4.catalogWired",
  missing.length === 0,
  missing.length === 0
    ? "catalog ids present in public-api-factory"
    : `missing: ${missing.join(", ")}`
);

const barrel = stripComments(readRel("src/data/index.ts"));
assertCase(
  results,
  "g4.barrelNoManagers",
  !/\b(DatasetManager|ScientificModelManager|composeDataDomain)\b/.test(
    barrel
  ),
  "public barrel does not expose managers/composition"
);

assertCase(
  results,
  "g4.configureDataPresent",
  /configureData/.test(barrel) && /getDataApi/.test(barrel),
  "configureData / getDataApi on public barrel"
);

finishGate("data-g4-api-freeze", results);
