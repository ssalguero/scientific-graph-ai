import type { UserPreferences } from "./types";

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: "light",
  showContextualHints: true,
};

export const createDefaultUserPreferences = (): UserPreferences => ({
  theme: DEFAULT_USER_PREFERENCES.theme,
  showContextualHints: DEFAULT_USER_PREFERENCES.showContextualHints,
});
