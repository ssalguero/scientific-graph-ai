import {
  CURRENT_SCHEMA_VERSION,
  PROJECT_KIND,
  PROJECT_SIZE_WARN_BYTES,
} from "./constants";
import { isNumber, isRecord, isString, issue, pushIssue } from "./guards";
import type {
  ParseProjectFileResult,
  ProjectValidationIssue,
  ScientificProjectFile,
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

  const file: ScientificProjectFile = {
    kind: PROJECT_KIND,
    schemaVersion: parsed.schemaVersion as ScientificProjectFile["schemaVersion"],
    appVersion: parsed.appVersion as string,
    exportedAt: parsed.exportedAt as string,
    project: parsed.project as ScientificProjectFile["project"],
  };

  return { ok: true, file, warnings };
};

export const parseProjectFile = parseProjectJson;
