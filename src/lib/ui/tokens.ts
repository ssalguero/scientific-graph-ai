/**
 * D48.2 — Design Tokens v2 · Token Consolidation (move-only).
 * UX-I2 — Shared compositions consume certified Design System CSS variables
 * (--color-*, --radius-*, --elevation-*, --spacing-*, --typography-*, --motion-*).
 * UX-I5 — Focus rings + motion-reduce via shared polish helpers.
 * No new visual values; public keys preserved for API Freeze.
 */

import { DS_FOCUS_RING } from "./focus-ring";

/* -------------------------------------------------------------------------- */
/* Primitives                                                                 */
/* -------------------------------------------------------------------------- */

export const spacing = {
  px1: "px-[var(--spacing-micro)]",
  px15: "px-1.5",
  px2: "px-[var(--spacing-tight)]",
  px25: "px-2.5",
  px3: "px-[var(--spacing-compact)]",
  px4: "px-[var(--spacing-default)]",
  py05: "py-0.5",
  py1: "py-[var(--spacing-micro)]",
  py15: "py-1.5",
  py2: "py-[var(--spacing-tight)]",
  py25: "py-2.5",
  p2: "p-[var(--spacing-tight)]",
  p3: "p-[var(--spacing-compact)]",
  gap2: "gap-[var(--spacing-tight)]",
  spaceY05: "space-y-0.5",
  spaceY15: "space-y-1.5",
  spaceY2: "space-y-[var(--spacing-tight)]",
  spaceY3: "space-y-[var(--spacing-compact)]",
  my15: "my-1.5",
  mb1: "mb-[var(--spacing-micro)]",
  mb15: "mb-1.5",
  mt05: "mt-0.5",
  mt1: "mt-[var(--spacing-micro)]",
} as const;

/** Radius — certified Design System radius tokens only. */
export const radius = {
  md: "rounded-[var(--radius-container)]",
  lg: "rounded-[var(--radius-control)]",
  xl: "rounded-[var(--radius-control)]",
  full: "rounded-[var(--radius-pill)]",
} as const;

/** Shadows — certified elevation CSS variables. */
export const shadows = {
  sm: "shadow-[var(--elevation-card)]",
  md: "shadow-[var(--elevation-popover)]",
  hoverMd: "hover:shadow-[var(--elevation-popover)]",
  hoverSm: "hover:shadow-[var(--elevation-card)]",
  hover: "hover:shadow-[var(--elevation-card)]",
} as const;

/** Motion — certified motion duration / easing (+ reduced-motion). */
export const transitions = {
  colors200:
    "transition-colors duration-[var(--motion-enter-duration)] ease-[var(--motion-enter-easing)] motion-reduce:transition-none",
  colors300:
    "transition-colors duration-[var(--motion-enter-duration)] ease-[var(--motion-enter-easing)] motion-reduce:transition-none",
  all200:
    "transition-all duration-[var(--motion-enter-duration)] ease-[var(--motion-enter-easing)] motion-reduce:transition-none",
  transform200:
    "transition-transform duration-[var(--motion-feedback-duration)] ease-[var(--motion-feedback-easing)] motion-reduce:transition-none",
  colors: "transition-colors motion-reduce:transition-none",
} as const;

export const animation = {
  activeScale: "active:scale-[0.98]",
  duration200: "duration-[var(--motion-enter-duration)]",
  duration300: "duration-[var(--motion-enter-duration)]",
  gridCollapseOpen: "grid-rows-[1fr] opacity-100",
  gridCollapseClosed: "grid-rows-[0fr] opacity-0",
} as const;

export const zIndex = {
  base: "z-0",
  raised: "z-10",
  dropdown: "z-20",
  sticky: "z-30",
  modal: "z-40",
  toast: "z-50",
} as const;

/** Elevation aliases — Design System elevation vars (no duplicate literals). */
export const elevation = {
  flat: "shadow-none",
  low: shadows.sm,
  medium: shadows.md,
  interactive: `${shadows.sm} ${shadows.hoverMd}`,
} as const;

/** Border fragments previously inlined across theme compositions. */
export const border = {
  default: "border border-[var(--color-border-default)]",
  dashed: "border border-dashed border-[var(--color-border-default)]",
  color: "border-[var(--color-border-default)]",
  top: "border-t border-[var(--color-border-default)]",
  bottom: "border-b border-[var(--color-border-default)]",
  right: "border-r border-[var(--color-border-default)]",
  accentSoft: "border-2 border-[var(--color-brand-primary)]/35",
  bare: "border",
} as const;

/** Typography — certified type sizes + Design System color. */
export const typography = {
  panelHeading:
    "text-[length:var(--typography-heading-sm-font-size)] font-semibold leading-[var(--typography-heading-sm-line-height)] text-[var(--color-text-primary)] tracking-tight",
  panelHeadingSubtext:
    "text-[length:var(--typography-body-sm-font-size)] leading-[var(--typography-body-sm-line-height)] text-[var(--color-text-muted)] mt-[var(--spacing-micro)]",
  sectionLabel:
    "text-[length:var(--typography-label-sm-font-size)] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-[var(--spacing-micro)]",
  subsectionHeading:
    "text-[length:var(--typography-body-sm-font-size)] font-semibold leading-[var(--typography-body-sm-line-height)] text-[var(--color-text-primary)]",
  fieldLabel:
    "block text-[length:var(--typography-label-sm-font-size)] font-medium text-[var(--color-text-primary)] mb-[var(--spacing-micro)]",
  dataSemanticHint:
    "text-[length:var(--typography-caption-font-size)] leading-[var(--typography-caption-line-height)] text-[var(--color-text-muted)]",
  projectFileFieldLabel:
    "block text-[length:var(--typography-label-sm-font-size)] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]",
  sidebarSectionLabel:
    "text-[length:var(--typography-caption-xs-font-size)] font-semibold uppercase tracking-[0.09em] text-[var(--color-text-muted)]",
  bodyXsSm:
    "text-[length:var(--typography-body-sm-font-size)] leading-[var(--typography-body-sm-line-height)] text-[var(--color-text-primary)]",
  mutedXsSm:
    "text-[length:var(--typography-body-sm-font-size)] leading-[var(--typography-body-sm-line-height)] text-[var(--color-text-muted)]",
} as const;

/* -------------------------------------------------------------------------- */
/* Layout · Workspace                                                         */
/* -------------------------------------------------------------------------- */

/**
 * UX-I0 — Application shell chrome consumes certified Theme Runtime vars.
 * No hex palette injection; no local `--app-*` literal overrides.
 * Legacy `--app-*` references elsewhere resolve via ThemeRuntimeHost bridge.
 */
export const layout = {
  // CRP-6.1 — shell uses theme-resolved canvas/primary (ThemeProvider syncs light/dark).
  // Inverse hack removed: it inverted when data-theme tokens actually switched.
  appShellLight: `bg-[var(--color-surface-canvas)] text-[var(--color-text-primary)] ${transitions.colors200}`,
  appShellDark: `bg-[var(--color-surface-canvas)] text-[var(--color-text-primary)] ${transitions.colors200}`,
} as const;

/** Canonical workspace shell strings (D47 freeze values — unchanged). */
export const workspace = {
  shell: "flex min-h-screen flex-col lg:flex-row",
  mainColumn: "flex-1 min-w-0 overflow-auto bg-[var(--color-surface-canvas)]",
  /** UX-I3 — Design System spacing; quieter chrome so canvas content leads. */
  inner:
    "w-full px-[var(--spacing-compact)] sm:px-[var(--spacing-default)] lg:px-[var(--spacing-medium)] py-[var(--spacing-compact)] space-y-[var(--spacing-compact)]",
} as const;

/* -------------------------------------------------------------------------- */
/* Panel · Button · Sidebar compositions (move-only from theme.ts)            */
/* -------------------------------------------------------------------------- */

/** UX-1.2 — denser instrument chrome (radius.md); values only, same public keys. */
const panelDatasetCard = `${radius.md} ${border.default} bg-[var(--color-surface-canvas)] ${spacing.p2} ${spacing.spaceY15} ${transitions.colors200}`;

export const panel = {
  card: `${radius.md} ${border.default} bg-[var(--color-surface-default)] ${spacing.p3} ${transitions.colors200}`,
  content: `${radius.md} ${border.default} bg-[var(--color-surface-default)] ${spacing.px25} ${spacing.py15} ${typography.bodyXsSm} ${transitions.colors200}`,
  subsection: `${radius.md} ${border.default} bg-[var(--color-surface-canvas)] ${spacing.p2} ${spacing.spaceY2} ${transitions.colors200}`,
  empty: `${radius.md} ${border.dashed} bg-[var(--color-surface-canvas)] ${spacing.px25} ${spacing.py25} ${typography.mutedXsSm} text-center ${transitions.colors200}`,
  resultsEmpty: `${radius.md} ${border.dashed} bg-[var(--color-surface-canvas)] ${spacing.px25} ${spacing.py15} ${typography.mutedXsSm} text-center ${transitions.colors200}`,
  resultsText: `${radius.md} ${border.default} bg-[var(--color-surface-default)] ${spacing.px25} ${spacing.py15} ${typography.bodyXsSm} leading-snug`,
  resultsSubsection: panelDatasetCard,
  dataEmpty: `${radius.md} ${border.dashed} bg-[var(--color-surface-canvas)] ${spacing.px25} ${spacing.py15} ${typography.mutedXsSm}`,
  dataDataset: panelDatasetCard,
  dataImport: `${radius.md} ${border.accentSoft} bg-[var(--color-brand-primary)]/5`,
  dataAdvanced: "border-dashed opacity-95",
  resultsGrid: `grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 ${spacing.gap2}`,
  resultsPanelFull: "lg:col-span-2 xl:col-span-2",
  resultsPanelCompact: "min-w-0",
  resultsCompactGrid: `grid grid-cols-1 lg:grid-cols-2 ${spacing.gap2} lg:col-span-2 xl:col-span-2`,
  persistenceBadge:
    "inline-flex shrink-0 items-center rounded border border-[var(--color-border-default)] bg-[var(--color-surface-canvas)] px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]",
  alertBase: `${radius.md} ${border.bare} ${spacing.px3} ${spacing.py2} text-xs sm:text-sm font-medium ${transitions.colors200}`,
  inputField: `w-full h-8 ${border.default} ${radius.md} ${spacing.px2} text-xs text-[var(--color-text-primary)] bg-[var(--color-surface-default)] placeholder:text-[var(--color-text-muted)] ${transitions.colors200} ${DS_FOCUS_RING} focus-visible:border-[var(--color-brand-primary)]`,
  projectFileInputField: `w-full h-8 ${radius.md} ${border.default} bg-[var(--color-surface-default)] ${spacing.px2} ${spacing.py15} text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] ${DS_FOCUS_RING}`,
} as const;

export const button = {
  primary: `inline-flex h-8 items-center justify-center font-semibold text-[var(--color-text-inverse)] text-xs ${spacing.px3} ${radius.md} bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-hover)] ${transitions.colors200} ${DS_FOCUS_RING}`,
  outline: `inline-flex h-8 items-center justify-center ${border.default} bg-[var(--color-surface-default)] ${spacing.px25} ${radius.md} text-xs text-[var(--color-text-primary)] ${transitions.colors200} hover:bg-[var(--color-surface-canvas)] hover:border-[var(--color-text-muted)] disabled:opacity-50 disabled:cursor-not-allowed ${DS_FOCUS_RING}`,
  outlineSm: `inline-flex h-7 items-center justify-center ${border.default} bg-[var(--color-surface-default)] ${spacing.px2} ${radius.md} text-xs text-[var(--color-text-primary)] ${transitions.colors200} hover:bg-[var(--color-surface-canvas)] hover:border-[var(--color-text-muted)] ${DS_FOCUS_RING}`,
  actionBar: `inline-flex h-8 items-center justify-center ${radius.md} ${spacing.px25} text-xs font-semibold ${transitions.colors200} disabled:opacity-50 disabled:cursor-not-allowed ${DS_FOCUS_RING}`,
  actionBarPrimary:
    "bg-[var(--color-brand-primary)] text-[var(--color-text-inverse)] hover:bg-[var(--color-brand-hover)] min-w-[7.5rem]",
  actionBarSave:
    "border border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)] text-[var(--color-text-inverse)] hover:bg-[var(--color-brand-hover)] min-w-[7.5rem]",
  actionBarGroup: `flex flex-wrap items-center ${spacing.gap2}`,
  actionBarDivider:
    "hidden sm:block h-7 w-px shrink-0 bg-[var(--color-border-default)]",
  projectPrimary: `${radius.md} bg-[var(--color-brand-primary)] ${spacing.px25} ${spacing.py15} text-xs sm:text-sm font-semibold text-[var(--color-text-inverse)] hover:bg-[var(--color-brand-hover)] ${transitions.colors}`,
  projectSave: `${radius.md} border border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)] ${spacing.px25} ${spacing.py15} text-xs sm:text-sm font-semibold text-[var(--color-text-inverse)] hover:bg-[var(--color-brand-hover)] ${transitions.colors}`,
  projectSecondary: `${radius.md} ${border.default} bg-[var(--color-surface-default)] ${spacing.px25} ${spacing.py15} text-xs sm:text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-canvas)] ${transitions.colors}`,
  toggleInput: "peer sr-only",
  toggleShell: `relative inline-flex h-5 w-9 shrink-0 items-center ${radius.full}`,
  toggleTrackBg: `pointer-events-none absolute inset-0 ${radius.full} ${border.default} bg-[var(--color-border-muted)] ${transitions.colors200} peer-checked:border-[var(--color-brand-primary)] peer-checked:bg-[var(--color-brand-primary)] peer-disabled:opacity-50`,
  toggleThumb: `pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 ${radius.full} bg-[var(--color-surface-default)] ${shadows.sm} ${transitions.transform200} peer-checked:translate-x-4 peer-disabled:opacity-50`,
  toggleLabel: `flex items-center justify-between ${spacing.gap2} cursor-pointer ${typography.bodyXsSm} leading-tight ${spacing.py05}`,
} as const;

const actionBarBtnPrimary = `${button.actionBar} ${button.actionBarPrimary}`;
const actionBarBtnSave = `${button.actionBar} ${button.actionBarSave}`;
const actionBarBtnNeutral = `${button.actionBar} ${button.outline} ${shadows.hoverSm}`;
const actionBarBtnExport = `${button.actionBar} ${button.outline} min-w-[3.25rem] ${spacing.px3} font-medium ${shadows.hoverSm}`;

export const buttonComposed = {
  actionBarPrimary: actionBarBtnPrimary,
  actionBarSave: actionBarBtnSave,
  actionBarNeutral: actionBarBtnNeutral,
  actionBarExport: actionBarBtnExport,
  sidebarPrimary: `w-full h-8 ${actionBarBtnPrimary} text-xs sm:text-sm font-semibold min-w-0`,
  sidebarSecondary: `w-full h-8 ${button.outline} text-xs sm:text-sm font-medium min-w-0`,
} as const;

const sidebarWidthDesktop = "w-[280px] max-w-[280px]";
const sidebarWidthTablet = "w-[240px] max-w-[240px]";
const sidebarWidthCollapsed = "w-16 max-w-[4rem]";
/** CRP-6.3 — presentation suppress (AppShell sidebar region stays mounted). */
const sidebarWidthHidden = "w-0 max-w-0 min-w-0";
/** UX-1.1 — denser panel chrome; color transitions only (Design System motion direction). */
const sidebarShellChrome = `shrink-0 bg-[var(--color-surface-default)] ${border.right} flex-col min-h-screen ${transitions.colors200}`;
/** CRP-6.2 — subordinate Proyecto rail; keep 240px so workspace remains protagonist. */
const sidebarShellExpanded = `hidden lg:flex ${sidebarWidthTablet} ${sidebarShellChrome} ${transitions.all200}`;
const sidebarShellCollapsed = `hidden lg:flex ${sidebarWidthCollapsed} ${sidebarShellChrome} overflow-hidden ${transitions.all200}`;
const sidebarShellHidden = `hidden lg:flex ${sidebarWidthHidden} overflow-hidden border-0 opacity-0 pointer-events-none ${transitions.all200}`;

export const sidebar = {
  divider: `${border.top} my-1.5`,
  widthDesktop: sidebarWidthDesktop,
  widthTablet: sidebarWidthTablet,
  widthCollapsed: sidebarWidthCollapsed,
  widthHidden: sidebarWidthHidden,
  shellExpanded: sidebarShellExpanded,
  shellCollapsed: sidebarShellCollapsed,
  shellHidden: sidebarShellHidden,
  shell: sidebarShellExpanded,
  overlayOpen: `fixed inset-y-0 left-0 ${zIndex.modal} flex flex-col bg-[var(--color-surface-default)] ${border.right} ${elevation.medium} opacity-100 pointer-events-auto ${transitions.colors200}`,
  overlayClosed:
    "hidden pointer-events-none opacity-0 fixed inset-y-0 left-0",
  overlayBackdrop: `fixed inset-0 ${zIndex.sticky} bg-[var(--color-text-primary)]/40 opacity-100 pointer-events-auto ${transitions.colors200}`,
  mobileTrigger: `fixed top-3 left-3 ${zIndex.dropdown} lg:hidden inline-flex items-center justify-center ${radius.md} ${border.default} bg-[var(--color-surface-default)] ${spacing.p2} text-[var(--color-text-primary)] ${shadows.sm} hover:bg-[var(--color-surface-canvas)] ${DS_FOCUS_RING} ${transitions.colors200}`,
  header: `${spacing.px25} ${spacing.py2} ${border.bottom} flex items-center ${spacing.gap2}`,
  collapseToggle: `inline-flex shrink-0 items-center justify-center ${radius.md} p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-canvas)] hover:text-[var(--color-text-primary)] ${DS_FOCUS_RING} ${transitions.colors200}`,
  sectionGap: `flex-1 overflow-y-auto ${spacing.px25} ${spacing.py2} space-y-2`,
  sectionGapCollapsed: `flex-1 overflow-y-auto overflow-x-hidden ${spacing.px15} ${spacing.py15} ${spacing.spaceY15}`,
  railHide: "hidden",
  railSectionWrap:
    "[&>div>button>span:last-child]:sr-only [&>div>button]:justify-center [&>div>button]:px-0",
  sectionSpacing: spacing.spaceY15,
  sectionHeader: `flex w-full items-center ${spacing.gap2} ${spacing.py1} text-left text-[10px] font-semibold uppercase tracking-[0.09em] text-[var(--color-text-primary)] ${transitions.colors200}`,
  sectionBody: `${spacing.spaceY05} pb-1 pt-0.5`,
  sectionLabel: typography.sidebarSectionLabel,
  navItem: `flex w-full items-center justify-between gap-1.5 ${radius.md} ${spacing.px2} ${spacing.py1} text-left text-xs text-[var(--color-text-primary)] ${transitions.colors200} ${DS_FOCUS_RING}`,
  navItemHover:
    "hover:bg-[var(--color-surface-canvas)] hover:text-[var(--color-text-primary)]",
  navItemActive:
    "bg-[var(--color-brand-primary)]/10 text-[var(--color-text-primary)] font-semibold ring-1 ring-inset ring-[var(--color-brand-primary)]/25",
  navItemPressed: "",
  navItemDisabled:
    "opacity-50 cursor-not-allowed text-[var(--color-text-muted)] hover:bg-transparent hover:text-[var(--color-text-muted)]",
  graphItemActive: `bg-[var(--color-brand-primary)]/10 border-[var(--color-brand-primary)] text-[var(--color-text-primary)] ${shadows.sm} ring-1 ring-[var(--color-brand-primary)]/25 font-medium`,
  graphItemIdle: `${border.color} text-[var(--color-text-primary)] hover:bg-[var(--color-surface-canvas)] hover:border-[var(--color-text-muted)]`,
  btnPrimary: buttonComposed.sidebarPrimary,
  btnSecondary: buttonComposed.sidebarSecondary,
  soonBadge: `inline-flex shrink-0 items-center ${radius.md} ${border.default} bg-[var(--color-surface-canvas)] px-1.5 ${spacing.py05} text-[9px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]`,
} as const;

/* -------------------------------------------------------------------------- */
/* Toolbar compositions (D49.2 — Adaptive Toolbar; primitives only)           */
/* -------------------------------------------------------------------------- */

/**
 * Shell chrome for Adaptive Toolbar — values from existing primitives only.
 * UX-2.2 Visual Token Alignment: denser section rhythm, hairline separator,
 * focus-visible action chrome, raised active — Design System via --color-*.
 */
export const toolbar = {
  root: `w-full flex flex-col ${border.bottom} bg-[var(--color-surface-default)] ${spacing.px25} ${spacing.py15} ${elevation.flat} ${transitions.colors200}`,
  section: `w-full ${spacing.spaceY15}`,
  sectionLeft: `w-full ${spacing.spaceY15}`,
  sectionCenter: `w-full ${spacing.spaceY15}`,
  sectionRight: `w-full ${spacing.spaceY15}`,
  group: `flex flex-wrap items-center gap-1.5`,
  groupCompact: `flex flex-wrap items-center ${spacing.px1} gap-1.5`,
  action: `${button.outlineSm} ${DS_FOCUS_RING}`,
  actionActive: `${button.outlineSm} ${border.accentSoft} bg-[var(--color-brand-primary)]/10 text-[var(--color-text-primary)] ${shadows.sm} ${DS_FOCUS_RING}`,
  actionDisabled: "opacity-50 cursor-not-allowed",
  overflow: "",
  height: "h-7",
  gap: "gap-1.5",
  padding: spacing.px25,
  border: border.bottom,
  background: "bg-[var(--color-surface-default)]",
  radius: radius.md,
  shadow: elevation.flat,
} as const;

/* -------------------------------------------------------------------------- */
/* Inspector compositions (D50.2 — Dock Shell; primitives only)               */
/* -------------------------------------------------------------------------- */

/** Empty dock chrome — values from existing primitives only. No new colors. */
export const inspector = {
  defaultWidth: 320,
  width: "w-80",
  padding: spacing.p3,
  gap: spacing.gap2,
  headerHeight: "h-9",
  sectionSpacing: spacing.spaceY2,
  borderRadius: radius.lg,
  background: "bg-[var(--color-surface-default)]",
  panel: `${radius.lg} ${border.default} bg-[var(--color-surface-default)] ${shadows.sm}`,
  root: `fixed inset-y-0 right-0 flex shrink-0 flex-col border-l ${border.color} bg-[var(--color-surface-default)] ${elevation.low} ${zIndex.raised}`,
  header: `flex shrink-0 items-center ${spacing.px3} ${spacing.py2} ${border.bottom} bg-[var(--color-surface-default)]`,
  title: typography.subsectionHeading,
  /** UX-I3 — Canvas-tinted body strengthens hierarchy vs chrome header. */
  body: `flex-1 min-h-0 overflow-y-auto ${spacing.p3} ${spacing.spaceY2} bg-[var(--color-surface-canvas)]`,
  section: spacing.spaceY15,
  sectionHeader: typography.sectionLabel,
} as const;

/* -------------------------------------------------------------------------- */
/* Dock compositions (D51.2 — Docking Foundation; numeric only)               */
/* -------------------------------------------------------------------------- */

/** Dock geometry / timing — numbers only. No Tailwind. No class strings. */
export const dock = {
  leftWidth: 280,
  rightWidth: 320,
  bottomHeight: 240,
  minPanelWidth: 240,
  minPanelHeight: 160,
  splitterSize: 4,
  animationDuration: 200,
  zIndex: 10,
} as const;

/* -------------------------------------------------------------------------- */
/* UI_TOKENS — public consolidated surface                                    */
/* -------------------------------------------------------------------------- */

export const UI_TOKENS = {
  layout,
  spacing,
  radius,
  border,
  typography,
  transition: transitions,
  shadow: shadows,
  elevation,
  animation,
  zIndex,
  workspace,
  panel,
  button: {
    ...button,
    ...buttonComposed,
  },
  sidebar,
  toolbar,
  inspector,
  dock,
} as const;

export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radius;
export type ShadowToken = keyof typeof shadows;
export type TransitionToken = keyof typeof transitions;
export type AnimationToken = keyof typeof animation;
export type ZIndexToken = keyof typeof zIndex;
export type ElevationToken = keyof typeof elevation;
export type BorderToken = keyof typeof border;
export type TypographyToken = keyof typeof typography;
export type UiTokens = typeof UI_TOKENS;
