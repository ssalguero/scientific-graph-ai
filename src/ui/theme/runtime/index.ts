/** Theme runtime barrel — fixed export order (UX-3.1.4). */

export {
  InvalidThemeDefinitionError,
  ThemeContractError,
  ThemeNotFoundError,
  ThemeVariableError,
  UnknownThemeError,
} from "./ThemeErrors";

export {
  warningDeprecatedToken,
  warningDuplicateRegistration,
  warningLegacyTheme,
  warningMissingOptionalToken,
  warningUnusedSemanticGroup,
  type ThemeWarning,
} from "./ThemeWarnings";

export {
  validateTheme,
  validateThemeCatalog,
  type ThemeErrorInfo,
  type ThemeValidationResult,
} from "./ThemeValidator";

export {
  assertColor,
  assertSemantic,
  assertTheme,
  assertToken,
  assertTypography,
} from "./ThemeAssertions";

export { ThemeRegistry } from "./ThemeRegistry";

export {
  countThemes,
  getContractVersion,
  getTheme,
  getThemeNames,
  listThemes,
  themeExists,
  type ThemeInspectionSource,
  type ThemeStaticCatalog,
} from "./ThemeInspector";

export {
  cloneTheme,
  compareThemes,
  deepMergeTheme,
  freezeTheme,
  normalizeTheme,
  type ThemeableOverride,
} from "./ThemeUtils";
