import type { ThemeMap } from "../types";
import { createTokenRef } from "../../foundation/tokens";

/**
 * High Contrast Light — stronger surfaces/borders/text for WCAG HC.
 * Shares structure with light; does not share values 1:1 with dark HC.
 */
export const highContrastLightTheme: ThemeMap = {
  id: "highContrastLight",
  color: {
    surface: {
      canvas: createTokenRef("color.white"),
      default: createTokenRef("color.white"),
      raised: createTokenRef("color.white"),
      overlay: createTokenRef("color.black"),
      floating: createTokenRef("color.white"),
      inverse: createTokenRef("color.black"),
    },
    text: {
      primary: createTokenRef("color.black"),
      secondary: createTokenRef("color.slate.900"),
      muted: createTokenRef("color.slate.800"),
      disabled: createTokenRef("color.slate.600"),
      inverse: createTokenRef("color.white"),
    },
    border: {
      default: createTokenRef("color.black"),
      subtle: createTokenRef("color.slate.900"),
      muted: createTokenRef("color.slate.800"),
      danger: createTokenRef("color.red.700"),
    },
    brand: {
      primary: createTokenRef("color.blue.800"),
      secondary: createTokenRef("color.blue.700"),
      hover: createTokenRef("color.blue.900"),
      active: createTokenRef("color.blue.950"),
    },
    feedback: {
      success: createTokenRef("color.green.800"),
      warning: createTokenRef("color.amber.800"),
      danger: createTokenRef("color.red.800"),
      info: createTokenRef("color.blue.800"),
    },
  },
  focus: {
    ringColor: createTokenRef("color.black"),
    ringWidth: createTokenRef("radius.sm"),
    ringOffset: createTokenRef("radius.xs"),
  },
  elevation: {
    base: createTokenRef("shadow.none"),
    card: createTokenRef("shadow.none"),
    popover: createTokenRef("shadow.sm"),
    dialog: createTokenRef("shadow.sm"),
    floating: createTokenRef("shadow.md"),
  },
};
