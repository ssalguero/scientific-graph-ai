/**
 * D65.1–D65.7 — Session Foundation · public barrel.
 * Authority: D65.0 API Freeze.
 * D65.7 adds SessionBridge (Window → Session windowIds sync only).
 */

export type {
  SessionId,
  SessionMetadata,
  SessionEntry,
} from "./SessionTypes";

export { createSessionRegistry } from "./SessionRegistry";

export { SessionContext, useSessionContext } from "./SessionContext";

export { SessionProvider } from "./SessionProvider";

export { SessionBridge } from "./SessionBridge";
