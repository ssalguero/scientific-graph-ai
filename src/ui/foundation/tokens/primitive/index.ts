import type { PrimitiveTokens } from "../types/primitive";
import { color } from "./color";
import { elevation } from "./elevation";
import { motion } from "./motion";
import { opacity } from "./opacity";
import { radius } from "./radius";
import { shadow } from "./shadow";
import { spacing } from "./spacing";
import { typography } from "./typography";
import { zIndex } from "./z-index";

export const primitive = {
  color,
  spacing,
  radius,
  typography,
  shadow,
  elevation,
  motion,
  opacity,
  zIndex,
} as const satisfies PrimitiveTokens;

export {
  color,
  elevation,
  motion,
  opacity,
  radius,
  shadow,
  spacing,
  typography,
  zIndex,
};
