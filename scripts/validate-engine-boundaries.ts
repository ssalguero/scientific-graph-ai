/**
 * ENGINE-0…ENGINE-8 — Architecture Freeze + Boundary Enforcement gate.
 *
 * Authority: src/engine/ARCHITECTURE.md · BOUNDARY_ENFORCEMENT.md · ENGINE Plan
 *
 * Checks:
 * 1. Package layout exists with single-responsibility folders
 * 2. Public barrel exports only contracts + public facades
 * 3. Outside ENGINE does not import ENGINE internals
 * 4. Outside ENGINE may import only `@/engine` / `@/engine/contracts` (public surface)
 * 5. ENGINE does not import UX / page hosts
 * 6. ENGINE must not import scientific/graph libs; `@/lib/import` only under coordination/import;
 *    `@/lib/project` only under coordination/project|export
 * 7. Frozen Application API names present on public facades
 * 8. ENGINE-8: composeEngine is the single composition root for public facades
 * 9. ENGINE-8/9: app/UX must not call superseded certified-flow use-cases
 *    (GraphEditor dual-path allowlist emptied in ENGINE-9)
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  CERTIFIED_BUSINESS_COMMAND_IDS,
  CERTIFIED_PUBLIC_LIFECYCLE_IDS,
  CERTIFIED_PUBLIC_WORKFLOW_IDS,
  FORBIDDEN_LEGACY_ORCHESTRATION_SYMBOLS,
  LEGACY_ORCHESTRATION_ALLOWLIST,
} from "../src/engine/internal/boundary-policy";

const repoRoot = process.cwd();
const engineDir = join(repoRoot, "src/engine");
const srcDir = join(repoRoot, "src");

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const stripComments = (source: string): string =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/.*$/gm, " ");

const readRel = (relPath: string): string => {
  const full = join(repoRoot, relPath);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
};

const collectTsFiles = (dir: string): string[] => {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  const walk = (abs: string) => {
    for (const name of readdirSync(abs)) {
      const child = join(abs, name);
      if (statSync(child).isDirectory()) {
        walk(child);
      } else if (/\.(ts|tsx)$/.test(name)) {
        out.push(child);
      }
    }
  };
  walk(dir);
  return out;
};

const toPosix = (p: string) => p.replace(/\\/g, "/");

const relFromRepo = (abs: string) => toPosix(relative(repoRoot, abs));

const extractFromSpecifiers = (code: string): string[] => {
  const specs: string[] = [];
  const re = /from\s+["']([^"']+)["']/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    specs.push(m[1]!);
  }
  return specs;
};

const isAllowedEnginePublicImport = (spec: string): boolean =>
  spec === "@/engine" ||
  spec === "@/engine/contracts" ||
  spec.startsWith("@/engine/contracts/");

const isEnginePackageImport = (spec: string): boolean =>
  spec === "@/engine" ||
  spec.startsWith("@/engine/") ||
  /(?:^|\/)src\/engine(?:\/|$)/.test(spec);

/* —— 0. Package layout —— */

const requiredDirs = [
  "contracts",
  "public",
  "orchestration",
  "business",
  "coordination",
  "flows",
  "diagnostics",
  "internal",
  "__tests__",
] as const;

assertCase(
  "engine.layout.root",
  existsSync(engineDir) && existsSync(join(engineDir, "index.ts")),
  "src/engine/index.ts exists"
);

for (const dir of requiredDirs) {
  assertCase(
    `engine.layout.${dir}`,
    existsSync(join(engineDir, dir)),
    `src/engine/${dir}/ exists`
  );
}

assertCase(
  "engine.layout.architectureDoc",
  existsSync(join(engineDir, "ARCHITECTURE.md")),
  "ARCHITECTURE.md freeze doc present"
);

assertCase(
  "engine.layout.boundaryEnforcementDoc",
  existsSync(join(engineDir, "BOUNDARY_ENFORCEMENT.md")),
  "BOUNDARY_ENFORCEMENT.md present (ENGINE-8)"
);

assertCase(
  "engine.layout.boundaryPolicy",
  existsSync(join(engineDir, "internal/boundary-policy.ts")),
  "internal/boundary-policy.ts present (ENGINE-8)"
);

/* —— 1. Public barrel surface —— */

const publicBarrel = readRel("src/engine/index.ts");
const publicBarrelCode = stripComments(publicBarrel);

const forbiddenPublicReexports = [
  /from\s+["']\.\/internal/,
  /from\s+["']\.\/business/,
  /from\s+["']\.\/coordination/,
  /from\s+["']\.\/orchestration/,
  /from\s+["']\.\/flows/,
  /from\s+["']\.\/diagnostics/,
] as const;

const publicReexportHits = forbiddenPublicReexports
  .filter((re) => re.test(publicBarrel))
  .map((re) => re.source);

assertCase(
  "engine.public.barrel.noInternals",
  publicReexportHits.length === 0,
  publicReexportHits.length
    ? `public barrel re-exports internals: ${publicReexportHits.join(",")}`
    : "index.ts does not re-export internals"
);

assertCase(
  "engine.public.barrel.contracts",
  /from\s+["']\.\/contracts["']/.test(publicBarrel),
  "index.ts exports contracts types"
);

assertCase(
  "engine.public.barrel.workflows",
  /from\s+["']\.\/public\/workflows["']/.test(publicBarrel),
  "index.ts exports public workflows"
);

assertCase(
  "engine.public.barrel.lifecycle",
  /from\s+["']\.\/public\/lifecycle["']/.test(publicBarrel),
  "index.ts exports public lifecycle"
);

assertCase(
  "engine.public.barrel.commands",
  /from\s+["']\.\/public\/commands["']/.test(publicBarrel),
  "index.ts exports public commands"
);

assertCase(
  "engine.public.barrel.configureEngine",
  /configureEngine/.test(publicBarrelCode) &&
    /from\s+["']\.\/public\/composition["']/.test(publicBarrel),
  "index.ts exports configureEngine (ENGINE-9)"
);

/* —— 2. Frozen Application API names —— */

const workflows = readRel("src/engine/public/workflows.ts");
const lifecycle = readRel("src/engine/public/lifecycle.ts");
const commands = readRel("src/engine/public/commands.ts");

const workflowNames = [
  "createProject",
  "openProject",
  "closeProject",
  "saveProject",
  "importDataset",
  "exportProject",
] as const;

const missingWorkflows = workflowNames.filter(
  (name) => !new RegExp(`export async function ${name}\\b`).test(workflows)
);

assertCase(
  "engine.api.workflow.names",
  missingWorkflows.length === 0,
  missingWorkflows.length
    ? `missing workflow facades: ${missingWorkflows.join(",")}`
    : "workflow facade names frozen"
);

const lifecycleNames = [
  "initializeApplication",
  "activateWorkspace",
  "activateDocument",
  "shutdownApplication",
] as const;

const missingLifecycle = lifecycleNames.filter(
  (name) => !new RegExp(`export async function ${name}\\b`).test(lifecycle)
);

assertCase(
  "engine.api.lifecycle.names",
  missingLifecycle.length === 0,
  missingLifecycle.length
    ? `missing lifecycle facades: ${missingLifecycle.join(",")}`
    : "lifecycle facade names frozen"
);

assertCase(
  "engine.api.command.executeCommand",
  /export async function executeCommand\b/.test(commands),
  "executeCommand facade present"
);

const workflowContract = readRel("src/engine/contracts/workflow.ts");
assertCase(
  "engine.api.workflowId.union",
  workflowNames.every((name) =>
    new RegExp(`["']${name}["']`).test(workflowContract)
  ),
  "WorkflowId union matches frozen workflow names"
);

/* —— 3. Outside ENGINE must not import internals —— */

const internalPathNeedles = [
  "@/engine/internal",
  "@/engine/business",
  "@/engine/coordination",
  "@/engine/orchestration",
  "@/engine/flows",
  "@/engine/diagnostics",
  "src/engine/internal",
  "src/engine/business",
  "src/engine/coordination",
  "src/engine/orchestration",
  "src/engine/flows",
  "src/engine/diagnostics",
] as const;

const outsideEngineFiles = collectTsFiles(srcDir).filter((abs) => {
  const rel = toPosix(relative(srcDir, abs));
  return !rel.startsWith("engine/");
});

const externalInternalHits: string[] = [];
for (const abs of outsideEngineFiles) {
  const raw = readFileSync(abs, "utf8");
  for (const needle of internalPathNeedles) {
    if (raw.includes(needle)) {
      externalInternalHits.push(`${relFromRepo(abs)} → ${needle}`);
    }
  }
  // Relative deep imports into engine internals
  if (
    /from\s+["'][^"']*engine\/(internal|business|coordination|orchestration|flows|diagnostics)\//.test(
      raw
    )
  ) {
    externalInternalHits.push(`${relFromRepo(abs)} → relative engine internal`);
  }
}

assertCase(
  "engine.boundary.external.noInternals",
  externalInternalHits.length === 0,
  externalInternalHits.length
    ? `external internal imports: ${externalInternalHits.slice(0, 8).join(" | ")}`
    : "no external imports of ENGINE internals"
);

/**
 * ENGINE-8: Outside ENGINE may import ONLY the public surface:
 * `@/engine` or `@/engine/contracts` (and subpaths under contracts).
 * Deep / internal ENGINE imports remain forbidden (checked above).
 */
const externalPublicSurfaceViolations: string[] = [];
for (const abs of outsideEngineFiles) {
  const code = stripComments(readFileSync(abs, "utf8"));
  for (const spec of extractFromSpecifiers(code)) {
    if (!isEnginePackageImport(spec)) continue;
    if (isAllowedEnginePublicImport(spec)) continue;
    externalPublicSurfaceViolations.push(`${relFromRepo(abs)} → ${spec}`);
  }
}

assertCase(
  "engine.boundary.external.publicSurfaceOnly",
  externalPublicSurfaceViolations.length === 0,
  externalPublicSurfaceViolations.length
    ? `non-public @/engine imports: ${externalPublicSurfaceViolations
        .slice(0, 8)
        .join(" | ")}`
    : "external ENGINE imports limited to @/engine | @/engine/contracts (ENGINE-8)"
);

/* —— 4. ENGINE ✕ UX —— */

const engineFiles = collectTsFiles(engineDir);
const uxImportHits: string[] = [];

/**
 * Session Platform allowlist (ENGINE-5):
 * Only `coordination/session/**` may import non-React Session Platform modules.
 * Documented: Session under `src/components/session` is Platform infrastructure, not UX.
 * Forbidden even in allowlist path: SessionProvider / SessionBridge / SessionContext / root barrel.
 */
const SESSION_PLATFORM_ALLOWLIST = [
  "@/components/session/restore",
  "@/components/session/autosave",
  "@/components/session/persistence",
  "@/components/session/snapshots",
  "@/components/session/restorePoints",
  "@/components/session/SessionRegistry",
  "@/components/session/SessionTypes",
  "@/components/session/SessionDefinition",
  "@/components/session/SessionState",
] as const;

const SESSION_PLATFORM_FORBIDDEN = [
  "@/components/session/SessionProvider",
  "@/components/session/SessionBridge",
  "@/components/session/SessionContext",
] as const;

const isAllowedSessionPlatformImport = (
  spec: string,
  inSessionCoordination: boolean,
): boolean => {
  if (!inSessionCoordination) return false;
  // Exact allowlist prefixes (subpath barrels)
  for (const allowed of SESSION_PLATFORM_ALLOWLIST) {
    if (spec === allowed || spec.startsWith(`${allowed}/`)) {
      return true;
    }
  }
  // Relative into session platform (rare; prefer @/ aliases)
  if (
    /components\/session\/(restore|autosave|persistence|snapshots|restorePoints|SessionRegistry|SessionTypes|SessionDefinition|SessionState)/.test(
      spec,
    )
  ) {
    return true;
  }
  return false;
};

for (const abs of engineFiles) {
  const raw = readFileSync(abs, "utf8");
  const code = stripComments(raw);
  const rel = toPosix(relative(engineDir, abs));
  const inSessionCoordination =
    rel.startsWith("coordination/session/") ||
    rel === "coordination/session.ts";

  // React / page host needles in code (comments stripped)
  if (/\bfrom\s+["']react["']/.test(code) || /\bfrom\s+["']react\//.test(code)) {
    uxImportHits.push(`${relFromRepo(abs)} ~ react`);
  }
  if (/\.tsx$/.test(abs)) {
    uxImportHits.push(`${relFromRepo(abs)} ~ tsx`);
  }
  // ENGINE-8: only flag GraphEditor / page.tsx as *imports*, not allowlist prose
  if (
    /from\s+["'][^"']*(?:GraphEditor|\/page\.tsx)["']/.test(code) ||
    /import\s*\(\s*["'][^"']*(?:GraphEditor|\/page\.tsx)["']/.test(code)
  ) {
    uxImportHits.push(`${relFromRepo(abs)} ~ GraphEditor/page import`);
  }
  if (/from\s+["']@\/ui(?:\/|["'])/.test(code) || /from\s+["'][^"']*\/src\/ui(?:\/|["'])/.test(code)) {
    uxImportHits.push(`${relFromRepo(abs)} ~ @/ui`);
  }
  if (/from\s+["']@\/app(?:\/|["'])/.test(code)) {
    uxImportHits.push(`${relFromRepo(abs)} ~ @/app`);
  }

  for (const spec of extractFromSpecifiers(code)) {
    // Forbidden Session UX surfaces anywhere in ENGINE
    for (const forbidden of SESSION_PLATFORM_FORBIDDEN) {
      if (spec === forbidden || spec.startsWith(`${forbidden}`)) {
        uxImportHits.push(`${relFromRepo(abs)} → ${spec} (Session UX forbidden)`);
      }
    }
    // Root Session barrel pulls React Provider — never allow
    if (spec === "@/components/session" || spec.endsWith("/components/session")) {
      uxImportHits.push(
        `${relFromRepo(abs)} → ${spec} (use Session platform subpaths, not root barrel)`,
      );
      continue;
    }

    const isComponents =
      spec.startsWith("@/components") ||
      /(?:^|\/)components\//.test(spec);

    if (!isComponents) continue;

    if (isAllowedSessionPlatformImport(spec, inSessionCoordination)) {
      continue;
    }

    // Historical relative exception for windows (unused today) — still not @/components/windows via UX
    if (
      inSessionCoordination === false &&
      /components\/windows\//.test(spec)
    ) {
      // Windows adapters not yet implemented; keep blocked until ENGINE Windows phase
    }

    uxImportHits.push(`${relFromRepo(abs)} → ${spec}`);
  }
}

assertCase(
  "engine.boundary.noUx",
  uxImportHits.length === 0,
  uxImportHits.length
    ? `ENGINE UX/page imports: ${uxImportHits.slice(0, 8).join(" | ")}`
    : "ENGINE does not import UX / page hosts (Session Platform allowlist OK)"
);

assertCase(
  "engine.boundary.noReact",
  engineFiles.every((abs) => {
    const raw = readFileSync(abs, "utf8");
    return (
      !/\bfrom\s+["']react["']/.test(raw) &&
      !/\bfrom\s+["']react\//.test(raw) &&
      !/\.tsx$/.test(abs)
    );
  }),
  "ENGINE package has no React / .tsx"
);

assertCase(
  "engine.boundary.sessionPlatform.allowlistDoc",
  SESSION_PLATFORM_ALLOWLIST.length >= 4 &&
    SESSION_PLATFORM_FORBIDDEN.every((f) =>
      readRel("scripts/validate-engine-boundaries.ts").includes(f),
    ),
  "Session Platform allowlist documented in boundary validator"
);

/* —— 5. Scientific / project / import lib imports —
 * coordination/project|export may use @/lib/project
 * coordination/import may use @/lib/import
 */

const bannedLibNeedles = [
  "@/lib/scientific",
  "@/lib/graph",
  "src/lib/scientific",
  "src/lib/graph",
] as const;

const importLibNeedles = ["@/lib/import", "src/lib/import"] as const;
const projectLibNeedles = ["@/lib/project", "src/lib/project"] as const;

const libHits: string[] = [];
const importLibHitsOutsideCoordination: string[] = [];
const projectLibHitsOutsideCoordination: string[] = [];

for (const abs of engineFiles) {
  const raw = readFileSync(abs, "utf8");
  const code = stripComments(raw);
  const rel = toPosix(relative(engineDir, abs));
  const inProjectCoordination =
    rel.startsWith("coordination/project/") ||
    rel === "coordination/project.ts";
  const inExportCoordination =
    rel.startsWith("coordination/export/") ||
    rel === "coordination/export.ts";
  const inImportCoordination =
    rel.startsWith("coordination/import/") ||
    rel === "coordination/import.ts";
  const projectLibAllowed = inProjectCoordination || inExportCoordination;
  const specs = extractFromSpecifiers(code);

  for (const needle of bannedLibNeedles) {
    // Match import path prefixes in from-specifiers only (not prose comments)
    const hit = specs.some(
      (spec) => spec === needle || spec.startsWith(`${needle}/`),
    );
    if (hit) {
      libHits.push(`${relFromRepo(abs)} → ${needle}`);
    }
  }

  for (const needle of importLibNeedles) {
    const hit = specs.some(
      (spec) => spec === needle || spec.startsWith(`${needle}/`),
    );
    if (hit && !inImportCoordination) {
      importLibHitsOutsideCoordination.push(
        `${relFromRepo(abs)} → ${needle}`,
      );
    }
  }

  for (const needle of projectLibNeedles) {
    const hit = specs.some(
      (spec) => spec === needle || spec.startsWith(`${needle}/`),
    );
    if (hit && !projectLibAllowed) {
      projectLibHitsOutsideCoordination.push(
        `${relFromRepo(abs)} → ${needle}`,
      );
    }
  }
}

assertCase(
  "engine.boundary.noScientificLibs",
  libHits.length === 0,
  libHits.length
    ? `ENGINE scientific/graph imports: ${libHits.slice(0, 8).join(" | ")}`
    : "ENGINE does not import scientific/graph libs"
);

assertCase(
  "engine.boundary.importLib.coordinationOnly",
  importLibHitsOutsideCoordination.length === 0,
  importLibHitsOutsideCoordination.length
    ? `@/lib/import only allowed under coordination/import: ${importLibHitsOutsideCoordination
        .slice(0, 8)
        .join(" | ")}`
    : "@/lib/import confined to coordination/import"
);

assertCase(
  "engine.boundary.projectLib.coordinationOnly",
  projectLibHitsOutsideCoordination.length === 0,
  projectLibHitsOutsideCoordination.length
    ? `@/lib/project only allowed under coordination/project|export: ${projectLibHitsOutsideCoordination
        .slice(0, 8)
        .join(" | ")}`
    : "@/lib/project confined to coordination/project|export"
);

/* —— 6. Flow ID placeholders present —— */

const flowFiles = [
  "create-project.ts",
  "open-project.ts",
  "close-project.ts",
  "save-project.ts",
  "import-dataset.ts",
  "restore-session.ts",
  "export-results.ts",
  "initialize-application.ts",
  "activate-workspace.ts",
  "activate-document.ts",
  "shutdown-application.ts",
] as const;

const missingFlows = flowFiles.filter(
  (f) => !existsSync(join(engineDir, "flows", f))
);

assertCase(
  "engine.flows.placeholders",
  missingFlows.length === 0,
  missingFlows.length
    ? `missing flow placeholders: ${missingFlows.join(",")}`
    : "Product Flow ID placeholders present"
);

/* —— 7. ENGINE-8: composition root + certified API inventory —— */

const composeSource = readRel("src/engine/internal/compose.ts");
const workflowsFacade = readRel("src/engine/public/workflows.ts");
const lifecycleFacade = readRel("src/engine/public/lifecycle.ts");
const commandsFacade = readRel("src/engine/public/commands.ts");

assertCase(
  "engine.compose.singleRoot.export",
  /export function composeEngine\b/.test(composeSource) &&
    /export function getDefaultComposition\b/.test(composeSource),
  "composeEngine + getDefaultComposition exported from internal/compose.ts"
);

assertCase(
  "engine.compose.singleRoot.noSecondFactory",
  collectTsFiles(engineDir)
    .filter((abs) => !toPosix(relative(engineDir, abs)).endsWith("compose.ts"))
    .every((abs) => {
      const code = stripComments(readFileSync(abs, "utf8"));
      return !/export function composeEngine\b/.test(code);
    }),
  "no second composeEngine factory outside internal/compose.ts"
);

assertCase(
  "engine.compose.publicFacades.useDefault",
  /getDefaultComposition\(\)/.test(workflowsFacade) &&
    /getDefaultComposition\(\)/.test(lifecycleFacade) &&
    /getDefaultComposition\(\)/.test(commandsFacade),
  "public facades resolve via getDefaultComposition()"
);

const registerCalls = [
  "registerProjectProductFlows",
  "registerSessionProductFlows",
  "registerImportExportProductFlows",
  "registerLifecycleProductFlows",
] as const;

const missingRegisterCalls = registerCalls.filter(
  (name) => !new RegExp(`\\b${name}\\s*\\(`).test(composeSource),
);

assertCase(
  "engine.compose.registersCertifiedFlows",
  missingRegisterCalls.length === 0,
  missingRegisterCalls.length
    ? `composeEngine missing register calls: ${missingRegisterCalls.join(",")}`
    : "composeEngine registers project/session/import-export/lifecycle flows"
);

const missingCertifiedWorkflows = CERTIFIED_PUBLIC_WORKFLOW_IDS.filter(
  (name) => !new RegExp(`export async function ${name}\\b`).test(workflows),
);
const missingCertifiedLifecycle = CERTIFIED_PUBLIC_LIFECYCLE_IDS.filter(
  (name) => !new RegExp(`export async function ${name}\\b`).test(lifecycle),
);

assertCase(
  "engine.api.certified.workflows",
  missingCertifiedWorkflows.length === 0,
  missingCertifiedWorkflows.length
    ? `certified workflow facades missing: ${missingCertifiedWorkflows.join(",")}`
    : "certified public workflow facades present"
);

assertCase(
  "engine.api.certified.lifecycle",
  missingCertifiedLifecycle.length === 0,
  missingCertifiedLifecycle.length
    ? `certified lifecycle facades missing: ${missingCertifiedLifecycle.join(",")}`
    : "certified public lifecycle facades present"
);

assertCase(
  "engine.api.certified.commandsInventory",
  CERTIFIED_BUSINESS_COMMAND_IDS.length >= 12,
  `certified business command inventory size=${CERTIFIED_BUSINESS_COMMAND_IDS.length}`
);

/* —— 8. ENGINE-8: forbid new dual-path orchestration outside allowlist —— */

const allowlistSet = new Set(
  LEGACY_ORCHESTRATION_ALLOWLIST.map((p) => toPosix(p)),
);

const missingAllowlistFiles = LEGACY_ORCHESTRATION_ALLOWLIST.filter(
  (p) => !existsSync(join(repoRoot, p)),
);

assertCase(
  "engine.boundary.legacyAllowlist.filesExist",
  missingAllowlistFiles.length === 0,
  missingAllowlistFiles.length
    ? `allowlist paths missing: ${missingAllowlistFiles.join(",")}`
    : "legacy dual-path allowlist files exist"
);

const isExemptFromLegacyOrchestrationScan = (relPosix: string): boolean => {
  if (relPosix.startsWith("src/engine/")) return true;
  if (relPosix.startsWith("src/lib/")) return true;
  if (relPosix.includes("/__tests__/")) return true;
  if (/\.cases\.ts$/.test(relPosix)) return true;
  if (allowlistSet.has(relPosix)) return true;
  return false;
};

const importBindingRe = (symbol: string): RegExp =>
  new RegExp(
    String.raw`(?:import\s*\{[^}]*\b${symbol}\b[^}]*\}\s*from\s*["'][^"']+["']|import\s+\*\s+as\s+\w+\s+from\s*["'][^"']*(?:local-project|@/lib/import)[^"']*["'])`,
    "m",
  );

const legacyOrchestrationHits: string[] = [];
for (const abs of collectTsFiles(srcDir)) {
  const rel = relFromRepo(abs);
  if (isExemptFromLegacyOrchestrationScan(rel)) continue;
  const code = stripComments(readFileSync(abs, "utf8"));
  for (const symbol of FORBIDDEN_LEGACY_ORCHESTRATION_SYMBOLS) {
    if (importBindingRe(symbol).test(code)) {
      legacyOrchestrationHits.push(`${rel} → ${symbol}`);
    }
  }
}

assertCase(
  "engine.boundary.legacyOrchestration.allowlistedOnly",
  legacyOrchestrationHits.length === 0,
  legacyOrchestrationHits.length
    ? `new dual-path orchestration outside allowlist: ${legacyOrchestrationHits
        .slice(0, 8)
        .join(" | ")}`
    : "superseded certified-flow use-cases forbidden outside empty allowlist (ENGINE-9)"
);

assertCase(
  "engine.boundary.enforcementDoc.mentionsAllowlist",
  /LEGACY|allowlist|ENGINE-9/i.test(
    readRel("src/engine/BOUNDARY_ENFORCEMENT.md"),
  ),
  "BOUNDARY_ENFORCEMENT.md documents legacy allowlist / ENGINE-9"
);

assertCase(
  "engine.boundary.legacyAllowlist.emptyAfterCutover",
  LEGACY_ORCHESTRATION_ALLOWLIST.length === 0,
  "ENGINE-9 emptied GraphEditor dual-path allowlist"
);

/* —— Summary —— */

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "engine-boundaries",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — engine-boundaries"
    : `\nFAIL — engine-boundaries (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
