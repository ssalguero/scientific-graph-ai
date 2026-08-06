/**
 * Transformation Engine — package entry (DATA-I5).
 *
 * @packageDocumentation
 */

export { TransformationEngine, type TransformationEngineDeps } from "./TransformationEngine";
export {
  TransformationKind,
  TRANSFORMATION_KINDS,
  isTransformationKind,
  type TransformationRequest,
  type TransformationResult,
  type TransformationReport,
  type TransformationExecutionDescriptor,
  type TransformationKind as TransformationKindId,
} from "./model";
export {
  TRANSFORMATION_INVARIANTS,
  TransformationInvariantError,
  type TransformationInvariant,
} from "./invariants";
export {
  executeDeterministic,
  stableStringify,
  parametersFingerprint,
} from "./deterministic";
export {
  TransformationDiagnostics,
  type TransformationDiagnosticRecord,
} from "./diagnostics";
