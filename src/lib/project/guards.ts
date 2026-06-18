import type { ProjectValidationIssue } from "./types";

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const isString = (value: unknown): value is string =>
  typeof value === "string";

export const isBoolean = (value: unknown): value is boolean =>
  typeof value === "boolean";

export const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

export const isBooleanRecord = (
  value: unknown
): value is Record<string, boolean> =>
  isRecord(value) &&
  Object.values(value).every((item) => typeof item === "boolean");

export const pushIssue = (
  target: ProjectValidationIssue[],
  issue: ProjectValidationIssue
) => {
  target.push(issue);
};

export const issue = (
  code: string,
  path: string,
  message: string,
  severity: ProjectValidationIssue["severity"] = "error"
): ProjectValidationIssue => ({
  code,
  path,
  message,
  severity,
});
