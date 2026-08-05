/**
 * UX-8.7 — Interaction Commands local barrel.
 * Not re-exported from @/ui (src/ui/index.ts) in this phase.
 */

export type { InteractionCommand } from "./InteractionCommand";

export type { InteractionCommandResult } from "./InteractionCommandResult";

export type {
  InteractionCommandDispatcherApi,
  InteractionCommandDispatcherState,
} from "./InteractionCommandDispatcher";
export {
  createInteractionCommandDispatcher,
  interactionCommandDispatcher,
} from "./InteractionCommandDispatcher";

export type { InteractionCommandContextValue } from "./InteractionCommandContext";
export { InteractionCommandContext } from "./InteractionCommandContext";

export type { InteractionCommandProviderProps } from "./InteractionCommandProvider";
export { InteractionCommandProvider } from "./InteractionCommandProvider";

export { useInteractionCommands } from "./useInteractionCommands";
