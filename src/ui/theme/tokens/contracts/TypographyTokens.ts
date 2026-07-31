/**
 * UX-3.2.1 — Resolved typography token contract.
 * Typed projection of Foundation SemanticTypographyTokens (leaves: string, not TokenRef).
 */

export interface TypographyRoleTokens {
  readonly fontSize: string;
  readonly fontWeight: string;
  readonly lineHeight: string;
  readonly fontFamily: string;
}

export interface TypographyTokens {
  readonly headingXl: TypographyRoleTokens;
  readonly headingLg: TypographyRoleTokens;
  readonly headingMd: TypographyRoleTokens;
  readonly headingSm: TypographyRoleTokens;
  readonly section: TypographyRoleTokens;
  readonly bodyLg: TypographyRoleTokens;
  readonly body: TypographyRoleTokens;
  readonly bodySm: TypographyRoleTokens;
  readonly label: TypographyRoleTokens;
  readonly labelSm: TypographyRoleTokens;
  readonly caption: TypographyRoleTokens;
  readonly captionXs: TypographyRoleTokens;
  readonly code: TypographyRoleTokens;
}
