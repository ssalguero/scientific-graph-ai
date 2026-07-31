export type ThemeId =
  | "light"
  | "dark"
  | "highContrastLight"
  | "highContrastDark";

export const THEME_IDS = [
  "light",
  "dark",
  "highContrastLight",
  "highContrastDark",
] as const satisfies readonly ThemeId[];

export const DEFAULT_THEME: ThemeId = "light";

export function isThemeId(value: unknown): value is ThemeId {
  return (
    typeof value === "string" &&
    (THEME_IDS as readonly string[]).includes(value)
  );
}
