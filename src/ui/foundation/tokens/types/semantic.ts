/**
 * Semantic token type contracts (meaning via TokenRef → primitive).
 */

import type { TokenRef } from "./references";

export type SemanticColorTokens = {
  readonly surface: {
    readonly canvas: TokenRef;
    readonly default: TokenRef;
    readonly raised: TokenRef;
    readonly overlay: TokenRef;
    readonly floating: TokenRef;
    readonly inverse: TokenRef;
  };
  readonly text: {
    readonly primary: TokenRef;
    readonly secondary: TokenRef;
    readonly muted: TokenRef;
    readonly disabled: TokenRef;
    readonly inverse: TokenRef;
  };
  readonly border: {
    readonly default: TokenRef;
    readonly subtle: TokenRef;
    readonly muted: TokenRef;
    readonly danger: TokenRef;
  };
  readonly brand: {
    readonly primary: TokenRef;
    readonly secondary: TokenRef;
    readonly hover: TokenRef;
    readonly active: TokenRef;
  };
  readonly feedback: {
    readonly success: TokenRef;
    readonly warning: TokenRef;
    readonly danger: TokenRef;
    readonly info: TokenRef;
  };
};

export type SemanticSpacingTokens = {
  readonly none: TokenRef;
  readonly micro: TokenRef;
  readonly tight: TokenRef;
  readonly compact: TokenRef;
  readonly default: TokenRef;
  readonly medium: TokenRef;
  readonly comfortable: TokenRef;
  readonly large: TokenRef;
  readonly extraLarge: TokenRef;
  readonly section: TokenRef;
  readonly major: TokenRef;
  readonly screen: TokenRef;
  readonly layout: TokenRef;
};

export type SemanticRadiusTokens = {
  readonly control: TokenRef;
  readonly container: TokenRef;
  readonly pill: TokenRef;
};

export type SemanticTypographyRole = {
  readonly fontSize: TokenRef;
  readonly fontWeight: TokenRef;
  readonly lineHeight: TokenRef;
  readonly fontFamily: TokenRef;
};

export type SemanticTypographyTokens = {
  readonly headingXl: SemanticTypographyRole;
  readonly headingLg: SemanticTypographyRole;
  readonly headingMd: SemanticTypographyRole;
  readonly headingSm: SemanticTypographyRole;
  readonly section: SemanticTypographyRole;
  readonly bodyLg: SemanticTypographyRole;
  readonly body: SemanticTypographyRole;
  readonly bodySm: SemanticTypographyRole;
  readonly label: SemanticTypographyRole;
  readonly labelSm: SemanticTypographyRole;
  readonly caption: SemanticTypographyRole;
  readonly captionXs: SemanticTypographyRole;
  readonly code: SemanticTypographyRole;
};

export type SemanticElevationTokens = {
  readonly base: TokenRef;
  readonly card: TokenRef;
  readonly popover: TokenRef;
  readonly dialog: TokenRef;
  readonly floating: TokenRef;
};

export type SemanticMotionTokens = {
  readonly feedback: {
    readonly duration: TokenRef;
    readonly easing: TokenRef;
  };
  readonly enter: {
    readonly duration: TokenRef;
    readonly easing: TokenRef;
  };
  readonly exit: {
    readonly duration: TokenRef;
    readonly easing: TokenRef;
  };
};

export type SemanticOpacityTokens = {
  readonly disabled: TokenRef;
  readonly overlay: TokenRef;
};

export type SemanticZIndexTokens = {
  readonly dropdown: TokenRef;
  readonly sticky: TokenRef;
  readonly modal: TokenRef;
  readonly toast: TokenRef;
};

/** Focus ring — theme-aware; values remapped by Theme Maps (UX-3.1.3). */
export type SemanticFocusTokens = {
  readonly ringColor: TokenRef;
  readonly ringWidth: TokenRef;
  readonly ringOffset: TokenRef;
};

export type SemanticTokens = {
  readonly color: SemanticColorTokens;
  readonly spacing: SemanticSpacingTokens;
  readonly radius: SemanticRadiusTokens;
  readonly typography: SemanticTypographyTokens;
  readonly elevation: SemanticElevationTokens;
  readonly motion: SemanticMotionTokens;
  readonly opacity: SemanticOpacityTokens;
  readonly zIndex: SemanticZIndexTokens;
  readonly focus: SemanticFocusTokens;
};
