/**
 * UX-3.2.1 — Aggregated resolved design-token contract.
 * Public module contract for ThemeTokenResolver output (later microfases).
 */

import type { ColorTokens } from "./ColorTokens";
import type { ElevationTokens } from "./ElevationTokens";
import type { LayoutTokens } from "./LayoutTokens";
import type { MotionTokens } from "./MotionTokens";
import type { RadiusTokens } from "./RadiusTokens";
import type { ShadowTokens } from "./ShadowTokens";
import type { SpacingTokens } from "./SpacingTokens";
import type { TypographyTokens } from "./TypographyTokens";

export interface ResolvedDesignTokens {
  readonly colors: ColorTokens;
  readonly typography: TypographyTokens;
  readonly spacing: SpacingTokens;
  readonly radius: RadiusTokens;
  readonly motion: MotionTokens;
  readonly shadows: ShadowTokens;
  readonly elevation: ElevationTokens;
  readonly layout: LayoutTokens;
}
