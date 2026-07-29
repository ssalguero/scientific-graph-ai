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

/** Local shell — denser padding/typography than contentPanel; retained (not 1:1). */
const panelClassName =
  "rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-2 text-xs text-[var(--app-text)]";

const settingRowClassName =
  "flex items-center justify-between gap-2 rounded-md border border-[var(--app-border)]/60 bg-[var(--app-surface-muted)]/40 px-2 py-1.5";

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
      <div className="space-y-2">
        <div className={settingRowClassName}>
          <span className="text-xs text-[var(--app-text)]" id="settings-theme-label">
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
          className="flex items-center justify-between gap-2 px-0.5 text-[11px] text-[var(--app-text-muted)]"
          aria-hidden
        >
          <span>☀ Claro</span>
          <span>🌙 Oscuro</span>
        </div>

        <div className={settingRowClassName}>
          <span
            className="text-xs text-[var(--app-text)]"
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
        <p className="px-0.5 text-[11px] leading-snug text-[var(--app-text-muted)]">
          Muestra u oculta avisos y badges de ayuda en el inspector de análisis.
        </p>

        <div className={settingRowClassName}>
          <span className="text-xs text-[var(--app-text)]">Versión</span>
          <span
            className="text-[11px] font-medium text-[var(--app-text-muted)] tabular-nums"
            aria-label={`Versión de la aplicación ${appVersion}`}
          >
            v{appVersion}
          </span>
        </div>
      </div>
    </section>
  );
}
