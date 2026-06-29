import { spawnSync } from "node:child_process";

const gates = [
  "validate:prod2b-b1-1-domain",
  "validate:prod2b-b1-2-migrate",
  "validate:prod2b-b1-3-v2",
  "validate:prod2b-b1-4-adapters",
  "validate:prod2b-f0",
  "validate:prod2b-migrate",
  "validate:prod2b-b2-map",
  "validate:prod2b-b2-ids",
  "validate:prod2b-b2-collect",
  "validate:prod2b-b2-serialize",
  "validate:prod2b-b2-hydrate",
  "validate:prod2b-b2-hydrate-wire",
  "validate:prod2b-b2-sanitize",
  "validate:prod2b-b2-ui-pipeline",
  "validate:prod2b-b2-invariants",
  "validate:prod2a-unit",
];

const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
const results: Array<{ gate: string; pass: boolean; exitCode: number | null }> =
  [];

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

const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
  stdio: "inherit",
  shell: true,
});
results.push({
  gate: "tsc --noEmit",
  pass: tsc.status === 0,
  exitCode: tsc.status,
});

const summary = {
  phase: "prod-2b-b2-gate",
  pass: results.every((item) => item.pass),
  gateCount: results.length,
  gates: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
