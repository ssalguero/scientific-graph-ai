/**
 * Theme Contract barrel — re-exports only.
 * UX-3.1.4: no new types; no contract mutations.
 */
export {
  THEME_CONTRACT_VERSION,
  type ThemeContractVersion,
} from "../version";

export {
  DEFAULT_THEME,
  THEME_IDS,
  isThemeId,
  type ThemeId,
} from "../ids";

export type { ResolvedTheme, ThemeMap } from "../types";
