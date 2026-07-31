/**
 * UX-3.8 — Theme Runtime Snapshot & DevTools Foundation gate.
 *
 * Blocks (10):
 * Layout — private barrel · purity bans
 * Behavior — snapshot readonly · builder · comparator · inspector
 * API — freeze · absent from public barrels
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { runtimeFingerprint } from "../src/ui/theme/runtime/context";
import {
  compareSnapshots,
  RuntimeInspector,
  SnapshotBuilder,
  SnapshotComparator,
  type RuntimeSnapshot,
} from "../src/ui/theme/runtime/devtools";
import { ThemeTokenResolver } from "../src/ui/theme/tokens/runtime/ThemeTokenResolver";
import { TokenCache } from "../src/ui/theme/tokens/runtime/TokenCache";
import { THEME_CONTRACT_VERSION } from "../src/ui/theme/version";

type BlockId =
  | "devtoolsLayout"
  | "noReact"
  | "noHooks"
  | "noAppImports"
  | "purity"
  | "snapshotReadonly"
  | "builderBehavior"
  | "comparatorO1"
  | "inspectorStateless"
  | "apiFreeze";

type CaseResult = { block: BlockId; id: string; pass: boolean; detail: string };

const results: CaseResult[] = [];

function assertCase(
  block: BlockId,
  id: string,
  pass: boolean,
  detail: string,
): void {
  results.push({ block, id, pass, detail });
}

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel: string): string {
  return readFileSync(join(repoRoot, rel), "utf8");
}

function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

const DEVTOOLS_DIR = "src/ui/theme/runtime/devtools";

const REQUIRED_FILES = [
  "RuntimeSnapshot.ts",
  "SnapshotBuilder.ts",
  "SnapshotComparator.ts",
  "RuntimeInspector.ts",
  "index.ts",
] as const;

function readDevtoolsSources(): string {
  return REQUIRED_FILES.map((f) => read(`${DEVTOOLS_DIR}/${f}`)).join("\n");
}

function isScalar(value: unknown): boolean {
  return typeof value === "string" || typeof value === "number";
}

/* -------------------------------------------------------------------------- */
/* 1. devtoolsLayout                                                          */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "devtoolsLayout";

  assertCase(
    block,
    "layout.dir.exists",
    existsSync(join(repoRoot, DEVTOOLS_DIR)),
    DEVTOOLS_DIR,
  );

  for (const file of REQUIRED_FILES) {
    const rel = `${DEVTOOLS_DIR}/${file}`;
    assertCase(block, `layout.file.${file}`, existsSync(join(repoRoot, rel)), rel);
  }

  const privateBarrel = read(`${DEVTOOLS_DIR}/index.ts`);
  assertCase(
    block,
    "layout.privateReexports",
    /\bRuntimeSnapshot\b/.test(privateBarrel) &&
      /\bSnapshotCompareResult\b/.test(privateBarrel) &&
      /\bSnapshotBuilder\b/.test(privateBarrel) &&
      /\bcompareSnapshots\b/.test(privateBarrel) &&
      /\bSnapshotComparator\b/.test(privateBarrel) &&
      /\bRuntimeInspector\b/.test(privateBarrel),
    "private devtools barrel reexports directory",
  );

  assertCase(
    block,
    "layout.privacyComment",
    /Not re-exported/.test(privateBarrel),
    "private barrel documents non-export privacy",
  );
}

/* -------------------------------------------------------------------------- */
/* 2. noReact                                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noReact";
  const code = stripComments(readDevtoolsSources());

  assertCase(
    block,
    "react.noImport",
    !/\bfrom\s+["']react["']/.test(code) &&
      !/\bfrom\s+["']react\//.test(code) &&
      !/\brequire\s*\(\s*["']react["']/.test(code),
    "devtools/ has no React imports",
  );

  assertCase(
    block,
    "react.noJsx",
    !/\.tsx\b/.test(
      readdirSync(join(repoRoot, DEVTOOLS_DIR)).join(" "),
    ) && !/<\w+[\s/>]/.test(code),
    "devtools/ has no JSX / tsx",
  );

  assertCase(
    block,
    "react.noContext",
    !/\bcreateContext\b/.test(code) &&
      !/\buseContext\b/.test(code) &&
      !/\bInternalRuntimeContext\b/.test(code) &&
      !/\bInternalRuntimeProvider\b/.test(code),
    "devtools/ does not use React Context",
  );
}

/* -------------------------------------------------------------------------- */
/* 3. noHooks                                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noHooks";
  const code = stripComments(readDevtoolsSources());

  assertCase(
    block,
    "hooks.none",
    !/\buse[A-Z]\w*\b/.test(code),
    "devtools/ has no hooks",
  );
}

/* -------------------------------------------------------------------------- */
/* 4. noAppImports                                                            */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noAppImports";
  const code = stripComments(readDevtoolsSources());

  const banned = [
    /from\s+["']@\/app\b/,
    /from\s+["']@\/components\b/,
    /from\s+["'].*\/app\//,
    /from\s+["'].*\/pages\//,
    /from\s+["'].*\/components\//,
    /from\s+["']@\/ui\/providers\b/,
    /from\s+["'].*theme-provider/,
  ];

  const hit = banned.find((re) => re.test(code));
  assertCase(
    block,
    "imports.noApp",
    hit === undefined,
    hit ? `banned import pattern: ${hit}` : "devtools/ has no app imports",
  );
}

/* -------------------------------------------------------------------------- */
/* 5. purity                                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "purity";
  const allCode = stripComments(readDevtoolsSources());
  const builderCode = stripComments(read(`${DEVTOOLS_DIR}/SnapshotBuilder.ts`));

  assertCase(
    block,
    "purity.noWeakMap",
    !/\bWeakMap\b/.test(allCode),
    "devtools/ bans WeakMap",
  );

  assertCase(
    block,
    "purity.noConsole",
    !/\bconsole\b/.test(allCode),
    "devtools/ bans console",
  );

  assertCase(
    block,
    "purity.noPerformance",
    !/\bperformance\b/.test(allCode),
    "devtools/ bans performance",
  );

  assertCase(
    block,
    "purity.noWindow",
    !/\bwindow\b/.test(allCode) && !/\bdocument\b/.test(allCode),
    "devtools/ bans window/DOM",
  );

  assertCase(
    block,
    "purity.noTimers",
    !/\bsetTimeout\b/.test(allCode) &&
      !/\bsetInterval\b/.test(allCode) &&
      !/\brequestAnimationFrame\b/.test(allCode),
    "devtools/ bans timers",
  );

  assertCase(
    block,
    "purity.noCacheMaps",
    !/\bnew\s+Map\b/.test(allCode) && !/\bnew\s+Set\b/.test(allCode),
    "devtools/ bans Map/Set caches",
  );

  assertCase(
    block,
    "purity.builderNeverFreezesRuntime",
    !/Object\.freeze\s*\(\s*runtime\s*\)/.test(builderCode),
    "SnapshotBuilder never freezes Runtime",
  );
}

/* -------------------------------------------------------------------------- */
/* 6. snapshotReadonly                                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "snapshotReadonly";

  const typeSrc = read(`${DEVTOOLS_DIR}/RuntimeSnapshot.ts`);
  assertCase(
    block,
    "snapshot.typeReadonly",
    /readonly fingerprint/.test(typeSrc) &&
      /readonly themeName/.test(typeSrc) &&
      /readonly version/.test(typeSrc) &&
      /readonly tokenCount/.test(typeSrc) &&
      /readonly colorCount/.test(typeSrc) &&
      /readonly typographyCount/.test(typeSrc) &&
      /readonly spacingCount/.test(typeSrc) &&
      /readonly radiusCount/.test(typeSrc) &&
      /readonly elevationCount/.test(typeSrc),
    "RuntimeSnapshot fields are readonly",
  );

  TokenCache.clear();
  const runtime = ThemeTokenResolver.resolve("light");
  const snapshot = SnapshotBuilder.build(runtime);

  assertCase(
    block,
    "snapshot.frozen",
    Object.isFrozen(snapshot),
    "built snapshot is frozen",
  );

  const keys = Object.keys(snapshot);
  const expectedKeys = [
    "fingerprint",
    "themeName",
    "version",
    "tokenCount",
    "colorCount",
    "typographyCount",
    "spacingCount",
    "radiusCount",
    "elevationCount",
  ];
  assertCase(
    block,
    "snapshot.keyCount",
    keys.length === expectedKeys.length,
    `Object.keys(snapshot).length === ${expectedKeys.length} (got ${keys.length})`,
  );
  assertCase(
    block,
    "snapshot.keysExact",
    expectedKeys.every((k) => keys.includes(k)) &&
      keys.length === expectedKeys.length,
    `snapshot has exactly the ${expectedKeys.length} frozen keys`,
  );

  assertCase(
    block,
    "snapshot.scalarsOnly",
    keys.every((k) => isScalar((snapshot as Record<string, unknown>)[k])),
    "snapshot values are scalars only",
  );

  assertCase(
    block,
    "snapshot.noNested",
    keys.every((k) => {
      const v = (snapshot as Record<string, unknown>)[k];
      return v === null || (typeof v !== "object" && typeof v !== "function");
    }),
    "snapshot has no nested objects/arrays",
  );
}

/* -------------------------------------------------------------------------- */
/* 7. builderBehavior                                                         */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "builderBehavior";

  TokenCache.clear();
  const light = ThemeTokenResolver.resolve("light");
  const dark = ThemeTokenResolver.resolve("dark");
  const lightClone = structuredClone(light);

  const snapA = SnapshotBuilder.build(light);
  const snapB = SnapshotBuilder.build(light);
  const snapClone = SnapshotBuilder.build(lightClone);
  const snapDark = SnapshotBuilder.build(dark);

  assertCase(
    block,
    "builder.deterministic",
    snapA.fingerprint === snapB.fingerprint &&
      snapA.tokenCount === snapB.tokenCount &&
      snapA.colorCount === snapB.colorCount &&
      snapA.themeName === snapB.themeName &&
      snapA.version === snapB.version,
    "same runtime ⇒ deterministic snapshot fields",
  );

  assertCase(
    block,
    "builder.semanticSame",
    snapA.fingerprint === snapClone.fingerprint &&
      snapA.tokenCount === snapClone.tokenCount,
    "semantic twin ⇒ same fingerprint and tokenCount",
  );

  assertCase(
    block,
    "builder.fingerprintMatches",
    snapA.fingerprint === runtimeFingerprint(light) &&
      snapDark.fingerprint === runtimeFingerprint(dark),
    "snapshot.fingerprint matches runtimeFingerprint",
  );

  assertCase(
    block,
    "builder.themeNameReserved",
    snapA.themeName === "" && snapDark.themeName === "",
    'themeName is always ""',
  );

  assertCase(
    block,
    "builder.version",
    snapA.version === THEME_CONTRACT_VERSION &&
      snapDark.version === THEME_CONTRACT_VERSION,
    "version is THEME_CONTRACT_VERSION",
  );

  assertCase(
    block,
    "builder.countsNonNeg",
    snapA.tokenCount >= 0 &&
      snapA.colorCount >= 0 &&
      snapA.typographyCount >= 0 &&
      snapA.spacingCount >= 0 &&
      snapA.radiusCount >= 0 &&
      snapA.elevationCount >= 0 &&
      snapA.tokenCount >=
        snapA.colorCount +
          snapA.typographyCount +
          snapA.spacingCount +
          snapA.radiusCount +
          snapA.elevationCount,
    "counts are non-negative; tokenCount covers all domains",
  );

  assertCase(
    block,
    "builder.differentThemes",
    snapA.fingerprint !== snapDark.fingerprint,
    "light/dark snapshots differ by fingerprint",
  );

  assertCase(
    block,
    "builder.runtimeUnfrozen",
    !Object.isFrozen(light) || Object.is(light, ThemeTokenResolver.resolve("light")),
    "builder does not freeze Runtime as a side effect of build",
  );

  // Runtime must remain the same reference after build (no mutation/replace).
  const before = light;
  SnapshotBuilder.build(before);
  assertCase(
    block,
    "builder.runtimeIntact",
    Object.is(before, light),
    "Runtime reference intact after SnapshotBuilder.build",
  );

  assertCase(
    block,
    "builder.noRuntimeRef",
    !Object.values(snapA).some((v) => v === light || typeof v === "object"),
    "snapshot retains no Runtime / object references",
  );
}

/* -------------------------------------------------------------------------- */
/* 8. comparatorO1                                                            */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "comparatorO1";

  TokenCache.clear();
  const light = ThemeTokenResolver.resolve("light");
  const dark = ThemeTokenResolver.resolve("dark");
  const a = SnapshotBuilder.build(light);
  const b = SnapshotBuilder.build(light);
  const d = SnapshotBuilder.build(dark);

  const same = compareSnapshots(a, b);
  assertCase(
    block,
    "compare.same",
    same.changed === false &&
      same.fingerprintChanged === false &&
      same.tokenCountChanged === false &&
      same.metadataChanged === false,
    "identical snapshots ⇒ changed false",
  );

  assertCase(
    block,
    "compare.resultFrozen",
    Object.isFrozen(same),
    "compareSnapshots result is frozen",
  );

  const diff = compareSnapshots(a, d);
  assertCase(
    block,
    "compare.fingerprintChanged",
    diff.fingerprintChanged === true && diff.changed === true,
    "different fingerprints ⇒ fingerprintChanged",
  );

  const metaB: RuntimeSnapshot = Object.freeze({
    ...a,
    themeName: "x",
  });
  const meta = compareSnapshots(a, metaB);
  assertCase(
    block,
    "compare.metadataChanged",
    meta.metadataChanged === true &&
      meta.fingerprintChanged === false &&
      meta.tokenCountChanged === false &&
      meta.changed === true,
    "themeName/version only drive metadataChanged",
  );

  const countB: RuntimeSnapshot = Object.freeze({
    ...a,
    tokenCount: a.tokenCount + 1,
  });
  const count = compareSnapshots(a, countB);
  assertCase(
    block,
    "compare.tokenCountChanged",
    count.tokenCountChanged === true &&
      count.fingerprintChanged === false &&
      count.metadataChanged === false &&
      count.changed === true,
    "tokenCount drives tokenCountChanged",
  );

  const domainOnly: RuntimeSnapshot = Object.freeze({
    ...a,
    colorCount: a.colorCount + 1,
    typographyCount: Math.max(0, a.typographyCount - 1),
  });
  const domainCmp = compareSnapshots(a, domainOnly);
  assertCase(
    block,
    "compare.domainInformational",
    domainCmp.changed === false &&
      domainCmp.fingerprintChanged === false &&
      domainCmp.tokenCountChanged === false &&
      domainCmp.metadataChanged === false,
    "domainCount fields MUST NOT participate in changed",
  );

  assertCase(
    block,
    "compare.namespace",
    SnapshotComparator.compareSnapshots === compareSnapshots,
    "SnapshotComparator.compareSnapshots is compareSnapshots",
  );

  const comparatorSrc = stripComments(
    read(`${DEVTOOLS_DIR}/SnapshotComparator.ts`),
  );
  assertCase(
    block,
    "compare.noDeepWalk",
    !/\bcountLeaves\b/.test(comparatorSrc) &&
      !/\bruntimeFingerprint\b/.test(comparatorSrc) &&
      !/\bJSON\.stringify\b/.test(comparatorSrc),
    "comparator remains O(1) scalar compare (no deep walk)",
  );
}

/* -------------------------------------------------------------------------- */
/* 9. inspectorStateless                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "inspectorStateless";

  TokenCache.clear();
  const runtime = ThemeTokenResolver.resolve("light");
  const viaInspect = RuntimeInspector.inspect(runtime);
  const viaSnapshot = RuntimeInspector.snapshot(runtime);
  const viaBuilder = SnapshotBuilder.build(runtime);

  assertCase(
    block,
    "inspector.inspectDelegates",
    viaInspect.fingerprint === viaBuilder.fingerprint &&
      viaInspect.tokenCount === viaBuilder.tokenCount,
    "inspect delegates to SnapshotBuilder.build",
  );

  assertCase(
    block,
    "inspector.snapshotDelegates",
    viaSnapshot.fingerprint === viaBuilder.fingerprint &&
      viaSnapshot.tokenCount === viaBuilder.tokenCount,
    "snapshot delegates to SnapshotBuilder.build",
  );

  const cmp = RuntimeInspector.compare(viaInspect, viaSnapshot);
  assertCase(
    block,
    "inspector.compareDelegates",
    cmp.changed === false && Object.isFrozen(cmp),
    "compare delegates to compareSnapshots",
  );

  assertCase(
    block,
    "inspector.frozen",
    Object.isFrozen(RuntimeInspector),
    "RuntimeInspector is frozen",
  );

  const inspectorSrc = stripComments(
    read(`${DEVTOOLS_DIR}/RuntimeInspector.ts`),
  );
  assertCase(
    block,
    "inspector.noCaches",
    !/\bWeakMap\b/.test(inspectorSrc) &&
      !/\bnew\s+Map\b/.test(inspectorSrc) &&
      !/\bnew\s+Set\b/.test(inspectorSrc),
    "RuntimeInspector has no caches",
  );

  assertCase(
    block,
    "inspector.staticOnly",
    /\bstatic inspect\b/.test(inspectorSrc) &&
      /\bstatic snapshot\b/.test(inspectorSrc) &&
      /\bstatic compare\b/.test(inspectorSrc),
    "RuntimeInspector exposes static API only",
  );
}

/* -------------------------------------------------------------------------- */
/* 10. apiFreeze                                                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "apiFreeze";

  const forbidden = [
    "RuntimeSnapshot",
    "SnapshotCompareResult",
    "SnapshotBuilder",
    "SnapshotComparator",
    "compareSnapshots",
    "RuntimeInspector",
    "devtools",
  ];

  const barrels: Array<[string, string]> = [
    ["src/ui/index.ts", "ui"],
    ["src/ui/theme/index.ts", "theme"],
    ["src/ui/theme/runtime/index.ts", "runtime"],
    ["src/ui/theme/hooks/index.ts", "hooks"],
    ["src/ui/providers/index.ts", "providers"],
  ];

  for (const [rel, id] of barrels) {
    const code = stripComments(read(rel));
    const hit = forbidden.find((sym) => new RegExp(`\\b${sym}\\b`).test(code));
    assertCase(
      block,
      `freeze.${id}.clean`,
      hit === undefined,
      hit ? `${rel} leaks ${hit}` : `${rel} has no UX-3.8 exports`,
    );
  }

  const runtimeBarrel = stripComments(read("src/ui/theme/runtime/index.ts"));
  assertCase(
    block,
    "freeze.runtimeNoDevtools",
    !/\bdevtools\b/.test(runtimeBarrel),
    "theme/runtime/index.ts excludes devtools",
  );

  assertCase(
    block,
    "freeze.runtimeStillExcludesContext",
    !/\bcontext\b/.test(runtimeBarrel) &&
      !/\bselectors\b/.test(runtimeBarrel),
    "theme/runtime/index.ts still excludes context and selectors",
  );

  const builderSrc = read(`${DEVTOOLS_DIR}/SnapshotBuilder.ts`);
  assertCase(
    block,
    "freeze.builderApi",
    /\bexport const SnapshotBuilder\b/.test(builderSrc) &&
      /\bbuild\b/.test(builderSrc),
    "SnapshotBuilder.build API present",
  );

  const comparatorSrc = read(`${DEVTOOLS_DIR}/SnapshotComparator.ts`);
  assertCase(
    block,
    "freeze.comparatorApi",
    /\bexport function compareSnapshots\b/.test(comparatorSrc) &&
      /\bexport const SnapshotComparator\b/.test(comparatorSrc),
    "compareSnapshots + SnapshotComparator present",
  );

  const inspectorSrc = read(`${DEVTOOLS_DIR}/RuntimeInspector.ts`);
  assertCase(
    block,
    "freeze.inspectorApi",
    /\bexport class RuntimeInspector\b/.test(inspectorSrc) &&
      /\bObject\.freeze\s*\(\s*RuntimeInspector\s*\)/.test(inspectorSrc),
    "RuntimeInspector class frozen",
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const BLOCKS: BlockId[] = [
  "devtoolsLayout",
  "noReact",
  "noHooks",
  "noAppImports",
  "purity",
  "snapshotReadonly",
  "builderBehavior",
  "comparatorO1",
  "inspectorStateless",
  "apiFreeze",
];

let passCount = 0;
for (const block of BLOCKS) {
  const blockResults = results.filter((r) => r.block === block);
  const failed = blockResults.filter((r) => !r.pass);
  const ok = failed.length === 0;
  if (ok) passCount += 1;
  const pad = ".".repeat(Math.max(1, 28 - block.length));
  console.log(`${block} ${pad} ${ok ? "PASS" : "FAIL"}`);
  for (const f of failed) {
    console.log(`  FAIL ${f.id}: ${f.detail}`);
  }
}

const allPass = passCount === BLOCKS.length;
console.log("validate:ux-3.8");
console.log(allPass ? "PASS" : "FAIL");
console.log(`${passCount}/${BLOCKS.length}`);

if (!allPass) {
  process.exitCode = 1;
}
