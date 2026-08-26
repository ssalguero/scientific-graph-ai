"use client";

import { useState } from "react";

import {
  buildGuidanceDecision,
  cardLauncherTitle,
  nextGuidanceConversation,
} from "@/lib/smart-start/build-guidance-decision";
import {
  EMPTY_HOME_GUIDANCE_CONVERSATION,
  type GuidanceDecision,
  type HomeGuidanceConversationState,
} from "@/lib/smart-start/types";
import { btnSecondary, inputField } from "@/app/projectFileUiStyles";
import { DS_FOCUS_RING, DS_MOTION_FEEDBACK } from "@/lib/ui/focus-ring";

type SmartStartIntentAssistantProps = {
  hasDataset: boolean | null;
  hasExperimentalSeries: boolean | null;
};

function GuidancePanel({ decision }: { decision: GuidanceDecision }) {
  const primaryTitle = decision.primaryCardId
    ? cardLauncherTitle(decision.primaryCardId)
    : null;
  const otherTitles = decision.suggestedCardIds
    .filter((id) => id !== decision.primaryCardId)
    .map((id) => cardLauncherTitle(id));

  return (
    <div
      className="rounded-[var(--radius-container)] border border-[var(--color-brand-primary)]/30 bg-[var(--color-brand-primary)]/5 px-[var(--spacing-compact)] py-2.5 space-y-[var(--spacing-tight)] text-left"
      role="status"
    >
      <p className="text-sm font-semibold text-[var(--color-text-primary)]">
        {decision.interpretation}
      </p>
      <p className="text-xs text-[var(--color-text-muted)]">
        {decision.explanation}
      </p>
      {decision.prerequisite ? (
        <p className="text-xs text-[var(--color-text-muted)]">
          {decision.prerequisite}
        </p>
      ) : null}
      {primaryTitle ? (
        <p className="text-xs text-[var(--color-text-primary)]">
          Siguiente paso: use la tarjeta {primaryTitle}.
        </p>
      ) : null}
      {otherTitles.length > 0 ? (
        <p className="text-xs text-[var(--color-text-muted)]">
          También puede usar: {otherTitles.join(", ")}.
        </p>
      ) : null}
      {decision.clarification ? (
        <p className="text-sm text-[var(--color-text-primary)]">
          {decision.clarification}
        </p>
      ) : null}
      {decision.uncertainty === "unknown_context" && !decision.clarification ? (
        <p className="text-xs text-[var(--color-text-muted)]">
          No está claro si ya hay datos cargados. No asumo un dataset.
        </p>
      ) : null}
    </div>
  );
}

/**
 * CRP-6.3.x calibration — objective entry scaled with the capability launcher.
 * P2: Sugerir produces guidance only. Cards remain the execution surface.
 */
export function SmartStartIntentAssistant({
  hasDataset,
  hasExperimentalSeries,
}: SmartStartIntentAssistantProps) {
  const [intentText, setIntentText] = useState("");
  const [decision, setDecision] = useState<GuidanceDecision | null>(null);
  const [conversation, setConversation] =
    useState<HomeGuidanceConversationState>(EMPTY_HOME_GUIDANCE_CONVERSATION);
  const [noMatchMessage, setNoMatchMessage] = useState<string | null>(null);

  const handleSuggest = () => {
    const next = buildGuidanceDecision(
      intentText,
      { hasDataset, hasExperimentalSeries },
      conversation
    );
    setDecision(next);
    setConversation(nextGuidanceConversation(next, intentText));
    setNoMatchMessage(
      next.suggestedCardIds.length === 0 &&
        !next.clarification &&
        next.uncertainty !== "none"
        ? next.explanation
        : null
    );
  };

  return (
    <div
      className="mx-auto w-full space-y-[var(--spacing-tight)] text-center"
      aria-label="Objetivo"
    >
      <div className="flex w-full items-stretch gap-2.5">
        <input
          id="smart-start-intent-input"
          type="text"
          value={intentText}
          onChange={(event) => {
            setIntentText(event.target.value);
            setNoMatchMessage(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSuggest();
            }
          }}
          placeholder="Describe tu objetivo..."
          aria-label="Describe tu objetivo"
          className={`${inputField} min-h-0 h-[3.625rem] flex-1 rounded-xl border-[var(--color-border-default)]/80 bg-[var(--color-surface-default)] px-6 text-base text-center placeholder:text-center ${DS_FOCUS_RING}`}
        />
        <button
          type="button"
          onClick={handleSuggest}
          disabled={intentText.trim().length === 0}
          className={`${btnSecondary} h-[3.625rem] shrink-0 rounded-xl px-6 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${DS_MOTION_FEEDBACK}`}
        >
          Sugerir
        </button>
      </div>

      {decision ? <GuidancePanel decision={decision} /> : null}

      {noMatchMessage && !decision ? (
        <p className="text-xs text-[var(--color-text-muted)]" role="status">
          {noMatchMessage}
        </p>
      ) : null}
    </div>
  );
}
