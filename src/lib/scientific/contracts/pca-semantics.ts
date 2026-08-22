/**
 * CTR-04 — The Graph Explorer (GE) and Visual Graph Builder (VGB) PCA
 * implementations are related calculations with intentionally distinct
 * contracts. These descriptors document them without asserting equality.
 */
export type ScientificPcaSemanticDescriptor = {
  id: "ge-pca" | "vgb-pca";
  ownerPaths: readonly string[];
  inputModel: {
    observationUnit: string;
    variableUnit: string;
    missingValuePolicy: string;
    minimumData: string;
    constantVariablePolicy: string;
  };
  standardization: {
    policy: "always-standardize" | "configurable";
    centered: true;
    scale: string;
    covarianceDenominator: "n-1";
  };
  signConvention: {
    policy: "iteration-seed-no-canonicalization" | "first-nonzero-positive";
    statement: string;
  };
  outputSemantics: readonly string[];
};

export const GE_PCA_SEMANTICS = {
  id: "ge-pca",
  ownerPaths: ["src/app/page.tsx"],
  inputModel: {
    observationUnit:
      "Índice compartido de punto; cada observación toma el valor y de todas las series.",
    variableUnit: "Cada ExperimentalSeries es una variable; x no participa.",
    missingValuePolicy:
      "Todas las series deben tener igual longitud y todos los valores y deben ser finitos; de lo contrario no hay resultado.",
    minimumData:
      "Al menos dos series, tres observaciones alineadas y dos variables no constantes.",
    constantVariablePolicy:
      "Las variables constantes se excluyen del cálculo y reaparecen con carga cero.",
  },
  standardization: {
    policy: "always-standardize",
    centered: true,
    scale: "Z-score con desviación estándar muestral.",
    covarianceDenominator: "n-1",
  },
  signConvention: {
    policy: "iteration-seed-no-canonicalization",
    statement:
      "La orientación deriva de la semilla determinista de power iteration; no se aplica una regla canónica posterior. El signo opuesto es semánticamente equivalente.",
  },
  outputSemantics: [
    "Porcentaje de varianza de PC1 y PC2 y acumulado.",
    "Scores por observación alineada.",
    "Cargas y contribuciones porcentuales por variable.",
    "Interpretación derivada de umbrales de varianza y contribución.",
  ],
} as const satisfies ScientificPcaSemanticDescriptor;

export const VGB_PCA_SEMANTICS = {
  id: "vgb-pca",
  ownerPaths: ["src/lib/visualGraphBuilder.ts"],
  inputModel: {
    observationUnit:
      "Fila completa de WorksheetModel para las variables seleccionadas.",
    variableUnit: "Cada id de columna PCA seleccionado es una variable.",
    missingValuePolicy:
      "Se aplican casos completos: las filas con algún valor seleccionado no finito se omiten.",
    minimumData:
      "Al menos dos filas completas y dos variables seleccionadas no constantes.",
    constantVariablePolicy:
      "Las variables constantes se excluyen del cálculo; VGB no expone cargas.",
  },
  standardization: {
    policy: "configurable",
    centered: true,
    scale:
      "pcaStandardize=true usa z-score muestral; false centra sin escalar.",
    covarianceDenominator: "n-1",
  },
  signConvention: {
    policy: "first-nonzero-positive",
    statement:
      "Cada eigenvector se orienta para que su primera carga no nula (epsilon 1e-9) sea positiva.",
  },
  outputSemantics: [
    "Porcentaje de varianza de PC1 y PC2 y acumulado.",
    "Scores por fila completa, etiquetados según el orden retenido.",
    "No expone cargas ni interpretaciones metodológicas.",
  ],
} as const satisfies ScientificPcaSemanticDescriptor;

export const PCA_SEMANTIC_DESCRIPTORS = [
  GE_PCA_SEMANTICS,
  VGB_PCA_SEMANTICS,
] as const satisfies readonly ScientificPcaSemanticDescriptor[];

export const PCA_CROSS_IMPLEMENTATION_POLICY = {
  forceEquality: false,
  statement:
    "GE y VGB no deben forzar igualdad de scores: difieren en modelo de filas, mínimos, estandarización configurable y convención de signo.",
  comparableInvariants: [
    "La varianza explicada puede compararse cuando la matriz efectiva y la política de escalado coinciden.",
    "Scores con signo opuesto representan el mismo eje principal.",
  ],
} as const;
