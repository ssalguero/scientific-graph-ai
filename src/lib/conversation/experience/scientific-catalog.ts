import type { GroundingFact } from "./types";

/**
 * Scientific knowledge distinct from ENGINE calculation.
 * These statements are explanatory. They are not computed results.
 */
export const SCIENTIFIC_FACTS: readonly GroundingFact[] = [
  {
    id: "sci.pearson",
    kind: "scientific",
    title: "Pearson",
    statement:
      "La correlación de Pearson resume una asociación lineal entre dos variables continuas. Es sensible a valores atípicos y no demuestra causalidad.",
    caveat:
      "Conviene revisar linealidad, homocedasticidad aproximada y si un rango restringido está comprimiendo el coeficiente.",
  },
  {
    id: "sci.spearman",
    kind: "scientific",
    title: "Spearman",
    statement:
      "Spearman mide asociación monótona a través de rangos. Puede ser más adecuada cuando la relación no es lineal o cuando hay ordinalidad.",
    caveat:
      "Sigue sin implicar causa. Empates y muestras chicas afectan la lectura.",
  },
  {
    id: "sci.correlation-reading",
    kind: "scientific",
    title: "Leer una correlación",
    statement:
      "Un coeficiente describe dirección y magnitud de asociación en la muestra analizada. No dice si el diseño es adecuado ni si el efecto es prácticamente relevante.",
    caveat:
      "El valor numérico lo calcula Scientific Graph AI. La interpretación de significado es consejo, no un segundo cálculo.",
  },
  {
    id: "sci.regression",
    kind: "scientific",
    title: "Regresión",
    statement:
      "Una regresión resume cómo cambia una respuesta con predictores bajo un modelo. El ajuste visible no prueba que el modelo sea el mecanismo verdadero.",
    caveat:
      "Hay que mirar residuos, dominio de predicción y si se está extrapolando fuera del rango observado.",
  },
  {
    id: "sci.ttest",
    kind: "scientific",
    title: "t-test",
    statement:
      "Un t-test compara medias bajo supuestos de independencia y, según la variante, normalidad o varianzas comparables.",
    caveat:
      "Si los grupos no son independientes o la métrica no es la media, el test puede no responder la pregunta científica.",
  },
  {
    id: "sci.anova",
    kind: "scientific",
    title: "ANOVA",
    statement:
      "ANOVA evalúa si las medias de varios grupos difieren más de lo esperado por azar bajo el modelo. Un resultado global no identifica qué pares difieren.",
    caveat:
      "Comparaciones post-hoc y tamaños de efecto importan tanto como el p-valor. MANOVA no está en el producto como método ejecutable propio.",
  },
  {
    id: "sci.normality",
    kind: "scientific",
    title: "Normalidad",
    statement:
      "Las pruebas de normalidad evalúan si una muestra es compatible con una distribución normal. En muestras grandes detectan desvíos irrelevantes; en muestras chicas pueden no detectar desvíos importantes.",
  },
  {
    id: "sci.log-scale",
    kind: "scientific",
    title: "Escala logarítmica",
    statement:
      "Una escala logarítmica comprime órdenes de magnitud y exige valores positivos en el eje transformado. No cambia los datos crudos; cambia cómo se leen.",
    caveat:
      "Si hay ceros o negativos, el sistema avisa en Resultados. Eso es una restricción de representación, no un fallo de la pregunta científica.",
  },
  {
    id: "sci.outliers",
    kind: "scientific",
    title: "Valores atípicos",
    statement:
      "Un outlier es un punto inusual respecto del resto. Puede ser error, heterogeneidad real o una cola pesada. No se elimina solo porque el método lo marca.",
  },
  {
    id: "sci.assumptions",
    kind: "scientific",
    title: "Supuestos",
    statement:
      "Cada método responde una pregunta bajo supuestos. Si los datos no los cumplen, el número puede ser correcto como cálculo y aún así ser una respuesta científica pobre.",
  },
  {
    id: "sci.advice-pattern",
    kind: "scientific",
    title: "Consejo de análisis",
    statement:
      "Para aconsejar un análisis hace falta la pregunta científica, el tipo de variable, cómo se obtuvieron los grupos y si ya hay un resultado calculado. Sin eso, la IA puede comparar opciones y pedir aclaración; no puede elegir y ejecutar un método.",
  },
  {
    id: "sci.report-structure",
    kind: "scientific",
    title: "Estructura de reporte",
    statement:
      "Un reporte científico suele separar hechos calculados, figuras, advertencias metodológicas y material de publicación. El Pack Lite entrega PDF científico más una figura companion; no es un manuscrito completo.",
  },
];

export const SCIENTIFIC_TOPIC_CUES: readonly {
  factId: string;
  needles: readonly string[];
}[] = [
  { factId: "sci.pearson", needles: ["pearson"] },
  { factId: "sci.spearman", needles: ["spearman"] },
  {
    factId: "sci.correlation-reading",
    needles: ["correlacion", "correlación", "r =", "asociacion", "asociación"],
  },
  {
    factId: "sci.regression",
    needles: ["regresion", "regresión", "ajuste", "modelo lineal"],
  },
  { factId: "sci.ttest", needles: ["t-test", "ttest", "prueba t", "t test"] },
  { factId: "sci.anova", needles: ["anova", "manova"] },
  { factId: "sci.normality", needles: ["normalidad", "shapiro", "gauss"] },
  {
    factId: "sci.log-scale",
    needles: ["log", "logaritm", "escala log"],
  },
  { factId: "sci.outliers", needles: ["outlier", "atipic", "atípic"] },
  {
    factId: "sci.assumptions",
    needles: ["supuesto", "asum", "es correcto este analisis", "esta funcion es correcta"],
  },
  {
    factId: "sci.advice-pattern",
    needles: [
      "que analisis",
      "qué análisis",
      "que metodo",
      "qué método",
      "conviene",
      "deberia usar",
      "debería usar",
    ],
  },
  {
    factId: "sci.report-structure",
    needles: ["reporte", "reportes", "pack", "pdf", "seccion", "sección"],
  },
];
