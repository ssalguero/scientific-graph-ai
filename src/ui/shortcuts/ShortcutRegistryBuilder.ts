/**
 * UX-6.4 — Shortcut Registry Builder.
 *
 * Consumes SHORTCUT_CATALOG exclusively.
 * Build-time only — no dynamic registration · no React · no browser.
 */

import { SHORTCUT_CATALOG } from "./ShortcutCatalog";
import { createShortcutRegistration } from "./ShortcutRegistration";
import {
  createShortcutRegistry,
  type ShortcutRegistryApi,
} from "./ShortcutRegistry";
import type { ShortcutId } from "./ShortcutTypes";

export type ShortcutRegistryBuildResult = Readonly<{
  registry: ShortcutRegistryApi;
  duplicates: readonly ShortcutId[];
}>;

/**
 * Builds an immutable ShortcutRegistryApi from the official catalog.
 * Does not own the seed list — Catalog ownership ≠ Builder ownership.
 */
export function buildShortcutRegistry(): ShortcutRegistryApi {
  return buildShortcutRegistryWithMeta().registry;
}

/**
 * Build with duplicate metadata for diagnostics / validators.
 */
export function buildShortcutRegistryWithMeta(): ShortcutRegistryBuildResult {
  const registration = createShortcutRegistration();
  for (const definition of SHORTCUT_CATALOG) {
    registration.registerShortcut(definition);
  }
  return Object.freeze({
    registry: createShortcutRegistry(registration.getDefinitions()),
    duplicates: registration.getDuplicates(),
  });
}

const buildResult = buildShortcutRegistryWithMeta();

/** Built-once singleton SSOT for UX-6.4. */
export const shortcutRegistry: ShortcutRegistryApi = buildResult.registry;

/** Construction-time duplicate detections (empty when catalog is clean). */
export const shortcutBuildDuplicates: readonly ShortcutId[] =
  buildResult.duplicates;
