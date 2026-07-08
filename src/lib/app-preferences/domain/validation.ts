import { createDefaultUserPreferences } from "./defaults";
import type { ThemeMode, UserPreferences } from "./types";

export const parseThemeMode = (value: unknown): ThemeMode => {
  if (value === "dark") {
    return "dark";
  }
  if (value === "light") {
    return "light";
  }
  return "light";
};

export const parseShowContextualHints = (value: unknown): boolean => {
  if (value === true || value === "true") {
    return true;
  }
  if (value === false || value === "false") {
    return false;
  }
  return true;
};

export const mergeUserPreferences = (
  base: UserPreferences,
  patch: Partial<UserPreferences>
): UserPreferences => ({
  theme:
    patch.theme !== undefined ? parseThemeMode(patch.theme) : base.theme,
  showContextualHints:
    patch.showContextualHints !== undefined
      ? parseShowContextualHints(patch.showContextualHints)
      : base.showContextualHints,
});

export const validateUserPreferences = (input: unknown): UserPreferences => {
  if (input === null || typeof input !== "object") {
    return createDefaultUserPreferences();
  }

  const record = input as Record<string, unknown>;

  return {
    theme: parseThemeMode(record.theme),
    showContextualHints: parseShowContextualHints(record.showContextualHints),
  };
};
