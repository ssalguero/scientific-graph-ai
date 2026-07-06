import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type GateResult = {
  gate: string;
  pass: boolean;
  exitCode: number | null;
  detail?: string;
};

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const results: GateResult[] = [];

function runTsxScript(scriptName: string, gateId: string) {
  const run = spawnSync("npx", ["tsx", join("scripts", scriptName)], {
    cwd: repoRoot,
    stdio: "pipe",
    shell: true,
    encoding: "utf8",
  });
  results.push({
    gate: gateId,
    pass: run.status === 0,
    exitCode: run.status,
    detail: run.status === 0 ? undefined : (run.stderr || run.stdout || "").trim().slice(0, 200),
  });
  return run.status === 0;
}

function assertStructural(id: string, pass: boolean, detail?: string) {
  results.push({ gate: id, pass, exitCode: pass ? 0 : 1, detail });
}

const requiredHomeComponents = [
  "SmartStartScreen.tsx",
  "SmartStartIntentAssistant.tsx",
  "CompareStepsBanner.tsx",
  "PublicationEntryBanner.tsx",
];

const homeDir = join(repoRoot, "src/components/home");
const homeFiles = existsSync(homeDir) ? readdirSync(homeDir) : [];
const missingHomeComponents = requiredHomeComponents.filter(
  (name) => !homeFiles.includes(name)
);

assertStructural(
  "structure.home-components",
  missingHomeComponents.length === 0,
  missingHomeComponents.length === 0
    ? requiredHomeComponents.join(", ")
    : `missing: ${missingHomeComponents.join(", ")}`
);

assertStructural(
  "structure.use-smart-start-hook",
  existsSync(join(repoRoot, "src/app/useSmartStart.ts")),
  "src/app/useSmartStart.ts"
);

assertStructural(
  "structure.smart-start-barrel",
  existsSync(join(repoRoot, "src/lib/smart-start/index.ts")),
  "src/lib/smart-start/index.ts"
);

const intentAssistantRefs: string[] = [];
function scanSource(relPath: string) {
  const absPath = join(repoRoot, relPath);
  if (!existsSync(absPath)) return;
  if (statSync(absPath).isDirectory()) {
    for (const name of readdirSync(absPath)) {
      if (name.endsWith(".ts") || name.endsWith(".tsx")) {
        scanSource(join(relPath, name));
      }
    }
    return;
  }
  const source = readFileSync(absPath, "utf8");
  if (source.includes("intentAssistant") || source.includes("@/app/intentAssistant")) {
    intentAssistantRefs.push(relPath);
  }
}

for (const relPath of [
  "src/components/home",
  "src/app/page.tsx",
  "src/app/useSmartStart.ts",
]) {
  scanSource(relPath);
}

assertStructural(
  "structure.no-intent-assistant-imports",
  intentAssistantRefs.length === 0,
  intentAssistantRefs.join(", ") || "none"
);

const homeSources = requiredHomeComponents
  .map((name) => join(homeDir, name))
  .filter((path) => existsSync(path))
  .map((path) => readFileSync(path, "utf8"));

const cyclicHomeImports = homeSources.filter(
  (source) => source.includes("@/app/page") || source.includes("./page")
);

assertStructural(
  "structure.home-acyclic-imports",
  cyclicHomeImports.length === 0,
  cyclicHomeImports.length === 0 ? "no page imports from home" : "home imports page"
);

let subGatesPass = true;
subGatesPass = runTsxScript("validate-smart-start-config-unit.ts", "smart-start-config-unit") && subGatesPass;
subGatesPass = runTsxScript("validate-intent-assistant-unit.ts", "intent-assistant-unit") && subGatesPass;

const summary = {
  phase: "smart-start-unit",
  pass: results.every((item) => item.pass),
  gateCount: results.length,
  gates: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
