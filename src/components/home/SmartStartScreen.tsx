"use client";

import {
  SMART_START_OPTIONS,
  type IntentRecommendation,
} from "@/lib/smart-start";
import { SmartStartIntentAssistant } from "@/components/home/SmartStartIntentAssistant";
import { card, panelHeadingSubtext } from "@/lib/ui/theme";

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
      className="rounded-md border border-[var(--color-border-default)] bg-[var(--color-surface-default)] p-3 space-y-3"
      aria-label="Inicio guiado"
    >
      <div className="text-left">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)] tracking-tight">
          ¿Qué desea hacer hoy?
        </h2>
        <p className={`${panelHeadingSubtext} mt-1 max-w-3xl`}>
          Elija un punto de entrada o describa su objetivo. El laboratorio
          completo estará disponible después de su selección.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {SMART_START_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={`${card} text-left flex flex-col gap-1.5 p-3 hover:border-[var(--color-brand-primary)]/40 transition-colors duration-200`}
          >
            <span className="text-lg" aria-hidden>
              {option.icon}
            </span>
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">
              {option.title}
            </span>
            <span className="text-xs text-[var(--color-text-muted)] leading-snug flex-1">
              {option.description}
            </span>
            <span className="text-xs font-semibold text-[var(--color-brand-primary)] pt-0.5">
              {option.actionLabel} →
            </span>
          </button>
        ))}

        <button
          type="button"
          onClick={onExpertMode}
          className={`${card} text-left flex flex-col gap-1.5 p-3 border-dashed hover:border-[var(--color-text-muted)] transition-colors duration-200`}
        >
          <span className="text-lg" aria-hidden>
            🧪
          </span>
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">
            Modo experto
          </span>
          <span className="text-xs text-[var(--color-text-muted)] leading-snug flex-1">
            Acceda directamente al workspace completo sin flujo guiado inicial.
          </span>
          <span className="text-xs font-semibold text-[var(--color-text-muted)] pt-0.5">
            Entrar al laboratorio completo →
          </span>
        </button>
      </div>

      <SmartStartIntentAssistant onStartRecommendation={onStartRecommendation} />
    </section>
  );
}
