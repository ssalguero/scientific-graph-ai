/**
 * Internal assertions — throw ThemeErrors only.
 * Package-internal; never reexported from @/ui.
 */
import {
  isPrimitiveToken,
  isSemanticToken,
  isTokenRef,
  semantic,
  type TokenRef,
} from "../../foundation/tokens";
import { isThemeId } from "../ids";
import type { ThemeMap } from "../types";
import {
  InvalidThemeDefinitionError,
  ThemeContractError,
  ThemeVariableError,
  UnknownThemeError,
} from "./ThemeErrors";
import { validateTheme, validateThemeCatalog } from "./ThemeValidator";

function formatResultErrors(
  errors: readonly { code: string; message: string }[],
): string {
  return errors.map((e) => `${e.code}: ${e.message}`).join("; ");
}

/** Assert a ThemeMap is valid (themeable domains). */
export function assertTheme(map: ThemeMap): void {
  if (!map || typeof map !== "object") {
    throw new InvalidThemeDefinitionError(
      "Theme map is missing or not an object.",
    );
  }
  if (!isThemeId(map.id)) {
    throw new UnknownThemeError(String(map.id));
  }
  const result = validateTheme(map);
  if (!result.valid) {
    throw new InvalidThemeDefinitionError(formatResultErrors(result.errors));
  }
}

/** Assert a token path exists as primitive or semantic, or a TokenRef is well-formed. */
export function assertToken(token: string | TokenRef): void {
  if (isTokenRef(token)) {
    if (!isPrimitiveToken(token.path)) {
      throw new ThemeVariableError(
        `TokenRef path "${token.path}" does not resolve to a primitive token.`,
      );
    }
    return;
  }
  if (typeof token !== "string" || token.length === 0) {
    throw new ThemeVariableError("Token path must be a non-empty string.");
  }
  if (!isPrimitiveToken(token) && !isSemanticToken(token)) {
    throw new ThemeVariableError(
      `Unknown token path "${token}" (neither primitive nor semantic).`,
    );
  }
}

/** Assert foundation + catalog semantic integrity via ThemeValidator. */
export function assertSemantic(): void {
  const result = validateThemeCatalog();
  if (!result.valid) {
    throw new ThemeContractError(formatResultErrors(result.errors));
  }
}

/** Assert the color domain of a ThemeMap is present and the map validates. */
export function assertColor(map: ThemeMap): void {
  if (!map?.color) {
    throw new InvalidThemeDefinitionError(
      'Themeable domain "color" is required.',
    );
  }
  const result = validateTheme(map);
  const colorErrors = result.errors.filter(
    (e) =>
      e.code === "missing-themeable-domain" ||
      e.message.includes("color.") ||
      e.message.startsWith("color"),
  );
  if (colorErrors.length > 0) {
    throw new InvalidThemeDefinitionError(formatResultErrors(colorErrors));
  }
  if (!result.valid) {
    throw new InvalidThemeDefinitionError(formatResultErrors(result.errors));
  }
}

/**
 * Assert Foundation semantic typography completeness (invariant — not a ThemeMap field).
 */
export function assertTypography(): void {
  const typography = semantic.typography;
  if (!typography || typeof typography !== "object") {
    throw new ThemeContractError("Foundation semantic.typography is missing.");
  }

  const result = validateThemeCatalog();
  const typographyErrors = result.errors.filter((e) =>
    e.message.startsWith("typography."),
  );
  if (typographyErrors.length > 0) {
    throw new ThemeContractError(formatResultErrors(typographyErrors));
  }
}
