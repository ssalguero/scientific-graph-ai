/**
 * D65.1–D65.4 — Session Foundation · public barrel.
 * Authority: D65.0 API Freeze.
 * D65.4 adds createSessionRegistry only (SessionRegistry type not barrel-exported).
 */

export type {
  SessionId,
  SessionMetadata,
  SessionEntry,
} from "./SessionTypes";

export { createSessionRegistry } from "./SessionRegistry";
