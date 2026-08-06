/**
 * ENGINE-9 — GraphEditor certified-flow cutover regression cases.
 * Verifies allowlist emptied and cut-over app files no longer import superseded symbols.
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { createAssertCase, type CaseResult } from "./run-assertions";

import {
  FORBIDDEN_LEGACY_ORCHESTRATION_SYMBOLS,
  LEGACY_ORCHESTRATION_ALLOWLIST,
} from "../internal/boundary-policy";
import {
  composeEngine,
  setDefaultCompositionForTests,
} from "../internal/compose";
import { configureEngine } from "../public/composition";
import { openProject, saveProject } from "../public/workflows";
import { buildEmptyProjectCollectContext } from "../coordination/project/empty-collect-context";

const repoRoot = process.cwd();

const CUTOVER_FILES = [
  "src/app/localProjectActions.ts",
  "src/app/page.tsx",
  "src/app/engineBootstrap.ts",
] as const;

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

export const runGraphEditorCutoverCaseSuite = async (): Promise<
  CaseResult[]
> => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  setDefaultCompositionForTests(null);

  try {
    assertCase(
      "cutover.allowlist.empty",
      LEGACY_ORCHESTRATION_ALLOWLIST.length === 0,
    );

    for (const rel of CUTOVER_FILES) {
      const abs = join(repoRoot, rel);
      assertCase(`cutover.file.exists.${rel}`, existsSync(abs));
      const code = stripComments(readFileSync(abs, "utf8"));
      for (const symbol of FORBIDDEN_LEGACY_ORCHESTRATION_SYMBOLS) {
        const importRe = new RegExp(
          String.raw`import\s*\{[^}]*\b${symbol}\b[^}]*\}\s*from`,
        );
        assertCase(
          `cutover.noLegacyImport.${rel}.${symbol}`,
          !importRe.test(code),
        );
      }
    }

    assertCase(
      "cutover.localActions.usesEngine",
      /from\s+["']@\/engine["']/.test(
        readFileSync(join(repoRoot, "src/app/localProjectActions.ts"), "utf8"),
      ) &&
        /\bopenProject\b/.test(
          readFileSync(join(repoRoot, "src/app/localProjectActions.ts"), "utf8"),
        ) &&
        /\bsaveProject\b/.test(
          readFileSync(join(repoRoot, "src/app/localProjectActions.ts"), "utf8"),
        ) &&
        /\bexportProject\b/.test(
          readFileSync(join(repoRoot, "src/app/localProjectActions.ts"), "utf8"),
        ),
    );

    assertCase(
      "cutover.page.usesImportDataset",
      /\bimportDataset\b/.test(
        readFileSync(join(repoRoot, "src/app/page.tsx"), "utf8"),
      ),
    );

    assertCase(
      "cutover.bootstrap.configureEngine",
      /\bconfigureEngine\b/.test(
        readFileSync(join(repoRoot, "src/app/engineBootstrap.ts"), "utf8"),
      ),
    );

    // Injected repo parity — configureEngine + public save/open (no @/lib/project import)
    {
      const seeded = composeEngine();
      const repo = seeded.projectAdapter.getRepository();
      configureEngine({ projectRepository: repo });
      const created = await saveProject({
        projectName: "Cutover Repo",
        ctx: buildEmptyProjectCollectContext({ name: "Cutover Repo" }),
      });
      assertCase(
        "cutover.configure.save.ok",
        created.ok === true,
        created.error?.message,
      );
      const id = (created.result as { id?: string } | undefined)?.id;
      assertCase("cutover.configure.save.id", typeof id === "string", id);
      const opened = await openProject({ id });
      assertCase(
        "cutover.configure.open.ok",
        opened.ok === true,
        opened.error?.message,
      );

      const composed = composeEngine({ adapterOptions: { repo } });
      assertCase(
        "cutover.compose.sameRepoShape",
        composed.projectAdapter.getRepository() === repo,
      );
    }
  } finally {
    setDefaultCompositionForTests(null);
  }

  return results;
};
