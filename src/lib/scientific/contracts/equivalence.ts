import { isCitableScientificSnapshot, type CitableScientificSnapshot } from "./citable-snapshot";
import { canonicalizeScientificValue, toScientificValue } from "./semantic-values";

export type ScientificArtifactEquivalenceState =
  "IDENTICAL" | "EQUIVALENT" | "NON_EQUIVALENT" | "UNKNOWN";

export type ScientificArtifactEquivalenceAssessment = {
  state: ScientificArtifactEquivalenceState;
  reasons: readonly string[];
  divergentFacets: readonly string[];
};

const canonical = (value: unknown): string => canonicalizeScientificValue(toScientificValue(value));

const datasetEquivalenceIdentity = (snapshot: CitableScientificSnapshot): string =>
  snapshot.provenance.dataset.checksum ?? snapshot.provenance.dataset.id;

const equivalenceSource = (snapshot: CitableScientificSnapshot): unknown => ({
  ...snapshot.provenance.source,
  ...(snapshot.resultContractId === "sci-58.comparison" ? { id: undefined, label: undefined } : {}),
});

const equivalenceMethod = (snapshot: CitableScientificSnapshot): unknown => {
  if (snapshot.resultContractId !== "sci-58.comparison") {
    return snapshot.provenance.method;
  }
  const parameters = { ...snapshot.provenance.method.parameters };
  delete parameters.slotLabel;
  return {
    ...snapshot.provenance.method,
    parameters,
  };
};

const comparableScientificState = (snapshot: CitableScientificSnapshot): unknown => ({
  resultContractId: snapshot.resultContractId,
  artifactKind: snapshot.artifactKind,
  source: {
    dataset: datasetEquivalenceIdentity(snapshot),
    source: equivalenceSource(snapshot),
    series: [...snapshot.provenance.series].sort((left, right) =>
      `${left.role ?? ""}:${left.id}`.localeCompare(`${right.role ?? ""}:${right.id}`),
    ),
  },
  config: snapshot.provenance.config,
  method: equivalenceMethod(snapshot),
  approximation: snapshot.provenance.approximation,
  warnings: snapshot.warnings,
  limitations: snapshot.limitations,
  semanticValues: snapshot.semanticValues
    .filter((value) => value.equivalencePolicy !== "non-comparable")
    .sort((left, right) => left.field.localeCompare(right.field)),
});

const hasInsufficientSemanticState = (snapshot: CitableScientificSnapshot): boolean =>
  snapshot.semanticValues.some(
    (value) =>
      value.equivalencePolicy !== "non-comparable" &&
      (value.status === "unknown" || value.status === "unsupported"),
  );

export const assessScientificArtifactEquivalence = (
  left: CitableScientificSnapshot | unknown,
  right: CitableScientificSnapshot | unknown,
): ScientificArtifactEquivalenceAssessment => {
  if (!isCitableScientificSnapshot(left) || !isCitableScientificSnapshot(right)) {
    return {
      state: "UNKNOWN",
      reasons: ["Al menos un artefacto no cumple scientific-snapshot/v1."],
      divergentFacets: ["snapshot-contract"],
    };
  }

  if (left.resultContractId !== right.resultContractId) {
    return {
      state: "NON_EQUIVALENT",
      reasons: ["Los artefactos proceden de contratos científicos distintos."],
      divergentFacets: ["result-contract"],
    };
  }

  const leftState = comparableScientificState(left);
  const rightState = comparableScientificState(right);
  const stateMatches = canonical(leftState) === canonical(rightState);

  if (left.identity.snapshotId === right.identity.snapshotId) {
    return canonical(left) === canonical(right)
      ? {
          state: "IDENTICAL",
          reasons: ["Ambas referencias señalan el mismo snapshot inmutable."],
          divergentFacets: [],
        }
      : {
          state: "NON_EQUIVALENT",
          reasons: [
            "El mismo snapshotId presenta contenido divergente; la inmutabilidad fue violada.",
          ],
          divergentFacets: ["immutable-content"],
        };
  }

  if (hasInsufficientSemanticState(left) || hasInsufficientSemanticState(right)) {
    return {
      state: "UNKNOWN",
      reasons: [
        "La equivalencia no puede establecerse porque existen valores desconocidos, no soportados o no comparables.",
      ],
      divergentFacets: ["semantic-values"],
    };
  }

  if (stateMatches) {
    return {
      state: "EQUIVALENT",
      reasons: [
        "Los snapshots tienen identidades distintas y el mismo estado científico comparable.",
      ],
      divergentFacets: [],
    };
  }

  const divergentFacets: string[] = [];
  if (datasetEquivalenceIdentity(left) !== datasetEquivalenceIdentity(right)) {
    divergentFacets.push("source");
  }
  if (canonical(left.provenance.config) !== canonical(right.provenance.config)) {
    divergentFacets.push("configuration");
  }
  if (canonical(left.provenance.method) !== canonical(right.provenance.method)) {
    divergentFacets.push("method");
  }
  if (canonical(left.semanticValues) !== canonical(right.semanticValues)) {
    divergentFacets.push("scientific-payload");
  }
  if (canonical(left.provenance.approximation) !== canonical(right.provenance.approximation)) {
    divergentFacets.push("approximation");
  }
  if (canonical(left.warnings) !== canonical(right.warnings)) {
    divergentFacets.push("warnings");
  }

  return {
    state: "NON_EQUIVALENT",
    reasons: ["El estado científico comparable difiere."],
    divergentFacets: divergentFacets.length > 0 ? divergentFacets : ["provenance"],
  };
};
