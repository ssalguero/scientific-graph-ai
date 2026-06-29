import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  projectDatasetV2ToSessionDataset,
  sessionDatasetToProjectDatasetV2,
} from "../adapters/sgproj/map-session-dataset";
import {
  assertStableDatasetId,
  assertUniquePersistedDatasetIds,
  createPersistedDatasetUuid,
  DatasetIdPolicyError,
  isPersistedDomainDatasetId,
  isPrimaryMigratedDatasetId,
  isSessionRuntimeDatasetId,
  isUuidDatasetId,
  migrateV1ToV2,
  preservePersistedDatasetId,
  toPrimaryDatasetId,
  toSequencedDatasetId,
  type ScientificProjectV1,
} from "../domain";
import type { SessionDataset } from "@/lib/sessionDatasetRegistry";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

const FIXTURES_DIR = join(process.cwd(), "scripts", "fixtures");

const loadV1FixtureProject = (fileName: string): ScientificProjectV1 => {
  const text = readFileSync(join(FIXTURES_DIR, fileName), "utf8");
  const parsed = JSON.parse(text) as { project: ScientificProjectV1 };
  return parsed.project;
};

const buildMinimalSession = (id: string): SessionDataset => ({
  id,
  name: "Dataset.csv",
  importedAt: "2026-06-17T12:00:00.000Z",
  seriesCount: 1,
  observationCount: 1,
  worksheetModified: false,
  datasetPayload: {
    series: [
      {
        id: "s1",
        name: "S1",
        color: "#000",
        points: [{ x: 1, y: 2 }],
      },
    ],
    importReport: null,
  },
});

const expectPolicyError = (
  run: () => unknown,
  code: string
): boolean => {
  try {
    run();
    return false;
  } catch (error) {
    return (
      error instanceof DatasetIdPolicyError && error.code === code
    );
  }
};

export const runDatasetIdPolicyCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  const projectId = "00000000-0000-4000-8000-000000000002";
  const primaryId = toPrimaryDatasetId(projectId);
  const uuidId = "a1b2c3d4-e5f6-4789-a012-3456789abcde";
  const sequencedId = toSequencedDatasetId(projectId, 2);

  assertCase(
    "ids.primary.migratedStable",
    primaryId === `${projectId}::primary` &&
      isPrimaryMigratedDatasetId(primaryId, projectId)
  );
  assertCase(
    "ids.uuid.recognized",
    isUuidDatasetId(uuidId) && isPersistedDomainDatasetId(uuidId)
  );
  assertCase(
    "ids.sequenced.nativeStable",
    sequencedId === `${projectId}::ds-2` &&
      isPersistedDomainDatasetId(sequencedId)
  );
  assertCase(
    "ids.preserve.returnsSamePrimary",
    preservePersistedDatasetId(primaryId) === primaryId
  );
  assertCase(
    "ids.preserve.returnsSameUuid",
    preservePersistedDatasetId(uuidId) === uuidId
  );
  assertCase(
    "ids.runtimePrefix.detected",
    isSessionRuntimeDatasetId("session-ds-123-abc") === true
  );
  assertCase(
    "ids.runtimePrefix.rejectedForPersistence",
    expectPolicyError(
      () => preservePersistedDatasetId("session-ds-123-abc"),
      "DS-ID-RUNTIME-LEAK"
    )
  );
  assertCase(
    "ids.mapper.rejectsRuntimeId",
    expectPolicyError(
      () =>
        sessionDatasetToProjectDatasetV2(
          buildMinimalSession("session-ds-1700000000000-abc123")
        ),
      "DS-ID-RUNTIME-LEAK"
    )
  );

  const primarySession = buildMinimalSession(primaryId);
  const primaryPersisted = sessionDatasetToProjectDatasetV2(primarySession);
  const primaryRoundTrip = projectDatasetV2ToSessionDataset(primaryPersisted);

  assertCase(
    "ids.mapper.primaryRoundTrip.idStable",
    primaryRoundTrip.id === primaryId &&
      primaryPersisted.id === primaryId
  );

  const uuidSession = buildMinimalSession(uuidId);
  const uuidPersisted = sessionDatasetToProjectDatasetV2(uuidSession);
  const uuidRoundTrip = projectDatasetV2ToSessionDataset(uuidPersisted);

  assertCase(
    "ids.mapper.uuidRoundTrip.idStable",
    uuidRoundTrip.id === uuidId && uuidPersisted.id === uuidId
  );

  let multiHopId = primaryId;
  for (let hop = 0; hop < 3; hop += 1) {
    const session = buildMinimalSession(multiHopId);
    multiHopId = sessionDatasetToProjectDatasetV2(session).id;
    multiHopId = projectDatasetV2ToSessionDataset({
      ...primaryPersisted,
      id: multiHopId,
    }).id;
  }

  assertCase(
    "ids.mapper.multiHop.idStable",
    multiHopId === primaryId
  );

  assertCase(
    "ids.stability.assertStablePasses",
    (() => {
      assertStableDatasetId(primaryId, primaryId);
      return true;
    })()
  );
  assertCase(
    "ids.stability.assertStableFailsOnChange",
    expectPolicyError(
      () => assertStableDatasetId(primaryId, uuidId),
      "DS-ID-UNSTABLE"
    )
  );

  assertCase(
    "ids.unique.acceptsDistinctIds",
    (() => {
      assertUniquePersistedDatasetIds([primaryId, sequencedId, uuidId]);
      return true;
    })()
  );
  assertCase(
    "ids.unique.rejectsDuplicateIds",
    expectPolicyError(
      () => assertUniquePersistedDatasetIds([primaryId, primaryId]),
      "DS-ID-DUP"
    )
  );

  const dataset5V1 = loadV1FixtureProject("project-v1-dataset5-minimal.sgproj");
  const migrated = migrateV1ToV2(dataset5V1);
  const migratedPrimaryId = toPrimaryDatasetId(dataset5V1.metadata.id);
  const migratedDataset = migrated.project.datasets[0];

  assertCase(
    "ids.v1Migration.primaryIdPreserved",
    migratedDataset?.id === migratedPrimaryId
  );

  if (migratedDataset) {
    const hydratedSession = projectDatasetV2ToSessionDataset(migratedDataset);
    const rePersisted = sessionDatasetToProjectDatasetV2(hydratedSession);

    assertCase(
      "ids.v1Migration.mapperRoundTrip.idStable",
      rePersisted.id === migratedPrimaryId &&
        hydratedSession.id === migratedPrimaryId
    );
  } else {
    assertCase("ids.v1Migration.mapperRoundTrip.idStable", false);
  }

  const generatedUuid = createPersistedDatasetUuid();
  assertCase(
    "ids.createUuid.isPersistedDomainId",
    isUuidDatasetId(generatedUuid) &&
      isPersistedDomainDatasetId(generatedUuid) &&
      !isSessionRuntimeDatasetId(generatedUuid)
  );

  return results;
};

export const runDatasetIdPolicyAndMapCaseSuite = (): CaseResult[] => [
  ...runDatasetIdPolicyCaseSuite(),
];
