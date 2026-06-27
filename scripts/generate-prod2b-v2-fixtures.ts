import fs from "node:fs";
import path from "node:path";

import { migrateProjectJson } from "../src/lib/project/index";

const FIXTURES_DIR = path.join(process.cwd(), "scripts", "fixtures");

const V1_FIXTURES = [
  {
    source: "project-v1-empty.sgproj",
    target: "project-v2-empty.sgproj",
  },
  {
    source: "project-v1-dataset5-minimal.sgproj",
    target: "project-v2-dataset5-minimal.sgproj",
  },
] as const;

for (const item of V1_FIXTURES) {
  const text = fs.readFileSync(path.join(FIXTURES_DIR, item.source), "utf8");
  const migrated = migrateProjectJson(text);
  if (!migrated.ok) {
    throw new Error(`Failed to migrate ${item.source}`);
  }
  fs.writeFileSync(
    path.join(FIXTURES_DIR, item.target),
    `${JSON.stringify(migrated.file, null, 2)}\n`,
    "utf8"
  );
}

console.log(
  JSON.stringify(
    {
      phase: "generate-v2-fixtures",
      pass: true,
      written: V1_FIXTURES.map((item) => item.target),
    },
    null,
    2
  )
);
