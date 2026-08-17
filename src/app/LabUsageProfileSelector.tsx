"use client";

import { useState } from "react";

import {
  LAB_USAGE_PROFILE_META,
  LAB_USAGE_PROFILE_ORDER,
  type LabUsageProfile,
} from "./labUsageProfile";

type LabUsageProfileSelectorProps = {
  value: LabUsageProfile;
  onChange: (profile: LabUsageProfile) => void;
  persistenceBadgeClassName: string;
};

export function LabUsageProfileSelector({
  value,
  onChange,
  persistenceBadgeClassName,
}: LabUsageProfileSelectorProps) {
  const activeMeta = LAB_USAGE_PROFILE_META[value];
  const [open, setOpen] = useState(false);

  return (
    <div className="py-0.5 px-1" aria-label="Perfil de uso">
      <button
        type="button"
        onClick={() => setOpen((next) => !next)}
        className="flex w-full items-center gap-1.5 text-left text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
        aria-expanded={open}
      >
        <span className="font-medium">Perfil:</span>
        <span className="text-[var(--color-text-secondary)]">{activeMeta.label}</span>
        {value === "expert" ? (
          <span
            className={persistenceBadgeClassName}
            title="Perfil experto activo"
          >
            EXPERTO
          </span>
        ) : null}
        <span className="ml-auto text-[9px]" aria-hidden>
          {open ? "▾" : "▸"}
        </span>
      </button>

      {open ? (
        <div
          className="mt-1 flex flex-col gap-1.5"
          role="group"
          aria-label="Modo de laboratorio"
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {LAB_USAGE_PROFILE_ORDER.map((profileId) => {
              const meta = LAB_USAGE_PROFILE_META[profileId];
              const inputId = `lab-usage-profile-${profileId}`;
              return (
                <label
                  key={profileId}
                  htmlFor={inputId}
                  className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] cursor-pointer"
                >
                  <input
                    id={inputId}
                    type="radio"
                    name="lab-usage-profile"
                    value={profileId}
                    checked={value === profileId}
                    onChange={() => onChange(profileId)}
                    className="h-3 w-3 border-[var(--color-border-default)] text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]/20"
                  />
                  {meta.label}
                </label>
              );
            })}
          </div>
          <span className="text-[10px] text-[var(--color-text-muted)]">
            {activeMeta.hint}
          </span>
        </div>
      ) : null}
    </div>
  );
}

type LabExpertModeToastProps = {
  onDismiss: () => void;
};

export function LabExpertModeToast({ onDismiss }: LabExpertModeToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 max-w-md w-[calc(100%-2rem)] rounded-lg border border-[var(--app-accent)]/35 bg-[var(--app-surface)] px-4 py-3 shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--app-heading)]">
            Perfil experto activado.
          </p>
          <p className="text-xs text-[var(--app-text-muted)] mt-0.5">
            Todas las herramientas están disponibles.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-xs text-[var(--app-text-muted)] hover:text-[var(--app-heading)]"
          aria-label="Cerrar notificación"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
