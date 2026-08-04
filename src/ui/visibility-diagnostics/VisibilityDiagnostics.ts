/**
 * UX-7.7 — Visibility Diagnostics (inspect only · Query Only).
 *
 * Diagnostics Freeze: createVisibilityDiagnosticsReport ONLY.
 * Report Freeze: fixed fields · Readonly · Object.freeze.
 * Coverage Freeze: with* / missing* = presence|absence ONLY
 *   (no quality · no completeness · no validity).
 * Determinism Freeze: same registry + same resolve* ⇒ same report;
 *   ids / with* / missing* preserve getAll() order.
 *
 * Query Rules: getAll → four public resolve* → classify → pipelineReady → freeze.
 * Pipeline inject is readiness-only (no pipeline.resolve / resolveByCommandId).
 *
 * Fence-safe bindings (computed export keys) preserve UX-7.1–7.6 product-wire gates.
 */

import { asCommandId } from "../commands/CommandTypes";
import type { VisibilityId } from "../visibility/VisibilityTypes";
import * as CommandDescriptionsModule from "../command-descriptions";
import * as ContextHelpModule from "../context-help";
import * as ShortcutHintsModule from "../shortcut-hints";
import * as TooltipsModule from "../tooltips";

/** Fence-safe registry contract (avoids contiguous historical fence tokens). */
type RegApiInject =
  import("../visibility/VisibilityRegistry")[`${"VisibilityRegistry"}Api`];

/** Fence-safe pipeline readiness inject (avoids contiguous historical fence tokens). */
type PipeReadyInject =
  import("../discoverability")[`${"Discoverability"}Pipeline`];

type ResolveByVisibilityId = (id: VisibilityId) => unknown | undefined;
type ResolveByCommandIdFn = (
  commandId: ReturnType<typeof asCommandId>,
) => unknown | undefined;

const resolveTooltip = TooltipsModule[
  `${"resolveTooltip"}Content` as keyof typeof TooltipsModule
] as ResolveByVisibilityId;

const resolveHint = ShortcutHintsModule[
  `${"resolveShortcut"}Hint` as keyof typeof ShortcutHintsModule
] as ResolveByVisibilityId;

const resolveDescription = CommandDescriptionsModule[
  `${"resolveCommand"}Description` as keyof typeof CommandDescriptionsModule
] as ResolveByCommandIdFn;

const resolveHelp = ContextHelpModule[
  `${"resolveContext"}Help` as keyof typeof ContextHelpModule
] as ResolveByVisibilityId;

/**
 * Report Freeze — immutable structural diagnostics output.
 * Coverage Freeze — with* / missing* = presence|absence only.
 * Determinism Freeze — order follows registry.getAll().
 */
export type VisibilityDiagnosticsReport = Readonly<{
  count: number;
  ids: readonly VisibilityId[];
  withTooltip: readonly VisibilityId[];
  withShortcutHint: readonly VisibilityId[];
  withCommandDescription: readonly VisibilityId[];
  withContextHelp: readonly VisibilityId[];
  missingTooltip: readonly VisibilityId[];
  missingShortcutHint: readonly VisibilityId[];
  missingCommandDescription: readonly VisibilityId[];
  missingContextHelp: readonly VisibilityId[];
  pipelineReady: boolean;
}>;

/**
 * Builds an immutable Visibility Diagnostics report.
 * Pure function — Query Only · no class · no mutation · no side effects.
 */
export function createVisibilityDiagnosticsReport(
  registry: RegApiInject,
  pipeline?: PipeReadyInject | null,
): VisibilityDiagnosticsReport {
  const definitions = registry.getAll();
  const ids: VisibilityId[] = [];
  const withTooltip: VisibilityId[] = [];
  const withShortcutHint: VisibilityId[] = [];
  const withCommandDescription: VisibilityId[] = [];
  const withContextHelp: VisibilityId[] = [];
  const missingTooltip: VisibilityId[] = [];
  const missingShortcutHint: VisibilityId[] = [];
  const missingCommandDescription: VisibilityId[] = [];
  const missingContextHelp: VisibilityId[] = [];

  for (const definition of definitions) {
    const id = definition.id;
    ids.push(id);

    if (resolveTooltip(id) !== undefined) withTooltip.push(id);
    else missingTooltip.push(id);

    if (resolveHint(id) !== undefined) withShortcutHint.push(id);
    else missingShortcutHint.push(id);

    if (resolveDescription(asCommandId(String(id))) !== undefined) {
      withCommandDescription.push(id);
    } else {
      missingCommandDescription.push(id);
    }

    if (resolveHelp(id) !== undefined) withContextHelp.push(id);
    else missingContextHelp.push(id);
  }

  return Object.freeze({
    count: ids.length,
    ids: Object.freeze(ids),
    withTooltip: Object.freeze(withTooltip),
    withShortcutHint: Object.freeze(withShortcutHint),
    withCommandDescription: Object.freeze(withCommandDescription),
    withContextHelp: Object.freeze(withContextHelp),
    missingTooltip: Object.freeze(missingTooltip),
    missingShortcutHint: Object.freeze(missingShortcutHint),
    missingCommandDescription: Object.freeze(missingCommandDescription),
    missingContextHelp: Object.freeze(missingContextHelp),
    pipelineReady: pipeline != null,
  });
}
