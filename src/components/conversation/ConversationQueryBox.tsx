"use client";

import { useState } from "react";

import {
  normalizeAnalyzeContext,
  type AnalyzeInspectorCategory,
} from "@/lib/conversation/analyze-adapter";
import { normalizeCompareContext } from "@/lib/conversation/compare-adapter";
import {
  runConversationCore,
  type ConversationTurnResult,
} from "@/lib/conversation/core";
import { buildSystemContext } from "@/lib/conversation/system-context";
import { btnSecondary, inputField } from "@/app/projectFileUiStyles";
import { DS_FOCUS_RING, DS_MOTION_FEEDBACK } from "@/lib/ui/focus-ring";

export type ConversationQueryBoxProps = {
  workspaceSection: "home" | "data" | "analysis" | "results" | "reports";
  dataWorkspaceView: "experimental" | "curves" | "advanced" | "visual-builder";
  comparisonSurfaceOpen: boolean;
  importDestinationActive: boolean;
  hasDataset: boolean | null;
  hasExperimentalSeries: boolean | null;
  inspectorCategory: AnalyzeInspectorCategory | null;
  hasExecutedAnalysis: boolean | null;
  slotAOccupied: boolean | null;
  slotBOccupied: boolean | null;
  slotAFileName: string | null;
  slotBFileName: string | null;
};

function TurnPanel({ turn }: { turn: ConversationTurnResult }) {
  return (
    <div
      className="rounded-[var(--radius-container)] border border-[var(--color-brand-primary)]/30 bg-[var(--color-brand-primary)]/5 px-[var(--spacing-compact)] py-2.5 space-y-[var(--spacing-tight)] text-left"
      role="status"
    >
      <p className="text-sm font-semibold text-[var(--color-text-primary)]">
        {turn.interpretation}
      </p>
      <p className="text-xs text-[var(--color-text-muted)]">{turn.explanation}</p>
      <p className="text-xs text-[var(--color-text-primary)]">
        Orientación: {turn.orientation.meaning}. Usted decide si usa ese lugar.
      </p>
      {turn.continuationPrompt ? (
        <p className="text-sm text-[var(--color-text-primary)]">
          {turn.continuationPrompt}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Transversal on-demand query surface for the Conversation Core.
 * Not an Analyze or Compare assistant. Does not navigate or execute.
 */
export function ConversationQueryBox({
  workspaceSection,
  dataWorkspaceView,
  comparisonSurfaceOpen,
  importDestinationActive,
  hasDataset,
  hasExperimentalSeries,
  inspectorCategory,
  hasExecutedAnalysis,
  slotAOccupied,
  slotBOccupied,
  slotAFileName,
  slotBFileName,
}: ConversationQueryBoxProps) {
  const [queryText, setQueryText] = useState("");
  const [turn, setTurn] = useState<ConversationTurnResult | null>(null);

  const handleAsk = () => {
    const system = buildSystemContext({
      surface: {
        workspaceSection,
        dataWorkspaceView,
        comparisonSurfaceOpen,
        importDestinationActive,
      },
      hasDataset,
      hasExperimentalSeries,
    });
    const analyzeContext =
      system.activeConversationDomain === "analyze"
        ? normalizeAnalyzeContext({
            hasDataset,
            hasExperimentalSeries,
            inspectorCategory,
            hasExecutedAnalysis,
          })
        : null;
    const compareContext =
      comparisonSurfaceOpen ||
      slotAOccupied === true ||
      slotBOccupied === true
        ? normalizeCompareContext({
            slotAOccupied,
            slotBOccupied,
            slotAFileName,
            slotBFileName,
          })
        : null;
    const next = runConversationCore({
      text: queryText,
      system,
      analyzeContext,
      compareContext,
      previous: turn,
    });
    setTurn(next);
  };

  return (
    <div
      className="mb-3 w-full space-y-[var(--spacing-tight)]"
      aria-label="Consulta de orientación"
    >
      <div className="flex w-full items-stretch gap-2.5">
        <input
          type="text"
          value={queryText}
          onChange={(event) => setQueryText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleAsk();
            }
          }}
          placeholder="Consulte dónde está una capacidad..."
          aria-label="Consulta de orientación"
          className={`${inputField} min-h-0 h-11 flex-1 rounded-xl border-[var(--color-border-default)]/80 bg-[var(--color-surface-default)] px-4 text-sm ${DS_FOCUS_RING}`}
        />
        <button
          type="button"
          onClick={handleAsk}
          disabled={queryText.trim().length === 0}
          className={`${btnSecondary} h-11 shrink-0 rounded-xl px-4 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${DS_MOTION_FEEDBACK}`}
        >
          Consultar
        </button>
      </div>
      {turn ? <TurnPanel turn={turn} /> : null}
    </div>
  );
}
