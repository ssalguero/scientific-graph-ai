/**
 * PROD-2A final gate — backward-compatible wrapper (legacy step set, no duplicate RW in E2E).
 */
import path from "path";
import { fileURLToPath } from "url";

import { runValidationGate } from "./validate-full-gate.mjs";

const __filename = fileURLToPath(import.meta.url);

const summary = runValidationGate({
  profile: "prod2a",
  initiative: "PROD-2A",
  phase: "F6-final-gate",
});

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
