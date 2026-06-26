"use client";

import {
  deriveComparisonSlotFreshness,
  type ComparisonSlotFreshness,
} from "./comparisonSlotFreshness";
import type { DatasetAnalysisProfile } from "@/lib/scientific/comparison";

type ComparisonFreshnessBadgeProps = {
  profile: DatasetAnalysisProfile;
  activeFileName: string | null;
  activeImportedAt: string | null;
  activeWorksheetModified: boolean;
  freshness?: ComparisonSlotFreshness;
};

export function ComparisonFreshnessBadge({
  profile,
  activeFileName,
  activeImportedAt,
  activeWorksheetModified,
  freshness,
}: ComparisonFreshnessBadgeProps) {
  const resolved =
    freshness ??
    deriveComparisonSlotFreshness({
      profile,
      activeFileName,
      activeImportedAt,
      activeWorksheetModified,
    });

  if (resolved.messages.length === 0) {
    return null;
  }

  return (
    <div className="mt-1 space-y-0.5">
      {resolved.messages.map((message) => (
        <p
          key={message}
          className={`text-xs ${
            resolved.isStale ? "text-amber-600" : "text-[var(--app-text-muted)]"
          }`}
        >
          {resolved.isStale ? "⚠ " : "ℹ "}
          {message}
        </p>
      ))}
    </div>
  );
}
