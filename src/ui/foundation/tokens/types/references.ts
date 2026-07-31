/**
 * Typed token references.
 *
 * Semantic tokens point at primitive paths via TokenRef.
 * No hex/rgb values live in semantic layers.
 */

export const TOKEN_REF_BRAND = "TokenRef" as const;

export type TokenRef<TPath extends string = string> = {
  readonly __brand: typeof TOKEN_REF_BRAND;
  readonly path: TPath;
};

/** Create a branded reference to a primitive token path (e.g. `color.slate.50`). */
export function createTokenRef<TPath extends string>(
  path: TPath,
): TokenRef<TPath> {
  return { __brand: TOKEN_REF_BRAND, path };
}

export function isTokenRef(value: unknown): value is TokenRef {
  return (
    typeof value === "object" &&
    value !== null &&
    "__brand" in value &&
    (value as TokenRef).__brand === TOKEN_REF_BRAND &&
    typeof (value as TokenRef).path === "string"
  );
}
