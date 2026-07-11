import { PUBLICATION_PRESET_CATALOG } from "../catalog";
import {
  mapLineStyleToStrokeDasharray,
  normalizePublicationPresetId,
  resolveGraphRenderStyle,
  resolvePublicationPreset,
} from "../resolve";
import {
  DEFAULT_CHART_RENDER_TOKENS,
  JOURNAL_CHART_RENDER_TOKENS,
  PRESENTATION_CHART_RENDER_TOKENS,
} from "../tokens";
import { CHART_RENDER_TOKEN_KEYS, PUBLICATION_PRESET_IDS } from "../types";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

const tokensEqual = (
  a: ReturnType<typeof resolvePublicationPreset>,
  b: ReturnType<typeof resolvePublicationPreset>
) => JSON.stringify(a) === JSON.stringify(b);

const collectTopLevelKeys = (tokens: Record<string, unknown>) =>
  Object.keys(tokens).sort();

export const runPublicationPresetsCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  assertCase(
    "preset.resolve.default",
    resolvePublicationPreset("default").aspectRatio === 1.8 &&
      resolvePublicationPreset("default").series.strokeWidth === 2
  );

  assertCase(
    "preset.resolve.default.null",
    tokensEqual(resolvePublicationPreset(null), resolvePublicationPreset("default"))
  );

  assertCase(
    "preset.resolve.default.undefined",
    tokensEqual(
      resolvePublicationPreset(undefined),
      resolvePublicationPreset("default")
    )
  );

  assertCase(
    "preset.resolve.journal",
    resolvePublicationPreset("journal").background === "#ffffff" &&
      resolvePublicationPreset("journal").axis.tickFontSize === 9
  );

  assertCase(
    "preset.resolve.presentation",
    resolvePublicationPreset("presentation").aspectRatio === 2.0 &&
      resolvePublicationPreset("presentation").series.strokeWidth === 3
  );

  assertCase(
    "preset.resolve.unknown",
    tokensEqual(
      resolvePublicationPreset("invalid-preset"),
      resolvePublicationPreset("default")
    )
  );

  const deterministicA = resolvePublicationPreset("journal");
  const deterministicB = resolvePublicationPreset("journal");
  assertCase(
    "preset.determinism",
    tokensEqual(deterministicA, deterministicB)
  );

  assertCase("preset.catalog.count", PUBLICATION_PRESET_CATALOG.length === 3);

  assertCase(
    "preset.catalog.ids",
    PUBLICATION_PRESET_CATALOG.every((entry) =>
      (PUBLICATION_PRESET_IDS as readonly string[]).includes(entry.id)
    )
  );

  const merged = resolveGraphRenderStyle({
    publicationPresetId: "journal",
    color: "#ff0000",
  });
  assertCase(
    "preset.merge.color",
    merged.series.defaultColor === "#ff0000" &&
      merged.axis.tickFontSize === JOURNAL_CHART_RENDER_TOKENS.axis.tickFontSize
  );

  assertCase(
    "preset.merge.color.preserveOther",
    merged.background === JOURNAL_CHART_RENDER_TOKENS.background &&
      merged.series.strokeWidth === JOURNAL_CHART_RENDER_TOKENS.series.strokeWidth
  );

  assertCase(
    "preset.merge.noColor",
    resolveGraphRenderStyle({ publicationPresetId: "presentation" }).series
      .defaultColor === PRESENTATION_CHART_RENDER_TOKENS.series.defaultColor
  );

  assertCase(
    "preset.tokens.shape.frozen",
    collectTopLevelKeys(
      resolvePublicationPreset("default") as unknown as Record<string, unknown>
    ).join(",") === [...CHART_RENDER_TOKEN_KEYS].sort().join(",")
  );

  assertCase(
    "preset.tokens.journal.diff.default",
    JSON.stringify(resolvePublicationPreset("journal")) !==
      JSON.stringify(resolvePublicationPreset("default"))
  );

  assertCase(
    "preset.tokens.presentation.diff.default",
    JSON.stringify(resolvePublicationPreset("presentation")) !==
      JSON.stringify(resolvePublicationPreset("default"))
  );

  assertCase(
    "preset.tokens.presentation.diff.journal",
    JSON.stringify(resolvePublicationPreset("presentation")) !==
      JSON.stringify(resolvePublicationPreset("journal"))
  );

  assertCase(
    "preset.normalize.valid",
    normalizePublicationPresetId("journal") === "journal"
  );

  assertCase(
    "preset.normalize.invalid",
    normalizePublicationPresetId("unknown") === "default"
  );

  assertCase(
    "preset.lineStyle.solid",
    mapLineStyleToStrokeDasharray("solid") === undefined
  );

  assertCase(
    "preset.lineStyle.dashed",
    mapLineStyleToStrokeDasharray("dashed") === "8 4"
  );

  assertCase(
    "preset.lineStyle.dotted",
    mapLineStyleToStrokeDasharray("dotted") === "4 4"
  );

  const resolved = resolvePublicationPreset("default");
  resolved.series.defaultColor = "#000000";
  assertCase(
    "preset.clone.immutable",
    resolvePublicationPreset("default").series.defaultColor ===
      DEFAULT_CHART_RENDER_TOKENS.series.defaultColor
  );

  return results;
};
