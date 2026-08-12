import type { UserPreferences } from "./types";

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  // CRP-6.1 — E0 commercial face is dark graphite; light remains selectable.
  theme: "dark",
  showContextualHints: true,
};

export const createDefaultUserPreferences = (): UserPreferences => ({
  theme: DEFAULT_USER_PREFERENCES.theme,
  showContextualHints: DEFAULT_USER_PREFERENCES.showContextualHints,
});
