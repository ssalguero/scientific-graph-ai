/**
 * UX-6.6 — Official Menu Catalog (seed).
 *
 * Sole place that grows as new menus are declared in later phases.
 * Structure only — references CommandId; never owns commands.
 * Order is part of the public contract (preserved exactly by MenuTreeBuilder).
 * No registration logic · no React · no execution.
 */

import { asCommandId } from "../commands/CommandTypes";
import { createMenuDefinition } from "./MenuDefinition";
import type { MenuDefinition } from "./MenuDefinition";
import { asMenuId } from "./MenuTypes";

/** Official structural menu seed for UX-6.6 (system probes only). */
export const MENU_CATALOG: readonly MenuDefinition[] = Object.freeze([
  createMenuDefinition({
    id: asMenuId("menu.system"),
    title: "System",
    entries: [
      { commandId: asCommandId("system.catalog") },
      { commandId: asCommandId("system.diagnostics") },
      { commandId: asCommandId("system.ping") },
    ],
  }),
]);
