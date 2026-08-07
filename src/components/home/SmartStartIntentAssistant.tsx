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
  fieldLabel,
  inputField,
} from "@/app/projectFileUiStyles";

type SmartStartIntentAssistantProps = {
  onStartRecommendation: (recommendation: IntentRecommendation) => void;
};

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
      className="w-full rounded-[var(--radius-container)] border border-[var(--color-border-default)] bg-[var(--color-surface-canvas)]/50 p-[var(--spacing-compact)] text-left"
      aria-label="Asistente de intención"
    >
      <label
        htmlFor="smart-start-intent-input"
        className={`${fieldLabel} mb-1.5 normal-case tracking-normal text-[var(--color-text-primary)]`}
      >
        O describa su objetivo
      </label>
      <textarea
        id="smart-start-intent-input"
        value={intentText}
        onChange={(event) => {
          setIntentText(event.target.value);
          setNoMatchMessage(null);
        }}
        rows={2}
        placeholder="Ej: importar un CSV para analizar estadísticas básicas"
        className={`${inputField} min-h-[4.5rem] resize-y`}
      />

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleSuggest}
          disabled={intentText.trim().length === 0}
          className={`${btnSecondary} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          Sugerir flujo
        </button>
      </div>

      {recommendation ? (
        <div
          className="mt-3 rounded-[var(--radius-container)] border border-[var(--color-brand-primary)]/30 bg-[var(--color-brand-primary)]/5 px-[var(--spacing-compact)] py-2.5 space-y-[var(--spacing-tight)]"
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
        <p className="mt-2 text-xs text-[var(--color-text-muted)]" role="status">
          {noMatchMessage}
        </p>
      ) : null}
    </div>
  );
}
