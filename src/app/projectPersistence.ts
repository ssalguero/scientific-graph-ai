import type { ExperimentalSeries } from "@/lib/experimentalData";
import type { ImportReport } from "@/lib/import/types";
import type { GuidedWorkflowSession } from "@/lib/scientific/workflow/types";
import {
  DEFAULT_PROJECT_NAME,
  PROJECT_FILE_EXTENSION,
  type GraphEditorProjectSnapshot,
  type ProjectAnalysisModesV1,
  type ProjectAnalysisSelectionsV1,
  type ProjectGraphContextV1,
  type ProjectImportedDatasetInfo,
  type ProjectMetadataV1,
  type ProjectWorkspaceV1,
  type VisibilityKeyV1,
  type DatasetAnalysisProfileV1,
} from "@/lib/project";
import { VISIBILITY_KEYS_V1 } from "@/lib/project/keys";
import {
  applyHydrateProjectV2Patch,
  buildHydrateProjectV2Patch,
} from "@/lib/project/apply-hydrate-project-v2-patch";
import type {
  EditorProjectApplyContextV2,
  HydrateProjectV2Patch,
} from "@/lib/project/editor-hydrate-context-v2";

export type EditorComparisonProfile = DatasetAnalysisProfileV1;

export type EditorComparisonSlots = {
  A: {
    label: string;
    profile: EditorComparisonProfile | null;
    sourceDatasetId?: string | null;
  };
  B: {
    label: string;
    profile: EditorComparisonProfile | null;
    sourceDatasetId?: string | null;
  };
};

export type EditorVisibilityState = Partial<Record<VisibilityKeyV1, boolean>>;

export type EditorProjectReadContext = {
  metadata: ProjectMetadataV1;
  experimentalSeries: ExperimentalSeries[];
  currentDatasetInfo: ProjectImportedDatasetInfo | null;
  lastImportReport: ImportReport | null;
  preserveAnalysisConfiguration: boolean;
  visibility: EditorVisibilityState;
  modes: ProjectAnalysisModesV1;
  selections: ProjectAnalysisSelectionsV1;
  hiddenLegendKeys: string[];
  guidedWorkflowSession: GuidedWorkflowSession;
  comparisonSlots: EditorComparisonSlots;
  workspace: ProjectWorkspaceV1;
  title: string;
  minX: number;
  maxX: number;
  visibleMinX: number;
  visibleMaxX: number;
  autoScaleY: boolean;
  useSecondaryYAxis: boolean;
  curves: { expression: string; color: string }[];
};

export type EditorVisibilitySetters = Partial<
  Record<VisibilityKeyV1, (value: boolean) => void>
>;

export type EditorProjectApplyContext = EditorProjectApplyContextV2;

export const createInitialProjectMetadata = (): ProjectMetadataV1 => {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: DEFAULT_PROJECT_NAME,
    createdAt: now,
    updatedAt: now,
  };
};

export const sanitizeProjectFileName = (name: string): string => {
  const trimmed = name.trim() || DEFAULT_PROJECT_NAME;
  const safe = trimmed
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  return `${safe}${PROJECT_FILE_EXTENSION}`;
};

export const pickVisibilityState = (
  source: Record<string, boolean>
): EditorVisibilityState => {
  const visibility: EditorVisibilityState = {};
  for (const key of VISIBILITY_KEYS_V1) {
    if (typeof source[key] === "boolean") {
      visibility[key] = source[key];
    }
  }
  return visibility;
};

export const pickVisibilitySetters = (
  source: Record<string, ((value: boolean) => void) | undefined>
): EditorVisibilitySetters => {
  const setters: EditorVisibilitySetters = {};
  for (const key of VISIBILITY_KEYS_V1) {
    const setter = source[key];
    if (setter) {
      setters[key] = setter;
    }
  }
  return setters;
};

const buildGraphContext = (
  ctx: EditorProjectReadContext
): ProjectGraphContextV1 | null => {
  const hasCurves = ctx.curves.some((curve) => curve.expression.trim().length > 0);
  const hasTitle = ctx.title.trim().length > 0;
  if (!hasCurves && !hasTitle) {
    return null;
  }

  return {
    title: ctx.title,
    curves: ctx.curves.map((curve) => ({
      expression: curve.expression,
      color: curve.color,
    })),
    minX: ctx.minX,
    maxX: ctx.maxX,
    visibleMinX: ctx.visibleMinX,
    visibleMaxX: ctx.visibleMaxX,
    autoScaleY: ctx.autoScaleY,
    useSecondaryYAxis: ctx.useSecondaryYAxis,
  };
};

export const collectProjectSnapshot = (
  ctx: EditorProjectReadContext
): GraphEditorProjectSnapshot => ({
  metadata: { ...ctx.metadata },
  dataset: {
    series: ctx.experimentalSeries.map((series) => ({
      id: series.id,
      name: series.name,
      color: series.color,
      points: series.points.map((point) => ({ x: point.x, y: point.y })),
    })),
    info: ctx.currentDatasetInfo,
  },
  importProvenance: {
    report: ctx.lastImportReport,
    preserveAnalysisOnReimport: ctx.preserveAnalysisConfiguration,
  },
  analysisConfig: {
    visibility: { ...ctx.visibility },
    modes: { ...ctx.modes },
    selections: { ...ctx.selections },
    legend: { hiddenKeys: [...ctx.hiddenLegendKeys] },
  },
  workflow: {
    session: { ...ctx.guidedWorkflowSession },
  },
  comparison: {
    slots: {
      A: {
        label: ctx.comparisonSlots.A.label,
        profile: ctx.comparisonSlots.A.profile,
      },
      B: {
        label: ctx.comparisonSlots.B.label,
        profile: ctx.comparisonSlots.B.profile,
      },
    },
  },
  workspace: { ...ctx.workspace },
  graphContext: buildGraphContext(ctx),
});

export {
  collectProjectSnapshotV2,
  prepareSessionDatasetsForCollect,
} from "@/lib/project/collect-project-snapshot-v2";

export type {
  EditorProjectCollectContextV2,
  GraphEditorProjectSnapshotV2,
} from "@/lib/project/editor-collect-context-v2";

export { applyHydrateProjectV2Patch, buildHydrateProjectV2Patch };

export type {
  EditorProjectApplyContextV2,
  HydrateProjectV2Patch,
};

export const applyHydrateProjectPatch = (
  patch: HydrateProjectV2Patch,
  apply: EditorProjectApplyContext
) => applyHydrateProjectV2Patch(patch, apply);
