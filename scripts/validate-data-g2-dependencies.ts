/**
 * DATA-G2 Dependencies — forbidden domain/internal edges (P2/P3).
 */
import { readFileSync } from "node:fs";
import {
  assertCase,
  collectTsFiles,
  dataDir,
  extractFromSpecifiers,
  finishGate,
  relFromRepo,
  srcDir,
  stripComments,
  toPosix,
  type GateCase,
} from "./lib/data-gate-helpers";
import { DATA_FORBIDDEN_INTERNAL_EDGES } from "../src/data/internal/boundary-policy";
import { join } from "node:path";

const results: GateCase[] = [];

const edgeHits: string[] = [];
for (const abs of collectTsFiles(dataDir)) {
  const rel = relFromRepo(abs);
  const posix = toPosix(rel);
  const code = stripComments(readFileSync(abs, "utf8"));
  for (const spec of extractFromSpecifiers(code)) {
    let target = spec;
    if (spec.startsWith(".")) {
      const dir = posix.includes("/")
        ? posix.slice(0, posix.lastIndexOf("/"))
        : posix;
      target = toPosix(join(dir, spec));
    }
    for (const edge of DATA_FORBIDDEN_INTERNAL_EDGES) {
      if (
        posix.includes(edge.fromIncludes) &&
        target.includes(edge.toIncludes)
      ) {
        edgeHits.push(`${rel}: ${edge.reason}`);
      }
    }
  }
}

assertCase(
  results,
  "g2.forbiddenInternalEdges",
  edgeHits.length === 0,
  edgeHits.length === 0
    ? "no forbidden internal dependency edges"
    : edgeHits.slice(0, 10).join("; ")
);

/** DATA must not import UX / pages / Product Flow hosts. */
const uxHits: string[] = [];
for (const abs of collectTsFiles(dataDir)) {
  const rel = relFromRepo(abs);
  const code = stripComments(readFileSync(abs, "utf8"));
  for (const spec of extractFromSpecifiers(code)) {
    if (
      spec.startsWith("@/components") ||
      spec.startsWith("@/app") ||
      spec.startsWith("@/pages") ||
      /\/ux\//i.test(spec) ||
      spec.includes("ProductFlow")
    ) {
      uxHits.push(`${rel} → ${spec}`);
    }
  }
}

assertCase(
  results,
  "g2.noUxOrProductFlowImports",
  uxHits.length === 0,
  uxHits.length === 0
    ? "DATA does not import UX / app hosts / Product Flows"
    : uxHits.slice(0, 10).join("; ")
);

/** Outside peers should not create reverse DATA→UX coupling via DATA package. */
assertCase(
  results,
  "g2.dataPackageScoped",
  collectTsFiles(dataDir).length > 0 && collectTsFiles(srcDir).length > 0,
  "DATA and src packages present for dependency scan"
);

finishGate("data-g2-dependencies", results);
