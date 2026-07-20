/**
 * D49.2 — Toolbar token bridge (reference-only).
 * Values live exclusively in UI_TOKENS.toolbar — no string/class/CSS literals here.
 */
import { UI_TOKENS } from "@/lib/ui/tokens";

export const TOOLBAR_TOKENS = {
  root: UI_TOKENS.toolbar.root,
  section: UI_TOKENS.toolbar.section,
  sectionLeft: UI_TOKENS.toolbar.sectionLeft,
  sectionCenter: UI_TOKENS.toolbar.sectionCenter,
  sectionRight: UI_TOKENS.toolbar.sectionRight,
  group: UI_TOKENS.toolbar.group,
  groupCompact: UI_TOKENS.toolbar.groupCompact,
  action: UI_TOKENS.toolbar.action,
  actionActive: UI_TOKENS.toolbar.actionActive,
  actionDisabled: UI_TOKENS.toolbar.actionDisabled,
  overflow: UI_TOKENS.toolbar.overflow,
  height: UI_TOKENS.toolbar.height,
  gap: UI_TOKENS.toolbar.gap,
  padding: UI_TOKENS.toolbar.padding,
  border: UI_TOKENS.toolbar.border,
  background: UI_TOKENS.toolbar.background,
  radius: UI_TOKENS.toolbar.radius,
  shadow: UI_TOKENS.toolbar.shadow,
} as const;
