/**
 * PLUGINS-I0 — Lifecycle abstractions (type markers only).
 *
 * Behavior deferred to PLUGINS-I6 (PLUGINS-P5; P3 C5).
 * No lifecycle execution, transitions, or gates in I0.
 */

import type { PluginLifecycleState, PluginLifecycleStage } from "../types";

/**
 * Conceptual Lifecycle Coordinator surface (platform-governed).
 * Plugins never self-manage lifecycle (P5 Lifecycle Constitutional Freeze).
 */
export type LifecycleCoordinatorAbstraction = {
  readonly __abstraction: "LifecycleCoordinator";
  readonly __implements: "C5";
  readonly __phase: "PLUGINS-I6";
  readonly __platformGoverned: true;
  readonly __pluginSelfManaged: false;
};

/** Marker pairing stage/state vocabulary without a state machine. */
export type LifecycleVocabularyMarker = {
  readonly __abstraction: "LifecycleVocabulary";
  readonly stage?: PluginLifecycleStage;
  readonly state?: PluginLifecycleState;
};
