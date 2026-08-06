/**
 * Shared helpers for DATA-I9 Quality Gate scripts.
 * Evidence / diagnostics only — no domain behavior.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

export type GateCase = { id: string; pass: boolean; detail: string };

export const repoRoot = process.cwd();
export const dataDir = join(repoRoot, "src/data");
export const srcDir = join(repoRoot, "src");

export const assertCase = (
  results: GateCase[],
  id: string,
  pass: boolean,
  detail: string
): void => {
  results.push({ id, pass, detail });
};

export const stripComments = (source: string): string =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/.*$/gm, " ");

export const readRel = (relPath: string): string => {
  const full = join(repoRoot, relPath);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
};

export const fileExists = (relPath: string): boolean =>
  existsSync(join(repoRoot, relPath));

export const collectTsFiles = (dir: string): string[] => {
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

export const toPosix = (p: string) => p.replace(/\\/g, "/");

export const relFromRepo = (abs: string) => toPosix(relative(repoRoot, abs));

export const extractFromSpecifiers = (code: string): string[] => {
  const specs: string[] = [];
  const re = /from\s+["']([^"']+)["']/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) specs.push(m[1]!);
  return specs;
};

export const finishGate = (
  gateId: string,
  results: GateCase[]
): never => {
  const failed = results.filter((r) => !r.pass);
  const summary = {
    phase: gateId,
    pass: failed.length === 0,
    total: results.length,
    failed: failed.map((f) => ({ id: f.id, detail: f.detail })),
    results,
  };
  console.log(JSON.stringify(summary, null, 2));
  console.log(
    summary.pass
      ? `\nPASS — ${gateId}`
      : `\nFAIL — ${gateId} (${failed.map((f) => f.id).join(", ")})`
  );
  process.exit(summary.pass ? 0 : 1);
};
