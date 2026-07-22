/**
 * D65.1–D65.6 — Session Foundation · public barrel.
 * Authority: D65.0 API Freeze.
 * D65.6 adds SessionProvider (sole registry owner).
 */

export type {
  SessionId,
  SessionMetadata,
  SessionEntry,
} from "./SessionTypes";

export { createSessionRegistry } from "./SessionRegistry";

export { SessionContext, useSessionContext } from "./SessionContext";

export { SessionProvider } from "./SessionProvider";
