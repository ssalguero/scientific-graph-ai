/**
 * UX-8.4 — Mutable Hover Registry (SSOT · sole hover authority).
 *
 * Contract: HoverRegistryApi (Registry Freeze)
 * Singleton: hoverRegistry (empty by design — no production hover)
 *
 * Official methods only: hoverWindow / hoverContent / hoverSeries /
 * clear / get / getState.
 * factory → private state → API Freeze → clone-on-read.
 * No React · no WindowRegistry · no Focus · no Selection · no cross-registry mutation.
 *
 * Hover Semantics Freeze: current state only — no enter / leave / history /
 * coordinates. hover* mutates only its own axis. Mixed nulls are valid.
 *
 * API Stability Freeze: get() and getState() are intentionally equivalent.
 * Both remain frozen for API stability; consumers must not assume differences.
 *
 * Singleton Freeze: hoverRegistry exists ONLY for infrastructure and
 * testing. React consumers MUST use HoverProvider + useHover().
 */

import { createHoverState, type HoverState } from "./HoverState";
import type {
  HoverContentId,
  HoverSeriesId,
  HoverWindowId,
} from "./HoverTypes";

/**
 * Mutable registry contract — Registry Freeze UX-8.4.
 * Named HoverRegistryApi to avoid type/value name collision with the singleton.
 */
export interface HoverRegistryApi {
  hoverWindow(id: HoverWindowId): void;
  hoverContent(id: HoverContentId): void;
  hoverSeries(id: HoverSeriesId): void;
  clear(): void;
  get(): HoverState;
  getState(): HoverState;
}

/**
 * Creates an isolated in-memory hover registry.
 * - Private HoverState (three independent nullable axes)
 * - get / getState return a defensive frozen clone (equivalent)
 * - hover* mutates only its axis (Hover Semantics Freeze)
 */
export function createHoverRegistry(): HoverRegistryApi {
  let hoveredWindowId: HoverWindowId | null = null;
  let hoveredContentId: HoverContentId | null = null;
  let hoveredSeriesId: HoverSeriesId | null = null;

  function snapshot(): HoverState {
    return createHoverState({
      hoveredWindowId,
      hoveredContentId,
      hoveredSeriesId,
    });
  }

  return Object.freeze({
    hoverWindow(id: HoverWindowId): void {
      if (hoveredWindowId === id) {
        return;
      }
      hoveredWindowId = id;
    },

    hoverContent(id: HoverContentId): void {
      if (hoveredContentId === id) {
        return;
      }
      hoveredContentId = id;
    },

    hoverSeries(id: HoverSeriesId): void {
      if (hoveredSeriesId === id) {
        return;
      }
      hoveredSeriesId = id;
    },

    clear(): void {
      hoveredWindowId = null;
      hoveredContentId = null;
      hoveredSeriesId = null;
    },

    get(): HoverState {
      return snapshot();
    },

    getState(): HoverState {
      return snapshot();
    },
  });
}

/**
 * Empty singleton SSOT for UX-8.4 bootstrap (empty by design).
 * Singleton Freeze: infrastructure / testing only.
 * React consumers MUST use HoverProvider + useHover().
 */
export const hoverRegistry: HoverRegistryApi = createHoverRegistry();
