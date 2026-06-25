import type {
  WorksheetColumnMetadata,
  WorksheetColumnRegistry,
  WorksheetModel,
  WorksheetTransformKind,
} from "./experimentalWorksheet";
import { WORKSHEET_TRANSFORM_MENU_LABELS } from "./experimentalWorksheet";

export type WorksheetColumnLineageType = "original" | "transform" | "formula";

export type WorksheetColumnLineageBadge =
  | "ORIGINAL"
  | "TRANSFORMADA"
  | "FÓRMULA";

export type WorksheetColumnLineageDependency = {
  seriesId: string;
  label: string;
};

export type WorksheetColumnLineageCreatedAt = {
  date: string;
  time: string;
};

export type WorksheetColumnLineage = {
  label: string;
  type: WorksheetColumnLineageType;
  typeLabel: string;
  badge: WorksheetColumnLineageBadge;
  createdAt: string | null;
  createdAtFormatted: WorksheetColumnLineageCreatedAt | null;
  expression: string | null;
  sourceSeriesIds: string[];
  sourceLabels: string[];
  transformKind: WorksheetTransformKind | null;
  transformLabel: string | null;
  dependencies: WorksheetColumnLineageDependency[];
  dependencyTree: string;
};

const TYPE_LABELS: Record<WorksheetColumnLineageType, string> = {
  original: "Original",
  transform: "Transformación",
  formula: "Fórmula",
};

const TYPE_BADGES: Record<WorksheetColumnLineageType, WorksheetColumnLineageBadge> =
  {
    original: "ORIGINAL",
    transform: "TRANSFORMADA",
    formula: "FÓRMULA",
  };

const PRESET_TRANSFORM_KINDS = new Set<string>(
  Object.keys(WORKSHEET_TRANSFORM_MENU_LABELS)
);

export function formatWorksheetLineageCreatedAt(
  createdAt: string | null | undefined,
  locale = "es-ES"
): WorksheetColumnLineageCreatedAt | null {
  if (!createdAt) return null;

  const parsed = new Date(createdAt);
  if (Number.isNaN(parsed.getTime())) return null;

  return {
    date: parsed.toLocaleDateString(locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }),
    time: parsed.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export function resolveWorksheetLineageDependencies(
  model: WorksheetModel,
  sourceSeriesIds: string[]
): WorksheetColumnLineageDependency[] {
  const labelById = new Map(
    model.columns.map((column) => [column.seriesId, column.label])
  );

  return sourceSeriesIds.map((seriesId) => ({
    seriesId,
    label: labelById.get(seriesId) ?? seriesId,
  }));
}

export function buildWorksheetDependencyTree(
  columnLabel: string,
  dependencies: WorksheetColumnLineageDependency[]
): string {
  if (dependencies.length === 0) {
    return columnLabel;
  }

  const lines = [columnLabel, ""];
  dependencies.forEach((dependency, index) => {
    const branch = index === dependencies.length - 1 ? "└── " : "├── ";
    lines.push(`${branch}${dependency.label}`);
  });

  return lines.join("\n");
}

function formatTransformParam(value: number): string {
  if (Number.isInteger(value)) {
    return String(value);
  }
  return String(value).replace(/\.?0+$/, "");
}

export function getWorksheetTransformLineageLabel(
  kind: WorksheetTransformKind,
  params?: Record<string, number>
): string | null {
  if (kind === "formula") return null;

  if (kind === "scale") {
    const factor = params?.factor;
    return factor !== undefined
      ? `Escalar ×${formatTransformParam(factor)}`
      : WORKSHEET_TRANSFORM_MENU_LABELS.scale;
  }

  if (kind === "power") {
    const exponent = params?.exponent;
    return exponent !== undefined
      ? `Potencia ^${formatTransformParam(exponent)}`
      : WORKSHEET_TRANSFORM_MENU_LABELS.power;
  }

  if (PRESET_TRANSFORM_KINDS.has(kind)) {
    return WORKSHEET_TRANSFORM_MENU_LABELS[
      kind as keyof typeof WORKSHEET_TRANSFORM_MENU_LABELS
    ];
  }

  return null;
}

function collectSourceSeriesIds(
  transform: NonNullable<WorksheetColumnMetadata["transforms"][number]>
): string[] {
  const ids: string[] = [];

  if (transform.sourceSeriesIds?.length) {
    for (const seriesId of transform.sourceSeriesIds) {
      if (!ids.includes(seriesId)) {
        ids.push(seriesId);
      }
    }
  }

  if (
    transform.sourceSeriesId &&
    !ids.includes(transform.sourceSeriesId)
  ) {
    ids.push(transform.sourceSeriesId);
  }

  return ids;
}

function resolveLineageType(
  transform: NonNullable<WorksheetColumnMetadata["transforms"][number]> | null
): WorksheetColumnLineageType {
  if (!transform) return "original";
  if (transform.kind === "formula") return "formula";
  return "transform";
}

export function isTransformDerivedColumn(
  metadata: WorksheetColumnMetadata | undefined
): boolean {
  return (
    metadata?.transforms.some(
      (transform) => transform.enabled && transform.kind !== "formula"
    ) ?? false
  );
}

export function isFormulaDerivedColumnFromMetadata(
  metadata: WorksheetColumnMetadata | undefined
): boolean {
  return (
    metadata?.transforms.some(
      (transform) => transform.enabled && transform.kind === "formula"
    ) ?? false
  );
}

export function getWorksheetColumnLineage(
  model: WorksheetModel,
  registry: WorksheetColumnRegistry,
  seriesId: string
): WorksheetColumnLineage | null {
  const column = model.columns.find((item) => item.seriesId === seriesId);
  if (!column) {
    return null;
  }

  const metadata = registry[seriesId];
  const activeTransform =
    metadata?.transforms.find((transform) => transform.enabled) ?? null;
  const type = resolveLineageType(activeTransform);
  const sourceSeriesIds = activeTransform
    ? collectSourceSeriesIds(activeTransform)
    : [];
  const dependencies = resolveWorksheetLineageDependencies(
    model,
    sourceSeriesIds
  );

  return {
    label: column.label,
    type,
    typeLabel: TYPE_LABELS[type],
    badge: TYPE_BADGES[type],
    createdAt: activeTransform?.createdAt ?? null,
    createdAtFormatted: formatWorksheetLineageCreatedAt(
      activeTransform?.createdAt
    ),
    expression:
      type === "formula" ? activeTransform?.expression?.trim() || null : null,
    sourceSeriesIds,
    sourceLabels: dependencies.map((dependency) => dependency.label),
    transformKind: activeTransform?.kind ?? null,
    transformLabel:
      type === "transform" && activeTransform
        ? getWorksheetTransformLineageLabel(
            activeTransform.kind,
            activeTransform.params
          )
        : null,
    dependencies,
    dependencyTree: buildWorksheetDependencyTree(column.label, dependencies),
  };
}
