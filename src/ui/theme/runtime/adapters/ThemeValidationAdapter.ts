/**
 * Validation adapters — UX-3.2 extension seam.
 * Thin delegation to existing validators only. No rule duplication.
 */
import { validateSemanticReferences } from "../../../foundation/tokens";
import type { SemanticReferenceIssue } from "../../../foundation/tokens";
import {
  validateAllThemes,
  validateThemeMap,
  type AllThemesIssue,
  type ThemeMapIssue,
} from "../../validators";
import type { ThemeMap } from "../../types";

/** Delegate to theme map validator. */
export function adaptValidateThemeMap(
  map: ThemeMap,
): readonly ThemeMapIssue[] {
  return validateThemeMap(map);
}

/** Delegate to all-themes validator. */
export function adaptValidateAllThemes(): readonly AllThemesIssue[] {
  return validateAllThemes();
}

/** Delegate to foundation semantic reference validator. */
export function adaptValidateSemanticReferences(): readonly SemanticReferenceIssue[] {
  return validateSemanticReferences();
}
