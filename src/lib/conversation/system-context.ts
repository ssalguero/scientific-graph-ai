import type { SystemContext } from "./architecture";
import {
  deriveActiveConversationDomain,
  type WorkspaceSurfaceInput,
} from "./analyze-adapter";

export type { WorkspaceSurfaceInput } from "./analyze-adapter";

export function buildSystemContext(input: {
  surface: WorkspaceSurfaceInput;
  hasDataset: boolean | null;
  hasExperimentalSeries: boolean | null;
}): SystemContext {
  return {
    hasDataset: input.hasDataset,
    hasExperimentalSeries: input.hasExperimentalSeries,
    activeConversationDomain: deriveActiveConversationDomain(input.surface),
  };
}
