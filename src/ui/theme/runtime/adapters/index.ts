/**
 * runtime/adapters — extension point for UX-3.2+.
 * Today: minimal bridges to existing validators only.
 */
export {
  adaptValidateAllThemes,
  adaptValidateSemanticReferences,
  adaptValidateThemeMap,
} from "./ThemeValidationAdapter";
