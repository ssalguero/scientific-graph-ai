export const CURVE_SAMPLE_STEP = 0.5;

export const INTERSECTION_DEDUP_X = 0.001;
export const CRITICAL_POINT_DEDUP_X = 0.001;
export const ROOT_DEDUP_X = 0.001;

export const RANGE_DISCARD_THRESHOLD = 0.35;

export const GENERIC_RANGE_WARNING =
  "⚠ El rango X actual deja sin graficar una parte importante de una o más curvas. Verifica que el intervalo sea válido para todas las expresiones.";

export const FUNCTION_OPERAND = "[a-z0-9^+\\-*/.]+";

export const KNOWN_FUNCTION_WARNINGS: Record<string, string> = {
  "log(x)":
    "⚠ log(x) solo está definida para x > 0. Parte del rango actual queda fuera de su dominio.",
  "ln(x)":
    "⚠ ln(x) solo está definida para x > 0. Parte del rango actual queda fuera de su dominio.",
  "sqrt(x)":
    "⚠ sqrt(x) solo está definida para x ≥ 0. Parte del rango actual queda fuera de su dominio.",
  "1/x":
    "⚠ 1/x presenta una discontinuidad en x = 0 dentro del rango actual.",
  "1/(1-x)":
    "⚠ 1/(1-x) presenta una discontinuidad en x = 1 dentro del rango actual.",
  "asin(x)":
    "⚠ asin(x) solo está definida para x ∈ [-1, 1]. Parte del rango actual queda fuera de su dominio.",
  "acos(x)":
    "⚠ acos(x) solo está definida para x ∈ [-1, 1]. Parte del rango actual queda fuera de su dominio.",
};

export const KNOWN_FUNCTION_PATTERNS = [
  "1/(1-x)",
  "asin(x)",
  "acos(x)",
  "log(x)",
  "ln(x)",
  "sqrt(x)",
  "1/x",
] as const;
