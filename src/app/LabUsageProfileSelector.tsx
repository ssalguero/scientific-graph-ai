"use client";

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

  return (
    <div
      className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-3 py-1.5 px-2.5 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-muted)]/60"
      role="group"
      aria-label="Modo de laboratorio"
    >
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[11px] sm:text-xs font-semibold text-[var(--app-heading)]">
          Modo:
        </span>
        {value === "expert" ? (
          <span
            className={persistenceBadgeClassName}
            title="Perfil experto activo"
          >
            EXPERTO
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        {LAB_USAGE_PROFILE_ORDER.map((profileId) => {
          const meta = LAB_USAGE_PROFILE_META[profileId];
          const inputId = `lab-usage-profile-${profileId}`;
          return (
            <label
              key={profileId}
              htmlFor={inputId}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[var(--app-text)] cursor-pointer"
            >
              <input
                id={inputId}
                type="radio"
                name="lab-usage-profile"
                value={profileId}
                checked={value === profileId}
                onChange={() => onChange(profileId)}
                className="h-3.5 w-3.5 border-[var(--app-border)] text-[var(--app-accent)] focus:ring-[var(--app-accent)]/20"
              />
              {meta.label}
            </label>
          );
        })}
      </div>

      <span className="text-[11px] text-[var(--app-text-muted)] sm:ml-auto">
        {activeMeta.hint}
      </span>
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
            Modo experto activado.
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
