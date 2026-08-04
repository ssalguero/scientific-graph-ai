/**
 * UX-6.8 — Official Context Menu Catalog (seed).
 *
 * Sole place that grows as new context menus are declared in later phases.
 * Structure only — references CommandId; never owns commands.
 * Order is part of the public contract (preserved exactly by ContextMenuBuilder).
 * No registration logic · no React · no execution.
 */

import { asCommandId } from "../commands/CommandTypes";
import { createContextMenuDefinition } from "./ContextMenuDefinition";
import type { ContextMenuDefinition } from "./ContextMenuDefinition";
import { asContextMenuId } from "./ContextMenuTypes";

/** Official structural context-menu seed for UX-6.8 (system probes only). */
export const CONTEXT_MENU_CATALOG: readonly ContextMenuDefinition[] =
  Object.freeze([
    createContextMenuDefinition({
      id: asContextMenuId("context.default"),
      items: [
        { commandId: asCommandId("system.catalog") },
        { commandId: asCommandId("system.diagnostics") },
        { commandId: asCommandId("system.ping") },
      ],
    }),
  ]);
