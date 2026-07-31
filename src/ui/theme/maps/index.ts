import type { ThemeId } from "../ids";
import type { ThemeMap } from "../types";
import { darkTheme } from "./dark";
import { highContrastDarkTheme } from "./high-contrast-dark";
import { highContrastLightTheme } from "./high-contrast-light";
import { lightTheme } from "./light";

export const themes: Record<ThemeId, ThemeMap> = {
  light: lightTheme,
  dark: darkTheme,
  highContrastLight: highContrastLightTheme,
  highContrastDark: highContrastDarkTheme,
};

export {
  darkTheme,
  highContrastDarkTheme,
  highContrastLightTheme,
  lightTheme,
};
