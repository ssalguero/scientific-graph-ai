/**
 * ENGINE Domain — Public Command API facades.
 * OWNERSHIP: ENGINE business command entry (distinct from UX-6 interaction commands).
 * ENGINE-4: Facade delegates to the default composed CommandOrchestrator (project.* commands registered).
 * executeCommand signature frozen.
 */

import type {
  EngineCommandContext,
  EngineCommandId,
  EngineCommandResult,
} from "../contracts/commands";
import { getDefaultComposition } from "../internal/compose";

/**
 * Business command execution entry after UX interaction dispatch.
 * Unregistered command ids return Failed (`ENGINE_COMMAND_NOT_REGISTERED`).
 * Does not throw for unknown commands (ENGINE-3).
 * Project commands (`project.create|open|save|close`) are registered (ENGINE-4).
 */
export async function executeCommand(
  commandId: EngineCommandId,
  payload?: unknown,
  context?: EngineCommandContext,
): Promise<EngineCommandResult> {
  return getDefaultComposition().commandOrchestrator.execute(
    commandId,
    payload,
    context,
  );
}
