import { ICON_TOKENS } from "./ICON_TOKENS";
import {
  workspaceIconRegistry,
  type WorkspaceIconName,
} from "./workspaceIconRegistry";

/**
 * UX-2.20 — Presentational workspace glyph.
 * Decorative by default. No children, handlers, or role.
 * API frozen after UX-2.20.
 */
export type WorkspaceIconProps = {
  name: WorkspaceIconName;
  size?: "sm" | "md" | "lg";
};

const SIZE_CLASS = {
  sm: ICON_TOKENS.sizeSm,
  md: ICON_TOKENS.sizeMd,
  lg: ICON_TOKENS.sizeLg,
} as const;

export function WorkspaceIcon({ name, size = "md" }: WorkspaceIconProps) {
  const Icon = workspaceIconRegistry[name];
  const sizeClass = SIZE_CLASS[size];

  return (
    <span
      aria-hidden
      className={[ICON_TOKENS.root, ICON_TOKENS.color, sizeClass].join(" ")}
    >
      <Icon
        className={[ICON_TOKENS.svg, sizeClass].join(" ")}
        strokeWidth={1.5}
        aria-hidden
      />
    </span>
  );
}
