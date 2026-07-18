/**
 * D45 Icon Registry — maps semantic keys to existing emoji/ASCII glyphs.
 * No icon libraries; glyphs match current UI copy.
 */

export const UI_ICONS = {
  dashboard: "📊",
  modules: "🧩",
  advisor: "🧠",
  reports: "📄",
  library: "📚",
  settings: "⚙",
  history: "🕘",
  activity: "📋",
  save: "💾",
  export: "📤",
  open: "📂",
  expand: "▶",
  collapse: "▼",
  mathematics: "🧮",
  statistics: "📉",
  inference: "🧪",
  visualization: "📊",
  themeLight: "☀",
  themeDark: "🌙",
  add: "➕",
  remove: "➖",
  stop: "⏹",
  statusOk: "✔",
  statusPartial: "◐",
  statusWarning: "⚠",
  statusUnknown: "?",
} as const;

export type UiIconName = keyof typeof UI_ICONS;

export function getIcon(name: UiIconName): string {
  return UI_ICONS[name];
}
