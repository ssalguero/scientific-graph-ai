/**
 * UX-8.7 — Interaction Commands Hooks (read-only Context access layer).
 *
 * Consumes InteractionCommandContext only. Does not own or create dispatcher.
 * Mutations remain on InteractionCommandDispatcherApi (sole authority).
 * No mutation helpers on the hook — use dispatcher.* only.
 */

"use client";

import { useContext } from "react";
import {
  InteractionCommandContext,
  type InteractionCommandContextValue,
} from "./InteractionCommandContext";

/**
 * Returns the exact Provider-owned InteractionCommandContextValue reference.
 * Reference identity of dispatcher is part of the UX-8.7 API Freeze.
 */
export function useInteractionCommands(): InteractionCommandContextValue {
  const context = useContext(InteractionCommandContext);
  if (context === null) {
    throw new Error(
      "Interaction Command hooks must be used inside InteractionCommandProvider.",
    );
  }
  return context;
}
