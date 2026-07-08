import {
  createDefaultUserPreferences,
  parseShowContextualHints,
  parseThemeMode,
} from "../../domain";
import type { UserPreferences } from "../../domain";

import { USER_PREFERENCES_STORAGE_KEYS } from "./keys";

export type UserPreferencesStorage = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem"
>;

const resolveStorage = (
  storage?: UserPreferencesStorage
): UserPreferencesStorage | null => {
  if (storage) {
    return storage;
  }

  try {
    return localStorage;
  } catch {
    return null;
  }
};

export const readUserPreferences = (
  storage?: UserPreferencesStorage
): UserPreferences => {
  const resolved = resolveStorage(storage);

  if (!resolved) {
    return createDefaultUserPreferences();
  }

  try {
    const themeRaw = resolved.getItem(USER_PREFERENCES_STORAGE_KEYS.theme);
    const hintsRaw = resolved.getItem(
      USER_PREFERENCES_STORAGE_KEYS.showContextualHints
    );

    return {
      theme: parseThemeMode(themeRaw),
      showContextualHints: parseShowContextualHints(hintsRaw),
    };
  } catch {
    return createDefaultUserPreferences();
  }
};

export const writeUserPreferences = (
  preferences: UserPreferences,
  storage?: UserPreferencesStorage
): void => {
  const resolved = resolveStorage(storage);

  if (!resolved) {
    return;
  }

  try {
    resolved.setItem(
      USER_PREFERENCES_STORAGE_KEYS.theme,
      preferences.theme
    );
    resolved.setItem(
      USER_PREFERENCES_STORAGE_KEYS.showContextualHints,
      preferences.showContextualHints ? "true" : "false"
    );
  } catch {
    // ignore storage errors
  }
};

export const clearUserPreferences = (
  storage?: UserPreferencesStorage
): void => {
  const resolved = resolveStorage(storage);

  if (!resolved) {
    return;
  }

  try {
    resolved.removeItem(USER_PREFERENCES_STORAGE_KEYS.theme);
    resolved.removeItem(USER_PREFERENCES_STORAGE_KEYS.showContextualHints);
  } catch {
    // ignore storage errors
  }
};
