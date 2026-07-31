/**
 * Public API.
 *
 * Todas las exportaciones públicas del Design System
 * deberán salir exclusivamente desde este archivo.
 *
 * UX-3.1.3 curated surface: tokens + theme + ThemeProvider.
 * Validators remain package-internal (not reexported here).
 * Application modules must not import @/ui until a later microfase authorizes wiring.
 */
export {
  primitive,
  semantic,
  TOKEN_CONTRACT_VERSION,
} from "./foundation/tokens";

export type {
  PrimitiveTokens,
  SemanticTokens,
  SemanticFocusTokens,
  TokenRef,
} from "./foundation/tokens";

export {
  THEME_CONTRACT_VERSION,
  THEME_IDS,
  DEFAULT_THEME,
  themes,
  isThemeId,
  getThemeCssVars,
  getThemeCssText,
  resolveTheme,
} from "./theme";

export type { ThemeId, ThemeMap, ResolvedTheme } from "./theme";

export { ThemeProvider, useTheme } from "./providers";
export type { ThemeProviderProps, ThemeContextValue } from "./providers";
