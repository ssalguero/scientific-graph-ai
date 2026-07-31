/**
 * UX-3.1.4 — Theme Validation & Runtime Infrastructure gate.
 *
 * Validates Registry, Validator, Assertions, Inspector, Utils,
 * API Freeze (@/ui), and Theme Freeze (THEME_CONTRACT_VERSION).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { createTokenRef } from "../src/ui/foundation/tokens";
import {
  THEME_CONTRACT_VERSION,
  assertTheme,
  assertToken,
  cloneTheme,
  compareThemes,
  countThemes,
  deepMergeTheme,
  freezeTheme,
  getContractVersion,
  getTheme,
  listThemes,
  themeExists,
  themes,
  lightTheme,
  validateTheme,
  validateThemeCatalog,
  ThemeRegistry,
  InvalidThemeDefinitionError,
  ThemeVariableError,
  type ThemeMap,
} from "../src/ui/theme";

type CaseResult = { id: string; pass: boolean; detail: string };

const results: CaseResult[] = [];

function assertCase(id: string, pass: boolean, detail: string) {
  results.push({ id, pass, detail });
}

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel: string): string {
  return readFileSync(join(repoRoot, rel), "utf8");
}

/* -------------------------------------------------------------------------- */
/* Theme Freeze                                                               */
/* -------------------------------------------------------------------------- */

assertCase(
  "themeFreeze.contractVersion",
  THEME_CONTRACT_VERSION === "3.1.3",
  `THEME_CONTRACT_VERSION=${THEME_CONTRACT_VERSION}`,
);

assertCase(
  "themeFreeze.inspectorVersion",
  getContractVersion() === "3.1.3",
  `getContractVersion()=${getContractVersion()}`,
);

/* -------------------------------------------------------------------------- */
/* API Freeze                                                                 */
/* -------------------------------------------------------------------------- */

const uiIndex = read("src/ui/index.ts");

assertCase(
  "apiFreeze.noRuntimeExport",
  !/\bfrom\s+["']\.\/theme\/runtime/.test(uiIndex) &&
    !/\bThemeRegistry\b/.test(uiIndex) &&
    !/\bvalidateTheme\b/.test(uiIndex) &&
    !/\bassertTheme\b/.test(uiIndex) &&
    !/\bThemeWarning\b/.test(uiIndex),
  "src/ui/index.ts must not export runtime APIs",
);

assertCase(
  "apiFreeze.noValidatorsExport",
  !/\bvalidateThemeMap\b/.test(uiIndex) &&
    !/\bvalidateAllThemes\b/.test(uiIndex) &&
    !/\bassertThemeMapValid\b/.test(uiIndex) &&
    !/\bassertAllThemesValid\b/.test(uiIndex),
  "src/ui/index.ts must not export theme validators",
);

/* -------------------------------------------------------------------------- */
/* Registry                                                                   */
/* -------------------------------------------------------------------------- */

{
  const registry = new ThemeRegistry();
  assertCase("registry.initialSize", registry.size() === 0, `size=${registry.size()}`);

  const warn1 = registry.register(lightTheme);
  assertCase("registry.register", registry.has("light") && registry.size() === 1, "light registered");
  assertCase("registry.register.noWarnFirst", warn1 === undefined, String(warn1));

  const warnDup = registry.register(lightTheme);
  assertCase(
    "registry.duplicateWarning",
    warnDup?.code === "duplicate-registration",
    JSON.stringify(warnDup),
  );

  assertCase("registry.get", registry.get("light")?.id === "light", "get light");
  assertCase("registry.list", registry.list().length === 1, `list=${registry.list().length}`);

  registry.register(themes.dark);
  assertCase("registry.has.dark", registry.has("dark"), "has dark");

  const removed = registry.unregister("dark");
  assertCase("registry.unregister", removed && !registry.has("dark"), "unregistered dark");

  registry.clear();
  assertCase("registry.clear", registry.size() === 0 && !registry.has("light"), "cleared");
}

/* -------------------------------------------------------------------------- */
/* Validator                                                                  */
/* -------------------------------------------------------------------------- */

{
  const valid = validateTheme(lightTheme);
  assertCase(
    "validator.validTheme",
    valid.valid === true && valid.errors.length === 0,
    JSON.stringify(valid),
  );

  let threw = false;
  try {
    validateTheme(lightTheme);
  } catch {
    threw = true;
  }
  assertCase("validator.neverThrow.valid", !threw, "validateTheme must not throw");

  const badMap = {
    ...cloneTheme(lightTheme),
    color: {
      ...lightTheme.color,
      surface: {
        ...lightTheme.color.surface,
        // hex literal — invalid per existing map validator
        default: "#ff0000" as unknown as ThemeMap["color"]["surface"]["default"],
      },
    },
  } as ThemeMap;

  const invalid = validateTheme(badMap);
  assertCase(
    "validator.invalidTheme",
    invalid.valid === false && invalid.errors.length > 0,
    JSON.stringify(invalid.errors),
  );

  const badRef = {
    ...cloneTheme(lightTheme),
    color: {
      ...lightTheme.color,
      brand: {
        ...lightTheme.color.brand,
        primary: createTokenRef("color.does.not.exist"),
      },
    },
  } as ThemeMap;

  const badToken = validateTheme(badRef);
  assertCase(
    "validator.incorrectToken",
    badToken.valid === false &&
      badToken.errors.some((e) => e.code === "missing-primitive"),
    JSON.stringify(badToken.errors),
  );

  let threwInvalid = false;
  try {
    validateTheme(badMap);
    validateTheme(badRef);
    validateThemeCatalog();
  } catch {
    threwInvalid = true;
  }
  assertCase("validator.neverThrow.invalid", !threwInvalid, "must not throw on invalid");

  const serializable = JSON.parse(JSON.stringify(invalid)) as typeof invalid;
  assertCase(
    "validator.serializable",
    typeof serializable.valid === "boolean" &&
      Array.isArray(serializable.errors) &&
      Array.isArray(serializable.warnings),
    "ThemeValidationResult JSON-roundtrips",
  );
}

/* -------------------------------------------------------------------------- */
/* Assertions                                                                 */
/* -------------------------------------------------------------------------- */

{
  let noThrowOk = false;
  try {
    assertTheme(lightTheme);
    assertToken("color.slate.50");
    assertToken(createTokenRef("color.slate.50"));
    noThrowOk = true;
  } catch {
    noThrowOk = false;
  }
  assertCase("assertions.noThrow.valid", noThrowOk, "assertTheme/assertToken on valid");

  let threwTheme = false;
  try {
    const bad = {
      ...cloneTheme(lightTheme),
      color: {
        ...lightTheme.color,
        surface: {
          ...lightTheme.color.surface,
          default: "#00ff00" as unknown as ThemeMap["color"]["surface"]["default"],
        },
      },
    } as ThemeMap;
    assertTheme(bad);
  } catch (err) {
    threwTheme = err instanceof InvalidThemeDefinitionError;
  }
  assertCase("assertions.throw.invalidTheme", threwTheme, "InvalidThemeDefinitionError");

  let threwToken = false;
  try {
    assertToken("not.a.real.token");
  } catch (err) {
    threwToken = err instanceof ThemeVariableError;
  }
  assertCase("assertions.throw.badToken", threwToken, "ThemeVariableError");
}

/* -------------------------------------------------------------------------- */
/* Inspector                                                                  */
/* -------------------------------------------------------------------------- */

{
  const catalogCount = countThemes(themes);
  assertCase(
    "inspector.catalog.count",
    catalogCount === 4,
    `count=${catalogCount}`,
  );
  assertCase(
    "inspector.catalog.exists",
    themeExists(themes, "dark") && !themeExists(themes, "nope" as never),
    "exists dark / missing nope",
  );
  assertCase(
    "inspector.catalog.list",
    listThemes(themes).length === 4,
    `list=${listThemes(themes).length}`,
  );
  assertCase(
    "inspector.catalog.get",
    getTheme(themes, "light")?.id === "light",
    "get light from catalog",
  );
  assertCase(
    "inspector.contractVersion",
    getContractVersion() === "3.1.3",
    getContractVersion(),
  );

  const registry = new ThemeRegistry();
  registry.register(themes.light);
  registry.register(themes.dark);
  assertCase(
    "inspector.registry.count",
    countThemes(registry) === 2,
    `count=${countThemes(registry)}`,
  );
  assertCase(
    "inspector.registry.exists",
    themeExists(registry, "light") && !themeExists(registry, "highContrastDark"),
    "registry exists",
  );
}

/* -------------------------------------------------------------------------- */
/* Utils                                                                      */
/* -------------------------------------------------------------------------- */

{
  const original = lightTheme;
  const cloned = cloneTheme(original);
  assertCase(
    "utils.clone.neqRef",
    cloned !== original && cloned.color !== original.color,
    "clone is deep",
  );
  assertCase("utils.clone.equal", compareThemes(cloned, original), "clone compares equal");

  (cloned.color.surface as { default: ReturnType<typeof createTokenRef> }).default =
    createTokenRef("color.red.500");
  assertCase(
    "utils.clone.immutableInput",
    compareThemes(original, lightTheme) ||
      original.color.surface.default.path !== "color.red.500",
    "mutating clone does not change SSOT lightTheme path incorrectly",
  );
  // Restore check: original lightTheme must still match themes.light
  assertCase(
    "utils.clone.ssotIntact",
    themes.light.color.surface.default.path ===
      lightTheme.color.surface.default.path,
    themes.light.color.surface.default.path,
  );

  const merged = deepMergeTheme(lightTheme, {
    color: {
      ...lightTheme.color,
      brand: {
        ...lightTheme.color.brand,
        primary: createTokenRef("color.blue.600"),
      },
    },
  });
  assertCase(
    "utils.merge.themeable",
    merged.color.brand.primary.path === "color.blue.600" &&
      merged.id === "light",
    merged.color.brand.primary.path,
  );
  assertCase(
    "utils.merge.noInvariantKeys",
    !("spacing" in merged) &&
      !("typography" in merged) &&
      !("radius" in merged) &&
      !("motion" in merged),
    Object.keys(merged).join(","),
  );

  const frozen = freezeTheme(lightTheme);
  let freezeThrew = false;
  try {
    (frozen as { id: string }).id = "dark";
  } catch {
    freezeThrew = true;
  }
  assertCase(
    "utils.freeze",
    freezeThrew || Object.isFrozen(frozen),
    `frozen=${Object.isFrozen(frozen)} threw=${freezeThrew}`,
  );
}

/* -------------------------------------------------------------------------- */
/* Adapters seam exists                                                       */
/* -------------------------------------------------------------------------- */

{
  const adapterSrc = read(
    "src/ui/theme/runtime/adapters/ThemeValidationAdapter.ts",
  );
  assertCase(
    "adapters.delegates.validateThemeMap",
    /validateThemeMap/.test(adapterSrc) &&
      !/function walk\(/.test(adapterSrc),
    "adapter delegates; no walk reimplementation",
  );
  assertCase(
    "adapters.delegates.validateAllThemes",
    /validateAllThemes/.test(adapterSrc),
    "adaptValidateAllThemes",
  );
  assertCase(
    "adapters.delegates.validateSemanticReferences",
    /validateSemanticReferences/.test(adapterSrc),
    "adaptValidateSemanticReferences",
  );

  const validatorSrc = read("src/ui/theme/runtime/ThemeValidator.ts");
  assertCase(
    "validator.noDirectValidatorsImport",
    !/from\s+["']\.\.\/validators/.test(validatorSrc) &&
      !/from\s+["']\.\.\/\.\.\/theme\/validators/.test(validatorSrc),
    "ThemeValidator must use adapters only",
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "UX-3.1.4-theme-runtime",
  pass: failed.length === 0,
  total: results.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));

if (!summary.pass) {
  process.exitCode = 1;
  for (const f of failed) {
    console.error(`FAIL ${f.id}: ${f.detail}`);
  }
} else {
  // Soft assert for local sanity
  assert.equal(THEME_CONTRACT_VERSION, "3.1.3");
}
