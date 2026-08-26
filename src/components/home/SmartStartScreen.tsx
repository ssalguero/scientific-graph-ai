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
  onExpertMode?: () => void;
  hasDataset: boolean;
  hasExperimentalSeries: boolean;
};

/**
 * CRP-6.3.x FINAL — optically centered Home: heading + objective + labeled launcher.
 */
export function SmartStartScreen({
  onSelect,
  hasDataset,
  hasExperimentalSeries,
}: SmartStartScreenProps) {
  const [guidanceEpoch, setGuidanceEpoch] = useState(0);

  return (
    <section
      className="flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center px-[var(--spacing-default)]"
      aria-label="Inicio"
      style={capabilityAccentBridgeStyle}
      data-home-launcher
    >
      <div className="flex w-full flex-col items-center text-center">
        <div className="flex w-full max-w-[42rem] flex-col items-center">
          <h2
            className={[
              "inline-block max-w-full text-[48px] font-semibold leading-tight tracking-tight",
              "bg-clip-text text-transparent [-webkit-text-fill-color:transparent]",
            ].join(" ")}
            style={{
              backgroundImage:
                "linear-gradient(90deg, #ec4899 0%, #c026d3 42%, #a855f7 100%)",
              backgroundSize: "100% 100%",
            }}
          >
            ¿Qué deseas hacer hoy?
          </h2>

          <div className="mt-7 w-full">
            <SmartStartIntentAssistant
              key={guidanceEpoch}
              hasDataset={hasDataset}
              hasExperimentalSeries={hasExperimentalSeries}
            />
          </div>
        </div>

        <ul
          className="mt-11 flex w-full max-w-full list-none flex-wrap items-start justify-center gap-8 m-0 p-0"
          aria-label="Capacidades"
        >
          {CAPABILITY_IDENTITY.map((capability) => {
            const accentVar = capabilityAccentCssVar(capability.accent);
            const tipId = `capability-tip-${capability.id}`;
            const isAdvanced = capability.id === "expert-mode";
            const label = capability.launcherTitle;

            return (
              <li
                key={capability.id}
                className="group relative flex w-[9rem] shrink-0 flex-col items-center"
              >
                <button
                  type="button"
                  onClick={() => {
                    setGuidanceEpoch((epoch) => epoch + 1);
                    onSelect(capability.id);
                  }}
                  className={[
                    "relative flex h-[9rem] w-[9rem] cursor-pointer items-center justify-center",
                    "rounded-2xl",
                    "border bg-[var(--color-surface-default)]",
                    isAdvanced
                      ? "border-[var(--color-border-muted)]/70 opacity-60 hover:opacity-100"
                      : "border-transparent",
                    DS_FOCUS_RING,
                    DS_MOTION_FEEDBACK,
                  ].join(" ")}
                  style={
                    isAdvanced
                      ? { color: accentVar }
                      : {
                          color: accentVar,
                          backgroundColor: `color-mix(in srgb, ${accentVar} 14%, var(--color-surface-default))`,
                          borderColor: `color-mix(in srgb, ${accentVar} 38%, transparent)`,
                        }
                  }
                  aria-label={`${label}. ${capability.description}`}
                  aria-describedby={tipId}
                >
                  <span
                    className={[
                      "inline-flex items-center justify-center [&_svg]:size-[68px]",
                      "transition-transform duration-[var(--motion-feedback-duration)] ease-[var(--motion-feedback-easing)] motion-reduce:transition-none",
                      "group-hover:scale-[1.04] group-focus-within:scale-[1.04]",
                    ].join(" ")}
                  >
                    <WorkspaceIcon name={capability.icon} size="lg" />
                  </span>
                </button>

                <span
                  className={[
                    "mt-3 max-w-[9rem] text-[length:var(--typography-body-sm-font-size)] font-semibold leading-snug tracking-tight",
                    isAdvanced
                      ? "text-[var(--color-text-muted)]"
                      : "text-[var(--color-text-primary)]",
                  ].join(" ")}
                >
                  {label}
                </span>

                <span
                  id={tipId}
                  role="tooltip"
                  className={[
                    "pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-max max-w-[14rem] -translate-x-1/2",
                    "rounded-lg border border-[var(--color-border-default)]/70",
                    "bg-[var(--color-surface-default)] px-3 py-2 text-left shadow-md",
                    "text-xs leading-snug text-[var(--color-text-muted)]",
                    "opacity-0 translate-y-0.5",
                    "transition-[opacity,transform] duration-[var(--motion-feedback-duration)] ease-[var(--motion-feedback-easing)] motion-reduce:transition-none",
                    "group-hover:opacity-100 group-hover:translate-y-0",
                    "group-focus-within:opacity-100 group-focus-within:translate-y-0",
                  ].join(" ")}
                >
                  {capability.description}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
