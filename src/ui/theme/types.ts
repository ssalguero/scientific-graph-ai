import type {
  SemanticColorTokens,
  SemanticElevationTokens,
  SemanticFocusTokens,
} from "../foundation/tokens";
import type { ThemeId } from "./ids";

/**
 * Themeable semantic slice — color, focus, elevation.
 * Spacing / radius / typography / motion / opacity / zIndex are theme-invariant.
 */
export type ThemeMap = {
  readonly id: ThemeId;
  readonly color: SemanticColorTokens;
  readonly focus: SemanticFocusTokens;
  readonly elevation: SemanticElevationTokens;
};

export type ResolvedTheme = {
  readonly id: ThemeId;
  /** cssVarName → resolved CSS value */
  readonly cssVars: Readonly<Record<string, string>>;
};
