"use client";

import { useMemo } from "react";

import type { DeriveAutosaveIndicatorInput } from "@/lib/project/application/persistence-status";

import { buildAutosaveIndicatorView } from "./persistenceViews";
import type { AutosaveIndicatorView } from "./types";

export function useAutosaveIndicator(
  input: DeriveAutosaveIndicatorInput
): AutosaveIndicatorView {
  return useMemo(
    () => buildAutosaveIndicatorView(input),
    [
      input.enabled,
      input.hasActiveLocalProject,
      input.isProjectDirty,
      input.isSaving,
      input.hasError,
    ]
  );
}
