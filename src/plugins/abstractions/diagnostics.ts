/**
 * PLUGINS-I0 — Diagnostics abstractions (type markers only).
 *
 * Behavior deferred to PLUGINS-I8 (PLUGINS-P3 C9; P5 observability).
 * No persistence, event bus, or runtime monitoring in I0.
 */

export type DiagnosticsServiceAbstraction = {
  readonly __abstraction: "DiagnosticsService";
  readonly __implements: "C9";
  readonly __phase: "PLUGINS-I8";
  readonly __mutatesScientificTruth: false;
};

/**
 * Extension Point Resolver binding intent (C10).
 * Resolves references only — never owns peer Extension Points.
 */
export type ExtensionPointResolverAbstraction = {
  readonly __abstraction: "ExtensionPointResolver";
  readonly __implements: "C10";
  readonly __phase: "PLUGINS-I5_to_I9";
  readonly __ownsExtensionPoints: false;
};

/** Future Public SDK Boundary (C12) — reserved; delivery deferred. */
export type FuturePublicSdkBoundaryAbstraction = {
  readonly __abstraction: "FuturePublicSdkBoundary";
  readonly __implements: "C12";
  readonly __phase: "RESERVED";
  readonly __sdkImplemented: false;
};
