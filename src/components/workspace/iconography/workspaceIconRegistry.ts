/**
 * UX-2.20 — Private workspace icon catalog (Lucide only).
 * NOT barrel-exported. Catalog frozen by non-export + validators.
 */
import {
  FolderKanban,
  Info,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Sparkles,
  Terminal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const workspaceIconRegistry = {
  project: FolderKanban,
  layers: Layers,
  inspector: Settings2,
  console: Terminal,
  search: Search,
  info: Info,
  sync: RefreshCw,
  add: Plus,
  sparkles: Sparkles,
} as const satisfies Record<string, LucideIcon>;

/** Internal only — not exported from package barrel. */
export type WorkspaceIconName = keyof typeof workspaceIconRegistry;
