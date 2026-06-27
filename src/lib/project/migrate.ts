import {
  CURRENT_SCHEMA_VERSION,
  SCHEMA_VERSION_V1,
  SCHEMA_VERSION_V2,
} from "./constants";
import {
  migrateDomainProjectFileToV2,
  type DomainMigrationWarning,
} from "./domain";
import {
  fromDomainScientificProjectFile,
  isScientificProjectFileV2,
  toDomainScientificProjectFile,
} from "./adapters/sgproj/envelope";
import { issue, pushIssue } from "./guards";
import { parseProjectJson } from "./parse";
import type {
  MigrateProjectFileResult,
  ProjectValidationIssue,
  ProjectSchemaVersion,
  ScientificProjectFile,
} from "./types";

export const MAX_SUPPORTED_SCHEMA_VERSION = CURRENT_SCHEMA_VERSION;

const mapMigrationWarnings = (
  warnings: DomainMigrationWarning[]
): ProjectValidationIssue[] =>
  warnings.map((item) => ({
    code: item.code,
    path: item.path,
    message: item.message,
    severity: "warning" as const,
  }));

const migrateV1FileToV2 = (
  file: ScientificProjectFile
): { file: ScientificProjectFile; warnings: ProjectValidationIssue[] } => {
  const { file: migrated, warnings } = migrateDomainProjectFileToV2(
    toDomainScientificProjectFile(file)
  );
  return {
    file: fromDomainScientificProjectFile(migrated),
    warnings: mapMigrationWarnings(warnings),
  };
};

const MIGRATORS: Record<
  number,
  (file: ScientificProjectFile) => {
    file: ScientificProjectFile;
    warnings: ProjectValidationIssue[];
  }
> = {
  [SCHEMA_VERSION_V1]: migrateV1FileToV2,
};

export const migrateProjectFile = (
  file: ScientificProjectFile
): MigrateProjectFileResult => {
  const warnings: ProjectValidationIssue[] = [];

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

  if (isScientificProjectFileV2(file)) {
    return { ok: true, file, warnings };
  }

  let current: ScientificProjectFile = file;
  let version: ProjectSchemaVersion = file.schemaVersion;

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
    const result = migrator(current);
    warnings.push(...result.warnings);
    current = result.file;
    version = current.schemaVersion as ProjectSchemaVersion;
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
