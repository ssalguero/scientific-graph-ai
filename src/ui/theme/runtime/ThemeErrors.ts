/** Theme runtime error classes — for ThemeAssertions only. */

export class ThemeNotFoundError extends Error {
  readonly name = "ThemeNotFoundError";

  constructor(id: string) {
    super(`Theme not found: "${id}".`);
  }
}

export class ThemeContractError extends Error {
  readonly name = "ThemeContractError";

  constructor(message: string) {
    super(`Theme contract violation: ${message}`);
  }
}

export class ThemeVariableError extends Error {
  readonly name = "ThemeVariableError";

  constructor(message: string) {
    super(`Theme variable error: ${message}`);
  }
}

export class InvalidThemeDefinitionError extends Error {
  readonly name = "InvalidThemeDefinitionError";

  constructor(message: string) {
    super(`Invalid theme definition: ${message}`);
  }
}

export class UnknownThemeError extends Error {
  readonly name = "UnknownThemeError";

  constructor(id: string) {
    super(`Unknown theme id: "${id}".`);
  }
}
