/**
 * UX-5.8 — Feature Integration Bridge (pass-through).
 *
 * useFeatures() = Availability assertion only (Provider presence).
 * Does not own state, mutate, consume the Map, or wire chrome.
 */

"use client";

import type { ReactNode } from "react";
import { useFeatures } from "./FeatureHooks";

export type FeatureBridgeProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Decoupled integration point between Features and future chrome.
 * Availability assertion only — no Map consumption, no conditional render.
 */
export function FeatureBridge({ children }: FeatureBridgeProps) {
  useFeatures();
  return <>{children}</>;
}
