/**
 * Read-only theme inspection.
 * Source must be explicit: a ThemeRegistry OR a static catalog — never both implicitly.
 */
import {
  THEME_CONTRACT_VERSION,
  type ThemeContractVersion,
} from "../version";
import type { ThemeId } from "../ids";
import type { ThemeMap } from "../types";
import { ThemeRegistry } from "./ThemeRegistry";

/** Static catalog shape (e.g. maps/themes). */
export type ThemeStaticCatalog = Readonly<Record<ThemeId, ThemeMap>>;

export type ThemeInspectionSource = ThemeRegistry | ThemeStaticCatalog;

function isRegistry(source: ThemeInspectionSource): source is ThemeRegistry {
  return source instanceof ThemeRegistry;
}

function entries(source: ThemeInspectionSource): readonly ThemeMap[] {
  if (isRegistry(source)) {
    return source.list();
  }
  return Object.values(source);
}

export function listThemes(source: ThemeInspectionSource): readonly ThemeMap[] {
  return entries(source);
}

export function getTheme(
  source: ThemeInspectionSource,
  id: ThemeId,
): ThemeMap | undefined {
  if (isRegistry(source)) {
    return source.get(id);
  }
  return source[id];
}

export function themeExists(
  source: ThemeInspectionSource,
  id: ThemeId,
): boolean {
  if (isRegistry(source)) {
    return source.has(id);
  }
  return source[id] !== undefined;
}

export function getContractVersion(): ThemeContractVersion {
  return THEME_CONTRACT_VERSION;
}

export function getThemeNames(
  source: ThemeInspectionSource,
): readonly ThemeId[] {
  if (isRegistry(source)) {
    return source.list().map((m) => m.id);
  }
  return Object.keys(source) as ThemeId[];
}

export function countThemes(source: ThemeInspectionSource): number {
  if (isRegistry(source)) {
    return source.size();
  }
  return Object.keys(source).length;
}
