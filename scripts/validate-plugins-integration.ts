/**
 * PLUGINS-I9 — Platform Integration readiness gate.
 *
 * Authority: PLUGINS-P1 · P3 C10 · P4 · P6 I9 ·
 * docs/PLUGINS/implementation/PLUGINS-I9-Platform-Integration.md
 *
 * Principle: Integration orchestrates. Peer domains own. PLUGINS extends.
 * Execution remains deferred.
 *
 * Review checks (mandatory):
 * 1. Every integration adapter depends only on certified public interfaces (conceptual)
 * 2. No integration component accesses peer internals / registries / services
 * 3. Peer ownership of extension points remains intact
 * 4. PLUGINS acts solely as Extensibility Layer / governance
 * 5. No integration logic enables execution, runtime loading, or ownership transfer
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  PLUGINS_ALLOWED_PUBLIC_INTEGRATION_REEXPORTS,
  PLUGINS_I9_FORBIDDEN_IMPORT_FRAGMENTS,
  PLUGINS_I9_FORBIDDEN_PEER_IMPORT_PREFIXES,
  PLUGINS_INTEGRATION_REQUIRED_DIRS,
  PLUGINS_INTEGRATION_REQUIRED_FILES,
} from "../src/plugins/internal/boundary-policy";
import { PLUGINS_INTEGRATION_FLAGS } from "../src/plugins/integration/status";
import { composePluginsIntegration } from "../src/plugins/integration/wiring/compose-integration";
import { resolveExtensionPointBinding } from "../src/plugins/integration/resolver";
import { PLUGINS_ALL_INTEGRATION_ADAPTERS } from "../src/plugins/integration/adapters";
import { PLUGINS_PEER_OWNERSHIP } from "../src/plugins/integration/peers";

const repoRoot = process.cwd();
const pluginsDir = join(repoRoot, "src/plugins");
const integrationDir = join(pluginsDir, "integration");

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

for (const rel of PLUGINS_INTEGRATION_REQUIRED_DIRS) {
  assertCase(
    `i9.dir.${rel}`,
    existsSync(join(pluginsDir, rel)),
    existsSync(join(pluginsDir, rel)) ? "present" : "missing",
  );
}

for (const rel of PLUGINS_INTEGRATION_REQUIRED_FILES) {
  assertCase(
    `i9.file.${rel}`,
    existsSync(join(pluginsDir, rel)),
    existsSync(join(pluginsDir, rel)) ? "present" : "missing",
  );
}

assertCase(
  "i9.doc",
  existsSync(
    join(
      repoRoot,
      "docs/PLUGINS/implementation/PLUGINS-I9-Platform-Integration.md",
    ),
  ),
  "PLUGINS-I9 implementation record",
);

const barrel = existsSync(join(pluginsDir, "index.ts"))
  ? readFileSync(join(pluginsDir, "index.ts"), "utf8")
  : "";

for (const sym of PLUGINS_ALLOWED_PUBLIC_INTEGRATION_REEXPORTS) {
  assertCase(
    `i9.public.reexport.${sym}`,
    barrel.includes(sym),
    `allowed public re-export ${sym}`,
  );
}

assertCase(
  "i9.barrel.no.ops.leak",
  !/\b(resolveExtensionPointBinding|composePluginsIntegration|listIntegrationAdapters|getIntegrationPublicView|getCrossDomainIntegrationView|collectIntegrationDiagnostics)\b/.test(
    barrel,
  ),
  "public barrel must not leak integration ops",
);

assertCase(
  "i9.flags",
  PLUGINS_INTEGRATION_FLAGS.integrationImplemented === true &&
    PLUGINS_INTEGRATION_FLAGS.peerContractsOnly === true &&
    PLUGINS_INTEGRATION_FLAGS.peerOwnershipPreserved === true &&
    PLUGINS_INTEGRATION_FLAGS.peerInternalAccess === false &&
    PLUGINS_INTEGRATION_FLAGS.executionImplemented === false &&
    PLUGINS_INTEGRATION_FLAGS.runtimeLoadingImplemented === false,
  "I9 acceptance flags",
);

const snap = composePluginsIntegration();
assertCase(
  "integration.snapshot",
  snap.status === "PLATFORM_INTEGRATION_IMPLEMENTED" &&
    snap.identity.ownsPeerExtensionPoints === false &&
    snap.identity.peerInternalAccess === false &&
    snap.identity.executesPlugins === false &&
    snap.identity.loadsPlugins === false &&
    snap.identity.transfersOwnership === false &&
    snap.adapters.length === 5 &&
    snap.peers.length === 5,
  `${snap.status} adapters=${snap.adapters.length}`,
);

assertCase(
  "integration.peers.catalog",
  PLUGINS_PEER_OWNERSHIP.every(
    (p) =>
      p.ownsOwnExtensionPoints === true &&
      p.pluginsOwnsPeer === false &&
      p.pluginsMayAccessInternals === false,
  ) && PLUGINS_ALL_INTEGRATION_ADAPTERS.length === 5,
  "peer ownership freeze preserved",
);

for (const adapter of PLUGINS_ALL_INTEGRATION_ADAPTERS) {
  assertCase(
    `adapter.${adapter.peer}`,
    adapter.__orchestratesOnly === true &&
      adapter.__ownsPeerExtensionPoints === false &&
      adapter.__consumesPeerInternals === false &&
      adapter.__executesPlugins === false &&
      adapter.__loadsPlugins === false &&
      adapter.publicContracts.length >= 1 &&
      adapter.publicContracts.every(
        (c) =>
          c.__certifiedPublicSurface === true && c.__peerInternal === false,
      ),
    `${adapter.adapterId} public-contracts-only`,
  );
}

for (const file of collectTsFiles(integrationDir)) {
  const src = readFileSync(file, "utf8");
  const rel = relFromRepo(file);
  for (const frag of PLUGINS_I9_FORBIDDEN_IMPORT_FRAGMENTS) {
    assertCase(
      `i9.isolation.${frag.replace(/[/@]/g, ".")}.${rel}`,
      !src.includes(frag),
      `must not reference ${frag}`,
    );
  }
  for (const prefix of PLUGINS_I9_FORBIDDEN_PEER_IMPORT_PREFIXES) {
    const importHit =
      src.includes(`from "${prefix}`) ||
      src.includes(`from '${prefix}`) ||
      src.includes(`from "${prefix}/`) ||
      src.includes(`from '${prefix}/`);
    assertCase(
      `i9.no.peer.import.${prefix.replace(/[/@]/g, ".")}.${rel}`,
      !importHit,
      `must not import peer package ${prefix}`,
    );
  }
  assertCase(
    `i9.no.execution.${rel}`,
    !/\b(executePlugin|loadPlugin|activatePlugin|import\s*\()\b/.test(src),
    "no execution / load / dynamic import",
  );
}

const binding = resolveExtensionPointBinding({
  peer: "ENGINE",
  extensionPointRef: "engine.workflow.extension.v0",
  capabilityId: "cap.demo",
});

assertCase(
  "resolver.operational",
  binding !== undefined &&
    binding.__ownsExtensionPoint === false &&
    binding.__peerOwnsExtensionPoint === true &&
    binding.executable === false &&
    binding.resolved === true &&
    binding.peer === "ENGINE",
  binding
    ? `bound=${binding.extensionPointRef} surface=${binding.publicContractSurfaceId}`
    : "missing binding",
);

const publicView = snap.getPublicView();
const crossView = snap.getCrossDomainView();
const health = snap.getHealth();

assertCase(
  "views.operational",
  publicView.__peerContractsOnly === true &&
    publicView.__peerInternalAccess === false &&
    publicView.__executionImplemented === false &&
    crossView.__ownershipTransfer === false &&
    crossView.peerIntegrations.length === 5 &&
    health.healthy === true &&
    health.peerOwnershipPreserved === true &&
    health.peerInternalAccess === false &&
    health.executionImplemented === false &&
    health.diagnostics.length >= 5,
  `health adapters=${health.adapterCount} diags=${health.diagnostics.length}`,
);

assertCase(
  "still.no.execution",
  snap.flags.executionImplemented === false &&
    snap.flags.runtimeLoadingImplemented === false &&
    snap.flags.peerInternalAccess === false,
  "I9 must not enable execution, loading, or peer internals",
);

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.id}: ${r.detail}`);
}

if (failed.length > 0) {
  console.error(`\nvalidate-plugins-integration: ${failed.length} failure(s)`);
  process.exit(1);
}

console.log(`\nvalidate-plugins-integration: ${results.length} checks PASS`);
