/**
 * AI-I9 — Hardening barrel (package-internal).
 * Verification catalog only. No runtime enforcement.
 */

export {
  AI_HARDENING_PHASE,
  AI_HARDENING_STATUS,
  AI_CERTIFICATION_READY,
} from "./status";
export type { AiHardeningStatus } from "./status";

export {
  AiQualityGateId,
  AI_QUALITY_GATES,
  AI_QUALITY_GATE_COUNT,
} from "./quality-gates";
export type { AiQualityGateDefinition } from "./quality-gates";
