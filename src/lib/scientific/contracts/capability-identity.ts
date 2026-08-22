/**
 * CTR-01 — Stable identities for capabilities whose historical UI names
 * overstate the calculation that is actually performed.
 */
export type ScientificCapabilityIdentityId =
  | "multivariate-separation-indicator"
  | "discrimination-structure-indicator"
  | "association-network-indicator"
  | "component-importance-predictive-indicator"
  | "composite-explanatory-indicator"
  | "evidence-stability-indicator"
  | "composite-robustness-indicator"
  | "mds-neighborhood-view"
  | "mds-connectivity-view";

export type ScientificCapabilityClaimLevel =
  | "heuristic-indicator"
  | "derived-view";

export type ScientificCapabilityIdentityDescriptor = {
  id: ScientificCapabilityIdentityId;
  primaryLabelEs: string;
  historicalAliases: readonly string[];
  claimLevel: ScientificCapabilityClaimLevel;
  evidenceBasis: readonly string[];
  excludedClaims: readonly string[];
  ownerPaths: readonly string[];
};

export const SCIENTIFIC_CAPABILITY_IDENTITIES = [
  {
    id: "multivariate-separation-indicator",
    primaryLabelEs: "Indicador heurístico de separación multivariada",
    historicalAliases: ["MANOVA Explorer"],
    claimLevel: "heuristic-indicator",
    evidenceBasis: [
      "Promedio de varianza acumulada PCA normalizada y razón máxima/media de distancias acotada.",
      "Reutiliza conteos e interpretaciones de clustering y redes; no estima una prueba multivariada.",
    ],
    excludedClaims: [
      "No es MANOVA.",
      "No calcula estadístico multivariado, grados de libertad ni valor p.",
    ],
    ownerPaths: ["src/app/page.tsx"],
  },
  {
    id: "discrimination-structure-indicator",
    primaryLabelEs: "Indicador heurístico de estructura discriminante",
    historicalAliases: ["LDA Explorer"],
    claimLevel: "heuristic-indicator",
    evidenceBasis: [
      "Promedio de varianza acumulada PCA y el indicador heurístico de separación.",
      "Las variables dominantes proceden del análisis de importancia existente.",
    ],
    excludedClaims: [
      "No es análisis discriminante lineal.",
      "No ajusta funciones discriminantes ni clasificador.",
    ],
    ownerPaths: ["src/app/page.tsx"],
  },
  {
    id: "association-network-indicator",
    primaryLabelEs: "Indicador heurístico de asociación entre variables",
    historicalAliases: ["Canonical Correlation Explorer"],
    claimLevel: "heuristic-indicator",
    evidenceBasis: [
      "Promedio de densidad de la red de correlación y similitud media.",
      "Las variables líderes proceden del análisis de importancia existente.",
    ],
    excludedClaims: [
      "No es análisis de correlación canónica.",
      "No define dos bloques de variables ni estima pares de variables canónicas.",
    ],
    ownerPaths: ["src/app/page.tsx"],
  },
  {
    id: "component-importance-predictive-indicator",
    primaryLabelEs: "Indicador heurístico de potencial predictivo",
    historicalAliases: ["PCR Explorer"],
    claimLevel: "heuristic-indicator",
    evidenceBasis: [
      "Promedio de varianza acumulada PCA e importancia media de las tres variables principales.",
    ],
    excludedClaims: [
      "No es regresión por componentes principales.",
      "No tiene variable respuesta, ajuste de regresión ni validación predictiva.",
    ],
    ownerPaths: ["src/app/page.tsx"],
  },
  {
    id: "composite-explanatory-indicator",
    primaryLabelEs: "Indicador heurístico de capacidad explicativa",
    historicalAliases: ["PLS Explorer"],
    claimLevel: "heuristic-indicator",
    evidenceBasis: [
      "Promedio de varianza acumulada PCA, indicador predictivo y asociación de red.",
    ],
    excludedClaims: [
      "No es regresión por mínimos cuadrados parciales.",
      "No estima componentes latentes PLS ni un modelo de respuesta.",
    ],
    ownerPaths: ["src/app/page.tsx"],
  },
  {
    id: "evidence-stability-indicator",
    primaryLabelEs: "Indicador heurístico de estabilidad de evidencia",
    historicalAliases: ["Bootstrap Explorer"],
    claimLevel: "heuristic-indicator",
    evidenceBasis: [
      "Promedio de puntuaciones de tamaño muestral, normalidad, PCA y potencial predictivo.",
    ],
    excludedClaims: [
      "No ejecuta remuestreo bootstrap.",
      "No produce distribución empírica, sesgo, error estándar ni intervalo bootstrap.",
    ],
    ownerPaths: ["src/app/page.tsx"],
  },
  {
    id: "composite-robustness-indicator",
    primaryLabelEs: "Indicador heurístico de robustez compuesta",
    historicalAliases: [
      "Sensitivity Analysis Explorer",
      "Sensitivity Explorer",
    ],
    claimLevel: "heuristic-indicator",
    evidenceBasis: [
      "Promedio de estabilidad, varianza PCA, capacidad explicativa y balance de importancia.",
    ],
    excludedClaims: [
      "No ejecuta análisis de sensibilidad.",
      "No perturba entradas ni estima efectos marginales o índices de sensibilidad.",
    ],
    ownerPaths: ["src/app/page.tsx"],
  },
  {
    id: "mds-neighborhood-view",
    primaryLabelEs: "Vista MDS con indicador de vecindad",
    historicalAliases: ["t-SNE Explorer"],
    claimLevel: "derived-view",
    evidenceBasis: [
      "Reutiliza las coordenadas MDS y deriva la puntuación de vecindad de la similitud media.",
    ],
    excludedClaims: [
      "No ejecuta t-SNE.",
      "No optimiza divergencia KL, perplexity ni probabilidades de vecindad t-SNE.",
    ],
    ownerPaths: ["src/app/page.tsx"],
  },
  {
    id: "mds-connectivity-view",
    primaryLabelEs: "Vista MDS con indicador de conectividad",
    historicalAliases: ["UMAP Explorer"],
    claimLevel: "derived-view",
    evidenceBasis: [
      "Transforma las coordenadas MDS y clasifica conectividad desde la red de similitud.",
    ],
    excludedClaims: [
      "No ejecuta UMAP.",
      "No construye ni optimiza el grafo difuso de UMAP.",
    ],
    ownerPaths: ["src/app/page.tsx"],
  },
] as const satisfies readonly ScientificCapabilityIdentityDescriptor[];

export const getScientificCapabilityIdentity = (
  id: ScientificCapabilityIdentityId
): ScientificCapabilityIdentityDescriptor => {
  const descriptor = SCIENTIFIC_CAPABILITY_IDENTITIES.find(
    (candidate) => candidate.id === id
  );
  if (!descriptor) {
    throw new Error(`Unknown scientific capability identity: ${id}`);
  }
  return descriptor;
};

export const resolveScientificCapabilityAlias = (
  alias: string
): ScientificCapabilityIdentityDescriptor | null =>
  SCIENTIFIC_CAPABILITY_IDENTITIES.find((descriptor) =>
    descriptor.historicalAliases.some(
      (candidate) => candidate.toLocaleLowerCase() === alias.toLocaleLowerCase()
    )
  ) ?? null;
