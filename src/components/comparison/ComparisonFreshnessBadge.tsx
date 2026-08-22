"use client";

import {
  deriveComparisonSlotFreshness,
  type ComparisonSlotFreshness,
} from "./comparisonSlotFreshness";
import type { DatasetAnalysisProfile } from "@/lib/scientific/comparison";
import type { ScientificProvenanceDescriptor } from "@/lib/scientific/contracts";

type ComparisonFreshnessBadgeProps = {
  profile: DatasetAnalysisProfile;
  currentProvenance?: ScientificProvenanceDescriptor | null;
  sourceAvailable?: boolean | "unknown";
  freshness?: ComparisonSlotFreshness;
};

export function ComparisonFreshnessBadge({
  profile,
  currentProvenance,
  sourceAvailable,
  freshness,
}: ComparisonFreshnessBadgeProps) {
  const resolved =
    freshness ??
    deriveComparisonSlotFreshness({
      profile,
      currentProvenance,
      sourceAvailable,
    });
  const tone =
    resolved.state === "CURRENT"
      ? "text-emerald-600"
      : resolved.state === "STALE"
        ? "text-amber-600"
        : resolved.state === "INVALID"
          ? "text-red-600"
          : "text-[var(--app-text-muted)]";
  const icon =
    resolved.state === "CURRENT"
      ? "✓"
      : resolved.state === "UNKNOWN"
        ? "?"
        : "⚠";

  return (
    <div className="mt-1 space-y-0.5">
      <p className={`text-xs font-semibold ${tone}`}>
        {icon} Vigencia: {resolved.state}
      </p>
      {resolved.messages.map((message) => (
        <p key={message} className={`text-xs ${tone}`}>
          {message}
        </p>
      ))}
    </div>
  );
}
