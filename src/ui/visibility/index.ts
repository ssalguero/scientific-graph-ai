/**
 * UX-7.1 — Visibility Foundation local barrel.
 * Not re-exported from @/ui (src/ui/index.ts) in this phase.
 */

export type { VisibilityId } from "./VisibilityTypes";
export { asVisibilityId } from "./VisibilityTypes";

export type {
  VisibilityDefinition,
  VisibilityDefinitionInit,
} from "./VisibilityDefinition";

export { createVisibilityDefinition } from "./createVisibilityDefinition";

export type { VisibilityRegistryApi } from "./VisibilityRegistry";
export {
  createVisibilityRegistry,
  visibilityRegistry,
} from "./VisibilityRegistry";
