import type { ExperimentalSeries } from "@/lib/experimentalData";
import type { ImportAuxiliaryColumn } from "@/lib/import/types";
import type {
  WorksheetColumnMetadata,
  WorksheetColumnTransform,
} from "@/lib/experimentalWorksheet";

import { isBoolean, isNumber, isRecord, isString } from "./guards";
import type { ProjectWorksheetV2 } from "./types-v2";

export const WORKSHEET_COLUMN_TYPES = [
  "numeric",
  "text",
  "category",
  "date",
] as const;

export const WORKSHEET_TRANSFORM_KINDS = [
  "log",
  "power",
  "scale",
  "normalize",
  "zscore",
  "formula",
] as const;

export const AUXILIARY_COLUMN_ROLES = ["replicate", "group", "condition"] as const;

export type WorksheetColumnType = (typeof WORKSHEET_COLUMN_TYPES)[number];
export type WorksheetTransformKind = (typeof WORKSHEET_TRANSFORM_KINDS)[number];
export type AuxiliaryColumnRole = (typeof AUXILIARY_COLUMN_ROLES)[number];

export type WorksheetSanitizeContext = {
  seriesIds: Set<string>;
  auxiliaryIds: Set<string>;
};

export type WorksheetSanitizeWarning = {
  code: string;
  path: string;
  message: string;
};

export type WorksheetSanitizeWarningHandler = (
  warning: WorksheetSanitizeWarning
) => void;

export const isWorksheetColumnType = (value: unknown): value is WorksheetColumnType =>
  isString(value) &&
  WORKSHEET_COLUMN_TYPES.includes(value as WorksheetColumnType);

export const isWorksheetTransformKind = (
  value: unknown
): value is WorksheetTransformKind =>
  isString(value) &&
  WORKSHEET_TRANSFORM_KINDS.includes(value as WorksheetTransformKind);

export const isAuxiliaryColumnRole = (value: unknown): value is AuxiliaryColumnRole =>
  isString(value) &&
  AUXILIARY_COLUMN_ROLES.includes(value as AuxiliaryColumnRole);

const cloneTransform = (
  transform: WorksheetColumnTransform
): WorksheetColumnTransform => ({
  ...transform,
  params: transform.params ? { ...transform.params } : undefined,
  sourceSeriesIds: transform.sourceSeriesIds
    ? [...transform.sourceSeriesIds]
    : undefined,
});

const cloneColumnMetadata = (
  metadata: WorksheetColumnMetadata
): WorksheetColumnMetadata => ({
  columnType: metadata.columnType,
  transforms: metadata.transforms.map(cloneTransform),
});

const cloneAuxiliaryColumn = (
  column: ImportAuxiliaryColumn
): ImportAuxiliaryColumn => ({
  ...column,
  valuesByRowIndex: { ...column.valuesByRowIndex },
});

export const buildWorksheetSanitizeContext = (
  series: ExperimentalSeries[],
  auxiliaryColumns?: ImportAuxiliaryColumn[]
): WorksheetSanitizeContext => {
  const seriesIds = new Set(series.map((item) => item.id));
  const auxiliaryIds = new Set<string>();

  for (const column of auxiliaryColumns ?? []) {
    if (isString(column.id) && column.id.trim() !== "") {
      auxiliaryIds.add(column.id);
    }
  }

  return { seriesIds, auxiliaryIds };
};

export const isWorksheetPayloadEmpty = (
  worksheet: ProjectWorksheetV2 | undefined
): boolean => {
  if (worksheet === undefined) {
    return true;
  }

  if (worksheet.modified) {
    return false;
  }

  const hasRegistry =
    worksheet.columnRegistry !== undefined &&
    Object.keys(worksheet.columnRegistry).length > 0;
  const hasAuxiliary =
    worksheet.auxiliaryColumns !== undefined &&
    worksheet.auxiliaryColumns.length > 0;

  return !hasRegistry && !hasAuxiliary;
};

export const cloneProjectWorksheetV2 = (
  worksheet: ProjectWorksheetV2
): ProjectWorksheetV2 => ({
  modified: worksheet.modified,
  columnRegistry: worksheet.columnRegistry
    ? Object.fromEntries(
        Object.entries(worksheet.columnRegistry).map(([key, metadata]) => [
          key,
          cloneColumnMetadata(metadata),
        ])
      )
    : undefined,
  auxiliaryColumns: worksheet.auxiliaryColumns
    ? worksheet.auxiliaryColumns.map(cloneAuxiliaryColumn)
    : undefined,
});

const isValidTransformShape = (transform: unknown): transform is WorksheetColumnTransform =>
  isRecord(transform) &&
  isWorksheetTransformKind(transform.kind) &&
  isBoolean(transform.enabled);

const sanitizeTransform = (
  transform: WorksheetColumnTransform,
  seriesIds: Set<string>,
  path: string,
  pushWarning: WorksheetSanitizeWarningHandler
): WorksheetColumnTransform | null => {
  if (!isValidTransformShape(transform)) {
    pushWarning({
      code: "H-WS-ORPHAN",
      path,
      message: "Invalid transform removed",
    });
    return null;
  }

  let sourceSeriesId = transform.sourceSeriesId;
  if (
    sourceSeriesId !== undefined &&
    (!isString(sourceSeriesId) || !seriesIds.has(sourceSeriesId))
  ) {
    pushWarning({
      code: "H-WS-ORPHAN",
      path: `${path}.sourceSeriesId`,
      message: `Orphan sourceSeriesId "${sourceSeriesId}" cleared`,
    });
    sourceSeriesId = undefined;
  }

  let sourceSeriesIds = transform.sourceSeriesIds;
  if (sourceSeriesIds !== undefined) {
    if (!Array.isArray(sourceSeriesIds)) {
      pushWarning({
        code: "H-WS-ORPHAN",
        path: `${path}.sourceSeriesIds`,
        message: "Invalid sourceSeriesIds cleared",
      });
      sourceSeriesIds = undefined;
    } else {
      const kept = sourceSeriesIds.filter((id) => {
        if (!isString(id) || !seriesIds.has(id)) {
          pushWarning({
            code: "H-WS-ORPHAN",
            path: `${path}.sourceSeriesIds`,
            message: `Orphan sourceSeriesId "${id}" removed`,
          });
          return false;
        }
        return true;
      });
      sourceSeriesIds = kept.length > 0 ? kept : undefined;
    }
  }

  let params = transform.params;
  if (params !== undefined) {
    if (!isRecord(params)) {
      params = undefined;
    } else {
      const nextParams: Record<string, number> = {};
      for (const [key, value] of Object.entries(params)) {
        if (isNumber(value)) {
          nextParams[key] = value;
        }
      }
      params = Object.keys(nextParams).length > 0 ? nextParams : undefined;
    }
  }

  return {
    kind: transform.kind,
    enabled: transform.enabled,
    params,
    sourceSeriesId,
    expression: isString(transform.expression) ? transform.expression : undefined,
    createdAt: isString(transform.createdAt) ? transform.createdAt : undefined,
    sourceSeriesIds,
  };
};

const sanitizeColumnRegistry = (
  columnRegistry: ProjectWorksheetV2["columnRegistry"],
  ctx: WorksheetSanitizeContext,
  pathPrefix: string,
  pushWarning: WorksheetSanitizeWarningHandler
): ProjectWorksheetV2["columnRegistry"] => {
  if (columnRegistry === undefined) {
    return undefined;
  }

  const validColumnIds = new Set([...ctx.seriesIds, ...ctx.auxiliaryIds]);
  const next: NonNullable<ProjectWorksheetV2["columnRegistry"]> = {};

  for (const [key, metadata] of Object.entries(columnRegistry)) {
    if (!isString(key) || key.trim() === "" || !validColumnIds.has(key)) {
      pushWarning({
        code: "H-WS-ORPHAN",
        path: `${pathPrefix}.columnRegistry[${key}]`,
        message: `Orphan columnRegistry key "${key}" removed`,
      });
      continue;
    }

    if (!isRecord(metadata) || !Array.isArray(metadata.transforms)) {
      pushWarning({
        code: "H-WS-ORPHAN",
        path: `${pathPrefix}.columnRegistry[${key}]`,
        message: "Invalid column metadata removed",
      });
      continue;
    }

    const columnType = isWorksheetColumnType(metadata.columnType)
      ? metadata.columnType
      : "numeric";

    if (!isWorksheetColumnType(metadata.columnType)) {
      pushWarning({
        code: "H-WS-ORPHAN",
        path: `${pathPrefix}.columnRegistry[${key}].columnType`,
        message: `Invalid columnType "${String(metadata.columnType)}" defaulted to numeric`,
      });
    }

    const transforms: WorksheetColumnTransform[] = [];
    metadata.transforms.forEach((transform, index) => {
      const sanitized = sanitizeTransform(
        transform as WorksheetColumnTransform,
        ctx.seriesIds,
        `${pathPrefix}.columnRegistry[${key}].transforms[${index}]`,
        pushWarning
      );
      if (sanitized) {
        transforms.push(sanitized);
      }
    });

    next[key] = {
      columnType,
      transforms,
    };
  }

  return Object.keys(next).length > 0 ? next : undefined;
};

const sanitizeAuxiliaryColumns = (
  auxiliaryColumns: ProjectWorksheetV2["auxiliaryColumns"],
  pathPrefix: string,
  pushWarning: WorksheetSanitizeWarningHandler
): ProjectWorksheetV2["auxiliaryColumns"] => {
  if (auxiliaryColumns === undefined) {
    return undefined;
  }

  const seenIds = new Set<string>();
  const kept: ImportAuxiliaryColumn[] = [];

  auxiliaryColumns.forEach((column, index) => {
    const path = `${pathPrefix}.auxiliaryColumns[${index}]`;

    if (!isRecord(column)) {
      pushWarning({
        code: "H-WS-ORPHAN",
        path,
        message: "Invalid auxiliary column removed",
      });
      return;
    }

    if (!isString(column.id) || column.id.trim() === "") {
      pushWarning({
        code: "H-WS-ORPHAN",
        path: `${path}.id`,
        message: "Auxiliary column with empty id removed",
      });
      return;
    }

    if (seenIds.has(column.id)) {
      pushWarning({
        code: "H-WS-ORPHAN",
        path: `${path}.id`,
        message: `Duplicate auxiliary column id "${column.id}" removed`,
      });
      return;
    }

    if (!isString(column.label)) {
      pushWarning({
        code: "H-WS-ORPHAN",
        path: `${path}.label`,
        message: `Auxiliary column "${column.id}" missing label — removed`,
      });
      return;
    }

    const role = isAuxiliaryColumnRole(column.role) ? column.role : "group";
    if (!isAuxiliaryColumnRole(column.role)) {
      pushWarning({
        code: "H-WS-ORPHAN",
        path: `${path}.role`,
        message: `Invalid auxiliary role "${String(column.role)}" defaulted to group`,
      });
    }

    const valuesByRowIndex: Record<number, string> = {};
    if (isRecord(column.valuesByRowIndex)) {
      for (const [rowKey, value] of Object.entries(column.valuesByRowIndex)) {
        const rowIndex = Number(rowKey);
        if (Number.isInteger(rowIndex) && isString(value)) {
          valuesByRowIndex[rowIndex] = value;
        }
      }
    } else {
      pushWarning({
        code: "H-WS-ORPHAN",
        path: `${path}.valuesByRowIndex`,
        message: "Invalid valuesByRowIndex reset to empty",
      });
    }

    seenIds.add(column.id);
    kept.push({
      id: column.id,
      label: column.label,
      role,
      valuesByRowIndex,
    });
  });

  return kept.length > 0 ? kept : undefined;
};

export const sanitizeProjectWorksheetV2 = (
  worksheet: ProjectWorksheetV2 | undefined,
  ctx: WorksheetSanitizeContext,
  pathPrefix: string,
  pushWarning: WorksheetSanitizeWarningHandler
): ProjectWorksheetV2 | undefined => {
  if (worksheet === undefined) {
    return undefined;
  }

  const sanitized: ProjectWorksheetV2 = {
    modified: worksheet.modified,
    columnRegistry: sanitizeColumnRegistry(
      worksheet.columnRegistry,
      ctx,
      pathPrefix,
      pushWarning
    ),
    auxiliaryColumns: sanitizeAuxiliaryColumns(
      worksheet.auxiliaryColumns,
      pathPrefix,
      pushWarning
    ),
  };

  return isWorksheetPayloadEmpty(sanitized) ? undefined : sanitized;
};
