"use client";

import { useState } from "react";

import {
  classifyIntent,
  formatIntentRecommendationSummary,
  type IntentRecommendation,
} from "@/lib/smart-start";
import {
  btnPrimary,
  btnSecondary,
  inputField,
} from "@/app/projectFileUiStyles";
import { DS_FOCUS_RING, DS_MOTION_FEEDBACK } from "@/lib/ui/focus-ring";

type SmartStartIntentAssistantProps = {
  onStartRecommendation: (recommendation: IntentRecommendation) => void;
};

/**
 * CRP-6.3.x calibration — objective entry scaled with the capability launcher.
 */
export function SmartStartIntentAssistant({
  onStartRecommendation,
}: SmartStartIntentAssistantProps) {
  const [intentText, setIntentText] = useState("");
  const [recommendation, setRecommendation] =
    useState<IntentRecommendation | null>(null);
  const [noMatchMessage, setNoMatchMessage] = useState<string | null>(null);

  const handleSuggest = () => {
    const result = classifyIntent(intentText);
    setRecommendation(result);
    setNoMatchMessage(
      result
        ? null
        : "No detectamos una intención clara. Pruebe con palabras como CSV, comparar, función, publicación o proyecto."
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

      {recommendation ? (
        <div
          className="rounded-[var(--radius-container)] border border-[var(--color-brand-primary)]/30 bg-[var(--color-brand-primary)]/5 px-[var(--spacing-compact)] py-2.5 space-y-[var(--spacing-tight)] text-left"
          role="status"
        >
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            {formatIntentRecommendationSummary(recommendation)}
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            Destino: {recommendation.destinationLabel}
          </p>
          <button
            type="button"
            onClick={() => onStartRecommendation(recommendation)}
            className={btnPrimary}
          >
            Iniciar flujo recomendado
          </button>
        </div>
      ) : null}

      {noMatchMessage ? (
        <p className="text-xs text-[var(--color-text-muted)]" role="status">
          {noMatchMessage}
        </p>
      ) : null}
    </div>
  );
}
