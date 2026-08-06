/**
 * ENGINE Domain — Platform Restore Session adapter.
 * OWNERSHIP: ENGINE coordination — wraps SessionRestoreEngine public API only.
 * Session Platform path (non-React): `@/components/session/restore`
 * Does not import SessionProvider / SessionBridge / SessionContext.
 */

import {
  createSessionRestoreEngine,
  type SessionRestoreEngine,
} from "@/components/session/restore";

import {
  createInjectableRestoreSessionPort,
  type InjectableRestoreEngine,
} from "./injectable-ports";
import type { RestoreSessionPort } from "./ports";

/**
 * Create a RestoreSessionPort backed by SessionRestoreEngine (Platform).
 * Pass a custom engine for tests; default constructs Platform factory.
 */
export function createPlatformRestoreSessionPort(
  engine: SessionRestoreEngine = createSessionRestoreEngine(),
): RestoreSessionPort {
  return createInjectableRestoreSessionPort(
    engine as unknown as InjectableRestoreEngine,
  );
}
