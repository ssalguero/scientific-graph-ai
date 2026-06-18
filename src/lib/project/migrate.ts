import { CURRENT_SCHEMA_VERSION } from "./constants";
import { issue, pushIssue } from "./guards";
import { parseProjectJson } from "./parse";
import type {
  MigrateProjectFileResult,
  ProjectValidationIssue,
  ScientificProjectFile,
} from "./types";

export const MAX_SUPPORTED_SCHEMA_VERSION = CURRENT_SCHEMA_VERSION;

const identityMigrateV1 = (file: ScientificProjectFile): ScientificProjectFile =>
  file;

const MIGRATORS: Record<
  number,
  (file: ScientificProjectFile) => ScientificProjectFile
> = {
  1: identityMigrateV1,
};

export const migrateProjectFile = (
  file: ScientificProjectFile
): MigrateProjectFileResult => {
  const warnings: ProjectValidationIssue[] = [];
  const errors: ProjectValidationIssue[] = [];

  if (file.schemaVersion > MAX_SUPPORTED_SCHEMA_VERSION) {
    return {
      ok: false,
      errors: [
        issue(
          "M-UNSUPPORTED",
          "schemaVersion",
          `Schema version ${file.schemaVersion} is newer than supported version ${MAX_SUPPORTED_SCHEMA_VERSION}. Update the application.`
        ),
      ],
    };
  }

  let current: ScientificProjectFile = file;
  let version = file.schemaVersion;

  while (version < MAX_SUPPORTED_SCHEMA_VERSION) {
    const migrator = MIGRATORS[version];
    if (!migrator) {
      return {
        ok: false,
        errors: [
          issue(
            "M-MISSING",
            "schemaVersion",
            `No migrator from version ${version} to ${version + 1}`
          ),
        ],
      };
    }
    const nextVersion = (version + 1) as ScientificProjectFile["schemaVersion"];
    current = {
      ...migrator(current),
      schemaVersion: nextVersion,
    };
    version = nextVersion;
  }

  return { ok: true, file: current, warnings };
};

export const migrateProjectJson = (text: string): MigrateProjectFileResult => {
  const parsed = parseProjectJson(text);
  if (!parsed.ok) {
    return { ok: false, errors: parsed.errors };
  }

  return migrateProjectFile(parsed.file);
};
