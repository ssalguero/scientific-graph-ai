import type { CitableScientificSnapshot } from "./citable-snapshot";
import { isCitableScientificSnapshot } from "./citable-snapshot";
import type { ScientificProvenanceDescriptor } from "./provenance";
import type { ScientificResultContractId } from "./result-inventory";
import { canonicalizeScientificValue, toScientificValue } from "./semantic-values";

export type ScientificFreshnessState = "CURRENT" | "STALE" | "INVALID" | "UNKNOWN";

export type ScientificFreshnessReasonCode =
  | "SNAPSHOT_INVALID"
  | "SOURCE_UNAVAILABLE"
  | "CURRENT_CONTEXT_UNAVAILABLE"
  | "RESULT_CONTRACT_CHANGED"
  | "SOURCE_CHANGED"
  | "SERIES_CHANGED"
  | "CONFIGURATION_CHANGED"
  | "METHOD_CHANGED"
  | "APPROXIMATION_CHANGED"
  | "SOURCE_IDENTITY_INSUFFICIENT"
  | "CURRENT_CONTEXT_MATCHES";

export type ScientificFreshnessReason = {
  code: ScientificFreshnessReasonCode;
  message: string;
};

export type ScientificFreshnessAssessment = {
  state: ScientificFreshnessState;
  recomputable: boolean | "unknown";
  reasons: readonly ScientificFreshnessReason[];
};

export type AssessScientificSnapshotFreshnessInput = {
  snapshot: CitableScientificSnapshot | unknown;
  currentResultContractId?: ScientificResultContractId | null;
  currentProvenance?: ScientificProvenanceDescriptor | null;
  sourceAvailable?: boolean | "unknown";
};

const equalValue = (left: unknown, right: unknown): boolean =>
  canonicalizeScientificValue(toScientificValue(left)) ===
  canonicalizeScientificValue(toScientificValue(right));

const stale = (
  code: ScientificFreshnessReasonCode,
  message: string,
): ScientificFreshnessAssessment => ({
  state: "STALE",
  recomputable: true,
  reasons: [{ code, message }],
});

export const assessScientificSnapshotFreshness = (
  input: AssessScientificSnapshotFreshnessInput,
): ScientificFreshnessAssessment => {
  if (!isCitableScientificSnapshot(input.snapshot)) {
    return {
      state: "INVALID",
      recomputable: "unknown",
      reasons: [
        {
          code: "SNAPSHOT_INVALID",
          message: "El snapshot no cumple scientific-snapshot/v1.",
        },
      ],
    };
  }

  if (input.sourceAvailable === false) {
    return {
      state: "INVALID",
      recomputable: false,
      reasons: [
        {
          code: "SOURCE_UNAVAILABLE",
          message: "La fuente necesaria para recomputar ya no está disponible.",
        },
      ],
    };
  }

  if (
    input.currentResultContractId &&
    input.currentResultContractId !== input.snapshot.resultContractId
  ) {
    return {
      state: "INVALID",
      recomputable: "unknown",
      reasons: [
        {
          code: "RESULT_CONTRACT_CHANGED",
          message: "El contrato de resultado actual no coincide con el capturado.",
        },
      ],
    };
  }

  const current = input.currentProvenance;
  if (!current || input.sourceAvailable === "unknown") {
    return {
      state: "UNKNOWN",
      recomputable: "unknown",
      reasons: [
        {
          code: "CURRENT_CONTEXT_UNAVAILABLE",
          message: "No hay contexto actual suficiente para evaluar la vigencia del snapshot.",
        },
      ],
    };
  }

  const captured = input.snapshot.provenance;
  const capturedChecksum = captured.dataset.checksum;
  const currentChecksum = current.dataset.checksum;
  const capturedSourceRevision = captured.config.values.sourceRevision;
  const currentSourceRevision = current.config.values.sourceRevision;
  const revisionsComparable =
    typeof capturedSourceRevision === "number" && typeof currentSourceRevision === "number";
  const capturedChecksumCannotBeVerified = capturedChecksum != null && currentChecksum == null;
  if (capturedChecksum && currentChecksum && capturedChecksum !== currentChecksum) {
    return stale("SOURCE_CHANGED", "El checksum del dataset difiere del registrado al capturar.");
  }
  if (
    captured.dataset.id !== current.dataset.id ||
    (captured.dataset.label &&
      current.dataset.label &&
      captured.dataset.label !== current.dataset.label)
  ) {
    return stale("SOURCE_CHANGED", "La identidad etiquetada del dataset cambió desde la captura.");
  }

  const sourceComparable =
    captured.dataset.id === current.dataset.id &&
    ((capturedChecksum != null && currentChecksum != null) || revisionsComparable);

  if (
    captured.source.kind !== current.source.kind ||
    (captured.source.id != null &&
      current.source.id != null &&
      captured.source.id !== current.source.id)
  ) {
    return stale("SOURCE_CHANGED", "La worksheet, serie o fuente lógica difiere de la capturada.");
  }

  const capturedSeries = [...captured.series].sort((a, b) =>
    `${a.role ?? ""}:${a.id}`.localeCompare(`${b.role ?? ""}:${b.id}`),
  );
  const currentSeries = [...current.series].sort((a, b) =>
    `${a.role ?? ""}:${a.id}`.localeCompare(`${b.role ?? ""}:${b.id}`),
  );
  if (!equalValue(capturedSeries, currentSeries)) {
    return stale("SERIES_CHANGED", "Las series o sus roles difieren de la captura.");
  }

  if (!equalValue(captured.config, current.config)) {
    return stale("CONFIGURATION_CHANGED", "La configuración científica cambió desde la captura.");
  }

  if (!equalValue(captured.method, current.method)) {
    return stale("METHOD_CHANGED", "La identidad o los parámetros del método cambiaron.");
  }

  if (!equalValue(captured.approximation, current.approximation)) {
    return stale(
      "APPROXIMATION_CHANGED",
      "El estado de aproximación actual difiere del capturado.",
    );
  }

  if (capturedChecksumCannotBeVerified || !sourceComparable) {
    return {
      state: "UNKNOWN",
      recomputable: true,
      reasons: [
        {
          code: "SOURCE_IDENTITY_INSUFFICIENT",
          message: "La fuente parece compatible, pero su identidad no puede confirmarse.",
        },
      ],
    };
  }

  return {
    state: "CURRENT",
    recomputable: true,
    reasons: [
      {
        code: "CURRENT_CONTEXT_MATCHES",
        message: "Fuente, series, configuración, método y aproximación coinciden con la captura.",
      },
    ],
  };
};
