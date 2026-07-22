/**
 * D63.9 — Lifecycle + Tab ↔ Series Wiring · no workspace coupling gate.
 * Authority: docs/D63.0-content-lifecycle-discovery.md · HR-no-workspace-shell.
 * Cheap scan: windows/content/** must not import src/components/workspace/**.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const contentDir = join(repoRoot, "src/components/windows/content");

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

assertCase(
  "d63.coupling.contentDirExists",
  existsSync(contentDir),
  existsSync(contentDir) ? "content/ exists" : "content/ missing"
);

const hits: string[] = [];

const walk = (dir: string): void => {
  if (!existsSync(dir)) {
    return;
  }
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (!entry.name.endsWith(".ts") && !entry.name.endsWith(".tsx")) {
      continue;
    }
    const src = readFileSync(full, "utf8");
    const coupled =
      /from\s+["'][^"']*components\/workspace/.test(src) ||
      /from\s+["']@\/components\/workspace/.test(src) ||
      /from\s+["'][^"']*\/workspace\/[^"']*["']/.test(src) ||
      /from\s+["'][^"']*\/workspace["']/.test(src) ||
      /require\s*\(\s*["'][^"']*workspace/.test(src);

    if (coupled) {
      hits.push(full.replace(repoRoot, "").replace(/\\/g, "/"));
    }
  }
};

walk(contentDir);

assertCase(
  "d63.coupling.noWorkspaceImports",
  hits.length === 0,
  hits.length
    ? `workspace imports: ${hits.join(",")}`
    : "windows/content/** imports nothing from workspace/"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d63-no-workspace-coupling",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — d63-no-workspace-coupling"
    : `\nFAIL — d63-no-workspace-coupling (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
