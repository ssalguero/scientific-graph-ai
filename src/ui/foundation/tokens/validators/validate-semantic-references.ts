import { semantic } from "../semantic";
import { isTokenRef } from "../types/references";
import { isPrimitiveToken } from "./is-primitive-token";

export type SemanticReferenceIssue = {
  readonly semanticPath: string;
  readonly targetPath: string;
  readonly reason: "missing-primitive" | "not-a-ref";
};

function walk(
  node: unknown,
  pathPrefix: string,
  issues: SemanticReferenceIssue[],
): void {
  if (isTokenRef(node)) {
    if (!isPrimitiveToken(node.path)) {
      issues.push({
        semanticPath: pathPrefix,
        targetPath: node.path,
        reason: "missing-primitive",
      });
    }
    return;
  }

  if (node === null || typeof node !== "object") {
    return;
  }

  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    const next = pathPrefix ? `${pathPrefix}.${key}` : key;
    walk(value, next, issues);
  }
}

/**
 * Walks all semantic tokens and ensures every TokenRef resolves to a primitive.
 * Pure — does not throw; returns issue list (empty = valid).
 */
export function validateSemanticReferences(): readonly SemanticReferenceIssue[] {
  const issues: SemanticReferenceIssue[] = [];
  walk(semantic, "", issues);
  return issues;
}

export function assertSemanticReferencesValid(): void {
  const issues = validateSemanticReferences();
  if (issues.length > 0) {
    const detail = issues
      .map(
        (issue) =>
          `${issue.semanticPath} → ${issue.targetPath} (${issue.reason})`,
      )
      .join("; ");
    throw new Error(`Invalid semantic token references: ${detail}`);
  }
}
