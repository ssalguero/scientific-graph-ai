import type { ExperimentalSeries } from "@/lib/experimentalData";
import type { ImportBuildRequest, ImportBuildResult } from "../types";
import { buildImportPreview, validateImportPreview } from "../validate";
import { buildImportReport } from "../report";

export const buildExperimentalSeriesFromImport = (
  request: ImportBuildRequest
): ImportBuildResult => {
  const preview = buildImportPreview(request.matrix, request.region, {
    mapping: request.mapping,
    columnDescriptors: request.columnDescriptors,
  });
  const validation = validateImportPreview(
    preview,
    request.columnDescriptors,
    request.mapping
  );

  const baseName =
    request.seriesName?.trim() ||
    `${request.sheetName}`.trim() ||
    request.fileName.replace(/\.[^/.]+$/, "").trim();

  const series: ExperimentalSeries[] = validation.ok
    ? [
        {
          id: `${request.sourceId}-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 9)}`,
          name: baseName,
          points: preview.points.map((point) => ({ x: point.x, y: point.y })),
          color: "",
        },
      ]
    : [];

  const report = buildImportReport({
    fileName: request.fileName,
    sheetName: request.sheetName,
    mode: request.mode,
    mapping: request.mapping,
    preview,
    validation,
    unimportedSheetCount: Math.max(0, (request.totalSheetCount ?? 1) - 1),
    columnDescriptors: request.columnDescriptors,
  });

  return { series, report, preview, validation };
};

export const buildWizardImportResult = (
  request: ImportBuildRequest & { totalSheetCount: number }
): ImportBuildResult =>
  buildExperimentalSeriesFromImport({
    ...request,
    totalSheetCount: request.totalSheetCount,
  });
