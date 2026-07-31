import { semantic } from "../semantic";

function resolvePath(root: unknown, path: string): unknown {
  const segments = path.split(".").filter(Boolean);
  let current: unknown = root;
  for (const segment of segments) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== "object"
    ) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

/** True when `path` resolves under the semantic token tree. */
export function isSemanticToken(path: string): boolean {
  if (!path || typeof path !== "string") return false;
  return resolvePath(semantic, path) !== undefined;
}
