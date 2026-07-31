import type { ThemeMap } from "../types";
import { color } from "../../foundation/tokens/semantic/color";
import { elevation } from "../../foundation/tokens/semantic/elevation";
import { focus } from "../../foundation/tokens/semantic/focus";

/**
 * Light theme map — 1:1 projection of default semantic (color / focus / elevation).
 * No second source of truth: composes Foundation semantic data.
 */
export const lightTheme: ThemeMap = {
  id: "light",
  color,
  focus,
  elevation,
};
