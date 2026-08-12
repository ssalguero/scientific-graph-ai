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

function cardClassForProminence(
  prominence: "primary" | "secondary" | "supporting" | undefined
): string {
  if (prominence === "primary") {
    return `${card} text-left flex flex-col gap-[var(--spacing-tight)] p-[var(--spacing-default)] border-[var(--color-brand-primary)]/45 bg-[var(--color-brand-primary)]/8 hover:border-[var(--color-brand-primary)] ${DS_MOTION_ENTER} ${DS_FOCUS_RING}`;
  }
  if (prominence === "supporting") {
    return `${card} text-left flex flex-col gap-[var(--spacing-tight)] p-[var(--spacing-compact)] opacity-90 hover:border-[var(--color-brand-primary)]/30 ${DS_MOTION_ENTER} ${DS_FOCUS_RING}`;
  }
  return `${card} text-left flex flex-col gap-[var(--spacing-tight)] p-[var(--spacing-compact)] hover:border-[var(--color-brand-primary)]/40 ${DS_MOTION_ENTER} ${DS_FOCUS_RING}`;
}

export function SmartStartScreen({
  onSelect,
  onExpertMode,
  onStartRecommendation,
}: SmartStartScreenProps) {
  return (
    <section
      className="mx-auto w-full max-w-5xl rounded-[var(--radius-container)] border border-[var(--color-border-default)]/70 bg-[var(--color-surface-default)] p-[var(--spacing-default)] sm:p-[var(--spacing-medium)] space-y-[var(--spacing-default)]"
      aria-label="Inicio guiado"
    >
      <div className="text-left space-y-[var(--spacing-tight)]">
        <h2 className="text-[length:var(--typography-heading-sm-font-size)] font-semibold leading-[var(--typography-heading-sm-line-height)] text-[var(--color-text-primary)] tracking-tight">
          ¿Qué desea hacer hoy?
        </h2>
        <p className={`${panelHeadingSubtext} !mt-0 max-w-2xl`}>
          Comience por importar datos o elija otra entrada. El laboratorio
          completo permanece disponible como opción secundaria.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-compact)]">
        {SMART_START_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={cardClassForProminence(option.prominence)}
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
            <span
              className={`text-xs font-semibold pt-0.5 ${
                option.prominence === "primary"
                  ? "text-[var(--color-brand-primary)]"
                  : "text-[var(--color-brand-primary)]"
              }`}
            >
              {option.actionLabel} →
            </span>
          </button>
        ))}

        <button
          type="button"
          onClick={onExpertMode}
          className={`${card} text-left flex flex-col gap-[var(--spacing-tight)] p-[var(--spacing-compact)] border-dashed opacity-70 hover:opacity-100 hover:border-[var(--color-text-muted)] ${DS_MOTION_ENTER} ${DS_FOCUS_RING}`}
        >
          <span className="text-lg" aria-hidden>
            🧪
          </span>
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">
            Modo experto
          </span>
          <span className="text-xs text-[var(--color-text-muted)] leading-snug flex-1">
            Acceda al laboratorio completo sin el flujo guiado inicial
            (configuración avanzada).
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
