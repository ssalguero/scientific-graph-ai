/** Structured theme warnings — never thrown. */

export interface ThemeWarning {
  readonly code: string;
  readonly message: string;
}

export function warningDuplicateRegistration(id: string): ThemeWarning {
  return {
    code: "duplicate-registration",
    message: `Theme ${id} already registered.`,
  };
}

export function warningDeprecatedToken(path: string): ThemeWarning {
  return {
    code: "deprecated-token",
    message: `Token "${path}" is deprecated.`,
  };
}

export function warningMissingOptionalToken(path: string): ThemeWarning {
  return {
    code: "missing-optional-token",
    message: `Optional token "${path}" is missing.`,
  };
}

export function warningLegacyTheme(id: string): ThemeWarning {
  return {
    code: "legacy-theme",
    message: `Theme "${id}" is marked as legacy.`,
  };
}

export function warningUnusedSemanticGroup(group: string): ThemeWarning {
  return {
    code: "unused-semantic-group",
    message: `Semantic group "${group}" is unused.`,
  };
}
