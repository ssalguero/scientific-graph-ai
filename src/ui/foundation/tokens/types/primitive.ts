/**
 * Primitive token type contracts (scales only — no semantic meaning).
 */

export type ColorStep =
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900
  | 950;

export type ColorRamp = Readonly<Record<ColorStep, string>>;

export type ColorScale = {
  readonly white: string;
  readonly black: string;
  readonly slate: ColorRamp;
  readonly blue: ColorRamp;
  readonly green: ColorRamp;
  readonly red: ColorRamp;
  readonly amber: ColorRamp;
};

export type SpacingScale = {
  readonly space0: number;
  readonly space1: number;
  readonly space2: number;
  readonly space3: number;
  readonly space4: number;
  readonly space5: number;
  readonly space6: number;
  readonly space8: number;
  readonly space10: number;
  readonly space12: number;
  readonly space16: number;
  readonly space20: number;
  readonly space24: number;
};

export type RadiusScale = {
  readonly none: number;
  readonly xs: number;
  readonly sm: number;
  readonly md: number;
  readonly lg: number;
  readonly xl: number;
  readonly full: number;
};

export type FontWeightScale = {
  readonly regular: number;
  readonly medium: number;
  readonly semibold: number;
  readonly bold: number;
};

export type FontSizeScale = {
  readonly headingXl: number;
  readonly headingLg: number;
  readonly headingMd: number;
  readonly headingSm: number;
  readonly section: number;
  readonly bodyLg: number;
  readonly body: number;
  readonly bodySm: number;
  readonly label: number;
  readonly labelSm: number;
  readonly caption: number;
  readonly captionXs: number;
  readonly code: number;
};

export type LineHeightScale = {
  readonly tight: number;
  readonly normal: number;
  readonly relaxed: number;
};

export type LetterSpacingScale = {
  readonly default: string;
  readonly heading: string;
  readonly caps: string;
};

export type FontFamilyScale = {
  readonly sans: string;
  readonly mono: string;
};

export type TypographyScale = {
  readonly fontFamily: FontFamilyScale;
  readonly fontWeight: FontWeightScale;
  readonly fontSize: FontSizeScale;
  readonly lineHeight: LineHeightScale;
  readonly letterSpacing: LetterSpacingScale;
};

export type ShadowScale = {
  readonly none: string;
  readonly sm: string;
  readonly md: string;
  readonly lg: string;
  readonly xl: string;
};

export type ElevationScale = {
  readonly level0: number;
  readonly level1: number;
  readonly level2: number;
  readonly level3: number;
  readonly level4: number;
};

export type MotionDurationScale = {
  readonly duration100: number;
  readonly duration150: number;
  readonly duration200: number;
  readonly duration250: number;
  readonly duration300: number;
};

export type MotionEasingScale = {
  readonly easeOut: string;
  readonly easeInOut: string;
};

export type MotionScale = {
  readonly duration: MotionDurationScale;
  readonly easing: MotionEasingScale;
};

export type OpacityScale = {
  readonly opacity0: number;
  readonly opacity5: number;
  readonly opacity10: number;
  readonly opacity20: number;
  readonly opacity40: number;
  readonly opacity60: number;
  readonly opacity80: number;
  readonly opacity100: number;
};

export type ZIndexScale = {
  readonly base: number;
  readonly dropdown: number;
  readonly sticky: number;
  readonly modal: number;
  readonly toast: number;
  readonly max: number;
};

export type PrimitiveTokens = {
  readonly color: ColorScale;
  readonly spacing: SpacingScale;
  readonly radius: RadiusScale;
  readonly typography: TypographyScale;
  readonly shadow: ShadowScale;
  readonly elevation: ElevationScale;
  readonly motion: MotionScale;
  readonly opacity: OpacityScale;
  readonly zIndex: ZIndexScale;
};
