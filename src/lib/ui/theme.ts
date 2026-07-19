/**
 * D45 Theme — single source of truth for reusable visual class strings.
 * Strings are copied verbatim from page.tsx / projectFileUiStyles.ts (D45.1 baseline).
 * D46.2: sidebar nav state helpers (active/hover/pressed/disabled) via --app-* only.
 */

import type { ThemeMode } from "@/lib/app-preferences";

import { animation, elevation, transitions, zIndex } from "./tokens";

export const appShellLight =
  "bg-slate-50 text-[var(--app-text)] transition-colors duration-200 [--app-surface:#ffffff] [--app-surface-muted:#f8fafc] [--app-border:#e2e8f0] [--app-text:#334155] [--app-text-muted:#64748b] [--app-heading:#0f172a] [--app-accent:#2563eb] [--app-success:#16a34a] [--app-warning:#d97706] [--app-danger:#dc2626] [--app-success-bg:#dcfce7] [--app-success-text:#166534] [--app-info-bg:#fef3c7] [--app-info-text:#92400e] [--app-danger-bg:#fef2f2] [--app-danger-border:#fecaca] [--app-danger-text:#b91c1c] [--app-warning-bg:#fffbeb] [--app-warning-border:#fde68a] [--app-warning-text:#92400e] [--app-toggle-track:#e2e8f0] [--app-toggle-thumb:#ffffff]";

export const appShellDark =
  "bg-[#0f172a] text-[var(--app-text)] transition-colors duration-200 [--app-surface:#111827] [--app-surface-muted:#1f2937] [--app-border:#334155] [--app-text:#e5e7eb] [--app-text-muted:#94a3b8] [--app-heading:#e5e7eb] [--app-accent:#3b82f6] [--app-success:#22c55e] [--app-warning:#f59e0b] [--app-danger:#ef4444] [--app-success-bg:#052e16] [--app-success-text:#86efac] [--app-info-bg:#451a03] [--app-info-text:#fcd34d] [--app-danger-bg:#450a0a] [--app-danger-border:#7f1d1d] [--app-danger-text:#fca5a5] [--app-warning-bg:#422006] [--app-warning-border:#78350f] [--app-warning-text:#fcd34d] [--app-toggle-track:#334155] [--app-toggle-thumb:#e5e7eb]";

export const getAppShell = (mode: ThemeMode) =>
  mode === "dark" ? appShellDark : appShellLight;

export const card =
  "rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm p-3 sm:p-4 transition-colors duration-200";

export const panelHeading =
  "text-sm sm:text-base font-semibold text-[var(--app-heading)] tracking-tight";

export const panelHeadingSubtext =
  "text-xs sm:text-sm text-[var(--app-text-muted)] mt-0.5";

export const sectionLabel =
  "text-xs font-semibold uppercase tracking-wider text-[var(--app-text-muted)] mb-1.5";

export const subsectionCard =
  "rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-2 space-y-2 transition-colors duration-200";

export const subsectionHeading =
  "text-xs sm:text-sm font-semibold text-[var(--app-heading)]";

export const contentPanel =
  "rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1.5 text-xs sm:text-sm text-[var(--app-text)] transition-colors duration-200";

export const emptyState =
  "rounded-lg border border-dashed border-[var(--app-border)] bg-[var(--app-surface-muted)] px-2.5 py-2.5 text-xs sm:text-sm text-[var(--app-text-muted)] text-center transition-colors duration-200";

export const resultsEmptyState =
  "rounded-lg border border-dashed border-[var(--app-border)] bg-[var(--app-surface-muted)] px-2.5 py-1.5 text-xs sm:text-sm text-[var(--app-text-muted)] text-center transition-colors duration-200";

export const resultsTextCard =
  "rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1.5 text-xs sm:text-sm text-[var(--app-text)] leading-snug";

export const resultsGrid =
  "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-2";

export const resultsSubsectionCard =
  "rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-2 space-y-1.5 transition-colors duration-200";

export const resultsPanelFull = "lg:col-span-2 xl:col-span-2";

export const resultsPanelCompact = "min-w-0";

export const resultsCompactGrid =
  "grid grid-cols-1 lg:grid-cols-2 gap-2 lg:col-span-2 xl:col-span-2";

export const persistenceBadge =
  "inline-flex shrink-0 items-center rounded border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[var(--app-text-muted)]";

export const dataEmptyState =
  "rounded-lg border border-dashed border-[var(--app-border)] bg-[var(--app-surface-muted)] px-2.5 py-1.5 text-xs sm:text-sm text-[var(--app-text-muted)]";

export const dataDatasetCard =
  "rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-2 space-y-1.5 transition-colors duration-200";

export const dataImportPanel =
  "rounded-lg border-2 border-[var(--app-accent)]/35 bg-[var(--app-accent)]/5 shadow-sm";

export const dataAdvancedPanel = "border-dashed opacity-95";

export const dataSemanticHint =
  "text-[11px] sm:text-xs text-[var(--app-text-muted)] leading-snug";

export const fieldLabel =
  "block text-xs font-medium text-[var(--app-heading)] mb-1";

export const inputField =
  "w-full h-9 border border-[var(--app-border)] rounded-lg px-2.5 text-sm text-[var(--app-heading)] bg-[var(--app-surface)] placeholder:text-[var(--app-text-muted)] shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]/20 focus:border-[var(--app-accent)]";

export const btnPrimary =
  "inline-flex h-9 items-center justify-center font-semibold text-white text-sm px-4 rounded-lg shadow-sm transition-colors duration-200 hover:shadow-md active:scale-[0.98]";

export const btnOutline =
  "inline-flex h-9 items-center justify-center border border-[var(--app-border)] bg-[var(--app-surface)] px-3 rounded-lg text-sm text-[var(--app-text)] shadow-sm transition-colors duration-200 hover:bg-[var(--app-surface-muted)] hover:border-[var(--app-text-muted)] hover:shadow disabled:opacity-50 disabled:cursor-not-allowed";

export const btnOutlineSm =
  "inline-flex h-7 items-center justify-center border border-[var(--app-border)] bg-[var(--app-surface)] px-2 rounded-md text-xs text-[var(--app-text)] shadow-sm transition-colors duration-200 hover:bg-[var(--app-surface-muted)] hover:border-[var(--app-text-muted)]";

export const alertBase =
  "rounded-lg border px-3 py-2 text-xs sm:text-sm font-medium transition-colors duration-200";

export const alertError = `${alertBase} border-[var(--app-danger-border)] bg-[var(--app-danger-bg)] text-[var(--app-danger-text)]`;

export const alertWarning = `${alertBase} border-[var(--app-warning-border)] bg-[var(--app-warning-bg)] text-[var(--app-warning-text)]`;

export const toggleInput = "peer sr-only";

export const toggleShell =
  "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full";

export const toggleTrackBg =
  "pointer-events-none absolute inset-0 rounded-full border border-[var(--app-border)] bg-[var(--app-toggle-track)] transition-colors duration-200 peer-checked:border-[var(--app-accent)] peer-checked:bg-[var(--app-accent)] peer-disabled:opacity-50";

export const toggleThumb =
  "pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-[var(--app-toggle-thumb)] shadow-sm transition-transform duration-200 peer-checked:translate-x-4 peer-disabled:opacity-50";

export const toggleLabel =
  "flex items-center justify-between gap-2 cursor-pointer text-xs sm:text-sm text-[var(--app-text)] leading-tight py-0.5";

export const actionBarBtn =
  "inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-semibold shadow-sm transition-colors duration-200 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm";

export const actionBarBtnPrimary = `${actionBarBtn} bg-emerald-600 text-white hover:bg-emerald-700 min-w-[7.5rem]`;

export const actionBarBtnSave = `${actionBarBtn} border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 min-w-[7.5rem]`;

export const actionBarBtnNeutral = `${actionBarBtn} ${btnOutline} hover:shadow-sm`;

export const actionBarBtnExport = `${actionBarBtn} ${btnOutline} min-w-[3.25rem] px-3 font-medium hover:shadow-sm`;

export const actionBarGroup = "flex flex-wrap items-center gap-2";

export const actionBarDivider =
  "hidden sm:block h-7 w-px shrink-0 bg-[var(--app-border)]";

/** Divider between major sidebar blocks — border via --app-border only. */
export const sidebarDivider = "border-t border-[var(--app-border)] my-2";

/**
 * Width tokens (D46.3 / D46.4) — sole numeric source for sidebar chrome.
 * Components must reference these exports; never literal widths.
 */
export const sidebarWidthDesktop = "w-[280px] max-w-[280px]";
export const sidebarWidthTablet = "w-[240px] max-w-[240px]";
export const sidebarWidthCollapsed = "w-16 max-w-[4rem]";

const sidebarShellChrome = `shrink-0 bg-[var(--app-surface)] border-r border-[var(--app-border)] flex-col min-h-screen ${transitions.all200}`;

/**
 * Expanded shell — in-flow from lg up (tablet width), desktop width from xl.
 * Hidden below lg so mobile never pushes main layout (drawer owns mobile).
 */
export const sidebarShellExpanded = `hidden lg:flex ${sidebarWidthTablet} xl:w-[280px] xl:max-w-[280px] ${sidebarShellChrome}`;

/** Collapsed rail shell — desktop/tablet only; width via sidebarWidthCollapsed. */
export const sidebarShellCollapsed = `hidden lg:flex ${sidebarWidthCollapsed} ${sidebarShellChrome} overflow-hidden`;

/**
 * Default shell export (D45 gate / expanded baseline).
 * Prefer sidebarShellExpanded / sidebarShellCollapsed in D46 chrome.
 */
export const sidebarShell = sidebarShellExpanded;

/**
 * Mobile drawer open — centralizes fixed / inset / z-index / opacity / pointer-events.
 * Width via sidebarWidthDesktop (composed by Sidebar).
 */
export const sidebarOverlayOpen = `fixed inset-y-0 left-0 ${zIndex.modal} flex flex-col bg-[var(--app-surface)] border-r border-[var(--app-border)] ${elevation.medium} opacity-100 pointer-events-auto ${transitions.all200}`;

/** Mobile drawer closed — out of flow, non-interactive. */
export const sidebarOverlayClosed =
  "hidden pointer-events-none opacity-0 fixed inset-y-0 left-0";

/** Backdrop behind mobile drawer — click closes; --app-* only. */
export const sidebarOverlayBackdrop = `fixed inset-0 ${zIndex.sticky} bg-[var(--app-heading)]/40 opacity-100 pointer-events-auto ${transitions.colors200}`;

/** Fixed trigger to open mobile drawer (lg:hidden). */
export const sidebarMobileTrigger = `fixed top-3 left-3 ${zIndex.dropdown} lg:hidden inline-flex items-center justify-center rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-2 text-[var(--app-text)] shadow-sm hover:bg-[var(--app-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]/30 ${transitions.all200} ${animation.activeScale}`;

/** Sidebar chrome header (title row). */
export const sidebarHeader =
  "px-3 py-2.5 border-b border-[var(--app-border)] flex items-center gap-2";

/** Collapse / expand rail toggle — native button; focus via --app-accent. */
export const sidebarCollapseToggle = `inline-flex shrink-0 items-center justify-center rounded-lg p-1.5 text-[var(--app-text-muted)] hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-heading)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]/30 ${transitions.all200} ${animation.activeScale}`;

/**
 * Scroll body: consistent padding + gap between major sections/groups.
 * D46.1 hierarchy — components must use this instead of ad-hoc space-y.
 */
export const sidebarSectionGap =
  "flex-1 overflow-y-auto px-3 py-2.5 space-y-2.5";

/** Scroll body when rail collapsed — tighter padding. */
export const sidebarSectionGapCollapsed =
  "flex-1 overflow-y-auto overflow-x-hidden px-1.5 py-2 space-y-2";

/** Hide chrome labels/hints marked for rail compact mode. */
export const sidebarRailHide = "hidden";

/** Section wrapper in rail: keep icons, hide title text (last span). */
export const sidebarRailSectionWrap =
  "[&>div>button>span:last-child]:sr-only [&>div>button]:justify-center [&>div>button]:px-0";

/** Inner vertical rhythm inside a group or section content stack. */
export const sidebarSectionSpacing = "space-y-1.5";

/** Accordion / section title button — uppercase + tracking via theme. */
export const sidebarSectionHeader =
  "flex w-full items-center gap-2 py-1.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--app-heading)] transition-all duration-200";

/** Content pad under an open section header. */
export const sidebarSectionBody = "space-y-0.5 pb-1 pt-0.5";

export const sidebarSectionLabel =
  "text-[11px] font-semibold uppercase tracking-wider text-[var(--app-text-muted)]";

/** Idle nav row — focus ring via --app-accent. */
export const sidebarNavItem =
  "flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-xs sm:text-sm text-[var(--app-text)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]/30";

/** Hover — surface muted only (--app-*). */
export const sidebarNavItemHover =
  "hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-heading)]";

/** Active — open panel / selected nav signal (visual only). */
export const sidebarNavItemActive =
  "bg-[var(--app-accent)]/10 text-[var(--app-heading)] font-semibold ring-1 ring-inset ring-[var(--app-accent)]/25";

/** Pressed — existing animation token (no new motion). */
export const sidebarNavItemPressed = animation.activeScale;

/** Disabled — centralized; keep interactive affordance off. */
export const sidebarNavItemDisabled =
  "opacity-60 cursor-not-allowed text-[var(--app-text-muted)] hover:bg-transparent hover:text-[var(--app-text-muted)]";

export const sidebarGraphItemActive =
  "bg-[var(--app-accent)]/10 border-[var(--app-accent)] text-[var(--app-heading)] shadow-sm ring-1 ring-[var(--app-accent)]/25 font-medium";

export const sidebarGraphItemIdle =
  "border-[var(--app-border)] text-[var(--app-text)] hover:bg-[var(--app-surface-muted)] hover:border-[var(--app-text-muted)]";

export const sidebarBtnPrimary = `w-full h-8 ${actionBarBtnPrimary} text-xs sm:text-sm font-semibold min-w-0`;

export const sidebarBtnSecondary = `w-full h-8 ${btnOutline} text-xs sm:text-sm font-medium min-w-0`;

export const sidebarSoonBadge =
  "inline-flex shrink-0 items-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--app-text-muted)]";

/** Project-file UI variants (exact strings from former projectFileUiStyles.ts). */
export const projectFileFieldLabel =
  "block text-xs font-semibold uppercase tracking-wider text-[var(--app-text-muted)]";

export const projectFileInputField =
  "w-full h-8 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1.5 text-sm text-[var(--app-text)] placeholder:text-[var(--app-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]/25";

export const projectFileBtnPrimary =
  "rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-700 transition-colors";

export const projectFileBtnSave =
  "rounded-lg border border-emerald-600 bg-emerald-600 px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-700 transition-colors";

export const projectFileBtnSecondary =
  "rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1.5 text-xs sm:text-sm font-medium text-[var(--app-text)] hover:bg-[var(--app-surface-muted)] transition-colors";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "outlineSm"
  | "ghost"
  | "danger"
  | "actionPrimary"
  | "actionSave"
  | "actionNeutral"
  | "actionExport"
  | "sidebarPrimary"
  | "sidebarSecondary"
  | "projectPrimary"
  | "projectSave"
  | "projectSecondary";

export type PanelStyleVariant =
  | "card"
  | "content"
  | "subsection"
  | "empty"
  | "resultsEmpty"
  | "resultsText"
  | "resultsSubsection"
  | "dataEmpty"
  | "dataDataset";

export type BadgeStyleKind = "persistence" | "soon" | "muted";

export type StatusColorKind =
  | "success"
  | "warning"
  | "danger"
  | "muted"
  | "accent"
  | "info";

export function getButtonVariant(variant: ButtonVariant): string {
  switch (variant) {
    case "primary":
      return btnPrimary;
    case "secondary":
    case "outline":
      return btnOutline;
    case "outlineSm":
      return btnOutlineSm;
    case "ghost":
      return sidebarNavItem;
    case "danger":
      return `${actionBarBtn} bg-[var(--app-danger)] text-white`;
    case "actionPrimary":
      return actionBarBtnPrimary;
    case "actionSave":
      return actionBarBtnSave;
    case "actionNeutral":
      return actionBarBtnNeutral;
    case "actionExport":
      return actionBarBtnExport;
    case "sidebarPrimary":
      return sidebarBtnPrimary;
    case "sidebarSecondary":
      return sidebarBtnSecondary;
    case "projectPrimary":
      return projectFileBtnPrimary;
    case "projectSave":
      return projectFileBtnSave;
    case "projectSecondary":
      return projectFileBtnSecondary;
    default: {
      const _exhaustive: never = variant;
      return _exhaustive;
    }
  }
}

export function getPanelStyle(variant: PanelStyleVariant): string {
  switch (variant) {
    case "card":
      return card;
    case "content":
      return contentPanel;
    case "subsection":
      return subsectionCard;
    case "empty":
      return emptyState;
    case "resultsEmpty":
      return resultsEmptyState;
    case "resultsText":
      return resultsTextCard;
    case "resultsSubsection":
      return resultsSubsectionCard;
    case "dataEmpty":
      return dataEmptyState;
    case "dataDataset":
      return dataDatasetCard;
    default: {
      const _exhaustive: never = variant;
      return _exhaustive;
    }
  }
}

export function getBadgeStyle(kind: BadgeStyleKind): string {
  switch (kind) {
    case "persistence":
      return persistenceBadge;
    case "soon":
      return sidebarSoonBadge;
    case "muted":
      return persistenceBadge;
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function getStatusColor(status: StatusColorKind): string {
  switch (status) {
    case "success":
      return "text-[var(--app-success)]";
    case "warning":
      return "text-[var(--app-warning)]";
    case "danger":
      return "text-[var(--app-danger)]";
    case "muted":
      return "text-[var(--app-text-muted)]";
    case "accent":
      return "text-[var(--app-accent)]";
    case "info":
      return "text-[var(--app-info-text)]";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}
