import {
  PROJECT_KIND,
  PROJECT_SIZE_WARN_BYTES,
  SCHEMA_VERSION_V1,
  SCHEMA_VERSION_V2,
} from "./constants";
import { isNumber, isRecord, isString, issue, pushIssue } from "./guards";
import type {
  ParseProjectFileResult,
  ProjectValidationIssue,
  ScientificProjectFile,
  ScientificProjectFileV1,
  ScientificProjectFileV2,
  ScientificProjectV1,
  ScientificProjectV2,
} from "./types";

export const parseProjectJson = (text: string): ParseProjectFileResult => {
  const warnings: ProjectValidationIssue[] = [];

  if (text.length > PROJECT_SIZE_WARN_BYTES) {
    pushIssue(
      warnings,
      issue(
        "P-SIZE",
        "$",
        `Project file exceeds ${PROJECT_SIZE_WARN_BYTES} bytes`,
        "warning"
      )
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    return {
      ok: false,
      errors: [
        issue(
          "P-JSON",
          "$",
          error instanceof Error ? error.message : "Invalid JSON"
        ),
      ],
    };
  }

  return parseProjectUnknown(parsed, warnings);
};

export const parseProjectUnknown = (
  parsed: unknown,
  warnings: ProjectValidationIssue[] = []
): ParseProjectFileResult => {
  const errors: ProjectValidationIssue[] = [];

  if (!isRecord(parsed)) {
    return {
      ok: false,
      errors: [issue("P-ROOT", "$", "Project file root must be an object")],
    };
  }

  if (parsed.kind !== PROJECT_KIND) {
    pushIssue(
      errors,
      issue("P-KIND", "kind", `Expected kind "${PROJECT_KIND}"`, "error")
    );
  }

  if (!isNumber(parsed.schemaVersion)) {
    pushIssue(
      errors,
      issue("P-SCHEMA", "schemaVersion", "schemaVersion must be a number")
    );
  }

  if (!isString(parsed.appVersion) || parsed.appVersion.trim() === "") {
    pushIssue(errors, issue("P-APP", "appVersion", "appVersion is required"));
  }

  if (!isString(parsed.exportedAt) || parsed.exportedAt.trim() === "") {
    pushIssue(
      errors,
      issue("P-EXPORTED", "exportedAt", "exportedAt is required")
    );
  }

  if (!isRecord(parsed.project)) {
    pushIssue(
      errors,
      issue("P-PROJECT", "project", "project must be an object")
    );
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const schemaVersion = parsed.schemaVersion;
  const envelope = {
    kind: PROJECT_KIND,
    appVersion: parsed.appVersion as string,
    exportedAt: parsed.exportedAt as string,
  };

  let file: ScientificProjectFile;
  if (schemaVersion === SCHEMA_VERSION_V2) {
    file = {
      ...envelope,
      schemaVersion: SCHEMA_VERSION_V2,
      project: parsed.project as ScientificProjectV2,
    } satisfies ScientificProjectFileV2;
  } else if (schemaVersion === SCHEMA_VERSION_V1) {
    file = {
      ...envelope,
      schemaVersion: SCHEMA_VERSION_V1,
      project: parsed.project as ScientificProjectV1,
    } satisfies ScientificProjectFileV1;
  } else {
    file = {
      ...envelope,
      schemaVersion: schemaVersion as ScientificProjectFile["schemaVersion"],
      project: parsed.project as ScientificProjectV1,
    } as ScientificProjectFile;
  }

  return { ok: true, file, warnings };
};

export const parseProjectFile = parseProjectJson;
