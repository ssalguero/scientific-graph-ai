import { isTokenRef, isPrimitiveToken } from "../../foundation/tokens";
import type { ThemeMap } from "../types";

export type ThemeMapIssue = {
  readonly path: string;
  readonly targetPath?: string;
  readonly reason: "not-a-ref" | "missing-primitive" | "hex-literal";
};

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

function walk(
  node: unknown,
  pathPrefix: string,
  issues: ThemeMapIssue[],
): void {
  if (typeof node === "string" && HEX_RE.test(node)) {
    issues.push({ path: pathPrefix, reason: "hex-literal" });
    return;
  }

  if (isTokenRef(node)) {
    if (!isPrimitiveToken(node.path)) {
      issues.push({
        path: pathPrefix,
        targetPath: node.path,
        reason: "missing-primitive",
      });
    }
    return;
  }

  if (node === null || typeof node !== "object") {
    if (pathPrefix && typeof node !== "undefined") {
      // Leaf that is not a TokenRef under themeable trees should not appear
      // (numbers/strings that aren't hex are unexpected in maps).
      if (typeof node === "string" || typeof node === "number") {
        issues.push({ path: pathPrefix, reason: "not-a-ref" });
      }
    }
    return;
  }

  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    // Skip ThemeMap.id
    if (pathPrefix === "" && key === "id") continue;
    const next = pathPrefix ? `${pathPrefix}.${key}` : key;
    walk(value, next, issues);
  }
}

/** Validate a single ThemeMap — refs only, no hex, all resolve. Pure. */
export function validateThemeMap(
  map: ThemeMap,
): readonly ThemeMapIssue[] {
  const issues: ThemeMapIssue[] = [];
  walk(map, "", issues);
  return issues;
}

export function assertThemeMapValid(map: ThemeMap): void {
  const issues = validateThemeMap(map);
  if (issues.length > 0) {
    const detail = issues
      .map(
        (i) =>
          `${i.path}${i.targetPath ? ` → ${i.targetPath}` : ""} (${i.reason})`,
      )
      .join("; ");
    throw new Error(`Invalid ThemeMap (${map.id}): ${detail}`);
  }
}
