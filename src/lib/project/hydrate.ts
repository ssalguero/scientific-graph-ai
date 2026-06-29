import { buildHydrateProjectV2Patch } from "./apply-hydrate-project-v2-patch";
import { isScientificProjectFileV2 } from "./adapters/sgproj/envelope";
import { collapseProjectV2ForHydrate } from "./adapters/sgproj/collapse-v2-for-hydrate";
import { migrateProjectJson } from "./migrate";
import { sanitizeProjectSnapshot } from "./sanitize";
import { sanitizeScientificProjectV2 } from "./sanitize-project-v2";
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
 * Phase 1 — metadata + sessionDatasets + active dataset editor payload
 * Phase 2 — graphContext
 * Phase 3 — analysisConfig modes + visibility + legend
 * Phase 4 — analysisConfig selections
 * Phase 5 — comparison + workflow session
 * Phase 6 — workspace navigation
 * Phase 7 — postHydrateActions (generateGraph)
 *
 * SCI-59 toggles are NOT re-applied; stored in analysisConfig.visibility.
 * SCI-53→60 outputs are NOT hydrated — recomputed via useMemo after patch.
 *
 * PROD-2B B2.6: native V2 hydrate via buildHydrateProjectV2Patch (no collapse).
 * PROD-2B B2.9: sanitizeScientificProjectV2 after validate, before hydrate patch.
 * V1-shaped buildHydrateProjectPatch remains for legacy serialize/snapshot helpers only.
 */

const resolvePostHydrateActionsV1 = (
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

/** Legacy V1 collapse helper — retained for serialize/snapshot paths until Save wiring. */
export const projectFileToHydrateV1 = (
  file: ScientificProjectFile
): ScientificProjectV1 =>
  isScientificProjectFileV2(file)
    ? collapseProjectV2ForHydrate(file.project)
    : file.project;

/** Legacy V1 sanitize patch builder — not used by the main hydrate pipeline after B2.6. */
export const buildHydrateProjectPatch = (
  project: ScientificProjectV1,
  warnings: ProjectValidationIssue[] = []
): HydrateProjectPatch => {
  const { project: sanitized, warnings: sanitizeWarnings } =
    sanitizeProjectSnapshot(project);

  return {
    project: sanitized,
    postHydrateActions: resolvePostHydrateActionsV1(sanitized),
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

  if (!isScientificProjectFileV2(file)) {
    return {
      ok: false,
      errors: [
        {
          code: "H-NOT-V2",
          path: "schemaVersion",
          message:
            "hydrateProject requires a migrated ScientificProjectFileV2 envelope.",
          severity: "error",
        },
      ],
      warnings: validation.warnings,
    };
  }

  const { project: sanitizedProject, warnings: sanitizeWarnings } =
    sanitizeScientificProjectV2(file.project);

  return {
    ok: true,
    patch: buildHydrateProjectV2Patch(sanitizedProject, {
      warnings: [...validation.warnings, ...sanitizeWarnings],
    }),
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
