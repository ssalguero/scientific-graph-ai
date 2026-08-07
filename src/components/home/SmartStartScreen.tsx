"use client";

import {
  SMART_START_OPTIONS,
  type IntentRecommendation,
} from "@/lib/smart-start";
import { SmartStartIntentAssistant } from "@/components/home/SmartStartIntentAssistant";
import { DS_FOCUS_RING, DS_MOTION_ENTER } from "@/lib/ui/focus-ring";
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
      className="rounded-[var(--radius-container)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] p-[var(--spacing-compact)] space-y-[var(--spacing-compact)]"
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
            className={`${card} text-left flex flex-col gap-[var(--spacing-tight)] p-[var(--spacing-compact)] hover:border-[var(--color-brand-primary)]/40 ${DS_MOTION_ENTER} ${DS_FOCUS_RING}`}
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
          className={`${card} text-left flex flex-col gap-[var(--spacing-tight)] p-[var(--spacing-compact)] border-dashed hover:border-[var(--color-text-muted)] ${DS_MOTION_ENTER} ${DS_FOCUS_RING}`}
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
