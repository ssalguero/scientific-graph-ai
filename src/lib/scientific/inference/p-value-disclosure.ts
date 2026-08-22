/**
 * PR1-A.3 — Production p-values are computed by approximation helpers.
 * Formatting adds disclosure only; it never changes the numeric result.
 */
export const APPROXIMATE_P_VALUE_QUALIFIER = "aprox.";

export const APPROXIMATE_P_VALUE_DISCLOSURE =
  "Valor p aproximado mediante la distribución numérica implementada; interprete el umbral junto con los supuestos de la prueba.";

export const formatPValueNumber = (pValue: number): string =>
  pValue < 0.0001 ? "< 0.0001" : pValue.toFixed(4);

export const formatApproximatePValue = (pValue: number): string =>
  `${formatPValueNumber(pValue)} (${APPROXIMATE_P_VALUE_QUALIFIER})`;
