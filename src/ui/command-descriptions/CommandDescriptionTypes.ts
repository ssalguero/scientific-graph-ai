/**
 * UX-7.4 — Command Description Bridge types.
 * Identity Freeze: visibilityIdFromCommandId = brand cast only.
 * No validate · query · register · interpret · transform.
 */

export type { CommandId } from "../commands/CommandTypes";
export type { VisibilityId } from "../visibility/VisibilityTypes";

import type { CommandId } from "../commands/CommandTypes";
import {
  asVisibilityId,
  type VisibilityId,
} from "../visibility/VisibilityTypes";

/**
 * Identity Freeze — explicit brand cast only.
 * String(CommandId) === String(VisibilityId).
 * No validate · consult · register · interpret · transform.
 */
export function visibilityIdFromCommandId(
  commandId: CommandId,
): VisibilityId {
  return asVisibilityId(String(commandId));
}
