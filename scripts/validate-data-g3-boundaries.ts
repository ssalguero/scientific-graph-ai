/**
 * DATA-G3 Boundaries — delegates to certified I8 boundary gate (unchanged).
 */
import { spawnSync } from "node:child_process";

console.log("DATA-G3 — invoking validate:data-boundaries (DATA-I8 certified)\n");

const result = spawnSync("npm", ["run", "validate:data-boundaries"], {
  stdio: "inherit",
  shell: true,
  cwd: process.cwd(),
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

const code = result.status ?? 1;
console.log(
  code === 0
    ? "\nPASS — data-g3-boundaries (via I8 boundary gate)"
    : "\nFAIL — data-g3-boundaries"
);
process.exit(code);
