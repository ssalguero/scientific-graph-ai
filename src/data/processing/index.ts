/**
 * Processing Layer (DATA-P2).
 *
 * DATA-I5: Transformation Engine runtime is active under transformation-engine/.
 * Deterministic infrastructure only — no discipline-specific science.
 *
 * @packageDocumentation
 */

export {
  TransformationEngine,
  TransformationKind,
  TRANSFORMATION_KINDS,
  isTransformationKind,
  TRANSFORMATION_INVARIANTS,
  TransformationInvariantError,
  executeDeterministic,
  type TransformationEngineDeps,
  type TransformationRequest,
  type TransformationResult,
  type TransformationReport,
} from "./transformation-engine";
