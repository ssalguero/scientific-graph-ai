/**
 * D48.2 — Design Tokens v2 · Token Consolidation (move-only).
 * Single source of truth for Tailwind class fragments + semantic compositions.
 * No new visual values; existing exports preserved for API Freeze.
 */

/* -------------------------------------------------------------------------- */
/* Primitives                                                                 */
/* -------------------------------------------------------------------------- */

export const spacing = {
  px1: "px-1",
  px15: "px-1.5",
  px2: "px-2",
  px25: "px-2.5",
  px3: "px-3",
  px4: "px-4",
  py05: "py-0.5",
  py1: "py-1",
  py15: "py-1.5",
  py2: "py-2",
  py25: "py-2.5",
  p2: "p-2",
  p3: "p-3",
  gap2: "gap-2",
  spaceY05: "space-y-0.5",
  spaceY15: "space-y-1.5",
  spaceY2: "space-y-2",
  spaceY3: "space-y-3",
  my15: "my-1.5",
  mb1: "mb-1",
  mb15: "mb-1.5",
  mt05: "mt-0.5",
  mt1: "mt-1",
} as const;

export const radius = {
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
} as const;

export const shadows = {
  sm: "shadow-sm",
  md: "shadow-md",
  hoverMd: "hover:shadow-md",
  hoverSm: "hover:shadow-sm",
  hover: "hover:shadow",
} as const;

export const transitions = {
  colors200: "transition-colors duration-200",
  colors300: "transition-colors duration-300",
  all200: "transition-all duration-200",
  transform200: "transition-transform duration-200",
  colors: "transition-colors",
} as const;

export const animation = {
  activeScale: "active:scale-[0.98]",
  duration200: "duration-200",
  duration300: "duration-300",
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

/** Elevation aliases — values derived from `shadows` (no duplicate literals). */
export const elevation = {
  flat: "shadow-none",
  low: shadows.sm,
  medium: shadows.md,
  interactive: `${shadows.sm} ${shadows.hoverMd}`,
} as const;

/** Border fragments previously inlined across theme compositions. */
export const border = {
  default: "border border-[var(--app-border)]",
  dashed: "border border-dashed border-[var(--app-border)]",
  color: "border-[var(--app-border)]",
  top: "border-t border-[var(--app-border)]",
  bottom: "border-b border-[var(--app-border)]",
  right: "border-r border-[var(--app-border)]",
  accentSoft: "border-2 border-[var(--app-accent)]/35",
  bare: "border",
} as const;

/** Typography / label fragments previously duplicated in theme. */
export const typography = {
  panelHeading:
    "text-sm sm:text-base font-semibold text-[var(--app-heading)] tracking-tight",
  panelHeadingSubtext:
    "text-xs sm:text-sm text-[var(--app-text-muted)] mt-0.5",
  sectionLabel:
    "text-xs font-semibold uppercase tracking-wider text-[var(--app-text-muted)] mb-1.5",
  subsectionHeading:
    "text-xs sm:text-sm font-semibold text-[var(--app-heading)]",
  fieldLabel: "block text-xs font-medium text-[var(--app-heading)] mb-1",
  dataSemanticHint:
    "text-[11px] sm:text-xs text-[var(--app-text-muted)] leading-snug",
  projectFileFieldLabel:
    "block text-xs font-semibold uppercase tracking-wider text-[var(--app-text-muted)]",
  sidebarSectionLabel:
    "text-[11px] font-semibold uppercase tracking-wider text-[var(--app-text-muted)]",
  bodyXsSm: "text-xs sm:text-sm text-[var(--app-text)]",
  mutedXsSm: "text-xs sm:text-sm text-[var(--app-text-muted)]",
} as const;

/* -------------------------------------------------------------------------- */
/* Layout · Workspace                                                         */
/* -------------------------------------------------------------------------- */

export const layout = {
  appShellLight: `bg-slate-50 text-[var(--app-text)] ${transitions.colors200} [--app-surface:#ffffff] [--app-surface-muted:#f8fafc] [--app-border:#e2e8f0] [--app-text:#334155] [--app-text-muted:#64748b] [--app-heading:#0f172a] [--app-accent:#2563eb] [--app-success:#16a34a] [--app-warning:#d97706] [--app-danger:#dc2626] [--app-success-bg:#dcfce7] [--app-success-text:#166534] [--app-info-bg:#fef3c7] [--app-info-text:#92400e] [--app-danger-bg:#fef2f2] [--app-danger-border:#fecaca] [--app-danger-text:#b91c1c] [--app-warning-bg:#fffbeb] [--app-warning-border:#fde68a] [--app-warning-text:#92400e] [--app-toggle-track:#e2e8f0] [--app-toggle-thumb:#ffffff]`,
  appShellDark: `bg-[#0f172a] text-[var(--app-text)] ${transitions.colors200} [--app-surface:#111827] [--app-surface-muted:#1f2937] [--app-border:#334155] [--app-text:#e5e7eb] [--app-text-muted:#94a3b8] [--app-heading:#e5e7eb] [--app-accent:#3b82f6] [--app-success:#22c55e] [--app-warning:#f59e0b] [--app-danger:#ef4444] [--app-success-bg:#052e16] [--app-success-text:#86efac] [--app-info-bg:#451a03] [--app-info-text:#fcd34d] [--app-danger-bg:#450a0a] [--app-danger-border:#7f1d1d] [--app-danger-text:#fca5a5] [--app-warning-bg:#422006] [--app-warning-border:#78350f] [--app-warning-text:#fcd34d] [--app-toggle-track:#334155] [--app-toggle-thumb:#e5e7eb]`,
} as const;

/** Canonical workspace shell strings (D47 freeze values — unchanged). */
export const workspace = {
  shell: "flex min-h-screen flex-col lg:flex-row",
  mainColumn: "flex-1 min-w-0 overflow-auto",
  inner: "w-full px-3 sm:px-4 lg:px-5 xl:px-6 py-2.5 sm:py-3 space-y-3",
} as const;

/* -------------------------------------------------------------------------- */
/* Panel · Button · Sidebar compositions (move-only from theme.ts)            */
/* -------------------------------------------------------------------------- */

const panelDatasetCard = `${radius.lg} ${border.default} bg-[var(--app-surface-muted)] ${spacing.p2} ${spacing.spaceY15} ${transitions.colors200}`;

export const panel = {
  card: `${radius.xl} ${border.default} bg-[var(--app-surface)] ${shadows.sm} ${spacing.p3} sm:p-4 ${transitions.colors200}`,
  content: `${radius.lg} ${border.default} bg-[var(--app-surface)] ${spacing.px25} ${spacing.py15} ${typography.bodyXsSm} ${transitions.colors200}`,
  subsection: `${radius.lg} ${border.default} bg-[var(--app-surface-muted)] ${spacing.p2} ${spacing.spaceY2} ${transitions.colors200}`,
  empty: `${radius.lg} ${border.dashed} bg-[var(--app-surface-muted)] ${spacing.px25} ${spacing.py25} ${typography.mutedXsSm} text-center ${transitions.colors200}`,
  resultsEmpty: `${radius.lg} ${border.dashed} bg-[var(--app-surface-muted)] ${spacing.px25} ${spacing.py15} ${typography.mutedXsSm} text-center ${transitions.colors200}`,
  resultsText: `${radius.lg} ${border.default} bg-[var(--app-surface)] ${spacing.px25} ${spacing.py15} ${typography.bodyXsSm} leading-snug`,
  resultsSubsection: panelDatasetCard,
  dataEmpty: `${radius.lg} ${border.dashed} bg-[var(--app-surface-muted)] ${spacing.px25} ${spacing.py15} ${typography.mutedXsSm}`,
  dataDataset: panelDatasetCard,
  dataImport: `${radius.lg} ${border.accentSoft} bg-[var(--app-accent)]/5 ${shadows.sm}`,
  dataAdvanced: "border-dashed opacity-95",
  resultsGrid: `grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 ${spacing.gap2}`,
  resultsPanelFull: "lg:col-span-2 xl:col-span-2",
  resultsPanelCompact: "min-w-0",
  resultsCompactGrid: `grid grid-cols-1 lg:grid-cols-2 ${spacing.gap2} lg:col-span-2 xl:col-span-2`,
  persistenceBadge:
    "inline-flex shrink-0 items-center rounded border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[var(--app-text-muted)]",
  alertBase: `${radius.lg} ${border.bare} ${spacing.px3} ${spacing.py2} text-xs sm:text-sm font-medium ${transitions.colors200}`,
  inputField: `w-full h-9 ${border.default} ${radius.lg} ${spacing.px25} text-sm text-[var(--app-heading)] bg-[var(--app-surface)] placeholder:text-[var(--app-text-muted)] ${shadows.sm} ${transitions.colors200} focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]/20 focus:border-[var(--app-accent)]`,
  projectFileInputField: `w-full h-8 ${radius.lg} ${border.default} bg-[var(--app-surface)] ${spacing.px25} ${spacing.py15} text-sm text-[var(--app-text)] placeholder:text-[var(--app-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]/25`,
} as const;

export const button = {
  primary: `inline-flex h-9 items-center justify-center font-semibold text-white text-sm ${spacing.px4} ${radius.lg} ${shadows.sm} ${transitions.colors200} ${shadows.hoverMd} ${animation.activeScale}`,
  outline: `inline-flex h-9 items-center justify-center ${border.default} bg-[var(--app-surface)] ${spacing.px3} ${radius.lg} text-sm text-[var(--app-text)] ${shadows.sm} ${transitions.colors200} hover:bg-[var(--app-surface-muted)] hover:border-[var(--app-text-muted)] ${shadows.hover} disabled:opacity-50 disabled:cursor-not-allowed`,
  outlineSm: `inline-flex h-7 items-center justify-center ${border.default} bg-[var(--app-surface)] ${spacing.px2} ${radius.md} text-xs text-[var(--app-text)] ${shadows.sm} ${transitions.colors200} hover:bg-[var(--app-surface-muted)] hover:border-[var(--app-text-muted)]`,
  actionBar: `inline-flex h-9 items-center justify-center ${radius.lg} ${spacing.px3} text-sm font-semibold ${shadows.sm} ${transitions.colors200} ${shadows.hoverMd} ${animation.activeScale} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm`,
  actionBarPrimary:
    "bg-emerald-600 text-white hover:bg-emerald-700 min-w-[7.5rem]",
  actionBarSave:
    "border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 min-w-[7.5rem]",
  actionBarGroup: `flex flex-wrap items-center ${spacing.gap2}`,
  actionBarDivider:
    "hidden sm:block h-7 w-px shrink-0 bg-[var(--app-border)]",
  projectPrimary: `${radius.lg} bg-emerald-600 ${spacing.px25} ${spacing.py15} text-xs sm:text-sm font-semibold text-white hover:bg-emerald-700 ${transitions.colors}`,
  projectSave: `${radius.lg} border border-emerald-600 bg-emerald-600 ${spacing.px25} ${spacing.py15} text-xs sm:text-sm font-semibold text-white hover:bg-emerald-700 ${transitions.colors}`,
  projectSecondary: `${radius.lg} ${border.default} bg-[var(--app-surface)] ${spacing.px25} ${spacing.py15} text-xs sm:text-sm font-medium text-[var(--app-text)] hover:bg-[var(--app-surface-muted)] ${transitions.colors}`,
  toggleInput: "peer sr-only",
  toggleShell: `relative inline-flex h-5 w-9 shrink-0 items-center ${radius.full}`,
  toggleTrackBg: `pointer-events-none absolute inset-0 ${radius.full} ${border.default} bg-[var(--app-toggle-track)] ${transitions.colors200} peer-checked:border-[var(--app-accent)] peer-checked:bg-[var(--app-accent)] peer-disabled:opacity-50`,
  toggleThumb: `pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 ${radius.full} bg-[var(--app-toggle-thumb)] ${shadows.sm} ${transitions.transform200} peer-checked:translate-x-4 peer-disabled:opacity-50`,
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
const sidebarShellChrome = `shrink-0 bg-[var(--app-surface)] ${border.right} flex-col min-h-screen ${transitions.all200}`;
const sidebarShellExpanded = `hidden lg:flex ${sidebarWidthTablet} xl:w-[280px] xl:max-w-[280px] ${sidebarShellChrome}`;
const sidebarShellCollapsed = `hidden lg:flex ${sidebarWidthCollapsed} ${sidebarShellChrome} overflow-hidden`;

export const sidebar = {
  divider: `${border.top} my-2`,
  widthDesktop: sidebarWidthDesktop,
  widthTablet: sidebarWidthTablet,
  widthCollapsed: sidebarWidthCollapsed,
  shellExpanded: sidebarShellExpanded,
  shellCollapsed: sidebarShellCollapsed,
  shell: sidebarShellExpanded,
  overlayOpen: `fixed inset-y-0 left-0 ${zIndex.modal} flex flex-col bg-[var(--app-surface)] ${border.right} ${elevation.medium} opacity-100 pointer-events-auto ${transitions.all200}`,
  overlayClosed:
    "hidden pointer-events-none opacity-0 fixed inset-y-0 left-0",
  overlayBackdrop: `fixed inset-0 ${zIndex.sticky} bg-[var(--app-heading)]/40 opacity-100 pointer-events-auto ${transitions.colors200}`,
  mobileTrigger: `fixed top-3 left-3 ${zIndex.dropdown} lg:hidden inline-flex items-center justify-center ${radius.lg} ${border.default} bg-[var(--app-surface)] ${spacing.p2} text-[var(--app-text)] ${shadows.sm} hover:bg-[var(--app-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]/30 ${transitions.all200} ${animation.activeScale}`,
  header: `${spacing.px3} ${spacing.py25} ${border.bottom} flex items-center ${spacing.gap2}`,
  collapseToggle: `inline-flex shrink-0 items-center justify-center ${radius.lg} p-1.5 text-[var(--app-text-muted)] hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-heading)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]/30 ${transitions.all200} ${animation.activeScale}`,
  sectionGap: `flex-1 overflow-y-auto ${spacing.px3} ${spacing.py25} space-y-2.5`,
  sectionGapCollapsed: `flex-1 overflow-y-auto overflow-x-hidden ${spacing.px15} ${spacing.py2} ${spacing.spaceY2}`,
  railHide: "hidden",
  railSectionWrap:
    "[&>div>button>span:last-child]:sr-only [&>div>button]:justify-center [&>div>button]:px-0",
  sectionSpacing: spacing.spaceY15,
  sectionHeader: `flex w-full items-center ${spacing.gap2} ${spacing.py15} text-left text-xs font-semibold uppercase tracking-wider text-[var(--app-heading)] ${transitions.all200}`,
  sectionBody: `${spacing.spaceY05} pb-1 pt-0.5`,
  sectionLabel: typography.sidebarSectionLabel,
  navItem: `flex w-full items-center justify-between ${spacing.gap2} ${radius.lg} ${spacing.px2} ${spacing.py15} text-left ${typography.bodyXsSm} ${transitions.all200} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]/30`,
  navItemHover:
    "hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-heading)]",
  navItemActive:
    "bg-[var(--app-accent)]/10 text-[var(--app-heading)] font-semibold ring-1 ring-inset ring-[var(--app-accent)]/25",
  navItemPressed: animation.activeScale,
  navItemDisabled:
    "opacity-60 cursor-not-allowed text-[var(--app-text-muted)] hover:bg-transparent hover:text-[var(--app-text-muted)]",
  graphItemActive: `bg-[var(--app-accent)]/10 border-[var(--app-accent)] text-[var(--app-heading)] ${shadows.sm} ring-1 ring-[var(--app-accent)]/25 font-medium`,
  graphItemIdle: `${border.color} text-[var(--app-text)] hover:bg-[var(--app-surface-muted)] hover:border-[var(--app-text-muted)]`,
  btnPrimary: buttonComposed.sidebarPrimary,
  btnSecondary: buttonComposed.sidebarSecondary,
  soonBadge: `inline-flex shrink-0 items-center ${radius.full} ${border.default} bg-[var(--app-surface-muted)] px-1.5 ${spacing.py05} text-[10px] font-semibold uppercase tracking-wide text-[var(--app-text-muted)]`,
} as const;

/* -------------------------------------------------------------------------- */
/* Toolbar compositions (D49.2 — Adaptive Toolbar; primitives only)           */
/* -------------------------------------------------------------------------- */

/** Shell chrome for Adaptive Toolbar — values from existing primitives only. */
export const toolbar = {
  root: "w-full",
  section: `w-full ${spacing.spaceY3}`,
  sectionLeft: `w-full ${spacing.spaceY3}`,
  sectionCenter: `w-full ${spacing.spaceY3}`,
  sectionRight: `w-full ${spacing.spaceY3}`,
  group: `flex flex-wrap items-center ${spacing.gap2}`,
  groupCompact: `flex flex-wrap items-center ${spacing.px1} ${spacing.gap2}`,
  action: button.outlineSm,
  actionActive: `${button.outlineSm} ${border.accentSoft} bg-[var(--app-accent)]/10`,
  actionDisabled: "opacity-50 cursor-not-allowed",
  overflow: "",
  height: "h-9",
  gap: spacing.gap2,
  padding: spacing.px25,
  border: border.bottom,
  background: "bg-[var(--app-surface)]",
  radius: radius.lg,
  shadow: shadows.sm,
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
  background: "bg-[var(--app-surface)]",
  panel: `${radius.lg} ${border.default} bg-[var(--app-surface)] ${shadows.sm}`,
  root: `fixed inset-y-0 right-0 flex shrink-0 flex-col border-l ${border.color} bg-[var(--app-surface)] ${elevation.low} ${zIndex.raised}`,
  header: `flex shrink-0 items-center ${spacing.px3} ${spacing.py2} ${border.bottom}`,
  title: typography.subsectionHeading,
  body: `flex-1 min-h-0 overflow-y-auto ${spacing.p3} ${spacing.spaceY2}`,
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
