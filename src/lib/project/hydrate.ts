import { migrateProjectJson } from "./migrate";
import { sanitizeProjectSnapshot } from "./sanitize";
import type {
  HydrateProjectPatch,
  HydrateProjectResult,
  PostHydrateAction,
  ProjectValidationIssue,
  ScientificProjectFile,
  ScientificProjectV1,
} from "./types";
import { validateScientificProjectFile } from "./validate";

/**
 * Hydration order for F4 applyProjectPatch:
 *
 * Phase 0 — reset ephemeral UI (page.tsx)
 * Phase 1 — metadata + dataset + importProvenance
 * Phase 2 — graphContext
 * Phase 3 — analysisConfig modes + visibility + legend
 * Phase 4 — analysisConfig selections
 * Phase 5 — comparison + workflow session
 * Phase 6 — workspace navigation
 * Phase 7 — postHydrateActions (generateGraph)
 *
 * SCI-59 toggles are NOT re-applied; stored in analysisConfig.visibility.
 * SCI-53→60 outputs are NOT hydrated — recomputed via useMemo after patch.
 */

const resolvePostHydrateActions = (
  project: ScientificProjectV1
): PostHydrateAction[] => {
  const actions: PostHydrateAction[] = [];
  const hasGraphCurves =
    project.graphContext?.curves.some((curve) => curve.expression.trim()) ??
    false;
  if (hasGraphCurves) {
    actions.push("generateGraph");
  }
  return actions;
};

export const buildHydrateProjectPatch = (
  project: ScientificProjectV1,
  warnings: ProjectValidationIssue[] = []
): HydrateProjectPatch => {
  const { project: sanitized, warnings: sanitizeWarnings } =
    sanitizeProjectSnapshot(project);

  return {
    project: sanitized,
    postHydrateActions: resolvePostHydrateActions(sanitized),
    warnings: [...warnings, ...sanitizeWarnings],
  };
};

export const hydrateProject = (
  file: ScientificProjectFile
): HydrateProjectResult => {
  const validation = validateScientificProjectFile(file);
  if (!validation.ok) {
    return {
      ok: false,
      errors: validation.errors,
      warnings: validation.warnings,
    };
  }

  return {
    ok: true,
    patch: buildHydrateProjectPatch(file.project, validation.warnings),
  };
};

export const hydrateProjectJson = (text: string): HydrateProjectResult => {
  const migrated = migrateProjectJson(text);
  if (!migrated.ok) {
    return { ok: false, errors: migrated.errors, warnings: [] };
  }

  const hydrated = hydrateProject(migrated.file);
  if (!hydrated.ok) {
    return hydrated;
  }

  return {
    ok: true,
    patch: {
      ...hydrated.patch,
      warnings: [...migrated.warnings, ...hydrated.patch.warnings],
    },
  };
};
