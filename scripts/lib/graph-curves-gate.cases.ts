/**
 * GRAPH-2 curves gate extension cases (PROD-2E D31.3).
 *
 * Maintenance note (shim temporal):
 * El re-export de translateNaturalLanguageToMath desde page.tsx existe únicamente
 * por compatibilidad histórica durante GRAPH-2. Deberá revisarse su eliminación al
 * cierre de GRAPH-2 (D32), una vez verificado que no existan consumidores externos.
 */
import fs from "node:fs";
import path from "node:path";

import { CURVE_SAMPLE_STEP } from "@/lib/graph/curves/constants";
import { computeSymbolicIntegral } from "@/lib/graph/curves/symbolic";
import { resolveYAxisDomainFromMetrics } from "@/lib/graph/curves/metrics";
import { computeYMetrics } from "@/lib/graph/curves";
import { computeYAxisDomainFromValues } from "@/lib/graph/viewport";
import { formatMathWarning } from "@/lib/graph/curves/warnings";
import {
  assertBarrelApiFreeze,
  assertPageNoInlinePatterns,
  collectTsFilesUnder,
  createCaseRecorder,
  readRepoFile,
  type CaseResult,
} from "./methodology-gate-utils";

const REPO_ROOT = process.cwd();
const CURVES_MODULE_ROOT = path.join(REPO_ROOT, "src/lib/graph/curves");

const FROZEN_CURVES_BARREL_API: Record<string, string[]> = {
  "src/lib/graph/curves/index.ts": [
    "CriticalPoint",
    "CurveIntersection",
    "CurveRoot",
    "DiscardMetrics",
    "GraphJsonExport",
    "YMetrics",
    "calculateAreaUnderCurve",
    "calculateCriticalPoints",
    "calculateCurveIntersections",
    "calculateCurveRoots",
    "collectChartScaleSamples",
    "computeDiscardMetrics",
    "computeSymbolicDerivative",
    "computeSymbolicIntegral",
    "computeYMetrics",
    "countXSteps",
    "emptyDiscardMetrics",
    "evaluateExpression",
    "formatRangeWarning",
    "formatScaleWarning",
    "generateDerivativePoints",
    "generateIntegralPoints",
    "generateMathExpressionPoints",
    "mergeYMetricsWithExperimental",
    "normalizeImportedGraph",
    "resolveNaturalLanguageExpression",
    "resolveYAxisDomainFromMetrics",
    "toPlottableY",
  ],
};

const REQUIRED_CURVES_FILES = [
  "constants.ts",
  "types.ts",
  "expression.ts",
  "natural-language.ts",
  "sampling.ts",
  "symbolic.ts",
  "analysis.ts",
  "warnings.ts",
  "metrics.ts",
  "import.ts",
  "index.ts",
  "__tests__/curves.cases.ts",
];

const SHIM_MAINTENANCE_NOTE =
  "El re-export de translateNaturalLanguageToMath desde page.tsx existe únicamente por compatibilidad histórica durante GRAPH-2";

export const runGraphCurvesGateExtensionCaseSuite = (): CaseResult[] => {
  const { results, assertCase } = createCaseRecorder();

  for (const relFile of REQUIRED_CURVES_FILES) {
    assertCase(
      `governance.curvesDomain.${relFile.replace(/[./]/g, "_")}`,
      fs.existsSync(path.join(CURVES_MODULE_ROOT, relFile))
    );
  }

  assertBarrelApiFreeze(assertCase, REPO_ROOT, FROZEN_CURVES_BARREL_API);

  const curveSources = collectTsFilesUnder(CURVES_MODULE_ROOT).map((filePath) =>
    fs.readFileSync(filePath, "utf8")
  );

  assertCase(
    "governance.curves.noReact",
    curveSources.every(
      (source) =>
        !/from\s+["']react(?:\/|["'])/.test(source) &&
        !source.includes('"use client"')
    )
  );

  assertCase(
    "governance.curves.noRecharts",
    curveSources.every((source) => !/from\s+["']recharts/.test(source))
  );

  assertCase(
    "governance.curves.noAppImports",
    curveSources.every(
      (source) =>
        !/from\s+["']@\/app\//.test(source) &&
        !/from\s+["'].*src\/app\//.test(source)
    )
  );

  assertCase("governance.curvesSampleStepFrozen", CURVE_SAMPLE_STEP === 0.5);

  assertCase(
    "symbolic.integral.x",
    computeSymbolicIntegral("x") != null &&
      computeSymbolicIntegral("x")!.includes("x")
  );

  assertCase(
    "warnings.formatMathWarning.discarded",
    formatMathWarning(3)?.includes("omitieron") === true
  );

  assertCase("warnings.formatMathWarning.none", formatMathWarning(0) === null);

  const metricsDomain = resolveYAxisDomainFromMetrics(computeYMetrics([2, 8]));
  const viewportDomain = computeYAxisDomainFromValues([2, 8]);
  assertCase(
    "regression.viewport.y.metricsDelegate",
    metricsDomain != null &&
      viewportDomain != null &&
      metricsDomain[0] === viewportDomain[0] &&
      metricsDomain[1] === viewportDomain[1]
  );

  const pageSource = readRepoFile(REPO_ROOT, "src/app/page.tsx");
  assertPageNoInlinePatterns(assertCase, pageSource, [
    /const evaluateExpression\s*=/,
    /const normalizeImportedGraph\s*=/,
    /type GraphJsonExport\s*=/,
    /const calculateCurveIntersections\s*=/,
    /const computeSymbolicDerivative\s*=/,
  ]);

  assertCase(
    "governance.page.importsCurvesBarrel",
    pageSource.includes('from "@/lib/graph/curves"')
  );

  assertCase(
    "governance.page.shimReexport",
    pageSource.includes("export { translateNaturalLanguageToMath }")
  );

  const gateCasesSource = fs.readFileSync(
    path.join(REPO_ROOT, "scripts/lib/graph-curves-gate.cases.ts"),
    "utf8"
  );
  assertCase(
    "maintenance.shim.documented",
    gateCasesSource.includes(SHIM_MAINTENANCE_NOTE)
  );

  return results;
};
