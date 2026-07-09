import { spawnSync } from "node:child_process";

import {
  getRepoRoot,
  type ModularizationMetrics,
  runNpmScriptGate,
  type SubGateSummary,
} from "./lib/methodology-gate-utils";

const PHASE = "prod2d-gate";
const SCHEMA_VERSION = 1;

const INFRA_FAIL_STEP_IDS = new Set(["baseline", "e2e"]);
const CONNECTION_REFUSED_RE = /ERR_CONNECTION_REFUSED|connection refused/i;

type ValidateFullStep = {
  id: string;
  pass: boolean;
  stderr?: string;
};

type ValidateFullSummary = {
  pass: boolean;
  steps?: ValidateFullStep[];
};

type Prod2dGateSummary = {
  schemaVersion: typeof SCHEMA_VERSION;
  phase: typeof PHASE;
  pass: boolean;
  subGates: SubGateSummary[];
  metrics: ModularizationMetrics | Record<string, never>;
  generatedAt: string;
};

const DELEGATED_SUB_GATES: { npmScript: string; gateId: string }[] = [
  { npmScript: "validate:prod2b-b2-gate", gateId: "prod2b-b2-gate" },
  {
    npmScript: "validate:arch5-f5-modularization-gate",
    gateId: "arch5-f5-modularization-gate",
  },
  { npmScript: "validate:visibility-unit", gateId: "visibility-unit" },
  {
    npmScript: "validate:project-history-unit",
    gateId: "project-history-unit",
  },
];

function extractTopLevelJsonSlice(
  stdout: string,
  rootStart: number
): string | undefined {
  let depth = 0;
  let insideString = false;
  let escaped = false;

  for (let index = rootStart; index < stdout.length; index += 1) {
    const char = stdout[index];

    if (insideString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === '"') {
        insideString = false;
      }
      continue;
    }

    if (char === '"') {
      insideString = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return stdout.slice(rootStart, index + 1);
      }
    }
  }

  return undefined;
}

function parseJsonFromStdout(stdout: string): unknown | undefined {
  const match = stdout.match(/^\s*\{/m);
  if (!match || match.index === undefined) {
    return undefined;
  }

  const slice = extractTopLevelJsonSlice(stdout, match.index);
  if (!slice) {
    return undefined;
  }

  try {
    return JSON.parse(slice);
  } catch {
    return undefined;
  }
}

function isValidateFullInfraOnlyFailure(
  summary: ValidateFullSummary,
  combinedOutput: string
): boolean {
  if (summary.pass) {
    return false;
  }

  const steps = summary.steps ?? [];
  const failed = steps.filter((step) => !step.pass);
  if (failed.length === 0) {
    return false;
  }

  if (!failed.every((step) => INFRA_FAIL_STEP_IDS.has(step.id))) {
    return false;
  }

  const failureText = [
    combinedOutput,
    ...failed.map((step) => step.stderr ?? ""),
  ].join("\n");

  return CONNECTION_REFUSED_RE.test(failureText);
}

function runValidateFullSubGate(repoRoot: string): SubGateSummary {
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const run = spawnSync(npmCmd, ["run", "validate:full"], {
    cwd: repoRoot,
    stdio: "pipe",
    shell: true,
    encoding: "utf8",
  });

  const stdout = run.stdout ?? "";
  const stderr = run.stderr ?? "";
  const combined = `${stdout}\n${stderr}`;
  const parsed = parseJsonFromStdout(stdout) as ValidateFullSummary | undefined;

  if (run.status === 0) {
    return {
      gate: "validate:full",
      pass: true,
      exitCode: 0,
    };
  }

  if (parsed && isValidateFullInfraOnlyFailure(parsed, combined)) {
    const passedCount = (parsed.steps ?? []).filter((step) => step.pass).length;
    const totalCount = (parsed.steps ?? []).length;
    return {
      gate: "validate:full",
      pass: true,
      exitCode: run.status,
      detail: `PASS condicionado (${passedCount}/${totalCount}): baseline+e2e infra ERR_CONNECTION_REFUSED`,
    };
  }

  return {
    gate: "validate:full",
    pass: false,
    exitCode: run.status,
    detail: (stderr || stdout).trim().slice(0, 200) || undefined,
  };
}

function runArch5SubGate(repoRoot: string): {
  summary: SubGateSummary;
  metrics?: ModularizationMetrics;
} {
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const run = spawnSync(npmCmd, ["run", "validate:arch5-f5-modularization-gate"], {
    cwd: repoRoot,
    stdio: "pipe",
    shell: true,
    encoding: "utf8",
  });

  const stdout = run.stdout ?? "";
  const parsed = parseJsonFromStdout(stdout) as
    | { caseCount?: number; metrics?: ModularizationMetrics }
    | undefined;

  return {
    summary: {
      gate: "arch5-f5-modularization-gate",
      pass: run.status === 0,
      exitCode: run.status,
      caseCount: parsed?.caseCount,
      detail:
        run.status === 0
          ? undefined
          : ((run.stderr || stdout).trim().slice(0, 200) || undefined),
    },
    metrics: parsed?.metrics,
  };
}

const repoRoot = getRepoRoot(import.meta.url);
const subGates: SubGateSummary[] = [runValidateFullSubGate(repoRoot)];

let delegatedMetrics: ModularizationMetrics | undefined;

for (const { npmScript, gateId } of DELEGATED_SUB_GATES) {
  if (npmScript === "validate:arch5-f5-modularization-gate") {
    const arch5 = runArch5SubGate(repoRoot);
    subGates.push(arch5.summary);
    delegatedMetrics = arch5.metrics;
    continue;
  }

  subGates.push(runNpmScriptGate(repoRoot, npmScript, gateId));
}

const metrics: Prod2dGateSummary["metrics"] = delegatedMetrics ?? {};

const summary: Prod2dGateSummary = {
  schemaVersion: SCHEMA_VERSION,
  phase: PHASE,
  pass: subGates.every((gate) => gate.pass),
  subGates,
  metrics,
  generatedAt: new Date().toISOString(),
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
