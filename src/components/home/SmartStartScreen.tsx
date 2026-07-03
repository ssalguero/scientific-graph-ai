"use client";

import {
  SMART_START_OPTIONS,
  type IntentRecommendation,
} from "@/lib/smart-start";
import { SmartStartIntentAssistant } from "@/app/SmartStartIntentAssistant";

const card =
  "rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm p-3 sm:p-4 transition-colors duration-200";
const panelHeadingSubtext = "text-xs sm:text-sm text-[var(--app-text-muted)] mt-0.5";

type SmartStartScreenProps = {
  onSelect: (optionId: string) => void;
  onExpertMode: () => void;
  onStartRecommendation: (recommendation: IntentRecommendation) => void;
};

export function SmartStartScreen({
  onSelect,
  onExpertMode,
  onStartRecommendation,
}: SmartStartScreenProps) {
  return (
    <section
      className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 sm:p-6 shadow-sm"
      aria-label="Inicio guiado"
    >
      <div className="max-w-4xl mx-auto text-center mb-5 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-[var(--app-heading)] tracking-tight">
          ¿Qué desea hacer hoy?
        </h2>
        <p className={`${panelHeadingSubtext} mt-2 max-w-2xl mx-auto`}>
          Elija un punto de entrada o describa su objetivo. El laboratorio
          completo estará disponible después de su selección.
        </p>
      </div>

      <SmartStartIntentAssistant onStartRecommendation={onStartRecommendation} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl mx-auto">
        {SMART_START_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={`${card} text-left flex flex-col gap-2 p-4 hover:border-[var(--app-accent)]/40 hover:shadow-md transition-all duration-200`}
          >
            <span className="text-2xl" aria-hidden>
              {option.icon}
            </span>
            <span className="text-sm font-semibold text-[var(--app-heading)]">
              {option.title}
            </span>
            <span className="text-xs text-[var(--app-text-muted)] leading-snug flex-1">
              {option.description}
            </span>
            <span className="text-xs font-semibold text-[var(--app-accent)] pt-1">
              {option.actionLabel} →
            </span>
          </button>
        ))}

        <button
          type="button"
          onClick={onExpertMode}
          className={`${card} text-left flex flex-col gap-2 p-4 border-dashed hover:border-[var(--app-text-muted)] transition-all duration-200`}
        >
          <span className="text-2xl" aria-hidden>
            🧪
          </span>
          <span className="text-sm font-semibold text-[var(--app-heading)]">
            Modo experto
          </span>
          <span className="text-xs text-[var(--app-text-muted)] leading-snug flex-1">
            Acceda directamente al workspace completo sin flujo guiado inicial.
          </span>
          <span className="text-xs font-semibold text-[var(--app-text-muted)] pt-1">
            Entrar al laboratorio completo →
          </span>
        </button>
      </div>
    </section>
  );
}
