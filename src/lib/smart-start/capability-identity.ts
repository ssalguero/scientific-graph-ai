/**
 * CRP-6.3.x — Capability identity map (Home launcher + future destination accents).
 * Not barrel-exported from smart-start (allowlist).
 */
import type { WorkspaceIconName } from "@/components/workspace/iconography/workspaceIconRegistry";
import type { CapabilityAccent } from "./capability-accents";
import { CAPABILITY_ACCENT_BY_OPTION } from "./capability-accents";
import { SMART_START_WORKSPACE_ICON } from "./capability-icons";
import { SMART_START_OPTIONS } from "./options";
import type { SmartStartCardOptionId } from "./types";

export type CapabilityIdentity = {
  id: SmartStartCardOptionId;
  title: string;
  /** Home launcher caption; Owner display override vs registry title. */
  launcherTitle: string;
  description: string;
  destinationHint: string;
  accent: CapabilityAccent;
  icon: WorkspaceIconName;
};

export const CAPABILITY_IDENTITY: readonly CapabilityIdentity[] =
  SMART_START_OPTIONS.map((option) => ({
    id: option.id,
    title: option.title,
    launcherTitle:
      option.id === "analyze-dataset" ? "Importar datos" : option.title,
    description: option.description,
    destinationHint: option.destinationHint,
    accent: CAPABILITY_ACCENT_BY_OPTION[option.id],
    icon: SMART_START_WORKSPACE_ICON[option.id],
  }));
