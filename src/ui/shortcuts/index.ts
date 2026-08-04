/**
 * UX-6.4 — Shortcut System local barrel.
 * Not re-exported from @/ui (src/ui/index.ts) in this phase.
 */

export type { ShortcutId, ShortcutKey } from "./ShortcutTypes";
export { asShortcutId, asShortcutKey } from "./ShortcutTypes";

export type {
  ShortcutDefinition,
  ShortcutDefinitionInit,
} from "./ShortcutDefinition";
export { createShortcutDefinition } from "./ShortcutDefinition";

export { SHORTCUT_CATALOG } from "./ShortcutCatalog";

export type { ShortcutRegistration } from "./ShortcutRegistration";
export { createShortcutRegistration } from "./ShortcutRegistration";

export type { ShortcutRegistryApi } from "./ShortcutRegistry";
export {
  EMPTY_SHORTCUT_DEFINITIONS,
  createShortcutRegistry,
} from "./ShortcutRegistry";

export type { ShortcutRegistryBuildResult } from "./ShortcutRegistryBuilder";
export {
  buildShortcutRegistry,
  buildShortcutRegistryWithMeta,
  shortcutRegistry,
  shortcutBuildDuplicates,
} from "./ShortcutRegistryBuilder";

export type { ShortcutResolver } from "./ShortcutResolver";
export { createShortcutResolver } from "./ShortcutResolver";

export type { ShortcutDiagnosticsReport } from "./ShortcutDiagnostics";
export { createShortcutDiagnosticsReport } from "./ShortcutDiagnostics";
