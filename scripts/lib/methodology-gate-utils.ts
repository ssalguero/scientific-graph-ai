import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export type CaseResult = {
  id: string;
  pass: boolean;
  detail?: string;
};

export type AssertCase = (id: string, pass: boolean, detail?: string) => void;

export function createCaseRecorder(): {
  results: CaseResult[];
  assertCase: AssertCase;
} {
  const results: CaseResult[] = [];
  const assertCase: AssertCase = (id, pass, detail) => {
    results.push({ id, pass, detail });
  };
  return { results, assertCase };
}

export function getRepoRoot(importMetaUrl: string): string {
  return join(dirname(fileURLToPath(importMetaUrl)), "..");
}

export function approxEqual(
  actual: number,
  expected: number,
  epsilon = 0.05
): boolean {
  return Math.abs(actual - expected) <= epsilon;
}

export function extractBarrelExports(source: string): string[] {
  const exports: string[] = [];
  const typeExportBlocks = source.matchAll(/export\s+type\s*\{([^}]+)\}/g);
  for (const match of typeExportBlocks) {
    for (const item of match[1].split(",")) {
      const name = item.trim().split(/\s+as\s+/)[0].trim();
      if (name) exports.push(name);
    }
  }
  const valueExportBlocks = source.matchAll(/export\s*\{([^}]+)\}/g);
  for (const match of valueExportBlocks) {
    for (const item of match[1].split(",")) {
      const name = item.trim().split(/\s+as\s+/)[0].trim();
      if (name && !name.startsWith("type ")) exports.push(name);
    }
  }
  return exports.sort();
}

export function collectTsFilesUnder(dir: string): string[] {
  const files: string[] = [];
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) {
      files.push(...collectTsFilesUnder(abs));
    } else if (name.endsWith(".ts")) {
      files.push(abs);
    }
  }
  return files;
}

export function collectMethodologyTsFiles(repoRoot: string): string[] {
  return collectTsFilesUnder(
    join(repoRoot, "src/lib/scientific/methodology")
  );
}

export function readRepoFile(repoRoot: string, relPath: string): string {
  return readFileSync(join(repoRoot, relPath), "utf8");
}

/** Generic LOC counter — non-empty lines only (matches baseline D0.5 Measure-Object -Line). */
export function countFileLines(repoRoot: string, relPath: string): number {
  const source = readFileSync(join(repoRoot, relPath), "utf8");
  return source.split(/\r?\n/).filter((line) => line.trim() !== "").length;
}

export const METHODOLOGY_MODULE_NAMES = [
  "consistency",
  "report-quality",
  "reproducibility",
  "evidence",
  "assumptions",
  "readiness",
  "summary",
  "publication",
] as const;

export type KnownDebt = {
  id: string;
  severity: string;
  description: string;
};

export type ModularizationMetrics = {
  pageTsxLOC: number;
  methodologyModuleCount: number;
  workflowModuleCount: number;
  reportModuleCount: number;
  knownDebtCount: number;
};

const METRICS_KEYS: (keyof ModularizationMetrics)[] = [
  "pageTsxLOC",
  "methodologyModuleCount",
  "workflowModuleCount",
  "reportModuleCount",
  "knownDebtCount",
];

export function assertBaselineComparison(
  assertCase: AssertCase,
  metrics: ModularizationMetrics,
  baseline: Partial<Record<keyof ModularizationMetrics, number>>
): void {
  for (const [key, expected] of Object.entries(baseline) as [
    keyof ModularizationMetrics,
    number,
  ][]) {
    const actual = metrics[key];
    assertCase(
      `certification.baseline.compare.${key}`,
      actual !== undefined && actual <= expected,
      `actual=${actual}, baseline=${expected}`
    );
  }
}

export function assertKnownDebtRegistry(
  assertCase: AssertCase,
  debts: KnownDebt[]
): void {
  for (const debt of debts) {
    const valid =
      typeof debt.id === "string" &&
      debt.id.length > 0 &&
      typeof debt.severity === "string" &&
      debt.severity.length > 0 &&
      typeof debt.description === "string" &&
      debt.description.length > 0;
    assertCase(`certification.known-debts.entry.${debt.id}`, valid);
  }
}

export function assertMetricsSchemaValid(
  assertCase: AssertCase,
  metrics: Record<string, unknown>
): void {
  const keys = Object.keys(metrics).sort();
  const expected = [...METRICS_KEYS].sort();
  assertCase(
    "certification.metrics.schema-valid",
    keys.length === expected.length &&
      expected.every((key, index) => keys[index] === key),
    `keys=${keys.join(",")}`
  );
}

export function assertKnownDebtsSchemaValid(
  assertCase: AssertCase,
  debts: unknown[]
): void {
  const valid = debts.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as KnownDebt).id === "string" &&
      typeof (item as KnownDebt).severity === "string" &&
      typeof (item as KnownDebt).description === "string"
  );
  assertCase("certification.known-debts.schema-valid", valid);
}

export function countTsFilesInDir(repoRoot: string, relDir: string): number {
  const abs = join(repoRoot, relDir);
  if (!existsSync(abs)) return 0;
  const files: string[] = [];
  for (const name of readdirSync(abs)) {
    const fileAbs = join(abs, name);
    if (statSync(fileAbs).isDirectory()) {
      files.push(...collectSourceFilesUnder(fileAbs, [".ts", ".tsx"]));
    } else if (name.endsWith(".ts") || name.endsWith(".tsx")) {
      files.push(fileAbs);
    }
  }
  return files.length;
}

function collectSourceFilesUnder(
  dir: string,
  extensions: string[]
): string[] {
  const files: string[] = [];
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) {
      files.push(...collectSourceFilesUnder(abs, extensions));
    } else if (extensions.some((ext) => name.endsWith(ext))) {
      files.push(abs);
    }
  }
  return files;
}

export function fileExists(repoRoot: string, relPath: string): boolean {
  return existsSync(join(repoRoot, relPath));
}

export function assertBarrelApiFreeze(
  assertCase: AssertCase,
  repoRoot: string,
  allowedBarrelExports: Record<string, string[]>
): void {
  for (const [relPath, allowed] of Object.entries(allowedBarrelExports)) {
    const source = readRepoFile(repoRoot, relPath);
    const actual = extractBarrelExports(source);
    const allowedSorted = [...allowed].sort();
    const unexpected = actual.filter((name) => !allowedSorted.includes(name));
    const missing = allowedSorted.filter((name) => !actual.includes(name));
    assertCase(
      `structure.barrel.${relPath.split("/").slice(-2, -1)[0]}.exact-api`,
      unexpected.length === 0 && missing.length === 0,
      unexpected.length > 0
        ? `unexpected: ${unexpected.join(", ")}`
        : missing.length > 0
          ? `missing: ${missing.join(", ")}`
          : actual.join(", ")
    );
  }
}

export function assertPageNoInlinePatterns(
  assertCase: AssertCase,
  pageSource: string,
  patterns: RegExp[]
): void {
  for (const pattern of patterns) {
    assertCase(
      `structure.page.no-inline.${pattern.source}`,
      !pattern.test(pageSource),
      pattern.source
    );
  }
}

export function assertPageImportsBarrels(
  assertCase: AssertCase,
  pageSource: string,
  importPaths: { id: string; needle: string }[]
): void {
  for (const { id, needle } of importPaths) {
    assertCase(`structure.page.imports-${id}`, pageSource.includes(needle));
  }
}

/** F5A-compatible per-file checks — preserves legacy case IDs. */
export function assertMethodologyLegacyForbiddenImports(
  assertCase: AssertCase,
  repoRoot: string,
  methodologyFiles: string[]
): void {
  const forbiddenImportPatterns = [
    { id: "react", pattern: /from\s+["']react["']/ },
    { id: "page", pattern: /from\s+["']@\/app\/page/ },
    { id: "page-relative", pattern: /from\s+["'].*page\.tsx["']/ },
  ];

  for (const filePath of methodologyFiles) {
    const rel = filePath.replace(repoRoot + "\\", "").replace(repoRoot + "/", "");
    const source = readFileSync(filePath, "utf8");
    for (const { id, pattern } of forbiddenImportPatterns) {
      assertCase(
        `structure.methodology.no-${id}.${rel.split("/").pop()}`,
        !pattern.test(source),
        rel
      );
    }
  }
}

const METHODOLOGY_BOUNDARY_FORBIDDEN_PATTERNS: { label: string; pattern: RegExp }[] =
  [
    { label: "react", pattern: /from\s+["']react(?:\/|["'])/ },
    { label: "next", pattern: /from\s+["']next(?:\/|["'])/ },
    { label: "app-boundary", pattern: /from\s+["']@\/app\// },
    { label: "app-src", pattern: /from\s+["'][^"']*src\/app\// },
    { label: "components-boundary", pattern: /from\s+["']@\/components\// },
    {
      label: "components-src",
      pattern: /from\s+["'][^"']*src\/components\//,
    },
    { label: "page-tsx", pattern: /from\s+["'].*page\.tsx["']/ },
  ];

export function assertMethodologyBoundaryClean(
  assertCase: AssertCase,
  repoRoot: string
): void {
  const methodologyFiles = collectMethodologyTsFiles(repoRoot);
  const violations: string[] = [];

  for (const filePath of methodologyFiles) {
    const rel = filePath.replace(repoRoot + "\\", "").replace(repoRoot + "/", "");
    const source = readFileSync(filePath, "utf8");
    for (const { label, pattern } of METHODOLOGY_BOUNDARY_FORBIDDEN_PATTERNS) {
      if (pattern.test(source)) {
        violations.push(`${rel}:${label}`);
      }
    }
  }

  assertCase(
    "structure.methodology.boundary-clean",
    violations.length === 0,
    violations.length > 0 ? violations.join("; ") : undefined
  );
}

export function assertModuleFilesPresent(
  assertCase: AssertCase,
  repoRoot: string,
  moduleNames: string[],
  fileNames: string[]
): void {
  const methodologyRoot = join(repoRoot, "src/lib/scientific/methodology");
  for (const moduleName of moduleNames) {
    for (const fileName of fileNames) {
      assertCase(
        `structure.module.${moduleName}.${fileName}`,
        existsSync(join(methodologyRoot, moduleName, fileName))
      );
    }
  }
}

export function emitGateSummary(
  phase: string,
  results: CaseResult[]
): { pass: boolean; exitCode: number } {
  const summary = {
    phase,
    pass: results.every((item) => item.pass),
    caseCount: results.length,
    cases: results,
  };
  console.log(JSON.stringify(summary, null, 2));
  const exitCode = summary.pass ? 0 : 1;
  process.exit(exitCode);
  return { pass: summary.pass, exitCode };
}

export type SubGateSummary = {
  gate: string;
  pass: boolean;
  exitCode: number | null;
  caseCount?: number;
  detail?: string;
};

export function runNpmScriptGate(
  repoRoot: string,
  npmScript: string,
  gateId: string
): SubGateSummary {
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const run = spawnSync(npmCmd, ["run", npmScript], {
    cwd: repoRoot,
    stdio: "pipe",
    shell: true,
    encoding: "utf8",
  });
  let caseCount: number | undefined;
  const stdout = run.stdout ?? "";
  try {
    const jsonStart = stdout.indexOf("{");
    if (jsonStart >= 0) {
      const parsed = JSON.parse(stdout.slice(jsonStart)) as { caseCount?: number };
      caseCount = parsed.caseCount;
    }
  } catch {
    // sub-gate stdout may not be JSON when failing early
  }
  return {
    gate: gateId,
    pass: run.status === 0,
    exitCode: run.status,
    caseCount,
    detail:
      run.status === 0
        ? undefined
        : (run.stderr || stdout).trim().slice(0, 200) || undefined,
  };
}

export function emitUmbrellaSummary(
  phase: string,
  subGates: SubGateSummary[]
): { pass: boolean; exitCode: number } {
  const caseCount = subGates.reduce(
    (sum, gate) => sum + (gate.caseCount ?? 0),
    0
  );
  const summary = {
    phase,
    pass: subGates.every((gate) => gate.pass),
    caseCount,
    subGates,
  };
  console.log(JSON.stringify(summary, null, 2));
  const exitCode = summary.pass ? 0 : 1;
  process.exit(exitCode);
  return { pass: summary.pass, exitCode };
}
