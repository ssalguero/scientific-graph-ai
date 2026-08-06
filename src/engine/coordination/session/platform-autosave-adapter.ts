/**
 * ENGINE Domain — Platform Autosave coordination adapter.
 * OWNERSHIP: ENGINE coordination — consumes SessionAutosaveController.flush only.
 * Does not own AutosaveScheduler / DirtyTracker; no React.
 * Type imports only from `@/components/session/autosave` when typing the controller.
 */

import type { SessionAutosaveController } from "@/components/session/autosave";

import { createInjectableAutosavePort } from "./injectable-ports";
import type { AutosaveCoordinationPort } from "./ports";

/**
 * Create an AutosaveCoordinationPort from a live SessionAutosaveController (or null).
 * Orchestration requests flush / status only — never rewrites scheduler internals.
 */
export function createPlatformAutosavePort(
  controller: Pick<SessionAutosaveController, "flush"> | null | undefined,
): AutosaveCoordinationPort {
  return createInjectableAutosavePort(controller ?? null);
}
