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
      className="max-w-2xl mx-auto mb-5 sm:mb-6 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-muted)]/50 p-3 sm:p-4 text-left"
      aria-label="Asistente de intención"
    >
      <label
        htmlFor="smart-start-intent-input"
        className={`${fieldLabel} mb-1.5 normal-case tracking-normal text-[var(--app-heading)]`}
      >
        Describa brevemente qué desea hacer
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
          className="mt-3 rounded-md border border-[var(--app-accent)]/30 bg-[var(--app-accent)]/5 px-3 py-2.5 space-y-2"
          role="status"
        >
          <p className="text-sm font-semibold text-[var(--app-heading)]">
            {formatIntentRecommendationSummary(recommendation)}
          </p>
          <p className="text-xs text-[var(--app-text-muted)]">
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
        <p className="mt-2 text-xs text-[var(--app-text-muted)]" role="status">
          {noMatchMessage}
        </p>
      ) : null}
    </div>
  );
}
