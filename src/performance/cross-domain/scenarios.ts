/**
 * PERFORMANCE-I6 — Authoritative cross-domain scenario catalog.
 *
 * Only scenarios backed by actual I2 public seams are executable.
 * No invented product workflows.
 */

import type { CrossDomainScenarioDefinition } from "./types";

/** P4 principal shape: UX → ENGINE → DATA (read-only public surface observation). */
export const PRIMARY_CROSS_DOMAIN_SCENARIO: CrossDomainScenarioDefinition = {
  scenarioId: "ux-engine-data",
  label:
    "P4 primary cross-domain observation — UX → ENGINE → DATA (fixture; not product orchestration)",
  kind: "fixture",
  domainSequence: ["ux", "engine", "data"],
};

export const CROSS_DOMAIN_SCENARIO_CATALOG: readonly CrossDomainScenarioDefinition[] =
  [PRIMARY_CROSS_DOMAIN_SCENARIO];

export function getCrossDomainScenario(
  scenarioId: string,
): CrossDomainScenarioDefinition | undefined {
  return CROSS_DOMAIN_SCENARIO_CATALOG.find((s) => s.scenarioId === scenarioId);
}

export function listCrossDomainScenarios(): readonly CrossDomainScenarioDefinition[] {
  return CROSS_DOMAIN_SCENARIO_CATALOG;
}
