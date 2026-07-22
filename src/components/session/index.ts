/**
 * D65.1–D65.5 — Session Foundation · public barrel.
 * Authority: D65.0 API Freeze.
 * D65.5 adds SessionContext shell + useSessionContext (no Provider).
 */

export type {
  SessionId,
  SessionMetadata,
  SessionEntry,
} from "./SessionTypes";

export { createSessionRegistry } from "./SessionRegistry";

export { SessionContext, useSessionContext } from "./SessionContext";
