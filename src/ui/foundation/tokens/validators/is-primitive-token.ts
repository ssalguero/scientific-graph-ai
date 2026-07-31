import { primitive } from "../primitive";

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

/** True when `path` resolves to a leaf (or node) under the primitive token tree. */
export function isPrimitiveToken(path: string): boolean {
  if (!path || typeof path !== "string") return false;
  return resolvePath(primitive, path) !== undefined;
}

export { resolvePath as resolvePrimitivePath };
