/**
 * PROD-2E D36.2 — epic umbrella governance cases (CONSOLIDATION-2E).
 *
 * Epic governor only — does NOT re-assert domain/product behavior certified
 * in D29–D35 (rendering, interaction, axes, series, curves, page wiring).
 */
import {
  createCaseRecorder,
  fileExists,
  readRepoFile,
  type CaseResult,
} from "./methodology-gate-utils";

export type Prod2eApiFreezeEntry = {
  phase: string;
  codename: string;
  modulePath: string;
  barrelPath?: string;
  umbrellaGate: string;
  unitGate?: string;
  policy: "ssot-file" | "frozen-barrel";
};

/** Master API Freeze registry — D29–D35 (read-only metadata; barrels unchanged). */
export const PROD2E_API_FREEZE_REGISTRY: Prod2eApiFreezeEntry[] = [
  {
    phase: "D29",
    codename: "GRAPH-1a viewport SSOT",
    modulePath: "src/lib/graph/viewport.ts",
    umbrellaGate: "validate:prod2e-d29-viewport-gate",
    unitGate: "validate:chart-viewport-y",
    policy: "ssot-file",
  },
  {
    phase: "D30",
    codename: "GRAPH-1b publication-presets",
    modulePath: "src/lib/graph/publication-presets",
    barrelPath: "src/lib/graph/publication-presets/index.ts",
    umbrellaGate: "validate:prod2e-d30-publication-presets-gate",
    unitGate: "validate:graph-publication-presets-unit",
    policy: "frozen-barrel",
  },
  {
    phase: "D31",
    codename: "GRAPH-2a curves",
    modulePath: "src/lib/graph/curves",
    barrelPath: "src/lib/graph/curves/index.ts",
    umbrellaGate: "validate:prod2e-d31-curves-gate",
    unitGate: "validate:graph-curves-unit",
    policy: "frozen-barrel",
  },
  {
    phase: "D32",
    codename: "GRAPH-2b series",
    modulePath: "src/lib/graph/series",
    barrelPath: "src/lib/graph/series/index.ts",
    umbrellaGate: "validate:prod2e-d32-series-gate",
    unitGate: "validate:graph-series-unit",
    policy: "frozen-barrel",
  },
  {
    phase: "D33",
    codename: "GRAPH-2c axes",
    modulePath: "src/lib/graph/axes",
    barrelPath: "src/lib/graph/axes/index.ts",
    umbrellaGate: "validate:prod2e-d33-axes-gate",
    unitGate: "validate:graph-axes-unit",
    policy: "frozen-barrel",
  },
  {
    phase: "D34",
    codename: "GRAPH-2d chart-interaction",
    modulePath: "src/components/graph/chart-interaction",
    barrelPath: "src/components/graph/chart-interaction/index.ts",
    umbrellaGate: "validate:prod2e-d34-interaction-gate",
    unitGate: "validate:graph-interaction-unit",
    policy: "frozen-barrel",
  },
  {
    phase: "D35",
    codename: "GRAPH-2e chart-rendering",
    modulePath: "src/components/graph/chart-rendering",
    barrelPath: "src/components/graph/chart-rendering/index.ts",
    umbrellaGate: "validate:prod2e-d35-rendering-gate",
    unitGate: "validate:graph-rendering-unit",
    policy: "frozen-barrel",
  },
];

const EXPECTED_REGISTRY_PHASES = [
  "D29",
  "D30",
  "D31",
  "D32",
  "D33",
  "D34",
  "D35",
] as const;

const CERTIFIED_MODULE_FILES: Record<string, string[]> = {
  D29: ["src/lib/graph/viewport.ts"],
  D30: [
    "src/lib/graph/publication-presets/index.ts",
    "src/lib/graph/publication-presets/catalog.ts",
  ],
  D31: [
    "src/lib/graph/curves/index.ts",
    "src/lib/graph/curves/expression.ts",
    "src/lib/graph/curves/sampling.ts",
  ],
  D32: [
    "src/lib/graph/series/index.ts",
    "src/lib/graph/series/builders.ts",
  ],
  D33: [
    "src/lib/graph/axes/index.ts",
    "src/lib/graph/axes/scales.ts",
  ],
  D34: [
    "src/components/graph/chart-interaction/index.ts",
    "src/components/graph/chart-interaction/useChartViewportInteraction.ts",
    "src/components/graph/chart-interaction/ChartInteractionSurface.tsx",
  ],
  D35: [
    "src/components/graph/chart-rendering/index.ts",
    "src/components/graph/chart-rendering/MainComposedChart.tsx",
    "src/components/graph/chart-rendering/MainChartLegend.tsx",
  ],
};

const UMBRELLA_SIBLING_SCRIPTS = [
  "scripts/validate-prod2e-d35-rendering-gate.ts",
  "scripts/validate-prod2e-data3b-gate.ts",
  "scripts/validate-visual-graph-builder-unit.ts",
] as const;

const UMBRELLA_SIBLING_NPM = [
  "validate:prod2e-d35-rendering-gate",
  "validate:prod2e-data3b-gate",
  "validate:visual-graph-builder-unit",
] as const;

export function runProd2eEpicGovernanceCaseSuite(
  repoRoot: string = process.cwd()
): CaseResult[] {
  const { results, assertCase } = createCaseRecorder();
  const statusSource = fileExists(repoRoot, "PROJECT_STATUS_PROD_2E.md")
    ? readRepoFile(repoRoot, "PROJECT_STATUS_PROD_2E.md")
    : "";
  const packageSource = fileExists(repoRoot, "package.json")
    ? readRepoFile(repoRoot, "package.json")
    : "";
  const governorSource = fileExists(
    repoRoot,
    "scripts/validate-prod2e-gate.ts"
  )
    ? readRepoFile(repoRoot, "scripts/validate-prod2e-gate.ts")
    : "";

  assertCase(
    "epic.registry.freeze.complete",
    PROD2E_API_FREEZE_REGISTRY.length === EXPECTED_REGISTRY_PHASES.length,
    `entries=${PROD2E_API_FREEZE_REGISTRY.length}`
  );

  for (const expectedPhase of EXPECTED_REGISTRY_PHASES) {
    const entry = PROD2E_API_FREEZE_REGISTRY.find(
      (item) => item.phase === expectedPhase
    );
    assertCase(
      `epic.registry.freeze.phase.${expectedPhase}`,
      entry !== undefined,
      expectedPhase
    );
    if (!entry) continue;

    assertCase(
      `epic.module.${expectedPhase}.path.exists`,
      fileExists(repoRoot, entry.modulePath),
      entry.modulePath
    );

    if (entry.barrelPath) {
      assertCase(
        `epic.module.${expectedPhase}.barrel.exists`,
        fileExists(repoRoot, entry.barrelPath),
        entry.barrelPath
      );
    }

    for (const relPath of CERTIFIED_MODULE_FILES[expectedPhase] ?? []) {
      assertCase(
        `epic.structure.${expectedPhase}.${relPath.split("/").pop()}`,
        fileExists(repoRoot, relPath),
        relPath
      );
    }
  }

  assertCase(
    "epic.docs.discovery.D36.1",
    fileExists(repoRoot, "docs/D36.1-discovery-inventory.md"),
    "docs/D36.1-discovery-inventory.md"
  );

  assertCase(
    "epic.docs.status.exists",
    fileExists(repoRoot, "PROJECT_STATUS_PROD_2E.md"),
    "PROJECT_STATUS_PROD_2E.md"
  );

  assertCase(
    "epic.docs.status.D35.closed",
    statusSource.includes("D35 CLOSED"),
    "D35 CLOSED"
  );

  assertCase(
    "epic.docs.status.handoff.D36",
    statusSource.includes("Handoff D36"),
    "Handoff D36"
  );

  assertCase(
    "epic.docs.status.cronology.D25-D35",
    statusSource.includes("D35.6 Acta + GRAPH-2e CLOSED"),
    "cronology D35"
  );

  for (const scriptPath of UMBRELLA_SIBLING_SCRIPTS) {
    assertCase(
      `epic.umbrella.sibling.script.${scriptPath.split("/").pop()?.replace(".ts", "")}`,
      fileExists(repoRoot, scriptPath),
      scriptPath
    );
  }

  assertCase(
    "epic.umbrella.package.script-registered",
    packageSource.includes('"validate:prod2e-gate"'),
    "validate:prod2e-gate"
  );

  for (const npmScript of UMBRELLA_SIBLING_NPM) {
    assertCase(
      `epic.umbrella.package.sibling.${npmScript.replace("validate:", "")}`,
      packageSource.includes(`"${npmScript}"`),
      npmScript
    );
  }

  const prod2eGateScript = (() => {
    const match = packageSource.match(
      /"validate:prod2e-gate"\s*:\s*"([^"]+)"/
    );
    return match?.[1] ?? "";
  })();

  assertCase(
    "epic.umbrella.package.tsc-sibling",
    prod2eGateScript.includes("npx tsc --noEmit") &&
      prod2eGateScript.includes("validate:prod2e-d35-rendering-gate") &&
      prod2eGateScript.includes("validate:prod2e-data3b-gate") &&
      prod2eGateScript.includes("validate:visual-graph-builder-unit"),
    prod2eGateScript || "missing validate:prod2e-gate script"
  );

  assertCase(
    "epic.umbrella.package.no-perf-in-chain",
    !/measure-prod2e-baseline-perf/.test(prod2eGateScript),
    "perf excluded from umbrella"
  );

  assertCase(
    "epic.governor.no-execSync-nested",
    !/execSync/.test(governorSource),
    "anti-nest governor"
  );

  assertCase(
    "epic.governor.no-page-product-asserts",
    !/<MainComposedChart/.test(governorSource) &&
      !/<ComposedChart\b/.test(governorSource),
    "delegates product asserts to D35"
  );

  assertCase(
    "epic.governor.cases.registry-import",
    readRepoFile(repoRoot, "scripts/lib/prod2e-gate.cases.ts").includes(
      "PROD2E_API_FREEZE_REGISTRY"
    ),
    "consolidated registry"
  );

  return results;
}
