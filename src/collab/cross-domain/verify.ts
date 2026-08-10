/**
 * COLLAB-I8 — Verify non-bypass / non-blocking / AI peer-only integration gates.
 */

import { assertAiPeerOnlyBoundary } from "./ai-peer";
import { observeDataPublicSeam } from "./data-adapter";
import { observeEnginePublicSeam } from "./engine-adapter";
import type { CollabIntegrationGateReport } from "./gates";
import {
  COLLAB_COORDINATOR_IDENTITY,
  COLLAB_METADATA_COORDINATION_IDENTITY,
} from "./identities";
import { exposeCollaborationStateForUx, observeUxPublicSeam } from "./ux-adapter";

/**
 * Run I8 integration gates: ENGINE/DATA/UX seams ready; AI peer-only;
 * non-bypass (never orchestrates); non-blocking (optional layer markers).
 */
export function verifyCrossDomainIntegrationGates(): CollabIntegrationGateReport {
  const engine = observeEnginePublicSeam();
  const data = observeDataPublicSeam();
  const ux = observeUxPublicSeam();
  const state = exposeCollaborationStateForUx();
  const ai = assertAiPeerOnlyBoundary();

  const nonBypass =
    engine.neverOwnsOrchestration === true &&
    engine.replacesEngine === false &&
    COLLAB_COORDINATOR_IDENTITY.ownsWorkflowOrchestration === false &&
    COLLAB_COORDINATOR_IDENTITY.replacesEngine === false;

  const nonBlocking =
    COLLAB_METADATA_COORDINATION_IDENTITY.ownsScientificTruth === false &&
    data.ownsScientificTruth === false &&
    state.ownsPresentation === false &&
    ai.dependencyEdge === false;

  const aiPeerOnly = ai.dependencyEdge === false && ai.collaborativeAiInV1 === false;

  const engineSeamReady =
    engine.missingOperations.length === 0 &&
    engine.availableOperations.length > 0;
  const dataSeamReady =
    data.publicContractCount > 0 && data.capabilityGroupCount > 0;
  const uxSeamReady =
    Boolean(ux.tokenContractVersion) && Boolean(ux.themeContractVersion);

  const ok =
    nonBypass &&
    nonBlocking &&
    aiPeerOnly &&
    engineSeamReady &&
    dataSeamReady &&
    uxSeamReady;

  return {
    nonBypass,
    nonBlocking,
    aiPeerOnly,
    engineSeamReady,
    dataSeamReady,
    uxSeamReady,
    ok,
  };
}
