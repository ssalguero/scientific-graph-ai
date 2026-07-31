import type { ThemeMap } from "../types";
import { createTokenRef } from "../../foundation/tokens";

/** Dark theme — remaps themeable semantic refs to darker primitive leaves. */
export const darkTheme: ThemeMap = {
  id: "dark",
  color: {
    surface: {
      canvas: createTokenRef("color.slate.950"),
      default: createTokenRef("color.slate.900"),
      raised: createTokenRef("color.slate.800"),
      overlay: createTokenRef("color.black"),
      floating: createTokenRef("color.slate.800"),
      inverse: createTokenRef("color.slate.50"),
    },
    text: {
      primary: createTokenRef("color.slate.50"),
      secondary: createTokenRef("color.slate.300"),
      muted: createTokenRef("color.slate.400"),
      disabled: createTokenRef("color.slate.500"),
      inverse: createTokenRef("color.slate.900"),
    },
    border: {
      default: createTokenRef("color.slate.700"),
      subtle: createTokenRef("color.slate.800"),
      muted: createTokenRef("color.slate.600"),
      danger: createTokenRef("color.red.400"),
    },
    brand: {
      primary: createTokenRef("color.blue.400"),
      secondary: createTokenRef("color.blue.500"),
      hover: createTokenRef("color.blue.300"),
      active: createTokenRef("color.blue.200"),
    },
    feedback: {
      success: createTokenRef("color.green.400"),
      warning: createTokenRef("color.amber.400"),
      danger: createTokenRef("color.red.400"),
      info: createTokenRef("color.blue.400"),
    },
  },
  focus: {
    ringColor: createTokenRef("color.blue.400"),
    ringWidth: createTokenRef("radius.xs"),
    ringOffset: createTokenRef("radius.xs"),
  },
  elevation: {
    base: createTokenRef("shadow.none"),
    card: createTokenRef("shadow.sm"),
    popover: createTokenRef("shadow.md"),
    dialog: createTokenRef("shadow.lg"),
    floating: createTokenRef("shadow.xl"),
  },
};
