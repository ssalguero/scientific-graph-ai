/**
 * ENGINE Domain — Runtime coordination types.
 * OWNERSHIP: ENGINE coordination DTOs — Runtime (Platform) owns runtime infra.
 */

export type RuntimeInitializeInput = {
  readonly appId?: string;
  readonly meta?: Readonly<Record<string, unknown>>;
};

export type RuntimeShutdownInput = {
  readonly reason?: string;
  readonly meta?: Readonly<Record<string, unknown>>;
};

export type RuntimeNotifyResult = {
  readonly notified: boolean;
};
