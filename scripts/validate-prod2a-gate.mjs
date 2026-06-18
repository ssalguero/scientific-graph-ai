/**
 * PROD-2A final gate — runs F0, unit, F6, TypeScript, build, baselines, RW-Suite, E2E.
 */
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const steps = [];

const run = (id, command, args, options = {}) => {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    shell: true,
    ...options,
  });
  const pass = result.status === 0;
  steps.push({
    id,
    pass,
    exitCode: result.status,
    stderr: pass ? undefined : (result.stderr || "").trim().slice(0, 500),
  });
  return pass;
};

run("f0", "npm", ["run", "validate:prod2a-f0"]);
run("unit", "npm", ["run", "validate:prod2a-unit"]);
run("f6", "npx", ["tsx", "scripts/validate-prod2a-f6.ts"]);
run("typescript", "npx", ["tsc", "--noEmit"]);
run("build", "npm", ["run", "build"]);
run("baseline", "node", ["scripts/.score-check-sci60.mjs"]);
run("rw-suite", "node", ["scripts/validate-prod1-rw-suite.mjs"]);
run("e2e", "npm", ["run", "validate:prod2a"]);

const pass = steps.every((step) => step.pass);
const summary = {
  initiative: "PROD-2A",
  phase: "F6-final-gate",
  pass,
  steps,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(pass ? 0 : 1);
