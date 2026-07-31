/**
 * UX-3.2.4 — Pure Design Token validation.
 * Reports only — never mutates, corrects, caches, or resolves.
 */

import { isTokenRef } from "../../../foundation/tokens";
import type { ColorTokens } from "../contracts/ColorTokens";
import type { ElevationTokens } from "../contracts/ElevationTokens";
import type { LayoutTokens } from "../contracts/LayoutTokens";
import type { MotionTokens } from "../contracts/MotionTokens";
import type { RadiusTokens } from "../contracts/RadiusTokens";
import type { ResolvedDesignTokens } from "../contracts/ResolvedDesignTokens";
import type { ShadowTokens } from "../contracts/ShadowTokens";
import type { SpacingTokens } from "../contracts/SpacingTokens";
import type { TypographyTokens } from "../contracts/TypographyTokens";

/* -------------------------------------------------------------------------- */
/* Typed errors (discriminated unions)                                        */
/* -------------------------------------------------------------------------- */

export type MissingToken = {
  readonly kind: "MissingToken";
  readonly path: string;
};

export type InvalidToken = {
  readonly kind: "InvalidToken";
  readonly path: string;
  readonly detail: string;
};

export type InvalidScale = {
  readonly kind: "InvalidScale";
  readonly path: string;
  readonly detail: string;
};

export type InvalidReference = {
  readonly kind: "InvalidReference";
  readonly path: string;
  readonly detail: string;
};

export type TokenValidationIssue =
  | MissingToken
  | InvalidToken
  | InvalidScale
  | InvalidReference;

/* -------------------------------------------------------------------------- */
/* Expected scales (mirrors UX-3.2.1 contracts / Foundation semantic keys)    */
/* -------------------------------------------------------------------------- */

const COLOR_GROUPS = {
  surface: [
    "canvas",
    "default",
    "raised",
    "overlay",
    "floating",
    "inverse",
  ],
  text: ["primary", "secondary", "muted", "disabled", "inverse"],
  border: ["default", "subtle", "muted", "danger"],
  brand: ["primary", "secondary", "hover", "active"],
  feedback: ["success", "warning", "danger", "info"],
} as const;

const SPACING_KEYS = [
  "none",
  "micro",
  "tight",
  "compact",
  "default",
  "medium",
  "comfortable",
  "large",
  "extraLarge",
  "section",
  "major",
  "screen",
  "layout",
] as const;

const RADIUS_KEYS = ["control", "container", "pill"] as const;

const SHADOW_KEYS = ["none", "sm", "md", "lg", "xl"] as const;

const ELEVATION_KEYS = [
  "base",
  "card",
  "popover",
  "dialog",
  "floating",
] as const;

const MOTION_PHASES = ["feedback", "enter", "exit"] as const;
const MOTION_FIELDS = ["duration", "easing"] as const;

const TYPOGRAPHY_ROLES = [
  "headingXl",
  "headingLg",
  "headingMd",
  "headingSm",
  "section",
  "bodyLg",
  "body",
  "bodySm",
  "label",
  "labelSm",
  "caption",
  "captionXs",
  "code",
] as const;

const TYPOGRAPHY_FIELDS = [
  "fontSize",
  "fontWeight",
  "lineHeight",
  "fontFamily",
] as const;

const RESOLVED_DOMAINS = [
  "colors",
  "typography",
  "spacing",
  "radius",
  "motion",
  "shadows",
  "elevation",
  "layout",
] as const;

/* -------------------------------------------------------------------------- */
/* Internals                                                                  */
/* -------------------------------------------------------------------------- */

function missing(path: string): MissingToken {
  return { kind: "MissingToken", path };
}

function invalidToken(path: string, detail: string): InvalidToken {
  return { kind: "InvalidToken", path, detail };
}

function invalidScale(path: string, detail: string): InvalidScale {
  return { kind: "InvalidScale", path, detail };
}

function invalidReference(path: string, detail: string): InvalidReference {
  return { kind: "InvalidReference", path, detail };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** Detect leaked TokenRef (unresolved reference) via Foundation isTokenRef. */
function pushIfReference(
  path: string,
  value: unknown,
  issues: TokenValidationIssue[],
): boolean {
  if (isTokenRef(value)) {
    issues.push(
      invalidReference(
        path,
        `Unresolved TokenRef "${value.path}" — expected resolved string`,
      ),
    );
    return true;
  }
  return false;
}

function validateStringLeaf(
  path: string,
  value: unknown,
  issues: TokenValidationIssue[],
): void {
  if (value === undefined) {
    issues.push(missing(path));
    return;
  }

  if (pushIfReference(path, value, issues)) {
    return;
  }

  if (typeof value !== "string") {
    issues.push(
      invalidToken(path, `Expected string, received ${typeof value}`),
    );
    return;
  }

  if (value.length === 0) {
    issues.push(invalidToken(path, "Empty string is not a valid token value"));
  }
}

function validateExactKeys(
  path: string,
  value: unknown,
  expected: readonly string[],
  issues: TokenValidationIssue[],
): Record<string, unknown> | null {
  if (value === undefined) {
    issues.push(missing(path));
    return null;
  }

  if (pushIfReference(path, value, issues)) {
    return null;
  }

  if (!isPlainObject(value)) {
    issues.push(
      invalidToken(path, `Expected object, received ${typeof value}`),
    );
    return null;
  }

  const actual = Object.keys(value);
  const expectedSet = new Set(expected);
  const actualSet = new Set(actual);

  for (const key of expected) {
    if (!actualSet.has(key)) {
      issues.push(missing(`${path}.${key}`));
    }
  }

  for (const key of actual) {
    if (!expectedSet.has(key)) {
      issues.push(
        invalidScale(path, `Unexpected key "${key}" — scale mismatch`),
      );
    }
  }

  return value;
}

function validateStringScale(
  path: string,
  value: unknown,
  keys: readonly string[],
  issues: TokenValidationIssue[],
): void {
  const obj = validateExactKeys(path, value, keys, issues);
  if (!obj) {
    return;
  }

  for (const key of keys) {
    if (key in obj) {
      validateStringLeaf(`${path}.${key}`, obj[key], issues);
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Domain validators                                                          */
/* -------------------------------------------------------------------------- */

export function validateColors(
  colors: ColorTokens | unknown,
): readonly TokenValidationIssue[] {
  const issues: TokenValidationIssue[] = [];
  const root = validateExactKeys(
    "colors",
    colors,
    Object.keys(COLOR_GROUPS),
    issues,
  );
  if (!root) {
    return issues;
  }

  for (const [group, keys] of Object.entries(COLOR_GROUPS)) {
    validateStringScale(`colors.${group}`, root[group], keys, issues);
  }

  return issues;
}

export function validateTypography(
  typography: TypographyTokens | unknown,
): readonly TokenValidationIssue[] {
  const issues: TokenValidationIssue[] = [];
  const root = validateExactKeys(
    "typography",
    typography,
    TYPOGRAPHY_ROLES,
    issues,
  );
  if (!root) {
    return issues;
  }

  for (const role of TYPOGRAPHY_ROLES) {
    if (!(role in root)) {
      continue;
    }
    validateStringScale(
      `typography.${role}`,
      root[role],
      TYPOGRAPHY_FIELDS,
      issues,
    );
  }

  return issues;
}

export function validateSpacing(
  spacing: SpacingTokens | unknown,
): readonly TokenValidationIssue[] {
  const issues: TokenValidationIssue[] = [];
  validateStringScale("spacing", spacing, SPACING_KEYS, issues);
  return issues;
}

export function validateRadius(
  radius: RadiusTokens | unknown,
): readonly TokenValidationIssue[] {
  const issues: TokenValidationIssue[] = [];
  validateStringScale("radius", radius, RADIUS_KEYS, issues);
  return issues;
}

export function validateShadows(
  shadows: ShadowTokens | unknown,
): readonly TokenValidationIssue[] {
  const issues: TokenValidationIssue[] = [];
  validateStringScale("shadows", shadows, SHADOW_KEYS, issues);
  return issues;
}

export function validateElevation(
  elevation: ElevationTokens | unknown,
): readonly TokenValidationIssue[] {
  const issues: TokenValidationIssue[] = [];
  validateStringScale("elevation", elevation, ELEVATION_KEYS, issues);
  return issues;
}

export function validateMotion(
  motion: MotionTokens | unknown,
): readonly TokenValidationIssue[] {
  const issues: TokenValidationIssue[] = [];
  const root = validateExactKeys("motion", motion, MOTION_PHASES, issues);
  if (!root) {
    return issues;
  }

  for (const phase of MOTION_PHASES) {
    if (!(phase in root)) {
      continue;
    }
    validateStringScale(`motion.${phase}`, root[phase], MOTION_FIELDS, issues);
  }

  return issues;
}

/**
 * LayoutTokens is a placeholder extension point (UX-3.2.1).
 * No domain rules — always valid.
 */
export function validateLayout(
  _layout?: LayoutTokens | unknown,
): readonly TokenValidationIssue[] {
  return [];
}

export function validateResolvedDesignTokens(
  tokens: ResolvedDesignTokens | unknown,
): readonly TokenValidationIssue[] {
  const issues: TokenValidationIssue[] = [];

  if (tokens === undefined || tokens === null) {
    return [missing("ResolvedDesignTokens")];
  }

  if (pushIfReference("ResolvedDesignTokens", tokens, issues)) {
    return issues;
  }

  if (!isPlainObject(tokens)) {
    return [
      invalidToken(
        "ResolvedDesignTokens",
        `Expected object, received ${typeof tokens}`,
      ),
    ];
  }

  const actualKeys = Object.keys(tokens);
  const expectedSet = new Set<string>(RESOLVED_DOMAINS);

  for (const domain of RESOLVED_DOMAINS) {
    if (!(domain in tokens)) {
      issues.push(missing(domain));
    }
  }

  for (const key of actualKeys) {
    if (!expectedSet.has(key)) {
      issues.push(
        invalidScale(
          "ResolvedDesignTokens",
          `Unexpected domain "${key}" — scale mismatch`,
        ),
      );
    }
  }

  if ("colors" in tokens) {
    issues.push(...validateColors(tokens.colors));
  }
  if ("typography" in tokens) {
    issues.push(...validateTypography(tokens.typography));
  }
  if ("spacing" in tokens) {
    issues.push(...validateSpacing(tokens.spacing));
  }
  if ("radius" in tokens) {
    issues.push(...validateRadius(tokens.radius));
  }
  if ("motion" in tokens) {
    issues.push(...validateMotion(tokens.motion));
  }
  if ("shadows" in tokens) {
    issues.push(...validateShadows(tokens.shadows));
  }
  if ("elevation" in tokens) {
    issues.push(...validateElevation(tokens.elevation));
  }
  if ("layout" in tokens) {
    issues.push(...validateLayout(tokens.layout));
  }

  return issues;
}
