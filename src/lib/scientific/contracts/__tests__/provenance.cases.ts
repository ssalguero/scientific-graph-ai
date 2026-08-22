import {
  composeScientificProvenance,
  type ComposeScientificProvenanceInput,
  type ScientificProvenanceValue,
} from "../provenance";
import { describeLiveDerivedResult } from "../artifacts";
import type { ContractFoundationAssertCase } from "./run-assertions";

export const runProvenanceCases = (
  assertCase: ContractFoundationAssertCase
): void => {
  const configValues: Record<string, ScientificProvenanceValue> = {
    alpha: 0.05,
    selection: { standardize: true, variables: ["a", "b"] },
  };
  const input: ComposeScientificProvenanceInput = {
    dataset: {
      id: "dataset-1",
      label: "Ensayo",
      checksum: "sha256:example",
    },
    source: { kind: "worksheet", id: "worksheet-1" },
    series: [
      { id: "a", label: "A", role: "input" },
      { id: "b", label: "B", role: "response" },
    ],
    config: { id: "config-1", values: configValues },
    method: {
      id: "welch-t",
      label: "Welch t test",
      version: "1",
      parameters: { tails: 2 },
    },
    approximation: {
      kind: "numerical",
      details: "CDF evaluated numerically.",
    },
    warnings: [
      {
        code: "SMALL_SAMPLE",
        message: "Interpret with caution.",
        severity: "warning",
      },
    ],
  };

  const first = composeScientificProvenance(input);
  const second = composeScientificProvenance(input);

  assertCase(
    "provenance.schema",
    first.schema === "scientific-provenance/v1"
  );
  assertCase(
    "provenance.includes-all-facets",
    first.dataset.id === "dataset-1" &&
      first.source.kind === "worksheet" &&
      first.series.length === 2 &&
      first.config.id === "config-1" &&
      first.method.id === "welch-t" &&
      first.approximation.kind === "numerical" &&
      first.warnings.length === 1
  );
  assertCase(
    "provenance.deterministic",
    JSON.stringify(first) === JSON.stringify(second)
  );
  assertCase(
    "provenance.copies-top-level-inputs",
    first.dataset !== input.dataset &&
      first.source !== input.source &&
      first.series !== input.series &&
      first.config.values !== input.config.values &&
      first.method.parameters !== input.method.parameters &&
      first.warnings !== input.warnings
  );

  const copiedSelection = first.config.values.selection;
  const inputSelection = input.config.values.selection;
  assertCase(
    "provenance.deep-copies-config-values",
    typeof copiedSelection === "object" &&
      copiedSelection !== null &&
      copiedSelection !== inputSelection
  );
  assertCase(
    "provenance.no-implicit-time-or-id",
    !("createdAt" in first) && !("resultId" in first)
  );

  const liveResult = describeLiveDerivedResult({
    resultContractId: "inference.t-test",
    provenance: first,
  });
  assertCase(
    "live-result.binds-contract-and-provenance",
    liveResult.identity.lifecycle === "ephemeral" &&
      liveResult.identity.citable === false &&
      liveResult.resultContractId === "inference.t-test" &&
      liveResult.provenance === first
  );
};
