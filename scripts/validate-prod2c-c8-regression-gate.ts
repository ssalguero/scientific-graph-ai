import { spawnSync } from "node:child_process";

const gates = [
  "validate:prod2c-c4-visual-graph-mapper",
  "validate:prod2c-c5-visual-graph-collect",
  "validate:prod2c-c6-visual-graph-hydrate",
  "validate:prod2c-c7-visual-graph-ui",
  "validate:prod2c-c8-visual-graph-fixtures",
];

const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
const results: Array<{ gate: string; pass: boolean; exitCode: number | null }> = [];

for (const gate of gates) {
  const run = spawnSync(npmCmd, ["run", gate], {
    stdio: "inherit",
    shell: true,
  });
  results.push({
    gate,
    pass: run.status === 0,
    exitCode: run.status,
  });
  if (run.status !== 0) {
    break;
  }
}

const summary = {
  phase: "prod-2c-c8-regression-gate",
  pass: results.every((item) => item.pass),
  gateCount: results.length,
  gates: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
