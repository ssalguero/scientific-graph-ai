"use client";

import {
  toggleInput,
  toggleShell,
  toggleTrackBg,
  toggleThumb,
} from "@/lib/ui/theme";

export type SettingsPanelProps = {
  theme: "light" | "dark";
  showContextualHints: boolean;
  appVersion: string;
  onThemeChange: (theme: "light" | "dark") => void;
  onShowContextualHintsChange: (value: boolean) => void;
  className?: string;
};

/** UX-I2 — Shared settings form chrome consumes Design System CSS variables. */
const panelClassName =
  "rounded-[var(--radius-control)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] px-[var(--spacing-tight)] py-[var(--spacing-tight)] text-[length:var(--typography-body-sm-font-size)] text-[var(--color-text-primary)] shadow-[var(--elevation-card)]";

const settingRowClassName =
  "flex items-center justify-between gap-[var(--spacing-tight)] rounded-[var(--radius-container)] border border-[var(--color-border-default)]/60 bg-[var(--color-surface-canvas)]/40 px-[var(--spacing-tight)] py-1.5";

export function SettingsPanel({
  theme,
  showContextualHints,
  appVersion,
  onThemeChange,
  onShowContextualHintsChange,
  className,
}: SettingsPanelProps) {
  return (
    <section
      className={[panelClassName, className].filter(Boolean).join(" ")}
      aria-label="Configuración"
    >
      <div className="space-y-[var(--spacing-tight)]">
        <div className={settingRowClassName}>
          <span
            className="text-[length:var(--typography-body-sm-font-size)] text-[var(--color-text-primary)]"
            id="settings-theme-label"
          >
            Tema oscuro
          </span>
          <label className={`${toggleShell} cursor-pointer shrink-0`}>
            <input
              type="checkbox"
              className={toggleInput}
              checked={theme === "dark"}
              onChange={(event) =>
                onThemeChange(event.target.checked ? "dark" : "light")
              }
              aria-labelledby="settings-theme-label"
            />
            <span className={toggleTrackBg} aria-hidden />
            <span className={toggleThumb} aria-hidden />
          </label>
        </div>
        <div
          className="flex items-center justify-between gap-[var(--spacing-tight)] px-0.5 text-[length:var(--typography-caption-font-size)] text-[var(--color-text-muted)]"
          aria-hidden
        >
          <span>☀ Claro</span>
          <span>🌙 Oscuro</span>
        </div>

        <div className={settingRowClassName}>
          <span
            className="text-[length:var(--typography-body-sm-font-size)] text-[var(--color-text-primary)]"
            id="settings-hints-label"
          >
            Hints contextuales
          </span>
          <label className={`${toggleShell} cursor-pointer shrink-0`}>
            <input
              type="checkbox"
              className={toggleInput}
              checked={showContextualHints}
              onChange={(event) =>
                onShowContextualHintsChange(event.target.checked)
              }
              aria-labelledby="settings-hints-label"
            />
            <span className={toggleTrackBg} aria-hidden />
            <span className={toggleThumb} aria-hidden />
          </label>
        </div>
        <p className="px-0.5 text-[length:var(--typography-caption-font-size)] leading-[var(--typography-caption-line-height)] text-[var(--color-text-muted)]">
          Muestra u oculta avisos y badges de ayuda en el inspector de análisis.
        </p>

        <div className={settingRowClassName}>
          <span className="text-[length:var(--typography-body-sm-font-size)] text-[var(--color-text-primary)]">
            Versión
          </span>
          <span
            className="text-[length:var(--typography-caption-font-size)] font-medium text-[var(--color-text-muted)] tabular-nums"
            aria-label={`Versión de la aplicación ${appVersion}`}
          >
            v{appVersion}
          </span>
        </div>
      </div>
    </section>
  );
}
