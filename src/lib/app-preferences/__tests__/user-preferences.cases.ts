import {
  APP_DISPLAY_VERSION,
  DEFAULT_USER_PREFERENCES,
  createDefaultUserPreferences,
  mergeUserPreferences,
  parseShowContextualHints,
  parseThemeMode,
  validateUserPreferences,
} from "@/lib/app-preferences";

import {
  createAssertCase,
  type AssertCase,
  type CaseResult,
} from "./run-assertions";

export const runUserPreferencesCases = (assertCase: AssertCase): void => {
  assertCase("domain.parseThemeMode.validDark", parseThemeMode("dark") === "dark");
  assertCase(
    "domain.parseThemeMode.validLight",
    parseThemeMode("light") === "light"
  );
  assertCase(
    "domain.parseThemeMode.invalid",
    parseThemeMode("invalid") === "light"
  );
  assertCase(
    "domain.parseThemeMode.absent",
    parseThemeMode(undefined) === "light"
  );

  assertCase(
    "domain.parseShowContextualHints.true",
    parseShowContextualHints(true) === true &&
      parseShowContextualHints("true") === true
  );
  assertCase(
    "domain.parseShowContextualHints.false",
    parseShowContextualHints(false) === false &&
      parseShowContextualHints("false") === false
  );
  assertCase(
    "domain.parseShowContextualHints.invalid",
    parseShowContextualHints("invalid") === true
  );
  assertCase(
    "domain.parseShowContextualHints.absent",
    parseShowContextualHints(undefined) === true
  );

  assertCase(
    "domain.defaultUserPreferences.values",
    DEFAULT_USER_PREFERENCES.theme === "light" &&
      DEFAULT_USER_PREFERENCES.showContextualHints === true
  );

  const first = createDefaultUserPreferences();
  const second = createDefaultUserPreferences();
  first.theme = "dark";
  assertCase(
    "domain.createDefaultUserPreferences.newCopy",
    second.theme === "light" && first !== second
  );

  const base = createDefaultUserPreferences();
  const merged = mergeUserPreferences(base, { theme: "dark" });
  assertCase(
    "domain.mergeUserPreferences.correct",
    merged.theme === "dark" && merged.showContextualHints === true
  );

  const mergeBase = createDefaultUserPreferences();
  mergeUserPreferences(mergeBase, { showContextualHints: false });
  assertCase(
    "domain.mergeUserPreferences.immutable",
    mergeBase.showContextualHints === true
  );

  assertCase(
    "domain.validateUserPreferences.validObject",
    validateUserPreferences({ theme: "dark", showContextualHints: false })
      .theme === "dark" &&
      validateUserPreferences({ theme: "dark", showContextualHints: false })
        .showContextualHints === false
  );

  assertCase(
    "domain.validateUserPreferences.partialObject",
    validateUserPreferences({ theme: "dark" }).theme === "dark" &&
      validateUserPreferences({ theme: "dark" }).showContextualHints === true
  );

  assertCase(
    "domain.validateUserPreferences.invalidValues",
    validateUserPreferences({ theme: "bad", showContextualHints: "bad" })
      .theme === "light" &&
      validateUserPreferences({ theme: "bad", showContextualHints: "bad" })
        .showContextualHints === true
  );

  assertCase(
    "version.appDisplayVersion.defined",
    typeof APP_DISPLAY_VERSION === "string" && APP_DISPLAY_VERSION.length > 0
  );
  assertCase(
    "version.appDisplayVersion.planParity",
    APP_DISPLAY_VERSION === "0.1.0"
  );
};

export const runUserPreferencesCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);
  runUserPreferencesCases(assertCase);
  return results;
};
