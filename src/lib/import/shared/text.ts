export const normalizeLabel = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");

const INDEPENDENT_HINTS = [
  "x",
  "time",
  "tiempo",
  "t ",
  "t(",
  "min",
  "hour",
  "hora",
  "dose",
  "dosis",
  "concentration",
  "concentracion",
  "conc",
  "cpromedio",
  "c promedio",
  "c (",
  "c mmol",
  "c mg",
  "cf",
  "ceq",
  "independent",
];

const DEPENDENT_HINTS = [
  "y",
  "q ",
  "q(",
  "q mmol",
  "q mg",
  "q/g",
  " q",
  "response",
  "respuesta",
  "adsor",
  "sorb",
  "dependent",
  "valor",
  "value",
  "measurement",
];

export const scoreIndependentLabel = (label: string): number => {
  const normalized = normalizeLabel(label);
  if (!normalized) return 0;
  return INDEPENDENT_HINTS.reduce(
    (score, hint) => (normalized.includes(hint) ? score + 1 : score),
    0
  );
};

export const scoreDependentLabel = (label: string): number => {
  const normalized = normalizeLabel(label);
  if (!normalized) return 0;
  return DEPENDENT_HINTS.reduce(
    (score, hint) => (normalized.includes(hint) ? score + 1 : score),
    0
  );
};
