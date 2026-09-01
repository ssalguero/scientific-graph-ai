"use client";

import { useState } from "react";

import { btnSecondary, inputField } from "@/app/projectFileUiStyles";
import {
  createProductContext,
  type ConversationMessage,
  type ProductContext,
} from "@/lib/conversation/experience";
import { DS_FOCUS_RING, DS_MOTION_FEEDBACK } from "@/lib/ui/focus-ring";

export type ScientificConversationSurfaceProps = {
  variant: "hero" | "contextual";
  product: ProductContext;
};

export function HomeConversationDoor({
  hasDataset,
  hasExperimentalSeries,
}: {
  hasDataset: boolean | null;
  hasExperimentalSeries: boolean | null;
}) {
  const product: ProductContext = createProductContext({
    productScreen: "home",
    hasDataset,
    hasExperimentalSeries,
  });
  return <ScientificConversationSurface variant="hero" product={product} />;
}

function transcriptFromHistory(history: ConversationMessage[]): {
  user: string;
  assistant: string;
}[] {
  const turns: { user: string; assistant: string }[] = [];
  for (let i = 0; i < history.length; i += 1) {
    const message = history[i];
    if (message.role !== "user") continue;
    const next = history[i + 1];
    turns.push({
      user: message.content,
      assistant: next?.role === "assistant" ? next.content : "",
    });
  }
  return turns;
}

/**
 * One user-visible IA across Home and workspace surfaces.
 * Does not navigate, execute, or call Card handlers.
 */
export function ScientificConversationSurface({
  variant,
  product,
}: ScientificConversationSurfaceProps) {
  const [queryText, setQueryText] = useState("");
  const [history, setHistory] = useState<ConversationMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disclosure, setDisclosure] = useState<string | null>(null);

  const prompt =
    variant === "hero"
      ? "¿Qué deseas hacer hoy?"
      : "¿Necesitás que te ayude con algo?";
  const placeholder =
    variant === "hero"
      ? "Escribí en tus palabras..."
      : "Preguntá sobre esta pantalla...";
  const inputId =
    variant === "hero"
      ? "scientific-ai-home-input"
      : "scientific-ai-context-input";

  const handleAsk = async () => {
    const text = queryText.trim();
    if (!text || pending) return;
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/conversation/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, history, product }),
      });
      if (!response.ok) {
        setError("No pude completar esa consulta. Probá de nuevo en un momento.");
        return;
      }
      const result = (await response.json()) as {
        text?: string;
        history?: ConversationMessage[];
        disclosure?: string;
      };
      if (!result.text || !Array.isArray(result.history)) {
        setError("No pude completar esa consulta. Probá de nuevo en un momento.");
        return;
      }
      setHistory(result.history);
      setDisclosure(result.disclosure ?? null);
      setQueryText("");
    } catch {
      setError("No pude completar esa consulta. Probá de nuevo en un momento.");
    } finally {
      setPending(false);
    }
  };

  const turns = transcriptFromHistory(history);
  const isHero = variant === "hero";
  const identityLabel =
    isHero || product.productScreen === "importar" ? "Preguntar" : prompt;

  return (
    <div
      className={
        isHero
          ? "mx-auto w-full space-y-[var(--spacing-tight)] text-center"
          : "mb-3 w-full space-y-[var(--spacing-tight)]"
      }
      aria-label="Inteligencia de Scientific Graph AI"
    >
      <p className="text-sm font-medium text-[var(--color-text-primary)]">
        {identityLabel}
      </p>
      <div className="flex w-full items-stretch gap-2.5">
        <input
          id={inputId}
          type="text"
          value={queryText}
          onChange={(event) => {
            setQueryText(event.target.value);
            setError(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void handleAsk();
            }
          }}
          placeholder={placeholder}
          aria-label={prompt}
          disabled={pending}
          className={`${inputField} min-h-0 ${
            isHero ? "h-[3.625rem] px-6 text-base text-center placeholder:text-center" : "h-11 px-4 text-sm"
          } flex-1 rounded-xl border-[var(--color-border-default)]/80 bg-[var(--color-surface-default)] ${DS_FOCUS_RING}`}
        />
        <button
          type="button"
          onClick={() => void handleAsk()}
          disabled={queryText.trim().length === 0 || pending}
          className={`${btnSecondary} ${
            isHero ? "h-[3.625rem] px-6" : "h-11 px-4"
          } shrink-0 rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${DS_MOTION_FEEDBACK}`}
        >
          {pending ? "Pensando…" : "Preguntar"}
        </button>
      </div>

      {error ? (
        <p className="text-xs text-[var(--color-text-muted)]" role="status">
          {error}
        </p>
      ) : null}

      {turns.length > 0 ? (
        <div className="space-y-2 text-left" role="log" aria-live="polite">
          {turns.map((turn, index) => (
            <div
              key={`${index}-${turn.user.slice(0, 12)}`}
              className="rounded-[var(--radius-container)] border border-[var(--color-brand-primary)]/30 bg-[var(--color-brand-primary)]/5 px-[var(--spacing-compact)] py-2.5 space-y-[var(--spacing-tight)]"
            >
              <p className="text-xs font-medium text-[var(--color-text-muted)]">
                Vos: {turn.user}
              </p>
              <p className="whitespace-pre-wrap text-sm text-[var(--color-text-primary)]">
                {turn.assistant}
              </p>
              {disclosure ? (
                <p className="text-[10px] leading-snug text-[var(--color-text-muted)]">
                  {disclosure}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
