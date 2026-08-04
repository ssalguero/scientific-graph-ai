/**
 * UX-7.4 — Command Description Bridge local barrel.
 * Not re-exported from @/ui (src/ui/index.ts) in this phase.
 */

export type { CommandId, VisibilityId } from "./CommandDescriptionTypes";
export { visibilityIdFromCommandId } from "./CommandDescriptionTypes";

export type {
  CommandDescription,
  CommandDescriptionInit,
} from "./CommandDescription";

export { createCommandDescription } from "./createCommandDescription";

export {
  commandDescriptionFromDefinition,
  resolveCommandDescription,
} from "./resolveCommandDescription";
