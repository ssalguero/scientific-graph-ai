import type { ThemeMap } from "../types";
import { createTokenRef } from "../../foundation/tokens";

/**
 * High Contrast Dark — black/white emphasis distinct from standard dark.
 * Not equivalent to highContrastLight with inverted palette alone.
 */
export const highContrastDarkTheme: ThemeMap = {
  id: "highContrastDark",
  color: {
    surface: {
      canvas: createTokenRef("color.black"),
      default: createTokenRef("color.black"),
      raised: createTokenRef("color.slate.950"),
      overlay: createTokenRef("color.black"),
      floating: createTokenRef("color.slate.950"),
      inverse: createTokenRef("color.white"),
    },
    text: {
      primary: createTokenRef("color.white"),
      secondary: createTokenRef("color.slate.100"),
      muted: createTokenRef("color.slate.200"),
      disabled: createTokenRef("color.slate.400"),
      inverse: createTokenRef("color.black"),
    },
    border: {
      default: createTokenRef("color.white"),
      subtle: createTokenRef("color.slate.200"),
      muted: createTokenRef("color.slate.300"),
      danger: createTokenRef("color.red.300"),
    },
    brand: {
      primary: createTokenRef("color.blue.300"),
      secondary: createTokenRef("color.blue.400"),
      hover: createTokenRef("color.blue.200"),
      active: createTokenRef("color.blue.100"),
    },
    feedback: {
      success: createTokenRef("color.green.300"),
      warning: createTokenRef("color.amber.300"),
      danger: createTokenRef("color.red.300"),
      info: createTokenRef("color.blue.300"),
    },
  },
  focus: {
    ringColor: createTokenRef("color.white"),
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
