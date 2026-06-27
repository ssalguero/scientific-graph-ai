export type DomainValidationIssue = {
  code: string;
  path: string;
  message: string;
  severity: "error" | "warning";
};

export type DomainValidationResult = {
  ok: boolean;
  errors: DomainValidationIssue[];
  warnings: DomainValidationIssue[];
};

export {
  isBoolean,
  isNumber,
  isRecord,
  isString,
  isStringArray,
} from "../guards";

export const pushDomainIssue = (
  target: DomainValidationIssue[],
  item: DomainValidationIssue
) => {
  target.push(item);
};

export const domainIssue = (
  code: string,
  path: string,
  message: string,
  severity: DomainValidationIssue["severity"] = "error"
): DomainValidationIssue => ({
  code,
  path,
  message,
  severity,
});
