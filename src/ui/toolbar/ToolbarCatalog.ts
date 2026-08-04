/**
 * UX-6.7 — Official Toolbar Catalog (seed).
 *
 * Sole place that grows as new toolbars are declared in later phases.
 * Structure only — references CommandId; never owns commands.
 * Order is part of the public contract (preserved exactly by ToolbarBuilder).
 * No registration logic · no React · no execution.
 */

import { asCommandId } from "../commands/CommandTypes";
import { createToolbarDefinition } from "./ToolbarDefinition";
import type { ToolbarDefinition } from "./ToolbarDefinition";
import { asToolbarId } from "./ToolbarTypes";

/** Official structural toolbar seed for UX-6.7 (system probes only). */
export const TOOLBAR_CATALOG: readonly ToolbarDefinition[] = Object.freeze([
  createToolbarDefinition({
    id: asToolbarId("toolbar.primary"),
    items: [
      { commandId: asCommandId("system.catalog") },
      { commandId: asCommandId("system.diagnostics") },
      { commandId: asCommandId("system.ping") },
    ],
  }),
]);
