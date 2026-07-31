import type { SemanticMotionTokens } from "../types/semantic";
import { createTokenRef } from "../types/references";

/** Semantic motion roles — feedback / enter / exit */
export const motion = {
  feedback: {
    duration: createTokenRef("motion.duration.duration150"),
    easing: createTokenRef("motion.easing.easeOut"),
  },
  enter: {
    duration: createTokenRef("motion.duration.duration200"),
    easing: createTokenRef("motion.easing.easeOut"),
  },
  exit: {
    duration: createTokenRef("motion.duration.duration150"),
    easing: createTokenRef("motion.easing.easeInOut"),
  },
} as const satisfies SemanticMotionTokens;
