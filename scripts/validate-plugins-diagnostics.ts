/**
 * PLUGINS-I8 — Diagnostics & Observability readiness gate.
 *
 * Authority: PLUGINS-P5 · PLUGINS-P6 I8 ·
 * docs/PLUGINS/implementation/PLUGINS-I8-Diagnostics-and-Observability.md
 *
 * Principle: Diagnostics observe. Observability aggregates. Lifecycle decides.
 *
 * Review checks (mandatory):
 * 1. Diagnostics only consume information; never modify subsystem state
 * 2. Observability aggregates without altering or recomputing diagnostics
 * 3. No subsystem consumes Observability for architectural/lifecycle decisions
 * 4. Health/status models remain descriptive and read-only
 * 5. No telemetry backend, logging provider, dashboard, or monitoring service
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  PLUGINS_ALLOWED_PUBLIC_DIAGNOSTICS_REEXPORTS,
  PLUGINS_DIAGNOSTICS_REQUIRED_DIRS,
  PLUGINS_DIAGNOSTICS_REQUIRED_FILES,
  PLUGINS_I8_FORBIDDEN_IMPORT_FRAGMENTS,
  PLUGINS_OBSERVABILITY_REQUIRED_DIRS,
  PLUGINS_OBSERVABILITY_REQUIRED_FILES,
} from "../src/plugins/internal/boundary-policy";
import { PLUGINS_OBSERVABILITY_FLAGS } from "../src/plugins/observability/status";
import { composePluginsDiagnostics } from "../src/plugins/diagnostics/wiring/compose-diagnostics";
import { composePluginsObservability } from "../src/plugins/observability/wiring/compose-observability";
import { collectDiagnostics } from "../src/plugins/diagnostics/collect";
import { aggregateObservability } from "../src/plugins/observability/aggregate";
import type { CompatibilityReport } from "../src/plugins/compatibility/report";
import type { ValidationReport } from "../src/plugins/validation/report";

const repoRoot = process.cwd();
const pluginsDir = join(repoRoot, "src/plugins");

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const toPosix = (p: string) => p.replace(/\\/g, "/");
const relFromRepo = (abs: string) => toPosix(relative(repoRoot, abs));

const collectTsFiles = (dir: string): string[] => {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  const walk = (abs: string) => {
    for (const name of readdirSync(abs)) {
      const child = join(abs, name);
      if (statSync(child).isDirectory()) walk(child);
      else if (/\.(ts|tsx)$/.test(name)) out.push(child);
    }
  };
  walk(dir);
  return out;
};

for (const rel of [
  ...PLUGINS_DIAGNOSTICS_REQUIRED_DIRS,
  ...PLUGINS_OBSERVABILITY_REQUIRED_DIRS,
]) {
  assertCase(
    `i8.dir.${rel}`,
    existsSync(join(pluginsDir, rel)),
    existsSync(join(pluginsDir, rel)) ? "present" : "missing",
  );
}

for (const rel of [
  ...PLUGINS_DIAGNOSTICS_REQUIRED_FILES,
  ...PLUGINS_OBSERVABILITY_REQUIRED_FILES,
]) {
  assertCase(
    `i8.file.${rel}`,
    existsSync(join(pluginsDir, rel)),
    existsSync(join(pluginsDir, rel)) ? "present" : "missing",
  );
}

assertCase(
  "i8.doc",
  existsSync(
    join(
      repoRoot,
      "docs/PLUGINS/implementation/PLUGINS-I8-Diagnostics-and-Observability.md",
    ),
  ),
  "PLUGINS-I8 implementation record",
);

const barrel = existsSync(join(pluginsDir, "index.ts"))
  ? readFileSync(join(pluginsDir, "index.ts"), "utf8")
  : "";

for (const sym of PLUGINS_ALLOWED_PUBLIC_DIAGNOSTICS_REEXPORTS) {
  assertCase(
    `i8.public.reexport.${sym}`,
    barrel.includes(sym),
    `allowed public re-export ${sym}`,
  );
}

assertCase(
  "i8.barrel.no.ops.leak",
  !/\b(collectDiagnostics|aggregateObservability|composePluginsDiagnostics|composePluginsObservability|evaluateCompatibility|certifyCompliance|decideFromPublicContract)\b/.test(
    barrel,
  ),
  "public barrel must not leak diagnostics/observability ops",
);

assertCase(
  "i8.flags",
  PLUGINS_OBSERVABILITY_FLAGS.diagnosticsImplemented === true &&
    PLUGINS_OBSERVABILITY_FLAGS.observabilityImplemented === true &&
    PLUGINS_OBSERVABILITY_FLAGS.observabilityReadOnly === true &&
    PLUGINS_OBSERVABILITY_FLAGS.healthAggregationImplemented === true &&
    PLUGINS_OBSERVABILITY_FLAGS.executionImplemented === false &&
    PLUGINS_OBSERVABILITY_FLAGS.runtimeLoadingImplemented === false,
  "I8 acceptance flags",
);

const diagSnap = composePluginsDiagnostics();
assertCase(
  "diagnostics.snapshot",
  diagSnap.diagnosticsImplemented === true &&
    diagSnap.mutatesState === false &&
    diagSnap.componentId === "C9_DiagnosticsService" &&
    diagSnap.metadata.telemetryBackend === false &&
    diagSnap.metadata.dashboard === false,
  `${diagSnap.phase}/${diagSnap.status}`,
);

const obsSnap = composePluginsObservability();
assertCase(
  "observability.snapshot",
  obsSnap.observabilityImplemented === true &&
    obsSnap.observabilityReadOnly === true &&
    obsSnap.decisionAuthority === false &&
    obsSnap.identity.telemetryBackend === false &&
    obsSnap.identity.loggingProvider === false &&
    obsSnap.identity.dashboard === false &&
    obsSnap.identity.monitoringService === false,
  `${obsSnap.phase}/${obsSnap.status}`,
);

for (const folder of ["diagnostics", "observability"] as const) {
  for (const file of collectTsFiles(join(pluginsDir, folder))) {
    const src = readFileSync(file, "utf8");
    const rel = relFromRepo(file);
    for (const frag of PLUGINS_I8_FORBIDDEN_IMPORT_FRAGMENTS) {
      assertCase(
        `i8.isolation.${frag.replace(/\//g, ".")}.${rel}`,
        !src.includes(frag),
        `must not reference ${frag}`,
      );
    }
    assertCase(
      `i8.no.execution.${rel}`,
      !/\b(executePlugin|loadPlugin|activatePlugin|import\s*\()\b/.test(src),
      "no execution / load / dynamic import",
    );
  }
}

/** Review #3: Lifecycle must not consume Observability. */
for (const file of collectTsFiles(join(pluginsDir, "lifecycle"))) {
  const src = readFileSync(file, "utf8");
  const rel = relFromRepo(file);
  assertCase(
    `lifecycle.no.observability.${rel}`,
    !/observability\//.test(src),
    "Lifecycle must not consume Observability",
  );
}

/** Observability aggregates bundle; does not call evaluate/certify/decide. */
const aggregateSrc = readFileSync(
  join(pluginsDir, "observability/aggregate.ts"),
  "utf8",
);
assertCase(
  "observability.no.recompute",
  !/evaluateCompatibility|certifyCompliance|decideFromPublicContract|collectDiagnostics/.test(
    aggregateSrc,
  ),
  "observability must not recompute diagnostics or prior engines",
);

const compatReport: CompatibilityReport = {
  __kind: "CompatibilityReport",
  __advisory: true,
  __executionImplied: false,
  __mutatesRegistry: false,
  __mutatesLifecycle: false,
  overall: "Indeterminate",
  findings: [],
  diagnostics: [
    { code: "COMPAT_EVALUATED", message: "projected for diagnostics" },
  ],
  evaluatedAtLabel: "structural",
};

const validationReport: ValidationReport = {
  __kind: "ValidationReport",
  __certification: true,
  __executionImplied: false,
  __mutatesRegistry: false,
  __mutatesLifecycle: false,
  __reEvaluatedCompatibility: false,
  overall: "Pass",
  findings: [],
  diagnostics: [
    { code: "VALIDATION_CERTIFIED", message: "projected for diagnostics" },
  ],
};

const bundle = collectDiagnostics({
  compatibilityReport: compatReport,
  validationReport,
});

assertCase(
  "diagnostics.operational",
  bundle.__readOnly === true &&
    bundle.__mutatesState === false &&
    bundle.entryCount >= 11 &&
    bundle.bySubsystem.length >= 1,
  `entries=${bundle.entryCount} subsystems=${bundle.bySubsystem.length}`,
);

const view = aggregateObservability(bundle);
assertCase(
  "observability.operational",
  view.__readOnly === true &&
    view.__decisionAuthority === false &&
    view.systemHealth.__descriptive === true &&
    view.sourceBundle.entryCount === bundle.entryCount &&
    view.events.every((e) => e.__transport === false),
  `health=${view.systemHealth.overall}`,
);

assertCase(
  "still.no.execution",
  diagSnap.executionImplemented === false &&
    obsSnap.executionImplemented === false &&
    obsSnap.runtimeLoadingImplemented === false,
  "I8 must not enable execution or runtime loading",
);

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.id}: ${r.detail}`);
}

if (failed.length > 0) {
  console.error(`\nvalidate-plugins-diagnostics: ${failed.length} failure(s)`);
  process.exit(1);
}

console.log(`\nvalidate-plugins-diagnostics: ${results.length} checks PASS`);
