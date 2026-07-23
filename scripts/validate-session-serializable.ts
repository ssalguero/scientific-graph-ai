/**
 * D65.9 — Session Foundation · serializable surface gate.
 * Ensures SessionDefinition / SessionState / SessionSnapshot type surfaces
 * stay JSON-safe (no Map, Set, WeakMap, WeakSet, Function, ReactNode, Date, Promise).
 * Authority: D65.0 API Freeze · HR-session-serializable.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const sessionDir = join(repoRoot, "src/components/session");

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const stripComments = (source: string): string =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/.*$/gm, " ");

const readSession = (file: string): string => {
  const full = join(sessionDir, file);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
};

/**
 * Extract exported type/interface bodies for serializable contracts.
 * Avoids false positives from runtime helpers (e.g. Date.now(), function keyword).
 */
const extractTypeBodies = (source: string, names: string[]): string => {
  const code = stripComments(source);
  const bodies: string[] = [];
  for (const name of names) {
    const typeMatch = code.match(
      new RegExp(
        `export\\s+type\\s+${name}\\s*=\\s*(\\[[\\s\\S]*?\\]|\\{[\\s\\S]*?\\}|[^;]+);`
      )
    );
    if (typeMatch) {
      bodies.push(typeMatch[1]);
      continue;
    }
    const ifaceMatch = code.match(
      new RegExp(`export\\s+interface\\s+${name}\\s*\\{([\\s\\S]*?)\\}`)
    );
    if (ifaceMatch) {
      bodies.push(ifaceMatch[1]);
    }
  }
  return bodies.join("\n");
};

const FORBIDDEN: { id: string; pattern: RegExp; label: string }[] = [
  { id: "Map", pattern: /\bMap\s*</, label: "Map" },
  { id: "Set", pattern: /\bSet\s*</, label: "Set" },
  { id: "WeakMap", pattern: /\bWeakMap\b/, label: "WeakMap" },
  { id: "WeakSet", pattern: /\bWeakSet\b/, label: "WeakSet" },
  { id: "Promise", pattern: /\bPromise\s*</, label: "Promise" },
  { id: "ReactNode", pattern: /\bReactNode\b/, label: "ReactNode" },
  { id: "Function", pattern: /\bFunction\b/, label: "Function" },
  {
    id: "Date",
    pattern: /:\s*Date\b|\bDate\s*\||\|\s*Date\b|<\s*Date\s*>|Date\s*;/,
    label: "Date",
  },
];

const scanBodies = (
  scope: string,
  bodies: string,
  fileLabel: string
): void => {
  assertCase(
    `serializable.${scope}.bodyPresent`,
    bodies.trim().length > 0,
    bodies.trim().length > 0
      ? `${fileLabel} type body extracted`
      : `${fileLabel} type body missing`
  );

  for (const ban of FORBIDDEN) {
    const hit = ban.pattern.test(bodies);
    assertCase(
      `serializable.${scope}.no-${ban.id}`,
      !hit,
      hit ? `${ban.label} found in ${fileLabel}` : `no ${ban.label}`
    );
  }
};

/* —— SessionDefinition —— */
const definitionSrc = readSession("SessionDefinition.ts");
assertCase(
  "serializable.definition.file",
  definitionSrc.length > 0,
  definitionSrc.length > 0 ? "SessionDefinition.ts exists" : "missing"
);
scanBodies(
  "definition",
  extractTypeBodies(definitionSrc, ["SessionDefinition"]),
  "SessionDefinition"
);

/* —— SessionState —— */
const stateSrc = readSession("SessionState.ts");
assertCase(
  "serializable.state.file",
  stateSrc.length > 0,
  stateSrc.length > 0 ? "SessionState.ts exists" : "missing"
);
scanBodies(
  "state",
  extractTypeBodies(stateSrc, ["SessionState"]),
  "SessionState"
);

/* —— SessionSnapshot (optional until helper lands; validate when present) —— */
const snapshotPath = join(sessionDir, "SessionSnapshot.ts");
const snapshotExists = existsSync(snapshotPath);
const snapshotSrc = snapshotExists ? readSession("SessionSnapshot.ts") : "";

if (snapshotExists) {
  scanBodies(
    "snapshot",
    extractTypeBodies(snapshotSrc, ["SessionSnapshot"]),
    "SessionSnapshot"
  );
  assertCase(
    "serializable.snapshot.toSessionSnapshot",
    /export\s+function\s+toSessionSnapshot\s*\(/.test(snapshotSrc) ||
      /export\s+const\s+toSessionSnapshot\b/.test(snapshotSrc),
    "toSessionSnapshot present when SessionSnapshot.ts exists"
  );
} else {
  assertCase(
    "serializable.snapshot.deferred",
    true,
    "SessionSnapshot.ts not present yet — Definition/State gates apply (helper may land with D66)"
  );
}

/* —— SessionEntry composition (Types) —— */
const typesSrc = readSession("SessionTypes.ts");
scanBodies(
  "entry",
  extractTypeBodies(typesSrc, ["SessionEntry", "SessionMetadata"]),
  "SessionTypes Entry/Metadata"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "session-serializable",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — session-serializable"
    : `\nFAIL — session-serializable (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
