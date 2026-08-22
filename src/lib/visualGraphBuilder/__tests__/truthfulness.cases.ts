import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  collectBarYAxisValues,
  computeBoxPlotGeometry,
  GraphPreview,
} from "@/components/graph-builder/GraphPreview";
import {
  DEFAULT_COLUMN_METADATA,
  seriesToWorksheet,
} from "@/lib/experimentalWorksheet";
import {
  buildVisualGraphPreview,
  DEFAULT_VISUAL_GRAPH_SPECIFICATION,
  VISUAL_GRAPH_TYPE_LABELS,
  type VisualGraphErrorBars,
  type VisualGraphPreview,
} from "@/lib/visualGraphBuilder";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

const approximatelyEqual = (left: number, right: number) =>
  Math.abs(left - right) < 1e-12;

const valuesModel = seriesToWorksheet([
  {
    id: "values",
    name: "Values",
    color: "#3b82f6",
    points: [
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
    ],
  },
]);

const registry = { values: DEFAULT_COLUMN_METADATA };

const buildBarPreview = (errorBars: VisualGraphErrorBars) =>
  buildVisualGraphPreview(
    {
      ...DEFAULT_VISUAL_GRAPH_SPECIFICATION,
      graphType: "bar",
      yVariable: "values",
      errorBars,
    },
    valuesModel,
    registry
  );

const rawExtremaModel = seriesToWorksheet([
  {
    id: "values",
    name: "Values",
    color: "#3b82f6",
    points: [
      { x: 1, y: 0 },
      { x: 2, y: 1 },
      { x: 3, y: 2 },
      { x: 4, y: 3 },
      { x: 5, y: 100 },
    ],
  },
]);

const buildDistributionPreview = (graphType: "boxPlot" | "violin") =>
  buildVisualGraphPreview(
    {
      ...DEFAULT_VISUAL_GRAPH_SPECIFICATION,
      graphType,
      yVariable: "values",
    },
    rawExtremaModel,
    registry
  );

const isPreview = (
  result: VisualGraphPreview | { error: string }
): result is VisualGraphPreview => !("error" in result);

export const runTruthfulnessCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  const expectedMargins: Array<[VisualGraphErrorBars, number]> = [
    ["sd", 1],
    ["sem", 1 / Math.sqrt(3)],
    ["ci95", 1.96 / Math.sqrt(3)],
  ];

  for (const [mode, expectedMargin] of expectedMargins) {
    const preview = buildBarPreview(mode);
    const error = isPreview(preview) ? preview.barData[0]?.error : undefined;
    assertCase(
      `truthfulness.error-data.${mode}`,
      error !== undefined && approximatelyEqual(error, expectedMargin)
    );
  }

  const sdPreview = buildBarPreview("sd");
  const sdBarData = isPreview(sdPreview) ? sdPreview.barData : [];
  const domainValues = collectBarYAxisValues(sdBarData);
  assertCase(
    "truthfulness.error-data.domain-includes-uncertainty",
    domainValues.length === 2 &&
      approximatelyEqual(domainValues[0] ?? Number.NaN, 1) &&
      approximatelyEqual(domainValues[1] ?? Number.NaN, 3)
  );

  const graphPreviewSource = fs.readFileSync(
    path.join(
      process.cwd(),
      "src",
      "components",
      "graph-builder",
      "GraphPreview.tsx"
    ),
    "utf8"
  );
  assertCase(
    "truthfulness.error-data.recharts-observable",
    graphPreviewSource.includes("<ErrorBar") &&
      graphPreviewSource.includes('dataKey="error"') &&
      graphPreviewSource.includes("collectBarYAxisValues(preview.barData)")
  );

  const geometry = computeBoxPlotGeometry(
    {
      group: "A",
      min: 0,
      q1: 25,
      median: 50,
      q3: 75,
      max: 100,
    },
    [0, 100]
  );
  assertCase(
    "truthfulness.box.geometry-uses-five-number-summary",
    approximatelyEqual(geometry.min, 4) &&
      approximatelyEqual(geometry.q1, 27) &&
      approximatelyEqual(geometry.median, 50) &&
      approximatelyEqual(geometry.q3, 73) &&
      approximatelyEqual(geometry.max, 96)
  );

  const boxPreview = buildDistributionPreview("boxPlot");
  assertCase(
    "truthfulness.box.preserves-raw-extrema",
    isPreview(boxPreview) &&
      boxPreview.boxPlotData[0]?.min === 0 &&
      boxPreview.boxPlotData[0]?.max === 100
  );

  assertCase(
    "truthfulness.violin.truthful-label",
    VISUAL_GRAPH_TYPE_LABELS.violin === "Raw-value Strip" &&
      !VISUAL_GRAPH_TYPE_LABELS.violin.toLowerCase().includes("violin")
  );

  const rawValuePreview = buildDistributionPreview("violin");
  const markup = isPreview(rawValuePreview)
    ? renderToStaticMarkup(createElement(GraphPreview, { preview: rawValuePreview }))
    : "";
  assertCase(
    "truthfulness.violin.visible-raw-value-copy",
    markup.includes("Raw-value Strip") &&
      markup.includes("Raw values · no density estimate")
  );

  return results;
};
