/**
 * UX-8.7 — Private InteractionCommandContext (dispatcher ownership surface).
 *
 * Declares InteractionCommandContextValue and InteractionCommandContext only.
 * Does not own state or expose hooks.
 */

"use client";

import { createContext } from "react";
import type { InteractionCommandDispatcherApi } from "./InteractionCommandDispatcher";

/**
 * Private context value: InteractionCommandDispatcherApi SSOT view.
 * Mutations go only through InteractionCommandDispatcher (sole authority).
 */
export type InteractionCommandContextValue = Readonly<{
  dispatcher: InteractionCommandDispatcherApi;
}>;

export const InteractionCommandContext =
  createContext<InteractionCommandContextValue | null>(null);
