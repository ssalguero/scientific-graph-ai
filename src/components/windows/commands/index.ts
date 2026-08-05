/**
 * UX-9.6 — Command Palette + Interaction Commands local barrel.
 * Outside src/ui/palette and src/ui/interaction-commands (Module Purity).
 */

export type {
  OverlayState,
  ProductCommandDefinition,
  CommandPaletteBridge,
} from "./CommandPaletteBridge";
export {
  PRODUCT_COMMAND_DEFINITIONS,
  commandPaletteBridge,
  createCommandPaletteBridge,
  getOverlayState,
  subscribeOverlayState,
} from "./CommandPaletteBridge";

export type {
  CommandFeedbackKind,
  CommandFeedbackSnapshot,
  InteractionCommandBridge,
} from "./InteractionCommandBridge";
export {
  createInteractionCommandBridge,
  getCommandFeedback,
  interactionCommandBridge,
  subscribeCommandFeedback,
} from "./InteractionCommandBridge";

export type { CommandPaletteDomHostProps } from "./CommandPaletteDomHost";
export { CommandPaletteDomHost } from "./CommandPaletteDomHost";
