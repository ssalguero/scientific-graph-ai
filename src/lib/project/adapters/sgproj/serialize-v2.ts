import { migrateV1ToV2 } from "../../domain";
import type {
  ProjectValidationIssue,
  ScientificProjectFileV2,
  ScientificProjectV1,
} from "../../types";

import { buildSgprojEnvelope } from "./envelope";

export const snapshotV1ToProjectV2 = (
  snapshot: ScientificProjectV1,
  options?: { migratedAt?: string }
) => migrateV1ToV2(snapshot, options).project;

export const buildScientificProjectFileV2 = (input: {
  project: ScientificProjectV1;
  appVersion: string;
  exportedAt: string;
}): {
  file: ScientificProjectFileV2;
  warnings: ProjectValidationIssue[];
} => {
  const { project, warnings } = migrateV1ToV2(input.project, {
    migratedAt: input.exportedAt,
  });

  const domainWarnings: ProjectValidationIssue[] = warnings.map((item) => ({
    code: item.code,
    path: item.path,
    message: item.message,
    severity: "warning" as const,
  }));

  const file = buildSgprojEnvelope({
    schemaVersion: 2,
    appVersion: input.appVersion,
    exportedAt: input.exportedAt,
    project,
  }) as ScientificProjectFileV2;

  return {
    file,
    warnings: domainWarnings,
  };
};
