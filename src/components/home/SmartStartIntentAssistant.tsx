"use client";

import { HomeConversationDoor } from "@/components/conversation/ScientificConversationSurface";

type SmartStartIntentAssistantProps = {
  hasDataset: boolean | null;
  hasExperimentalSeries: boolean | null;
};

/**
 * Home door for the same transversal IA. Cards remain the execution surface.
 */
export function SmartStartIntentAssistant({
  hasDataset,
  hasExperimentalSeries,
}: SmartStartIntentAssistantProps) {
  return (
    <HomeConversationDoor
      hasDataset={hasDataset}
      hasExperimentalSeries={hasExperimentalSeries}
    />
  );
}
