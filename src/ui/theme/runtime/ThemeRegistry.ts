/**
 * Instantiable theme registry — runtime utility, not application SSOT.
 * SSOT remains maps/themes.
 */
import type { ThemeId } from "../ids";
import type { ThemeMap } from "../types";
import {
  warningDuplicateRegistration,
  type ThemeWarning,
} from "./ThemeWarnings";

export class ThemeRegistry {
  private readonly maps = new Map<ThemeId, ThemeMap>();

  /**
   * Register a theme map. On duplicate id, replaces and returns a warning.
   */
  register(map: ThemeMap): ThemeWarning | undefined {
    let warning: ThemeWarning | undefined;
    if (this.maps.has(map.id)) {
      warning = warningDuplicateRegistration(map.id);
    }
    this.maps.set(map.id, map);
    return warning;
  }

  unregister(id: ThemeId): boolean {
    return this.maps.delete(id);
  }

  has(id: ThemeId): boolean {
    return this.maps.has(id);
  }

  get(id: ThemeId): ThemeMap | undefined {
    return this.maps.get(id);
  }

  list(): readonly ThemeMap[] {
    return [...this.maps.values()];
  }

  clear(): void {
    this.maps.clear();
  }

  size(): number {
    return this.maps.size;
  }
}
