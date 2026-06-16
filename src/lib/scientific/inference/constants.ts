export const T_TEST_ALPHA = 0.05;

export const ANOVA_ALPHA = 0.05;

export const TUKEY_HSD_Q_CRITICAL = 3.314;

export const NON_PARAMETRIC_ALPHA = 0.05;

export const EFFECT_SIZE_ALPHA = 0.05;
export const EFFECT_SIZE_TARGET_POWER = 0.8;
export const EFFECT_SIZE_Z_ALPHA_TWO_TAILED = 1.959964;
export const EFFECT_SIZE_Z_TARGET_POWER = 0.841621;

export const EFFECT_SIZE_D_THRESHOLDS: [number, number, number] = [0.2, 0.5, 0.8];
export const EFFECT_SIZE_R_THRESHOLDS: [number, number, number] = [0.1, 0.3, 0.5];
export const EFFECT_SIZE_ETA_THRESHOLDS: [number, number, number] = [0.01, 0.06, 0.14];
export const EFFECT_SIZE_DELTA_THRESHOLDS: [number, number, number] = [
  0.147, 0.33, 0.474,
];

export const EFFECT_SIZE_POWER_DISCLAIMER =
  "Advertencia: la potencia observada deriva directamente del p-valor obtenido y no debe usarse para justificar resultados no significativos.";

export const EFFECT_MAGNITUDE_ORDER = [
  "trivial",
  "small",
  "medium",
  "large",
] as const;

// Tabla de t crítico (α=0.05 bilateral, IC95%) con interpolación lineal.
// Evita la inestabilidad numérica de betacf en la CDF t existente.
export const T_CRITICAL_95_TABLE: ReadonlyArray<readonly [number, number]> = [
  [1, 12.706],
  [2, 4.303],
  [3, 3.182],
  [4, 2.776],
  [5, 2.571],
  [6, 2.447],
  [7, 2.365],
  [8, 2.306],
  [9, 2.262],
  [10, 2.228],
  [11, 2.201],
  [12, 2.179],
  [13, 2.16],
  [14, 2.145],
  [15, 2.131],
  [16, 2.12],
  [17, 2.11],
  [18, 2.101],
  [19, 2.093],
  [20, 2.086],
  [25, 2.06],
  [30, 2.042],
  [40, 2.021],
  [60, 2.0],
  [120, 1.98],
  [Infinity, 1.96],
];
