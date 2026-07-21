/**
 * D52.2 — Dock registration API.
 * Sole authorized mutation path into the live Registry.
 * Idempotent: register(existing) and unregister(missing) are no-ops.
 */
import type { DockRegistryMutator } from "./DockRegistry";
import type { DockRegistrationApi, DockRegistryEntry } from "./types";

export function createDockRegistrationApi(
  mutator: DockRegistryMutator,
  has: (id: string) => boolean
): DockRegistrationApi {
  return {
    register(entry: DockRegistryEntry): void {
      if (has(entry.id)) {
        return;
      }
      mutator.put(entry);
    },
    unregister(id: string): void {
      if (!has(id)) {
        return;
      }
      mutator.remove(id);
    },
  };
}
