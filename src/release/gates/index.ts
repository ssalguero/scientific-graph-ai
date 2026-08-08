/**
 * RELEASE-P2 — Gates barrel.
 */

export {
  listGateDescriptors,
  getGateDescriptor,
  concreteGateThresholdsDefined,
  listCategoryGateIds,
} from "./catalog";
export type { GateDescriptor } from "./catalog";

export {
  defaultFinalCertificationDependencies,
  detectGateDependencyCycle,
  validateGateDependencies,
  finalCertificationDependsOnCategories,
  productionReleaseDependencyAllowed,
} from "./dependencies";
export type { GateDependencyEdge, DependencyValidation } from "./dependencies";

export {
  createGateResult,
  gatePassImpliesGlobalCertification,
  isOpaqueGateResult,
} from "./results";
export type { GateEvidenceTrace, GateResultRecord } from "./results";

export { createReleaseWaiver, waiverRequiresProvenance } from "./waivers";
export type { ReleaseWaiverRecord } from "./waivers";
