type CompareStepsBannerProps = {
  slotAReady: boolean;
  slotBReady: boolean;
  onDismiss: () => void;
};

export function CompareStepsBanner({
  slotAReady,
  slotBReady,
  onDismiss,
}: CompareStepsBannerProps) {
  const steps = [
    {
      label: "Importe el primer dataset y capture Slot A",
      done: slotAReady,
    },
    {
      label: "Importe el segundo dataset y capture Slot B",
      done: slotBReady,
    },
    {
      label: "Revise la comparación en Resultados",
      done: slotAReady && slotBReady,
    },
  ];

  return (
    <div
      className="rounded-lg border border-[var(--app-accent)]/35 bg-[var(--app-accent)]/5 px-3 py-3 sm:px-4"
      role="status"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-[var(--app-heading)]">
          Comparación multi-dataset A/B
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-xs text-[var(--app-text-muted)] hover:text-[var(--app-heading)]"
          aria-label="Cerrar guía de pasos"
        >
          ✕
        </button>
      </div>
      <ol className="mt-2 space-y-1.5">
        {steps.map((step, index) => (
          <li
            key={step.label}
            className={`text-xs sm:text-sm flex items-start gap-2 ${
              step.done
                ? "text-emerald-700"
                : "text-[var(--app-text-muted)]"
            }`}
          >
            <span aria-hidden>{step.done ? "✓" : `${index + 1}.`}</span>
            <span>{step.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
