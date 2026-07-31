import type { SemanticTokens } from "../types/semantic";
import { color } from "./color";
import { elevation } from "./elevation";
import { motion } from "./motion";
import { opacity } from "./opacity";
import { radius } from "./radius";
import { spacing } from "./spacing";
import { typography } from "./typography";
import { zIndex } from "./z-index";

export const semantic = {
  color,
  spacing,
  radius,
  typography,
  elevation,
  motion,
  opacity,
  zIndex,
} as const satisfies SemanticTokens;

export {
  color,
  elevation,
  motion,
  opacity,
  radius,
  spacing,
  typography,
  zIndex,
};
