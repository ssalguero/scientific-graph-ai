/**
 * D45 Theme — public class-string API + helpers.
 * D48.2: values delegated to UI_TOKENS (move-only); no visual / API changes.
 */

import type { ThemeMode } from "@/lib/app-preferences";

import { UI_TOKENS } from "./tokens";

export const appShellLight = UI_TOKENS.layout.appShellLight;
export const appShellDark = UI_TOKENS.layout.appShellDark;

export const getAppShell = (mode: ThemeMode) =>
  mode === "dark" ? appShellDark : appShellLight;

export const card = UI_TOKENS.panel.card;
export const panelHeading = UI_TOKENS.typography.panelHeading;
export const panelHeadingSubtext = UI_TOKENS.typography.panelHeadingSubtext;
export const sectionLabel = UI_TOKENS.typography.sectionLabel;
export const subsectionCard = UI_TOKENS.panel.subsection;
export const subsectionHeading = UI_TOKENS.typography.subsectionHeading;
export const contentPanel = UI_TOKENS.panel.content;
export const emptyState = UI_TOKENS.panel.empty;
export const resultsEmptyState = UI_TOKENS.panel.resultsEmpty;
export const resultsTextCard = UI_TOKENS.panel.resultsText;
export const resultsGrid = UI_TOKENS.panel.resultsGrid;
export const resultsSubsectionCard = UI_TOKENS.panel.resultsSubsection;
export const resultsPanelFull = UI_TOKENS.panel.resultsPanelFull;
export const resultsPanelCompact = UI_TOKENS.panel.resultsPanelCompact;
export const resultsCompactGrid = UI_TOKENS.panel.resultsCompactGrid;
export const persistenceBadge = UI_TOKENS.panel.persistenceBadge;
export const dataEmptyState = UI_TOKENS.panel.dataEmpty;
export const dataDatasetCard = UI_TOKENS.panel.dataDataset;
export const dataImportPanel = UI_TOKENS.panel.dataImport;
export const dataAdvancedPanel = UI_TOKENS.panel.dataAdvanced;
export const dataSemanticHint = UI_TOKENS.typography.dataSemanticHint;
export const fieldLabel = UI_TOKENS.typography.fieldLabel;
export const inputField = UI_TOKENS.panel.inputField;

export const btnPrimary = UI_TOKENS.button.primary;
export const btnOutline = UI_TOKENS.button.outline;
export const btnOutlineSm = UI_TOKENS.button.outlineSm;

export const alertBase = UI_TOKENS.panel.alertBase;
export const alertError = `${alertBase} border-[var(--app-danger-border)] bg-[var(--app-danger-bg)] text-[var(--app-danger-text)]`;
export const alertWarning = `${alertBase} border-[var(--app-warning-border)] bg-[var(--app-warning-bg)] text-[var(--app-warning-text)]`;

export const toggleInput = UI_TOKENS.button.toggleInput;
export const toggleShell = UI_TOKENS.button.toggleShell;
export const toggleTrackBg = UI_TOKENS.button.toggleTrackBg;
export const toggleThumb = UI_TOKENS.button.toggleThumb;
export const toggleLabel = UI_TOKENS.button.toggleLabel;

export const actionBarBtn = UI_TOKENS.button.actionBar;
export const actionBarBtnPrimary = UI_TOKENS.button.actionBarPrimary;
export const actionBarBtnSave = UI_TOKENS.button.actionBarSave;
export const actionBarBtnNeutral = UI_TOKENS.button.actionBarNeutral;
export const actionBarBtnExport = UI_TOKENS.button.actionBarExport;
export const actionBarGroup = UI_TOKENS.button.actionBarGroup;
export const actionBarDivider = UI_TOKENS.button.actionBarDivider;

/** Divider between major sidebar blocks — border via --app-border only. */
export const sidebarDivider = UI_TOKENS.sidebar.divider;

/**
 * Width tokens (D46.3 / D46.4) — sole numeric source for sidebar chrome.
 * Components must reference these exports; never literal widths.
 */
export const sidebarWidthDesktop = UI_TOKENS.sidebar.widthDesktop;
export const sidebarWidthTablet = UI_TOKENS.sidebar.widthTablet;
export const sidebarWidthCollapsed = UI_TOKENS.sidebar.widthCollapsed;

/**
 * Expanded shell — in-flow from lg up (tablet width), desktop width from xl.
 * Hidden below lg so mobile never pushes main layout (drawer owns mobile).
 */
export const sidebarShellExpanded = UI_TOKENS.sidebar.shellExpanded;

/** Collapsed rail shell — desktop/tablet only; width via sidebarWidthCollapsed. */
export const sidebarShellCollapsed = UI_TOKENS.sidebar.shellCollapsed;

/**
 * Default shell export (D45 gate / expanded baseline).
 * Prefer sidebarShellExpanded / sidebarShellCollapsed in D46 chrome.
 */
export const sidebarShell = UI_TOKENS.sidebar.shell;

/**
 * Mobile drawer open — centralizes fixed / inset / z-index / opacity / pointer-events.
 * Width via sidebarWidthDesktop (composed by Sidebar).
 */
export const sidebarOverlayOpen = UI_TOKENS.sidebar.overlayOpen;

/** Mobile drawer closed — out of flow, non-interactive. */
export const sidebarOverlayClosed = UI_TOKENS.sidebar.overlayClosed;

/** Backdrop behind mobile drawer — click closes; --app-* only. */
export const sidebarOverlayBackdrop = UI_TOKENS.sidebar.overlayBackdrop;

/** Fixed trigger to open mobile drawer (lg:hidden). */
export const sidebarMobileTrigger = UI_TOKENS.sidebar.mobileTrigger;

/** Sidebar chrome header (title row). */
export const sidebarHeader = UI_TOKENS.sidebar.header;

/** Collapse / expand rail toggle — native button; focus via --app-accent. */
export const sidebarCollapseToggle = UI_TOKENS.sidebar.collapseToggle;

/**
 * Scroll body: consistent padding + gap between major sections/groups.
 * D46.1 hierarchy — components must use this instead of ad-hoc space-y.
 */
export const sidebarSectionGap = UI_TOKENS.sidebar.sectionGap;

/** Scroll body when rail collapsed — tighter padding. */
export const sidebarSectionGapCollapsed = UI_TOKENS.sidebar.sectionGapCollapsed;

/** Hide chrome labels/hints marked for rail compact mode. */
export const sidebarRailHide = UI_TOKENS.sidebar.railHide;

/** Section wrapper in rail: keep icons, hide title text (last span). */
export const sidebarRailSectionWrap = UI_TOKENS.sidebar.railSectionWrap;

/** Inner vertical rhythm inside a group or section content stack. */
export const sidebarSectionSpacing = UI_TOKENS.sidebar.sectionSpacing;

/** Accordion / section title button — uppercase + tracking via theme. */
export const sidebarSectionHeader = UI_TOKENS.sidebar.sectionHeader;

/** Content pad under an open section header. */
export const sidebarSectionBody = UI_TOKENS.sidebar.sectionBody;

export const sidebarSectionLabel = UI_TOKENS.sidebar.sectionLabel;

/** Idle nav row — focus ring via --app-accent. */
export const sidebarNavItem = UI_TOKENS.sidebar.navItem;

/** Hover — surface muted only (--app-*). */
export const sidebarNavItemHover = UI_TOKENS.sidebar.navItemHover;

/** Active — open panel / selected nav signal (visual only). */
export const sidebarNavItemActive = UI_TOKENS.sidebar.navItemActive;

/** Pressed — existing animation token (no new motion). */
export const sidebarNavItemPressed = UI_TOKENS.sidebar.navItemPressed;

/** Disabled — centralized; keep interactive affordance off. */
export const sidebarNavItemDisabled = UI_TOKENS.sidebar.navItemDisabled;

export const sidebarGraphItemActive = UI_TOKENS.sidebar.graphItemActive;
export const sidebarGraphItemIdle = UI_TOKENS.sidebar.graphItemIdle;

export const sidebarBtnPrimary = UI_TOKENS.sidebar.btnPrimary;
export const sidebarBtnSecondary = UI_TOKENS.sidebar.btnSecondary;

export const sidebarSoonBadge = UI_TOKENS.sidebar.soonBadge;

/** Project-file UI variants (exact strings from former projectFileUiStyles.ts). */
export const projectFileFieldLabel = UI_TOKENS.typography.projectFileFieldLabel;
export const projectFileInputField = UI_TOKENS.panel.projectFileInputField;
export const projectFileBtnPrimary = UI_TOKENS.button.projectPrimary;
export const projectFileBtnSave = UI_TOKENS.button.projectSave;
export const projectFileBtnSecondary = UI_TOKENS.button.projectSecondary;

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
