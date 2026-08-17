/**
 * UX-2.20 / CRP-6.3 — Private workspace icon catalog (Lucide only).
 * NOT barrel-exported. Catalog frozen by non-export + validators.
 */
import {
  Download,
  FileCheck2,
  FlaskConical,
  FolderKanban,
  GitCompareArrows,
  Info,
  Layers,
  LineChart,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Sparkles,
  Terminal,
  BarChart3,
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
  /* CRP-6.3 — Home capability glyphs (same Lucide generation) */
  "cap-import": Download,
  "cap-compare": GitCompareArrows,
  "cap-graph": LineChart,
  "cap-analyze": BarChart3,
  "cap-publish": FileCheck2,
  "cap-advanced": FlaskConical,
} as const satisfies Record<string, LucideIcon>;

/** Internal only — not exported from package barrel. */
export type WorkspaceIconName = keyof typeof workspaceIconRegistry;
