/**
 * Pure orchestrator — never throws; never imports validators/ directly.
 * All validation goes through runtime/adapters/.
 */
import { isThemeId } from "../ids";
import type { ThemeMap } from "../types";
import {
  adaptValidateAllThemes,
  adaptValidateSemanticReferences,
  adaptValidateThemeMap,
} from "./adapters";
import type { ThemeWarning } from "./ThemeWarnings";

export interface ThemeErrorInfo {
  readonly code: string;
  readonly message: string;
}

export interface ThemeValidationResult {
  readonly valid: boolean;
  readonly warnings: ThemeWarning[];
  readonly errors: ThemeErrorInfo[];
}

function emptyResult(): {
  warnings: ThemeWarning[];
  errors: ThemeErrorInfo[];
} {
  return { warnings: [], errors: [] };
}

function finalize(
  warnings: ThemeWarning[],
  errors: ThemeErrorInfo[],
): ThemeValidationResult {
  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}

function mapIssueReason(reason: string): string {
  switch (reason) {
    case "hex-literal":
      return "hex-literal";
    case "missing-primitive":
      return "missing-primitive";
    case "not-a-ref":
      return "not-a-ref";
    default:
      return reason;
  }
}

/** Validate a single ThemeMap (themeable domains only via existing map validator). */
export function validateTheme(map: ThemeMap): ThemeValidationResult {
  const { warnings, errors } = emptyResult();

  if (!map || typeof map !== "object") {
    errors.push({
      code: "invalid-definition",
      message: "Theme map is missing or not an object.",
    });
    return finalize(warnings, errors);
  }

  if (!isThemeId(map.id)) {
    errors.push({
      code: "unknown-theme-id",
      message: `Unknown or invalid theme id: "${String(map.id)}".`,
    });
  }

  if (map.color === undefined) {
    errors.push({
      code: "missing-themeable-domain",
      message: 'Themeable domain "color" is required.',
    });
  }
  if (map.focus === undefined) {
    errors.push({
      code: "missing-themeable-domain",
      message: 'Themeable domain "focus" is required.',
    });
  }
  if (map.elevation === undefined) {
    errors.push({
      code: "missing-themeable-domain",
      message: 'Themeable domain "elevation" is required.',
    });
  }

  if (map.color && map.focus && map.elevation) {
    for (const issue of adaptValidateThemeMap(map)) {
      const target = issue.targetPath ? ` → ${issue.targetPath}` : "";
      errors.push({
        code: mapIssueReason(issue.reason),
        message: `${issue.path}${target} (${issue.reason})`,
      });
    }
  }

  return finalize(warnings, errors);
}

/** Validate all registered SSOT themes + foundation semantic refs via adapters. */
export function validateThemeCatalog(): ThemeValidationResult {
  const { warnings, errors } = emptyResult();

  for (const issue of adaptValidateAllThemes()) {
    if (issue.kind === "missing-theme") {
      errors.push({
        code: "missing-theme",
        message: `Theme "${issue.id}" is missing from the catalog.`,
      });
      continue;
    }
    if (issue.kind === "map") {
      const target = issue.issue.targetPath
        ? ` → ${issue.issue.targetPath}`
        : "";
      errors.push({
        code: mapIssueReason(issue.issue.reason),
        message: `[${issue.id}] ${issue.issue.path}${target} (${issue.issue.reason})`,
      });
      continue;
    }
    if (issue.kind === "light-semantic-mismatch") {
      errors.push({
        code: "light-semantic-mismatch",
        message: `${issue.path}: ${issue.detail}`,
      });
    }
  }

  for (const issue of adaptValidateSemanticReferences()) {
    errors.push({
      code: issue.reason,
      message: `${issue.semanticPath} → ${issue.targetPath} (${issue.reason})`,
    });
  }

  return finalize(warnings, errors);
}
