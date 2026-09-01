"use client";

import { useState } from "react";

import {
  capabilityAccentBridgeStyle,
  capabilityAccentCssVar,
} from "@/lib/smart-start/capability-accents";
import { CAPABILITY_IDENTITY } from "@/lib/smart-start/capability-identity";
import { SmartStartIntentAssistant } from "@/components/home/SmartStartIntentAssistant";
import { WorkspaceIcon } from "@/components/workspace/iconography/WorkspaceIcon";
import { DS_FOCUS_RING, DS_MOTION_FEEDBACK } from "@/lib/ui/focus-ring";

type SmartStartScreenProps = {
  onSelect: (optionId: string) => void;
  hasDataset: boolean;
  hasExperimentalSeries: boolean;
};

/**
 * R1 — Home Product Face: identity → Preguntar → Cards → continuity.
 * Cards open Product Screens via onSelect → openProductScreen. Not Tabs.
 */
export function SmartStartScreen({
  onSelect,
  hasDataset,
  hasExperimentalSeries,
}: SmartStartScreenProps) {
  const [guidanceEpoch, setGuidanceEpoch] = useState(0);

  return (
    <section
      className="flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center px-[var(--spacing-default)] py-[var(--spacing-default)]"
      aria-label="Inicio"
      style={capabilityAccentBridgeStyle}
      data-home-launcher
    >
      <div className="flex w-full max-w-[56rem] flex-col items-center text-center">
        <header
          className="flex w-full max-w-[42rem] flex-col items-center"
          data-home-identity
        >
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
            Scientific Graph AI
          </p>
          <h2
            className={[
              "mt-3 inline-block max-w-full text-[2rem] sm:text-[2.75rem] font-semibold leading-tight tracking-tight",
              "bg-clip-text text-transparent [-webkit-text-fill-color:transparent]",
            ].join(" ")}
            style={{
              backgroundImage:
                "linear-gradient(90deg, #ec4899 0%, #c026d3 42%, #a855f7 100%)",
              backgroundSize: "100% 100%",
            }}
          >
            Producto científico
          </h2>
          <p className="mt-3 max-w-[36rem] text-sm leading-snug text-[var(--color-text-muted)]">
            Importar, graficar, analizar, comparar, evaluar, interpretar y
            reportar. Las Cards ejecutan. Preguntar orienta.
          </p>
        </header>

        <div className="mt-7 w-full max-w-[42rem]" data-home-preguntar>
          <SmartStartIntentAssistant
            key={guidanceEpoch}
            hasDataset={hasDataset}
            hasExperimentalSeries={hasExperimentalSeries}
          />
        </div>

        <p className="mt-10 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
          Entradas del producto
        </p>
        <ul
          className="mt-4 grid w-full list-none grid-cols-1 min-[390px]:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 m-0 p-0"
          aria-label="Cards del producto"
          data-home-cards
        >
          {CAPABILITY_IDENTITY.map((capability) => {
            const accentVar = capabilityAccentCssVar(capability.accent);
            const tipId = `capability-tip-${capability.id}`;
            const label = capability.launcherTitle;

            return (
              <li key={capability.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    setGuidanceEpoch((epoch) => epoch + 1);
                    onSelect(capability.id);
                  }}
                  className={[
                    "group flex h-full w-full cursor-pointer flex-col items-start text-left",
                    "rounded-2xl px-4 py-4",
                    "border bg-[var(--color-surface-default)]",
                    DS_FOCUS_RING,
                    DS_MOTION_FEEDBACK,
                  ].join(" ")}
                  style={{
                    color: accentVar,
                    backgroundColor: `color-mix(in srgb, ${accentVar} 12%, var(--color-surface-default))`,
                    borderColor: `color-mix(in srgb, ${accentVar} 38%, transparent)`,
                  }}
                  aria-label={`${label}. ${capability.description} ${capability.destinationHint}.`}
                  aria-describedby={tipId}
                  data-home-card={capability.id}
                >
                  <span className="inline-flex items-center justify-center [&_svg]:size-9">
                    <WorkspaceIcon name={capability.icon} size="lg" />
                  </span>
                  <span
                    className={[
                      "mt-3 text-[length:var(--typography-body-sm-font-size)] font-semibold leading-snug tracking-tight",
                      "text-[var(--color-text-primary)]",
                    ].join(" ")}
                  >
                    {label}
                  </span>
                  <span
                    id={tipId}
                    className="mt-1 text-xs leading-snug text-[var(--color-text-muted)]"
                  >
                    {capability.description}
                  </span>
                  <span className="mt-2 text-[11px] font-medium tracking-wide text-[var(--color-text-primary)]">
                    {capability.destinationHint}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <p
          className="mt-8 max-w-[36rem] text-xs leading-snug text-[var(--color-text-muted)]"
          data-home-continuity
        >
          Cada Card abre su Product Screen. Resultados y Reportes continúan el
          trabajo después de graficar, comparar o analizar.
        </p>
      </div>
    </section>
  );
}
